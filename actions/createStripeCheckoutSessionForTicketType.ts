"use server";

import { stripe } from "@/lib/stripe";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { auth } from "@clerk/nextjs/server";
import { getConvexClient } from "@/lib/convex";
import baseUrl from "@/lib/baseUrl";

export type StripeCheckoutMetaDataForTicketType = {
  eventId: Id<"events">;
  userId: string;
  ticketTypeId: Id<"ticketTypes">;
  stripeConnectId: string;
};

export async function createStripeCheckoutSessionForTicketType({
  eventId,
  ticketTypeId,
}: {
  eventId: Id<"events">;
  ticketTypeId: Id<"ticketTypes">;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const convex = getConvexClient();

  // Get event details
  const event = await convex.query(api.events.getById, { eventId });
  if (!event) throw new Error("Event not found");

  // Get ticket type details
  const ticketType = await convex.query(api.ticketTypes.getById, { ticketTypeId });
  if (!ticketType) throw new Error("Ticket type not found");

  // Check availability
  const availability = await convex.query(api.ticketTypes.getAvailability, { ticketTypeId });
  if (!availability || !availability.available || availability.salesStatus !== "available") {
    throw new Error("Ticket type is not available for purchase");
  }

  const stripeConnectId = await convex.query(api.users.getUsersStripeConnectId, {
    userId: event.userId,
  });

  if (!stripeConnectId) {
    throw new Error("Stripe Connect ID not found for owner of the event!");
  }

  const metadata: StripeCheckoutMetaDataForTicketType = {
    eventId,
    userId,
    ticketTypeId,
    stripeConnectId,
  };

  // Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create(
    {
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: event.currency || "nok",
            product_data: {
              name: `${event.name} - ${ticketType.name}`,
              ...(ticketType.description?.trim()
                ? { description: ticketType.description.trim() }
                : {}),
            },
            unit_amount: Math.round(ticketType.price * 100),//stripe expects price in cents
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: Math.round(ticketType.price * 100 * 0.02), // 2% fee
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
