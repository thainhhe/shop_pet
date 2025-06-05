"use client";

import { createContext, useContext, useReducer, useEffect } from "react";
import { cartAPI } from "../services/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

const initialState = {
  cart: null,
  loading: false,
  error: null,
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case "CART_START":
      return {
        ...state,
        loading: true,
        error: null,
      };
    case "CART_SUCCESS":
      return {
        ...state,
        cart: action.payload,
        loading: false,
        error: null,
      };
    case "CART_ERROR":
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case "CLEAR_CART":
      return {
        ...state,
        cart: null,
      };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      dispatch({ type: "CLEAR_CART" });
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      dispatch({ type: "CART_START" });
      const response = await cartAPI.getCart();
      dispatch({ type: "CART_SUCCESS", payload: response.data.cart });
    } catch (error) {
      dispatch({
        type: "CART_ERROR",
        payload: error.response?.data?.message || "Failed to fetch cart",
      });
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      dispatch({ type: "CART_START" });
      const response = await cartAPI.addToCart(productId, quantity);
      dispatch({ type: "CART_SUCCESS", payload: response.data.cart });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to add to cart";
      dispatch({ type: "CART_ERROR", payload: message });
      return { success: false, error: message };
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    try {
      dispatch({ type: "CART_START" });
      const response = await cartAPI.updateCartItem(itemId, quantity);
      dispatch({ type: "CART_SUCCESS", payload: response.data.cart });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update cart";
      dispatch({ type: "CART_ERROR", payload: message });
      return { success: false, error: message };
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      dispatch({ type: "CART_START" });
      const response = await cartAPI.removeFromCart(itemId);
      dispatch({ type: "CART_SUCCESS", payload: response.data.cart });
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to remove from cart";
      dispatch({ type: "CART_ERROR", payload: message });
      return { success: false, error: message };
    }
  };

  const clearCart = async () => {
    try {
      dispatch({ type: "CART_START" });
      const response = await cartAPI.clearCart();
      dispatch({ type: "CART_SUCCESS", payload: response.data.cart });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to clear cart";
      dispatch({ type: "CART_ERROR", payload: message });
      return { success: false, error: message };
    }
  };

  const value = {
    ...state,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    fetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
