"use server";

import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface DuplicateEventInput {
  eventId: Id<"events">;
  newStartDate: string; // ISO string
  newEndDate: string;   // ISO string
}

export async function duplicateEvent({ eventId, newStartDate, newEndDate }: DuplicateEventInput) {
  const convex = getConvexClient();

  // Fetch existing event
  const event = await convex.query(api.events.getById, { eventId });
  if (!event) throw new Error("Event not found");

  // Prepare new event data by copying existing event and updating dates
  const newEventData = {
    name: event.name + " (Copy)",
    description: event.description,
    location: event.location,
    eventDate: new Date(newStartDate).getTime(),
    price: event.price,
    totalTickets: event.totalTickets,
    userId: event.userId,
    currency: event.currency,
  };

  // Create new event
  const newEventId = await convex.mutation(api.events.create, newEventData);

  // Optionally duplicate ticket types for the new event
  const ticketTypes = await convex.query(api.ticketTypes.get, { eventId });
  if (ticketTypes && ticketTypes.length > 0) {
    await Promise.all(
      ticketTypes.map(async (ticketType) => {
        await convex.mutation(api.ticketTypes.create, {
          eventId: newEventId,
          name: ticketType.name,
          description: ticketType.description,
          price: ticketType.price,
          totalQuantity: ticketType.totalQuantity,
          type: (ticketType.type as "leader" | "follower" | "refreshment" | "afterparty" | "other") ?? "other",
          startDate: ticketType.startDate !== undefined ? ticketType.startDate : 0,
          endDate: ticketType.endDate !== undefined ? ticketType.endDate : 0,
          sortOrder: ticketType.sortOrder,
        });
      })
    );
  }

  return { success: true, newEventId };
}
