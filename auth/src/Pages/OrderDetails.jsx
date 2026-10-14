import Icon from "../Components/Icon.jsx";
import { Link, useParams } from "react-router-dom";
import Navbar from "../Components/Navbar.jsx";
import OrderInfo from "../Components/OrderInfo.jsx";
import useOrder from "./useOrder.js";
import "./Orders.css";

function OrderDetails() {
  const { id } = useParams();
  const { order, loading, error } = useOrder(id);

  function renderOrderContent() {
    if (loading) {
      return <p role="status">Loading your order…</p>;
    } else if (error) {
      return (
        <div className="order-error" role="alert">
          {error} <Link to="/orders">Back to orders</Link>
        </div>
      );
    } else {
      return <OrderInfo order={order} />;
    }
  }
  // Displays the order’s loading, error or detail state.

  return (
    <div>
      <Navbar />
      <main className="order-page">
        <Link className="subtle-link" to="/orders">
          <Icon name="back" />
          My orders
        </Link>
        <header className="order-heading">
          <h1>Order details</h1>
        </header>
        {renderOrderContent()}
      </main>
    </div>
  );
}
// Displays the selected customer order.

export default OrderDetails;
