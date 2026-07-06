# Khurpi - Fresh Microgreens E-Commerce Platform

## Original Problem Statement
Build a comprehensive e-commerce platform for selling microgreens with admin dashboard, customer-facing storefront, and Flutter mobile app.

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
