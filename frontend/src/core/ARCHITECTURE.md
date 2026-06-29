# Clean Architecture - Single Source of Truth

## Overview

This application follows **MVVM + Clean Architecture** principles with a **Core Module** providing single source of truth for all business logic, utilities, and reusable components.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
│  (Pages: Products, Cart, Checkout, Admin*, Subscription*)   │
├─────────────────────────────────────────────────────────────┤
│                     CORE MODULE                              │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐  │
│  │  Components │   Hooks     │   Utils     │  Constants  │  │
│  │  (View)     │  (ViewModel)│  (Logic)    │  (Config)   │  │
│  └─────────────┴─────────────┴─────────────┴─────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                     CONTEXT LAYER                            │
│  (AuthContext, CartContext - Application State)              │
├─────────────────────────────────────────────────────────────┤
│                     API LAYER                                │
│  (axios calls to /api/* endpoints)                          │
└─────────────────────────────────────────────────────────────┘
```

## Core Module Structure

```
/frontend/src/core/
├── index.js                 # Main entry point - exports everything
├── constants/
│   ├── index.js            # All constants export
│   └── units.js            # UNIT_TYPES, UNIT_CONFIG, DEFAULT_QUANTITIES
├── utils/
│   ├── index.js            # All utilities export
│   ├── quantity.js         # formatQuantity, getQuantityOptions, etc.
│   ├── price.js            # formatPrice, formatPricePerUnit, calculateProductPrice
│   └── stock.js            # getStockStatus, canOrderProduct, sortByStockStatus
├── hooks/
│   ├── index.js            # All hooks export
│   ├── useProduct.js       # Product ViewModel hook
│   └── useCartOperations.js # Cart operations ViewModel hook
└── components/
    ├── index.js            # All components export
    ├── QuantitySelector.jsx # Quantity dropdown/stepper
    ├── PriceDisplay.jsx    # Price with wholesale badge
    ├── StockBadge.jsx      # Stock status indicator
    ├── ProductCard.jsx     # Product card for listings
    └── CartItem.jsx        # Cart item display
```

## Single Source of Truth

### 1. Unit Configuration (constants/units.js)
- All unit types: `kg`, `piece`, `dozen`, `bunch`, `g`, `liter`, `ml`
- Unit-specific settings: min/max/step quantities, decimal places
- Default quantity options per unit type

### 2. Quantity Operations (utils/quantity.js)
- `formatQuantity(qty, unit)` - "0.5 kg", "2 pc"
- `getQuantityOptions(product)` - [0.25, 0.5, 0.75, 1, ...]
- `getDefaultQuantity(product)` - Initial quantity for add to cart
- `isValidQuantity(qty, product)` - Validation

### 3. Price Operations (utils/price.js)
- `formatPrice(price)` - "₹150"
- `formatPricePerUnit(price, unit)` - "₹150/kg"
- `calculateProductPrice(product, qty, isWholesale)` - Total price
- `getDisplayPrice(product, isWholesale)` - Retail or wholesale price
- `calculateCartTotal(items, isWholesale)` - Cart subtotal

### 4. Stock Operations (utils/stock.js)
- `getStockStatus(product)` - { status, label, color, canOrder }
- `canOrderProduct(product)` - Boolean check
- `sortByStockStatus(products)` - Sort by availability

## Usage Examples

### Import from Core Module
```javascript
// In any page or component
import {
  // Utils
  formatQuantity,
  formatPricePerUnit,
  getStockStatus,
  getQuantityOptions,
  
  // Components
  QuantitySelector,
  StockBadge,
  CartItem,
  
  // Hooks
  useProduct,
  useCartOperations,
  
  // Constants
  UNIT_TYPES,
  STOCK_STATUS
} from '../core';
```

### Using QuantitySelector Component
```javascript
<QuantitySelector
  product={product}
  value={selectedQty}
  onChange={setSelectedQty}
  size="sm"  // 'sm' | 'default' | 'lg'
/>
```

### Using useProduct Hook (ViewModel)
```javascript
const {
  selectedQty,
  updateQuantity,
  pricePerUnit,
  totalPrice,
  stockInfo,
  canOrder,
  getCartProduct
} = useProduct(product, { isWholesale });
```

## Pages Using Core Module

| Page | Components Used | Utils Used |
|------|----------------|------------|
| Products.js | QuantitySelector, StockBadge | formatQuantity, formatPricePerUnit, getStockStatus |
| ProductDetail.js | QuantitySelector | formatQuantity, getStockStatus, getQuantityOptions |
| Cart.js | QuantitySelector, CartItem | formatQuantity, formatPricePerUnit |
| Checkout.js | CartItemReadOnly | formatQuantity, formatPricePerUnit |
| SubscriptionCreate.js | QuantitySelector | formatQuantity, getStockStatus, getQuantityOptions |
| AdminProducts.js | StockBadge | getStockStatus |
| AdminOrders.js | OrderItem | formatQuantity, formatPricePerUnit |
| OrderDetail.js | OrderItem | formatQuantity, formatPricePerUnit |

## Benefits

1. **Single Source of Truth**: All quantity/price logic in one place
2. **Consistency**: Same calculations across customer, admin, vendor pages
3. **Reusability**: Core module can be extracted for new projects
4. **Testability**: Pure utility functions are easy to unit test
5. **Maintainability**: Change once, applies everywhere
6. **MVVM Pattern**: Hooks serve as ViewModels, separating business logic from UI

## Migration Notes

### Old Pattern (DO NOT USE):
```javascript
// Hardcoded calculations
const price = (product.price / 100) * qty;  // ❌ Gram-based
const formatQtyLabel = (qty, unit) => {...} // ❌ Local function
```

### New Pattern (USE THIS):
```javascript
import { calculateProductPrice, formatQuantity } from '../core';
const price = calculateProductPrice(product, qty, isWholesale);  // ✅
const label = formatQuantity(qty, unit);  // ✅
```
