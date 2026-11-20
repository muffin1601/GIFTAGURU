import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const out = path.join(root, "reports/seo/production-verification");
const data = JSON.parse(fs.readFileSync(path.join(out, "crawl-data.json"), "utf8"));
const book = XLSX.readFile(path.join(root, "not indexed/Table.csv"));
const rows = XLSX.utils.sheet_to_json(book.Sheets[book.SheetNames[0]], { defval: "" });
const eligible = rows.map((row) => data.rows.find((item) => item.URL === row.URL.trim().replaceAll(/\s+/g, " "))).filter((row) => row?.["HTTP status"] === 200 && row["In production sitemap"]);
const queue = [...eligible];
const pages = [];
async function worker() {
  while (queue.length) {
    const row = queue.shift();
    const response = await fetch(row.URL, { signal: AbortSignal.timeout(25000) });
    const html = await response.text();
    const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? "";
    const text = main.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&[a-z]+;|&#\d+;/gi, " ").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    const tokens = text.split(/\s+/).filter(Boolean);
    const shingles = new Set();
    for (let i = 0; i <= tokens.length - 5; i++) shingles.add(tokens.slice(i, i + 5).join(" "));
    pages.push({ URL: row.URL, words: tokens.length, shingles });
  }
}
await Promise.all(Array.from({ length: 6 }, worker));
const pairs = [];
for (let i = 0; i < pages.length; i++) for (let j = i + 1; j < pages.length; j++) {
  const a = pages[i], b = pages[j];
  let common = 0;
  for (const shingle of a.shingles) if (b.shingles.has(shingle)) common++;
  const overlap = common / Math.max(1, Math.min(a.shingles.size, b.shingles.size));
  pairs.push({ "URL A": a.URL, "URL B": b.URL, "Shared 5-gram fraction of smaller page": overlap.toFixed(3), "A words": a.words, "B words": b.words });
}
pairs.sort((a, b) => Number(b["Shared 5-gram fraction of smaller page"]) - Number(a["Shared 5-gram fraction of smaller page"]));
const cell = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
const columns = Object.keys(pairs[0]);
fs.writeFileSync(path.join(out, "CONTENT_SIMILARITY.csv"), [columns.map(cell).join(","), ...pairs.map((row) => columns.map((key) => cell(row[key])).join(","))].join("\n") + "\n");
console.log(JSON.stringify({ eligiblePages: pages.length, pairCount: pairs.length, topPairs: pairs.slice(0, 5) }));
