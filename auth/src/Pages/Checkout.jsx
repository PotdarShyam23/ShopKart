import Icon from "../Components/Icon.jsx";
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar.jsx";
import { useCart } from "../Context/CartContext.jsx";
import api from "../Services/api.js";
import notification from "../Services/notification.js";
import {
  loadRazorpayCheckout,
  validateShipping,
} from "../Services/razorpayCheckout.js";
import { formatMoney } from "../Services/orderFormat.js";
import "./Orders.css";
const shippingFields = [
  ["fullName", "Full name", "name"],
  ["phone", "Phone", "tel-national"],
  ["addressLine1", "Address line 1", "street-address"],
  ["city", "City", "address-level2"],
  ["state", "State", "address-level1"],
  ["pincode", "Pincode", "postal-code"],
];

function Checkout() {
  const { cartItems, subtotal, cartLoading, cartError, clearCart } = useCart();
  const navigate = useNavigate();
  const [shipping, setShipping] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [verification, setVerification] = useState(null);
  const processingLock = useRef(false);
  const verificationStarted = useRef(false);

  async function confirmPayment(payload) {
    verificationStarted.current = true;
    setProcessing(true);
    setVerification(payload);
    setError("");
    try {
      const response = await api.post("/orders/verify-payment", payload);
      if (
        !response.data.success ||
        response.data.order.paymentStatus !== "PAID"
      ) {
        throw new Error("Payment could not be verified.");
      }
      // The browser callback alone never clears the cart.
      clearCart();
      notification.success("Payment verified. Your order is placed.");
      navigate("/order-success/" + response.data.order._id, {
        replace: true,
      });
    } catch (failure) {
      setError(
        failure.response?.data?.message ||
          failure.message ||
          "Payment verification failed. Please retry verification before making another payment.",
      );
    } finally {
      setProcessing(false);
      processingLock.current = false;
    }
  }
  // Asks the backend to verify payment before clearing the cart and navigating.

  // processingLock helps to duplicate entry blovk it

  async function handleCheckout(event) {
    event.preventDefault();
    if (processingLock.current) {
      return;
    }
    const { shippingAddress, errors } = validateShipping(shipping);
    setFieldErrors(errors);
    setError("");
    if (Object.keys(errors).length) {
      return;
    }
    if (
      cartLoading ||
      !cartItems.length ||
      cartItems.some((item) => !item.product)
    ) {
      setError("Please review your cart before checkout.");
      return;
    }
    processingLock.current = true;
    verificationStarted.current = false;
    setProcessing(true);
    try {
      const RazorpayCheckout = await loadRazorpayCheckout();
      const response = await api.post("/orders/create-payment-order", {
        shippingAddress,
      });
      const payment = response.data;
      if (!payment.success || !payment.key?.startsWith("rzp_test_")) {
        throw new Error("Razorpay Test Mode is not configured.");
      }
      const checkout = new RazorpayCheckout({
        key: payment.key,
        amount: payment.amount,
        currency: payment.currency,
        order_id: payment.razorpayOrderId,
        name: "ShopKart",
        description: "ShopKart order — Test Mode",
        prefill: {
          name: shippingAddress.fullName,
          contact: shippingAddress.phone,
        },
        handler: (result) =>
          confirmPayment({
            shopKartOrderId: payment.shopKartOrderId,
            razorpay_order_id: result.razorpay_order_id,
            razorpay_payment_id: result.razorpay_payment_id,
            razorpay_signature: result.razorpay_signature,
          }),
        modal: {
          ondismiss: () => {
            if (verificationStarted.current) {
              return;
            }
            setError("Payment window closed. Your cart is unchanged.");
            setProcessing(false);
            processingLock.current = false;
          },
        },
      });
      checkout.on("payment.failed", (result) => {
        setError(
          result.error?.description ||
            "Payment failed. Retry in Razorpay or close the payment window. Your cart is unchanged.",
        );
      });
      checkout.open();
    } catch (failure) {
      setError(
        failure.response?.data?.message ||
          failure.message ||
          "Unable to start checkout.",
      );
      setProcessing(false);
      processingLock.current = false;
    }
  }
  // Validates shipping, creates a pending order and opens Test Mode Checkout.

  const unavailableItems = cartItems.some((item) => !item.product);

  function renderCheckoutContent() {
    if (cartLoading) {
      return <p role="status">Loading your cart…</p>;
    } else if (cartItems.length === 0) {
      return (
        <div className="order-panel">
          <h2>Your cart is empty</h2>
          <p>{cartError || "Add some products before checkout."}</p>
          <Link to="/product">Browse products</Link>
        </div>
      );
    } else {
      function getShippingFieldClassName(field) {
        if (field === "addressLine1") {
          return "shipping-wide";
        } else {
          return "";
        }
      }
      // Returns the shipping field’s layout class.

      function getInputType(field) {
        if (field === "phone") {
          return "tel";
        } else {
          return "text";
        }
      }
      // Returns the appropriate input type for this shipping field.

      function getInputMode(field) {
        if (field === "phone" || field === "pincode") {
          return "numeric";
        } else {
          return undefined;
        }
      }
      // Returns the keyboard input mode for this shipping field.

      function getInputMaxLength(field) {
        if (field === "phone") {
          return 10;
        } else if (field === "pincode") {
          return 6;
        } else if (field === "addressLine1") {
          return 500;
        } else {
          return 200;
        }
      }
      // Returns the character limit for this shipping field.

      function getFieldErrorId(field) {
        if (fieldErrors[field]) {
          return field + "-error";
        } else {
          return undefined;
        }
      }
      // Links a shipping field to its validation error.

      function renderPaymentButton() {
        if (verification) {
          function getPaymentButtonLabel() {
            if (processing) {
              return "Verifying payment…";
            } else {
              return "Retry payment verification";
            }
          }
          // Returns the payment button’s current label.

          return (
            <button
              type="button"
              disabled={processing}
              onClick={() => {
                if (!processingLock.current) {
                  processingLock.current = true;
                  confirmPayment(verification);
                }
              }}
            >
              {getPaymentButtonLabel()}
            </button>
          );
        } else {
          function getPaymentButtonLabel2() {
            if (processing) {
              return "Processing payment…";
            } else {
              return "Pay with Razorpay";
            }
          }
          // Returns the payment button’s current label.

          return (
            <button type="submit" disabled={processing || unavailableItems}>
              <Icon name="lock" />
              {getPaymentButtonLabel2()}
            </button>
          );
        }
      }
      // Displays the payment or verification retry button.

      return (
        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={handleCheckout} noValidate>
            <h2>
              <Icon name="pin" />
              Shipping address
            </h2>
            <fieldset disabled={processing || Boolean(verification)}>
              <div className="shipping-grid">
                {shippingFields.map(([field, label, autocomplete]) => {
                  return (
                    <div
                      className={getShippingFieldClassName(field)}
                      key={field}
                    >
                      <label htmlFor={field}>{label}</label>
                      <input
                        id={field}
                        name={field}
                        value={shipping[field]}
                        autoComplete={autocomplete}
                        type={getInputType(field)}
                        inputMode={getInputMode(field)}
                        maxLength={getInputMaxLength(field)}
                        required
                        aria-invalid={Boolean(fieldErrors[field])}
                        aria-describedby={getFieldErrorId(field)}
                        onChange={(event) =>
                          setShipping((current) => ({
                            ...current,
                            [field]: event.target.value,
                          }))
                        }
                      />
                      {fieldErrors[field] && (
                        <p className="order-field-error" id={field + "-error"}>
                          {fieldErrors[field]}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </fieldset>
            {error && (
              <p className="order-error" role="alert">
                {error}
              </p>
            )}
            {unavailableItems && (
              <p className="order-error" role="alert">
                A product is no longer available. Remove it from your cart
                first.
              </p>
            )}
            {renderPaymentButton()}
            <p className="order-muted">
              Test payments only. Card details are entered in Razorpay, never in
              ShopKart.
            </p>
          </form>
          <aside className="order-panel checkout-summary">
            <h2>
              <Icon name="package" />
              Order summary
            </h2>
            <ul className="checkout-items">
              {cartItems.map((item) => (
                <li key={item._id || item.product?._id}>
                  <div>
                    <strong>
                      {item.product?.name || "Unavailable product"}
                    </strong>
                    <span>
                      {item.quantity} × {formatMoney(item.product?.price || 0)}
                    </span>
                  </div>
                  <strong>
                    {formatMoney((item.product?.price || 0) * item.quantity)}
                  </strong>
                </li>
              ))}
            </ul>
            <div className="order-total">
              <span>Subtotal</span>
              <strong>{formatMoney(subtotal)}</strong>
            </div>
            <p className="order-muted">
              Final prices and stock are validated by the server. This lab adds
              no delivery fees or taxes.
            </p>
          </aside>
        </div>
      );
    }
  }
  // Displays the checkout’s loading, empty or populated state.

  return (
    <div>
      <Navbar />
      <main className="order-page">
        <Link to="/cart">← Back to cart</Link>
        <div className="checkout-steps" aria-label="Checkout steps">
          <Link className="checkout-step" to="/cart">
            <Icon name="check" />
            Shopping bag
          </Link>
          <span className="step-divider" />
          <span className="checkout-step is-current" aria-current="step">
            <Icon name="pin" />
            Shipping & payment
          </span>
          <span className="step-divider" />
          <span className="checkout-step">
            <Icon name="package" />
            Confirmation
          </span>
        </div>
        <header className="order-heading">
          <p className="order-eyebrow">RAZORPAY TEST MODE</p>
          <h1>Checkout</h1>
          <p>Add your shipping details, then pay securely with Razorpay.</p>
        </header>
        {renderCheckoutContent()}
      </main>
    </div>
  );
}
// Displays shipping inputs and handles the test payment flow.

export default Checkout;
