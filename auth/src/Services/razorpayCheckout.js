let checkoutScriptPromise;
const scriptUrl = "https://checkout.razorpay.com/v1/checkout.js";

export function loadRazorpayCheckout() {
  if (window.Razorpay) {
    return Promise.resolve(window.Razorpay);
  }
  if (checkoutScriptPromise) {
    return checkoutScriptPromise;
  }
  checkoutScriptPromise = new Promise((resolve, reject) => {
    let script = document.querySelector('script[src="' + scriptUrl + '"]');
    const existing = Boolean(script);
    if (!script) {
      script = document.createElement("script");
      script.src = scriptUrl;
      script.async = true;
    }
    const cleanup = () => {
      clearTimeout(timer);
      script.removeEventListener("load", loaded);
      script.removeEventListener("error", failed);
    };
    // Handles cleanup.

    const failed = () => {
      cleanup();
      script.remove();
      reject(
        new Error(
          "Unable to load Razorpay Checkout. Check your connection and try again.",
        ),
      );
    };
    // Handles failed.

    const loaded = () => {
      if (!window.Razorpay) {
        return failed();
      }
      cleanup();
      resolve(window.Razorpay);
    };
    // Handles loaded.

    const timer = setTimeout(failed, 15000);
    script.addEventListener("load", loaded, {
      once: true,
    });
    script.addEventListener("error", failed, {
      once: true,
    });
    if (!existing) {
      document.head.appendChild(script);
    }
  }).catch((error) => {
    checkoutScriptPromise = undefined;
    throw error;
  });
  return checkoutScriptPromise;
}
// Loads Razorpay Checkout once and handles loading failures.

export function validateShipping(address) {
  const labels = {
    fullName: "Full name",
    phone: "Phone",
    addressLine1: "Address",
    city: "City",
    state: "State",
    pincode: "Pincode",
  };
  const shippingAddress = {};
  const errors = {};
  for (const [field, label] of Object.entries(labels)) {
    shippingAddress[field] = address[field].trim();
    if (!shippingAddress[field]) {
      errors[field] = label + " is required.";
    }
  }
  if (shippingAddress.phone && !/^[6-9][0-9]{9}$/.test(shippingAddress.phone)) {
    errors.phone = "Enter a valid 10-digit Indian mobile number.";
  }
  if (shippingAddress.pincode && !/^[0-9]{6}$/.test(shippingAddress.pincode)) {
    errors.pincode = "Enter a 6-digit pincode.";
  }
  return {
    shippingAddress,
    errors,
  };
}
// Validates shipping fields before making a checkout request.
