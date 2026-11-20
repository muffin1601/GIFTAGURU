# Production sitemap and robots verification

- Production robots.txt: HTTP 200; allows product/category paths, disallows admin/account/API paths, and advertises https://www.giftaguru.com/sitemap.xml.
- Production sitemap.xml: HTTP 200; valid XML urlset with 99 unique HTTPS www URLs.
- Sitemap URL outcomes: 93 direct 200, 6 direct 308, zero 403/404/5xx. All six 308 targets returned 200 in one subsequent hop.
- Local post-fix sitemap: 93 URLs, all 200. The six extra production URLs show the sitemap fix has not been deployed.

Redirecting sitemap entries that must be removed after deployment:
- https://www.giftaguru.com/categories/client-gifts → /gifting/client-appreciation
- https://www.giftaguru.com/categories/corporate-gifts → /corporate-gifting
- https://www.giftaguru.com/categories/employee-appreciation-gifts → /gifting/employee-appreciation
- https://www.giftaguru.com/categories/employee-welcome-kits → /categories/joining-gifts
- https://www.giftaguru.com/categories/festive-corporate-gifts → /occasions/festive-corporate-gifting
- https://www.giftaguru.com/categories/gift-sets-hampers → /gift-sets

The sitemap is below the protocol limits for a single file. No sitemap split is needed. The production sitemap submission state in Search Console is unavailable.
