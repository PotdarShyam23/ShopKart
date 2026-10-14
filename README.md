# ShopKart

ShopKart is a full-stack MERN shopping application with customer accounts, product browsing, a wishlist, a shopping cart, and Razorpay test checkout.

Customers can save products, manage quantities, place test orders, and view their order history.

The interface includes responsive layouts, product photography, toast notifications, a vibrant color palette, and animations. Component and page styling lives in separate CSS files.

---

## Features

### Authentication

register, log in, log out, and view a customer profile. Passwords are hashed with bcrypt; login uses a JWT stored in an HttpOnly cookie.

### Products

browse product cards, search by name, filter by category, and view product details, prices, images, and stock.

### Wishlist

save and remove products, receive notifications, and see a heart animation on the first wishlist visit in a browser session.

### Cart

add and remove products, change quantities, view item totals and the subtotal, and see animated feedback after a successful quantity update.

### Checkout

enter and validate shipping details, then open Razorpay checkout in test mode.

### Orders

view order confirmation, order history, shipping details, item snapshots, and a timeline based on the saved order status.

### Responsive design

mobile-friendly layouts, reusable icons, loading states, scroll reveals, and reduced-motion support.

### Deployment

one Render service serves the React frontend and Express backend, with MongoDB Atlas storing the data.


---

## Technology stack

| Part | Technologies |
| --- | --- |
| Frontend | React 19, Vite 8, React Router, Axios, React Hot Toast |
| Styling | Separate CSS files, CSS animations, reusable SVG icons |
| Backend | Node.js, Express 5 |
| Database | MongoDB, Mongoose |
| Authentication | JSON Web Tokens, bcryptjs, cookie-parser |
| Payments | Razorpay SDK and browser checkout in test mode |
| Tests | Node.js built-in test runner |

---

## Project structure

```text
ShopKart/
├── Config/                  # Razorpay configuration
├── Controllers/             # Authentication, products, wishlist, cart, orders
├── Middleware/              # JWT authentication middleware
├── Models/                  # Customer, Product, and Order schemas
├── Routes/                  # Express API routes
├── Utils/                   # Token generation and order validation
├── Tests/                   # Order, checkout, wishlist, and deployment tests
├── auth/
│   ├── public/products/     # Product images and photo credits
│   └── src/
│       ├── Components/      # Navbar, product cards, cart items, order timeline
│       ├── Context/         # Shared cart state and cart API actions
│       ├── Pages/           # Authentication, profile, products, cart, orders
│       ├── Services/        # Axios client, notifications, payment helpers
│       ├── App.jsx          # Frontend routes
│       └── main.jsx         # App entry, cart provider, toast display
├── server.js                # Express entry point and MongoDB connection
├── .env.example             # Environment template without secrets
├── .node-version            # Deployment Node.js version
├── render.yaml              # Render service configuration
├── DEPLOYMENT.md            # Deployment walkthrough
└── LAB06.md                 # Checkout implementation and testing notes
```

---

## Local setup

Use **Node.js 22.12 or later within the Node 22 release line**, npm, and a MongoDB connection. Payment verification uses a MongoDB transaction, so use MongoDB Atlas or a local replica set. Razorpay test credentials are required to complete checkout.

### 1. Clone and install

```bash
git clone https://github.com/PotdarShyam23/ShopKart.git
cd ShopKart
npm ci
npm ci --prefix auth
```

### 2. Configure environment variables

Copy `.env.example` to `.env` in the project root and fill in your private values:

```dotenv
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=
JWT_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

| Variable | Purpose |
| --- | --- |
| `PORT` | Backend port; use `5000` with the default local frontend configuration |
| `NODE_ENV` | `development` locally, `production` on Render |
| `CLIENT_URL` | Allowed frontend origin for CORS |
| `MONGO_URI` | MongoDB connection string, including the database name |
| `JWT_SECRET` | Strong random secret for signing login tokens |
| `RAZORPAY_KEY_ID` | Razorpay test key ID beginning with `rzp_test_` |
| `RAZORPAY_KEY_SECRET` | Secret matching the Razorpay test key |

Keep `.env` private; `.gitignore` excludes it. Never put database credentials, the JWT secret, or the Razorpay key secret in frontend code or a `VITE_` variable.

### 3. Start the backend

From the project root:

```bash
npm start
```

The server starts after MongoDB connects and normally listens at `http://localhost:5000`.

### 4. Start the frontend

In a second terminal, from the project root:

```bash
npm run dev --prefix auth
```

Open the URL printed by Vite, normally `http://localhost:5173`. Register and log in to use the shopping features. If Vite uses another port, update `CLIENT_URL` and restart the backend.

The Axios client uses `http://localhost:5000` locally and `/api` in a production build. An optional `VITE_API_URL` can override the API base URL for a different backend address.

Product records live in MongoDB. Cloning this repository does not seed a new database; bundled product images are in `auth/public/products`.

---

## Checkout flow

1. `Checkout.jsx` reads the cart, collects shipping details, and validates the form.

2. `razorpayCheckout.js` loads the Razorpay browser checkout script when needed.

3. The backend reads the authenticated customer's database cart, validates current prices and stock, and creates a pending ShopKart order and a Razorpay order.

4. The frontend opens checkout using the order ID and amount returned by the backend.

5. After payment, the frontend sends the payment identifiers and signature to the backend.

6. The backend checks order ownership and the payment signature. A MongoDB transaction marks the order paid and placed, and clears the customer's database cart.

7. The frontend clears its local cart state and opens the order success page.

Canceling checkout or failing payment does not clear the cart. The backend calculates totals instead of trusting a browser-supplied total. Each saved order retains item name, price, quantity, and image snapshots.

`useOrder.js` loads an individual order. `OrderInfo.jsx` displays its details, `OrderTimeline.jsx` displays its stored progress, and `orderFormat.js` formats rupee amounts and dates. The timeline does not automatically advance an order's status.

---

## API routes

Production uses the `/api` prefix below. Development also supports the original routes without that prefix.

| Method | Endpoint | Purpose | Login required |
| --- | --- | --- | --- |
| POST | `/api/customer/register` | Create an account | No |
| POST | `/api/customer/login` | Sign in | No |
| GET | `/api/customer/me` | Read the current profile | Yes |
| POST | `/api/customer/logout` | Sign out | Yes |
| GET | `/api/product` | List products; supports `search` and `category` | No |
| GET | `/api/product/:id` | Read one product | No |
| POST | `/api/product` | Create a product | Currently no |
| GET | `/api/wishlist` | Read the wishlist | Yes |
| POST | `/api/wishlist/:productId` | Add a wishlist product | Yes |
| DELETE | `/api/wishlist/:productId` | Remove a wishlist product | Yes |
| GET | `/api/cart` | Read the cart | Yes |
| POST | `/api/cart/:productId` | Add a cart product | Yes |
| PATCH | `/api/cart/:productId` | Update quantity | Yes |
| DELETE | `/api/cart/:productId` | Remove a cart product | Yes |
| POST | `/api/orders/create-payment-order` | Create a pending payment order | Yes |
| POST | `/api/orders/verify-payment` | Verify payment and place the order | Yes |
| GET | `/api/orders` | Read the customer's order history | Yes |
| GET | `/api/orders/:id` | Read one of the customer's orders | Yes |
| GET | `/health` | Check service and database readiness | No |

---

## Build and test

Build the frontend from the project root:

```bash
npm run build
```

Run checkout and order tests:

```bash
npm run test:orders
```

Run all current tests, including production routing checks, after building:

```bash
node --test Tests/order.test.js Tests/checkout.test.js Tests/wishlist.test.js Tests/deployment.test.js
```

Tests cover validation, trusted pricing, payment signatures, order ownership, repeated verification, checkout script loading, wishlist responses, and production page/API routing. They do not charge real payments or replace an end-to-end Razorpay test checkout.

Run the frontend lint check:

```bash
npm run lint --prefix auth
```

On Windows PowerShell, use `npm.cmd` instead of `npm` if execution policy blocks `npm.ps1`.

---

## Render deployment

The root `render.yaml` defines one Node web service. Express serves the built frontend, product images, and `/api` routes from the same origin.

| Setting | Value |
| --- | --- |
| Root directory | Repository root |
| Build command | `npm ci && npm run build` |
| Start command | `npm start` |
| Health check | `/health` |

Connect the GitHub repository through Render's Blueprint workflow, enter your MongoDB and Razorpay test credentials, and add the service's outbound IP ranges to Atlas Network Access. The Blueprint generates a JWT secret.

See [DEPLOYMENT.md](DEPLOYMENT.md) for the walkthrough, [LAB06.md](LAB06.md) for checkout implementation notes, and [PHOTO-SOURCES.md](auth/public/products/PHOTO-SOURCES.md) for image credits.

---

## Current scope

- Payments deliberately use **Razorpay test mode**; live keys are rejected.

- Product creation currently has no authentication middleware. Restrict that endpoint before operating a public production catalog.

- There is no admin dashboard, fulfillment workflow, automatic order status advancement, payment webhook reconciliation, or stock reservation/decrement during checkout.

- Order history and payment verification are restricted to the authenticated customer who owns the order.
