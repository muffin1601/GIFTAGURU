/**
 * Single source of truth for the admin product grid: which columns exist,
 * which are editable, and how a typed or pasted value is parsed and validated.
 *
 * Pure (no server or browser APIs) so the exact same rules run in the browser
 * for instant cell feedback and on the server, which re-validates everything
 * before writing. Column keys map onto the real Prisma Product model; nothing
 * here introduces a new database field.
 */
import { MIN_ORDER_QUANTITY } from "@/lib/config/store";

export type ProductStatusValue = "draft" | "active" | "archived";
export const PRODUCT_STATUSES: ProductStatusValue[] = ["draft", "active", "archived"];
export const STATUS_LABELS: Record<ProductStatusValue, string> = {
  active: "Active",
  draft: "Draft (hidden)",
  archived: "Archived (hidden)",
};

export type Spec = { label: string; value: string };
export type CellValue = string | number | boolean | null | string[] | Spec[];

export type FieldType =
  | "text"
  | "longtext"
  | "money"
  | "int"
  | "boolean"
  | "status"
  | "category"
  | "list"
  | "specs"
  | "image"
  | "readonly"
  | "date";

/** Editable keys. Each is written by lib/actions/product-grid.ts. */
export const EDITABLE_KEYS = [
  "primaryImageId",
  "name",
  "sku",
  "categoryId",
  "description",
  "longDescription",
  "specifications",
  "material",
  "colour",
  "size",
  "basePrice",
  "compareAtPrice",
  "minOrderQuantity",
  "customizationOptions",
  "isCustomizable",
  "isFeatured",
  "status",
  "seoDescription",
  "occasionTags",
  "imageAlt",
] as const;
export type EditableKey = (typeof EDITABLE_KEYS)[number];

export const READONLY_KEYS = ["id", "productCode", "slug", "seoTitle", "indexing", "imageCount", "createdAt", "updatedAt"] as const;
export type ReadonlyKey = (typeof READONLY_KEYS)[number];
export type ColumnKey = EditableKey | ReadonlyKey;

/** Server-side sortable columns -> the Prisma field they sort on. */
export const SORTABLE: Partial<Record<ColumnKey, string>> = {
  name: "name",
  productCode: "productCode",
  slug: "slug",
  categoryId: "category",
  basePrice: "basePrice",
  compareAtPrice: "compareAtPrice",
  minOrderQuantity: "minOrderQuantity",
  isFeatured: "isFeatured",
  isCustomizable: "isCustomizable",
  status: "status",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
};

export type ColumnGroup = "Core" | "Content" | "Pricing" | "SEO" | "System";

export type ColumnDef = {
  key: ColumnKey;
  label: string;
  type: FieldType;
  group: ColumnGroup;
  width: number;
  editable: boolean;
  defaultVisible: boolean;
  required?: boolean;
  maxLength?: number;
  /** Shown as a tooltip on the header so non-technical staff know what a column does. */
  help?: string;
};

/**
 * Virtual columns that read/write ONE specification row with this exact label.
 * Existing labels such as "Material (bottle)" are left untouched; only a row
 * labelled exactly "Material" is edited, so no existing data is reinterpreted.
 */
export const SPEC_COLUMNS = { material: "Material", colour: "Colour", size: "Size" } as const;
export type SpecColumnKey = keyof typeof SPEC_COLUMNS;
export const isSpecColumn = (key: string): key is SpecColumnKey => key in SPEC_COLUMNS;

export const COLUMNS: ColumnDef[] = [
  { key: "primaryImageId", label: "Image", type: "image", group: "Core", width: 72, editable: true, defaultVisible: true, help: "Primary image. Pick from this product's uploaded images." },
  { key: "name", label: "Product name", type: "text", group: "Core", width: 260, editable: true, defaultVisible: true, required: true, maxLength: 200 },
  { key: "productCode", label: "Product code", type: "readonly", group: "Core", width: 120, editable: false, defaultVisible: true, help: "Generated automatically from the category prefix. Cannot be edited." },
  { key: "sku", label: "SKU", type: "text", group: "Core", width: 130, editable: true, defaultVisible: true, required: true, maxLength: 80, help: "Default variant SKU. Must be unique. Used by price-file imports." },
  { key: "categoryId", label: "Category", type: "category", group: "Core", width: 180, editable: true, defaultVisible: true },
  { key: "status", label: "Status", type: "status", group: "Core", width: 140, editable: true, defaultVisible: true, help: "Only Active products appear on the website and in the sitemap." },
  { key: "isFeatured", label: "Featured", type: "boolean", group: "Core", width: 96, editable: true, defaultVisible: true },
  { key: "basePrice", label: "Price (₹)", type: "money", group: "Pricing", width: 110, editable: true, defaultVisible: true, required: true, help: "Selling price per unit, before volume tiers." },
  { key: "compareAtPrice", label: "MRP / compare-at (₹)", type: "money", group: "Pricing", width: 140, editable: true, defaultVisible: true, help: "Optional strike-through price. Must be higher than the selling price." },
  { key: "minOrderQuantity", label: "Min. order qty", type: "int", group: "Pricing", width: 110, editable: true, defaultVisible: true },
  { key: "isCustomizable", label: "Customisable", type: "boolean", group: "Content", width: 110, editable: true, defaultVisible: false },
  { key: "customizationOptions", label: "Customisation options", type: "list", group: "Content", width: 220, editable: true, defaultVisible: false, help: "One option per line (or separated by |)." },
  { key: "description", label: "Short description", type: "longtext", group: "Content", width: 260, editable: true, defaultVisible: true, maxLength: 4000 },
  { key: "longDescription", label: "Full description", type: "longtext", group: "Content", width: 260, editable: true, defaultVisible: false, maxLength: 8000 },
  { key: "specifications", label: "Specifications", type: "specs", group: "Content", width: 260, editable: true, defaultVisible: false, help: "One per line as Label: Value." },
  { key: "material", label: "Material", type: "text", group: "Content", width: 150, editable: true, defaultVisible: false, maxLength: 600, help: "Edits the specification labelled exactly \"Material\"." },
  { key: "colour", label: "Colour", type: "text", group: "Content", width: 130, editable: true, defaultVisible: false, maxLength: 600, help: "Edits the specification labelled exactly \"Colour\"." },
  { key: "size", label: "Size", type: "text", group: "Content", width: 130, editable: true, defaultVisible: false, maxLength: 600, help: "Edits the specification labelled exactly \"Size\"." },
  { key: "seoTitle", label: "SEO title", type: "readonly", group: "SEO", width: 240, editable: false, defaultVisible: false, help: "The <title> the website renders today (site SEO content, else product name). Editable in SEO Management." },
  { key: "seoDescription", label: "Meta description", type: "longtext", group: "SEO", width: 260, editable: true, defaultVisible: true, maxLength: 500, help: "Search-result snippet. 120–160 characters is ideal. Blank = the site's default description." },
  { key: "occasionTags", label: "Tags / keywords", type: "list", group: "SEO", width: 200, editable: true, defaultVisible: false, help: "Occasion tags. Separate with commas, | or new lines." },
  { key: "imageAlt", label: "Image alt text", type: "text", group: "SEO", width: 200, editable: true, defaultVisible: false, maxLength: 200, help: "Alt text of the primary image." },
  { key: "slug", label: "URL slug", type: "readonly", group: "SEO", width: 220, editable: false, defaultVisible: false, help: "Read-only here: changing a URL breaks links and SEO content. Change it on the product page." },
  { key: "indexing", label: "Indexing", type: "readonly", group: "SEO", width: 130, editable: false, defaultVisible: false, help: "Active products are listed in the sitemap and indexable." },
  { key: "imageCount", label: "Images", type: "readonly", group: "System", width: 80, editable: false, defaultVisible: false },
  { key: "id", label: "Product ID", type: "readonly", group: "System", width: 290, editable: false, defaultVisible: false },
  { key: "createdAt", label: "Created", type: "date", group: "System", width: 120, editable: false, defaultVisible: false },
  { key: "updatedAt", label: "Updated", type: "date", group: "System", width: 140, editable: false, defaultVisible: true },
];

export const COLUMN_BY_KEY = Object.fromEntries(COLUMNS.map((column) => [column.key, column])) as Record<ColumnKey, ColumnDef>;

export const LIMITS = {
  maxPrice: 99_999_999.99,
  maxMoq: 1_000_000,
  maxSpecs: 30,
  maxListItems: 30,
  maxListItemLength: 500,
  maxSpecLabel: 120,
  maxSpecValue: 600,
  skuPattern: /^[A-Za-z0-9][A-Za-z0-9._/-]*$/,
};

export type CategoryOption = { id: string; name: string; slug: string };
export type ParseContext = { categories: CategoryOption[]; imageIds?: string[] };
export type ParseResult = { ok: true; value: CellValue } | { ok: false; error: string };

// ---------------------------------------------------------------------------
// Value helpers
// ---------------------------------------------------------------------------

const TRUE_WORDS = new Set(["true", "yes", "y", "1", "on", "featured", "x", "✓"]);
const FALSE_WORDS = new Set(["false", "no", "n", "0", "off", "", "-", "—"]);

export function splitList(text: string, allowComma = false, linesOnly = false): string[] {
  const pattern = linesOnly ? /\r?\n/ : allowComma ? /\r?\n|\||,/ : /\r?\n|\|/;
  return text
    .split(pattern)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseSpecsText(text: string, linesOnly = false): Spec[] | string {
  const specs: Spec[] = [];
  for (const line of splitList(text, false, linesOnly)) {
    const index = line.indexOf(":");
    if (index <= 0) return `"${line.slice(0, 40)}" must be written as Label: Value`;
    const label = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim();
    if (!label || !value) return `"${line.slice(0, 40)}" needs both a label and a value`;
    specs.push({ label, value });
  }
  return specs;
}

export function specValue(specs: Spec[], label: string): string | null {
  const wanted = label.toLowerCase();
  return specs.find((spec) => spec.label.trim().toLowerCase() === wanted)?.value ?? null;
}

/** Applies Material/Colour/Size overrides onto a spec list without reordering other rows. */
export function applySpecOverrides(specs: Spec[], overrides: Partial<Record<SpecColumnKey, string | null>>): Spec[] {
  let next = specs.map((spec) => ({ ...spec }));
  for (const [key, raw] of Object.entries(overrides) as Array<[SpecColumnKey, string | null | undefined]>) {
    if (raw === undefined) continue;
    const label = SPEC_COLUMNS[key];
    const value = typeof raw === "string" ? raw.trim() : "";
    const index = next.findIndex((spec) => spec.label.trim().toLowerCase() === label.toLowerCase());
    if (!value) {
      if (index >= 0) next = next.filter((_, i) => i !== index);
    } else if (index >= 0) {
      next[index] = { label: next[index].label, value };
    } else {
      next.push({ label, value });
    }
  }
  return next;
}

export function parseMoney(text: string): number | null | "invalid" {
  const cleaned = text.replace(/[₹$,\s]/g, "").replace(/^rs\.?/i, "");
  if (cleaned === "") return null;
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return "invalid";
  return Number(cleaned);
}

function resolveCategory(text: string, categories: CategoryOption[]): CategoryOption | undefined {
  const needle = text.trim().toLowerCase();
  return categories.find(
    (category) => category.id === text.trim() || category.name.toLowerCase() === needle || category.slug === needle,
  );
}

/** Converts typed or pasted text into a typed cell value. */
export function parseCellText(key: EditableKey, text: string, ctx: ParseContext, opts: { linesOnly?: boolean } = {}): ParseResult {
  const column = COLUMN_BY_KEY[key];
  const raw = text ?? "";
  switch (column.type) {
    case "money": {
      const value = parseMoney(raw);
      if (value === "invalid") return { ok: false, error: "Enter a number, e.g. 1499 or 1499.50" };
      return { ok: true, value };
    }
    case "int": {
      const cleaned = raw.replace(/[,\s]/g, "");
      if (!/^\d+$/.test(cleaned)) return { ok: false, error: "Enter a whole number" };
      return { ok: true, value: Number(cleaned) };
    }
    case "boolean": {
      const word = raw.trim().toLowerCase();
      if (TRUE_WORDS.has(word)) return { ok: true, value: true };
      if (FALSE_WORDS.has(word)) return { ok: true, value: false };
      return { ok: false, error: "Use Yes or No" };
    }
    case "status": {
      const word = raw.trim().toLowerCase();
      if (word === "inactive" || word === "hidden") return { ok: true, value: "draft" };
      const match = PRODUCT_STATUSES.find((status) => status === word || STATUS_LABELS[status].toLowerCase() === word);
      if (!match) return { ok: false, error: "Use Active, Draft or Archived" };
      return { ok: true, value: match };
    }
    case "category": {
      if (!raw.trim()) return { ok: true, value: null };
      const category = resolveCategory(raw, ctx.categories);
      if (!category) return { ok: false, error: `No category named "${raw.trim().slice(0, 40)}"` };
      return { ok: true, value: category.id };
    }
    case "list":
      return { ok: true, value: splitList(raw, key === "occasionTags" && !opts.linesOnly, opts.linesOnly) };
    case "specs": {
      const specs = parseSpecsText(raw, opts.linesOnly);
      if (typeof specs === "string") return { ok: false, error: specs };
      return { ok: true, value: specs };
    }
    case "image": {
      const id = raw.trim();
      if (!id) return { ok: false, error: "Pick an image from the image picker" };
      if (ctx.imageIds && !ctx.imageIds.includes(id)) return { ok: false, error: "Pick one of this product's images" };
      return { ok: true, value: id };
    }
    default: {
      const value = raw.replace(/\r\n/g, "\n").trim();
      return { ok: true, value: value === "" ? null : value };
    }
  }
}

/** Validates a typed value. Returns a user-facing message, or null when valid. */
export function validateCell(key: EditableKey, value: CellValue): string | null {
  const column = COLUMN_BY_KEY[key];
  switch (column.type) {
    case "money": {
      if (value === null) return column.required ? "Price is required" : null;
      if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return "Must be 0 or more";
      if (value > LIMITS.maxPrice) return "Price is too large";
      if (Math.abs(value * 100 - Math.round(value * 100)) > 1e-6) return "Use at most 2 decimals";
      return null;
    }
    case "int": {
      if (typeof value !== "number" || !Number.isInteger(value)) return "Enter a whole number";
      if (value < MIN_ORDER_QUANTITY) return `Must be at least ${MIN_ORDER_QUANTITY}`;
      if (value > LIMITS.maxMoq) return "Quantity is too large";
      return null;
    }
    case "boolean":
      return typeof value === "boolean" ? null : "Use Yes or No";
    case "status":
      return PRODUCT_STATUSES.includes(value as ProductStatusValue) ? null : "Use Active, Draft or Archived";
    case "category":
      return value === null || typeof value === "string" ? null : "Choose a category";
    case "image":
      return typeof value === "string" && value ? null : "Pick an image";
    case "list": {
      if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) return "Invalid list";
      if (value.length > LIMITS.maxListItems) return `At most ${LIMITS.maxListItems} items`;
      if ((value as string[]).some((item) => item.length > (key === "occasionTags" ? 60 : LIMITS.maxListItemLength))) return "One of the items is too long";
      return null;
    }
    case "specs": {
      if (!Array.isArray(value)) return "Invalid specifications";
      const specs = value as Spec[];
      if (specs.length > LIMITS.maxSpecs) return `At most ${LIMITS.maxSpecs} specifications`;
      for (const spec of specs) {
        if (typeof spec !== "object" || !spec || typeof spec.label !== "string" || typeof spec.value !== "string") return "Invalid specification";
        if (!spec.label.trim() || !spec.value.trim()) return "Each specification needs a label and value";
        if (spec.label.length > LIMITS.maxSpecLabel || spec.value.length > LIMITS.maxSpecValue) return "A specification is too long";
      }
      return null;
    }
    default: {
      if (value === null) return column.required ? `${column.label} is required` : null;
      if (typeof value !== "string") return "Invalid text";
      if (column.required && value.trim().length < 2) return `${column.label} must be at least 2 characters`;
      if (column.maxLength && value.length > column.maxLength) return `Maximum ${column.maxLength} characters (now ${value.length})`;
      if (key === "sku" && !LIMITS.skuPattern.test(value)) return "Letters, numbers, . _ / - only; no spaces";
      return null;
    }
  }
}

/** Cross-field rules. Returns errors keyed by the cell they should appear in. */
export function validateRow(values: { basePrice: CellValue; compareAtPrice: CellValue }): Partial<Record<EditableKey, string>> {
  const errors: Partial<Record<EditableKey, string>> = {};
  if (typeof values.compareAtPrice === "number" && typeof values.basePrice === "number" && values.compareAtPrice <= values.basePrice) {
    errors.compareAtPrice = "MRP must be higher than the selling price (or blank)";
  }
  return errors;
}

/** Text used for copy-to-clipboard and for exports. Round-trips through parseCellText. */
export function formatCellText(key: ColumnKey, value: CellValue, ctx: ParseContext): string {
  const column = COLUMN_BY_KEY[key];
  if (value === null || value === undefined) return "";
  switch (column.type) {
    case "boolean":
      return value ? "Yes" : "No";
    case "status":
      return value === "active" ? "Active" : value === "draft" ? "Draft" : "Archived";
    case "category":
      return ctx.categories.find((category) => category.id === value)?.name ?? "";
    case "list":
      return (value as string[]).join(key === "occasionTags" ? ", " : " | ");
    case "specs":
      return (value as Spec[]).map((spec) => `${spec.label}: ${spec.value}`).join(" | ");
    case "money":
      return typeof value === "number" ? String(value) : "";
    default:
      return String(value);
  }
}

/** Multi-line text shown inside the cell editor (one list item / spec per line). */
export function editorText(key: ColumnKey, value: CellValue, ctx: ParseContext): string {
  const type = COLUMN_BY_KEY[key].type;
  if (type === "list") return ((value as string[] | null) ?? []).join("\n");
  if (type === "specs") return ((value as Spec[] | null) ?? []).map((spec) => `${spec.label}: ${spec.value}`).join("\n");
  return formatCellText(key, value, ctx);
}

/** Parses tab-separated clipboard text from Excel / Google Sheets, honouring quoted cells. */
export function parseClipboard(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const source = text.replace(/\r\n/g, "\n").replace(/\n$/, "");
  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    if (quoted) {
      if (char === '"' && source[i + 1] === '"') { cell += '"'; i += 1; }
      else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"' && cell === "") quoted = true;
    else if (char === "\t") { row.push(cell); cell = ""; }
    else if (char === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
    else cell += char;
  }
  row.push(cell);
  rows.push(row);
  return rows;
}

/** Serialises a block of cells as TSV that Excel / Sheets paste correctly. */
export function toClipboard(rows: string[][]): string {
  return rows
    .map((row) => row.map((cell) => (/[\t\n"]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell)).join("\t"))
    .join("\n");
}

export function valuesEqual(a: CellValue | undefined, b: CellValue | undefined): boolean {
  if (a === b) return true;
  if (a === null || b === null || a === undefined || b === undefined) return (a ?? null) === (b ?? null);
  return JSON.stringify(a) === JSON.stringify(b);
}

// ---------------------------------------------------------------------------
// Row DTO shared by server and client
// ---------------------------------------------------------------------------

export type GridImage = { id: string; url: string; alt: string | null };

export type GridRow = {
  id: string;
  /** Optimistic-concurrency token: the product's updatedAt as epoch ms. */
  version: number;
  values: Record<ColumnKey, CellValue>;
  images: GridImage[];
};

/** A pending edit for one product, sent to Save All. */
export type RowChange = {
  id: string;
  version: number;
  fields: Partial<Record<EditableKey, CellValue>>;
};

export type RowDraft = Partial<Record<EditableKey, CellValue>>;
const has = (draft: RowDraft, key: string) => Object.prototype.hasOwnProperty.call(draft, key);

/**
 * The value a cell shows given unsaved edits. Mirrors exactly what
 * saveProductGridChanges will write: Material/Colour/Size are layered on top
 * of the (possibly edited) specification list, and alt text follows a newly
 * chosen primary image.
 */
export function effectiveValue(row: GridRow, draft: RowDraft | undefined, key: ColumnKey): CellValue {
  if (!draft) return row.values[key];
  if (has(draft, key)) return draft[key as EditableKey] ?? null;

  const specDrafted = has(draft, "specifications") || Object.keys(SPEC_COLUMNS).some((name) => has(draft, name));
  if (specDrafted && (key === "specifications" || isSpecColumn(key))) {
    const base = (has(draft, "specifications") ? draft.specifications : row.values.specifications) as Spec[];
    const overrides: Partial<Record<SpecColumnKey, string | null>> = {};
    for (const name of Object.keys(SPEC_COLUMNS) as SpecColumnKey[]) if (has(draft, name)) overrides[name] = draft[name] as string | null;
    const specs = applySpecOverrides(base ?? [], overrides);
    return key === "specifications" ? specs : specValue(specs, SPEC_COLUMNS[key as SpecColumnKey]);
  }
  if (key === "imageAlt" && has(draft, "primaryImageId")) {
    return row.images.find((image) => image.id === draft.primaryImageId)?.alt ?? null;
  }
  return row.values[key];
}

// ---------------------------------------------------------------------------
// Filters (serialised in the URL)
// ---------------------------------------------------------------------------

export const PAGE_SIZES = [25, 50, 100, 200] as const;

export type ProductFilters = {
  q?: string;
  category?: string;
  status?: string;
  featured?: string;
  priceMin?: string;
  priceMax?: string;
  quality?: string;
  seo?: string;
};

export const FILTER_KEYS: Array<keyof ProductFilters> = ["q", "category", "status", "featured", "priceMin", "priceMax", "quality", "seo"];

export const QUALITY_FILTERS = {
  "missing-image": "Missing image",
  "missing-description": "Missing short description",
  "missing-long-description": "Missing full description",
  "missing-specs": "No specifications",
  incomplete: "Any information missing",
} as const;

export const SEO_FILTERS = {
  "missing-meta": "No meta description at all",
  "no-custom-meta": "Using default meta description",
  "meta-too-long": "Meta description over 160 chars",
  "meta-too-short": "Meta description under 70 chars",
  "missing-alt": "Primary image has no alt text",
} as const;
