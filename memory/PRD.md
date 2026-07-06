# Khurpi Fresh - Product Requirements Document

## Overview
Khurpi Fresh is a microgreens and fresh vegetables delivery app with:
- Flutter mobile app for customers
- React web admin dashboard
- FastAPI backend with MongoDB

## Completed Features (July 2026)

### Flutter App UI/UX Overhaul

#### 1. Product Card Updates
- ✅ Removed "FRESH" badge from product images
- ✅ Smaller +/- quantity buttons (32px height, 80px width)
- ✅ Added MRP with strikethrough + discounted price
- ✅ Left-aligned price and product name
- ✅ No toast on cart add (silent add)
- ✅ Discount percentage badge on product images

#### 2. Floating Cart Button (Premium)
- ✅ Shows product images (max 5 items stacked)
- ✅ Shows +N badge for additional items
- ✅ Gradient design with shadow
- ✅ Shows item count and subtotal
- ✅ Checkout button with arrow

#### 3. Search Page
- ✅ Premium search bar with "Search" placeholder
- ✅ Removed voice icon
- ✅ Recent searches (max 5) saved to SharedPreferences
- ✅ Clear all recent searches option
- ✅ Product list with MRP/discount display
- ✅ Floating cart button at bottom

#### 4. Checkout Page
- ✅ Payment method selector on LEFT side of Place Order button
- ✅ Default payment: Online (changed from COD)
- ✅ Bottom sheet for payment method selection
- ✅ UPI/Card/Net Banking option
- ✅ Cash on Delivery option

#### 5. Order Success Page
- ✅ Full delivery address (no ellipsis/truncation)
- ✅ Only "Back to Home" button
- ✅ Order details card with ID, items, total, payment, delivery

#### 6. Order Detail Page
- ✅ Removed Cancel Order button
- ✅ Removed Get Help button
- ✅ Clean order detail view

#### 7. Profile Page
- ✅ Added "Get Help" button
- ✅ Help bottom sheet with admin-configured phone number
- ✅ Call button to directly dial support
- ✅ Profile image edit option (UI placeholder)
- ✅ Spin & Earn menu item

#### 8. Address List Page
- ✅ FAB without text (icon only)
- ✅ Hidden city/state/district from display
- ✅ Shows: address line, area, landmark, pincode only

#### 9. Spin & Earn Feature
- ✅ Spin wheel with configurable prizes
- ✅ Prizes loaded from backend API
- ✅ Home page "Spin & Earn" button
- ✅ Bottom sheet wheel display
- ✅ Win tracking and eligibility

#### 10. Home Page
- ✅ Spin & Earn promotional banner/button
- ✅ Opens spin wheel in bottom sheet

### Backend API Updates

#### New Endpoints
- `GET /api/orders/my-orders` - Get orders using JWT token (auth required)
- `GET /api/spin-wheel/prizes` - Get spin wheel prizes
- `POST /api/admin/spin-wheel/prizes` - Save spin wheel prizes (admin)

#### Authentication
- Added `get_current_user_id` dependency for JWT-based auth
- Added `get_optional_user_id` for optional auth

### Admin Panel Updates

#### New Page: Spin Wheel Prizes (`/admin/spin-wheel`)
- Configure prizes for spin wheel
- Add/remove prizes
- Set prize name, product ID, quantity, unit, color
- Mark prizes as "Better Luck" (empty)

#### Sidebar Navigation
- Added "Spin & Earn" menu item with disc icon

### Native Setup (Android)
- `minSdk = 21` for Razorpay compatibility
- ProGuard rules for Razorpay
- INTERNET permission in AndroidManifest

## Technical Architecture

### Flutter App Structure
```
flutter_app/lib/
├── core/
│   ├── constants/
│   └── network/
│       └── dio_client.dart (shared auth-enabled Dio)
├── data/
│   ├── models/
│   ├── services/
│   │   └── razorpay_service.dart
│   └── datasources/remote/
│       └── order_remote_datasource.dart (uses DioClient)
├── features/
│   ├── cart/
│   │   └── floating_cart_button.dart
│   ├── checkout/
│   │   └── checkout_page.dart
│   ├── earn/
│   │   └── earn_page.dart
│   ├── home/
│   │   └── home_page.dart
│   ├── orders/
│   │   ├── order_detail_page.dart
│   │   ├── order_success_page.dart
│   │   └── orders_page.dart
│   ├── products/
│   │   ├── products_page.dart
│   │   └── widgets/product_card.dart
│   ├── profile/
│   │   └── profile_page.dart
│   ├── search/
│   │   └── search_page.dart
│   └── spin_wheel_widget.dart
```

### Backend Structure
```
backend/
└── server.py (FastAPI monolith with all endpoints)
```

### Admin Panel Structure
```
frontend/src/
├── pages/
│   └── AdminSpinWheel.js
└── components/
    └── AdminLayout.js (sidebar with spin-wheel link)
```

## Test Credentials

### Admin
- Username: `admin`
- Password: `Khurpi2026Secure`

### Customer
- Phone: `9971818259`
- Password: `test1234`

## Pending/Future Tasks

### P1 - High Priority
- Run `flutter pub run build_runner build` locally to sync Freezed models
- Verify OrderDetailPage routing fix manually
- Test Razorpay integration on physical device
- Add actual profile image upload

### P2 - Medium Priority
- Refactor backend into modular routers
- Order tracking push notifications
- Product Quick View modal for Web

### P3 - Low Priority
- Wholesale tier levels
- Advanced analytics

## API Endpoints Reference

### Authentication
- `POST /api/auth/login` - Phone/password login
- `GET /api/auth/me` - Get current user (auth required)

### Orders
- `GET /api/orders/my-orders` - Get user's orders (auth required)
- `POST /api/orders` - Create order
- `GET /api/orders/{id}` - Get order by ID

### Products
- `GET /api/products` - List products
- `GET /api/products/{id}` - Get product detail
- `GET /api/search?q=term` - Search products

### Spin Wheel
- `GET /api/spin-wheel/prizes` - Get prizes
- `POST /api/admin/spin-wheel/prizes` - Save prizes

### Store Config
- `GET /api/store/settings` - Get store settings (includes support_phone)
- `GET /api/config` - Get app config

## Known Limitations
- Freezed models require local `build_runner` execution
- Flutter tests cannot run in container environment
- Profile image upload is UI-only (backend storage not implemented)
