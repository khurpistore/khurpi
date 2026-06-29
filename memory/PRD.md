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
- Architecture: Clean Architecture (simplified - removed Entity/UseCase layers, models used directly)
- State Management: **Riverpod Class Annotations** (`@riverpod class ViewModel extends _$ViewModel`)
- Data Models: Freezed (@freezed)
- Networking: Retrofit + Dio
- Package name: `khurpi_fresh`

#### Provider Pattern (Updated - Using Annotations)
```dart
// ViewModel with Riverpod annotations
@Riverpod(keepAlive: true)
class CartViewModel extends _$CartViewModel {
  @override
  CartState build() {
    // Initialize state
    return const CartState();
  }
}

// Usage in UI
final cartState = ref.watch(cartViewModelProvider);
ref.read(cartViewModelProvider.notifier).addToCart(product);
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

### Flutter Customer App (Jun 30, 2026)
- ✅ Clean Architecture folder structure (simplified - no Entity layer)
- ✅ Freezed Models (Product, Category, User, Order, Cart, Banner, **StoreSettings, DeliverySlot**)
- ✅ Retrofit API Services for networking (Product, Auth, Order, Banner, **Store**)
- ✅ **Riverpod Class Annotated ViewModels** (@riverpod class pattern)
- ✅ **Bottom Navigation Bar** (Home, Categories, Cart, Profile)
- ✅ **Address bar at top** of main navigation
- ✅ UI Pages: Splash, Main Navigation, Home, Products, Product Detail, Cart, Checkout, Categories, Profile, Login, Orders
- ✅ Reusable Widgets (ProductCard, CategoryCard, BannerCarousel, CartItemCard, **SpinWheelWidget**)
- ✅ Fixed Riverpod "modifying provider while building" errors with WidgetsBinding.addPostFrameCallback
- ✅ Backend returns `image_url` field for Flutter compatibility
- ✅ **Delivery Options in Checkout** (Instant & Slotted delivery with date/time slot picker)
- ✅ **Spin the Wheel Game** on Home Page (6 sections: 5 vegetables + 1 "Better Luck", free item added to cart, once per order)

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
