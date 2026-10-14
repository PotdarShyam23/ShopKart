import Icon from "../Components/Icon.jsx";
import { useCart } from "../Context/CartContext.jsx";
import notification from "../Services/notification.js";
import "./ProductDetails.css";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../Services/api.js";
import Navbar from "../Components/Navbar.jsx";

function ProductDetails() {
  const { id } = useParams();
  const { addToCart, addingId } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        setError("");
        const response = await api.get(`/product/${id}`);
        setProduct(response.data.product);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Something went wrong while loading the product.",
        );
      } finally {
        setLoading(false);
      }
    }
    // Loads the selected product details.
    fetchProduct();
  }, [id]);

  function getStockLabel() {
    if (product.stock > 0) {
      return `${product.stock} units available`;
    } else {
      return "Out of stock";
    }
  }
  // Returns the stock availability label.

  async function handleAddToCart() {
    const result = await addToCart(product._id);
    if (result?.success) {
      notification.success("Product added to cart", {
        id: "cart-" + product._id,
      });
    } else {
      notification.error(result?.message || "Unable to add this product.");
    }
  }
  // Uses the existing cart action and notification service.

  function getCartLabel() {
    if (addingId === product._id) {
      return "Adding…";
    }
    if (product.stock <= 0) {
      return "Out of stock";
    }
    return "Add to cart";
  }

  return (
    <div>
      <Navbar />
      <main className="page-shell detail-shell">
        <Link className="subtle-link" to="/product">
          <Icon name="back" />
          Back to the collection
        </Link>
        {loading && (
          <div className="detail-state" role="status">
            <Icon name="loader" className="icon-spin" />
            <p>Loading your find…</p>
          </div>
        )}
        {error && (
          <div className="detail-state" role="alert">
            {error}
          </div>
        )}
        {!loading && !error && product && (
          <article
            className={
              "product-details category-" + product.category.toLowerCase()
            }
          >
            <div className="detail-image">
              <img src={product.image} alt={product.name} />
            </div>
            <div className="detail-copy">
              <span className="eyebrow">{product.category}</span>
              <h1>{product.name}</h1>
              <p className="detail-description">{product.description}</p>
              <p className="detail-price">
                ₹{product.price.toLocaleString("en-IN")}
              </p>
              <p className="detail-stock">
                <Icon name="check" />
                {getStockLabel()}
              </p>
              <button
                className="detail-cart-button"
                onClick={handleAddToCart}
                disabled={product.stock <= 0 || addingId === product._id}
              >
                <Icon name="cart" />
                {getCartLabel()}
                <Icon name="arrow" />
              </button>
              <div className="detail-facts">
                <span>
                  <Icon name="bag" />
                  Your next everyday essential
                </span>
                <span>
                  <Icon name="package" />
                  Product details saved with your order
                </span>
              </div>
            </div>
          </article>
        )}
      </main>
    </div>
  );
}
// Displays product details with the existing cart action.
export default ProductDetails;
