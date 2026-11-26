import assert from "node:assert/strict";
import test from "node:test";
import {
  applySpecOverrides,
  editorText,
  formatCellText,
  parseCellText,
  parseClipboard,
  specValue,
  toClipboard,
  validateCell,
  validateRow,
} from "../lib/admin/products/grid-schema.ts";
import { computeBulkChange, fillTemplate, type BulkSnapshot } from "../lib/admin/products/bulk.ts";
import { neutralizeFormula, restoreFormulaText, toCsv } from "../lib/admin/spreadsheet.ts";
import { roleCan } from "../lib/auth/permissions.ts";

const categories = [
  { id: "11111111-1111-4111-8111-111111111111", name: "Diwali Kits", slug: "diwali-kits" },
  { id: "22222222-2222-4222-8222-222222222222", name: "Pens", slug: "pens" },
];
const ctx = { categories };

test("money cells accept rupee formatting and reject junk", () => {
  assert.deepEqual(parseCellText("basePrice", "₹1,499.50", ctx), { ok: true, value: 1499.5 });
  assert.deepEqual(parseCellText("basePrice", "Rs. 200", ctx), { ok: true, value: 200 });
  assert.deepEqual(parseCellText("compareAtPrice", "", ctx), { ok: true, value: null });
  assert.equal(parseCellText("basePrice", "12abc", ctx).ok, false);
  assert.equal(validateCell("basePrice", null), "Price is required");
  assert.equal(validateCell("basePrice", -1), "Must be 0 or more");
  assert.equal(validateCell("basePrice", 10.555), "Use at most 2 decimals");
  assert.equal(validateCell("basePrice", 19.99), null);
});

test("booleans, statuses and categories parse from spreadsheet words", () => {
  assert.deepEqual(parseCellText("isFeatured", "Yes", ctx), { ok: true, value: true });
  assert.deepEqual(parseCellText("isFeatured", "0", ctx), { ok: true, value: false });
  assert.equal(parseCellText("isFeatured", "maybe", ctx).ok, false);
  assert.deepEqual(parseCellText("status", "Active", ctx), { ok: true, value: "active" });
  assert.deepEqual(parseCellText("status", "inactive", ctx), { ok: true, value: "draft" });
  assert.deepEqual(parseCellText("categoryId", "diwali kits", ctx), { ok: true, value: categories[0].id });
  assert.deepEqual(parseCellText("categoryId", "pens", ctx), { ok: true, value: categories[1].id });
  assert.equal(parseCellText("categoryId", "Nope", ctx).ok, false);
});

test("MOQ must be a whole number of at least 1", () => {
  assert.equal(parseCellText("minOrderQuantity", "2.5", ctx).ok, false);
  assert.equal(validateCell("minOrderQuantity", 0), "Must be at least 1");
  assert.equal(validateCell("minOrderQuantity", 25), null);
});

test("text limits, SKU format and required name are enforced", () => {
  assert.match(validateCell("name", null) ?? "", /required/);
  assert.match(validateCell("name", "A") ?? "", /at least 2/);
  assert.equal(validateCell("sku", "GG-0001"), null);
  assert.match(validateCell("sku", "has space") ?? "", /no spaces/);
  assert.match(validateCell("seoDescription", "x".repeat(501)) ?? "", /Maximum 500/);
});

test("MRP must exceed the selling price", () => {
  assert.ok(validateRow({ basePrice: 500, compareAtPrice: 500 }).compareAtPrice);
  assert.deepEqual(validateRow({ basePrice: 500, compareAtPrice: 650 }), {});
  assert.deepEqual(validateRow({ basePrice: 500, compareAtPrice: null }), {});
});

test("specifications parse and the Material column edits only the exact label", () => {
  const parsed = parseCellText("specifications", "Material: Steel | Capacity: 500 ml", ctx);
  assert.deepEqual(parsed, { ok: true, value: [{ label: "Material", value: "Steel" }, { label: "Capacity", value: "500 ml" }] });
  assert.equal(parseCellText("specifications", "no colon here", ctx).ok, false);

  const specs = [{ label: "Material (bottle)", value: "Glass" }, { label: "Finish", value: "Matte" }];
  assert.equal(specValue(specs, "Material"), null);
  const added = applySpecOverrides(specs, { material: "Steel" });
  assert.deepEqual(added.at(-1), { label: "Material", value: "Steel" });
  assert.deepEqual(added[0], { label: "Material (bottle)", value: "Glass" }, "near-miss labels are untouched");
  assert.deepEqual(applySpecOverrides(added, { material: "" }), specs, "blank removes the exact row only");
});

test("editor text is line based so a | inside a value survives", () => {
  const value = [{ label: "Size", value: "A5 | 200 pages" }];
  const text = editorText("specifications", value, ctx);
  assert.deepEqual(parseCellText("specifications", text, ctx, { linesOnly: true }), { ok: true, value });
});

test("draft overlays match what the server will write", async () => {
  const { effectiveValue } = await import("../lib/admin/products/grid-schema.ts");
  const row = {
    id: "r1",
    version: 1,
    images: [{ id: "a", url: "/a.png", alt: "First" }, { id: "b", url: "/b.png", alt: "Second" }],
    values: { specifications: [{ label: "Finish", value: "Matte" }], material: null, imageAlt: "First", name: "Pen" },
  } as never;
  assert.deepEqual(effectiveValue(row, { material: "Brass" }, "specifications"), [{ label: "Finish", value: "Matte" }, { label: "Material", value: "Brass" }]);
  assert.equal(effectiveValue(row, { specifications: [{ label: "Material", value: "Steel" }] }, "material"), "Steel");
  assert.equal(effectiveValue(row, { primaryImageId: "b" }, "imageAlt"), "Second");
  assert.equal(effectiveValue(row, { primaryImageId: "b", imageAlt: "New" }, "imageAlt"), "New");
  assert.equal(effectiveValue(row, undefined, "name"), "Pen");
});

test("clipboard round-trips Excel TSV including quoted multi-line cells", () => {
  const block = [["Pen", "Line one\nline two", 'He said "hi"'], ["Mug", "", "x"]];
  assert.deepEqual(parseClipboard(toClipboard(block)), block);
  assert.deepEqual(parseClipboard("a\tb\r\nc\td\r\n"), [["a", "b"], ["c", "d"]]);
});

test("copy text re-parses to the same value", () => {
  for (const [key, value] of [["isFeatured", true], ["status", "archived"], ["categoryId", categories[1].id], ["basePrice", 99.5]] as const) {
    const text = formatCellText(key, value, ctx);
    assert.deepEqual(parseCellText(key, text, ctx), { ok: true, value });
  }
});

test("exports neutralise spreadsheet formulas and imports restore them", () => {
  assert.equal(neutralizeFormula("=HYPERLINK(\"x\")"), "'=HYPERLINK(\"x\")");
  assert.equal(neutralizeFormula("+91 98"), "'+91 98");
  assert.equal(neutralizeFormula("Normal"), "Normal");
  assert.equal(restoreFormulaText("'=SUM(A1)"), "=SUM(A1)");
  assert.equal(restoreFormulaText("'quoted"), "'quoted");
  assert.equal(toCsv([["a,b", "=1+1", 5]]), '﻿"a,b",\'=1+1,5');
});

const product: BulkSnapshot = {
  id: "33333333-3333-4333-8333-333333333333",
  name: "Steel Bottle",
  productCode: "DRK-0001",
  categoryId: categories[0].id,
  categoryName: "Diwali Kits",
  basePrice: 1000,
  compareAtPrice: 1200,
  maxTierPrice: 900,
  minOrderQuantity: 10,
  status: "active",
  isFeatured: false,
  isCustomizable: true,
  description: "Short",
  longDescription: null,
  seoDescription: null,
  specifications: [{ label: "Material", value: "Steel" }],
  images: [{ id: "img-1", alt: null }, { id: "img-2", alt: "Existing" }],
  orderCount: 0,
};
const bulkCtx = { categoryNames: new Map(categories.map((category) => [category.id, category.name])) };

test("bulk price changes respect tier prices and MRP", () => {
  const up = computeBulkChange({ type: "adjust_price", percent: 10, rounding: "rupee" }, product, bulkCtx);
  assert.equal(up.kind, "patch");
  if (up.kind === "patch") assert.equal(up.patch.basePrice, 1100);
  const pastMrp = computeBulkChange({ type: "adjust_price", percent: 25, rounding: "rupee" }, product, bulkCtx);
  assert.equal(pastMrp.kind, "skip", "₹1250 would no longer be below the ₹1200 MRP");
  const lower = computeBulkChange({ type: "adjust_price", percent: -5, rounding: "none" }, product, bulkCtx);
  assert.equal(lower.kind, "patch");
  if (lower.kind === "patch") assert.equal(lower.patch.basePrice, 950);
  const belowTier = computeBulkChange({ type: "set_price", price: 900 }, product, bulkCtx);
  assert.equal(belowTier.kind, "skip");
  const same = computeBulkChange({ type: "set_price", price: 1000 }, product, bulkCtx);
  assert.equal(same.kind, "noop");
});

test("bulk text fill-empty never overwrites existing content", () => {
  const keep = computeBulkChange({ type: "set_text", field: "description", text: "New", mode: "fill-empty" }, product, bulkCtx);
  assert.equal(keep.kind, "noop");
  const fill = computeBulkChange({ type: "set_text", field: "seoDescription", text: "Buy {name} in {category}", mode: "fill-empty" }, product, bulkCtx);
  assert.equal(fill.kind, "patch");
  if (fill.kind === "patch") assert.equal(fill.patch.seoDescription, "Buy Steel Bottle in Diwali Kits");
});

test("bulk spec and alt-text operations touch only what they should", () => {
  const colour = computeBulkChange({ type: "set_spec", label: "Colour", value: "Black", mode: "replace" }, product, bulkCtx);
  assert.equal(colour.kind, "patch");
  if (colour.kind === "patch") assert.deepEqual(colour.patch.specifications, [{ label: "Material", value: "Steel" }, { label: "Colour", value: "Black" }]);
  const alt = computeBulkChange({ type: "set_alt_text", template: "{name} image {n}", mode: "fill-empty" }, product, bulkCtx);
  assert.equal(alt.kind, "patch");
  if (alt.kind === "patch") assert.deepEqual(alt.imageAlts, [{ id: "img-1", alt: "Steel Bottle image 1" }]);
  assert.equal(fillTemplate("{code} — {name}", product), "DRK-0001 — Steel Bottle");
});

test("products with orders are never deleted; uncategorised ones cannot be duplicated", () => {
  assert.equal(computeBulkChange({ type: "delete", confirmText: "DELETE" }, { ...product, orderCount: 2 }, bulkCtx).kind, "skip");
  assert.equal(computeBulkChange({ type: "delete", confirmText: "DELETE" }, product, bulkCtx).kind, "delete");
  assert.equal(computeBulkChange({ type: "duplicate" }, { ...product, categoryId: null }, bulkCtx).kind, "skip");
});

test("only super admins can hard-delete products or manage users", () => {
  assert.equal(roleCan("super_admin", "products.delete"), true);
  assert.equal(roleCan("admin", "products.delete"), false);
  assert.equal(roleCan("admin", "users.manage"), false);
  assert.equal(roleCan("admin", "products.bulk"), true);
  assert.equal(roleCan(null, "products.view"), false);
});
