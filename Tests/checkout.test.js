const { test } = require("node:test");
const assert = require("node:assert/strict");

const address = { fullName: " Student ", phone: "9876543210", addressLine1: " 12 Test Road ", city: "Pune", state: "Maharashtra", pincode: "411001" };

test("client shipping validation blocks invalid values and trims valid values", async () => {
  const { validateShipping } = await import("../auth/src/Services/razorpayCheckout.js");
  assert.deepEqual(validateShipping(address).errors, {});
  assert.equal(validateShipping(address).shippingAddress.fullName, "Student");
  assert.equal(validateShipping({ ...address, city: " " }).errors.city, "City is required.");
  assert.ok(validateShipping({ ...address, phone: "1234567890" }).errors.phone);
  assert.ok(validateShipping({ ...address, pincode: "12345" }).errors.pincode);
});

function mockBrowser() {
  const scripts = [];
  global.window = {};
  global.document = {
    querySelector: () => scripts[0] || null,
    createElement: () => {
      const listeners = new Map();
      return {
        addEventListener: (type, fn) => listeners.set(type, fn),
        removeEventListener: (type) => listeners.delete(type),
        dispatch: (type) => listeners.get(type)?.(),
        remove() { const index = scripts.indexOf(this); if (index >= 0) scripts.splice(index, 1); },
      };
    },
    head: { appendChild: (script) => scripts.push(script) },
  };
  return scripts;
}

test("checkout loader shares one script and detects failures with a clean retry", async () => {
  const oldWindow = global.window;
  const oldDocument = global.document;
  try {
    const scripts = mockBrowser();
    const { loadRazorpayCheckout } = await import("../auth/src/Services/razorpayCheckout.js?loader-test");
    const first = loadRazorpayCheckout();
    const second = loadRazorpayCheckout();
    assert.equal(first, second);
    assert.equal(scripts.length, 1);
    scripts[0].dispatch("error");
    await assert.rejects(first, /Unable to load/);
    assert.equal(scripts.length, 0);
    const retry = loadRazorpayCheckout();
    assert.equal(scripts.length, 1);
    window.Razorpay = function TestCheckout() {};
    scripts[0].dispatch("load");
    assert.equal(await retry, window.Razorpay);
    assert.equal(await loadRazorpayCheckout(), window.Razorpay);
    assert.equal(scripts.length, 1);
  } finally {
    if (oldWindow === undefined) delete global.window; else global.window = oldWindow;
    if (oldDocument === undefined) delete global.document; else global.document = oldDocument;
  }
});
