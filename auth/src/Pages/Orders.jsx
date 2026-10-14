import Icon from "../Components/Icon.jsx";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../Components/Navbar.jsx";
import api from "../Services/api.js";
import { formatMoney, formatOrderDate } from "../Services/orderFormat.js";
import "./Orders.css";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    api
      .get("/orders", {
        signal: controller.signal,
      })
      .then((response) => setOrders(response.data.orders))
      .catch((failure) => {
        if (!controller.signal.aborted) {
          setError(failure.response?.data?.message || "Unable to load orders.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, []);

  function renderOrdersContent() {
    if (loading) {
      return <p role="status">Loading your orders…</p>;
    } else if (error) {
      return (
        <div className="order-error" role="alert">
          {error} <Link to="/login">Log in</Link>
        </div>
      );
    } else if (orders.length === 0) {
      return (
        <div className="order-panel">
          <h2>No orders yet</h2>
          <p>Your orders will appear here once you start checkout.</p>
          <Link to="/product">Explore products</Link>
        </div>
      );
    } else {
      return (
        <div className="order-list">
          {orders.map((order) => (
            <article className="order-panel order-card" key={order._id}>
              <div className="order-card-heading">
                <div>
                  <h2>Order #{order._id.slice(-8)}</h2>
                  <p className="order-muted">
                    {formatOrderDate(order.createdAt)}
                  </p>
                </div>
                <strong>{formatMoney(order.totalAmount)}</strong>
              </div>
              <ul>
                {order.items.map((item, index) => (
                  <li key={item.product + "-" + index}>
                    {item.name} × {item.quantity}
                  </li>
                ))}
              </ul>
              <div className="order-card-footer">
                <div>
                  <span
                    className={
                      "order-badge order-badge-" +
                      order.paymentStatus.toLowerCase()
                    }
                  >
                    {order.paymentStatus}
                  </span>
                  <span className="order-badge">
                    {order.status.replaceAll("_", " ")}
                  </span>
                </div>
                <Link to={"/orders/" + order._id}>
                  View details <Icon name="arrow" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      );
    }
  }
  // Displays the order history’s loading, error, empty or populated state.

  return (
    <div>
      <Navbar />
      <main className="order-page">
        <header className="order-heading">
          <p className="order-eyebrow">
            <Icon name="package" />
            YOUR SHOPKART STORY
          </p>
          <h1>My orders</h1>
          <p>Your recent orders and payment status.</p>
        </header>
        {renderOrdersContent()}
      </main>
    </div>
  );
}
// Displays the customer’s order history.

export default Orders;
