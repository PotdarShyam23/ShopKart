import { Link } from "react-router-dom";
import Icon from "../Components/Icon.jsx";
import "./Account.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Services/api.js";
import Navbar from "../Components/Navbar.jsx";

function Home() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function fetchCustomer() {
      try {
        const response = await api.get("/customer/me");
        console.log("Customer response:", response.data);
        setCustomer(response.data.customer || response.data);
      } catch (error) {
        console.log("Customer request error:", error.response?.data || error);
        navigate("/login", {
          replace: true,
        });
      } finally {
        setLoading(false);
      }
    }

    // Important: call the function
    // Loads the customer profile and redirects unauthenticated visitors.
    fetchCustomer();
  }, [navigate]);
  if (loading) {
    return <p>Loading customer information...</p>;
  }
  if (!customer) {
    return null;
  }
  return (
    <div>
      <Navbar />
      <main className="page-shell account-page">
        <header className="account-welcome">
          <div>
            <p className="eyebrow">
              <Icon name="sparkles" />
              YOUR LITTLE CORNER OF SHOPKART
            </p>
            <h1>Hello, {customer.fullName}.</h1>
            <p>Good to have you here. What will you discover today?</p>
            <Link className="button-link" to="/product">
              Find your next favorite <Icon name="arrow" />
            </Link>
          </div>
          <span className="account-welcome-icon" aria-hidden="true">
            <Icon name="bag" />
          </span>
        </header>
        <div className="account-layout">
          <section className="surface-card account-profile">
            <span className="account-avatar">
              <Icon name="user" />
            </span>
            <span className="profile-kicker">THE PERSON BEHIND THE FINDS</span>
            <h2>Your profile</h2>
            <p>Your details, all in one place.</p>
            <dl>
              <div>
                <dt>
                  <Icon name="user" />
                  Full name
                </dt>
                <dd>{customer.fullName}</dd>
              </div>
              <div>
                <dt>
                  <Icon name="mail" />
                  Email address
                </dt>
                <dd>{customer.email}</dd>
              </div>
              <div>
                <dt>
                  <Icon name="phone" />
                  Phone number
                </dt>
                <dd>{customer.phone}</dd>
              </div>
            </dl>
          </section>
          <div className="account-shortcuts">
            <Link className="account-shortcut shortcut-violet" to="/orders">
              <span>
                <Icon name="package" />
              </span>
              <div>
                <h2>Follow your finds</h2>
                <p>See your orders and payment status.</p>
              </div>
              <Icon name="arrow" />
            </Link>
            <Link className="account-shortcut shortcut-coral" to="/wishlist">
              <span>
                <Icon name="heart" />
              </span>
              <div>
                <h2>Saved for later</h2>
                <p>All the things you’ve got your eye on.</p>
              </div>
              <Icon name="arrow" />
            </Link>
            <Link className="account-shortcut shortcut-mint" to="/cart">
              <span>
                <Icon name="cart" />
              </span>
              <div>
                <h2>Your shopping bag</h2>
                <p>Ready when you are.</p>
              </div>
              <Icon name="arrow" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
// Displays the customer profile and account navigation.
export default Home;
