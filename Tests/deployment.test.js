const test = require("node:test");
const assert = require("node:assert/strict");

process.env.NODE_ENV = "production";
const app = require("../server.js");

test("production serves React pages, images, and API responses separately", async () => {
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;

  try {
    for (const page of ["/", "/login", "/product", "/wishlist", "/cart", "/orders"]) {
      const response = await fetch(origin + page);
      assert.equal(response.status, 200, page);
      assert.match(response.headers.get("content-type"), /text\/html/);
      assert.match(await response.text(), /<div id="root">/);
    }

    const image = await fetch(origin + "/products/keyboard-rgb-photo.jpg");
    assert.equal(image.status, 200);
    assert.match(image.headers.get("content-type"), /image\/jpeg/);

    const profile = await fetch(origin + "/api/customer/me");
    assert.equal(profile.status, 401);
    assert.equal((await profile.json()).success, false);

    const missing = await fetch(origin + "/api/missing");
    assert.equal(missing.status, 404);
    assert.equal((await missing.json()).success, false);

    const missingImage = await fetch(origin + "/products/missing.jpg");
    assert.equal(missingImage.status, 404);

    const health = await fetch(origin + "/health");
    assert.equal(health.status, 503);
    assert.equal((await health.json()).success, false);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
      server.closeAllConnections();
    });
  }
});
