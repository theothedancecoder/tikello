"use client";

import { useCart } from "./CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import { formatPriceWithConversion } from "@/lib/currency";
import { useState } from "react";
import { toast } from "sonner";
import { createStripeCheckoutSessionForCart } from "@/actions/createStripeCheckoutSessionForCart";

interface CartProps {
  currency?: string;
}

export default function Cart({ currency = "nok" }: CartProps) {
  const { items, updateQuantity, removeFromCart, getTotalPrice, getTotalItems, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleQuantityChange = (ticketTypeId: string, newQuantity: number) => {
    updateQuantity(ticketTypeId as any, newQuantity);
  };

  const handleRemoveItem = (ticketTypeId: string) => {
    removeFromCart(ticketTypeId as any);
    toast.success("Item removed from cart");
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsCheckingOut(true);
    try {
      const { sessionUrl } = await createStripeCheckoutSessionForCart({
        cartItems: items,
      });
      
      if (sessionUrl) {
        window.location.href = sessionUrl;
      }
    } catch (error) {
      console.error("Failed to create checkout session:", error);
      toast.error("Failed to proceed to checkout. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingCart className="w-5 h-5" />
          <h3 className="text-lg font-medium">Your Cart</h3>
        </div>
        <p className="text-gray-500 text-center py-8">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          <h3 className="text-lg font-medium">Your Cart ({getTotalItems()})</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearCart}
          className="text-red-600 hover:text-red-700"
        >
          Clear Cart
        </Button>
      </div>

      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div key={item.ticketTypeId} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium">{item.ticketTypeName}</h4>
              <p className="text-sm text-gray-600">
                {formatPriceWithConversion(item.price, currency)} each
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center border rounded">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuantityChange(item.ticketTypeId, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <Input
                  type="number"
                  min="1"
                  max={item.maxQuantity}
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(item.ticketTypeId, parseInt(e.target.value) || 1)}
                  className="w-16 h-8 text-center border-0 focus:ring-0"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuantityChange(item.ticketTypeId, item.quantity + 1)}
                  disabled={item.quantity >= item.maxQuantity}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
              
              <div className="text-right min-w-[80px]">
                <p className="font-medium">
                  {formatPriceWithConversion(item.price * item.quantity, currency)}
                </p>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveItem(item.ticketTypeId)}
                className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold">Total:</span>
          <span className="text-xl font-bold text-green-600">
            {formatPriceWithConversion(getTotalPrice(), currency)}
          </span>
        </div>
        
        <Button
          onClick={handleCheckout}
          disabled={isCheckingOut}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
        >
          {isCheckingOut ? "Processing..." : "Proceed to Checkout"}
        </Button>
      </div>
    </div>
  );
}
