"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ImageOff } from "lucide-react";
import {
  PRODUCT_STATUSES,
  STATUS_LABELS,
  type CategoryOption,
  type CellValue,
  type ColumnDef,
  type GridImage,
} from "@/lib/admin/products/grid-schema";

export type EditorCommit = { kind: "text"; text: string } | { kind: "value"; value: CellValue };
export type EditorMove = "down" | "up" | "right" | "left" | "none";

type Props = {
  column: ColumnDef;
  /** Text to start with (current value, or the character that was typed). */
  initialText: string;
  /** True when editing began by typing, so the caret goes to the end instead of selecting all. */
  replaced: boolean;
  value: CellValue;
  productId: string;
  images: GridImage[];
  categories: Array<CategoryOption & { isActive: boolean }>;
  rect: { top: number; left: number; width: number; height: number };
  error: string | null;
  onCommit: (commit: EditorCommit, move: EditorMove) => void;
  onCancel: () => void;
};

const MULTILINE = new Set(["longtext", "list", "specs"]);

export default function CellEditor(props: Props) {
  const { column, rect } = props;
  const multiline = MULTILINE.has(column.type);
  const picker = column.type === "category" || column.type === "status" || column.type === "image";
  const width = multiline ? Math.max(rect.width, 420) : picker ? Math.max(rect.width, 280) : Math.max(rect.width, 160);
  // Keep the panel inside the viewport.
  const left = typeof window === "undefined" ? rect.left : Math.min(rect.left, window.innerWidth - width - 12);
  const top = typeof window === "undefined" ? rect.top : Math.min(rect.top, window.innerHeight - (multiline || picker ? 320 : 60));

  return (
    <div
      className="pg-editor"
      style={{ top: Math.max(8, top), left: Math.max(8, left), width, minHeight: rect.height }}
      onMouseDown={(event) => event.stopPropagation()}
      role="dialog"
      aria-label={`Edit ${column.label}`}
    >
      {column.type === "category" ? (
        <OptionPicker
          options={[{ value: "", label: "— Uncategorised —" }, ...props.categories.map((category) => ({ value: category.id, label: category.isActive ? category.name : `${category.name} (inactive)` }))]}
          current={(props.value as string | null) ?? ""}
          initialQuery={props.replaced ? props.initialText : ""}
          onPick={(value, move) => props.onCommit({ kind: "value", value: value || null }, move)}
          onCancel={props.onCancel}
        />
      ) : column.type === "status" ? (
        <OptionPicker
          options={PRODUCT_STATUSES.map((status) => ({ value: status, label: STATUS_LABELS[status] }))}
          current={String(props.value ?? "")}
          initialQuery={props.replaced ? props.initialText : ""}
          onPick={(value, move) => props.onCommit({ kind: "value", value }, move)}
          onCancel={props.onCancel}
        />
      ) : column.type === "image" ? (
        <ImagePicker {...props} />
      ) : (
        <TextEditor {...props} multiline={multiline} />
      )}
    </div>
  );
}

function TextEditor({ column, initialText, replaced, error, onCommit, onCancel, multiline }: Props & { multiline: boolean }) {
  const [text, setText] = useState(initialText);
  const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.focus();
    if (replaced) element.setSelectionRange(element.value.length, element.value.length);
    else element.select();
  }, [replaced]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onCancel();
    } else if (event.key === "Tab") {
      event.preventDefault();
      onCommit({ kind: "text", text }, event.shiftKey ? "left" : "right");
    } else if (event.key === "Enter" && (!multiline || event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      onCommit({ kind: "text", text }, event.shiftKey ? "up" : "down");
    }
  };

  const hint =
    column.type === "specs" ? "One per line as  Label: Value" : column.type === "list" ? "One item per line" : multiline ? "" : "";
  const count = column.maxLength ? `${text.length}/${column.maxLength}` : column.key === "seoDescription" ? `${text.length}` : "";

  return (
    <div>
      {multiline ? (
        <textarea
          ref={ref}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={onKeyDown}
          rows={column.type === "longtext" ? 8 : 6}
          className="pg-editor-input min-h-40 resize-y"
          aria-invalid={error ? true : undefined}
          aria-label={column.label}
        />
      ) : (
        <input
          ref={ref}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={onKeyDown}
          inputMode={column.type === "money" ? "decimal" : column.type === "int" ? "numeric" : undefined}
          className="pg-editor-input"
          aria-invalid={error ? true : undefined}
          aria-label={column.label}
        />
      )}
      {error ? <p className="pg-editor-error" role="alert">{error}</p> : null}
      {multiline ? (
        <div className="pg-editor-foot">
          <span>{hint}</span>
          <span className={column.key === "seoDescription" && (text.length > 160 || (text.length > 0 && text.length < 70)) ? "text-[var(--pg-warn)]" : ""}>{count}</span>
          <span className="ml-auto">Ctrl+Enter to apply · Esc to cancel</span>
          <button type="button" className="btn btn-primary px-3 py-1 text-xs" onClick={() => onCommit({ kind: "text", text }, "none")}>
            Apply
          </button>
        </div>
      ) : count ? (
        <div className="pg-editor-foot"><span className="ml-auto">{count}</span></div>
      ) : null}
    </div>
  );
}

function OptionPicker({
  options,
  current,
  initialQuery,
  onPick,
  onCancel,
}: {
  options: Array<{ value: string; label: string }>;
  current: string;
  initialQuery: string;
  onPick: (value: string, move: EditorMove) => void;
  onCancel: () => void;
}) {
  const [query, setQuery] = useState(initialQuery);
  const filtered = useMemo(
    () => options.filter((option) => option.label.toLowerCase().includes(query.trim().toLowerCase())),
    [options, query],
  );
  const [highlight, setHighlight] = useState(() => Math.max(0, options.findIndex((option) => option.value === current)));
  const index = Math.min(highlight, Math.max(0, filtered.length - 1));
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => inputRef.current?.focus(), []);

  return (
    <div>
      <input
        ref={inputRef}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setHighlight(0);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") { event.preventDefault(); setHighlight(Math.min(index + 1, filtered.length - 1)); }
          else if (event.key === "ArrowUp") { event.preventDefault(); setHighlight(Math.max(index - 1, 0)); }
          else if (event.key === "Enter" || event.key === "Tab") {
            event.preventDefault();
            const option = filtered[index];
            if (option) onPick(option.value, event.key === "Tab" ? (event.shiftKey ? "left" : "right") : "down");
          } else if (event.key === "Escape") { event.preventDefault(); onCancel(); }
        }}
        placeholder="Type to search…"
        className="pg-editor-input"
        role="combobox"
        aria-expanded="true"
        aria-controls="pg-option-list"
        aria-activedescendant={filtered[index] ? `pg-opt-${index}` : undefined}
      />
      <ul id="pg-option-list" role="listbox" className="pg-option-list">
        {filtered.map((option, i) => (
          <li
            key={option.value || "none"}
            id={`pg-opt-${i}`}
            role="option"
            aria-selected={i === index}
            className={i === index ? "pg-option pg-option-active" : "pg-option"}
            onMouseEnter={() => setHighlight(i)}
            onClick={() => onPick(option.value, "none")}
          >
            <span className="truncate">{option.label}</span>
            {option.value === current ? <Check className="h-3.5 w-3.5 shrink-0" aria-label="current" /> : null}
          </li>
        ))}
        {filtered.length === 0 ? <li className="px-3 py-2 text-xs text-ink-500">No matches</li> : null}
      </ul>
    </div>
  );
}

function ImagePicker({ images, value, productId, onCommit, onCancel }: Props) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="p-2">
      <p className="px-1 pb-2 text-xs text-ink-600">Choose the primary image</p>
      {images.length === 0 ? (
        <p className="flex items-center gap-2 px-1 py-4 text-sm text-ink-600">
          <ImageOff className="h-4 w-4" aria-hidden="true" /> This product has no images yet.
        </p>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => onCommit({ kind: "value", value: image.id }, "none")}
              className={`pg-image-choice ${image.id === value ? "pg-image-choice-active" : ""}`}
              aria-label={`Use image ${index + 1}${image.alt ? `: ${image.alt}` : ""} as primary`}
              aria-pressed={image.id === value}
            >
              <Image src={image.url} alt="" width={72} height={72} unoptimized className="size-full object-contain" />
            </button>
          ))}
        </div>
      )}
      <div className="mt-2 flex items-center justify-between border-t border-line px-1 pt-2 text-xs">
        <Link href={`/admin/products/${productId}#images`} className="font-semibold text-gold-700 hover:text-navy-950">
          Upload / manage images
        </Link>
        <button type="button" className="btn btn-secondary px-3 py-1 text-xs" onClick={onCancel}>
          Close
        </button>
      </div>
    </div>
  );
}
