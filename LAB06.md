# Engineering Lab 06: Checkout, Test Payment and Orders

## What is implemented

Cart → Checkout → shipping validation → latest database cart/price/stock validation → pending ShopKart order → Razorpay Test Order → Standard Checkout → backend signature verification → PAID/PLACED → database and React cart clearing → confirmation → order history/details.

All order APIs use the existing JWT cookie middleware and Customer model. React keeps using the existing CartContext. Existing login, products, wishlist and cart routes remain in place.

## Start the application

From the project root:

```powershell
npm install
npm start
```

In a second terminal:

```powershell
cd auth
npm install
npm run dev
```

The SDK was installed during implementation. Restart the existing backend to mount /orders and load environment changes.

## Environment configuration

Keep existing PORT, MONGO_URI and JWT_SECRET in the root .env. Add these values manually:

```dotenv
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

Use your own Test Mode key pair. The application requires the key ID to begin with rzp_test_ and rejects missing/live keys. Do not put the secret in React, VITE_ variables, screenshots, source code or API responses. Only the key ID is sent to Checkout.

The root .gitignore ignores .env and other environment files while keeping .env.example. No existing secret values were printed or changed.

Payment verification uses a MongoDB transaction, so MONGO_URI must connect to MongoDB Atlas or a replica set. A standalone local MongoDB server must be configured as a replica set before this flow can confirm payments. Do not replace this transaction with two uncoordinated writes: a failed second write could leave a paid order with an uncleared cart.

## Razorpay Dashboard steps

1. Sign in to your Razorpay Dashboard and switch to Test Mode.
2. Under Account & Settings → API Keys, obtain/generate your Test Mode key pair yourself.
3. Add the test key ID and secret to the backend .env, then restart npm start.
4. Configure automatic payment capture in the Dashboard for the test integration.
5. Use only the test payment methods described by Razorpay; do not enter real card details or run a live payment.

Official references:
- https://razorpay.com/docs/payments/dashboard/account-settings/api-keys/
- https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/

## Backend APIs

| Method | Path | Purpose |
| --- | --- | --- |
| POST | /orders/create-payment-order | Validate shipping and current database cart; create ShopKart and Razorpay orders |
| POST | /orders/verify-payment | Verify HMAC and atomically place order and clear customer cart |
| GET | /orders | Current customer's orders, newest first |
| GET | /orders/:id | Current customer's single order |

The creation request sends only shippingAddress: fullName, phone, addressLine1, city, state and pincode. Phone is a 10-digit Indian mobile number beginning with 6–9; pincode is six digits. Blank/whitespace fields are rejected on both sides.

The verification request contains shopKartOrderId, razorpay_order_id, razorpay_payment_id and razorpay_signature. These come from the successful Razorpay callback. Browser-provided totals, items, customer IDs and payment-success booleans are never trusted.

## Security decisions

- Snapshots: Each order saves the product's name, image, price and quantity, rather than displaying a freshly populated product later. Product changes/deletion do not rewrite previous purchases.
- Backend totals: The server uses Product prices multiplied by valid integer quantities. It rounds the final total to paise and creates the gateway order in INR.
- Stock: The server populates the latest Product documents and checks available stock before creating a payment order. Deleted products, invalid quantities and insufficient stock stop checkout.
- Razorpay order: A pending ShopKart order exists first. The SDK creates a test gateway order with a receipt linked to that order. Creating/opening the order does not clear either cart.
- Signature: HMAC-SHA256 signs the stored Razorpay order ID plus payment ID with the backend-only secret. The browser order ID must match the stored one; hexadecimal signatures are compared with timingSafeEqual.
- Ownership: Every read and verification query filters by req.user.id. Another customer's order returns 404.
- Cart clearing: PAID/PLACED and the backend cart update commit together in a transaction. React clears its cart only after receiving the successful verified response. Repeated valid verification returns the paid order without clearing a newly filled cart.
- Failures: Gateway creation failure records FAILED and preserves the cart. Invalid signatures, cancelled windows, script failures and verification failures preserve the cart. The checkout page can retry backend verification without starting another payment.

## Validation performed

- Frontend production build passed.
- All backend JavaScript files passed node --check.
- npm run test:orders passed 15 isolated tests, including shipping, stock, price tampering, HMAC tampering, ownership, replay behaviour and script-loader failure/retry. Tests use mocked gateway/database responses and make no payments or database changes.
- Configured frontend lint was run. Two existing errors remain in CartContext.jsx: react-hooks/set-state-in-effect on the mount refresh, and react-refresh/only-export-components on the shared hook export. The new checkout/order files have no lint errors.

Repeat checks:

```powershell
npm run test:orders
cd auth
npm run build
npm run lint
```

## Manual testing checklist

- Sign up/log in, browse products, add/remove wishlist items, and update cart quantities to confirm existing features still work.
- Empty cart: /checkout shows the empty state and a products link.
- Shipping: submit blanks, spaces, invalid mobile numbers and short pincodes. No order API call should occur.
- Backend validation: use an authenticated API request with a bad address; test insufficient stock and a deleted cart product. Confirm useful errors and an unchanged cart.
- Price tampering: send extra total/items/user fields to creation. Confirm the order amount still comes from the authenticated customer's database cart.
- Without Razorpay keys: checkout returns a useful configuration error and retains the cart.
- Script loading: block checkout.razorpay.com to verify a load error and retry.
- Gateway modal: open it and cancel/fail a Test Mode attempt. Cart items must remain.
- Test success: complete a Test Mode payment. Confirm PAID/PLACED, Cart (0), and the order success page.
- Refresh success/details pages: saved snapshots and address should load from the backend.
- My Orders: confirm newest-first ordering and working details links.
- Tamper with a signature/order ID: verification must fail without clearing the cart.
- Use customer B to request customer A's order: expect 404.
- Replay a valid verification after adding fresh cart items: the backend must not clear the fresh cart.

## Assumptions and remaining limits

- Razorpay Test Mode credentials were not configured at implementation time. They must be supplied manually; no end-to-end provider payment was attempted.
- MongoDB supports transactions (Atlas or replica set).
- This lab does not add delivery charges, taxes, stock reservations/decrements, fulfillment updates, refunds or webhooks. Stock is validated at payment-order creation; this is not a production inventory reservation system.
- Confirmation follows the required Standard Checkout callback plus backend HMAC verification. A lost callback or browser refresh during verification can leave a pending order; production systems need webhook/reconciliation handling. Do not pay again without checking the test dashboard if a payment completed but confirmation was interrupted.
- Existing CartContext lint findings are documented rather than restructuring working cart code.
- Backend npm audit reports one critical proxy-addr finding in the existing Express dependency tree. This is not a Razorpay dependency, and this server does not configure trust proxy. No unrelated automatic dependency upgrades were made. Review the audit before any deployment.
