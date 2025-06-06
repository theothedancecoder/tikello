"use server";

import { stripe } from "@/lib/stripe";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export async function refundEventTickets(eventId: Id<"events">) {
  const convex = getConvexClient();

  // Get event details
  const event = await convex.query(api.events.getById, { eventId });
  if (!event) throw new Error("Event not found");

  // Get event owner's Stripe Connect ID
  const stripeConnectId = await convex.query(
    api.users.getUsersStripeConnectId,
    {
      userId: event.userId,
    }
  );

  if (!stripeConnectId) {
    throw new Error("Stripe Connect ID not found");
  }

  // Get all valid tickets for this event
  const tickets = await convex.query(api.tickets.getValidTicketsForEvent, {
    eventId,
  });

  // Process refunds for each ticket
  const results = await Promise.allSettled(
    tickets.map(async (ticket) => {
      try {
        if (!ticket.paymentIntentId) {
          throw new Error("Payment information not found");
        }

        // Issue refund through Stripe
        await stripe.refunds.create(
          {
            payment_intent: ticket.paymentIntentId,
            reason: "requested_by_customer",
          },
          {
            stripeAccount: stripeConnectId,
          }
        );

        // Update ticket status to refunded
        await convex.mutation(api.tickets.updateTicketStatus, {
          ticketId: ticket._id,
          status: "refunded",
        });

        return { success: true, ticketId: ticket._id };
      } catch (error: unknown) {
        console.error(`Failed to refund ticket ${ticket._id}:`, error);
        let message = "Unknown error";
        if (error instanceof Error) {
          message = error.message;
        } else if (typeof error === "string") {
          message = error;
        }
        return { success: false, ticketId: ticket._id, error: message };
      }
    })
  );

  // Check if all refunds were successful
  const allSuccessful = results.every(
    (result): result is PromiseFulfilledResult<{ success: boolean; ticketId: Id<"tickets">; error?: string }> =>
      result.status === "fulfilled" && result.value.success
  );

  if (!allSuccessful) {
    // Collect failed ticket errors
    const failedTickets = results
      .filter(
        (result): result is PromiseFulfilledResult<{ success: boolean; ticketId: Id<"tickets">; error?: string }> =>
          result.status === "fulfilled" && !result.value.success
      )
      .map((result) => ({ ticketId: result.value.ticketId, error: result.value.error }));

    return { success: false, failedTickets };
  }

  // Cancel the event instead of deleting it
  await convex.mutation(api.events.cancelEvent, { eventId });

  return { success: true };
}
