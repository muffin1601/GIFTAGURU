# September exclusion URL investigation

The saved Search Console Page Indexing export dated 4 September 2026 contains 43 "Crawled - currently not indexed" URL rows. A live fetch on 7 November found 13 intentionally nonindexable or non-HTML URLs (eight legacy /guides redirects, one noindex tracking page, and four assets). The remaining 30 are live, self-canonical, indexable HTML pages in the production sitemap. They had visible main content and at least one discovered incoming link in this sitemap-page crawl. Their current Google status and Google-selected canonical are **unknown**.

No URL has been classified as currently excluded merely because it appeared in the September export. No technical cause for the 30 eligible URLs was proven. The most plausible remaining areas to assess are Google crawl timing, page distinctiveness, and search value; these require fresh URL Inspection and query/page data. PREVIOUSLY_EXCLUDED_URLS.csv records the evidence and next action for every row.
