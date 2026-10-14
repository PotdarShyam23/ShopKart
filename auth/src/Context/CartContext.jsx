import { createContext, useContext, useEffect, useState } from "react";
import api from "../Services/api.js";

// Older cart responses may omit quantity. Match the schema default before rendering.

function normalizeCart(cart) {
  if (!Array.isArray(cart)) {
    throw new Error("Invalid cart response");
  }
  return cart.map((cartItem) => {
    const quantity = Number(cartItem.quantity);
    let validQuantity = 1;
    if (Number.isInteger(quantity) && quantity >= 1) {
      validQuantity = quantity;
    }
    return {
      ...cartItem,
      quantity: validQuantity,
    };
  });
}
// Ensures each cart item has a valid numeric quantity.

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartError, setCartError] = useState("");
  const [addingId, setAddingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  async function refreshCart() {
    try {
      setCartError("");
      setCartLoading(true);
      const response = await api.get("/cart");
      setCartItems(normalizeCart(response.data.cart));
    } catch (error) {
      setCartError(error.response?.data?.message || "Unable to fetch the cart");
    } finally {
      setCartLoading(false);
    }
  }
  // Loads the latest cart from the backend.
  useEffect(() => {
    refreshCart();
  }, []);

  async function updateQuantity(productId, quantity) {
    try {
      setUpdatingId(productId);
      setCartError("");
      const response = await api.patch(`/cart/${productId}`, {
        quantity,
      });
      setCartItems(normalizeCart(response.data.cart));
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Unable to update quantity";
      setCartError(message);
    } finally {
      setUpdatingId(null);
    }
  }
  // Updates the selected product quantity through the cart API.

  async function removeFromCart(productId) {
    try {
      setRemovingId(productId);
      setCartError("");
      const response = await api.delete(`/cart/${productId}`);
      setCartItems(normalizeCart(response.data.cart));
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Unable to remove product";
      setCartError(message);
    } finally {
      setRemovingId(null);
    }
  }
  // Removes the selected product through the cart API.

  async function addToCart(productId) {
    try {
      setAddingId(productId);
      setCartError("");
      const response = await api.post(`/cart/${productId}`);
      setCartItems(normalizeCart(response.data.cart));
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Unable to add product";
      setCartError(message);
      return {
        success: false,
        message,
      };
    } finally {
      setAddingId(null);
    }
  }
  // Adds the selected product to the cart.

  const totalUnits = cartItems.reduce(
    (total, cartItem) => total + cartItem.quantity,
    0,
  );
  const subtotal = cartItems.reduce(
    (total, cartItems) =>
      total + (cartItems.product?.price || 0) * cartItems.quantity,
    0,
  );

  function clearCart() {
    setCartItems([]);
    setCartError("");
    setAddingId(null);
    setUpdatingId(null);
    setRemovingId(null);
  }
  // Clears the local cart and action state.

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartLoading,
        cartError,
        addingId,
        updatingId,
        removingId,
        totalUnits,
        subtotal,
        refreshCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// here we do this so whenn we import no need to import context and all as we create a hook whcih can be used in all other places wasily
// Shares cart data, totals, loading states and actions with the application.

export default CartProvider;

export function useCart() {
  return useContext(CartContext);
}
// Reads the shared cart context.
