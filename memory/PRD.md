# Khurpi Fresh - Product Requirements Document

## Original Problem Statement
Build a Veg & Fruit Shop e-commerce application with:
- **Admin Dashboard**: React web application for managing products, orders, subscriptions, expenses, and analytics
- **Customer App**: Flutter mobile application (Android/iOS) using Clean Architecture, Riverpod, and MVVM pattern

## Architecture

### Backend (FastAPI + MongoDB)
- Single `server.py` monolith (needs refactoring into modular routers)
- MongoDB Atlas for database
- RESTful API with JWT authentication (added Jul 4, 2026)

### Admin Frontend (React + Tailwind)
- Location: `/app/frontend/`
- Features: Products, Orders, Subscriptions, Expenses, Analytics, Cost Calculator, User Management

### Customer Mobile App (Flutter)
- Location: `/app/flutter_app/`
- Architecture: **Feature-based Clean Architecture** with generated files in separate `generated/` folder
- State Management: **Riverpod Family Providers** with code generation
- Data Models: Freezed (@freezed) with `part` directives pointing to `generated/`
- Networking: Retrofit + Dio
- Package name: `khurpi_fresh`

#### Project Structure (Updated Jul 4, 2026)
```
flutter_app/lib/
├── core/                    # Constants, Network, Error handling
├── data/
│   ├── api/                 # Retrofit API services
│   ├── datasources/         # Remote & Local data sources
│   └── models/              # Freezed models (part files in generated/)
├── features/                # Feature-based modules
│   ├── address/             # Address list, form, CRUD (NEW)
│   ├── auth/                # Login, auth_viewmodel, auth_providers
│   ├── cart/                # Cart page, viewmodel, providers
│   ├── checkout/            # Checkout page with address selection
│   ├── home/                # Home, banners, store viewmodels
│   ├── orders/              # Orders page, order detail with tracking (NEW)
│   ├── products/            # Products list, detail, viewmodels
│   ├── profile/             # Profile page with address management
│   ├── splash/              # Splash screen
│   ├── providers.dart       # Core data source providers
│   └── main_navigation_page.dart
├── generated/               # All .g.dart and .freezed.dart files
└── main.dart
```

## What's Been Implemented

### Backend Auth Updates (Jul 4, 2026)
- ✅ **JWT Token Authentication** added to backend
  - `/api/auth/login` now returns `{token, user}` format
  - `/api/auth/register` endpoint added for Flutter app
  - `/api/auth/otp-verified` returns JWT token after MSG91 OTP verification
- ✅ JWT functions: `create_jwt_token()`, `decode_jwt_token()`
- ✅ 30-day token expiration

### Flutter Customer App (Jul 4, 2026)
- ✅ **Address Management CRUD**
  - New `AddressListPage` for managing multiple addresses
  - New `AddAddressPage` for adding/editing addresses
  - Address selection in checkout flow
  - Set default address functionality
- ✅ **Order Detail with Tracking**
  - New `OrderDetailPage` with order timeline
  - Shows order status progression
  - Displays items, address, payment summary
- ✅ **MSG91 OTP Session Management**
  - `loginWithToken()` method in auth_viewmodel
  - Proper JWT token handling from backend
- ✅ **Checkout Improvements**
  - "Saved Addresses" button to select from address list
  - Address selection pre-fills form fields

### Admin Dashboard (Complete)
- ✅ Product CRUD with wholesale pricing
- ✅ Order management
- ✅ Subscription management with renewal feature
- ✅ Expense tracking
- ✅ Location analytics with map
- ✅ Cost Calculator (dynamic monthly production)
- ✅ User management with wholesale access toggle
- ✅ 50gm unit standardization

## Prioritized Backlog

### P0 (Completed This Session - Jul 4, 2026)
- ✅ JWT Token generation for auth endpoints
- ✅ MSG91 OTP session management with JWT
- ✅ Address Management CRUD in Flutter
- ✅ Order Detail page with tracking timeline
- ✅ Checkout address selection improvements
- ✅ **Fixed "Add to Cart" bug** (Jul 4, 2026) - Null-safe handling for cart provider in product_detail_page.dart, products_page.dart, cart_page.dart, checkout_page.dart
- ✅ **Checkout Page Enhancements** - Added +/- quantity controls and remove button for cart items, removed Order Notes section
- ✅ **Product Detail Bottom Sheet** - Converted full-page ProductDetailPage to a modal bottom sheet (`product_detail_bottom_sheet.dart`)
- ✅ **Global Floating Cart Button** - Added FloatingCartButton to: Products Page (PLP), Profile Page, Search Page, Categories Page
- ✅ **Fixed user.userId in checkout** - Added user_model.dart import to checkout_page.dart for extension method access
- ✅ **Fixed Place Order API** - Updated CreateOrderRequest, OrderRemoteDataSource and OrdersViewModel to match backend's required fields (user_id, address_id, subtotal, total, delivery_fee)
- ✅ **Redesigned Products Page (PLP)** - Categories in vertical scroll on left side (circles), products grid on right with ADD/+/- quantity controls
- ✅ **Fixed FloatingCartButton positioning** - Properly positioned at bottom on all pages (Profile, Search, Categories, Home)

### P1 (Next Sprint)
- ✅ Web Frontend "/products" page verified working (106 products displayed)
- ✅ Product Detail Bottom Sheet instead of full page
- ✅ Product Listing page with category sidebar
- ✅ **Razorpay payment integration** - Backend endpoints ready, Flutter checkout updated with payment flow
- ✅ **Premium ProductCard UI** - Applied patch with new card design, stock status badges, quantity controls
- [ ] Load app config on Flutter app start
- [ ] Full native Razorpay SDK integration (requires local Flutter setup)

### P2 (Future)
- [ ] Refactor `server.py` into modular routers
- [ ] Product Quick View modal (Web)
- [ ] Recently Viewed Products
- [ ] Wholesale Tier Levels
- [ ] Order tracking push notifications for Flutter
- [ ] Combo Offers section on Home Page

## Key API Endpoints
- `GET /api/products` - List products
- `POST /api/auth/login` - User login (returns JWT token)
- `POST /api/auth/register` - User registration (returns JWT token)
- `POST /api/auth/otp-verified` - MSG91 OTP verification (returns JWT token)
- `GET /api/users/{user_id}/addresses` - Get user's addresses
- `POST /api/users/{user_id}/addresses` - Add new address
- `PUT /api/users/{user_id}/addresses/{address_id}` - Update address
- `DELETE /api/users/{user_id}/addresses/{address_id}` - Delete address
- `PUT /api/users/{user_id}/addresses/{address_id}/set-default` - Set default address
- `GET /api/orders/my-orders` - User's orders
- `POST /api/orders` - Create order (accepts payment_id, razorpay_order_id)
- `GET /api/store/settings` - Store settings (delivery options)
- `GET /api/banners` - Get active banners
- `GET /api/config` - App configuration
- `POST /api/payments/create-order` - Create Razorpay payment order
- `POST /api/payments/verify` - Verify Razorpay payment signature

## Test Credentials
- **Admin**: username `admin`, password `Khurpi2026Secure`
- **Customer**: phone `9971818259`, password `test1234`
- **MSG91 Widget ID**: 366179704b55353730393234

## Technical Notes
- Flutter package name is `khurpi_fresh` (not `flutter_app`)
- All imports use `package:khurpi_fresh/...` format
- Backend runs on port 8001, frontend on port 3000
- MongoDB connection via MONGO_URL environment variable
- JWT tokens expire after 30 days
- Flutter commands (`flutter pub get`, `build_runner`) cannot run in container - user must run locally
