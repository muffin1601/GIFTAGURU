"use client";

import { useActionState, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { applyPriceFileAction } from "@/lib/actions/catalog";

type Product = { productCode: string; name: string; currentPrice: number };
type Row = { productCode: string; newPrice: string | number };
type Result = { error?: string; success?: string; totalRows?: number; updated?: number; unchanged?: number; failed?: number; notFound?: number; report?: Array<{ productCode: string; status: string }> };

const normalize = (value: unknown) => String(value ?? "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
const parsePrice = (value: string | number) => /^\d+(?:\.\d{1,2})?$/.test(String(value).trim().replace(/[₹,$\s]/g, "").replace(/,/g, ""));

export default function BulkPriceUpdate({ products }: { products: Product[] }) {
  const [headers, setHeaders] = useState<string[]>([]);
  const [sourceRows, setSourceRows] = useState<unknown[][]>([]);
  const [codeColumn, setCodeColumn] = useState(0);
  const [priceColumn, setPriceColumn] = useState(1);
  const [state, action, pending] = useActionState<Result, FormData>(applyPriceFileAction, {});
  const byCode = useMemo(() => new Map(products.map((product) => [product.productCode, product])), [products]);
  const rows: Row[] = sourceRows.map((row) => ({ productCode: String(row[codeColumn] ?? "").trim(), newPrice: row[priceColumn] as string | number }));
  const seen = new Set<string>();
  const preview = rows.map((row) => {
    const duplicate = row.productCode && seen.has(row.productCode); if (row.productCode) seen.add(row.productCode);
    const product = byCode.get(row.productCode);
    const status = !row.productCode ? "Product Code is missing" : duplicate ? "Duplicate Product Code in file" : !product ? "Product code not found" : !parsePrice(row.newPrice) ? "Invalid price" : Number(String(row.newPrice).replace(/[₹,$\s]/g, "").replace(/,/g, "")) === product.currentPrice ? "No change" : "Ready to update";
    return { ...row, product, status };
  });
  const canApply = preview.some((row) => row.status === "Ready to update");

  function chooseFile(file?: File) {
    if (!file) return;
    if (!/\.(csv|xlsx|xls)$/i.test(file.name) || file.size > 5 * 1024 * 1024) { setHeaders([]); setSourceRows([]); return; }
    void file.arrayBuffer().then((buffer) => {
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const values = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "" });
      const [head = [], ...body] = values;
      const labels = head.map((value) => String(value));
      setHeaders(labels); setSourceRows(body.filter((row) => row.some((value) => String(value).trim())));
      const normalized = labels.map(normalize);
      setCodeColumn(Math.max(0, normalized.findIndex((value) => ["productcode", "sku"].includes(value))));
      setPriceColumn(Math.max(0, normalized.findIndex((value) => ["newprice", "price", "baseprice"].includes(value))));
    });
  }

  function downloadTemplate() {
    const blob = new Blob(["Product Code,New Price\nGG-SET-06-STD,2499\n"], { type: "text/csv" });
    const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = "price-update-template.csv"; anchor.click(); URL.revokeObjectURL(url);
  }

  return <div className="space-y-6">
    <div><p className="text-sm font-semibold uppercase tracking-wide text-gold-600">Catalog</p><h1 className="mt-2 font-display text-4xl text-navy-950">Bulk Price Update</h1></div>
    <section className="panel p-5 text-sm text-ink-700"><h2 className="font-display text-xl text-navy-950">How to update prices</h2><ol className="mt-3 list-inside list-decimal space-y-1"><li>Download the sample price-update template.</li><li>Enter the Product Code exactly as shown in the Products list.</li><li>Enter the new price for each product.</li><li>Save as Excel or CSV, then upload it here.</li><li>Review the changes before clicking Update Prices.</li></ol><p className="mt-4 font-semibold text-navy-950">Only the price will be changed. Other product information will remain unchanged.</p><p className="mt-1">Product Codes must match exactly. Unknown codes are shown in the review and skipped.</p><button type="button" onClick={downloadTemplate} className="btn btn-secondary mt-4">Download Template</button></section>
    <section className="panel p-5"><label className="block border-2 border-dashed border-line p-8 text-center text-sm text-ink-600"><span className="block font-semibold text-navy-950">Upload your price file</span><span className="mt-1 block">Choose a CSV, XLSX, or XLS file (up to 5 MB).</span><input type="file" accept=".csv,.xlsx,.xls" onChange={(event) => chooseFile(event.target.files?.[0])} className="mt-4 text-sm" /></label></section>
    {headers.length ? <section className="panel p-5"><h2 className="font-display text-xl text-navy-950">Review Price Changes</h2><p className="mt-1 text-sm text-ink-600">Check the columns and every row before updating prices.</p><div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-sm">Product Code column<select value={codeColumn} onChange={(event) => setCodeColumn(Number(event.target.value))} className="field-input mt-1">{headers.map((header, index) => <option key={`${header}-${index}`} value={index}>{header || `Column ${index + 1}`}</option>)}</select></label><label className="text-sm">New Price column<select value={priceColumn} onChange={(event) => setPriceColumn(Number(event.target.value))} className="field-input mt-1">{headers.map((header, index) => <option key={`${header}-${index}`} value={index}>{header || `Column ${index + 1}`}</option>)}</select></label></div><form action={action} className="mt-5"><input type="hidden" name="rows" value={JSON.stringify(rows)} /><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-sunken text-xs uppercase text-ink-600"><tr><th className="p-3">Product Code</th><th className="p-3">Product Name</th><th className="p-3">Current Price</th><th className="p-3">New Price</th><th className="p-3">Status</th></tr></thead><tbody className="divide-y divide-line">{preview.map((row, index) => <tr key={index}><td className="p-3">{row.productCode || "—"}</td><td className="p-3">{row.product?.name ?? "—"}</td><td className="p-3">{row.product ? `₹${row.product.currentPrice}` : "—"}</td><td className="p-3">{row.newPrice}</td><td className="p-3">{row.status}</td></tr>)}</tbody></table></div>{state.error ? <p className="field-error mt-4">{state.error}</p> : null}{state.success ? <div className="mt-4 text-sm text-navy-950"><p>{state.success}</p><p>Total rows: {state.totalRows} · Updated: {state.updated} · Unchanged: {state.unchanged} · Failed: {state.failed} · Not found: {state.notFound}</p></div> : null}<button type="submit" disabled={pending || !canApply} className="btn btn-primary mt-5">{pending ? "Updating Prices…" : "Update Prices"}</button></form></section> : null}
  </div>;
}
