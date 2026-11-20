# Search Console checks required

No authenticated Search Console connection was available for this run. The following checks require authorized property access:

1. Confirm the property covers `https://www.giftaguru.com/` and export current Page Indexing counts by reason. Compare with the 4 September 2026 export's 34 indexed and 43 crawled, currently not indexed URL rows. Record the export date and whether the property is URL-prefix or domain-wide.
2. Export the current URL list for each relevant issue type. Do not treat all 43 historical rows as currently excluded; compare by exact URL, including query strings.
3. Use URL Inspection on representative eligible product, category, industry, gifting and occasion pages from `PREVIOUSLY_EXCLUDED_URLS.csv`. Record indexed verdict, last crawl, user-declared canonical, Google-selected canonical, crawl result, referring page and rendered HTML/screenshot where provided.
4. Inspect the eight `/guides` redirects, the `noindex` order-tracking URL and four asset rows separately. Confirm Google treats them as redirects, exclusions or non-HTML resources rather than requesting indexing.
5. After deployment, inspect Sitemaps for `https://www.giftaguru.com/sitemap.xml`: last read, discovered URL count, errors, and whether the six retired category URLs disappeared. Submit the updated sitemap once if the processed version remains stale.
6. Initiate “Validate fix” only for an applicable issue type whose underlying defect is confirmed corrected. “Crawled – currently not indexed” alone does not establish a technical error with a validation workflow.
7. Export Search Performance for current and preceding equal 28-day and 90-day windows, including query, page, device and country dimensions. Export GA4 organic landing-page metrics if available; do not combine differently sampled totals without labeling them.
