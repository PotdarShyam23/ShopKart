import AuthAside from "../Components/AuthAside.jsx";
import Icon from "../Components/Icon.jsx";
import "./Auth.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../Services/api.js";
import { useCart } from "../Context/CartContext.jsx";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { refreshCart } = useCart();
  const navigate = useNavigate();

  async function handleLogin(event) {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Email and Password required");
      return;
    }
    const loginData = {
      email,
      password,
    };
    try {
      setLoading(true);
      await api.post("/customer/login", loginData);
      await refreshCart();
      navigate("/home");
    } catch (error) {
      setError("Invalid email or password.", error.message);
    } finally {
      setLoading(false);
    }
  }
  // Validates login details, signs in and refreshes the cart.

  function getLoginButtonLabel() {
    if (loading) {
      return "Signing in…";
    } else {
      return "Sign in";
    }
  }
  // Returns the login button’s current label.

  return (
    <main className="auth-page">
      <AuthAside mode="login" />
      <div className="auth-form-panel">
        <form className="auth-form" onSubmit={handleLogin}>
          <span className="eyebrow">YOUR SHOPKART ACCOUNT</span>
          <h1>
            Welcome back.
            <br />
            <span>Find your next favorite.</span>
          </h1>
          <p className="auth-intro">
            Sign in to revisit your wishlist, finish your cart, and discover
            something new.
          </p>
          <div className="auth-benefits">
            <span>
              <Icon name="heart" />
              Saved favorites
            </span>
            <span>
              <Icon name="package" />
              Order updates
            </span>
          </div>
          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}
          <div className="auth-field">
            <label htmlFor="email">Email address</label>
            <div className="auth-input">
              <Icon name="mail" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <div className="auth-input">
              <Icon name="lock" />
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
              />
            </div>
          </div>
          <button className="auth-submit" type="submit" disabled={loading}>
            {loading && <Icon name="loader" className="icon-spin" />}
            {getLoginButtonLabel()}
            <Icon name="arrow" />
          </button>
          <p className="auth-switch">
            New around here? <Link to="/register">Create an account</Link>
          </p>
          <p className="auth-note">
            <Icon name="shield" />
            Your account. Your favorites. All in one place.
          </p>
        </form>
      </div>
    </main>
  );
}
// Displays the login form and its submission state.
export default Login;
