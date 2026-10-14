import Icon from "./Icon.jsx";
import { getOrderProgress } from "../Services/orderProgress.js";
import "./OrderTimeline.css";

function OrderTimeline({ order }) {
  const { steps, currentIndex, message } = getOrderProgress(order);

  function getStepClass(index) {
    if (index < currentIndex) {
      return "timeline-step is-complete";
    }
    if (index === currentIndex) {
      return "timeline-step is-current";
    }
    return "timeline-step";
  }
  // Distinguishes completed, current and future steps.

  function getStepLabel(index) {
    if (index < currentIndex) {
      return "Completed";
    }
    if (index === currentIndex) {
      if (steps[index].status === "DELIVERED") {
        return "Completed";
      }
      return "Current stage";
    }
    return "Upcoming";
  }

  return (
    <section
      className="order-timeline"
      aria-labelledby="order-timeline-heading"
    >
      <div className="timeline-heading">
        <div>
          <p className="order-eyebrow">YOUR ORDER’S JOURNEY</p>
          <h2 id="order-timeline-heading">
            <Icon name="package" />
            Order tracking
          </h2>
        </div>
        <span className="timeline-source">Saved order status</span>
      </div>
      <p className="timeline-message">{message}</p>
      <ol className="timeline-steps">
        {steps.map((step, index) => (
          <li
            className={getStepClass(index)}
            key={step.status}
            aria-current={index === currentIndex && "step"}
          >
            <span className="timeline-dot">
              {index < currentIndex && <Icon name="check" />}
              {index >= currentIndex && <Icon name={step.icon} />}
            </span>
            <div className="timeline-label">
              <strong>{step.label}</strong>
              <span>{getStepLabel(index)}</span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
// Displays the order’s true fulfillment stage with responsive, accessible styling.
export default OrderTimeline;
