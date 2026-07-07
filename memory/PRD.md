# Khurpi - Fresh Microgreens E-Commerce Platform

## Original Problem Statement
Build a comprehensive e-commerce platform for selling microgreens with admin dashboard, customer-facing storefront, and Flutter mobile app.

## Recent Work (July 7, 2026)

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

## Status
- Preview environment: ✅ Working
- Backend API: ✅ Working
- Frontend: ✅ Working
