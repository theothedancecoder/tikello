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

export interface DiscountCode {
  _id: Id<"discountCodes">;
  code: string;
  percentage: number;
}

export interface BuyerInfo {
  fullName: string;
  email: string;
  phone?: string;
}

export interface CartContextType {
  items: CartItem[];
  discountCode?: DiscountCode;
  buyerInfo?: BuyerInfo;
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity: number) => void;
  removeFromCart: (ticketTypeId: Id<"ticketTypes">) => void;
  updateQuantity: (ticketTypeId: Id<"ticketTypes">, quantity: number) => void;
  applyDiscount: (discount: DiscountCode) => void;
  removeDiscount: () => void;
  setBuyerInfo: (info: BuyerInfo) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getDiscountAmount: () => number;
  getFinalPrice: () => number;
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
