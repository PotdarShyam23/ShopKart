import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { Toaster, ToastBar } from "react-hot-toast";
import notification, { notificationOptions } from "./Services/notification.js";
import "./Services/notification.css";
import "./Vibrant.css";
import { CartProvider } from "./Context/CartContext.jsx";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <CartProvider>
        <App />
        <Toaster position="top-right" toastOptions={notificationOptions}>
          {(currentToast) => (
            <ToastBar toast={currentToast}>
              {({ icon, message }) => (
                <>
                  {icon}
                  {message}
                  <button
                    className="notification-close"
                    type="button"
                    onClick={() => notification.dismiss(currentToast.id)}
                    aria-label="Dismiss notification"
                  >
                    ×
                  </button>
                </>
              )}
            </ToastBar>
          )}
        </Toaster>
      </CartProvider>
    </BrowserRouter>
  </StrictMode>,
);
