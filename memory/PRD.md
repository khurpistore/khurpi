# Khurpi - Fresh Microgreens E-Commerce Platform

## Original Problem Statement
Build a comprehensive e-commerce platform for selling microgreens with admin dashboard, customer-facing storefront, and Flutter mobile app.

## Recent Work (July 7, 2026)

### Admin Sidebar Consolidation (Tabbed Hubs) — DONE & TESTED (July 7 2026)
- Merged related admin sections into single tabbed pages to shrink the long sidebar:
  - **Orders** (`/admin/orders`, `AdminOrdersHub`): tabs Orders + Create Order (Create Order button uses `?tab=create`).
  - **Users** (`/admin/users`, `AdminUsersHub`): tabs Users + Customer View.
  - **Products** (`/admin/products`, `AdminProductsHub`): tabs Products + Categories + Subcategories.
  - **Finance** (`/admin/finance`, `AdminFinanceHub`): tabs Payments + Expenses + Cost Calculator.
- Hubs reuse existing page components inside shadcn `Tabs`. Old standalone routes/menu items (create-order, customer-view, categories, subcategories, expenses, cost-calculator, payments) removed; `AdminLayout` menuItems + titleMap updated. Verified via screenshots (all tabs render real data).

### Big request — BATCH C (Flutter) PARTIAL (July 8 2026)
- Logout wipes ALL local data (`clearAuthData` -> `sharedPreferences.clear()`).
- Profile: removed Earn & Spin + Saved Addresses items (moved to home).
- Checkout: white bg + white appbar; removed inline payment-method section (payment still selected at bottom bar); empty cart -> auto return to home (popUntil first); payment bottom sheet fixed overlap (SafeArea + bottom inset padding) + white bg.
- Orders + Order Detail + Products pages: white backgrounds (was #F8F9FA).
- STILL DEFERRED (need Flutter SDK/codegen or larger refactor):
  - Products/detail: real MRP+selling display, multi-image dots, dynamic total-after-add-to-cart, smaller qty stepper, remove in-stock overlay, vertical price/image align (ProductModel mrp/images -> build_runner).
  - Orders/detail: uniform title bar, product image, correct address, payment-summary spacing.
  - Address: full CRUD on home, borderless card, full info, title. Checkout: borderless address + open common address page + optimize delivery-time UI.
  - Spin: bottom-sheet instructions/title + spin-to-cart gift flow (gift flag/codegen).
  - Image upload (profile + admin): needs object storage.

### Big request — BATCH B (Flutter home/header/search/cart) DONE (rebuild to verify; backend search 9/9) (July 8 2026)
- Header: address excludes city/state/pincode (via displayAddress); 16px gap before profile icon.
- New shared `core/widgets/app_search_bar.dart` (AppSearchBar) used in home header (read-only tap) + search page (editable) → identical UI; search page bg white.
- Search stale-response race fixed (search_page `_search` ignores responses not matching current query; <2 chars empty). Backend /search verified deterministic 9/9 (iteration_28).
- Cart floating button: circular product images, label "Cart" (was Checkout). Free/gift items (price==0) non-removable → show "FREE" badge (cart_item_card).
- REMAINING: BATCH C (products/detail/address/checkout/profile/orders/logout/get-help).

### Big multi-area request — BATCH A (Admin + Backend) DONE & TESTED 100% (July 8 2026)
- Product **MRP + Selling Price**: `mrp` added to Product/Create/Update models; admin form has MRP + Selling Price inputs; product card shows struck MRP. (backend 8/8 green)
- Spin wheel: prizes **link a product from the product list** (dropdown) + support **multiple combo products** (`products: List[dict]` on SpinPrizeCreate); admin combo editor with chips. Fixed 401 (AdminSpinWheel switched raw fetch()->axios so JWT+X-Project-Id apply). Save+persist verified.
- Delivery-charge config (min_order_value/free_delivery_threshold/default_delivery_fee) + contact info (support phone/email/whatsapp) already existed in App Config.
- Image uploads kept as URL fields (user choice).
- KNOWN minor: GET /api/products uses direct project_id filter, not scoped_filter() — legacy docs w/o project_id not returned (non-blocking).
- REMAINING (Flutter, not testable here): BATCH B (home/header/search/cart) and BATCH C (products/detail/address/checkout/profile/orders) — see the user's big list.

### Mobile: Home header address source fix — DONE (backend API verified 14/14; Flutter needs rebuild) (July 8 2026)
- Bug: home header showed the cached profile address (`authLocalDataSource.getUser()`) instead of the actual selected/default delivery address.
- Fix (Flutter): `app_header.dart` now sources the header address ONLY from the address API result (`addressState.displayAddress`); removed the `getUser()` address fallback. `main_navigation_page.dart` calls `AddressNotifier.loadDefaultAddress(userId)` on home load (post-frame) to fetch the selected/default address from `GET /users/{id}/addresses` (picks `is_default`, else first). `getUser()` address left intact for Profile/address-form (not stripped globally).
- Backend contract verified green (iteration_25): is_default returned, set-default flips flag, delete works. Flutter UI not auto-testable here (no SDK) — rebuild to confirm on device.

### Mobile: All AppColors + typography admin-controlled — DONE (July 8 2026)
- Backend `AppConfigCreate` extended to 21 colors (added primary_light, secondary_dark, card, text_primary/secondary/hint, warning, info, in_stock, growing, out_of_stock, border, divider). `/config` & `/admin/config` now merge defaults so all fields always return.
- Admin App Config → Colors tab exposes all 21 color pickers; Branding tab has font family + heading/body/caption sizes (verified via screenshot + curl round-trip).
- Flutter `AppColors` fully runtime-driven via `applyConfig(rawJson)` (no freezed codegen needed); `AppTextStyles` config-driven getters; ~75 `const` usages de-consted via precise scanner (idempotent). Fallbacks retained.

### Contact / Help & Support Page + Admin Flicker Fix — DONE & TESTED (100%, July 7 2026)
- **Contact page** (`frontend/src/pages/Contact.js`, route `/contact`, public): "Help & Support" screen surfacing support phone (tel:), email (mailto:), WhatsApp (wa.me), address and support hours pulled from `GET /api/store/settings` (falls back to defaults). Footer got a "Help & Support" link.
- **Admin flicker/refresh fix (routing refactor)**: `AdminLayout` is now a PERSISTENT parent route rendering React Router `<Outlet/>`. It derives active nav + page title from `useLocation` (titleMap). App.js admin routes nested under `<Route path="/admin" element={<ProtectedRoute requireAdmin><AdminLayout/></ProtectedRoute>}>` with relative child paths; `/admin/login` and `/admin/projects` kept standalone (outside layout). All 25 `Admin*.js` pages had their `<AdminLayout>` wrapper removed (render bare content). Sidebar no longer remounts on navigation → no flicker. Tested 100% (iteration_24).

### Multi-Project (Multi-Tenancy) Admin — DONE & TESTED (100%)
- One admin panel now manages multiple projects/stores. Super admin = existing admin login (`admin`/`Khurpi2026Secure`).
- Flow: admin login -> **Project Selection screen** (`/admin/projects`, premium dark UI) -> select project -> same admin menu; new projects start EMPTY. "Add Project" card opens a create dialog.
- Backend (`server.py` ~line 124): `DEFAULT_PROJECT_ID="default"`, `get_project_id` dependency (reads `X-Project-Id` header), `scoped_filter()` helper (default project also matches legacy docs missing project_id), `PROJECT_SCOPED_COLLECTIONS`, project CRUD (`/api/admin/projects`), and a startup `init_projects()` that creates the default "Khurpi" project, backfills `project_id`, and creates `project_id` indexes.
- Scoped collections: **products, categories, subcategories, orders, coupons, banners, spin_prizes, users, subscriptions, deliveries, payments**.
- Frontend: `ProjectContext.js` (localStorage + global `axios X-Project-Id` header -> all admin pages auto-scoped), `AdminProjects.js`, `AdminLayout` guard + switch-project control.
- Storefront/mobile unaffected: no header -> defaults to "Khurpi" project (158 products retained).
- Bug fixes (July 7): (1) `/admin/users` + `/admin/dashboard` now project-scoped (were mixing across projects). (2) AdminCategories/AdminDeliverySlots/AdminSpinWheel/AdminStoreSettings now wrapped in `AdminLayout` — previously rendered with NO sidebar, appearing as if logged out. (3) Categories page fixed (was the sidebar-missing issue).
- NOT yet scoped (future phase): expenses, discount tiers, delivery slots config, pages, app_config, store settings, inventory.
- Regression tests: `/app/backend/tests/test_multi_tenant_projects.py` (12) + `/app/backend/tests/test_bugfix_isolation.py` (7).

### Platform Completion Phases (July 7, 2026)
- **Phase 1 — Security (DONE & TESTED 100%)**: JWT admin auth. `POST /api/admin/login` takes JSON, verifies env creds (secrets.compare_digest), issues JWT. `admin_auth_middleware` (server.py ~line 130) requires `Authorization: Bearer <admin JWT>` for ALL `/api/admin/*` (except login) + POST/PUT/DELETE `/api/products`. Frontend AuthContext stores token + sets axios default Authorization globally. Public/customer endpoints unchanged.
- **Phase 2 — Order lifecycle (DONE & TESTED 100%)**: customer `POST /orders/{id}/cancel` (pending/confirmed/preparing only) + `POST /orders/{id}/return` (delivered only); admin `GET /admin/returns` + `POST /admin/orders/{id}/refund` (Razorpay refund via `_process_razorpay_refund`, else marked refunded). Order model has cancel/return/refund fields. UI: OrderDetail cancel/return buttons + badges; AdminOrders 'Return & Refund' section with Process Refund.
- **Phase 3 — Tax invoices (DONE & TESTED 100%)**: `GET /orders/{id}/invoice` returns printable HTML tax invoice (store details, GSTIN, bill-to, items, GST breakup from inclusive total). StoreSettings gained `gstin`/`gst_rate`. OrderDetail 'Download Invoice' button.
- **CRITICAL FIX**: AuthContext customer login stored whole `{token,user}` as user → `user.id` undefined → My Orders always empty. Fixed to extract `.user` + persist token. Verified My Orders now populates.
- **Phase 4 — Support**: covered by existing StoreSettings phone/email (admin-configurable, shown on storefront).
- **Phase 5 — Crash reporting (PENDING)**: needs user's Sentry DSN. App has basic error analytics already.
- Follow-ups: enforce customer ownership on cancel/return via customer JWT (currently client-supplied user_id, bypassable); optional GST line in checkout math; Deep links (explicitly excluded by user).

### Admin Products Table redesign — DONE & TESTED
- Removed columns: Cost/50g, Retail Profit, WP/50g, WP Profit, Growth, Avl Date, "Growing" status.
- Renamed Retail/50g -> "Price" (full price). Added "Unit" (unit_value) + "Unit Type" (G/Kg/Piece/Pieces/Bunch/Dozen) columns. Applied to table + Add/Edit dialog + mobile view.

### Production data
- Uploaded 52 vegetables to production DB (all under "Vegetables" category) via `backend/add_vegetables.py`.

## Current State (After feature/5july_deployed Sync - July 6, 2026)
The codebase has been synced from the GitHub branch `feature/5july_deployed`. This is a more recent branch (July 5, 2026) with 66 commits ahead of main.

### What Was Synced:
- `backend/server.py` (7501 lines - includes JWT auth, all features)
- `frontend/src/App.js` (160 lines)
- Key admin pages: AdminProducts.js, AdminUsers.js, AdminCostCalculator.js, AdminSubscriptions.js, Products.js, AdminAppConfig.js

### Critical Deployment Fixes Preserved:
- Added `PyJWT==2.10.1` to requirements.txt (was missing in branch)
- Kept frontend `.env` with `DISABLE_ESLINT_PLUGIN=true` and `CI=false`
- Did NOT copy `.gitignore` from branch (it ignores .env files which breaks deployment)

## Architecture
```
/app
├── backend/
│   ├── server.py (FastAPI - 7501 lines)
│   └── requirements.txt (includes PyJWT)
├── frontend/ (React Admin Dashboard)
│   ├── src/
│   │   ├── App.js (160 lines - from feature/5july_deployed)
│   │   └── pages/ (Admin pages from feature/5july_deployed)
│   └── .env (DISABLE_ESLINT_PLUGIN=true, CI=false)
├── flutter_app/ (Mobile App - excluded from K8s deployment)
└── memory/
```

## Key Features
- Customer storefront with products, cart, checkout
- Admin dashboard with analytics, orders, products, subscriptions
- Cost calculator for microgreens production
- Expense tracking
- Delivery slot management
- Categories and banners
- Wholesale pricing toggle for users
- JWT-based authentication
- App config management (AdminAppConfig)

## API Endpoints
- `GET /api/health` - Health check
- `POST /api/auth/login` - Returns JWT token
- `GET /api/orders/my-orders` - JWT-authenticated user orders
- `GET /api/products` - Product listing (158 products)
- `GET /api/categories` - Category listing (6 categories)
- Admin endpoints under `/api/admin/*`

## Test Credentials
- Admin: `admin` / `Khurpi2026Secure`
- Customer: `9971818259` / `test1234`

## Deployment Notes
- Backend must have `PyJWT==2.10.1` in requirements.txt
- Frontend needs `DISABLE_ESLINT_PLUGIN=true` and `CI=false` in .env
- Flutter app is excluded from Kubernetes deployment
- Do NOT use .gitignore from GitHub - it ignores .env files

## Changelog — 2026-06 (fork continuation)
- Fixed Flutter build error in `search_page.dart` (removed orphaned duplicate code after class close).
- **Product MRP in Flutter**: added `mrp` field to `ProductModel` (+ hand-edited freezed/g.dart generated files: mixin getter, `_ProductModel` ctor+field, copyWith preserve, fromJson/toJson). Added `hasDiscount`/`discountPercentage` getters. Real strike-through MRP + % OFF badge now shown in product_card, product_detail_bottom_sheet, product_detail_page, search_page (removed old fake `price*1.15` MRP). Verified backend `/products` & `/search` return `mrp`.
- **Order detail**: real product image (via `OrderItemModelX.imageUrl` from `product` map) + full delivery address (city/pincode).
- **Address list**: shows full address (city/state included).
- **Checkout**: borderless selected-address box.
- **Spin & Earn**: added "How Spin & Win Works" instructions bottom sheet (info button in Earn AppBar). Spin-to-cart gift flow already existed.
- NOTE: Flutter SDK unavailable here — changes are brace-balanced but need `flutter run` to compile-verify. `ProductModel.mrp` did NOT need codegen since generated files were hand-edited.

## Still Pending
- Image Upload (Profile/Category/Product/Banner) — needs object storage integration (currently URL fields).
- Address full CRUD from home screen header.

## Multi-image gallery (2026-06) — DONE
- **Backend**: added `images: List[str]` to Product/ProductCreate/ProductUpdate. All 4 product-serving endpoints (list, by-category, featured, single, search) normalize `images` → falls back to `[primary]` when empty. Curl-verified: set/get/list/search all return the array; empty → `[primary]`.
- **Admin panel** (`AdminProducts.js`): "Additional Images (Gallery)" editor — add/remove image URL rows with thumbnail preview; submit merges `[primary, ...additional]` unique into `images`.
- **Flutter**: added `images` to `ProductModel` (freezed hand-edit, plain nullable list field) + `galleryImages` getter. Product detail bottom sheet now shows a swipeable `PageView` carousel with animated dot indicators. Needs local `flutter run` to compile-verify (no SDK here).

## Status
- Preview environment: ✅ Working
- Backend API: ✅ Working (MRP flow curl-verified)
- Frontend (React admin): ✅ Working
- Flutter app: ⚠️ Code updated, needs local rebuild to compile-verify (no SDK here)
