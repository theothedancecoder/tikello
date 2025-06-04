import { query, mutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { DURATIONS, WAITING_LIST_STATUS, TICKET_STATUS } from "./constant";
import { processQueue } from "./waitingList";

export type Metrics = {
  soldTickets: number;
  refundedTickets: number;
  cancelledTickets: number;
  revenue: number;
};

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("is_cancelled"), undefined))
      .collect();
  },
});

export const getById = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    return await ctx.db.get(eventId);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    location: v.string(),
    eventDate: v.number(), // Store as timestamp
    price: v.number(),
    totalTickets: v.number(),
    userId: v.string(),
    currency: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const eventId = await ctx.db.insert("events", {
      name: args.name,
      description: args.description,
      location: args.location,
      eventDate: args.eventDate,
      price: args.price,
      totalTickets: args.totalTickets,
      userId: args.userId,
      currency: args.currency || "NOK", // Default to NOK if not provided
    });
    return eventId;
  },
});

// Helper function to check ticket availability for an event
export const checkAvailability = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");

    // Count total purchased tickets
    const purchasedCount = await ctx.db
      .query("tickets")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect()
      .then(
        (tickets) =>
          tickets.filter(
            (t) =>
              t.status === TICKET_STATUS.VALID ||
              t.status === TICKET_STATUS.USED
          ).length
      );

    // Count current valid offers
    const now = Date.now();
    const activeOffers = await ctx.db
      .query("waitingList")
      .withIndex("by_event_status", (q) =>
        q.eq("eventId", eventId).eq("status", WAITING_LIST_STATUS.OFFERED)
      )
      .collect()
      .then(
        (entries) => entries.filter((e) => (e.offerExpiresAt ?? 0) > now).length
      );

    const availableSpots = event.totalTickets - (purchasedCount + activeOffers);

    return {
      available: availableSpots > 0,
      availableSpots,
      totalTickets: event.totalTickets,
      purchasedCount,
      activeOffers,
    };
  },
});

// Join waiting list for an event
export const joinWaitingList = mutation({
  // Function takes an event ID and user ID as arguments
  args: { eventId: v.id("events"), userId: v.string() },
  handler: async (ctx, { eventId, userId }) => {
    // First check if user already has an active entry in waiting list for this event
    // Active means any status except EXPIRED
    const existingEntry = await ctx.db
      .query("waitingList")
      .withIndex("by_user_event", (q) =>
        q.eq("userId", userId).eq("eventId", eventId)
      )
      .filter((q) => q.neq(q.field("status"), WAITING_LIST_STATUS.EXPIRED))
      .first();

    // Don't allow duplicate entries
    if (existingEntry) {
      throw new Error("Already in waiting list for this event");
    }

    // Verify the event exists
    // Check if there are any available tickets right now
    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");

    // Count total purchased tickets
    const purchasedCount = await ctx.db
      .query("tickets")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect()
      .then(
        (tickets) =>
          tickets.filter(
            (t) =>
              t.status === TICKET_STATUS.VALID ||
              t.status === TICKET_STATUS.USED
          ).length
      );

    // Count current valid offers
    const now = Date.now();
    const activeOffers = await ctx.db
      .query("waitingList")
      .withIndex("by_event_status", (q) =>
        q.eq("eventId", eventId).eq("status", WAITING_LIST_STATUS.OFFERED)
      )
      .collect()
      .then(
        (entries) => entries.filter((e) => (e.offerExpiresAt ?? 0) > now).length
      );

    const availableSpots = event.totalTickets - (purchasedCount + activeOffers);
    const available = availableSpots > 0;

    if (available) {
      // If tickets are available, create an offer entry
      const waitingListId = await ctx.db.insert("waitingList", {
        eventId,
        userId,
        status: WAITING_LIST_STATUS.OFFERED, // Mark as offered
        offerExpiresAt: now + DURATIONS.TICKET_OFFER, // Set expiration time
      });

      // Note: Scheduler functionality removed for now
    } else {
      // If no tickets available, add to waiting list
      await ctx.db.insert("waitingList", {
        eventId,
        userId,
        status: WAITING_LIST_STATUS.WAITING, // Mark as waiting
      });
    }

    // Return appropriate status message
    return {
      success: true,
      status: available
        ? WAITING_LIST_STATUS.OFFERED // If available, status is offered
        : WAITING_LIST_STATUS.WAITING, // If not available, status is waiting
      message: available
        ? "Ticket offered - you have 15 minutes to purchase"
        : "Added to waiting list - you'll be notified when a ticket becomes available",
    };
  },
});

// Purchase ticket
export const purchaseTicket = mutation({
  args: {
    eventId: v.id("events"),
    userId: v.string(),
    waitingListId: v.id("waitingList"),
    paymentInfo: v.object({
      paymentIntentId: v.string(),
      amount: v.number(),
    }),
  },
  handler: async (ctx, { eventId, userId, waitingListId, paymentInfo }) => {
    console.log("Starting purchaseTicket handler", {
      eventId,
      userId,
      waitingListId,
    });

    // Verify waiting list entry exists and is valid
    const waitingListEntry = await ctx.db.get(waitingListId);
    console.log("Waiting list entry:", waitingListEntry);

    if (!waitingListEntry) {
      console.error("Waiting list entry not found");
      throw new Error("Waiting list entry not found");
    }

    if (waitingListEntry.status !== WAITING_LIST_STATUS.OFFERED) {
      console.error("Invalid waiting list status", {
        status: waitingListEntry.status,
      });
      throw new Error(
        "Invalid waiting list status - ticket offer may have expired"
      );
    }

    if (waitingListEntry.userId !== userId) {
      console.error("User ID mismatch", {
        waitingListUserId: waitingListEntry.userId,
        requestUserId: userId,
      });
      throw new Error("Waiting list entry does not belong to this user");
    }

    // Verify event exists and is active
    const event = await ctx.db.get(eventId);
    console.log("Event details:", event);

    if (!event) {
      console.error("Event not found", { eventId });
      throw new Error("Event not found");
    }

    if (event.is_cancelled) {
      console.error("Attempted purchase of cancelled event", { eventId });
      throw new Error("Event is no longer active");
    }

    try {
      console.log("Creating ticket with payment info", paymentInfo);
      // Create ticket with payment info
      await ctx.db.insert("tickets", {
        eventId,
        userId,
        purchasedAt: Date.now(),
        status: TICKET_STATUS.VALID,
        paymentIntentId: paymentInfo.paymentIntentId,
        amount: paymentInfo.amount,
        originalAmount: paymentInfo.amount,
      });

      console.log("Updating waiting list status to purchased");
      await ctx.db.patch(waitingListId, {
        status: WAITING_LIST_STATUS.PURCHASED,
      });

      console.log("Purchase ticket completed successfully");
      // Note: Queue processing removed for now
    } catch (error) {
      console.error("Failed to complete ticket purchase:", error);
      throw new Error(`Failed to complete ticket purchase: ${error}`);
    }
  },
});

// Purchase ticket type (for multi-tier tickets)
export const purchaseTicketType = mutation({
  args: {
    eventId: v.id("events"),
    userId: v.string(),
    ticketTypeId: v.id("ticketTypes"),
    paymentInfo: v.object({
      paymentIntentId: v.string(),
      amount: v.number(),
    }),
  },
  handler: async (ctx, { eventId, userId, ticketTypeId, paymentInfo }) => {
    console.log("Starting purchaseTicketType handler", {
      eventId,
      userId,
      ticketTypeId,
    });

    // Verify event exists and is active
    const event = await ctx.db.get(eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    if (event.is_cancelled) {
      throw new Error("Event is no longer active");
    }

    // Verify ticket type exists and belongs to this event
    const ticketType = await ctx.db.get(ticketTypeId);
    if (!ticketType) {
      throw new Error("Ticket type not found");
    }

    if (ticketType.eventId !== eventId) {
      throw new Error("Ticket type does not belong to this event");
    }

    // Check if ticket type is available
    if (ticketType.soldQuantity >= ticketType.totalQuantity) {
      throw new Error("Ticket type is sold out");
    }

    // Check if ticket type is enabled and within sales window
    const now = Date.now();
    const isWithinSalesWindow =
      (!ticketType.startDate || ticketType.startDate <= now) &&
      (!ticketType.endDate || ticketType.endDate > now);

    if (!ticketType.isEnabled || !isWithinSalesWindow) {
      throw new Error("Ticket type is not available for purchase");
    }

    try {
      console.log("Creating ticket with payment info", paymentInfo);
      // Create ticket with payment info and ticket type reference
      await ctx.db.insert("tickets", {
        eventId,
        userId,
        purchasedAt: Date.now(),
        status: TICKET_STATUS.VALID,
        paymentIntentId: paymentInfo.paymentIntentId,
        amount: paymentInfo.amount,
        originalAmount: paymentInfo.amount,
        ticketTypeId: ticketTypeId,
      });

      // Increment sold quantity for the ticket type
      await ctx.db.patch(ticketTypeId, {
        soldQuantity: ticketType.soldQuantity + 1,
      });

      console.log("Purchase ticket type completed successfully");
    } catch (error) {
      console.error("Failed to complete ticket type purchase:", error);
      throw new Error(`Failed to complete ticket type purchase: ${error}`);
    }
  },
});

// Get user's tickets with event information
export const getUserTickets = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const ticketsWithEvents = await Promise.all(
      tickets.map(async (ticket) => {
        const event = await ctx.db.get(ticket.eventId);
        return {
          ...ticket,
          event,
        };
      })
    );

    return ticketsWithEvents;
  },
});

// Get user's waiting list entries with event information
export const getUserWaitingList = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const entries = await ctx.db
      .query("waitingList")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const entriesWithEvents = await Promise.all(
      entries.map(async (entry) => {
        const event = await ctx.db.get(entry.eventId);
        return {
          ...entry,
          event,
        };
      })
    );

    return entriesWithEvents;
  },
});

export const getEventAvailability = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");

    // Count total purchased tickets
    const purchasedCount = await ctx.db
      .query("tickets")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect()
      .then(
        (tickets) =>
          tickets.filter(
            (t) =>
              t.status === TICKET_STATUS.VALID ||
              t.status === TICKET_STATUS.USED
          ).length
      );

    // Count current valid offers
    const now = Date.now();
    const activeOffers = await ctx.db
      .query("waitingList")
      .withIndex("by_event_status", (q) =>
        q.eq("eventId", eventId).eq("status", WAITING_LIST_STATUS.OFFERED)
      )
      .collect()
      .then(
        (entries) => entries.filter((e) => (e.offerExpiresAt ?? 0) > now).length
      );

    const totalReserved = purchasedCount + activeOffers;

    return {
      isSoldOut: totalReserved >= event.totalTickets,
      totalTickets: event.totalTickets,
      purchasedCount,
      activeOffers,
      remainingTickets: Math.max(0, event.totalTickets - totalReserved),
    };
  },
});

export const search = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, { searchTerm }) => {
    const events = await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("is_cancelled"), undefined))
      .collect();

    return events.filter((event) => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        event.name.toLowerCase().includes(searchTermLower) ||
        event.description.toLowerCase().includes(searchTermLower) ||
        event.location.toLowerCase().includes(searchTermLower)
      );
    });
  },
});

export const getSellerEvents = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const events = await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    // For each event, get ticket sales data
    const eventsWithMetrics = await Promise.all(
      events.map(async (event) => {
        const tickets = await ctx.db
          .query("tickets")
          .withIndex("by_event", (q) => q.eq("eventId", event._id))
          .collect();

        const validTickets = tickets.filter(
          (t) => t.status === "valid" || t.status === "used"
        );
        const refundedTickets = tickets.filter((t) => t.status === "refunded");
        const cancelledTickets = tickets.filter(
          (t) => t.status === "cancelled"
        );

        const metrics: Metrics = {
          soldTickets: validTickets.length,
          refundedTickets: refundedTickets.length,
          cancelledTickets: cancelledTickets.length,
          revenue: validTickets.length * event.price,
        };

        return {
          ...event,
          metrics,
        };
      })
    );

    return eventsWithMetrics;
  },
});

export const update = mutation({
  args: {
    eventId: v.id("events"),
    updates: v.object({
      name: v.string(),
      description: v.string(),
      location: v.string(),
      eventDate: v.float64(),
      price: v.float64(),
      totalTickets: v.float64(),
      currency: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { eventId, updates }) => {

    // Get current event to check tickets sold
    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");

    const soldTickets = await ctx.db
      .query("tickets")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .filter((q) =>
        q.or(q.eq(q.field("status"), "valid"), q.eq(q.field("status"), "used"))
      )
      .collect();

    // Ensure new total tickets is not less than sold tickets
    if (updates.totalTickets < soldTickets.length) {
      throw new Error(
        `Cannot reduce total tickets below ${soldTickets.length} (number of tickets already sold)`
      );
    }

    await ctx.db.patch(eventId, updates);
    return eventId;
  },
});


export const cancelEvent = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");

    // Get all valid tickets for this event
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .filter((q) =>
        q.or(q.eq(q.field("status"), "valid"), q.eq(q.field("status"), "used"))
      )
      .collect();

    if (tickets.length > 0) {
      throw new Error(
        "Cannot cancel event with active tickets. Please refund all tickets first."
      );
    }

    // Mark event as cancelled
    await ctx.db.patch(eventId, {
      is_cancelled: true,
    });

    // Delete any waiting list entries
    const waitingListEntries = await ctx.db
      .query("waitingList")
      .withIndex("by_event_status", (q) => q.eq("eventId", eventId))
      .collect();

    for (const entry of waitingListEntries) {
      await ctx.db.delete(entry._id);
    }

    return { success: true };
  },
});

export const enableMultiTierTickets = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");

    await ctx.db.patch(eventId, {
      hasMultiTierTickets: true,
    });

    return { success: true };
  },
});

export const getFinancialSummary = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");

    // Get all tickets for this event
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .filter((q) => 
        q.or(
          q.eq(q.field("status"), TICKET_STATUS.VALID),
          q.eq(q.field("status"), TICKET_STATUS.USED)
        )
      )
      .collect();

    // Calculate totals
    let totalTicketsSold = tickets.length;
    let totalOriginalAmount = 0;
    let totalDiscountAmount = 0;
    let totalFinalAmount = 0;
    let totalFeeAmount = 0;
    let totalNetAmount = 0;

    // Group tickets by type
    const ticketTypeBreakdown: Record<string, {
      count: number;
      originalAmount: number;
      discountAmount: number;
      finalAmount: number;
      feeAmount: number;
      netAmount: number;
    }> = {};

    for (const ticket of tickets) {
      const originalAmount = ticket.originalAmount || ticket.amount;
      const discountAmount = ticket.discountAmount || 0;
      const finalAmount = ticket.amount;
      const feeAmount = Math.round(finalAmount * 0.02); // 2% platform fee
      const netAmount = finalAmount - feeAmount;

      totalOriginalAmount += originalAmount;
      totalDiscountAmount += discountAmount;
      totalFinalAmount += finalAmount;
      totalFeeAmount += feeAmount;
      totalNetAmount += netAmount;

      // Get ticket type name
      let ticketTypeName = "Standard Ticket";
      if (ticket.ticketTypeId) {
        const ticketType = await ctx.db.get(ticket.ticketTypeId);
        if (ticketType) {
          ticketTypeName = ticketType.name;
        }
      }

      if (!ticketTypeBreakdown[ticketTypeName]) {
        ticketTypeBreakdown[ticketTypeName] = {
          count: 0,
          originalAmount: 0,
          discountAmount: 0,
          finalAmount: 0,
          feeAmount: 0,
          netAmount: 0,
        };
      }

      ticketTypeBreakdown[ticketTypeName].count += 1;
      ticketTypeBreakdown[ticketTypeName].originalAmount += originalAmount;
      ticketTypeBreakdown[ticketTypeName].discountAmount += discountAmount;
      ticketTypeBreakdown[ticketTypeName].finalAmount += finalAmount;
      ticketTypeBreakdown[ticketTypeName].feeAmount += feeAmount;
      ticketTypeBreakdown[ticketTypeName].netAmount += netAmount;
    }

    return {
      totalTicketsSold,
      totalOriginalAmount,
      totalDiscountAmount,
      totalFinalAmount,
      totalFeeAmount,
      totalNetAmount,
      ticketTypeBreakdown,
      currency: event.currency || "nok",
    };
  },
});

// Purchase multiple ticket types from cart
export const purchaseCartTickets = mutation({
  args: {
    eventId: v.id("events"),
    userId: v.string(),
    cartItems: v.array(v.object({
      ticketTypeId: v.id("ticketTypes"),
      quantity: v.number(),
      price: v.number(),
    })),
    paymentInfo: v.object({
      paymentIntentId: v.string(),
      amount: v.number(),
    }),
    discountCodeId: v.optional(v.id("discountCodes")),
    buyerInfo: v.optional(v.object({
      fullName: v.string(),
      email: v.string(),
      phone: v.optional(v.string()),
    })),
  },
  handler: async (ctx, { eventId, userId, cartItems, paymentInfo, discountCodeId, buyerInfo }) => {
    console.log("Starting purchaseCartTickets handler", {
      eventId,
      discountCodeId,
      userId,
      cartItems,
    });

    // Verify event exists and is active
    const event = await ctx.db.get(eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    if (event.is_cancelled) {
      throw new Error("Event is no longer active");
    }

    // Store buyer information if provided
    if (buyerInfo) {
      // Check if user exists, if not create/update with buyer info
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_user_id", (q) => q.eq("userId", userId))
        .first();

      if (existingUser) {
        // Update existing user with buyer info
        await ctx.db.patch(existingUser._id, {
          name: buyerInfo.fullName,
          email: buyerInfo.email,
          phone: buyerInfo.phone,
        });
      } else {
        // Create new user record with buyer info
        await ctx.db.insert("users", {
          userId,
          name: buyerInfo.fullName,
          email: buyerInfo.email,
          phone: buyerInfo.phone,
        });
      }
    }

    // Verify all ticket types and check availability
    const ticketTypes = await Promise.all(
      cartItems.map(async (item) => {
        const ticketType = await ctx.db.get(item.ticketTypeId);
        if (!ticketType) {
          throw new Error(`Ticket type ${item.ticketTypeId} not found`);
        }

        if (ticketType.eventId !== eventId) {
          throw new Error("Ticket type does not belong to this event");
        }

        // Check availability
        if (ticketType.soldQuantity + item.quantity > ticketType.totalQuantity) {
          throw new Error(`Not enough ${ticketType.name} tickets available`);
        }

        // Check if ticket type is enabled and within sales window
        const now = Date.now();
        const isWithinSalesWindow =
          (!ticketType.startDate || ticketType.startDate <= now) &&
          (!ticketType.endDate || ticketType.endDate > now);

        if (!ticketType.isEnabled || !isWithinSalesWindow) {
          throw new Error(`${ticketType.name} is not available for purchase`);
        }

        return ticketType;
      })
    );

    try {
      // If discount code provided, validate and get discount percentage
      let discountPercentage = 0;
      if (discountCodeId) {
        const discountCode = await ctx.db.get(discountCodeId);
        if (!discountCode || !discountCode.active) {
          throw new Error("Invalid or inactive discount code");
        }

        const now = Date.now();
        if (discountCode.validFrom && discountCode.validFrom > now) {
          throw new Error("Discount code is not yet valid");
        }
        if (discountCode.validTo && discountCode.validTo < now) {
          throw new Error("Discount code has expired");
        }
        if (discountCode.usageLimit && discountCode.usedCount >= discountCode.usageLimit) {
          throw new Error("Discount code has reached its usage limit");
        }

        discountPercentage = discountCode.percentage;
      }

      // Create tickets for each cart item
      for (let i = 0; i < cartItems.length; i++) {
        const item = cartItems[i];
        const ticketType = ticketTypes[i];

        // Calculate discounted price
        const discountAmount = Math.round((item.price * discountPercentage) / 100);
        const finalPrice = item.price - discountAmount;

        // Create multiple tickets based on quantity
        for (let j = 0; j < item.quantity; j++) {
          await ctx.db.insert("tickets", {
            eventId,
            userId,
            purchasedAt: Date.now(),
            status: TICKET_STATUS.VALID,
            paymentIntentId: paymentInfo.paymentIntentId,
            amount: finalPrice, // Store the discounted price
            originalAmount: item.price, // Store original price for reference
            ticketTypeId: item.ticketTypeId,
            discountCodeId, // Store reference to used discount code
            discountAmount, // Store the discount amount
          });
        }

        // Update sold quantity for each ticket type
        await ctx.db.patch(item.ticketTypeId, {
          soldQuantity: ticketType.soldQuantity + item.quantity,
        });
      }

      // If discount code was used, increment its usage count
      if (discountCodeId) {
        await ctx.db.patch(discountCodeId, {
          usedCount: (await ctx.db.get(discountCodeId))!.usedCount + 1,
        });
      }

      console.log("Purchase cart tickets completed successfully");
    } catch (error) {
      console.error("Failed to complete cart purchase:", error);
      throw new Error(`Failed to complete cart purchase: ${error}`);
    }
  },
});
