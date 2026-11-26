"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { applyBulkOperation, previewBulkOperation, type BulkPreview, type BulkSelection } from "@/lib/actions/product-grid";
import { BULK_OPERATION_LABELS, TEXT_FIELD_LABELS, type BulkOperation, type BulkOperationType } from "@/lib/admin/products/bulk";
import { PRODUCT_STATUSES, STATUS_LABELS, type CategoryOption, type ProductStatusValue } from "@/lib/admin/products/grid-schema";

type Props = {
  selection: BulkSelection;
  selectionLabel: string;
  categories: Array<CategoryOption & { isActive: boolean }>;
  canDelete: boolean;
  onClose: () => void;
  onApplied: (message: string) => void;
};

type Form = {
  type: BulkOperationType;
  categoryId: string;
  price: string;
  percent: string;
  rounding: "none" | "rupee";
  quantity: string;
  status: string;
  flag: "true" | "false";
  textField: "description" | "longDescription" | "seoDescription";
  text: string;
  mode: "replace" | "fill-empty";
  specLabel: string;
  specValue: string;
  template: string;
  confirmText: string;
};

const INITIAL: Form = {
  type: "set_status",
  categoryId: "",
  price: "",
  percent: "",
  rounding: "rupee",
  quantity: "",
  status: "active",
  flag: "true",
  textField: "seoDescription",
  text: "",
  mode: "fill-empty",
  specLabel: "Material",
  specValue: "",
  template: "{name}",
  confirmText: "",
};

function toOperation(form: Form): BulkOperation | string {
  const number = (value: string) => (value.trim() === "" ? NaN : Number(value.replace(/[₹,\s]/g, "")));
  switch (form.type) {
    case "set_category":
      return { type: "set_category", categoryId: form.categoryId || null };
    case "set_price": {
      const price = number(form.price);
      return Number.isFinite(price) ? { type: "set_price", price } : "Enter a price";
    }
    case "adjust_price": {
      const percent = number(form.percent);
      return Number.isFinite(percent) ? { type: "adjust_price", percent, rounding: form.rounding } : "Enter a percentage, e.g. 10 or -5";
    }
    case "set_compare_at": {
      if (form.price.trim() === "") return { type: "set_compare_at", price: null };
      const price = number(form.price);
      return Number.isFinite(price) ? { type: "set_compare_at", price } : "Enter a price, or leave blank to remove MRP";
    }
    case "set_moq": {
      const quantity = number(form.quantity);
      return Number.isInteger(quantity) ? { type: "set_moq", quantity } : "Enter a whole number";
    }
    case "set_status":
      return { type: "set_status", status: form.status as ProductStatusValue };
    case "set_featured":
      return { type: "set_featured", value: form.flag === "true" };
    case "set_customizable":
      return { type: "set_customizable", value: form.flag === "true" };
    case "set_text":
      return { type: "set_text", field: form.textField, text: form.text, mode: form.mode };
    case "set_spec":
      return form.specLabel.trim() ? { type: "set_spec", label: form.specLabel.trim(), value: form.specValue, mode: form.mode } : "Enter a specification label";
    case "set_alt_text":
      return form.template.trim() ? { type: "set_alt_text", template: form.template, mode: form.mode } : "Enter alt text";
    case "duplicate":
      return { type: "duplicate" };
    case "delete":
      return { type: "delete", confirmText: form.confirmText };
  }
}

export default function BulkEditDialog({ selection, selectionLabel, categories, canDelete, onClose, onApplied }: Props) {
  const [form, setForm] = useState<Form>(INITIAL);
  const [preview, setPreview] = useState<BulkPreview | null>(null);
  const [previewKey, setPreviewKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const dialogRef = useRef<HTMLDivElement>(null);

  const operation = toOperation(form);
  const operationKey = typeof operation === "string" ? null : JSON.stringify({ ...operation, confirmText: undefined });
  const previewIsCurrent = preview?.ok && previewKey === operationKey;

  useEffect(() => {
    dialogRef.current?.querySelector<HTMLElement>("select, input")?.focus();
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && !pending && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, pending]);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((current) => ({ ...current, [key]: value }));

  const runPreview = () => {
    if (typeof operation === "string") return setMessage(operation);
    setMessage(null);
    startTransition(async () => {
      const result = await previewBulkOperation(selection, operation);
      setPreview(result);
      setPreviewKey(operationKey);
      if (!result.ok) setMessage(result.message ?? "Preview failed.");
    });
  };

  const runApply = () => {
    if (typeof operation === "string" || !preview?.matched) return;
    startTransition(async () => {
      const result = await applyBulkOperation(selection, operation, preview.matched);
      if (result.ok) onApplied(result.message);
      else {
        setMessage(result.message);
        setPreview(null);
      }
    });
  };

  const types = (Object.keys(BULK_OPERATION_LABELS) as BulkOperationType[]).filter((type) => type !== "delete" || canDelete);
  const destructive = form.type === "delete";

  return (
    <div className="pg-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && !pending && onClose()}>
      <div ref={dialogRef} className="pg-modal" role="dialog" aria-modal="true" aria-labelledby="bulk-title">
        <div className="flex items-start justify-between gap-4 border-b border-line p-4">
          <div>
            <h2 id="bulk-title" className="text-lg font-semibold text-navy-950">Bulk edit</h2>
            <p className="text-sm text-ink-600">{selectionLabel}</p>
          </div>
          <button type="button" onClick={onClose} disabled={pending} className="rounded p-1 text-ink-600 hover:bg-sunken" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto p-4">
          <label className="block text-sm font-medium text-navy-950">
            What do you want to change?
            <select className="field-input mt-1 text-sm" value={form.type} onChange={(event) => { set("type", event.target.value as BulkOperationType); setPreview(null); }}>
              {types.map((type) => (
                <option key={type} value={type}>{BULK_OPERATION_LABELS[type]}</option>
              ))}
            </select>
          </label>

          <OperationFields form={form} set={set} categories={categories} />

          {message ? <p className="field-error" role="alert">{message}</p> : null}

          {preview?.ok ? (
            <section aria-live="polite" className="space-y-3 border-t border-line pt-4">
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="badge">{preview.matched} selected</span>
                <span className="badge badge-positive">{preview.willChange} will change</span>
                {preview.unchanged ? <span className="badge">{preview.unchanged} already set</span> : null}
                {preview.skippedCount ? <span className="badge badge-attention">{preview.skippedCount} skipped</span> : null}
              </div>
              {preview.sample && preview.sample.length > 0 ? (
                <div className="overflow-x-auto border border-line">
                  <table className="pg-preview-table">
                    <thead><tr><th>Product</th><th>Field</th><th>Before</th><th>After</th></tr></thead>
                    <tbody>
                      {preview.sample.flatMap((row) =>
                        row.diff.map((line, index) => (
                          <tr key={`${row.id}-${index}`}>
                            <td>{index === 0 ? row.name : ""}</td>
                            <td>{line.field}</td>
                            <td className="text-ink-500">{line.before}</td>
                            <td className="font-medium text-navy-950">{line.after}</td>
                          </tr>
                        )),
                      )}
                    </tbody>
                  </table>
                  {(preview.willChange ?? 0) > preview.sample.length ? (
                    <p className="px-3 py-2 text-xs text-ink-600">Showing the first {preview.sample.length} of {preview.willChange} changes.</p>
                  ) : null}
                </div>
              ) : null}
              {preview.skipped && preview.skipped.length > 0 ? (
                <details className="text-sm">
                  <summary className="cursor-pointer font-medium text-navy-950">Why {preview.skippedCount} product(s) will be skipped</summary>
                  <ul className="mt-2 space-y-1 text-ink-700">
                    {preview.skipped.map((item) => (
                      <li key={item.id}><strong>{item.name}</strong> — {item.reason}</li>
                    ))}
                  </ul>
                </details>
              ) : null}
              {destructive ? (
                <div className="space-y-2 border border-[var(--pg-error)] bg-[var(--pg-error-bg)] p-3 text-sm">
                  <p className="flex items-center gap-2 font-semibold text-[var(--pg-error)]"><AlertTriangle className="h-4 w-4" /> Permanent. Deleted products cannot be restored from the admin.</p>
                  <label className="block">
                    Type <strong>DELETE</strong> to confirm
                    <input className="field-input mt-1 text-sm" value={form.confirmText} onChange={(event) => set("confirmText", event.target.value)} autoComplete="off" />
                  </label>
                </div>
              ) : null}
            </section>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line p-4">
          <button type="button" className="btn btn-secondary py-2" onClick={onClose} disabled={pending}>Cancel</button>
          <button type="button" className="btn btn-secondary py-2" onClick={runPreview} disabled={pending}>
            {pending && !previewIsCurrent ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            {previewIsCurrent ? "Refresh preview" : "Preview changes"}
          </button>
          <button
            type="button"
            className="btn btn-primary py-2"
            onClick={runApply}
            disabled={pending || !previewIsCurrent || !preview?.willChange || (destructive && form.confirmText !== "DELETE")}
            title={!previewIsCurrent ? "Preview the change first" : undefined}
          >
            {pending && previewIsCurrent ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            {destructive ? `Delete ${preview?.willChange ?? ""} products` : `Apply to ${preview?.willChange ?? 0} products`}
          </button>
        </div>
      </div>
    </div>
  );
}

function OperationFields({
  form,
  set,
  categories,
}: {
  form: Form;
  set: <K extends keyof Form>(key: K, value: Form[K]) => void;
  categories: Array<CategoryOption & { isActive: boolean }>;
}) {
  const modeSelect = (
    <fieldset className="flex flex-wrap gap-4 text-sm">
      <legend className="sr-only">Overwrite behaviour</legend>
      <label className="flex items-center gap-2"><input type="radio" checked={form.mode === "fill-empty"} onChange={() => set("mode", "fill-empty")} /> Only fill blanks (safe)</label>
      <label className="flex items-center gap-2"><input type="radio" checked={form.mode === "replace"} onChange={() => set("mode", "replace")} /> Replace existing values</label>
    </fieldset>
  );
  const tokens = <p className="text-xs text-ink-600">You can use {"{name}"}, {"{code}"} and {"{category}"} — they are filled from each product&apos;s own data.</p>;

  switch (form.type) {
    case "set_category":
      return (
        <label className="block text-sm font-medium text-navy-950">New category
          <select className="field-input mt-1 text-sm" value={form.categoryId} onChange={(event) => set("categoryId", event.target.value)}>
            <option value="">— Uncategorised —</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}{category.isActive ? "" : " (inactive)"}</option>)}
          </select>
        </label>
      );
    case "set_price":
    case "set_compare_at":
      return (
        <label className="block text-sm font-medium text-navy-950">{form.type === "set_price" ? "New selling price (₹)" : "New MRP (₹) — leave blank to remove"}
          <input className="field-input mt-1 text-sm" inputMode="decimal" value={form.price} onChange={(event) => set("price", event.target.value)} placeholder="e.g. 1499" />
        </label>
      );
    case "adjust_price":
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-medium text-navy-950">Change by %
            <input className="field-input mt-1 text-sm" inputMode="decimal" value={form.percent} onChange={(event) => set("percent", event.target.value)} placeholder="10 to increase, -5 to decrease" />
          </label>
          <label className="block text-sm font-medium text-navy-950">Rounding
            <select className="field-input mt-1 text-sm" value={form.rounding} onChange={(event) => set("rounding", event.target.value as Form["rounding"])}>
              <option value="rupee">Nearest whole rupee</option>
              <option value="none">Keep paise (2 decimals)</option>
            </select>
          </label>
        </div>
      );
    case "set_moq":
      return (
        <label className="block text-sm font-medium text-navy-950">Minimum order quantity
          <input className="field-input mt-1 text-sm" inputMode="numeric" value={form.quantity} onChange={(event) => set("quantity", event.target.value)} />
        </label>
      );
    case "set_status":
      return (
        <label className="block text-sm font-medium text-navy-950">New status
          <select className="field-input mt-1 text-sm" value={form.status} onChange={(event) => set("status", event.target.value)}>
            {PRODUCT_STATUSES.map((status) => <option key={status} value={status}>{STATUS_LABELS[status]}</option>)}
          </select>
          <span className="mt-1 block text-xs font-normal text-ink-600">Archiving hides products from the website but keeps all their data.</span>
        </label>
      );
    case "set_featured":
    case "set_customizable":
      return (
        <label className="block text-sm font-medium text-navy-950">Set to
          <select className="field-input mt-1 text-sm" value={form.flag} onChange={(event) => set("flag", event.target.value as Form["flag"])}>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </label>
      );
    case "set_text":
      return (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-navy-950">Field
            <select className="field-input mt-1 text-sm" value={form.textField} onChange={(event) => set("textField", event.target.value as Form["textField"])}>
              {Object.entries(TEXT_FIELD_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium text-navy-950">New text
            <textarea className="field-input mt-1 text-sm" rows={4} value={form.text} onChange={(event) => set("text", event.target.value)} />
            {form.textField === "seoDescription" ? <span className="mt-1 block text-xs font-normal text-ink-600">{form.text.length} characters (120–160 recommended)</span> : null}
          </label>
          {tokens}
          {modeSelect}
        </div>
      );
    case "set_spec":
      return (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium text-navy-950">Specification
              <input className="field-input mt-1 text-sm" list="pg-spec-labels" value={form.specLabel} onChange={(event) => set("specLabel", event.target.value)} />
              <datalist id="pg-spec-labels">
                {["Material", "Colour", "Size", "Finish", "Capacity", "Packaging", "Branding"].map((label) => <option key={label} value={label} />)}
              </datalist>
            </label>
            <label className="block text-sm font-medium text-navy-950">Value (blank removes it)
              <input className="field-input mt-1 text-sm" value={form.specValue} onChange={(event) => set("specValue", event.target.value)} />
            </label>
          </div>
          {modeSelect}
        </div>
      );
    case "set_alt_text":
      return (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-navy-950">Alt text for every image
            <input className="field-input mt-1 text-sm" value={form.template} onChange={(event) => set("template", event.target.value)} />
          </label>
          <p className="text-xs text-ink-600">Use {"{name}"} for the product name and {"{n}"} for the image number, e.g. “{"{name}"} – view {"{n}"}”.</p>
          {modeSelect}
        </div>
      );
    case "duplicate":
      return <p className="text-sm text-ink-700">Each product is copied as a hidden <strong>draft</strong> with a new product code, “(Copy)” in its name and a “-copy” URL. Images, specifications and price tiers are copied; stock starts at 0.</p>;
    case "delete":
      return <p className="text-sm text-ink-700">Products that appear on any order are always skipped — archive those instead. Preview to see exactly which products would be deleted.</p>;
  }
}
