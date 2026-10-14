import Icon from "../Components/Icon.jsx";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar.jsx";
import CartItem from "../Components/CartItem.jsx";
import { useCart } from "../Context/CartContext.jsx";
import "./Cart.css";
const money = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
// Formats a price as Indian rupees.

function Cart() {
  const navigate = useNavigate();
  const {
    cartItems,
    cartLoading,
    cartError,
    totalUnits,
    subtotal,
    refreshCart,
  } = useCart();

  function getItemCountLabel() {
    if (totalUnits === 1) {
      return "item";
    } else {
      return "items";
    }
  }
  // Returns the singular or plural item label.

  function renderCartContent() {
    if (cartLoading) {
      return (
        <div className="cart-state" role="status">
          <span className="cart-loader" aria-hidden="true" />
          <h2>Getting your cart ready</h2>
          <p>Loading your selected items…</p>
        </div>
      );
    } else if (cartError && cartItems.length === 0) {
      return (
        <div className="cart-state">
          <div className="cart-state-icon" aria-hidden="true">
            !
          </div>
          <h2>We couldn't load your cart</h2>
          <p role="alert">{cartError}</p>
          <button type="button" onClick={refreshCart}>
            Try again
          </button>
        </div>
      );
    } else if (cartItems.length === 0) {
      return (
        <div className="cart-state">
          <div className="cart-state-icon" aria-hidden="true">
            <Icon name="bag" />
          </div>
          <h2>Your next find is waiting</h2>
          <p>
            Your cart is empty. Explore the collection and add something you
            love.
          </p>
          <Link className="cart-primary-link" to="/product">
            Explore products <Icon name="arrow" />
          </Link>
        </div>
      );
    } else {
      return (
        <>
          {cartError && (
            <div className="cart-alert" role="alert">
              {cartError}
            </div>
          )}
          <div className="cart-layout">
            <div className="cart-items" aria-label="Cart items">
              {cartItems.map((cartItem) => (
                <CartItem
                  key={cartItem._id || cartItem.product?._id}
                  cartItem={cartItem}
                />
              ))}
            </div>
            <aside
              className="cart-summary"
              aria-labelledby="cart-summary-title"
            >
              <p className="cart-eyebrow">THE DETAILS</p>
              <h2 id="cart-summary-title">
                <Icon name="package" />
                Order summary
              </h2>
              <dl>
                <div>
                  <dt>Items ({totalUnits})</dt>
                  <dd>{money(subtotal)}</dd>
                </div>
                <div>
                  <dt>Delivery</dt>
                  <dd className="cart-delivery">At checkout</dd>
                </div>
              </dl>
              <div className="cart-summary-total">
                <span>Subtotal</span>
                <strong>{money(subtotal)}</strong>
              </div>
              <p className="cart-summary-note">
                Final prices and stock are checked at checkout. This lab adds no
                extra fees.
              </p>
              <button
                className="cart-checkout"
                type="button"
                onClick={() => navigate("/checkout")}
              >
                Proceed to checkout <span aria-hidden="true">→</span>
              </button>
              <Link className="cart-summary-link" to="/product">
                Keep exploring the collection
              </Link>
            </aside>
          </div>
        </>
      );
    }
  }
  // Displays the cart’s loading, error, empty or populated state.

  return (
    <div className="cart-page">
      <Navbar />
      <main className="cart-shell">
        <Link className="cart-back" to="/product">
          <Icon name="back" /> Continue shopping
        </Link>
        <header className="cart-header">
          <div>
            <p className="cart-eyebrow">YOUR SHOPPING BAG</p>
            <h1>
              <span className="cart-heading-icon">
                <Icon name="cart" />
              </span>
              My cart<span className="cart-count">{totalUnits}</span>
            </h1>
          </div>
          {!cartLoading && cartItems.length > 0 && (
            <p>
              {totalUnits} {getItemCountLabel()} selected
            </p>
          )}
        </header>
        {renderCartContent()}
      </main>
    </div>
  );
}
// Displays the current cart and its checkout link.

export default Cart;
