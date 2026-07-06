# Khurpi Fresh - Flutter Customer App (Clean Architecture + Riverpod)

A complete Flutter mobile application built with **Clean Architecture**, **Riverpod** state management, and **MVVM** pattern.

## 🏗️ Architecture Overview

```
lib/
├── core/                      # Shared utilities and base classes
│   ├── constants/             # App constants, colors, text styles
│   ├── error/                 # Failure and Exception classes
│   ├── network/               # API Client (Dio)
│   └── usecase/               # Base UseCase abstract class
│
├── data/                      # Data Layer
│   ├── datasources/
│   │   ├── local/             # Local data sources (SharedPreferences)
│   │   └── remote/            # Remote data sources (API calls)
│   ├── models/                # Data models (extend entities)
│   └── repositories/          # Repository implementations
│
├── domain/                    # Domain Layer (Business Logic)
│   ├── entities/              # Business entities
│   ├── repositories/          # Repository interfaces
│   └── usecases/              # Use cases (business operations)
│
├── presentation/              # Presentation Layer (UI)
│   ├── pages/                 # Screen pages
│   ├── viewmodels/            # ViewModels (StateNotifier)
│   ├── widgets/               # Reusable UI components
│   └── providers/             # Riverpod providers (DI)
│
└── main.dart                  # App entry point
```

## 🎯 Key Patterns

### Clean Architecture Layers
1. **Domain Layer** - Business logic, entities, repository contracts, use cases
2. **Data Layer** - API implementation, data models, repository implementations
3. **Presentation Layer** - UI, ViewModels, state management

### MVVM + Riverpod
- **ViewModels** use `StateNotifier` for state management
- **States** are immutable data classes
- **Providers** handle dependency injection
- Unidirectional data flow

### Either Type (Functional Error Handling)
Using `dartz` package for functional programming:
```dart
Future<Either<Failure, List<ProductEntity>>> getProducts();
```

## 📦 Dependencies

```yaml
# State Management
flutter_riverpod: ^2.5.1

# HTTP & Network
dio: ^5.4.0

# Functional Programming
dartz: ^0.10.1

# Local Storage
shared_preferences: ^2.2.2

# UI
cached_network_image: ^3.3.1
carousel_slider: ^4.2.1
```

## 🚀 Getting Started

### Prerequisites
- Flutter SDK 3.0.0+
- Dart SDK 3.0.0+

### Installation

```bash
cd flutter_app
flutter pub get
flutter run
```

### Update API URL
Edit `lib/core/constants/app_constants.dart`:
```dart
static const String baseUrl = 'YOUR_API_URL/api';
```

## 📱 Screens

| Screen | Description |
|--------|-------------|
| Splash | Animated logo, auth initialization |
| Home | Location, search, categories, banners, products |
| Products | Category filters, search, product grid |
| Product Detail | Image, details, quantity selector, add to cart |
| Cart | Items list, quantity management, checkout |
| Checkout | Address, delivery schedule, payment, order |

## 🔄 State Management Flow

```
UI Action → ViewModel → UseCase → Repository → DataSource → API
                ↓
          State Update → UI Rebuild
```

### Example: Fetching Products

```dart
// 1. ViewModel method
Future<void> fetchProducts() async {
  state = state.copyWith(isLoading: true);
  
  final result = await _getProductsUseCase(GetProductsParams());
  
  result.fold(
    (failure) => state = state.copyWith(error: failure.message),
    (products) => state = state.copyWith(products: products),
  );
}

// 2. UI watches state
final productsState = ref.watch(productsViewModelProvider);

// 3. UI triggers action
ref.read(productsViewModelProvider.notifier).fetchProducts();
```

## 🗂️ ViewModels

| ViewModel | State | Purpose |
|-----------|-------|---------|
| `ProductsViewModel` | Products, categories, filters | Product listing |
| `ProductDetailViewModel` | Selected product, quantity | Product details |
| `AuthViewModel` | User, auth status | Authentication |
| `CartViewModel` | Cart items, totals | Shopping cart |
| `OrdersViewModel` | Orders list | Order management |
| `BannersViewModel` | Promotional banners | Home banners |

## 🧪 Testing

The architecture enables easy testing:
- **Unit tests**: Use cases, repositories
- **Widget tests**: ViewModels with mocked use cases
- **Integration tests**: Full flow with mocked data sources

## 📝 Building

```bash
# Android APK
flutter build apk --release

# Android App Bundle
flutter build appbundle --release

# iOS (requires macOS)
flutter build ios --release
```

## 🔑 Key Features

- ✅ Clean Architecture separation
- ✅ Riverpod state management
- ✅ MVVM pattern with ViewModels
- ✅ Functional error handling (Either)
- ✅ Repository pattern
- ✅ Use cases for business logic
- ✅ Dependency injection via providers
- ✅ Immutable state objects
- ✅ Cart persistence (local storage)
- ✅ Wholesale pricing support
- ✅ Stock status handling

## 📄 License

© 2024 Khurpi Fresh. All rights reserved.
