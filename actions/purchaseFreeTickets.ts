"use server";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { getConvexClient } from "@/lib/convex";
import { CartItem, BuyerInfo } from "@/components/cart/CartContext";

export async function purchaseFreeTickets({
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

  // Verify all items are from the same event and are free
  const allSameEvent = cartItems.every(item => item.eventId === eventId);
  if (!allSameEvent) {
    throw new Error("All cart items must be from the same event");
  }

  const allFree = cartItems.every(item => item.price === 0);
  if (!allFree) {
    throw new Error("This function is only for free tickets");
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

  // Get user information from Clerk
  let buyerName = buyerInfo.fullName;
  let buyerEmail = buyerInfo.email;
  let buyerPhone = buyerInfo.phone;

  try {
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    // Use Clerk data as fallback if buyer info is missing
    if (!buyerName && user.firstName && user.lastName) {
      buyerName = `${user.firstName} ${user.lastName}`;
    }
    if (!buyerEmail && user.emailAddresses[0]) {
      buyerEmail = user.emailAddresses[0].emailAddress;
    }
    if (!buyerPhone && user.phoneNumbers[0]) {
      buyerPhone = user.phoneNumbers[0].phoneNumber;
    }
  } catch (error) {
    console.warn("Could not fetch user details from Clerk:", error);
  }

  // Store/update buyer information
  if (buyerName && buyerEmail) {
    try {
      await convex.mutation(api.users.updateUser, {
        userId,
        name: buyerName,
        email: buyerEmail,
      });
    } catch (error) {
      console.warn("Error storing user information:", error);
    }
  }

  // Create tickets directly without Stripe
  try {
    const sessionId = `free_${Date.now()}_${userId}`;
    
    await convex.mutation(api.events.purchaseCartTickets, {
      eventId,
      userId,
      cartItems: cartItems.map(item => ({
        ticketTypeId: item.ticketTypeId,
        quantity: item.quantity,
        price: item.price,
      })),
      paymentInfo: {
        paymentIntentId: sessionId, // Generate a unique ID for free tickets
        amount: 0,
      },
      discountCodeId,
      buyerInfo: buyerName && buyerEmail ? {
        fullName: buyerName,
        email: buyerEmail,
        phone: buyerPhone,
      } : undefined,
    });

    return { success: true, sessionId };
  } catch (error) {
    console.error("Failed to create free tickets:", error);
    throw new Error(`Failed to create free tickets: ${error}`);
  }
}
