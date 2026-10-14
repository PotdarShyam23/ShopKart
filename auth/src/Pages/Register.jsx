import AuthAside from "../Components/AuthAside.jsx";
import Icon from "../Components/Icon.jsx";
import "./Auth.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../Services/api.js";

function Register() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (
      !fullName.trim() ||
      !email.trim() ||
      !password.trim() ||
      !phone.trim()
    ) {
      setError("All fields are required");
      return;
    }
    const customerData = {
      fullName,
      email,
      password,
      phone,
    };
    try {
      setLoading(true);
      await api.post("/customer/register", customerData);
      navigate("/login");
    } catch (error) {
      console.log(error.response?.data);
      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }
  // Handles handle submit.

  function getRegisterButtonLabel() {
    if (loading) {
      return "Creating your account…";
    } else {
      return "Create Account";
    }
  }
  // Returns the signup button’s current label.

  return (
    <main className="auth-page">
      <AuthAside mode="signup" />
      <div className="auth-form-panel">
        <form className="auth-form" onSubmit={handleSubmit}>
          <span className="eyebrow">YOUR NEXT FAVORITE STARTS HERE</span>
          <h1>
            A fresh start.
            <br />
            <span>A world of finds.</span>
          </h1>
          <p className="auth-intro">
            Create your ShopKart account. Save what you love, shop your picks,
            and follow every order.
          </p>
          <div className="auth-benefits">
            <span>
              <Icon name="heart" />
              Make a wishlist
            </span>
            <span>
              <Icon name="bag" />
              Shop your way
            </span>
          </div>
          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}
          <div className="auth-field">
            <label htmlFor="fullName">Full name</label>
            <div className="auth-input">
              <Icon name="user" />
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Your full name"
              />
            </div>
          </div>
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
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Choose your password"
              />
            </div>
          </div>
          <div className="auth-field">
            <label htmlFor="phone">Phone number</label>
            <div className="auth-input">
              <Icon name="phone" />
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Your phone number"
              />
            </div>
          </div>
          <button className="auth-submit" type="submit" disabled={loading}>
            {loading && <Icon name="loader" className="icon-spin" />}
            {getRegisterButtonLabel()}
            <Icon name="arrow" />
          </button>
          <p className="auth-switch">
            Already a member? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
// Displays the signup form and its submission state.
export default Register;
