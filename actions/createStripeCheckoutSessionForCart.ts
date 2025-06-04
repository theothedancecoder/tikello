"use server";

import { stripe } from "@/lib/stripe";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { auth } from "@clerk/nextjs/server";
import { getConvexClient } from "@/lib/convex";
import baseUrl from "@/lib/baseUrl";
import { CartItem, BuyerInfo } from "@/components/cart/CartContext";

export type StripeCheckoutMetaDataForCart = {
  eventId: Id<"events">;
  userId: string;
  cartItems: string; // JSON stringified cart items
  discountCodeId?: Id<"discountCodes">;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
};

export async function createStripeCheckoutSessionForCart({
  cartItems,
  discountCodeId,
  buyerInfo,
}: {
  cartItems: CartItem[];
  discountCodeId?: Id<"discountCodes">;
  buyerInfo: BuyerInfo;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  if (!cartItems || cartItems.length === 0) {
    throw new Error("Cart is empty");
  }

  const convex = getConvexClient();

  // Get the first event (assuming all items are from the same event)
  const eventId = cartItems[0].eventId;
  const event = await convex.query(api.events.getById, { eventId });
  if (!event) throw new Error("Event not found");

  // Verify all items are from the same event
  const allSameEvent = cartItems.every(item => item.eventId === eventId);
  if (!allSameEvent) {
    throw new Error("All cart items must be from the same event");
  }

  // Verify availability for all ticket types
  for (const item of cartItems) {
    const availability = await convex.query(api.ticketTypes.getAvailability, { 
      ticketTypeId: item.ticketTypeId 
    });
    
    if (!availability || !availability.available || availability.salesStatus !== "available") {
      throw new Error(`Ticket type ${item.ticketTypeName} is not available for purchase`);
    }

    if (availability.remaining < item.quantity) {
      throw new Error(`Only ${availability.remaining} ${item.ticketTypeName} tickets available`);
    }
  }

  const stripeConnectId = await convex.query(api.users.getUsersStripeConnectId, {
    userId: event.userId,
  });

  if (!stripeConnectId) {
    throw new Error("Stripe Connect ID not found for owner of the event!");
  }

  // Get discount code details if provided
  let discountCode = null;
  let discountPercentage = 0;
  if (discountCodeId) {
    discountCode = await convex.query(api.discountCodes.validateCode, {
      eventId,
      code: "", // We already have the ID, so we'll get it directly
    });
    
    // Get discount code by ID
    const discountCodeData = await convex.query(api.discountCodes.getById, {
      discountCodeId,
    });
    
    if (discountCodeData && discountCodeData.active) {
      discountPercentage = discountCodeData.percentage;
    }
  }

  // Calculate total amount and apply discount if provided
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = discountPercentage > 0 ? Math.round(subtotal * (discountPercentage / 100)) : 0;
  const totalAmount = subtotal - discountAmount;
  const applicationFeeAmount = Math.round(totalAmount * 100 * 0.02); // 2% fee in cents

  const metadata: StripeCheckoutMetaDataForCart = {
    eventId,
    userId,
    cartItems: JSON.stringify(cartItems.map(item => ({
      ticketTypeId: item.ticketTypeId,
      quantity: item.quantity,
      price: item.price,
    }))),
    discountCodeId,
    buyerName: buyerInfo.fullName,
    buyerEmail: buyerInfo.email,
    buyerPhone: buyerInfo.phone,
  };

  // Create line items for Stripe
  const lineItems = cartItems.map(item => {
    const originalPrice = Math.round(item.price * 100); // stripe expects price in cents
    const discountedPrice = discountPercentage > 0 
      ? Math.round(originalPrice * (1 - discountPercentage / 100))
      : originalPrice;

    return {
      price_data: {
        currency: event.currency || "nok",
        product_data: {
          name: `${event.name} - ${item.ticketTypeName}`,
        },
        unit_amount: discountedPrice,
      },
      quantity: item.quantity,
    };
  });

  // Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create(
    {
      payment_method_types: ["card"],
      line_items: lineItems,
      payment_intent_data: {
        application_fee_amount: applicationFeeAmount,
      },
      mode: "payment",
      success_url: `${baseUrl}/tickets/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/event/${eventId}`,
      metadata,
    },
    {
      stripeAccount: stripeConnectId,
    }
  );

  // ✅ Return the session info
  return { sessionId: session.id, sessionUrl: session.url };
}
