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
- Architecture: **Feature-based Clean Architecture** with generated files in separate `generated/` folder
- State Management: **Riverpod Family Providers** with code generation
- Data Models: Freezed (@freezed) with `part` directives pointing to `generated/`
- Networking: Retrofit + Dio
- Package name: `khurpi_fresh`

#### Project Structure (Updated Jul 3, 2026)
```
flutter_app/lib/
├── core/                    # Constants, Network, Error handling
├── data/
│   ├── api/                 # Retrofit API services
│   ├── datasources/         # Remote & Local data sources
│   └── models/              # Freezed models (part files in generated/)
├── features/                # Feature-based modules
│   ├── auth/                # Login, auth_viewmodel, auth_providers
│   ├── cart/                # Cart page, viewmodel, providers
│   ├── checkout/            # Checkout page
│   ├── home/                # Home, banners, store viewmodels
│   ├── orders/              # Orders page, viewmodel, providers
│   ├── products/            # Products list, detail, viewmodels
│   ├── profile/             # Profile page
│   ├── splash/              # Splash screen
│   ├── providers.dart       # Core data source providers
│   └── main_navigation_page.dart
├── generated/               # All .g.dart and .freezed.dart files
└── main.dart
```

#### Provider Pattern (Family Providers)
```dart
// ViewModels use family providers with datasource injection
@riverpod
class ProductsViewModel extends _$ProductsViewModel {
  @override
  ProductsState build({required ProductRemoteDataSource productRemoteDataSource}) {
    return const ProductsState();
  }
}

// Feature providers wrap family providers
final provideProductsViewModelProvider = Provider((ref) {
  final productDS = ref.watch(provideProductRemoteDataSourceProvider);
  if (productDS == null) return null;
  return ref.watch(productsViewModelProvider(productRemoteDataSource: productDS));
});
```

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

### Flutter Customer App (Jul 3, 2026)
- ✅ **Feature-based Clean Architecture** with `features/` and `generated/` folders
- ✅ Freezed Models with `part '../../generated/...'` directives
- ✅ Retrofit API Services for networking (Product, Auth, Order, Banner, Store)
- ✅ **Riverpod Family Providers** with datasource injection
- ✅ **Bottom Navigation Bar** (Home, Categories, Cart, Profile)
- ✅ **Global App Header** (Delivery Location + Account + Search Bar)
- ✅ UI Pages: Splash, Main Navigation, Home, Products, Product Detail, Cart, Checkout, Categories, Profile, Login, Orders, Earn
- ✅ Reusable Widgets (BannerCarousel, SpinWheelWidget, AppHeader, QuantitySelector)
- ✅ Fixed Riverpod build errors with `WidgetsBinding.instance.addPostFrameCallback`
- ✅ **Delivery Options in Checkout** (Instant & Slotted delivery)
- ✅ **Spin the Wheel Game** on Home Page
- ✅ **Banner Management** added to Admin Portal

## Prioritized Backlog

### P0 (Immediate)
- [ ] User verification: Run `flutter pub run build_runner build --delete-conflicting-outputs` locally
- [ ] Test Flutter checkout with delivery options end-to-end

### P1 (Next Sprint)
- [ ] Fix Web frontend "No product found" bug (recurring issue - 3x)
- [ ] Refactor `server.py` into modular routers
- [ ] Complete authentication flow in Flutter

### P2 (Future)
- [ ] Product Quick View modal (Web)
- [ ] Recently Viewed Products
- [ ] Wholesale Tier Levels
- [ ] Push notifications (Flutter)
- [ ] Order tracking (Flutter)

## Key API Endpoints
- `GET /api/products` - List products (includes `image_url` field)
- `GET /api/products/{id}` - Single product (includes `image_url` field)
- `GET /api/categories/{id}/products` - Products by category
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Current user (includes wholesale_enabled)
- `POST /api/orders` - Create order (supports delivery_type, delivery_date, delivery_slot_id)
- `GET /api/orders/my-orders` - User's orders
- **`GET /api/store/settings` - Store settings (delivery options, fees)**
- **`GET /api/delivery-slots?date=YYYY-MM-DD` - Available delivery slots for date**

## Test Credentials
- **Admin**: username `admin`, password `Khurpi2026Secure`
- **Customer**: phone `9971818259`, password `test1234`

## Technical Notes
- Flutter package name is `khurpi_fresh` (not `flutter_app`)
- All imports use `package:khurpi_fresh/...` format
- Backend runs on port 8001, frontend on port 3000
- MongoDB connection via MONGO_URL environment variable
- All StatefulWidgets use `WidgetsBinding.instance.addPostFrameCallback` to avoid Riverpod build errors
