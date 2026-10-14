import Icon from "../Components/Icon.jsx";
import { Link, useParams } from "react-router-dom";
import Navbar from "../Components/Navbar.jsx";
import OrderInfo from "../Components/OrderInfo.jsx";
import useOrder from "./useOrder.js";
import "./Orders.css";

function OrderSuccess() {
  const { id } = useParams();
  const { order, loading, error } = useOrder(id);
  const paid = order?.paymentStatus === "PAID";

  function renderOrderConfirmation() {
    if (loading) {
      return <p role="status">Loading order confirmation…</p>;
    } else if (error) {
      return (
        <div className="order-error" role="alert">
          {error}{" "}
          <Link to="/orders">
            <Icon name="package" />
            View my orders
          </Link>
        </div>
      );
    } else {
      function getConfirmationLabel() {
        if (paid) {
          return "PAYMENT VERIFIED";
        } else {
          return "PAYMENT NOT CONFIRMED";
        }
      }
      // Returns the payment confirmation label.

      function getConfirmationHeading() {
        if (paid) {
          return "Order placed successfully";
        } else {
          return "Your order is awaiting payment";
        }
      }
      // Returns the order confirmation heading.

      function getConfirmationMessage() {
        if (paid) {
          return "Thank you for shopping with ShopKart.";
        } else {
          return "Your cart is preserved until payment is verified.";
        }
      }
      // Returns the order confirmation message.

      return (
        <>
          <header className="order-heading">
            {paid && (
              <span className="order-success-mark">
                <Icon name="check" />
              </span>
            )}
            <p className="order-eyebrow">{getConfirmationLabel()}</p>
            <h1>{getConfirmationHeading()}</h1>
            <p>{getConfirmationMessage()}</p>
          </header>
          <div className="order-links">
            <Link to="/orders">View my orders</Link>
            <Link to="/product">
              Continue shopping
              <Icon name="arrow" />
            </Link>
          </div>
          <OrderInfo order={order} />
        </>
      );
    }
  }
  // Displays the order confirmation’s loading, error or saved order state.

  return (
    <div>
      <Navbar />
      <main className="order-page">{renderOrderConfirmation()}</main>
    </div>
  );
}
// Displays backend-confirmed order and payment information.

export default OrderSuccess;
