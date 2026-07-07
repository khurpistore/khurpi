# Test Credentials

## Admin (Super Admin)
- Login URL: /admin/login
- Username: `admin`
- Password: `Khurpi2026Secure`
- Auth: `POST /api/admin/login` with JSON body `{"username","password"}` returns a JWT `token`.
  All `/api/admin/*` routes and product write routes (POST/PUT/DELETE /api/products) now REQUIRE
  header `Authorization: Bearer <token>` (enforced by admin_auth_middleware). Frontend sets this
  globally after admin login (AuthContext -> axios.defaults). Token role=admin, expiry per JWT_EXPIRATION_HOURS.
- After login, select a project (default project id = `default`, name "Khurpi").

## Customer (test account)
- Login URL: /login (phone + password or OTP via MSG91)
- Phone: `9971818259`
- Password: `test1234`

## Delivery Boy
- Login URL: /delivery/login (POST /api/delivery-boy/login)
- Created by admin via /admin/deliveries (delivery boys section).

## Notes
- MSG91 OTP auth for customers (requires MSG91_AUTH_KEY).
- Razorpay test keys in backend/.env.
