import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    return await ctx.db
      .query("ticketTypes")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect();
  },
});

export const getById = query({
  args: { ticketTypeId: v.id("ticketTypes") },
  handler: async (ctx, { ticketTypeId }) => {
    return await ctx.db.get(ticketTypeId);
  },
});

export const create = mutation({
  args: {
    eventId: v.id("events"),
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    totalQuantity: v.number(),
    type: v.union(
      v.literal("leader"),
      v.literal("follower"),
      v.literal("refreshment"),
      v.literal("afterparty"),
      v.literal("other")
    ),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("ticketTypes", {
      eventId: args.eventId,
      name: args.name,
      description: args.description ?? "",
      price: args.price,
      totalQuantity: args.totalQuantity,
      soldQuantity: 0,
      type: args.type,
      startDate: args.startDate,
      endDate: args.endDate,
      sortOrder: args.sortOrder,
      isEnabled: true,
    });
  },
});

export const update = mutation({
  args: {
    ticketTypeId: v.id("ticketTypes"),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      price: v.optional(v.number()),
      totalQuantity: v.optional(v.number()),
      type: v.optional(
        v.union(
          v.literal("leader"),
          v.literal("follower"),
          v.literal("refreshment"),
          v.literal("afterparty"),
          v.literal("other")
        )
      ),
      startDate: v.optional(v.number()),
      endDate: v.optional(v.number()),
      sortOrder: v.optional(v.number()),
      isEnabled: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { ticketTypeId, updates }) => {
    const ticketType = await ctx.db.get(ticketTypeId);
    if (!ticketType) throw new Error("Ticket type not found");

    // Ensure new quantity isn't less than sold quantity
    if (
      updates.totalQuantity !== undefined &&
      updates.totalQuantity < ticketType.soldQuantity
    ) {
      throw new Error(
        `Cannot reduce quantity below ${ticketType.soldQuantity} (number of tickets already sold)`
      );
    }

    await ctx.db.patch(ticketTypeId, updates);
  },
});

export const getAvailability = query({
  args: { ticketTypeId: v.id("ticketTypes") },
  handler: async (ctx, { ticketTypeId }) => {
    const ticketType = await ctx.db.get(ticketTypeId);
    if (!ticketType) throw new Error("Ticket type not found");

    const now = Date.now();
    const isWithinSalesWindow =
      (!ticketType.startDate || ticketType.startDate <= now) &&
      (!ticketType.endDate || ticketType.endDate > now);

    return {
      available: ticketType.soldQuantity < ticketType.totalQuantity && isWithinSalesWindow && ticketType.isEnabled,
      remaining: ticketType.totalQuantity - ticketType.soldQuantity,
      total: ticketType.totalQuantity,
      sold: ticketType.soldQuantity,
      isEnabled: ticketType.isEnabled,
      salesStatus: !isWithinSalesWindow
        ? "not_on_sale"
        : ticketType.soldQuantity >= ticketType.totalQuantity
        ? "sold_out"
        : "available",
    };
  },
});

export const incrementSoldQuantity = mutation({
  args: { ticketTypeId: v.id("ticketTypes") },
  handler: async (ctx, { ticketTypeId }) => {
    const ticketType = await ctx.db.get(ticketTypeId);
    if (!ticketType) throw new Error("Ticket type not found");

    if (ticketType.soldQuantity >= ticketType.totalQuantity) {
      throw new Error("Ticket type is sold out");
    }

    await ctx.db.patch(ticketTypeId, {
      soldQuantity: ticketType.soldQuantity + 1,
    });
  },
});
