"use client";

import { ReactNode, useState } from "react";
import { CartContext, CartItem } from "./CartContext";
import { Id } from "@/convex/_generated/dataModel";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity: number) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(i => i.ticketTypeId === item.ticketTypeId);
      
      if (existingItem) {
        // Update quantity if item exists, respecting maxQuantity
        return currentItems.map(i => 
          i.ticketTypeId === item.ticketTypeId
            ? { ...i, quantity: Math.min(i.quantity + quantity, i.maxQuantity) }
            : i
        );
      }

      // Add new item
      return [...currentItems, { ...item, quantity: Math.min(quantity, item.maxQuantity) }];
    });
  };

  const removeFromCart = (ticketTypeId: Id<"ticketTypes">) => {
    setItems(currentItems => currentItems.filter(item => item.ticketTypeId !== ticketTypeId));
  };

  const updateQuantity = (ticketTypeId: Id<"ticketTypes">, quantity: number) => {
    setItems(currentItems =>
      currentItems.map(item =>
        item.ticketTypeId === ticketTypeId
          ? { ...item, quantity: Math.min(Math.max(0, quantity), item.maxQuantity) }
          : item
      ).filter(item => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
