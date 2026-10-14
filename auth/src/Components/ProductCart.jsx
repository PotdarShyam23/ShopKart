import Icon from "./Icon.jsx";
import { useState } from "react";
import "./ProductCart.css";
import { Link } from "react-router-dom";
import notification from "../Services/notification.js";
import api from "../Services/api.js";
import { useCart } from "../Context/CartContext.jsx";

function ProductCard({ product }) {
  const { addToCart, addingId } = useCart();
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [failedImage, setFailedImage] = useState(null);

  async function handleAddToCart() {
    try {
      const result = await addToCart(product._id);
      if (result?.success) {
        notification.success("Product added to cart", {
          id: "cart-" + product._id,
        });
      } else {
        notification.error(
          result?.message || "Couldn’t add this item. Please try again.",
          {
            id: "cart-" + product._id,
          },
        );
      }
    } catch (error) {
      notification.error(
        error.response?.data?.message ||
          "Couldn’t add this item. Please try again.",
        {
          id: "cart-" + product._id,
        },
      );
    }
  }
  // Adds the product to the cart and shows a notification.

  async function handleAddtoWishlist() {
    try {
      setWishlistLoading(true);
      const response = await api.post("/wishlist/" + product._id);
      if (response.data.success) {
        notification.success("Product added to wishlist", {
          id: "wishlist-" + product._id,
        });
      } else {
        notification.error(
          response.data.message || "Couldn’t save this item. Please try again.",
          {
            id: "wishlist-" + product._id,
          },
        );
      }
    } catch (error) {
      notification.error(
        error.response?.data?.message ||
          "Couldn’t save this item. Please try again.",
        {
          id: "wishlist-" + product._id,
        },
      );
    } finally {
      setWishlistLoading(false);
    }
  }
  // Adds the product to the wishlist and shows a notification.

  function getStockLabel() {
    if (product.stock > 0) {
      return `${product.stock} units available`;
    } else {
      return "No stocks left";
    }
  }
  // Returns the stock availability label.

  function getWishlistButtonLabel() {
    if (wishlistLoading) {
      return "Saving…";
    } else {
      return "Add to Wishlist";
    }
  }
  // Returns the wishlist button’s current label.

  function getCartButtonLabel() {
    if (addingId === product._id) {
      return "Adding…";
    } else if (product.stock <= 0) {
      return "Out of stock";
    } else {
      return "Add to Cart";
    }
  }
  // Returns the cart button’s current label.

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
    }
    return (
      <span className="product-image-fallback">
        <Icon name="package" />
        Image unavailable
      </span>
    );
  }
  // Displays the image or an accessible fallback.

  return (
    <article
      className={"product-card category-" + product.category.toLowerCase()}
    >
      <Link
        className="product-media"
        to={"/product/" + product._id}
        aria-label={"View " + product.name}
      >
        {renderProductImage()}
        <span className="product-view-hint">
          <Icon name="arrow" />
        </span>
      </Link>
      <div className="product-card-body">
        <p className="product-category">{product.category}</p>
        <h2>
          <Link to={"/product/" + product._id}>{product.name}</Link>
        </h2>
        <div className="product-price-row">
          <p className="product-price">
            ₹{product.price.toLocaleString("en-IN")}
          </p>
          <span className="product-stock">{getStockLabel()}</span>
        </div>
        <div className="product-actions">
          <button
            className="product-add-button"
            onClick={handleAddToCart}
            disabled={addingId === product._id || product.stock <= 0}
          >
            {addingId === product._id && (
              <Icon name="loader" className="icon-spin" />
            )}
            {addingId !== product._id && <Icon name="plus" />}
            {getCartButtonLabel()}
          </button>
          <button
            className="product-wishlist-button"
            onClick={handleAddtoWishlist}
            disabled={wishlistLoading}
            aria-label={getWishlistButtonLabel() + ": " + product.name}
            title="Add to wishlist"
          >
            <Icon name="heart" />
          </button>
        </div>
      </div>
    </article>
  );
}
// Displays a product and its wishlist and cart actions.
export default ProductCard;
