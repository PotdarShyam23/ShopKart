import { Link } from "react-router-dom";
import Icon from "../Components/Icon.jsx";
import "../Components/ProductCart.css";
import "./Wishlist.css";
import { useState, useEffect } from "react";
import api from "../Services/api";
import Navbar from "../Components/Navbar.jsx";

const wishlistIntroKey = "shopkart-wishlist-intro-seen";

function shouldShowWishlistIntro() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return false;
  }

  try {
    return sessionStorage.getItem(wishlistIntroKey) !== "true";
  } catch {
    return true;
  }
}
// Shows the introduction only on the first visit in this browser session.

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [showIntro, setShowIntro] = useState(shouldShowWishlistIntro);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);
  useEffect(() => {
    if (!showIntro) {
      return;
    }

    const timer = setTimeout(() => {
      try {
        sessionStorage.setItem(wishlistIntroKey, "true");
      } catch {
        // The wishlist still opens if browser storage is unavailable.
      }
      setShowIntro(false);
    }, 1600);

    return () => clearTimeout(timer);
  }, [showIntro]);

  useEffect(() => {
    async function getWishlist() {
      try {
        setError("");
        setLoading(true);
        const response = await api.get("/wishlist");
        if (!Array.isArray(response.data.message)) {
          throw new Error("Unable to load wishlist products. Please try again.");
        }

        setWishlist(response.data.message.filter((product) => product && product._id));
      } catch (error) {
        setError(error.response?.data?.message || error.message || "Unable to fetch");
      } finally {
        setLoading(false);
      }
    }
    // Loads the wishlist and updates its loading or error state.
    getWishlist();
  }, []);

  async function removeWishlist(productId) {
    try {
      setRemovingId(productId);
      setError("");
      await api.delete(`/wishlist/${productId}`);
      setWishlist((currentWishlist) =>
        currentWishlist.filter((product) => product._id !== productId),
      );
    } catch (error) {
      setError(error.response?.data?.message || "Unable to remove");
    } finally {
      setRemovingId(null);
    }
  }
  // Removes a wishlist product and updates the displayed list.

  function getRemoveButtonLabel(product) {
    if (removingId === product._id) {
      return "Removing...";
    } else {
      return "Remove";
    }
  }
  // Returns the remove button’s current label.

  return (
    <div>
      <Navbar />
      <main className="page-shell wishlist-shell">
        <header className="page-heading">
          <div>
            <p className="eyebrow">
              <Icon name="heart" />
              KEEP THE GOOD FINDS CLOSE
            </p>
            <h1>Your wishlist.</h1>
            <p>A little collection of things you love.</p>
          </div>
          <Link className="subtle-link" to="/product">
            Keep discovering <Icon name="arrow" />
          </Link>
        </header>
        {showIntro && (
          <div className="wishlist-intro" role="status" aria-live="polite">
            <div className="wishlist-heart-stage" aria-hidden="true">
              <span className="wishlist-intro-halo" />
              <span className="wishlist-intro-heart"><Icon name="heart" /></span>
              <span className="wishlist-heart-particle particle-one"><Icon name="heart" /></span>
              <span className="wishlist-heart-particle particle-two"><Icon name="heart" /></span>
              <span className="wishlist-heart-particle particle-three"><Icon name="heart" /></span>
              <span className="wishlist-heart-particle particle-four"><Icon name="heart" /></span>
            </div>
            <h2>A little love for your favorites.</h2>
            <p>Opening your collection of good finds…</p>
          </div>
        )}
        <div className="wishlist-content" hidden={showIntro}>
        <div className="wishlist-page">
          {!loading &&
            !error &&
            wishlist.map((product) => (
              <article
                className={
                  "product-card wishlist-card category-" +
                  (product.category || "Product").toLowerCase()
                }
                key={product._id}
              >
                <Link className="product-media" to={"/product/" + product._id}>
                  <img src={product.image} alt={product.name} loading="lazy" />
                  <span className="wishlist-heart">
                    <Icon name="heart" />
                  </span>
                </Link>
                <div className="product-card-body">
                  <p className="product-category">{product.category || "Product"}</p>
                  <h2>
                    <Link to={"/product/" + product._id}>{product.name}</Link>
                  </h2>
                  <div className="product-price-row">
                    <p className="product-price">
                      ₹{product.price.toLocaleString("en-IN")}
                    </p>
                    <span className="product-stock">
                      {product.stock} units available
                    </span>
                  </div>
                  <button
                    className="wishlist-remove"
                    onClick={() => removeWishlist(product._id)}
                    disabled={removingId === product._id}
                  >
                    <Icon name="trash" />
                    {getRemoveButtonLabel(product)}
                  </button>
                </div>
              </article>
            ))}
          {loading && (
            <div className="wishlist-status" role="status">
              <Icon name="loader" className="icon-spin" />
              <p>Gathering your saved finds…</p>
            </div>
          )}
          {error && (
            <div className="wishlist-status wishlist-error" role="alert">
              <p>{error}</p>
            </div>
          )}
          {!loading && !error && wishlist.length === 0 && (
            <div className="wishlist-status">
              <span className="wishlist-empty-icon">
                <Icon name="heart" />
              </span>
              <h2>A little room for favorites.</h2>
              <p>Tap the heart on a product to save it here for later.</p>
              <Link className="button-link" to="/product">
                Discover something you love <Icon name="arrow" />
              </Link>
            </div>
          )}
        </div>
        </div>
      </main>
    </div>
  );
}
// Displays saved products and their remove actions.
export default Wishlist;
