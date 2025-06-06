import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  events: defineTable({
    name: v.string(),
    description: v.string(),
    location: v.string(),
    eventDate: v.number(),
    price: v.number(),
    totalTickets: v.number(),
    userId: v.string(),
    currency: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    is_cancelled: v.optional(v.boolean()),
    hasMultiTierTickets: v.optional(v.boolean()),
  }).index("by_user", ["userId"]),

  tickets: defineTable({
    eventId: v.id("events"),
    userId: v.string(),
    purchasedAt: v.number(),
    status: v.string(),
    paymentIntentId: v.string(),
    amount: v.number(),
    originalAmount: v.optional(v.number()),
    discountAmount: v.optional(v.number()),
    ticketTypeId: v.optional(v.id("ticketTypes")),
    discountCodeId: v.optional(v.id("discountCodes")),
    // Stripe fee breakdown
    stripeFees: v.optional(v.object({
      gross: v.number(),
      fee: v.number(),
      net: v.number(),
      feeDetails: v.array(v.object({
        type: v.string(),
        amount: v.number(),
        currency: v.string(),
      })),
    })),
  })
    .index("by_user", ["userId"])
    .index("by_event", ["eventId"])
    .index("by_user_event", ["userId", "eventId"]),

  waitingList: defineTable({
    eventId: v.id("events"),
    userId: v.string(),
    status: v.string(),
    offerExpiresAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_event_status", ["eventId", "status"])
    .index("by_user_event", ["userId", "eventId"]),

  ticketTypes: defineTable({
    eventId: v.id("events"),
    name: v.string(),
    description: v.string(),
    price: v.number(),
    totalQuantity: v.number(),
    soldQuantity: v.number(),
    isEnabled: v.boolean(),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    sortOrder: v.optional(v.number()),
    type: v.optional(v.string()),
  }).index("by_event", ["eventId"]),

  discountCodes: defineTable({
    eventId: v.id("events"),
    sellerId: v.string(),
    code: v.string(),
    percentage: v.number(),
    usageLimit: v.optional(v.number()),
    usedCount: v.number(),
    validFrom: v.optional(v.number()),
    validTo: v.optional(v.number()),
    active: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_event", ["eventId"])
    .index("by_event_code", ["eventId", "code"])
    .index("by_seller", ["sellerId"]),

  users: defineTable({
    userId: v.string(),
    email: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    stripeConnectId: v.optional(v.string()),
  }).index("by_user_id", ["userId"]),
});
