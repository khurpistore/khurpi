# Khurpi - Fresh Microgreens E-Commerce Platform

## Original Problem Statement
Build a comprehensive e-commerce platform for selling microgreens with admin dashboard, customer-facing storefront, and Flutter mobile app.

## Current State (After GitHub Sync - July 6, 2026)
The codebase has been synced from the GitHub repository `https://github.com/khurpistore/khurpi`. This replaced the local codebase with the GitHub version (older, from July 3, 2026).

### What Was Preserved After Sync:
- `PyJWT==2.10.1` in requirements.txt (re-added for deployment)
- JWT authentication functions in server.py (re-added)
- `/api/orders/my-orders` endpoint (re-added)
- Frontend `.env` with deployment fixes (`DISABLE_ESLINT_PLUGIN=true`, `CI=false`)

### What Was Removed by GitHub Sync:
- Spin & Earn wheel feature (AdminSpinWheel component and backend endpoints)
- Some wholesale pricing UI enhancements in admin panel
- 52 vegetable products that were added via script (now need re-run if not in production DB)

## Architecture
```
/app
├── backend/
│   ├── server.py (FastAPI - 6968 lines after sync)
│   └── requirements.txt (includes PyJWT)
├── frontend/ (React Admin Dashboard)
│   ├── src/
│   │   ├── App.js (156 lines - from GitHub)
│   │   └── pages/ (Admin pages)
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

## API Endpoints
- `GET /api/health` - Health check
- `POST /api/auth/login` - Returns JWT token
- `GET /api/orders/my-orders` - JWT-authenticated user orders
- `GET /api/products` - Product listing
- `GET /api/categories` - Category listing
- Admin endpoints under `/api/admin/*`

## Test Credentials
- Admin: `admin` / `Khurpi2026Secure`
- Customer: `9971818259` / `test1234`

## Deployment Notes
- Backend must have `PyJWT==2.10.1` in requirements.txt
- Frontend needs `DISABLE_ESLINT_PLUGIN=true` and `CI=false` in .env
- Flutter app is excluded from Kubernetes deployment

## Backlog
- Re-implement Spin & Earn wheel feature if needed
- Complete wholesale pricing UI in AdminUsers.js
- Backend refactoring (server.py is monolithic)
