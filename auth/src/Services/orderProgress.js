const steps = [
  { status: "PLACED", label: "Placed", icon: "bag" },
  { status: "CONFIRMED", label: "Confirmed", icon: "shield" },
  { status: "SHIPPED", label: "Shipped", icon: "package" },
  { status: "DELIVERED", label: "Delivered", icon: "home" },
];

export function getOrderProgress(order) {
  let currentIndex = -1;
  let message =
    "Your payment is pending. Tracking starts after payment verification.";

  if (order.paymentStatus === "FAILED") {
    message = "Payment was not completed. This order has not been placed.";
  } else if (order.paymentStatus === "PAID") {
    currentIndex = steps.findIndex((step) => step.status === order.status);
    const messages = {
      PLACED: "Payment verified. Your order has been placed.",
      CONFIRMED: "Your order is confirmed.",
      SHIPPED: "Your order is on its way.",
      DELIVERED: "Your order has been delivered.",
    };
    message =
      messages[order.status] || "The current order stage is not available yet.";
  }

  return { steps, currentIndex, message };
}
// Reads saved order/payment status without inventing progress or delivery dates.
