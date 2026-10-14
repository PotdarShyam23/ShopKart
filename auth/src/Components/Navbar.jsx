import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import Icon from "./Icon.jsx";
import "./Navbar.css";
import api from "../Services/api.js";
import { useCart } from "../Context/CartContext.jsx";

function Navbar() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { totalUnits, clearCart } = useCart();

  async function handleLogout() {
    try {
      setLoading(true);
      setError("");
      // api evoke
      await api.post("/customer/logout");
      // here replsce erase all recent urls of that website after this user not allowed to enter into the wwb the user can see only the login page
      clearCart();
      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      setError("LogOut Failed pls Try again", error.message);
    } finally {
      setLoading(false);
    }
  }
  // Signs out, clears the local cart and returns to login.

  function getLogoutButtonLabel() {
    if (loading) {
      return "Signing out…";
    } else {
      return "Logout";
    }
  }
  // Returns the logout button’s current label.

  return (
    <header className="site-header">
      <div className="navbar-inner">
        <Link
          className="shop-brand"
          to="/product"
          aria-label="ShopKart products"
        >
          <span className="brand-mark">
            <Icon name="bag" />
          </span>
          <span>
            Shop<span className="brand-accent">Kart</span>
            <small>EVERYDAY, ELEVATED</small>
          </span>
        </Link>
        <nav className="site-nav" aria-label="Main navigation">
          <NavLink className="nav-link" to="/home">
            <Icon name="home" />
            <span>Home</span>
          </NavLink>
          <NavLink className="nav-link" to="/product">
            <Icon name="grid" />
            <span>Discover</span>
          </NavLink>
          <NavLink className="nav-link" to="/wishlist">
            <Icon name="heart" />
            <span>Wishlist</span>
          </NavLink>
          <NavLink className="nav-link" to="/cart">
            <Icon name="cart" />
            <span>Cart</span>
            <span
              className="nav-count"
              key={totalUnits}
              aria-label={totalUnits + " items in cart"}
            >
              {totalUnits}
            </span>
          </NavLink>
          <NavLink className="nav-link" to="/orders">
            <Icon name="package" />
            <span>My Orders</span>
          </NavLink>
        </nav>
        <button
          className="logout-button"
          onClick={handleLogout}
          disabled={loading}
        >
          <Icon name="logout" />
          <span>{getLogoutButtonLabel()}</span>
        </button>
        {error && (
          <p className="navbar-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </header>
  );
}
// Displays navigation, active page indicators, cart count and logout.
export default Navbar;
