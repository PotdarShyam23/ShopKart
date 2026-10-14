import toast from "react-hot-toast";
export const notificationOptions = {
  duration: 3000,
  className: "shop-notification",
  ariaProps: {
    role: "status",
    "aria-live": "polite",
  },
  error: {
    duration: 4500,
    ariaProps: {
      role: "alert",
      "aria-live": "assertive",
    },
  },
};
const notification = {
  success(message, options = {}) {
    return toast.success(message, options);
  },
  error(message, options = {}) {
    return toast.error(message, options);
  },
  dismiss(id) {
    toast.dismiss(id);
  },
};

export default notification;
