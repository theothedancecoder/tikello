import { v } from "convex/values";
import { query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const getBuyersByEvent = query({
  args: {
    eventId: v.id("events"),
    search: v.optional(v.string()),
    ticketType: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("valid"),
      v.literal("used"),
      v.literal("refunded"),
      v.literal("cancelled")
    )),
  },
  handler: async (ctx, args) => {
    // SECURITY: Get current user identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    // SECURITY: Verify event ownership
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    if (event.userId !== identity.subject) {
      throw new Error("Unauthorized: You can only view buyers for your own events");
    }
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    // Get all unique userIds and ticketTypeIds
    const userIds = [...new Set(tickets.map((ticket) => ticket.userId))];
    const ticketTypeIds = [...new Set(tickets.map((ticket) => ticket.ticketTypeId).filter(Boolean))] as Id<"ticketTypes">[];

    // Fetch users and ticket types in parallel
    const [users, ticketTypes] = await Promise.all([
      ctx.db
        .query("users")
        .filter((q) => 
          q.or(...userIds.map(id => q.eq(q.field("userId"), id)))
        )
        .collect(),
      ctx.db
        .query("ticketTypes")
        .filter((q) => 
          q.or(...ticketTypeIds.map(id => q.eq(q.field("_id"), id)))
        )
        .collect(),
    ]);

    // Create maps for faster lookups
    const userMap = new Map(users.map(user => [user.userId, user]));
    const ticketTypeMap = new Map(ticketTypes.map(type => [type._id, type]));

    // Combine data and apply filters
    let buyerData = tickets.map(ticket => {
      const user = userMap.get(ticket.userId);
      const ticketType = ticket.ticketTypeId ? ticketTypeMap.get(ticket.ticketTypeId) : null;

      return {
        ticketId: ticket._id,
        purchasedAt: ticket.purchasedAt,
        status: ticket.status,
        buyer: {
          name: user?.name || "Unknown",
          email: user?.email || "Unknown",
        },
        ticketType: ticketType?.name || "Standard Ticket",
        amount: ticket.amount,
      };
    });

    // Apply filters if provided
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      buyerData = buyerData.filter(data => 
        data.buyer.name.toLowerCase().includes(searchLower) ||
        data.buyer.email.toLowerCase().includes(searchLower)
      );
    }

    if (typeof args.ticketType === "string") {
      buyerData = buyerData.filter(data => 
        data.ticketType.toLowerCase() === args.ticketType.toLowerCase()
      );
    }

    if (args.status) {
      buyerData = buyerData.filter(data => 
        data.status === args.status
      );
    }

    // Sort by purchase date (most recent first)
    buyerData.sort((a, b) => b.purchasedAt - a.purchasedAt);

    return buyerData;
  },
});
