# Google Search Console performance analysis

As of 21 October 2026. The export filter says “Last 3 months,” but the daily data actually covers 2026-08-31 through 2026-10-18 (49 days). Search Console query/page tables are subject to privacy thresholds and aggregation differences; their sums are not forced to match.

## Site totals

- Clicks: **40**
- Impressions: **951**
- Weighted CTR: **4.21%**
- Impression-weighted average position: **15.20**

| Export dimension | Clicks | Impressions | CTR | Weighted position |
| --- | ---: | ---: | ---: | ---: |
| Daily chart | 40 | 951 | 4.21% | 15.20 |
| Countries | 40 | 951 | 4.21% | 15.20 |
| Devices | 40 | 951 | 4.21% | 15.20 |
| Pages | 40 | 1159 | 3.45% | 15.70 |
| Visible queries | 11 | 435 | 2.53% | 20.10 |

## Branded versus non-branded disclosed queries

Brand rule: normalized query contains “gift guru”, “giftguru” or “gifta guru”. Ambiguous variants such as “gifting guru” are not counted as brand.

| Segment | Queries | Clicks | Impressions | CTR | Weighted position |
| --- | ---: | ---: | ---: | ---: | ---: |
| Branded | 6 | 11 | 220 | 5.00% | 5.17 |
| Non-branded | 79 | 0 | 215 | 0.00% | 35.39 |

All 11 disclosed-query clicks are branded. The query table exposes only 11 of 40 total clicks, so this does **not** prove zero sitewide non-brand clicks.

## Priority pages

| Page | Clicks | Impressions | CTR | Position | Assessment |
| --- | ---: | ---: | ---: | ---: | --- |
| /corporate-gifting | 1 | 56 | 1.79% | 48.61 | Directional opportunity; modest sample |
| /categories/luxury-gifts | 1 | 42 | 2.38% | 42.62 | Directional opportunity; modest sample |
| /categories/premium-gifts | 1 | 28 | 3.57% | 44.11 | Directional opportunity; modest sample |
| /categories/joining-gifts | 0 | 12 | 0.00% | 29.08 | Directional opportunity; modest sample |
| /gifting/employee-onboarding | 0 | 10 | 0.00% | 33.90 | Directional opportunity; modest sample |

The cited baselines are genuine but small (10–56 impressions each). Treat them as prioritization signals, not stable rank estimates. “delegate kit” has 14 impressions at position 22.71.

## Devices

| Device | Clicks | Impressions | CTR | Position |
| --- | ---: | ---: | ---: | ---: |
| Desktop | 20 | 486 | 4.12% | 21.97 |
| Mobile | 20 | 457 | 4.38% | 8.17 |
| Tablet | 0 | 8 | 0.00% | 5.38 |

Mobile ranks 13.80 positions better than desktop while CTR differs by only 0.26 percentage points. The export has no query-by-device or page-by-device detail, so query mix is a plausible confounder and a technical mobile/desktop problem is unverified.

## Countries and search appearance

| Country | Clicks | Impressions | CTR | Position |
| --- | ---: | ---: | ---: | ---: |
| India | 34 | 597 | 5.70% | 15.92 |
| United States | 3 | 147 | 2.04% | 21.32 |
| United Kingdom | 1 | 30 | 3.33% | 8.43 |
| Kenya | 1 | 1 | 100.00% | 1.00 |
| Croatia | 1 | 1 | 100.00% | 3.00 |
| Philippines | 0 | 14 | 0.00% | 6.36 |
| United Arab Emirates | 0 | 10 | 0.00% | 6.50 |
| Brazil | 0 | 10 | 0.00% | 13.00 |
| South Africa | 0 | 10 | 0.00% | 19.10 |
| Canada | 0 | 8 | 0.00% | 9.38 |

Product snippets: 31 impressions, 0 clicks, position 33.39. Presence is verified; rich-result eligibility and enhancement are not.

## Observed period movement

| Period | Clicks | Impressions | CTR | Position |
| --- | ---: | ---: | ---: | ---: |
| First 24 days | 24 | 526 | 4.56% | 11.42 |
| Last 25 days | 16 | 425 | 3.76% | 19.89 |

Clicks fell -33.3%, impressions -19.2%, and weighted position worsened 8.47 positions. This is an observed comparison, not a causal conclusion.

## Opportunity definitions and limitations

- Quick win: non-brand position 4–20.
- Opportunity: non-brand position 21–50.
- Low-CTR review: at least five impressions and CTR at or below 2%.
- The complete 85-query table is in GSC_OPPORTUNITIES.csv.
- Cannibalization is **unverified** because the supplied export separates Queries and Pages. A query-by-page export or Search Console API pull is required.
- Search Console impressions are not keyword search volume. No volume, difficulty or ranking outcome has been invented.
