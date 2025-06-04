import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const create = mutation({
  args: {
    eventId: v.id("events"),
    sellerId: v.string(),
    code: v.string(),
    percentage: v.number(),
    validFrom: v.optional(v.number()),
    validTo: v.optional(v.number()),
    usageLimit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { eventId, sellerId, code, percentage, validFrom, validTo, usageLimit } = args;

    // Verify event exists
    const event = await ctx.db.get(eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Check if code already exists for this event
    const existingCode = await ctx.db
      .query("discountCodes")
      .withIndex("by_event_code", (q) => 
        q.eq("eventId", eventId).eq("code", code.toUpperCase())
      )
      .first();

    if (existingCode) {
      throw new Error("Discount code already exists for this event");
    }

    // Create new discount code
    const discountCodeId = await ctx.db.insert("discountCodes", {
      eventId,
      code: code.toUpperCase(),
      percentage,
      validFrom,
      validTo,
      usageLimit,
      usedCount: 0,
      active: true,
      createdAt: Date.now(),
      sellerId,
    });

    return discountCodeId;
  },
});

export const getByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    return await ctx.db
      .query("discountCodes")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect();
  },
});

export const getById = query({
  args: { discountCodeId: v.id("discountCodes") },
  handler: async (ctx, { discountCodeId }) => {
    return await ctx.db.get(discountCodeId);
  },
});

export const validateCode = query({
  args: {
    eventId: v.id("events"),
    code: v.string(),
  },
  handler: async (ctx, { eventId, code }) => {
    const discountCode = await ctx.db
      .query("discountCodes")
      .withIndex("by_event_code", (q) => 
        q.eq("eventId", eventId).eq("code", code.toUpperCase())
      )
      .first();

    if (!discountCode) {
      return { valid: false, message: "Invalid discount code" };
    }

    if (!discountCode.active) {
      return { valid: false, message: "Discount code is inactive" };
    }

    const now = Date.now();
    if (discountCode.validFrom && discountCode.validFrom > now) {
      return { valid: false, message: "Discount code is not yet valid" };
    }

    if (discountCode.validTo && discountCode.validTo < now) {
      return { valid: false, message: "Discount code has expired" };
    }

    if (discountCode.usageLimit && discountCode.usedCount >= discountCode.usageLimit) {
      return { valid: false, message: "Discount code has reached its usage limit" };
    }

    return { valid: true, discount: discountCode };
  },
});

export const update = mutation({
  args: {
    discountCodeId: v.id("discountCodes"),
    updates: v.object({
      percentage: v.optional(v.number()),
      validFrom: v.optional(v.number()),
      validTo: v.optional(v.number()),
      usageLimit: v.optional(v.number()),
      active: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { discountCodeId, updates }) => {
    const discountCode = await ctx.db.get(discountCodeId);
    if (!discountCode) {
      throw new Error("Discount code not found");
    }

    await ctx.db.patch(discountCodeId, updates);
    return discountCodeId;
  },
});

export const delete_ = mutation({
  args: { discountCodeId: v.id("discountCodes") },
  handler: async (ctx, { discountCodeId }) => {
    const discountCode = await ctx.db.get(discountCodeId);
    if (!discountCode) {
      throw new Error("Discount code not found");
    }

    await ctx.db.delete(discountCodeId);
    return { success: true };
  },
});

export const incrementUsage = mutation({
  args: { discountCodeId: v.id("discountCodes") },
  handler: async (ctx, { discountCodeId }) => {
    const discountCode = await ctx.db.get(discountCodeId);
    if (!discountCode) {
      throw new Error("Discount code not found");
    }

    await ctx.db.patch(discountCodeId, {
      usedCount: discountCode.usedCount + 1,
    });

    return { success: true };
  },
});

export const getUsageDetails = query({
  args: { discountCodeId: v.id("discountCodes") },
  handler: async (ctx, { discountCodeId }) => {
    // Get all tickets that used this discount code
    const tickets = await ctx.db
      .query("tickets")
      .filter((q) => q.eq(q.field("discountCodeId"), discountCodeId))
      .collect();

    // Get user details for each ticket
    const usageDetails = await Promise.all(
      tickets.map(async (ticket) => {
        const user = await ctx.db
          .query("users")
          .withIndex("by_user_id", (q) => q.eq("userId", ticket.userId))
          .first();

        return {
          ticketId: ticket._id,
          userId: ticket.userId,
          userName: user?.name || "Unknown User",
          userEmail: user?.email || "Unknown Email",
          purchasedAt: ticket.purchasedAt,
          originalAmount: ticket.originalAmount || ticket.amount,
          discountAmount: ticket.discountAmount || 0,
          finalAmount: ticket.amount,
        };
      })
    );

    return usageDetails;
  },
});
