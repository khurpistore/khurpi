# Khurpi Fresh - Product Requirements Document

## Original Problem Statement
Build a Veg & Fruit Shop e-commerce application with:
- **Admin Dashboard**: React web application for managing products, orders, subscriptions, expenses, and analytics
- **Customer App**: Flutter mobile application (Android/iOS) using Clean Architecture, Riverpod, and MVVM pattern

## Architecture

### Backend (FastAPI + MongoDB)
- Single `server.py` monolith (needs refactoring into modular routers)
- MongoDB Atlas for database
- RESTful API with JWT authentication

### Admin Frontend (React + Tailwind)
- Location: `/app/frontend/`
- Features: Products, Orders, Subscriptions, Expenses, Analytics, Cost Calculator, User Management

### Customer Mobile App (Flutter)
- Location: `/app/flutter_app/`
- Architecture: Clean Architecture with 3 layers:
  - **Domain**: Entities, Repositories (interfaces), UseCases
  - **Data**: Models, DataSources (remote/local), Repository implementations
  - **Presentation**: Pages, Widgets, ViewModels, Riverpod Providers
- State Management: Riverpod
- Package name: `khurpi_fresh`

## What's Been Implemented

### Admin Dashboard (Complete)
- ✅ Product CRUD with wholesale pricing
- ✅ Order management
- ✅ Subscription management with renewal feature
- ✅ Expense tracking
- ✅ Location analytics with map
- ✅ Cost Calculator (dynamic monthly production)
- ✅ User management with wholesale access toggle
- ✅ 50gm unit standardization

### Flutter Customer App (Structure Complete - Mar 2026)
- ✅ Clean Architecture folder structure
- ✅ All Entities (Product, Category, User, Order, Cart, Banner)
- ✅ All Models with JSON serialization
- ✅ All Repositories (interfaces and implementations)
- ✅ All UseCases (Products, Auth, Orders)
- ✅ Riverpod Providers for dependency injection
- ✅ ViewModels for each screen
- ✅ UI Pages (Splash, Home, Products, Product Detail, Cart, Checkout)
- ✅ Reusable Widgets (ProductCard, CategoryCard, BannerCarousel, etc.)
- ✅ Fixed import errors (Jun 29, 2026)

## Prioritized Backlog

### P0 (Immediate)
- [ ] Verify Flutter app compiles locally (user testing)
- [ ] Connect Flutter app to FastAPI backend endpoints

### P1 (Next Sprint)
- [ ] Fix Web frontend "No product found" bug
- [ ] Refactor `server.py` into modular routers
- [ ] Add authentication screens to Flutter app

### P2 (Future)
- [ ] Product Quick View modal (Web)
- [ ] Recently Viewed Products
- [ ] Wholesale Tier Levels
- [ ] Push notifications (Flutter)
- [ ] Order tracking (Flutter)

## Key API Endpoints
- `GET /api/products` - List products
- `GET /api/categories/{id}/products` - Products by category
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Current user (includes wholesale_enabled)
- `POST /api/orders` - Create order
- `GET /api/orders/my-orders` - User's orders

## Test Credentials
- **Admin**: username `admin`, password `Khurpi2026Secure`
- **Customer**: phone `9971818259`, password `test1234`

## Technical Notes
- Flutter package name is `khurpi_fresh` (not `flutter_app`)
- All imports use `package:khurpi_fresh/...` format
- Backend runs on port 8001, frontend on port 3000
- MongoDB connection via MONGO_URL environment variable
