"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Columns3,
  Download,
  ExternalLink,
  Keyboard,
  Loader2,
  Maximize2,
  Minimize2,
  Pencil,
  Redo2,
  RotateCcw,
  Save,
  SlidersHorizontal,
  Undo2,
  Upload,
  X,
} from "lucide-react";
import { saveProductGridChanges } from "@/lib/actions/product-grid";
import type { BulkSelection } from "@/lib/actions/product-grid";
import {
  COLUMNS,
  COLUMN_BY_KEY,
  PAGE_SIZES,
  QUALITY_FILTERS,
  SEO_FILTERS,
  SORTABLE,
  STATUS_LABELS,
  editorText,
  effectiveValue,
  formatCellText,
  parseCellText,
  parseClipboard,
  toClipboard,
  validateCell,
  validateRow,
  valuesEqual,
  type CategoryOption,
  type CellValue,
  type ColumnDef,
  type ColumnKey,
  type EditableKey,
  type GridRow,
  type ProductFilters,
  type ProductStatusValue,
  type RowDraft,
  type Spec,
} from "@/lib/admin/products/grid-schema";
import BulkEditDialog from "./BulkEditDialog";
import CellEditor, { type EditorCommit, type EditorMove } from "./CellEditor";
import { DEFAULT_PREFS, usePersistentPrefs } from "./usePersistentPrefs";

type Category = CategoryOption & { isActive: boolean };
type Drafts = Record<string, RowDraft>;
type Patch = { id: string; key: EditableKey; prev: CellValue | undefined; next: CellValue | undefined };
type Pos = { r: number; c: number };
type Editing = { r: number; c: number; text: string; replaced: boolean };
type Toast = { kind: "success" | "error" | "info"; text: string; details?: string[] };
type RowErrors = Partial<Record<EditableKey, string>>;

type Props = {
  rows: GridRow[];
  categories: Category[];
  total: number;
  page: number;
  pageSize: number;
  sort: { key: ColumnKey; dir: "asc" | "desc" };
  filters: ProductFilters;
  permissions: { edit: boolean; bulk: boolean; delete: boolean; export: boolean };
  initialEdit: boolean;
};

const SELECT_WIDTH = 40;
const FROZEN: ColumnKey[] = ["primaryImageId", "name"];
const ALWAYS_VISIBLE: ColumnKey[] = ["name"];
const has = (object: object | undefined, key: string) => !!object && Object.prototype.hasOwnProperty.call(object, key);
const plural = (count: number, word: string) => `${count.toLocaleString("en-IN")} ${word}${count === 1 ? "" : "s"}`;

function blankValue(column: ColumnDef): CellValue | undefined {
  switch (column.type) {
    case "list":
    case "specs":
      return [];
    case "boolean":
      return false;
    case "status":
    case "image":
      return undefined; // cannot be blank
    default:
      return null;
  }
}

export default function ProductGrid({ rows, categories, total, page, pageSize, sort, filters, permissions, initialEdit }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [prefs, updatePrefs] = usePersistentPrefs();

  // ---- Rows (server truth) ---------------------------------------------------
  const [baseRows, setBaseRows] = useState(rows);
  const [prevRows, setPrevRows] = useState(rows);
  // A new page of rows from the server (navigation, revalidation after a
  // save or bulk edit) replaces the local copy and resets the cursor.
  const [active, setActive] = useState<Pos | null>(null);
  const [anchor, setAnchor] = useState<Pos | null>(null);
  const [editing, setEditing] = useState<Editing | null>(null);
  if (rows !== prevRows) {
    setPrevRows(rows);
    setBaseRows(rows);
    setActive(null);
    setAnchor(null);
    setEditing(null);
  }
  const rowById = useMemo(() => new Map(baseRows.map((row) => [row.id, row])), [baseRows]);
  const parseCtx = useMemo(() => ({ categories }), [categories]);
  const categoryName = useMemo(() => new Map(categories.map((category) => [category.id, category.name])), [categories]);

  // ---- Columns ---------------------------------------------------------------
  const columns = useMemo(() => {
    const hidden = new Set(prefs.hidden.filter((key) => !ALWAYS_VISIBLE.includes(key)));
    const frozen = FROZEN.filter((key) => !hidden.has(key)).map((key) => COLUMN_BY_KEY[key]);
    const rest = prefs.order.filter((key) => !FROZEN.includes(key) && !hidden.has(key)).map((key) => COLUMN_BY_KEY[key]);
    return [...frozen, ...rest];
  }, [prefs.hidden, prefs.order]);
  const frozenCount = columns.filter((column) => FROZEN.includes(column.key)).length;
  const widthOf = useCallback((key: ColumnKey) => prefs.widths[key] ?? COLUMN_BY_KEY[key].width, [prefs.widths]);
  const layout = useMemo(() => {
    const lefts: number[] = [];
    let left = SELECT_WIDTH;
    columns.forEach((column, index) => {
      lefts.push(index < frozenCount ? left : -1);
      if (index < frozenCount) left += widthOf(column.key);
    });
    return { lefts, widths: columns.map((column) => widthOf(column.key)) };
  }, [columns, frozenCount, widthOf]);

  // ---- Drafts, history, errors ----------------------------------------------
  const [drafts, setDrafts] = useState<Drafts>({});
  const draftsRef = useRef<Drafts>({});
  const undoStack = useRef<Patch[][]>([]);
  const redoStack = useRef<Patch[][]>([]);
  const [history, setHistory] = useState({ undo: 0, redo: 0 });
  const syncHistory = useCallback(() => setHistory({ undo: undoStack.current.length, redo: redoStack.current.length }), []);
  const [serverErrors, setServerErrors] = useState<Record<string, RowErrors>>({});
  const [conflicts, setConflicts] = useState<Record<string, GridRow>>({});
  const [pasteErrors, setPasteErrors] = useState<Record<string, RowErrors>>({});

  const commitDrafts = useCallback((next: Drafts) => {
    draftsRef.current = next;
    setDrafts(next);
  }, []);

  /** Applies patches to the drafts. Values equal to the saved value drop the draft. */
  const setCells = useCallback(
    (changes: Array<{ id: string; key: EditableKey; value: CellValue }>, record = true) => {
      const next: Drafts = { ...draftsRef.current };
      const entry: Patch[] = [];
      for (const { id, key, value } of changes) {
        const row = rowById.get(id);
        if (!row) continue;
        const prev = has(next[id], key) ? next[id][key] : undefined;
        const target = valuesEqual(value, row.values[key]) ? undefined : value;
        if (prev === undefined && target === undefined) continue;
        if (prev !== undefined && target !== undefined && valuesEqual(prev, target)) continue;
        const rowDraft = { ...next[id] };
        if (target === undefined) delete rowDraft[key];
        else rowDraft[key] = target;
        if (Object.keys(rowDraft).length) next[id] = rowDraft;
        else delete next[id];
        entry.push({ id, key, prev, next: target });
      }
      if (!entry.length) return 0;
      commitDrafts(next);
      if (record) {
        undoStack.current.push(entry);
        if (undoStack.current.length > 200) undoStack.current.shift();
        redoStack.current = [];
        syncHistory();
      }
      const touched = (current: Record<string, RowErrors>) => {
        if (!entry.some((patch) => current[patch.id]?.[patch.key])) return current;
        const copy = { ...current };
        for (const patch of entry) if (copy[patch.id]?.[patch.key]) {
          copy[patch.id] = { ...copy[patch.id] };
          delete copy[patch.id][patch.key];
        }
        return copy;
      };
      setServerErrors(touched);
      setPasteErrors(touched);
      return entry.length;
    },
    [commitDrafts, rowById, syncHistory],
  );

  const replay = useCallback(
    (entry: Patch[], direction: "undo" | "redo") => {
      const next: Drafts = { ...draftsRef.current };
      const ordered = direction === "undo" ? [...entry].reverse() : entry;
      for (const patch of ordered) {
        const value = direction === "undo" ? patch.prev : patch.next;
        const rowDraft = { ...next[patch.id] };
        if (value === undefined) delete rowDraft[patch.key];
        else rowDraft[patch.key] = value;
        if (Object.keys(rowDraft).length) next[patch.id] = rowDraft;
        else delete next[patch.id];
      }
      commitDrafts(next);
      syncHistory();
    },
    [commitDrafts, syncHistory],
  );

  const undo = useCallback(() => {
    const entry = undoStack.current.pop();
    if (!entry) return;
    redoStack.current.push(entry);
    replay(entry, "undo");
  }, [replay]);
  const redo = useCallback(() => {
    const entry = redoStack.current.pop();
    if (!entry) return;
    undoStack.current.push(entry);
    replay(entry, "redo");
  }, [replay]);

  const clientErrors = useMemo(() => {
    const result: Record<string, RowErrors> = {};
    for (const [id, draft] of Object.entries(drafts)) {
      const row = rowById.get(id);
      if (!row) continue;
      const errors: RowErrors = {};
      for (const [key, value] of Object.entries(draft)) {
        const message = validateCell(key as EditableKey, value as CellValue);
        if (message) errors[key as EditableKey] = message;
      }
      if (has(draft, "basePrice") || has(draft, "compareAtPrice")) {
        Object.assign(errors, validateRow({ basePrice: effectiveValue(row, draft, "basePrice"), compareAtPrice: effectiveValue(row, draft, "compareAtPrice") }));
      }
      if (Object.keys(errors).length) result[id] = errors;
    }
    return result;
  }, [drafts, rowById]);

  const errorsFor = useCallback(
    (id: string): RowErrors | undefined => {
      const merged = { ...pasteErrors[id], ...serverErrors[id], ...clientErrors[id] };
      return Object.keys(merged).length ? merged : undefined;
    },
    [clientErrors, pasteErrors, serverErrors],
  );

  const changeCount = useMemo(() => Object.values(drafts).reduce((sum, draft) => sum + Object.keys(draft).length, 0), [drafts]);
  const changedRows = Object.keys(drafts).length;
  const errorCount = useMemo(
    () => baseRows.reduce((sum, row) => sum + Object.keys(errorsFor(row.id) ?? {}).length, 0),
    [baseRows, errorsFor],
  );
  const dirty = changeCount > 0;

  const discardAll = useCallback(() => {
    commitDrafts({});
    undoStack.current = [];
    redoStack.current = [];
    setServerErrors({});
    setPasteErrors({});
    setConflicts({});
    syncHistory();
  }, [commitDrafts, syncHistory]);

  // ---- UI state --------------------------------------------------------------
  const [editMode, setEditMode] = useState(initialEdit && permissions.edit);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [editorRect, setEditorRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [allMatching, setAllMatching] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [panel, setPanel] = useState<"columns" | "export" | "keys" | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [broken, setBroken] = useState<Set<string>>(new Set());
  const [saving, startSave] = useTransition();
  const [navigating, startNav] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  useEffect(() => {
    if (!toast || toast.kind === "error") return;
    const timer = window.setTimeout(() => setToast(null), 6000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // ---- Unsaved-changes guard -------------------------------------------------
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    const onClick = (event: MouseEvent) => {
      const anchorElement = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchorElement || anchorElement.target === "_blank" || anchorElement.hasAttribute("download")) return;
      if (anchorElement.getAttribute("href")?.startsWith("/api/")) return;
      if (!window.confirm(`You have ${plural(changeCount, "unsaved change")}. Leave this page and lose them?`)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [dirty, changeCount]);

  // ---- URL navigation (filters / sort / paging) -------------------------------
  const navigate = useCallback(
    (overrides: Record<string, string | undefined>) => {
      if (dirty) {
        if (!window.confirm(`You have ${plural(changeCount, "unsaved change")}. Discard them and continue?`)) return;
        discardAll();
      }
      const merged: Record<string, string | undefined> = {
        ...filters,
        sort: sort.key,
        dir: sort.dir,
        size: String(pageSize),
        page: String(page),
        edit: editMode ? "1" : undefined,
        ...overrides,
      };
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(merged)) if (value) params.set(key, value);
      if (params.get("page") === "1") params.delete("page");
      setAllMatching(false);
      startNav(() => router.push(`${pathname}?${params.toString()}`));
    },
    [changeCount, dirty, discardAll, editMode, filters, page, pageSize, pathname, router, sort.dir, sort.key],
  );
  const setFilter = (key: keyof ProductFilters, value: string | undefined) => navigate({ [key]: value || undefined, page: undefined });

  // Restore a remembered page size once, when the URL does not specify one.
  const appliedPrefSize = useRef(false);
  useEffect(() => {
    // prefs.pageSize is undefined until the stored prefs load after hydration.
    if (appliedPrefSize.current || prefs.pageSize === undefined) return;
    appliedPrefSize.current = true;
    const remembered = prefs.pageSize;
    const params = new URLSearchParams(window.location.search);
    if (remembered && remembered !== pageSize && !params.has("size") && PAGE_SIZES.includes(remembered as (typeof PAGE_SIZES)[number])) {
      params.set("size", String(remembered));
      params.delete("page");
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [pageSize, pathname, prefs.pageSize, router]);

  // ---- Selection geometry ----------------------------------------------------
  const range = useMemo(() => {
    if (!active) return null;
    const start = anchor ?? active;
    return { r1: Math.min(start.r, active.r), r2: Math.max(start.r, active.r), c1: Math.min(start.c, active.c), c2: Math.max(start.c, active.c) };
  }, [active, anchor]);

  const valueAt = useCallback((r: number, c: number) => {
    const row = baseRows[r];
    return effectiveValue(row, draftsRef.current[row.id], columns[c].key);
  }, [baseRows, columns]);

  const moveTo = useCallback((pos: Pos, extend = false) => {
    const r = Math.max(0, Math.min(baseRows.length - 1, pos.r));
    const c = Math.max(0, Math.min(columns.length - 1, pos.c));
    setActive({ r, c });
    if (!extend) setAnchor({ r, c });
  }, [baseRows.length, columns.length]);

  useEffect(() => {
    if (!active) return;
    scrollRef.current?.querySelector(`[data-r="${active.r}"][data-c="${active.c}"]`)?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [active]);

  const focusGrid = () => scrollRef.current?.focus({ preventScroll: true });

  const notEditable = useCallback((): boolean => {
    if (!permissions.edit) {
      setToast({ kind: "info", text: "You have view-only access to products." });
      return true;
    }
    if (!editMode) {
      setToast({ kind: "info", text: "Click “Edit Table” to start changing cells." });
      return true;
    }
    return false;
  }, [editMode, permissions.edit]);

  // ---- Editing ---------------------------------------------------------------
  const startEditing = useCallback(
    (pos: Pos, typed?: string) => {
      const column = columns[pos.c];
      if (!column?.editable || notEditable()) return;
      const row = baseRows[pos.r];
      if (column.type === "boolean") {
        setCells([{ id: row.id, key: column.key as EditableKey, value: !effectiveValue(row, draftsRef.current[row.id], column.key) }]);
        return;
      }
      const cell = scrollRef.current?.querySelector(`[data-r="${pos.r}"][data-c="${pos.c}"]`);
      const rect = cell?.getBoundingClientRect();
      if (!rect) return;
      setEditorRect({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
      setEditorError(null);
      setEditing({
        r: pos.r,
        c: pos.c,
        text: typed ?? editorText(column.key, effectiveValue(row, draftsRef.current[row.id], column.key), parseCtx),
        replaced: typed !== undefined,
      });
    },
    [baseRows, columns, notEditable, parseCtx, setCells],
  );

  const moveAfterEdit = useCallback((pos: Pos, move: EditorMove) => {
    const delta = { down: [1, 0], up: [-1, 0], right: [0, 1], left: [0, -1], none: [0, 0] }[move];
    moveTo({ r: pos.r + delta[0], c: pos.c + delta[1] });
  }, [moveTo]);

  const commitEdit = useCallback(
    (commit: EditorCommit, move: EditorMove) => {
      const current = editing;
      if (!current) return;
      const column = columns[current.c];
      const row = baseRows[current.r];
      let value: CellValue;
      if (commit.kind === "text") {
        const parsed = parseCellText(column.key as EditableKey, commit.text, { ...parseCtx, imageIds: row.images.map((image) => image.id) }, { linesOnly: column.type === "list" || column.type === "specs" });
        if (!parsed.ok) {
          setEditorError(parsed.error);
          return;
        }
        value = parsed.value;
      } else value = commit.value;
      setCells([{ id: row.id, key: column.key as EditableKey, value }]);
      setEditing(null);
      setEditorError(null);
      moveAfterEdit(current, move);
      focusGrid();
    },
    [baseRows, columns, editing, moveAfterEdit, parseCtx, setCells],
  );

  const cancelEdit = useCallback(() => {
    setEditing(null);
    setEditorError(null);
    focusGrid();
  }, []);

  /** Clicking away from (or scrolling under) an editor applies typed text, and closes pickers. */
  const commitOrCancelOnClickAway = useCallback(() => {
    if (!editing) return;
    const column = columns[editing.c];
    if (["category", "status", "image"].includes(column.type)) {
      cancelEdit();
      return;
    }
    const input = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(".pg-editor .pg-editor-input");
    if (input) commitEdit({ kind: "text", text: input.value }, "none");
  }, [cancelEdit, columns, commitEdit, editing]);

  // The editor is fixed-positioned, so close it when the content moves underneath.
  useEffect(() => {
    if (!editing) return;
    const element = scrollRef.current;
    const onScroll = () => commitOrCancelOnClickAway();
    element?.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      element?.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", onScroll);
    };
  }, [commitOrCancelOnClickAway, editing]);

  // ---- Range operations ------------------------------------------------------
  const editableInRange = useCallback(() => {
    if (!range) return [];
    const cells: Array<{ r: number; c: number; column: ColumnDef }> = [];
    for (let r = range.r1; r <= range.r2; r += 1) for (let c = range.c1; c <= range.c2; c += 1) if (columns[c].editable) cells.push({ r, c, column: columns[c] });
    return cells;
  }, [columns, range]);

  const clearRange = useCallback(() => {
    if (notEditable()) return;
    const changes = editableInRange().flatMap(({ r, column }) => {
      const value = blankValue(column);
      return value === undefined ? [] : [{ id: baseRows[r].id, key: column.key as EditableKey, value }];
    });
    setCells(changes);
  }, [baseRows, editableInRange, notEditable, setCells]);

  const fillDown = useCallback(() => {
    if (!range || notEditable()) return;
    if (range.r1 === range.r2) {
      setToast({ kind: "info", text: "Select two or more rows to fill down (Shift + ↓)." });
      return;
    }
    const changes: Array<{ id: string; key: EditableKey; value: CellValue }> = [];
    for (let c = range.c1; c <= range.c2; c += 1) {
      const column = columns[c];
      if (!column.editable || column.type === "image") continue;
      const value = valueAt(range.r1, c);
      for (let r = range.r1 + 1; r <= range.r2; r += 1) changes.push({ id: baseRows[r].id, key: column.key as EditableKey, value });
    }
    const count = setCells(changes);
    setToast({ kind: "success", text: `Filled down ${plural(count, "cell")}.` });
  }, [baseRows, columns, notEditable, range, setCells, valueAt]);

  const toggleRangeBooleans = useCallback(() => {
    if (notEditable()) return;
    const cells = editableInRange().filter(({ column }) => column.type === "boolean");
    if (!cells.length) return;
    const target = !valueAt(cells[0].r, cells[0].c);
    setCells(cells.map(({ r, column }) => ({ id: baseRows[r].id, key: column.key as EditableKey, value: target })));
  }, [baseRows, editableInRange, notEditable, setCells, valueAt]);

  const copyRange = useCallback(async () => {
    if (!range) return;
    const block: string[][] = [];
    for (let r = range.r1; r <= range.r2; r += 1) {
      const line: string[] = [];
      for (let c = range.c1; c <= range.c2; c += 1) line.push(formatCellText(columns[c].key, valueAt(r, c), parseCtx));
      block.push(line);
    }
    const cells = (range.r2 - range.r1 + 1) * (range.c2 - range.c1 + 1);
    try {
      await navigator.clipboard.writeText(toClipboard(block));
      setToast({ kind: "success", text: `Copied ${plural(cells, "cell")}.` });
    } catch {
      setToast({ kind: "error", text: "The browser blocked clipboard access. Allow clipboard permission and try again." });
    }
  }, [columns, parseCtx, range, valueAt]);

  const pasteBlock = useCallback(
    (block: string[][]) => {
      if (!range || notEditable()) return;
      const single = block.length === 1 && block[0].length === 1;
      const height = single ? range.r2 - range.r1 + 1 : block.length;
      const width = single ? range.c2 - range.c1 + 1 : Math.max(...block.map((line) => line.length));
      const changes: Array<{ id: string; key: EditableKey; value: CellValue }> = [];
      const invalid: Record<string, RowErrors> = {};
      const details: string[] = [];
      let readOnly = 0;
      let overflow = 0;
      for (let i = 0; i < height; i += 1) {
        for (let j = 0; j < width; j += 1) {
          const r = range.r1 + i;
          const c = range.c1 + j;
          const text = single ? block[0][0] : block[i]?.[j];
          if (text === undefined) continue;
          if (r >= baseRows.length || c >= columns.length) { overflow += 1; continue; }
          const column = columns[c];
          if (!column.editable || column.type === "image") { readOnly += 1; continue; }
          const row = baseRows[r];
          const parsed = parseCellText(column.key as EditableKey, text, parseCtx);
          if (parsed.ok) changes.push({ id: row.id, key: column.key as EditableKey, value: parsed.value });
          else {
            invalid[row.id] = { ...invalid[row.id], [column.key]: `Pasted "${text.slice(0, 30)}": ${parsed.error}` };
            if (details.length < 8) details.push(`${row.values.name} › ${column.label}: ${parsed.error}`);
          }
        }
      }
      const applied = setCells(changes);
      setPasteErrors(invalid);
      setActive({ r: Math.min(baseRows.length - 1, range.r1 + height - 1), c: Math.min(columns.length - 1, range.c1 + width - 1) });
      setAnchor({ r: range.r1, c: range.c1 });
      const invalidCount = Object.values(invalid).reduce((sum, row) => sum + Object.keys(row).length, 0);
      const notes = [readOnly && `${readOnly} read-only skipped`, overflow && `${overflow} outside this page skipped`, invalidCount && `${invalidCount} invalid`].filter(Boolean);
      setToast({
        kind: invalidCount ? "error" : "success",
        text: `Pasted ${plural(applied, "cell")}${notes.length ? ` · ${notes.join(" · ")}` : ""}. Not saved yet.`,
        details: details.length ? details : undefined,
      });
    },
    [baseRows, columns, notEditable, parseCtx, range, setCells],
  );

  // ---- Save ------------------------------------------------------------------
  const save = useCallback(() => {
    if (!dirty || saving) return;
    if (Object.keys(conflicts).length) {
      setToast({ kind: "error", text: "Resolve the products changed by someone else first (see the warning above the table)." });
      return;
    }
    if (errorCount) {
      setToast({ kind: "error", text: `Fix ${plural(errorCount, "highlighted cell")} before saving.` });
      const firstRow = baseRows.findIndex((row) => errorsFor(row.id));
      if (firstRow >= 0) {
        const firstKey = Object.keys(errorsFor(baseRows[firstRow].id) ?? {})[0] as ColumnKey;
        const c = columns.findIndex((column) => column.key === firstKey);
        if (c >= 0) moveTo({ r: firstRow, c });
      }
      return;
    }
    const changes = Object.entries(draftsRef.current).map(([id, fields]) => ({ id, version: rowById.get(id)!.version, fields }));
    startSave(async () => {
      const result = await saveProductGridChanges(changes);
      if (result.ok && result.saved) {
        const saved = new Map(result.saved.map((row) => [row.id, row]));
        setBaseRows((current) => current.map((row) => saved.get(row.id) ?? row));
        discardAll();
        setToast({ kind: "success", text: result.message });
        return;
      }
      if (result.cellErrors) setServerErrors(result.cellErrors);
      if (result.conflicts?.length) setConflicts(Object.fromEntries(result.conflicts.map((conflict) => [conflict.id, conflict.current])));
      setToast({ kind: "error", text: result.message });
    });
  }, [baseRows, columns, conflicts, dirty, discardAll, errorCount, errorsFor, moveTo, rowById, saving]);

  const resolveConflict = useCallback(
    (id: string, keep: "mine" | "theirs") => {
      const current = conflicts[id];
      if (!current) return;
      setBaseRows((rowsNow) => rowsNow.map((row) => (row.id === id ? current : row)));
      const next = { ...draftsRef.current };
      if (keep === "theirs") delete next[id];
      else if (next[id]) {
        const kept: RowDraft = {};
        for (const [key, value] of Object.entries(next[id])) if (!valuesEqual(value as CellValue, current.values[key as EditableKey])) kept[key as EditableKey] = value as CellValue;
        if (Object.keys(kept).length) next[id] = kept;
        else delete next[id];
      }
      commitDrafts(next);
      undoStack.current = [];
      redoStack.current = [];
      syncHistory();
      setConflicts((all) => {
        const copy = { ...all };
        delete copy[id];
        return copy;
      });
    },
    [commitDrafts, conflicts, syncHistory],
  );

  // ---- Keyboard --------------------------------------------------------------
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (editing) return;
    const mod = event.ctrlKey || event.metaKey;
    const key = event.key;

    if (mod && key.toLowerCase() === "s") { event.preventDefault(); save(); return; }
    if (mod && key.toLowerCase() === "z" && !event.shiftKey) { event.preventDefault(); undo(); return; }
    if (mod && (key.toLowerCase() === "y" || (key.toLowerCase() === "z" && event.shiftKey))) { event.preventDefault(); redo(); return; }
    if (!active) {
      if (key.startsWith("Arrow") || key === "Tab" || key === "Enter") { event.preventDefault(); moveTo({ r: 0, c: 0 }); }
      return;
    }
    if (mod && key.toLowerCase() === "c") { event.preventDefault(); void copyRange(); return; }
    if (mod && key.toLowerCase() === "d") { event.preventDefault(); fillDown(); return; }
    if (mod && key.toLowerCase() === "a") {
      event.preventDefault();
      setAnchor({ r: 0, c: 0 });
      setActive({ r: baseRows.length - 1, c: columns.length - 1 });
      return;
    }

    const step: Record<string, [number, number]> = { ArrowDown: [1, 0], ArrowUp: [-1, 0], ArrowRight: [0, 1], ArrowLeft: [0, -1] };
    if (step[key]) {
      event.preventDefault();
      const [dr, dc] = step[key];
      const jump = mod ? (dr ? baseRows.length : columns.length) : 1;
      moveTo({ r: active.r + dr * jump, c: active.c + dc * jump }, event.shiftKey);
      return;
    }
    if (key === "Tab") { event.preventDefault(); moveTo({ r: active.r, c: active.c + (event.shiftKey ? -1 : 1) }); return; }
    if (key === "Home") { event.preventDefault(); moveTo({ r: mod ? 0 : active.r, c: 0 }, event.shiftKey); return; }
    if (key === "End") { event.preventDefault(); moveTo({ r: mod ? baseRows.length - 1 : active.r, c: columns.length - 1 }, event.shiftKey); return; }
    if (key === "Enter" || key === "F2") { event.preventDefault(); startEditing(active); return; }
    if (key === " " ) { event.preventDefault(); toggleRangeBooleans(); return; }
    if (key === "Delete" || key === "Backspace") { event.preventDefault(); clearRange(); return; }
    if (key === "Escape") {
      if (fullscreen) setFullscreen(false);
      setAnchor(active);
      return;
    }
    if (key.length === 1 && !mod && !event.altKey) {
      const column = columns[active.c];
      if (column.editable && !["boolean", "image"].includes(column.type)) {
        event.preventDefault();
        startEditing(active, key);
      }
    }
  };

  const onPaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    if (editing) return;
    const text = event.clipboardData.getData("text/plain");
    if (!text) return;
    event.preventDefault();
    pasteBlock(parseClipboard(text));
  };

  // ---- Mouse -----------------------------------------------------------------
  useEffect(() => {
    const stop = () => (dragging.current = false);
    window.addEventListener("mouseup", stop);
    return () => window.removeEventListener("mouseup", stop);
  }, []);

  const cellFrom = (target: EventTarget | null): Pos | null => {
    const cell = (target as Element | null)?.closest?.("td[data-c]") as HTMLElement | null;
    if (!cell) return null;
    return { r: Number(cell.dataset.r), c: Number(cell.dataset.c) };
  };

  const onBodyMouseDown = (event: React.MouseEvent) => {
    if ((event.target as Element).closest("button, a, input, label")) return;
    const pos = cellFrom(event.target);
    if (!pos || event.button !== 0) return;
    event.preventDefault();
    if (editing) commitOrCancelOnClickAway();
    moveTo(pos, event.shiftKey);
    dragging.current = true;
    focusGrid();
  };
  const onBodyMouseOver = (event: React.MouseEvent) => {
    if (!dragging.current) return;
    const pos = cellFrom(event.target);
    if (pos) setActive(pos);
  };
  const onBodyDoubleClick = (event: React.MouseEvent) => {
    const pos = cellFrom(event.target);
    if (pos) startEditing(pos);
  };

  // ---- Row selection ---------------------------------------------------------
  const pageIds = useMemo(() => baseRows.map((row) => row.id), [baseRows]);
  const pageAllSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const toggleRow = useCallback((id: string) => {
    setAllMatching(false);
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);
  const togglePage = () => {
    setAllMatching(false);
    setSelected((current) => {
      const next = new Set(current);
      if (pageAllSelected) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });
  };
  const selectionCount = allMatching ? total : selected.size;
  const bulkSelection: BulkSelection | null = allMatching
    ? { mode: "filter", filters: filters as Record<string, string> }
    : selected.size
      ? { mode: "ids", ids: [...selected] }
      : null;

  const onToggleBool = useCallback(
    (r: number, key: EditableKey) => {
      if (notEditable()) return;
      const row = baseRows[r];
      setCells([{ id: row.id, key, value: !effectiveValue(row, draftsRef.current[row.id], key) }]);
    },
    [baseRows, notEditable, setCells],
  );
  const onImageError = useCallback((id: string) => setBroken((current) => (current.has(id) ? current : new Set(current).add(id))), []);

  // ---- Column layout actions -------------------------------------------------
  const startResize = (key: ColumnKey, event: React.PointerEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const startWidth = widthOf(key);
    const onMove = (move: PointerEvent) => {
      const width = Math.max(60, Math.min(800, startWidth + move.clientX - startX));
      updatePrefs((current) => ({ ...current, widths: { ...current.widths, [key]: width } }));
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };
  const dragKey = useRef<ColumnKey | null>(null);
  const dropColumn = (target: ColumnKey) => {
    const source = dragKey.current;
    dragKey.current = null;
    if (!source || source === target || FROZEN.includes(source) || FROZEN.includes(target)) return;
    updatePrefs((current) => {
      const order = current.order.filter((key) => key !== source);
      order.splice(order.indexOf(target), 0, source);
      return { ...current, order };
    });
  };
  const toggleColumn = (key: ColumnKey) =>
    updatePrefs((current) => ({
      ...current,
      hidden: current.hidden.includes(key) ? current.hidden.filter((item) => item !== key) : [...current.hidden, key],
    }));

  // ---- Export URLs -------------------------------------------------------------
  const exportUrl = (options: { format: "xlsx" | "csv"; preset?: "full" | "seo" | "template"; selectedOnly?: boolean; visibleOnly?: boolean }) => {
    const params = new URLSearchParams({ format: options.format, preset: options.preset ?? "full", sort: sort.key, dir: sort.dir });
    if (options.selectedOnly && !allMatching) params.set("ids", [...selected].join(","));
    else for (const [key, value] of Object.entries(filters)) if (value) params.set(key, value);
    if (options.visibleOnly) params.set("columns", columns.map((column) => column.key).filter((key) => key !== "primaryImageId").join(","));
    return `/api/admin/products/export?${params.toString()}`;
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const activeFilters = Object.values(filters).filter(Boolean).length;
  const conflictList = Object.values(conflicts);

  return (
    <div className={`pg-root ${fullscreen ? "pg-fullscreen" : ""}`}>
      {/* ---------------- Toolbar ---------------- */}
      <div className="pg-toolbar" role="toolbar" aria-label="Product table actions">
        {permissions.edit ? (
          <button
            type="button"
            className={`pg-tool ${editMode ? "pg-tool-on" : ""}`}
            aria-pressed={editMode}
            onClick={() => {
              if (editMode && dirty) {
                setToast({ kind: "info", text: "Save or discard your changes before leaving edit mode." });
                return;
              }
              setEditMode(!editMode);
              setEditing(null);
            }}
          >
            <Pencil className="h-4 w-4" aria-hidden="true" /> {editMode ? "Editing" : "Edit Table"}
          </button>
        ) : (
          <span className="badge">View only</span>
        )}
        <button type="button" className="pg-tool pg-tool-primary" onClick={save} disabled={!dirty || saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
          Save All Changes{dirty ? ` (${changeCount})` : ""}
        </button>
        <button
          type="button"
          className="pg-tool"
          disabled={!dirty || saving}
          onClick={() => window.confirm(`Discard ${plural(changeCount, "unsaved change")}?`) && discardAll()}
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" /> Discard Changes
        </button>
        <span className="pg-divider" aria-hidden="true" />
        <button type="button" className="pg-tool" onClick={undo} disabled={!history.undo} title="Undo (Ctrl+Z)">
          <Undo2 className="h-4 w-4" aria-hidden="true" /> Undo
        </button>
        <button type="button" className="pg-tool" onClick={redo} disabled={!history.redo} title="Redo (Ctrl+Y)">
          <Redo2 className="h-4 w-4" aria-hidden="true" /> Redo
        </button>
        <span className="pg-divider" aria-hidden="true" />
        {permissions.bulk ? (
          <button
            type="button"
            className="pg-tool"
            disabled={!bulkSelection}
            title={bulkSelection ? undefined : "Tick products in the first column first"}
            onClick={() => {
              if (dirty) {
                setToast({ kind: "info", text: "Save or discard your table edits before running a bulk edit." });
                return;
              }
              setBulkOpen(true);
            }}
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" /> Bulk Edit{selectionCount ? ` (${selectionCount})` : ""}
          </button>
        ) : null}
        <Link href="/admin/products/bulk-price-update" className="pg-tool">
          <Upload className="h-4 w-4" aria-hidden="true" /> Import
        </Link>
        {permissions.export ? (
          <div className="relative">
            <button type="button" className="pg-tool" aria-expanded={panel === "export"} onClick={() => setPanel(panel === "export" ? null : "export")}>
              <Download className="h-4 w-4" aria-hidden="true" /> Export
            </button>
            {panel === "export" ? (
              <div className="pg-popover right-0 w-72" role="menu">
                <p className="pg-popover-title">Download products</p>
                <a role="menuitem" className="pg-menu-item" href={exportUrl({ format: "xlsx" })}>All matching filters — Excel (.xlsx)</a>
                <a role="menuitem" className="pg-menu-item" href={exportUrl({ format: "csv" })}>All matching filters — CSV</a>
                <a role="menuitem" className="pg-menu-item" href={exportUrl({ format: "xlsx", visibleOnly: true })}>Visible columns only — Excel</a>
                {selected.size && !allMatching ? (
                  <a role="menuitem" className="pg-menu-item" href={exportUrl({ format: "xlsx", selectedOnly: true })}>{plural(selected.size, "selected product")} — Excel</a>
                ) : null}
                <a role="menuitem" className="pg-menu-item" href={exportUrl({ format: "xlsx", preset: "seo" })}>SEO fields only — Excel</a>
                <a role="menuitem" className="pg-menu-item" href={exportUrl({ format: "xlsx", preset: "template" })}>Blank template — Excel</a>
                <p className="px-3 pb-2 pt-1 text-xs text-ink-500">Files include Product ID and code so they can be re-imported safely. Unsaved edits are not included.</p>
              </div>
            ) : null}
          </div>
        ) : null}
        <div className="ml-auto flex items-center gap-1">
          <div className="relative">
            <button type="button" className="pg-tool" aria-expanded={panel === "columns"} onClick={() => setPanel(panel === "columns" ? null : "columns")}>
              <Columns3 className="h-4 w-4" aria-hidden="true" /> Columns
            </button>
            {panel === "columns" ? (
              <div className="pg-popover right-0 max-h-[60vh] w-72 overflow-y-auto">
                {(["Core", "Pricing", "Content", "SEO", "System"] as const).map((group) => (
                  <fieldset key={group} className="px-3 py-2">
                    <legend className="pg-popover-title px-0">{group}</legend>
                    {COLUMNS.filter((column) => column.group === group).map((column) => (
                      <label key={column.key} className="flex items-center gap-2 py-0.5 text-sm">
                        <input
                          type="checkbox"
                          checked={ALWAYS_VISIBLE.includes(column.key) || !prefs.hidden.includes(column.key)}
                          disabled={ALWAYS_VISIBLE.includes(column.key)}
                          onChange={() => toggleColumn(column.key)}
                        />
                        {column.label}
                        {!column.editable ? <span className="text-xs text-ink-500">(read-only)</span> : null}
                      </label>
                    ))}
                  </fieldset>
                ))}
                <div className="flex gap-2 border-t border-line p-3">
                  <button type="button" className="btn btn-secondary px-3 py-1 text-xs" onClick={() => updatePrefs((current) => ({ ...DEFAULT_PREFS, pageSize: current.pageSize }))}>
                    Reset layout
                  </button>
                  <button type="button" className="btn btn-secondary px-3 py-1 text-xs" onClick={() => updatePrefs((current) => ({ ...current, hidden: [] }))}>
                    Show all
                  </button>
                </div>
              </div>
            ) : null}
          </div>
          <div className="relative">
            <button type="button" className="pg-tool" aria-expanded={panel === "keys"} onClick={() => setPanel(panel === "keys" ? null : "keys")} aria-label="Keyboard shortcuts">
              <Keyboard className="h-4 w-4" aria-hidden="true" />
            </button>
            {panel === "keys" ? <ShortcutHelp /> : null}
          </div>
          <button type="button" className="pg-tool" onClick={() => setFullscreen(!fullscreen)} aria-pressed={fullscreen} aria-label={fullscreen ? "Exit full screen" : "Full screen"}>
            {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* ---------------- Filters ---------------- */}
      <Filters filters={filters} categories={categories} onChange={setFilter} onClear={() => navigate({ q: undefined, category: undefined, status: undefined, featured: undefined, priceMin: undefined, priceMax: undefined, quality: undefined, seo: undefined, page: undefined })} activeCount={activeFilters} />

      {/* ---------------- Banners ---------------- */}
      {conflictList.length ? (
        <div className="pg-banner pg-banner-error" role="alert">
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <div className="space-y-2">
            <p className="font-semibold">Someone else changed {plural(conflictList.length, "product")} after you opened this page. Nothing was saved.</p>
            {conflictList.map((conflict) => (
              <div key={conflict.id} className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-medium">{String(conflict.values.name)}</span>
                <span className="text-xs opacity-80">updated {new Date(String(conflict.values.updatedAt)).toLocaleString("en-IN")}</span>
                <button type="button" className="btn btn-secondary px-3 py-1 text-xs" onClick={() => resolveConflict(conflict.id, "theirs")}>Use their version</button>
                <button type="button" className="btn btn-secondary px-3 py-1 text-xs" onClick={() => resolveConflict(conflict.id, "mine")}>Keep my edits on top of theirs</button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {pageAllSelected && total > baseRows.length && !allMatching ? (
        <div className="pg-banner">
          All {baseRows.length} products on this page are selected.
          <button type="button" className="font-semibold underline" onClick={() => setAllMatching(true)}>
            Select all {total.toLocaleString("en-IN")} matching products
          </button>
        </div>
      ) : null}
      {allMatching ? (
        <div className="pg-banner">
          All {total.toLocaleString("en-IN")} products matching the current filters are selected.
          <button type="button" className="font-semibold underline" onClick={() => { setAllMatching(false); setSelected(new Set()); }}>
            Clear selection
          </button>
        </div>
      ) : null}

      {/* ---------------- Status line ---------------- */}
      <div className="pg-status" aria-live="polite">
        <span>{plural(total, "product")}{activeFilters ? " match" : ""}</span>
        {selectionCount ? <span>· {selectionCount.toLocaleString("en-IN")} selected</span> : null}
        {dirty ? <span className="pg-status-dirty">· {plural(changeCount, "unsaved change")} in {plural(changedRows, "product")}</span> : null}
        {errorCount ? <span className="pg-status-error">· {plural(errorCount, "error")}</span> : null}
        {editMode ? <span className="ml-auto hidden text-ink-500 md:inline">Double-click or start typing to edit · Ctrl+V pastes from Excel · Ctrl+S saves</span> : null}
      </div>

      {/* ---------------- Grid ---------------- */}
      <div
        ref={scrollRef}
        className={`pg-scroll ${navigating ? "pg-loading" : ""}`}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        aria-label="Products table. Use arrow keys to move between cells."
        aria-busy={navigating}
      >
        <table className="pg-table" role="grid" aria-rowcount={total} aria-colcount={columns.length + 1}>
          <colgroup>
            <col style={{ width: SELECT_WIDTH }} />
            {columns.map((column, index) => <col key={column.key} style={{ width: layout.widths[index] }} />)}
          </colgroup>
          <thead>
            <tr>
              <th className="pg-frozen pg-select" style={{ left: 0 }}>
                <input type="checkbox" checked={pageAllSelected} onChange={togglePage} aria-label="Select all products on this page" />
              </th>
              {columns.map((column, index) => {
                const sortable = column.key in SORTABLE;
                const sorted = sort.key === column.key;
                const frozen = layout.lefts[index] >= 0;
                return (
                  <th
                    key={column.key}
                    className={`${frozen ? "pg-frozen" : ""} ${index === frozenCount - 1 ? "pg-frozen-edge" : ""}`}
                    style={frozen ? { left: layout.lefts[index] } : undefined}
                    aria-sort={sorted ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}
                    draggable={!frozen}
                    onDragStart={() => (dragKey.current = column.key)}
                    onDragOver={(event) => !frozen && event.preventDefault()}
                    onDrop={() => dropColumn(column.key)}
                    title={column.help}
                  >
                    <div className="pg-th">
                      {sortable ? (
                        <button
                          type="button"
                          className="pg-th-label"
                          onClick={() => navigate({ sort: column.key, dir: sorted && sort.dir === "asc" ? "desc" : "asc", page: undefined })}
                        >
                          {column.label}
                          {sorted ? (sort.dir === "asc" ? <ArrowUp className="h-3 w-3" aria-hidden="true" /> : <ArrowDown className="h-3 w-3" aria-hidden="true" />) : null}
                        </button>
                      ) : (
                        <span className="pg-th-label">{column.label}</span>
                      )}
                      {!column.editable ? <span className="sr-only">(read-only)</span> : null}
                    </div>
                    <span className="pg-resize" onPointerDown={(event) => startResize(column.key, event)} role="separator" aria-orientation="vertical" aria-label={`Resize ${column.label}`} />
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody onMouseDown={onBodyMouseDown} onMouseOver={onBodyMouseOver} onDoubleClick={onBodyDoubleClick}>
            {baseRows.map((row, r) => {
              const inRange = range && r >= range.r1 && r <= range.r2;
              return (
                <GridRowView
                  key={row.id}
                  row={row}
                  r={r}
                  columns={columns}
                  lefts={layout.lefts}
                  frozenCount={frozenCount}
                  draft={drafts[row.id]}
                  errors={errorsFor(row.id)}
                  activeC={active?.r === r ? active.c : -1}
                  rangeC1={inRange ? range.c1 : -1}
                  rangeC2={inRange ? range.c2 : -1}
                  editingC={editing?.r === r ? editing.c : -1}
                  editMode={editMode}
                  selected={allMatching || selected.has(row.id)}
                  conflict={!!conflicts[row.id]}
                  brokenImage={broken.has(row.id)}
                  categoryName={categoryName}
                  onToggleRow={toggleRow}
                  onToggleBool={onToggleBool}
                  onImageError={onImageError}
                />
              );
            })}
          </tbody>
        </table>
        {baseRows.length === 0 ? (
          <div className="p-10 text-center text-sm text-ink-600">
            {activeFilters ? (
              <>
                No products match these filters.{" "}
                <button type="button" className="font-semibold underline" onClick={() => navigate({ q: undefined, category: undefined, status: undefined, featured: undefined, priceMin: undefined, priceMax: undefined, quality: undefined, seo: undefined, page: undefined })}>
                  Clear filters
                </button>
              </>
            ) : (
              <>
                No products yet. <Link className="font-semibold underline" href="/admin/products/new">Add your first product</Link>
              </>
            )}
          </div>
        ) : null}
      </div>

      {/* ---------------- Pagination ---------------- */}
      <div className="pg-pager">
        <label className="flex items-center gap-2">
          Rows per page
          <select
            className="field-input w-auto py-1 text-sm"
            value={pageSize}
            onChange={(event) => {
              const size = Number(event.target.value);
              appliedPrefSize.current = true;
              updatePrefs((current) => ({ ...current, pageSize: size }));
              navigate({ size: String(size), page: undefined });
            }}
          >
            {PAGE_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}
          </select>
        </label>
        <span className="text-ink-600">
          {total ? `${((page - 1) * pageSize + 1).toLocaleString("en-IN")}–${Math.min(page * pageSize, total).toLocaleString("en-IN")} of ${total.toLocaleString("en-IN")}` : "0"}
        </span>
        <div className="flex gap-1">
          <button type="button" className="pg-tool" disabled={page <= 1} onClick={() => navigate({ page: "1" })}>First</button>
          <button type="button" className="pg-tool" disabled={page <= 1} onClick={() => navigate({ page: String(page - 1) })}>Previous</button>
          <span className="px-2 py-1.5 text-sm">Page {page} of {totalPages}</span>
          <button type="button" className="pg-tool" disabled={page >= totalPages} onClick={() => navigate({ page: String(page + 1) })}>Next</button>
          <button type="button" className="pg-tool" disabled={page >= totalPages} onClick={() => navigate({ page: String(totalPages) })}>Last</button>
        </div>
      </div>

      {editing && editorRect ? (
        <CellEditor
          key={`${editing.r}-${editing.c}`}
          column={columns[editing.c]}
          initialText={editing.text}
          replaced={editing.replaced}
          value={effectiveValue(baseRows[editing.r], drafts[baseRows[editing.r].id], columns[editing.c].key)}
          productId={baseRows[editing.r].id}
          images={baseRows[editing.r].images}
          categories={categories}
          rect={editorRect}
          error={editorError}
          onCommit={commitEdit}
          onCancel={cancelEdit}
        />
      ) : null}

      {bulkOpen && bulkSelection ? (
        <BulkEditDialog
          selection={bulkSelection}
          selectionLabel={allMatching ? `All ${total.toLocaleString("en-IN")} products matching the current filters` : `${plural(selected.size, "selected product")}`}
          categories={categories}
          canDelete={permissions.delete}
          onClose={() => setBulkOpen(false)}
          onApplied={(message) => {
            setBulkOpen(false);
            setSelected(new Set());
            setAllMatching(false);
            setToast({ kind: "success", text: message });
            router.refresh();
          }}
        />
      ) : null}

      {toast ? (
        <div className={`pg-toast pg-toast-${toast.kind}`} role={toast.kind === "error" ? "alert" : "status"}>
          <div className="min-w-0">
            <p>{toast.text}</p>
            {toast.details ? (
              <ul className="mt-1 list-disc pl-4 text-xs">
                {toast.details.map((detail) => <li key={detail}>{detail}</li>)}
              </ul>
            ) : null}
          </div>
          <button type="button" onClick={() => setToast(null)} aria-label="Dismiss" className="shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

// ============================================================================
// Row
// ============================================================================

type RowProps = {
  row: GridRow;
  r: number;
  columns: ColumnDef[];
  lefts: number[];
  frozenCount: number;
  draft: RowDraft | undefined;
  errors: RowErrors | undefined;
  activeC: number;
  rangeC1: number;
  rangeC2: number;
  editingC: number;
  editMode: boolean;
  selected: boolean;
  conflict: boolean;
  brokenImage: boolean;
  categoryName: Map<string, string>;
  onToggleRow: (id: string) => void;
  onToggleBool: (r: number, key: EditableKey) => void;
  onImageError: (id: string) => void;
};

const GridRowView = memo(function GridRowView(props: RowProps) {
  const { row, r, columns, lefts, frozenCount, draft, errors, activeC, rangeC1, rangeC2, editingC, editMode, selected, conflict } = props;
  return (
    <tr className={`${selected ? "pg-row-selected" : ""} ${conflict ? "pg-row-conflict" : ""}`} aria-selected={selected}>
      <td className="pg-frozen pg-select" style={{ left: 0 }}>
        <input type="checkbox" checked={selected} onChange={() => props.onToggleRow(row.id)} aria-label={`Select ${String(row.values.name)}`} />
      </td>
      {columns.map((column, c) => {
        const value = effectiveValue(row, draft, column.key);
        const dirty = has(draft, column.key);
        const error = errors?.[column.key as EditableKey];
        const frozen = lefts[c] >= 0;
        const classes = [
          "pg-cell",
          frozen ? "pg-frozen" : "",
          c === frozenCount - 1 ? "pg-frozen-edge" : "",
          !column.editable ? "pg-readonly" : "",
          dirty ? "pg-dirty" : "",
          error ? "pg-error" : "",
          c >= rangeC1 && c <= rangeC2 && rangeC1 >= 0 ? "pg-in-range" : "",
          c === activeC ? "pg-active" : "",
          c === editingC ? "pg-editing" : "",
          column.type === "money" || column.type === "int" ? "text-right tabular-nums" : "",
        ].join(" ");
        return (
          <td
            key={column.key}
            data-r={r}
            data-c={c}
            className={classes}
            style={frozen ? { left: lefts[c] } : undefined}
            title={error ?? (column.type === "longtext" || column.type === "specs" || column.type === "list" ? formatCellText(column.key, value, { categories: [] }) : undefined)}
            aria-invalid={error ? true : undefined}
            aria-selected={c === activeC || undefined}
            role="gridcell"
          >
            <CellDisplay {...props} column={column} value={value} editMode={editMode} />
            {error ? <span className="pg-error-flag" aria-hidden="true" /> : null}
          </td>
        );
      })}
    </tr>
  );
});

function CellDisplay({ column, value, row, r, editMode, brokenImage, categoryName, conflict, onToggleBool, onImageError }: RowProps & { column: ColumnDef; value: CellValue; editMode: boolean }) {
  switch (column.type) {
    case "image": {
      const image = row.images.find((item) => item.id === value);
      if (!image) return <span className="pg-chip pg-chip-warn">No image</span>;
      if (brokenImage) return <span className="pg-chip pg-chip-error">Broken</span>;
      return (
        <span className="pg-thumb">
          <Image
            src={image.url}
            alt={image.alt ?? ""}
            width={32}
            height={32}
            unoptimized
            className="size-full object-contain"
            onError={() => onImageError(row.id)}
            // Images that failed before hydration never fire onError; detect them on mount.
            ref={(element) => {
              if (element?.complete && element.naturalWidth === 0) queueMicrotask(() => onImageError(row.id));
            }}
          />
        </span>
      );
    }
    case "boolean":
      return (
        <button
          type="button"
          role="switch"
          aria-checked={!!value}
          aria-label={`${column.label}: ${value ? "Yes" : "No"}`}
          className={`pg-switch ${value ? "pg-switch-on" : ""}`}
          disabled={!editMode}
          onClick={() => onToggleBool(r, column.key as EditableKey)}
        >
          <span />
        </button>
      );
    case "status": {
      const status = value as ProductStatusValue;
      return <span className={`pg-chip ${status === "active" ? "pg-chip-ok" : status === "draft" ? "pg-chip-warn" : ""}`}>{STATUS_LABELS[status]?.replace(/ \(hidden\)/, "") ?? String(value)}</span>;
    }
    case "category":
      return value ? <>{categoryName.get(value as string) ?? "Unknown"}</> : <span className="text-ink-500">Uncategorised</span>;
    case "money":
      return value === null ? <span className="text-ink-500">—</span> : <>₹{(value as number).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</>;
    case "list":
      return (value as string[]).length ? <>{(value as string[]).join(", ")}</> : <span className="text-ink-500">—</span>;
    case "specs":
      return (value as Spec[]).length ? <>{(value as Spec[]).map((spec) => `${spec.label}: ${spec.value}`).join("; ")}</> : <span className="pg-chip pg-chip-warn">None</span>;
    case "date":
      return <span className="text-ink-600">{new Date(String(value)).toLocaleString("en-IN", { dateStyle: "medium", ...(column.key === "updatedAt" ? { timeStyle: "short" } : {}) })}</span>;
    default: {
      if (column.key === "name") {
        return (
          <span className="flex items-center gap-1.5">
            {conflict ? <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-[var(--pg-error)]" aria-label="Changed by someone else" /> : null}
            <span className="truncate font-medium">{String(value ?? "")}</span>
            <Link href={`/admin/products/${row.id}`} className="pg-open ml-auto" aria-label={`Open ${String(value)} full editor`} title="Open full product editor">
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </span>
        );
      }
      if (column.key === "seoDescription") {
        const length = typeof value === "string" ? value.length : 0;
        if (!length) return <span className="pg-chip">Default</span>;
        const tone = length > 160 || length < 70 ? "pg-chip-warn" : "pg-chip-ok";
        return (
          <span className="flex items-center gap-1.5">
            <span className={`pg-chip ${tone}`}>{length}</span>
            <span className="truncate">{String(value)}</span>
          </span>
        );
      }
      if (column.key === "indexing") return <span className={`pg-chip ${value === "Indexable" ? "pg-chip-ok" : ""}`}>{String(value)}</span>;
      if (value === null || value === "") return column.editable ? <span className="text-ink-500">—</span> : <span className="text-ink-500">—</span>;
      return <>{String(value)}</>;
    }
  }
}

// ============================================================================
// Filters
// ============================================================================

function Filters({
  filters,
  categories,
  onChange,
  onClear,
  activeCount,
}: {
  filters: ProductFilters;
  categories: Category[];
  onChange: (key: keyof ProductFilters, value: string | undefined) => void;
  onClear: () => void;
  activeCount: number;
}) {
  const [query, setQuery] = useState(filters.q ?? "");
  const [syncedQ, setSyncedQ] = useState(filters.q);
  if (filters.q !== syncedQ) {
    setSyncedQ(filters.q);
    setQuery(filters.q ?? "");
  }
  const submitPrice = (key: "priceMin" | "priceMax", value: string) => {
    const cleaned = value.replace(/[₹,\s]/g, "");
    if ((filters[key] ?? "") !== cleaned) onChange(key, cleaned);
  };

  return (
    <div className="pg-filters">
      <form
        className="min-w-56 flex-1"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          onChange("q", query.trim());
        }}
      >
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onBlur={() => query.trim() !== (filters.q ?? "") && onChange("q", query.trim())}
          placeholder="Search name, SKU, product code or URL…"
          className="field-input py-1.5 text-sm"
          aria-label="Search products"
          data-admin-search="products"
        />
      </form>
      <select className="field-input w-auto py-1.5 text-sm" value={filters.category ?? ""} onChange={(event) => onChange("category", event.target.value)} aria-label="Category">
        <option value="">All categories</option>
        <option value="none">Uncategorised</option>
        {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
      </select>
      <select className="field-input w-auto py-1.5 text-sm" value={filters.status ?? ""} onChange={(event) => onChange("status", event.target.value)} aria-label="Status">
        <option value="">Any status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive (draft + archived)</option>
        <option value="draft">Draft</option>
        <option value="archived">Archived</option>
      </select>
      <select className="field-input w-auto py-1.5 text-sm" value={filters.featured ?? ""} onChange={(event) => onChange("featured", event.target.value)} aria-label="Featured">
        <option value="">Featured: any</option>
        <option value="yes">Featured only</option>
        <option value="no">Not featured</option>
      </select>
      <div className="flex items-center gap-1">
        <input key={`min-${filters.priceMin}`} defaultValue={filters.priceMin} inputMode="decimal" placeholder="Min ₹" aria-label="Minimum price" className="field-input w-24 py-1.5 text-sm" onBlur={(event) => submitPrice("priceMin", event.target.value)} onKeyDown={(event) => event.key === "Enter" && submitPrice("priceMin", event.currentTarget.value)} />
        <span className="text-ink-500">–</span>
        <input key={`max-${filters.priceMax}`} defaultValue={filters.priceMax} inputMode="decimal" placeholder="Max ₹" aria-label="Maximum price" className="field-input w-24 py-1.5 text-sm" onBlur={(event) => submitPrice("priceMax", event.target.value)} onKeyDown={(event) => event.key === "Enter" && submitPrice("priceMax", event.currentTarget.value)} />
      </div>
      <select className="field-input w-auto py-1.5 text-sm" value={filters.quality ?? ""} onChange={(event) => onChange("quality", event.target.value)} aria-label="Data quality">
        <option value="">Data quality: any</option>
        {Object.entries(QUALITY_FILTERS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
      <select className="field-input w-auto py-1.5 text-sm" value={filters.seo ?? ""} onChange={(event) => onChange("seo", event.target.value)} aria-label="SEO quality">
        <option value="">SEO: any</option>
        {Object.entries(SEO_FILTERS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
      {activeCount ? (
        <button type="button" className="pg-tool" onClick={onClear}>
          <X className="h-4 w-4" aria-hidden="true" /> Clear {activeCount}
        </button>
      ) : null}
    </div>
  );
}

function ShortcutHelp() {
  const rows: Array<[string, string]> = [
    ["↑ ↓ ← →", "Move between cells"],
    ["Shift + arrows / drag", "Select a range"],
    ["Enter, F2, double-click", "Edit cell"],
    ["Type any character", "Replace cell contents"],
    ["Tab / Shift+Tab", "Save cell and move right / left"],
    ["Esc", "Cancel editing"],
    ["Ctrl+C / Ctrl+V", "Copy / paste (works with Excel & Sheets)"],
    ["Ctrl+D", "Fill the top value down the selection"],
    ["Delete", "Clear selected cells"],
    ["Space", "Toggle Yes/No cells"],
    ["Ctrl+Z / Ctrl+Y", "Undo / redo"],
    ["Ctrl+S", "Save all changes"],
  ];
  return (
    <div className="pg-popover right-0 w-80 p-3">
      <p className="pg-popover-title px-0">Keyboard shortcuts</p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
        {rows.map(([keys, label]) => (
          <div key={keys} className="contents">
            <dt><kbd className="pg-kbd">{keys}</kbd></dt>
            <dd className="text-ink-700">{label}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
