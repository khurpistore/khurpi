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
- **Subscription Creation:** 3-step wizard with plan selection, **MONTHLY billing** (tray × deliveries/week × 4 weeks), and discounts
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
- **Orders Management:** View all orders, update status, search/filter orders
- **User Management:** CRUD operations for users
- **Product Management:** CRUD for microgreens (name, price, stock, growth days, pack size)
- **Subscription Management:** View/edit subscription details
- **Delivery Management:** Today's deliveries, status updates, CSV export
- **Payment History:** View all payments
- **Inventory Planning:** Stock requirements based on subscriptions
- **Settings Management:** Shop config, delivery pricing, subscription plans
- **Page Content (CMS):** Edit Privacy Policy, Terms, Shipping Policy, Cancellation & Refund pages
- **Analytics Dashboard:** Comprehensive tracking and marketing analytics with:
  - Real-time stats (active sessions, users, events)
  - Conversion funnel (Page Views → Product Views → Add to Cart → Checkout → Purchase)
  - Device breakdown (desktop, mobile, tablet)
  - Location tracking (city-wise visits)
  - User engagement metrics (bounce rate, conversion rate, pages/session)
  - User journey tracking (session paths)
  - Error tracking (JS errors with occurrences)
  - **Traffic Sources** (facebook, google, instagram, whatsapp, direct, referral)
  - **Traffic Channels** (social, search, direct, referral, email)
  - **UTM Campaign Tracking** (source, medium, campaign, term, content)
  - Marketing attribution (first-touch, landing page, ad click IDs: gclid, fbclid)

### 4. Pricing System

#### Delivery Pricing (Distance-Based)
| Distance from Shop | Delivery Fee |
|-------------------|--------------|
| Within 1 km       | FREE         |
| Within 5 km       | ₹50          |
| Within 10 km      | ₹100         |
| Beyond 10 km      | ₹150         |

#### Subscription Plans with Discounts
| Plan Name         | Frequency    | Deliveries/Week | Trays/Month | Discount |
|-------------------|--------------|-----------------|-------------|----------|
| Weekly            | 1x/week      | 1               | 4           | 0%       |
| Twice Weekly      | 2x/week      | 2               | 8           | 10%      |
| 4 Days a Week     | 4x/week      | 4               | 16          | 50%      |

### 5. Address Management
- Multiple addresses per user with structured fields:
  - Address Name/Label (Home, Office, etc.)
  - Address Line 1 (House/Flat No.)
  - Address Line 2 (Street, Landmark - optional)
  - Area/Sector
  - City (fixed to NOIDA)
  - PIN Code
- Map-based location pinning (internal lat/lng - not shown to user)
- NOIDA-only validation
- Default address selection

### 6. Discount Coupons (Admin)
- Create, edit, delete coupons
- Percentage or fixed amount discounts
- Min order amount, max discount limits
- Usage limits, validity dates
- Active/inactive status
- **Customer can apply coupons during subscription checkout**

### 7. Referral Program (Admin)
- Register referrers with unique codes
- Commission rate per referrer
- Track referrals and commission earned
- Mark commission as paid
- Referral statistics dashboard
- **Customers can enter referral codes during checkout**

### 8. Subscription Checkout
- Order summary with all price breakdowns
- Apply coupon code with instant discount calculation
- Enter referral code to credit referrer
- Payment method selection:
  - Cash on Delivery (active)
  - Online Payment via Razorpay (coming soon)
- Total savings display
- Place Order button with final amount

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

### Coupons
- `GET /api/admin/coupons` - List all coupons
- `POST /api/admin/coupons` - Create coupon
- `PUT /api/admin/coupons/:id` - Update coupon
- `DELETE /api/admin/coupons/:id` - Delete coupon
- `POST /api/coupons/validate` - Validate and calculate coupon discount

### Referrals
- `GET /api/admin/referrers` - List all referrers with stats
- `GET /api/admin/referral-stats` - Overall referral statistics
- `POST /api/admin/referrers` - Register new referrer
- `PUT /api/admin/referrers/:id` - Update referrer
- `DELETE /api/admin/referrers/:id` - Delete referrer
- `POST /api/admin/referrers/:id/pay-commission` - Mark commission as paid
- `POST /api/referrals/apply` - Apply referral code to order

### Products
- `GET /api/products` - List products
- `GET /api/products/:id` - Product detail
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Orders
- `POST /api/orders` - Create order (one-time purchase)
- `GET /api/orders` - Get user orders
- `GET /api/admin/orders` - Get all orders (admin)
- `PUT /api/admin/orders/:id/status` - Update order status (admin)

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

## Authentication System
- **Phone + Password based login/signup** (OTP was removed per user request)
- 24-hour session persistence
- **User Password Management:**
  - Users can change their own password from Profile page (requires current password)
- **Admin Password Management:**
  - Admins can reset any user's password from Admin Users page

---

## MOCKED Features (To Be Implemented)
1. **Real-time Stock Updates** - Manual stock management for now

---

## Testing Credentials
- **Admin:** /admin/login, username: `admin`, password: `Khurpi2026Secure`
- **Test User:** phone: `9876543210`, password: `test123`

---

## Future Roadmap

### P0 (High Priority)
- Payment failure retry logic for subscriptions

### P1 (Medium Priority)
- User-facing subscription pause/skip functionality
- Email/SMS notifications for deliveries
- Address change for next delivery only
- Auto-cancellation after payment failures

### P2 (Lower Priority)
- Customer reviews and ratings for products
- Social sharing feature for referral codes
- Seasonal product promotions
- Delivery time slot selection
- Refactor monolithic `server.py` into modular routers
- Refactor large frontend components (`SubscriptionCreate.js`, `Addresses.js`)

---

## Last Updated
February 1, 2026

## Change Log
- **Feb 2, 2026:** Added delivery address display to subscription cards on both My Orders and My Subscriptions pages
- **Feb 2, 2026:** Enhanced My Orders page - Subscription cards now show product info (image, name, weight) same as MySubscriptions page
- **Feb 2, 2026:** Added contextual back button - When navigating to subscription detail from Orders page, shows "Back to Orders" button; from MySubscriptions shows "Back to Subscriptions"
- **Feb 1, 2026:** P0 COMPLETED - Updated Subscription Pages with New Product Logic:
  - SubscriptionCreate.js: Replaced quantity input with weight dropdown (100-5000gm options)
  - SubscriptionCreate.js: Price calculation now uses (price/100) * selectedQty formula
  - SubscriptionCreate.js: Dynamic delivery dates (Tomorrow for in-stock, availability_date+1 for growing)
  - SubscriptionDetail.js: Products section shows weight-based pricing
  - Cart.js: Subscription section displays weight and calculated price
- **Jan 31, 2026:** Redesigned Checkout Order Summary - beautiful, uneditable layout with product cards, delivery dates, and teal gradient styling
- **Jan 31, 2026:** Fixed Admin Logout Bug - added robust session handling with localStorage double-check and race condition prevention in ProtectedRoute
- **Jan 31, 2026:** Enhanced Order Summary to show full product names, pack sizes, growing status indicators, and delivery estimates
- **Jan 26, 2025:** Reverted from OTP to Password-based authentication per user request
- **Jan 26, 2025:** Removed "Forgot Password" page and link
- **Jan 26, 2025:** Added "Change Password" feature to Profile page (Security section)
- **Jan 26, 2025:** Added "Reset Password" feature to Admin Users page
- **Jan 26, 2025:** Added backend APIs: `/auth/change-password`, `/admin/users/{id}/reset-password`
- **Jan 25, 2025:** Implemented Phone + OTP authentication via MSG91 WhatsApp (later reverted)
- **Jan 25, 2025:** Integrated Razorpay payment gateway for online subscription payments
- **Jan 25, 2025:** Fixed Login Redirect Race Condition with ProtectedRoute component and 24hr session
- **Jan 25, 2025:** Added ScrollToTop component - pages now scroll to top on navigation
- **Jan 25, 2025:** Added "Refer & Earn" to header menu, removed from Profile page
- **Jan 25, 2025:** Removed Quick Links section from Profile page, simplified profile layout
- **Jan 25, 2025:** Updated Footer contact info: +919971818259, khurpi.store@gmail.com
- **Jan 25, 2025:** Added Privacy Policy & Terms of Service pages with default content
- **Jan 25, 2025:** Added admin panel controls for Privacy Policy & Terms of Service content
- **Jan 25, 2025:** Updated Orders page to show subscription orders with tabs (All, One-time, Subscriptions)
- **Jan 25, 2025:** Reorganized Subscription Detail page: Subscription Details → Products → Monthly Cost (cleaner layout)
- **Jan 25, 2025:** Fixed monthly total calculation: now correctly calculates as `perDeliveryTotal × deliveriesPerWeek × 4`
- **Jan 25, 2025:** Added `delivery_days` array to backend models to store multiple selected delivery days
- **Jan 25, 2025:** Updated My Subscriptions & Subscription Detail pages to display selected delivery days (e.g., "Monday, Thursday" for twice a week)
- **Jan 25, 2025:** Verified "My Subscriptions" page cleanup - calculation breakdown removed, simplified UI shows only plan info and monthly total
- **Jan 24, 2025:** Converted all subscription billing from weekly to monthly
- **Jan 24, 2025:** Implemented dynamic multi-day delivery selection based on plan
- **Jan 24, 2025:** Updated address model to store individual fields (name, line1, line2, area, city, pincode)
- **Jan 24, 2025:** Created SimpleMapPicker component for cleaner address form
- **Jan 24, 2025:** Removed Pause/Cancel buttons from My Subscriptions list
- Added shop location and distance-based delivery pricing
- Added subscription plans with discounts (0%, 10%, 50%)
- Added Admin Settings page for managing pricing and plans
- Added cart and checkout for one-time purchases
- Added shared Header/Footer with Khurpi logo
- Added structured address form (Line 1, Line 2, City, Pincode, Landmark)
- Fixed subscription steps with sticky header and prev/next buttons

## Known Issues
- Login Redirect Race Condition: Users may briefly see login page before being redirected (low priority)
- Subscription price may not recalculate on navigation between steps (needs investigation)

## Last Updated
January 29, 2025

## Change Log
- **Jan 29, 2025:** COMPLETED - Unified Checkout Flow: Subscriptions can now be added to cart and checked out from main checkout page
- **Jan 29, 2025:** SubscriptionCreate.js: "Add to Cart" button now enriches products with full details (name, image, price, pack_size)
- **Jan 29, 2025:** Cart.js: Displays subscription with full product details alongside regular cart items
- **Jan 29, 2025:** Checkout.js: Unified handlePayment function handles subscription-only, cart-only, and mixed cart scenarios
- **Jan 29, 2025:** Checkout.js: Production Razorpay flow now creates both orders AND subscriptions after payment success
- **Jan 29, 2025:** Test Mode: Works for both single orders and subscriptions from unified checkout
- **Jan 29, 2025:** All backend tests passing (13/13) - Unified checkout flow verified
- **Jan 28, 2025:** Added phone number field to address form and display
- **Jan 28, 2025:** Fixed subscription delivery_fee to always be 0 (FREE for all subscriptions)
- **Jan 28, 2025:** Added coupon code input to Checkout page with apply/remove functionality
- **Jan 28, 2025:** Added free delivery threshold setting (₹1000+ orders get free delivery)
- **Jan 28, 2025:** Added "Why Microgreens?" benefits section on Landing page (6 health benefits)
- **Jan 28, 2025:** Fixed Admin Order status update endpoint to accept JSON body
- **Jan 28, 2025:** Added OrderDetail page (`/order/:id`) for viewing single order details
- **Jan 28, 2025:** Made order cards clickable on My Orders page, "+N more" items clickable
- **Jan 28, 2025:** Added Terms & Conditions links to Login, Signup, and Checkout pages
- **Jan 28, 2025:** Added delivery fee display on Addresses page for each address
- **Jan 28, 2025:** Added coupon_code and coupon_discount fields to Order model
- **Jan 28, 2025:** FIXED - Critical payment flow bug where orders weren't being created after successful Razorpay payments
- **Jan 28, 2025:** Fixed `calculate_delivery_fee` function to handle both flat list and nested `{"tiers": [...]}` formats from DB
- **Jan 28, 2025:** Added Admin Orders page (`/admin/orders`) for comprehensive order management with status updates
- **Jan 28, 2025:** Added search, filter, and order detail expansion in Admin Orders page
- **Jan 28, 2025:** All backend tests passing (12/12) - All new features verified
- **Jan 27, 2025:** Added dynamic pack size field to products (configurable from Admin Panel)
- **Jan 27, 2025:** Added CMS for static pages: Privacy Policy, Terms & Conditions, Shipping Policy, Cancellations & Refunds
- **Jan 27, 2025:** Enhanced Address Management with location search bar and dynamic map pins
- **Jan 27, 2025:** Unified user roles - same phone can register as both customer and delivery_boy
- **Jan 26, 2025:** Reverted from OTP to Password-based authentication per user request
