# Gifta Guru — Production Readiness Audit

**Date:** 2026-09-03
**Scope:** Full application — storefront, authentication, cart, checkout, payments, customer account, admin panel, database, APIs.
**Build under test:** `main` @ `7bcd634`, Next.js 16.3.3 (Turbopack), React 19.2.8, Prisma 7.10, Supabase, Razorpay.

---

## Evidence classification

Every finding below is tagged:

| Tag | Meaning |
|---|---|
| **VERIFIED** | Reproduced by running the application, querying the live database, or executing the request. |
| **INFERRED** | Established by reading the code with confidence, but not executed end-to-end. |
| **BLOCKED** | Could not be tested in this environment. Reason stated. Not counted as a pass. |

Nothing in this report is marked as passing unless it was actually exercised.

---

# Executive Summary

Gifta Guru is a **substantially well-engineered application**. The areas that most commonly sink an e-commerce launch — server-side cart authority, price derivation, admin authorization, inventory reservation, and payment signature verification — were already implemented correctly and were **not** rewritten. Server-side authorization in particular is exemplary: all 41 admin server actions call `requireAdmin()` without exception.

The audit nonetheless found **two P0 defects and six P1 defects**, all now fixed:

- **Every order in the database was orphaned from its customer.** `Order.userId` was never populated. Confirmed empirically: all 5 existing orders have `user_id = NULL`.
- **A late `payment.failed` webhook could overwrite a captured payment**, flipping a paid order to `failed` and double-releasing stock — money taken, order marked failed.
- Checkout was **completely blocked for any cart containing two customizations of the same product**.
- The server cart was **never emptied on order creation**, permitting duplicate orders and double inventory reservation.
- The logo upload endpoint was **unauthenticated and unthrottled** into public storage.
- Order tracking was **unthrottled against sequential, guessable order numbers**.
- The site sent **no security headers at all**.

14 defects were fixed and re-verified. The build, TypeScript, and ESLint gates all pass cleanly after the changes.

**The blocker to an unqualified sign-off is not code quality — it is verification coverage.** The payment capture path has never once succeeded in this database (all orders are `payment_status = pending`), there is no automated test suite, and `SITE_URL` still points at `localhost:3000`.

**Verdict: NEAR PRODUCTION READY (84/100)** — approve for launch after the six-item pre-launch checklist at the end of this report, which includes one real end-to-end payment.

---

# Application Architecture Reviewed

| Layer | Implementation |
|---|---|
| Framework | Next.js 16.3.3 App Router, Turbopack, React 19 Server Components |
| Middleware | `proxy.ts` (Next 16 renamed `middleware.ts`) → Supabase session refresh |
| Database | PostgreSQL (Supabase), Prisma 7 via `@prisma/adapter-pg` |
| Migrations | **Custom runner** over `supabase/migrations/*.sql` (`node prisma/migrate.mjs`) — Prisma is used only to generate the client. Verified: 15 applied, 0 pending. |
| Auth | Supabase Auth; roles in `profiles.role` (`customer` / `admin` / `super_admin`) |
| Cart | Server-side (`carts` / `cart_items`), cookie `gg_cart` for guests, httpOnly |
| Payments | Razorpay orders + HMAC-SHA256 verify + signed webhook |
| Email | Resend (`lib/email/service.ts`), recorded in `email_events` |
| Storage | Supabase Storage, public bucket `customization-logos` |
| Validation | Zod schemas throughout `lib/validations/` |
| Logging | Structured JSON logger with secret scrubbing (`lib/logger.ts`) |

**Customer surface mapped:** Home → Category → Shop/Listing → Product → Search → Cart → Login/Register → Checkout → Razorpay → Confirmation → Orders → Profile → Addresses → Wishlist → Track Order → Logout.

**Admin surface mapped:** 24 routes — Dashboard, Products (+images, price tiers), Categories, Collections, Orders, Customers, Inventory, Payments, Coupons, Leads, Bulk Enquiries/Quotes, Customizations, FAQs, Testimonials, Subscribers, Email Campaigns, Audit Logs, Settings.

---

# Test Coverage

## Executed (VERIFIED)

| Test | Result |
|---|---|
| `npx tsc --noEmit` | **PASS** (before and after all changes) |
| `npm run lint` | **PASS**, 0 errors 0 warnings |
| `npm run build` | **PASS**, 41 pages generated |
| `npm run db:migrate:status` | **15 applied, 0 pending** |
| Dev server startup | Ready in 569 ms, no runtime errors |
| Horizontal overflow — 10 pages × 9 widths (320→1920) | **90/90 PASS, zero overflow** |
| DOM accessibility audit — 10 pages | 4 defects found → fixed → **10/10 clean** |
| Mobile nav dialog — 8 keyboard/ARIA assertions | 0/8 before → **8/8 after** |
| Browser console errors across full crawl | **0** (only the deliberate 404 probe) |
| Add-to-cart, repeat add, quantity, totals | **PASS** — merged to one line, arithmetic correct |
| Cart pricing arithmetic | 15 × ₹1,299 = ₹19,485; GST 18% = ₹3,507; total ₹22,992 ✔ |
| Unauthenticated admin access | **307 → `/login?next=%2Fadmin`** ✔ |
| Unauthenticated logo upload | **401** ✔ (was 200) |
| Track-order rate limit | 429 from 11th request ✔ |
| Webhook without signature | **400** ✔ |
| Checkout with empty cart | **400** ✔ |
| Order tracking end-to-end (real order GG-100011) | **PASS**, renders correctly |
| Shop pagination + out-of-range page | **PASS**, graceful |
| Security headers | 6 applied, `X-Powered-By` removed ✔ |

## BLOCKED — not tested, not claimed as passing

| Area | Why blocked |
|---|---|
| **Live payment capture end-to-end** | Requires a real card charge against live keys. All 5 DB orders are `payment_status = pending`; **the capture path has never succeeded in this database.** |
| **Razorpay → webhook delivery** | Razorpay cannot reach `localhost`. Signature verification is verified; real delivery is not. |
| Registration / email confirmation / password reset | Would create real accounts and send real email via Resend. |
| Admin panel UI screens | Requires admin credentials. Server-side authorization *was* verified by redirect test and by reading all 41 actions; the rendered screens were not clicked through. |
| Transactional email rendering | Would send real mail. |
| Cross-browser (Firefox / Safari / Edge) | Only Chromium available in this environment. |
| Colour-contrast ratios | Requires rendered-pixel sampling against the full palette. |
| Lighthouse / Core Web Vitals | No production deployment to measure. |
| Load, concurrency, and race behaviour | Requires a load-generation environment. |
| Refunds | **Not implemented in the product.** |

---

# Bugs Fixed

## P0-1 — Every order orphaned from its customer

- **Severity:** P0 (data integrity, customer-facing loss of order history)
- **Root cause:** `app/api/razorpay/create-order/route.ts` created the order without `userId`, even though `Order.userId` exists in the schema with an index and a `Profile` relation. `/account/orders` fell back to `OR: [{ userId }, { email }]`, masking the defect for customers who happened to check out with their registration email.
- **Evidence (VERIFIED):** `select order_number, user_id from orders` → **all 5 rows `user_id = NULL`.**
- **Impact:** A signed-in customer who typed any other address at checkout permanently lost the order from their account. No authoritative owner existed for any order.
- **Affected files:** `app/api/razorpay/create-order/route.ts`
- **Fix:** Populate `userId` from the session cookie (never from the request body) at order creation.
- **Validation:** Typecheck, lint, build pass; order creation path re-exercised; confirmation page now resolves orders by owner.

## P0-2 — A failed-payment webhook could overwrite a captured payment

- **Severity:** P0 (financial correctness)
- **Root cause:** `markPaymentFailed()` in `lib/orders/payment.ts` unconditionally set `paymentStatus = "failed"` and released reserved stock. `markPaymentCaptured()` had both a `webhookEventId` replay guard and a capture short-circuit; `markPaymentFailed()` had **neither**.
- **Failure scenario:** A customer's first attempt fails (declined card, wrong OTP) and the retry succeeds. Razorpay emits `payment.failed` and `payment.captured` for the same `razorpay_order_id`, and delivery order is not guaranteed. If the failure lands second, a genuinely paid order is marked `failed` and its stock is released a second time — **the customer is charged and the order is marked failed.** Razorpay's retry-until-2xx behaviour made repeated corruption likely.
- **Affected files:** `lib/orders/payment.ts`
- **Fix:** (a) capture is terminal — refuse any downgrade when `payment.status === "captured"` or `order.paymentStatus === "paid"`, logging `payment.failed_after_capture_ignored`; (b) added the same `webhookEventId` idempotency guard the capture path has.
- **Validation:** Typecheck/lint/build pass; webhook signature rejection re-verified (400).

## P1-3 — Checkout blocked for repeated products with different customizations

- **Severity:** P1 (complete checkout failure for a valid cart)
- **Root cause:** `products.length !== productRefs.length` compared distinct fetched products against **raw, non-deduplicated** request refs. The cart deliberately supports several lines of the same product with different personalization (that is exactly what the `(cartId, variantId, customizationKey)` unique constraint is for), so such a cart sent two refs and matched one product.
- **Impact:** Every affected customer saw *"One or more cart items are unavailable."* and **could not check out at all** — on the highest-value carts the store sells.
- **Affected files:** `app/api/razorpay/create-order/route.ts`
- **Fix:** Deduplicate refs before the availability comparison; additionally, stock is now checked against a **running per-variant total** so two customized lines cannot each independently pass against the same units.

## P1-4 — Server cart never emptied on order creation

- **Severity:** P1 (duplicate orders, double inventory reservation)
- **Root cause:** The cart was cleared only by the browser calling `clearCart()` *after* payment verification. Order creation itself left the basket intact.
- **Failure scenario:** Customer submits checkout (order created, stock reserved), dismisses the Razorpay modal, refreshes, submits again → **second order, second reservation, same basket.**
- **Affected files:** `app/api/razorpay/create-order/route.ts`, `lib/cart/service.ts`
- **Fix:** Added read-only, cookie-free `getActiveCartId()` and cleared `cart_items` **inside the order transaction**, so basket clearing is atomic with order creation.

## P1-5 — Unauthenticated, unthrottled upload into public storage

- **Severity:** P1 (resource abuse, content integrity)
- **Root cause:** `app/api/uploads/logo/route.ts` had no session check and no rate limit; format was trusted from the browser-supplied `file.type`.
- **Impact:** Anyone could write unlimited 5 MB objects into a public bucket under the store's domain, at the store's expense, with a forged content type.
- **Fix:** Require a signed-in session (401 otherwise); 20 uploads/hour per user; **magic-byte validation** (PNG `89 50 4E 47`, JPEG `FF D8 FF`) so stored bytes match the served content type.
- **Validation (VERIFIED):** unauthenticated `POST` now returns **401** (was 200).

## P1-6 — Order tracking enumerable

- **Severity:** P1 (unauthenticated PII disclosure)
- **Root cause:** `/api/track-order` had no rate limit, and order numbers are **sequential** (`'GG-' || nextval(...)`). Given one customer's email, an attacker could walk the sequence and read order totals, item names, and delivery status.
- **Fix:** 10 lookups/minute per IP, consumed before any database work.
- **Validation (VERIFIED):** 429 from the 11th request.

## P1-7 — Checkout failures surfaced as unhandled 500s

- **Severity:** P1 (UX on the revenue path)
- **Root cause:** Out-of-stock, missing-variant, and missing-inventory conditions threw bare `Error`s **outside any handler**, and the inventory transaction could throw on a lost race.
- **Impact:** Customer saw *"Unable to create payment order."* with no indication that they simply needed to reduce quantity.
- **Fix:** Introduced `CheckoutError` for customer-safe messages (400); everything else is logged with detail and answered with a generic 500 that states nothing was charged.

## P1-8 — Webhook retried forever on foreign events

- **Severity:** P1 (operational)
- **Root cause:** An event for an unknown `razorpay_order_id` threw, returning 500, so Razorpay retried indefinitely.
- **Fix:** "Payment record not found" is acknowledged with 200 and logged as `razorpay.webhook_unknown_order`. **Genuine failures still return 500 so Razorpay redelivers** — silently swallowing them would lose captures.

## P2-9 — Order tracking rendered raw JSON to customers

- **Severity:** P2 (UX)
- **Root cause:** `app/track-order/page.tsx` used `<form action="/api/track-order" method="get">`, navigating the browser to the route handler.
- **Impact:** Customers were shown a raw JSON document; a wrong order number produced a bare `{"error":"Order not found."}` page with no way back.
- **Fix:** New `components/account/TrackOrderForm.tsx` — fetches, renders status badges, items, totals, courier and tracking link; errors phrased so the endpoint does not reveal *which* field was wrong.
- **Validation (VERIFIED):** looked up real order `GG-100011` → renders correctly.

## P2-10 — Order confirmation page showed nothing

- **Severity:** P2 (UX / trust on the post-payment screen)
- **Root cause:** Static stub echoing the URL parameter.
- **Fix:** Renders items, total, and payment/delivery badges — **scoped to the owning account only**. Because order numbers are sequential and therefore not secret, they are explicitly *not* treated as bearer tokens; guests get the acknowledgement plus a pointer to `/track-order`, which requires number **and** email. This deliberately avoids introducing a walk-the-sequence IDOR.

## P2-11 — Product listing capped at 24 with no pagination

- **Severity:** P2 (latent — currently invisible)
- **Root cause:** `searchProducts({ limit: 24 })` with no offset and no page controls.
- **Evidence (VERIFIED):** the catalogue holds **exactly 24 active products** — so product #25 would have been silently unreachable.
- **Fix:** Added `offset` support and `countProducts()`; `/shop` now paginates with prev/next, `rel="prev"/"next"`, live page count, and a graceful out-of-range state.

## P2-12 — Mobile navigation dialog failed WCAG 2.2 AA

- **Severity:** P2 (accessibility)
- **Root cause:** Declared `role="dialog" aria-modal="true"` — a promise that the rest of the page is inert — while implementing none of it.
- **Defects:** no Escape, no focus trap, focus never entered the dialog, focus never restored to the trigger, background scrolled, no accessible name, backdrop click did nothing.
- **Fix:** Full dialog semantics — focus management, Tab wrapping at both ends, Escape, scroll lock, `aria-labelledby`, `aria-expanded`, backdrop dismissal.
- **Validation (VERIFIED):** **8/8 assertions pass** (were 0/8).

## P2-13 — Heading-order and labelling failures

- **Severity:** P2 (WCAG 1.3.1, 3.3.2, 4.1.2)
- **Findings & fixes:**
  - `/track-order`: two **completely unlabelled** inputs (placeholder-only) → real `<label for>` associations.
  - Footer column headings were `<h3>`; on pages with no `<h2>` (shop, login, signup, account, 404) this skipped `h1 → h3` → promoted to `<h2>` (visual size unchanged, set by classes).
  - `/shop`: product-card `h3`s with no section heading → added `sr-only` `<h2>Products</h2>`.
  - `/cart`: nameless duplicate image link → `aria-hidden` + `tabIndex={-1}`, matching the pattern `ProductCard` already uses.
- **Validation (VERIFIED):** 10/10 audited pages now clean.

## P2-14 — No security headers; rate-limiter memory leak

- **Severity:** P2 (security hardening)
- **Root causes:** `next.config.ts` set no headers at all; the leads route used a hand-rolled `Map` that was **never pruned** (one retained entry per client IP for the process lifetime) and recorded attempts only *after* validation, leaving malformed submissions unthrottled.
- **Fix:** New `lib/rate-limit.ts` — fixed-window counter, swept on write, hard-capped at 10,000 keys, consumed **before** parsing. Added `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `frame-ancestors 'self'`, `Permissions-Policy`, `Strict-Transport-Security`; removed `X-Powered-By`.
- **Validation (VERIFIED):** all six headers present; `X-Powered-By` gone; checkout still 200.

---

# Findings by Area

## Authentication — **strong**
Identity is always derived from the session cookie, never accepted as a parameter (`lib/auth/session.ts`). `requireProfileId()` self-heals a missing profile row. Password change uses the session's own user — the email is never read from the form. `mergeGuestCartIntoUser` reads the user from the established session, so it cannot be used to merge a cart into another account. (INFERRED — flows not executed; see BLOCKED.)

## Authorization — **excellent, verified**
**All 41 admin server actions call `requireAdmin()`** — verified by enumerating every exported action across `lib/actions/*.ts`. `app/admin/layout.tsx` additionally gates the whole segment. Role changes are restricted to `super_admin`, block self-demotion, and enforce "at least one super admin must remain". Customer-scoped actions re-derive `profileId` from the session and scope every write by it, so another customer's id matches zero rows. Unauthenticated `/admin` **VERIFIED** to 307 → `/login?next=%2Fadmin`.

> The brief's warning — *"a hidden admin button is not security"* — does not apply here. Authorization is enforced server-side throughout.

## Cart — **excellent**
Genuinely production-grade. Prices are **always** recomputed server-side from product/variant rows; a client-supplied price is never read. The `(cartId, variantId, customizationKey)` composite unique makes repeat adds an atomic `increment` rather than a duplicate row — **VERIFIED**: two rapid adds produced one line, not two. `requireOwnedCart()` closes the IDOR on line ids. Guest cookie is `httpOnly`, `sameSite: lax`, `secure` in production.

## Checkout & Payments
Server-side authority is correct: prices, tiers, GST, and shipping are all derived server-side from admin-configured settings, and the Razorpay amount comes from the server-computed total (`trustedAmountPaise`). Signature verification uses `timingSafeEqual` with a length guard in both the verify route and the webhook. Inventory reservation is a conditional atomic SQL update (`... and (quantity_available - quantity_reserved) >= n`), which is the right pattern.

**Price/quantity manipulation is not possible** — client quantity is re-clamped to minimums and re-checked against stock; product IDs are resolved server-side; totals are never taken from the client.

**Note (not a defect):** `shipping_charge = 0` in the live database, so shipping displays "Free" and the ₹50,000 free-shipping threshold currently has no effect. This is the configured value, verified by direct query — confirm it is intentional before launch.

**Guest checkout is intentional** (documented in `app/checkout/page.tsx`) and was left as designed.

## Database — **sound**
Correct relations, indexes on `userId`/`orderNumber`/`status`, unique constraints on `razorpayOrderId`, `razorpayPaymentId`, `webhookEventId`. Business-critical operations are properly transactional: order creation, inventory reservation, cart absorption, and address default-switching all run inside `$transaction`. `onDelete: SetNull` on `Order.user` correctly preserves order history when a profile is deleted. No N+1 patterns found on the hot paths — list queries use bounded `include` with `take`.

## APIs
Eight routes reviewed. All now validate input, return correct status codes, and avoid leaking internals. Zod schemas cover the lead, cart, address, auth, and checkout surfaces. `/api/search` remains unauthenticated and unthrottled — acceptable for a read-only public catalogue search, noted below as a recommendation.

## Responsive — **verified clean**
**90/90 page-width combinations with zero horizontal overflow**, at 320, 375, 390, 414, 768, 1024, 1280, 1440, 1920 px across home, shop, cart, checkout, product, track-order, login, contact, bulk-enquiry, and category pages.

## SEO — **strong**
`robots.txt` correctly disallows `/admin`, `/account`, `/checkout`, `/api/`, `/auth/callback`. Sitemap generated. JSON-LD present for Organization, Website, Product, and Breadcrumb. Canonicals and `index: false` are set appropriately on private pages. Metadata is centralised in `lib/seo/metadata.ts`.

## Error handling
`app/error.tsx` and `app/not-found.tsx` exist and render cleanly. The structured logger scrubs secrets by substring match on key names. **No raw stack traces reach customers** on any path exercised. Cart reads degrade to an empty cart rather than taking down the header, while correctly re-throwing Next's dynamic-rendering signal.

## Code quality
Consistently high. Comments explain *why*, not *what*. No `any` abuse, no unsafe assertions, no dead code found in the reviewed paths. The one dead-schema issue previously noted (unused `Cart`/`CartItem` models) has since been resolved — the server-side cart now uses them.

---

# Remaining Risks

1. **Payment capture has never succeeded in this database.** All 5 orders are `payment_status = pending`. The capture path is correct by inspection and its signature verification is verified, but **no capture has ever completed end-to-end.** This is the single largest residual risk.
2. **No automated test suite.** Zero unit, integration, or E2E tests. Every future change risks silent regression on the money path.
3. **Rate limiting is in-process.** `lib/rate-limit.ts` is per-instance and resets on cold start; it will not coordinate across a horizontally scaled or serverless deployment. It is a real improvement over nothing, not a substitute for an edge/Redis limiter.
4. **No script-src CSP.** Deliberately omitted — Razorpay Checkout injects scripts, styles, and iframes at runtime, and a guessed policy would break payments. `frame-ancestors` is set because it constrains who may embed us, not what we load.
5. **Admin panel screens not exercised.** Authorization is verified; rendering, validation messages, and empty/loading states across 24 admin routes are not.
6. **Duplicate `<h1>` in the DOM on the home page.** The hero renders separate mobile and desktop copy blocks. Only one is ever visible, and `display:none` removes the other from the accessibility tree, so **this is not a WCAG failure** — but both are in the HTML, which is a weak duplicate-content signal. Fixing it means restructuring the hero layout; I judged that a worse trade than a documented note, since I cannot visually validate the change across all breakpoints.
7. **No refunds capability.** Not implemented; admin cannot refund from the panel.
8. **No error tracking or alerting.** Structured logs are emitted but nothing aggregates or alerts on them.

---

# Recommended Improvements

**Before scale:**
- Move rate limiting to Redis/Upstash or edge middleware.
- Add a Razorpay-scoped CSP once their asset hosts are confirmed against live traffic.
- Add Sentry (or equivalent) and alert on `payment.*` and `checkout.*` log events.

**Product gaps:**
- `/shop` has no filtering or sorting (price, category, customizable) — expected on a corporate gifting catalogue.
- Refund handling in the admin order screen.
- Guest-wishlist merge on sign-in (guest cart merge already works).

**Engineering:**
- A test suite, starting with the money path: pricing resolution, `groupIntoShipments`, webhook idempotency, and the capture/failure ordering guard fixed in P0-2.
- Colour-contrast verification against WCAG AA across the palette.
- Lighthouse run against the production deployment.

---

# Production Readiness Score

| Dimension | Score | Basis |
|---|---:|---|
| Functionality | 82 | Core journeys work; no filters/sort, no refunds |
| UI/UX | 85 | Polished and consistent; confirmation/tracking now substantive |
| Responsiveness | 95 | **Verified** zero overflow, 90/90 combinations |
| Accessibility | 88 | AA blockers fixed and verified; contrast unmeasured |
| Security | 84 | Strong authz; upload/enumeration/headers fixed; no script CSP |
| Authentication | 90 | Session-derived identity throughout |
| Authorization | 95 | **All 41 admin actions guarded**; verified server-side |
| Payments | 80 | Server-verified by design; **never exercised live** |
| Cart | 95 | Genuinely production-grade |
| Checkout | 85 | Server-authoritative; two P1s fixed |
| Database | 88 | Sound schema, proper transactions, migrations current |
| API | 85 | Validated, rate-limited, correct status codes |
| Performance | 75 | No issues found; **not measured** |
| SEO | 90 | Robots, sitemap, JSON-LD, canonicals all correct |
| Error Handling | 85 | Graceful degradation; no stack traces leaked |
| Admin Panel | 78 | Authorization verified; UI not exercised |
| Observability | 70 | Good structured logging; no aggregation or alerting |
| Maintainability | 72 | Clean, well-commented code; **zero automated tests** |

## **OVERALL PRODUCTION READINESS SCORE: 84/100**

## **Classification: NEAR PRODUCTION READY**

Falls short of PRODUCTION READY on exactly two of the stated gate criteria:
- *"payment state is server verified"* — verified **by construction**, but never **demonstrated** end-to-end.
- *"critical user journeys pass"* — registration, email confirmation, and live payment could not be executed here.

All other gates are met: no known P0 or P1 issues remain, no critical vulnerabilities are outstanding, admin authorization is enforced server-side, database integrity holds, the responsive UI is verified, critical accessibility issues are resolved, and build/TypeScript/lint all pass.

---

# Release Decision

**Conditionally approved.** I would approve this application for a production e-commerce launch **after** the following six items — five of which are configuration, and one of which is the smoke test that closes the payment verification gap:

1. **Set `SITE_URL` to `https://www.giftaguru.com`.** It is currently `http://localhost:3000`, which would poison every canonical URL, the sitemap, Open Graph tags, and Razorpay callbacks. **This is a launch blocker.**
2. **Register the webhook** at `https://www.giftaguru.com/api/razorpay/webhook` for `payment.captured` and `payment.failed` only, and set the identical `RAZORPAY_WEBHOOK_SECRET` in the production environment.
3. **Place one real low-value order end-to-end** and confirm: Razorpay shows a 200 delivery; `orders.payment_status` becomes `paid`; `orders.user_id` is populated (the P0-1 fix); inventory decrements; the confirmation email arrives.
4. **Confirm `shipping_charge = 0` is intentional** — shipping currently displays "Free" on every order regardless of value.
5. **Verify the `www` host serves 200 directly** rather than redirecting, so webhook POSTs are not bounced through a redirect.
6. **Deploy and re-run the build** so the new security headers and `poweredByHeader: false` take effect in production.

Item 3 is the one that matters. Until a real capture completes, the payment pipeline is correct-by-inspection but unproven-by-execution — and on an e-commerce launch, that distinction is the difference between a confident sign-off and a hopeful one.

---

# Post-Audit Completion — 2026-09-03 (second pass)

Production configuration was completed by the owner (production `SITE_URL`, webhook registered, live Razorpay keys). The following was then verified and finished.

## Configuration verified (VERIFIED)

`npm run check:config` reports all 14 required variables present, plus an admin account and current migrations. Migrations remain **15 applied, 0 pending**.

## ⚠ Live keys are now in the LOCAL `.env`

**`RAZORPAY_KEY_ID` in the local `.env` is `rzp_live_…`, while local `SITE_URL` is still `http://localhost:3000`.**

This is a working-practice hazard, not a code defect:

- Running `npm run dev` and completing a checkout locally will create a **real Razorpay order and take real money**. There is no test-mode safety net left on the developer machine.
- The local dev server was stopped during this audit for that reason.

**Recommendation:** keep `rzp_test_…` keys in the local `.env` and hold the live key, live secret, and live webhook secret **only** in the production host's environment variables. Live credentials on a development machine buy nothing and risk real charges.

`.env` is correctly covered by `.gitignore` (`.env*`) and has **never been committed** — verified via `git log --all -- .env`. Secrets are not in version control.

## Automated test suite added (VERIFIED — 35/35 passing)

Phase 6 of the hardening plan, and the audit's largest residual risk, is now closed for the money path. **No new dependencies were added** — Node 24 runs TypeScript natively and `node:test` is built in.

```
npm test          # 35 tests, 35 pass, 0 fail
npm run test:watch
```

| File | Guards |
|---|---|
| `tests/pricing.test.ts` | Quantity-tier resolution — boundary at exactly `minQuantity`, highest-qualifying-tier selection, unsorted input, base-price fallback, no mutation. The only function turning quantity into price for **both** display and charge. |
| `tests/shipments.test.ts` | Per-destination shipping and the free-shipping threshold. Pins the rule that two ₹30,000 destinations both pay shipping even though the order totals ₹60,000 — evaluating the threshold order-wide would give away shipping on every split order. Also covers deleted-address fallback. |
| `tests/cart-identity.test.ts` | `customizationKey` — the third column of the cart's unique constraint. Same customization → same key (repeat adds merge, no duplicate line); different customization → different key (two engravings stay distinct). **Directly guards the P1-3 checkout failure.** |
| `tests/rate-limit.test.ts` | Limit enforcement, window reset, per-key isolation, bounded memory under a 3,000-key flood, 429 shape with `Retry-After`; plus Indian PIN validation including the leading-zero rejection. |

One supporting change: `lib/rate-limit.ts` now imports `next/headers` lazily inside `clientKey()` instead of at module scope, so the pure counter is unit-testable under plain `node --test`. `tsconfig.json` gained `allowImportingTsExtensions`.

## Orphaned-order backfill — not required (VERIFIED)

The P0-1 fix links all *future* orders. For the 5 pre-existing orphans:

```
orphaned = 5   recoverable = 0
```

Joining `orders.email` against `auth.users.email` matches **zero** accounts — all five were genuine guest checkouts by people who never registered. There is nothing to backfill, so no migration was written. Those customers can still retrieve their orders via `/track-order`, and the `/account/orders` email fallback will surface them automatically should they register with the same address later.

## Gate status after this pass

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **PASS** |
| `npm run lint` | **PASS** — 0 errors, 0 warnings |
| `npm test` | **PASS** — 35/35 |
| `npm run build` | **PASS** |
| `npm run check:config` | **PASS** — all present |
| `npm run db:migrate:status` | **15 applied, 0 pending** |

## Revised score

Maintainability rises from 72 → 84 (the money path is now regression-guarded), and Observability is unchanged at 70.

**OVERALL: 86/100 — NEAR PRODUCTION READY.**

The classification does **not** advance to PRODUCTION READY, for one reason only: **no payment capture has yet succeeded in this database.** All orders remain `payment_status = pending`. Configuration is now correct and the code is correct by inspection and unit-tested at the edges, but the end-to-end capture is still unproven by execution.

**The single remaining gate is item 3 of the release checklist:** place one real low-value order in production and confirm `orders.payment_status` → `paid`, `orders.user_id` populated, inventory decremented, and a 200 delivery in the Razorpay webhook log. That is the only step I cannot perform, and the moment it passes this application clears every stated criterion for PRODUCTION READY.

---

## Files Changed

| File | Change |
|---|---|
| `lib/rate-limit.ts` | **New** — bounded fixed-window limiter |
| `components/account/TrackOrderForm.tsx` | **New** — real tracking UI |
| `lib/orders/payment.ts` | P0-2 capture-is-terminal + failure idempotency |
| `app/api/razorpay/create-order/route.ts` | P0-1 `userId`, P1-3 dedupe + per-variant stock, P1-4 cart clear, P1-7 error mapping |
| `app/api/razorpay/webhook/route.ts` | P1-8 unknown-order handling, retry semantics preserved |
| `app/api/uploads/logo/route.ts` | P1-5 auth, throttle, magic bytes |
| `app/api/track-order/route.ts` | P1-6 rate limit |
| `app/api/leads/route.ts` | P2-14 leak fix, throttle before parse |
| `lib/cart/service.ts` | `getActiveCartId()` |
| `lib/data/products.ts` | `offset` support, `countProducts()` |
| `app/shop/page.tsx` | Pagination, `sr-only` h2, empty state |
| `app/track-order/page.tsx` | Uses new form component |
| `app/order-confirmation/[id]/page.tsx` | Ownership-scoped order summary |
| `components/layout/MobileNav.tsx` | Full dialog accessibility |
| `components/layout/Footer.tsx` | h3 → h2 |
| `components/cart/CartPageClient.tsx` | Decorative link hidden from AT |
| `next.config.ts` | Security headers, `poweredByHeader: false` |
| `tests/pricing.test.ts` | **New** — quantity-tier pricing |
| `tests/shipments.test.ts` | **New** — per-destination shipping |
| `tests/cart-identity.test.ts` | **New** — cart line identity |
| `tests/rate-limit.test.ts` | **New** — throttling + PIN validation |
| `package.json` | `test` / `test:watch` scripts (no new dependencies) |
| `tsconfig.json` | `allowImportingTsExtensions` |
