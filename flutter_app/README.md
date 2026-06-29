# Khurpi Fresh - Flutter Customer App

A complete Flutter mobile application for the Khurpi Fresh Veg & Fruit Shop. This app allows customers to browse products, manage their cart, and place orders.

## Features

### 🏠 Home Screen
- Location header with delivery address
- Global search bar
- Horizontal scrolling categories
- Banner carousel with auto-play
- Featured products grid

### 📦 Products
- Browse all products with category filtering
- Search products by name
- Product detail page with:
  - Large product image
  - Stock status badge
  - Price (retail/wholesale based on user)
  - Quantity selector (kg/gm toggle)
  - Add to cart functionality

### 🛒 Cart & Checkout
- View cart items with quantity adjustment
- Remove items from cart
- Order summary with delivery fee calculation
- Free delivery on orders above ₹500
- Select delivery date and time slot
- Payment method selection (COD/UPI)
- Order confirmation

### 👤 User Features
- Login/Register with phone number
- Profile management
- Order history
- Wholesale pricing for enabled customers

## Project Structure

```
flutter_app/
├── lib/
│   ├── core/
│   │   ├── constants/       # App colors, text styles, constants
│   │   ├── models/          # Data models (Product, Category, Cart, Order, User)
│   │   ├── services/        # API services (Auth, Products, Orders)
│   │   ├── providers/       # State management (Provider)
│   │   └── widgets/         # Reusable UI components
│   ├── features/
│   │   ├── home/           # Home screen
│   │   ├── products/       # Products list & detail screens
│   │   ├── cart/           # Cart screen
│   │   ├── checkout/       # Checkout screen
│   │   ├── orders/         # Orders history
│   │   ├── auth/           # Login/Register screens
│   │   └── profile/        # User profile
│   └── main.dart           # App entry point
├── assets/
│   └── images/             # Local images
└── pubspec.yaml            # Dependencies
```

## Setup & Installation

### Prerequisites
- Flutter SDK 3.0.0 or higher
- Dart SDK 3.0.0 or higher
- Android Studio / Xcode (for building)

### Steps

1. **Clone/Download the flutter_app folder**

2. **Install dependencies**
   ```bash
   cd flutter_app
   flutter pub get
   ```

3. **Update API Base URL**
   
   Edit `lib/core/constants/app_constants.dart`:
   ```dart
   static const String baseUrl = 'YOUR_API_URL/api';
   ```

4. **Add Poppins font (optional)**
   
   Download Poppins font files and place them in `assets/fonts/`:
   - Poppins-Regular.ttf
   - Poppins-Medium.ttf
   - Poppins-SemiBold.ttf
   - Poppins-Bold.ttf

5. **Run the app**
   ```bash
   # For development
   flutter run
   
   # For Android release
   flutter build apk --release
   
   # For iOS release
   flutter build ios --release
   ```

## Configuration

### Android (android/app/build.gradle)
```gradle
android {
    compileSdkVersion 34
    
    defaultConfig {
        applicationId "com.khurpifresh.app"
        minSdkVersion 21
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
    }
}
```

### iOS (ios/Runner/Info.plist)
- Bundle Identifier: com.khurpifresh.app
- App Name: Khurpi Fresh

## API Endpoints Used

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/products` | GET | Get all products |
| `/api/products/{id}` | GET | Get product details |
| `/api/categories` | GET | Get all categories |
| `/api/auth/login` | POST | User login |
| `/api/auth/register` | POST | User registration |
| `/api/auth/me` | GET | Get current user |
| `/api/orders` | POST | Create order |
| `/api/orders/my` | GET | Get user orders |
| `/api/banners` | GET | Get promotional banners |

## State Management

Using **Provider** for state management:
- `AuthProvider` - User authentication state
- `ProductProvider` - Products and categories
- `CartProvider` - Shopping cart (persisted locally)
- `OrderProvider` - Order management
- `BannerProvider` - Promotional banners

## Key Dependencies

```yaml
dependencies:
  provider: ^6.1.2          # State management
  http: ^1.2.0              # API calls
  shared_preferences: ^2.2.2 # Local storage
  cached_network_image: ^3.3.1 # Image caching
  carousel_slider: ^4.2.1   # Banner carousel
  intl: ^0.19.0             # Date formatting
```

## Screens Preview

1. **Splash Screen** - Animated logo with loading
2. **Home Screen** - Location → Search → Categories → Banners → Products
3. **Products Screen** - Category filters, search, product grid
4. **Product Detail** - Image, details, quantity selector, add to cart
5. **Cart Screen** - Items list, quantity adjustment, order summary
6. **Checkout Screen** - Address, date/time slot, payment, confirm
7. **Orders Screen** - Order history with status
8. **Profile Screen** - User info, settings, logout

## Building for Production

### Android
```bash
flutter build apk --release
# Output: build/app/outputs/flutter-apk/app-release.apk

# For App Bundle (recommended for Play Store)
flutter build appbundle --release
```

### iOS
```bash
flutter build ios --release
# Then open in Xcode for archive and distribution
```

## Notes

- The app uses the same backend API as the web admin panel
- Cart data is persisted locally using SharedPreferences
- Wholesale pricing is automatically shown for enabled customers
- Stock status affects add-to-cart availability

## License

© 2024 Khurpi Fresh. All rights reserved.
