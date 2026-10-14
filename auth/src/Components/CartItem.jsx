import Icon from "./Icon.jsx";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../Context/CartContext.jsx";
import "./CartItems.css";
const money = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
// Formats a price as Indian rupees.

function CartItem({ cartItem }) {
  const { updateQuantity, removeFromCart, updatingId, removingId } = useCart();
  const { product, quantity } = cartItem;
  const [failedImage, setFailedImage] = useState(null);
  const [feedbackVersion, setFeedbackVersion] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    if (feedbackVersion === 0) {
      return;
    }
    const timer = setTimeout(() => setShowFeedback(false), 1400);
    return () => clearTimeout(timer);
  }, [feedbackVersion]);

  if (!product) {
    return (
      <article className="cart-item cart-item-unavailable">
        <p>This product is no longer available.</p>
      </article>
    );
  }
  const isUpdating = updatingId === product._id;
  const isRemoving = removingId === product._id;
  const busy = isUpdating || isRemoving;

  async function handleQuantityChange(nextQuantity) {
    setShowFeedback(false);
    const result = await updateQuantity(product._id, nextQuantity);
    if (result?.success) {
      setFeedbackVersion((version) => version + 1);
      setShowFeedback(true);
    }
  }
  // Shows confirmation only after the backend successfully updates the quantity.

  function getItemClass() {
    if (showFeedback) {
      return "cart-item cart-item-updated";
    }
    return "cart-item";
  }

  function getValueClass() {
    if (showFeedback) {
      return "cart-updated-value";
    }
    return "";
  }

  function renderProductImage() {
    if (product.image && failedImage !== product.image) {
      return (
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          onError={() => setFailedImage(product.image)}
        />
      );
    } else {
      return <span className="cart-image-fallback">Image unavailable</span>;
    }
  }
  // Displays the product image or its unavailable-image fallback.

  function getStockClassName() {
    if (product.stock > 0) {
      return "cart-stock";
    } else {
      return "cart-stock cart-stock-empty";
    }
  }
  // Returns the CSS class for the product’s stock state.

  function getStockLabel() {
    if (product.stock > 0) {
      return "In stock";
    } else {
      return "Out of stock";
    }
  }
  // Returns the stock availability label.

  function getRemoveButtonLabel() {
    if (isRemoving) {
      return "Removing…";
    } else {
      return "Remove";
    }
  }
  // Returns the remove button’s current label.

  return (
    <article className={getItemClass()} aria-busy={busy}>
      <Link
        className="cart-item-image"
        to={"/product/" + product._id}
        aria-label={"View " + product.name}
      >
        {renderProductImage()}
      </Link>

      <div className="cart-item-details">
        <p className="cart-eyebrow">{product.category || "Product"}</p>

        <h2>
          <Link to={"/product/" + product._id}>{product.name}</Link>
        </h2>

        <p className="cart-unit-price">
          {money(product.price)} <span>/ each</span>
        </p>

        <p className={getStockClassName()}>
          <span aria-hidden="true">●</span> {getStockLabel()}
        </p>
        <div className="cart-item-actions">
          <div
            className="cart-quantity"
            role="group"
            aria-label={"Quantity for " + product.name}
          >
            <button
              type="button"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1 || busy}
              aria-label={"Decrease quantity of " + product.name}
            >
              <Icon name="minus" />
            </button>

            <span
              className={getValueClass()}
              key={feedbackVersion}
              aria-live="polite"
            >
              {quantity}
            </span>

            <button
              type="button"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= product.stock || busy}
              aria-label={"Increase quantity of " + product.name}
            >
              <Icon name="plus" />
            </button>
          </div>

          <button
            className="cart-remove"
            type="button"
            onClick={() => removeFromCart(product._id)}
            disabled={busy}
            aria-label={"Remove " + product.name + " from cart"}
          >
            <Icon name="trash" />
            {getRemoveButtonLabel()}
          </button>

          <span className="cart-action-status" role="status" aria-live="polite">
            {isUpdating && <span className="cart-updating">Updating…</span>}
            {!isUpdating && showFeedback && (
              <span className="cart-updated-notice">
                <Icon name="check" />
                Updated<span className="sr-only"> to {quantity} units</span>
              </span>
            )}
          </span>
        </div>
      </div>
      <div className="cart-line-total">
        <span>Item total</span>
        <strong className={getValueClass()} key={feedbackVersion}>
          {money(product.price * quantity)}
        </strong>
      </div>
    </article>
  );
}
// Displays one cart product and its quantity and remove controls.

export default CartItem;
