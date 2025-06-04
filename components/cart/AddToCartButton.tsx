"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { useCart } from "./CartContext";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

interface AddToCartButtonProps {
  ticketTypeId: Id<"ticketTypes">;
  eventId: Id<"events">;
  ticketTypeName: string;
  price: number;
  maxQuantity: number;
  disabled?: boolean;
}

export default function AddToCartButton({
  ticketTypeId,
  eventId,
  ticketTypeName,
  price,
  maxQuantity,
  disabled = false,
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart, items } = useCart();

  const existingItem = items.find(item => item.ticketTypeId === ticketTypeId);
  const currentQuantityInCart = existingItem?.quantity || 0;
  const availableQuantity = maxQuantity - currentQuantityInCart;

  const handleQuantityChange = (newQuantity: number) => {
    const clampedQuantity = Math.min(Math.max(1, newQuantity), availableQuantity);
    setQuantity(clampedQuantity);
  };

  const handleAddToCart = () => {
    if (quantity > availableQuantity) {
      toast.error(`Only ${availableQuantity} tickets available`);
      return;
    }

    addToCart(
      {
        ticketTypeId,
        eventId,
        ticketTypeName,
        price,
        maxQuantity,
      },
      quantity
    );

    toast.success(`Added ${quantity} ${ticketTypeName} ticket${quantity > 1 ? 's' : ''} to cart`);
    setQuantity(1);
  };

  if (disabled || availableQuantity <= 0) {
    return (
      <div className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
        {availableQuantity <= 0 ? "In Cart" : "Sold Out"}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center border rounded-lg">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleQuantityChange(quantity - 1)}
          disabled={quantity <= 1}
          className="h-8 w-8 p-0"
        >
          <Minus className="w-3 h-3" />
        </Button>
        <Input
          type="number"
          min="1"
          max={availableQuantity}
          value={quantity}
          onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
          className="w-16 h-8 text-center border-0 focus:ring-0"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleQuantityChange(quantity + 1)}
          disabled={quantity >= availableQuantity}
          className="h-8 w-8 p-0"
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>
      <Button
        onClick={handleAddToCart}
        className="flex items-center gap-2"
        size="sm"
      >
        <ShoppingCart className="w-4 h-4" />
        Add to Cart
      </Button>
    </div>
  );
}
