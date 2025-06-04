"use client";

import { ReactNode, useCallback, useState } from "react";
import { CartContext, CartItem, DiscountCode, BuyerInfo } from "./CartContext";
import { Id } from "@/convex/_generated/dataModel";

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [discountCode, setDiscountCode] = useState<DiscountCode>();
  const [buyerInfo, setBuyerInfo] = useState<BuyerInfo>();

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>, quantity: number) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(i => i.ticketTypeId === item.ticketTypeId);
      
      if (existingItem) {
        const newQuantity = Math.min(existingItem.quantity + quantity, item.maxQuantity);
        return currentItems.map(i =>
          i.ticketTypeId === item.ticketTypeId
            ? { ...i, quantity: newQuantity }
            : i
        );
      }

      return [...currentItems, { ...item, quantity }];
    });
  }, []);

  const removeFromCart = useCallback((ticketTypeId: Id<"ticketTypes">) => {
    setItems(currentItems => currentItems.filter(item => item.ticketTypeId !== ticketTypeId));
  }, []);

  const updateQuantity = useCallback((ticketTypeId: Id<"ticketTypes">, quantity: number) => {
    setItems(currentItems =>
      currentItems.map(item =>
        item.ticketTypeId === ticketTypeId
          ? { ...item, quantity: Math.min(quantity, item.maxQuantity) }
          : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setDiscountCode(undefined);
    setBuyerInfo(undefined);
  }, []);

  const setBuyerInfoCallback = useCallback((info: BuyerInfo) => {
    setBuyerInfo(info);
  }, []);

  const getTotalPrice = useCallback(() => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [items]);

  const getTotalItems = useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  const applyDiscount = useCallback((discount: DiscountCode) => {
    setDiscountCode(discount);
  }, []);

  const removeDiscount = useCallback(() => {
    setDiscountCode(undefined);
  }, []);

  const getDiscountAmount = useCallback(() => {
    if (!discountCode) return 0;
    const totalPrice = getTotalPrice();
    return Math.round((totalPrice * discountCode.percentage) / 100);
  }, [discountCode, getTotalPrice]);

  const getFinalPrice = useCallback(() => {
    const totalPrice = getTotalPrice();
    const discountAmount = getDiscountAmount();
    return totalPrice - discountAmount;
  }, [getTotalPrice, getDiscountAmount]);

  return (
    <CartContext.Provider
      value={{
        items,
        discountCode,
        buyerInfo,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
        applyDiscount,
        removeDiscount,
        setBuyerInfo: setBuyerInfoCallback,
        getDiscountAmount,
        getFinalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
