import React, { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (item) => {
    const exist = cartItems.find((i) => i.id === item.id);
    if (exist) {
      setCartItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, qty: i.qty + item.qty } : i
        )
      );
    } else {
      setCartItems((prev) => [...prev, { ...item, qty: item.qty || 1 }]);
    }
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const changeQty = (id, qty) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: qty > 0 ? qty : 1 } : item
      )
    );
  };

  const increaseQty = (id) => {
    const item = cartItems.find((item) => item.id === id);
    if (item) changeQty(id, item.qty + 1);
  };

  const decreaseQty = (id) => {
    const item = cartItems.find((item) => item.id === id);
    if (item && item.qty > 1) changeQty(id, item.qty - 1);
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.qty,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        changeQty,
        increaseQty,
        decreaseQty,
        clearCart,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
