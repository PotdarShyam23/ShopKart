# Deploy ShopKart on Render

This repository runs the React frontend and Express backend in one Render web service. MongoDB stays in your existing Atlas database. All styling remains in separate CSS files.

## 1. Upload the source to GitHub

Use your repository: https://github.com/PotdarShyam23/ShopKart

Include the root backend folders, `server.js`, both package manifests and lockfiles, `render.yaml`, `.node-version`, and the `auth` frontend, including `auth/public/products`. Do not upload `.env`, `node_modules`, `auth/dist`, or `.tmp`. The root `.gitignore` excludes them.

## 2. Create the Render service

In https://dashboard.render.com choose **New → Blueprint**, connect your GitHub repository, and use the root `render.yaml`. It defines one free Node web service.

When prompted, enter these private values from your local `.env`:

| Variable | Value |
| --- | --- |
| `MONGO_URI` | Your existing Atlas connection string, including the same database name |
| `RAZORPAY_KEY_ID` | Your Razorpay **test** key ID (`rzp_test_...`) |
| `RAZORPAY_KEY_SECRET` | The matching test secret |

Render generates `JWT_SECRET` and sets `NODE_ENV=production`. No frontend secret or `VITE_API_URL` is needed. Render supplies `PORT` automatically.

If you create a **Web Service** manually instead, leave Root Directory blank, choose Node, and enter:

```text
Build Command: npm ci && npm run build
Start Command: npm start
Health Check Path: /health
```

Choose Free and set the variables above plus `NODE_ENV=production` and a strong random `JWT_SECRET`.

## 3. Allow Render to reach Atlas

Open your Render service's **Connect → Outbound** tab. Add the listed CIDR ranges to MongoDB Atlas **Network Access**. Keep your existing local IP entry if you still develop locally. Confirm the Atlas cluster is active and the connection string credentials are correct. A DNS `querySrv ESERVFAIL` error means the hostname lookup failed; it is different from an Atlas IP access error.

## 4. Check the public app

After Render reports a successful deploy, open its `https://...onrender.com` URL. Verify login, products and images, adding to cart and wishlist, and refreshing `/cart` and `/wishlist` directly. Use Razorpay test payments only: the existing checkout deliberately rejects live keys.

`/health` reports ready only while MongoDB is connected. `/api/...` routes return backend JSON; page URLs render React. Existing development URLs on localhost still work. Production authentication cookies use HTTPS.

## Notes

- The Free service can spin down when idle, so the first visit can take longer.
- Product creation currently has no authentication middleware. Anyone who can access `POST /api/product` can create products; restrict that endpoint before using a public production catalog.
- This is a test-payment deployment, not a live payment launch.

## References

- https://render.com/docs/blueprint-spec
- https://render.com/docs/web-services
- https://render.com/docs/free
- https://render.com/docs/outbound-ip-addresses
- https://www.mongodb.com/docs/atlas/security/ip-access-list/
