"use client";

import { Id } from "@/convex/_generated/dataModel";
import { createContext, useContext, ReactNode } from "react";

export interface CartItem {
  ticketTypeId: Id<"ticketTypes">;
  eventId: Id<"events">;
  ticketTypeName: string;
  price: number;
  quantity: number;
  maxQuantity: number;
}

export interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity: number) => void;
  removeFromCart: (ticketTypeId: Id<"ticketTypes">) => void;
  updateQuantity: (ticketTypeId: Id<"ticketTypes">, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
