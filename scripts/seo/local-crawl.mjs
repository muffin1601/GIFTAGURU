import fs from "node:fs";

const origin = process.argv[2] ?? "http://localhost:3000";
const out = new URL("../../reports/seo/LOCAL_URL_AUDIT.csv", import.meta.url);
const sitemapResponse = await fetch(`${origin}/sitemap.xml`);
if (!sitemapResponse.ok) throw new Error(`sitemap.xml returned ${sitemapResponse.status}`);
const xml = await sitemapResponse.text();
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].replaceAll("&amp;", "&"));
if (!urls.length) throw new Error("No sitemap URLs found");

const rows = [];
for (const url of urls) {
  const path = new URL(url).pathname;
  const response = await fetch(`${origin}${path}`, { redirect: "manual" });
  const html = await response.text();
  const canonical = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/i)?.[1] ?? "";
  const title = html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? "";
  const h1Count = [...html.matchAll(/<h1\b/gi)].length;
  const noindex = /<meta[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(html);
  rows.push({ URL: url, "Local HTTP status": response.status, Canonical: canonical, "H1 count": h1Count, Noindex: noindex, Title: title,
    Issue: response.status !== 200 ? `HTTP ${response.status}` : noindex ? "Sitemap URL is noindex" : !canonical ? "Missing canonical" : new URL(canonical).pathname !== path ? "Non-self canonical" : h1Count !== 1 ? `H1 count ${h1Count}` : "" });
}

const columns = Object.keys(rows[0]);
const cell = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
fs.writeFileSync(out, [columns.map(cell).join(","), ...rows.map((row) => columns.map((key) => cell(row[key])).join(","))].join("\n") + "\n");
console.log(JSON.stringify({ sitemapUrls: urls.length, status200: rows.filter((r) => r["Local HTTP status"] === 200).length, issues: rows.filter((r) => r.Issue).map((r) => ({ url: r.URL, issue: r.Issue })), output: out.pathname }));
