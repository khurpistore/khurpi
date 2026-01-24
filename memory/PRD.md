# Khurpi Microgreens - Product Requirements Document

## Overview
Khurpi is a full-stack subscription web application for selling premium microgreens in fixed 5×7 inch trays, serving the NOIDA area.

## Shop Information
- **Name:** Khurpi Microgreens
- **Location:** E-312, ACE City, Noida Extension, 201306
- **Coordinates:** 28.5672, 77.4538
- **Contact:** +91 98765 43210, hello@khurpi.com
- **Delivery Area:** NOIDA only

---

## Implemented Features

### 1. Customer-Facing Application
- **Landing Page:** Hero section with "Subscribe & Save" CTA, benefits section
- **Products Page:** Browse microgreens with images, benefits, prices, growth days
- **Product Detail:** Detailed view with nutrients, health benefits, add to cart
- **Cart System:** Add/remove items, quantity management, persisted in localStorage
- **Checkout:** Address selection, delivery fee calculation, order placement (COD)
- **Subscription Creation:** 3-step wizard with plan selection and discounts
- **Profile:** Manage personal info, multiple addresses with map selection
- **My Subscriptions:** View and manage active subscriptions
- **My Orders:** View order history with status, items, and delivery details
- **Addresses Page:** Dedicated page to manage multiple delivery addresses with map picker

### 2. Navigation & UX
- **Header Menu (Desktop):**
  - Subscribe & Save (prominent CTA)
  - Products
  - Notification bell with unread count badge
  - User dropdown menu (My Orders, My Subscriptions, Addresses, Profile, Logout)
  - Cart icon with item count badge
- **Header Menu (Mobile):**
  - Notification bell icon
  - Cart icon
  - Hamburger menu with full navigation

### 3. Admin Panel
- **Dashboard:** Key metrics (subscriptions, revenue, deliveries)
- **User Management:** CRUD operations for users
- **Product Management:** CRUD for microgreens (name, price, stock, growth days)
- **Subscription Management:** View/edit subscription details
- **Delivery Management:** Today's deliveries, status updates, CSV export
- **Payment History:** View all payments
- **Inventory Planning:** Stock requirements based on subscriptions
- **Settings Management:** Shop config, delivery pricing, subscription plans

### 4. Pricing System

#### Delivery Pricing (Distance-Based)
| Distance from Shop | Delivery Fee |
|-------------------|--------------|
| Within 1 km       | FREE         |
| Within 5 km       | ₹50          |
| Within 10 km      | ₹100         |
| Beyond 10 km      | ₹150         |

#### Subscription Plans with Discounts
| Plan Name         | Frequency    | Deliveries/Week | Discount |
|-------------------|--------------|-----------------|----------|
| Weekly            | 1x/week      | 1               | 5%       |
| Twice Weekly      | 2x/week      | 2               | 10%      |
| Daily (6 days)    | 6 days/week  | 6               | 25%      |

### 4. Address Management
- Multiple addresses per user
- Map-based location selection (Leaflet)
- Structured fields: Line 1, Line 2, City, Pincode, Landmark
- NOIDA-only validation
- Default address selection

---

## Tech Stack
- **Frontend:** React, TailwindCSS, Shadcn/UI, React-Leaflet
- **Backend:** FastAPI, Pydantic
- **Database:** MongoDB
- **State:** React Context (Auth, Cart)

---

## API Endpoints

### Settings
- `GET /api/settings/shop` - Shop configuration
- `GET /api/settings/delivery-pricing` - Delivery pricing tiers
- `GET /api/settings/subscription-plans` - Subscription plans
- `POST /api/settings/calculate-delivery-fee` - Calculate delivery fee

### Products
- `GET /api/products` - List products
- `GET /api/products/:id` - Product detail
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Orders
- `POST /api/orders` - Create order (one-time purchase)
- `GET /api/orders` - Get user orders

### Subscriptions
- `POST /api/subscriptions` - Create subscription
- `GET /api/subscriptions` - Get user subscriptions
- `PUT /api/subscriptions/:id` - Update subscription
- `POST /api/subscriptions/:id/pause` - Pause subscription
- `POST /api/subscriptions/:id/resume` - Resume subscription
- `POST /api/subscriptions/:id/cancel` - Cancel subscription

### Addresses
- `GET /api/users/:id/addresses` - Get user addresses
- `POST /api/users/:id/addresses` - Add address
- `PUT /api/users/:id/addresses/:addressId` - Update address
- `DELETE /api/users/:id/addresses/:addressId` - Delete address
- `PUT /api/users/:id/addresses/:addressId/set-default` - Set default

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/settings/all` - All settings
- `PUT /api/admin/settings/shop` - Update shop config
- `PUT /api/admin/settings/delivery-pricing` - Update delivery pricing
- `PUT /api/admin/settings/subscription-plans` - Update subscription plans

---

## MOCKED Features (To Be Implemented)
1. **Phone + OTP Authentication** - Currently using phone + password
2. **Razorpay Payments** - Currently using Cash on Delivery
3. **Real-time Stock Updates** - Manual stock management for now

---

## Testing Credentials
- **Admin:** /admin/login, username: `admin`, password: `admin`
- **Test User:** phone: `9999999999`, password: `test123`

---

## Future Roadmap

### P0 (High Priority)
- Real Phone + OTP authentication
- Razorpay subscription payments integration
- Payment failure retry logic

### P1 (Medium Priority)
- Email/SMS notifications for deliveries
- Subscription pause before cutoff
- Address change for next delivery only
- Auto-cancellation after payment failures

### P2 (Lower Priority)
- Customer reviews and ratings
- Referral program
- Seasonal product promotions
- Delivery time slot selection

---

## Last Updated
January 24, 2025

## Change Log
- Added shop location and distance-based delivery pricing
- Added subscription plans with discounts (5%, 10%, 25%)
- Added Admin Settings page for managing pricing and plans
- Added cart and checkout for one-time purchases
- Added shared Header/Footer with Khurpi logo
- Added structured address form (Line 1, Line 2, City, Pincode, Landmark)
- Fixed subscription steps with sticky header and prev/next buttons
