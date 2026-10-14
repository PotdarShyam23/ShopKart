import OrderTimeline from "./OrderTimeline.jsx";
import Icon from "./Icon.jsx";
import { formatMoney, formatOrderDate } from "../Services/orderFormat.js";

function OrderInfo({ order }) {
  const address = order.shippingAddress;
  return (
    <div className="order-detail-layout">
      <OrderTimeline order={order} />
      <div className="order-panel">
        <h2>
          <Icon name="bag" />
          Items ordered
        </h2>
        <ul className="order-snapshot-items">
          {order.items.map((item, index) => (
            <li key={item.product + "-" + index}>
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  onError={(event) => {
                    event.currentTarget.hidden = true;
                  }}
                />
              )}
              <div>
                <h3>{item.name}</h3>
                <p>
                  {formatMoney(item.price)} each · Quantity: {item.quantity}
                </p>
              </div>
              <strong>{formatMoney(item.price * item.quantity)}</strong>
            </li>
          ))}
        </ul>
        <div className="order-total">
          <span>Total</span>
          <strong>{formatMoney(order.totalAmount)}</strong>
        </div>
      </div>
      <aside className="order-panel">
        <h2>
          <Icon name="package" />
          Order information
        </h2>
        <dl className="order-meta">
          <div>
            <dt>Order ID</dt>
            <dd>{order._id}</dd>
          </div>
          <div>
            <dt>Placed on</dt>
            <dd>{formatOrderDate(order.createdAt)}</dd>
          </div>
          <div>
            <dt>Payment</dt>
            <dd>
              <span
                className={
                  "order-badge order-badge-" + order.paymentStatus.toLowerCase()
                }
              >
                {order.paymentStatus}
              </span>
            </dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{order.status.replaceAll("_", " ")}</dd>
          </div>
        </dl>
        <h2>
          <Icon name="pin" />
          Shipping address
        </h2>
        <address>
          {address.fullName}
          <br />
          {address.addressLine1}
          <br />
          {address.city}, {address.state} – {address.pincode}
          <br />
          Phone: {address.phone}
        </address>
      </aside>
    </div>
  );
}
// Displays saved order items, totals, status and shipping details.

export default OrderInfo;
