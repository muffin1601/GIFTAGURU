import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const out = path.join(root, "reports/seo/production-verification");
const data = JSON.parse(fs.readFileSync(path.join(out, "crawl-data.json"), "utf8"));
const pages = data.rows.filter((row) => row["In production sitemap"] && row["HTTP status"] === 200);
const targets = new Map();
for (const page of pages) for (const link of new Set(page.links)) targets.set(link, [...(targets.get(link) ?? []), page.Path]);
const existing = new Map(data.rows.map((row) => [row.Path, row]));
const queue = [...targets];
const rows = [];
async function worker() {
  while (queue.length) {
    const [pathname, sources] = queue.shift();
    const known = existing.get(pathname);
    let status = known?.["HTTP status"];
    let redirect = known?.Redirect ?? "";
    if (status === undefined) {
      try {
        const response = await fetch(`https://www.giftaguru.com${pathname}`, { redirect: "manual", signal: AbortSignal.timeout(25000) });
        status = response.status;
        redirect = response.headers.get("location") ?? "";
      } catch (error) { status = "FETCH_ERROR"; redirect = String(error); }
    }
    rows.push({ Target: pathname, "HTTP status": status, Redirect: redirect, "Source page count": sources.length, "Source pages": sources.join(" | ") });
  }
}
await Promise.all(Array.from({ length: 8 }, worker));
rows.sort((a, b) => a.Target.localeCompare(b.Target));
const columns = Object.keys(rows[0]);
const cell = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
fs.writeFileSync(path.join(out, "INTERNAL_LINK_TARGETS.csv"), [columns.map(cell).join(","), ...rows.map((row) => columns.map((key) => cell(row[key])).join(","))].join("\n") + "\n");
console.log(JSON.stringify({ targets: rows.length, broken: rows.filter((row) => Number(row["HTTP status"]) >= 400 || row["HTTP status"] === "FETCH_ERROR").map((row) => [row.Target, row["HTTP status"], row["Source page count"]]), redirects: rows.filter((row) => Number(row["HTTP status"]) >= 300 && Number(row["HTTP status"]) < 400).map((row) => [row.Target, row["HTTP status"]]) }));
