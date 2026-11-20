import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const out = path.join(root, "reports/seo/production-verification");
fs.mkdirSync(out, { recursive: true });
const origin = "https://www.giftaguru.com";
const readCsv = (name) => XLSX.utils.sheet_to_json(XLSX.readFile(path.join(root, name)).Sheets.Sheet1, { defval: "" });
const gscExcluded = readCsv("not indexed/Table.csv");
const localRows = readCsv("reports/seo/LOCAL_URL_AUDIT.csv");
const localPaths = new Set(localRows.map((row) => new URL(row.URL).pathname));
const response = async (url) => {
  try {
    const r = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(25000), headers: { "user-agent": "GiftaGuru-SEO-Verification/1.0" } });
    return { status: r.status, location: r.headers.get("location") ?? "", contentType: r.headers.get("content-type") ?? "", body: await r.text() };
  } catch (error) {
    return { status: "FETCH_ERROR", location: "", contentType: "", body: "", error: String(error) };
  }
};
const [robotsResult, sitemapResult] = await Promise.all([response(`${origin}/robots.txt`), response(`${origin}/sitemap.xml`)]);
if (sitemapResult.status !== 200) throw new Error(`Production sitemap returned ${sitemapResult.status}`);
const sitemapUrls = [...sitemapResult.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replaceAll("&amp;", "&"));
const sitemapPaths = new Set(sitemapUrls.map((url) => new URL(url).pathname));
const urls = [...new Set([...sitemapUrls, ...gscExcluded.map((row) => row.URL.trim().replaceAll(/\s+/g, " "))])];
const decode = (text) => text.replaceAll("&amp;", "&").replaceAll("&quot;", '"').replaceAll("&#39;", "'").replaceAll("&lt;", "<").replaceAll("&gt;", ">");
const attr = (tag, name) => tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, "i"))?.[1] ?? "";
const findTag = (html, tagName, predicate) => [...html.matchAll(new RegExp(`<${tagName}\\b[^>]*>`, "gi"))].map((m) => m[0]).find(predicate) ?? "";
const stripped = (html) => decode(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
const queue = [...urls];
const rows = [];
async function worker() {
  while (queue.length) {
    const url = queue.shift();
    const r = await response(url);
    const html = r.contentType.includes("text/html") ? r.body : "";
    const canonical = decode(attr(findTag(html, "link", (tag) => attr(tag, "rel").toLowerCase() === "canonical"), "href"));
    const robots = attr(findTag(html, "meta", (tag) => attr(tag, "name").toLowerCase() === "robots"), "content");
    const description = decode(attr(findTag(html, "meta", (tag) => attr(tag, "name").toLowerCase() === "description"), "content"));
    const title = decode(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "");
    const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => stripped(m[1]));
    const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? "";
    const text = stripped(main);
    const words = text.split(/\s+/).filter(Boolean).length;
    const links = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi)].map((m) => decode(m[1])).flatMap((href) => {
      try { const target = new URL(href, url); return target.hostname === "www.giftaguru.com" ? [target.pathname] : []; } catch { return []; }
    });
    const scripts = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
    let jsonLdErrors = 0;
    let productSchema = false;
    for (const [, value] of scripts) {
      try { const data = JSON.parse(value); productSchema ||= JSON.stringify(data).includes('"@type":"Product"'); } catch { jsonLdErrors++; }
    }
    const pathname = new URL(url).pathname;
    rows.push({ URL: url, Path: pathname, "HTTP status": r.status, Redirect: r.location, "Content type": r.contentType, "In production sitemap": sitemapPaths.has(pathname), "In local sitemap": localPaths.has(pathname), Canonical: canonical, "Robots meta": robots, Title: title, Description: description, "H1 count": h1s.length, H1: h1s.join(" | "), "Main words": words, "Internal links": links.length, "Product JSON-LD": productSchema, "JSON-LD parse errors": jsonLdErrors, "Potential soft 404": r.status === 200 && (/not found|no products in this collection yet/i.test(h1s.join(" ") + " " + text.slice(0, 500)) || words < 45), Error: r.error ?? "", links });
  }
}
await Promise.all(Array.from({ length: 8 }, worker));
rows.sort((a, b) => a.URL.localeCompare(b.URL));
const incoming = new Map();
for (const row of rows) for (const link of new Set(row.links)) incoming.set(link, (incoming.get(link) ?? 0) + 1);
for (const row of rows) row["Incoming crawled pages"] = incoming.get(row.Path) ?? 0;
const columns = Object.keys(rows[0]).filter((key) => key !== "links");
const cell = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
fs.writeFileSync(path.join(out, "PRODUCTION_URL_CRAWL.csv"), [columns.map(cell).join(","), ...rows.map((row) => columns.map((key) => cell(row[key])).join(","))].join("\n") + "\n");
fs.writeFileSync(path.join(out, "crawl-data.json"), JSON.stringify({ origin, checkedAt: new Date().toISOString(), robots: robotsResult, sitemap: { status: sitemapResult.status, urlCount: sitemapUrls.length, urls: sitemapUrls }, rows }, null, 2));
console.log(JSON.stringify({ checkedAt: new Date().toISOString(), sitemapCount: sitemapUrls.length, totalFetched: rows.length, statuses: Object.fromEntries([...new Set(rows.map((r) => r["HTTP status"]))].map((status) => [status, rows.filter((r) => r["HTTP status"] === status).length])), sitemapRedirects: rows.filter((r) => r["In production sitemap"] && Number(r["HTTP status"]) >= 300 && Number(r["HTTP status"]) < 400).map((r) => r.URL), robotsStatus: robotsResult.status }));
