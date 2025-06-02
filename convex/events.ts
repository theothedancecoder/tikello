import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { DURATIONS, TICKET_STATUS, WAITING_LIST_STATUS } from "./constant"
import { internal } from "./_generated/api"

export const get = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
        .query("events")
        .filter((q) => q.eq(q.field("is_cancelled"), undefined))
        .collect()
    },
})

export const getById = query({
    args: { eventId: v.id("events") },
    handler: async (ctx, { eventId }) => {
        return await ctx.db.get(eventId);
    },
})

export const getEventAvailability = query({
    args: { eventId: v.id("events") },
    handler: async (ctx, { eventId }) => {
        const event = await ctx.db.get(eventId)
        if (!event) throw new Error("Event not found")

        // count total purchased tickets
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
        )
        // count current valid offers
        const now = Date.now()
        const activeOffers = await ctx.db
        .query("waitingList")
        .withIndex(
            "by_event_status",
            (q) => q.eq("eventId", eventId).eq("status", WAITING_LIST_STATUS.OFFERED)
        )
        .collect()
        .then(
            (entries) => entries.filter((e) => (e.offerExpiresAt ?? 0) > now).length
        )
        const totalReserved = purchasedCount + activeOffers
        return {
            isSoldOut: totalReserved >= event.totalTickets,
            totalTickets: event.totalTickets,
            purchasedCount,
            activeOffers,
            remainingTickets: Math.max(0, event.totalTickets - totalReserved),
        }
    },
})

// Helper function to check ticket availability for an event
export const checkAvailability = query({
    args: { eventId: v.id("events") },
    handler: async (ctx, { eventId }) => {
        const event = await ctx.db.get(eventId)
        if (!event) throw new Error("Event not found")

        // count total purchased tickets
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
        )

        // count current valid offers
        const now = Date.now()
        const activeOffers = await ctx.db
        .query("waitingList")
        .withIndex("by_event_status", (q) =>
            q.eq("eventId", eventId).eq("status", WAITING_LIST_STATUS.OFFERED)
        )
        .collect()
        .then(
            (entries) => entries.filter((e) => (e.offerExpiresAt ?? 0) > now).length
        )
        const availableSpots = event.totalTickets - (purchasedCount + activeOffers)

        return {
            available: availableSpots > 0,
            availableSpots,
            totalTickets: event.totalTickets,
            purchasedCount,
            activeOffers,
        }
    },
})

// join waiting list for an event
export const joinWaitingList = mutation({
    // function takes an event ID and user ID as arguments
    args: { eventId: v.id("events"), userId: v.string() },
    handler: async (ctx, { eventId, userId }) => {

        // Rate Limiting - example commented out code syntax fixed
        /*
        const status = await rateLimiter.limit(ctx, "queueJoin", { key: userId })
        if (!status.ok) {
            throw new ConvexError(
                `You've joined the waiting list too many times. Please wait ${Math.ceil(
                    status.retryAfter / 60 / 1000
                )} minutes before trying again`
            )
        }
        */

        // First check if user has an active entry in waiting list for this event. Active
        // means any status except expired

        const existingEntry = await ctx.db
        .query("waitingList")
        .withIndex("by_user_event", (q) => q.eq("userId", userId).eq("eventId", eventId))
        .filter((q) => q.neq(q.field("status"), WAITING_LIST_STATUS.EXPIRED))
        .first()

        // Don't allow duplicate entries
        if (existingEntry) {
            throw new Error("Already in waiting list for this event")
        }
        // verify the event exists
        const event = await ctx.db.get(eventId)
        if (!event) throw new Error("Event not found")

        // check if there are any available tickets right now
        const now = Date.now()
        
        // count total purchased tickets
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
        )

        // count current valid offers
        const activeOffers = await ctx.db
        .query("waitingList")
        .withIndex("by_event_status", (q) =>
            q.eq("eventId", eventId).eq("status", WAITING_LIST_STATUS.OFFERED)
        )
        .collect()
        .then(
            (entries) => entries.filter((e) => (e.offerExpiresAt ?? 0) > now).length
        )
        const availableSpots = event.totalTickets - (purchasedCount + activeOffers)
        const available = availableSpots > 0

        if (available){
            // if ticket available , create an offer entry
            const waitingListId = await ctx.db.insert("waitingList",{
                eventId,
                userId,
                status: WAITING_LIST_STATUS.OFFERED, //Mark as offered
                offerExpiresAt: now + DURATIONS.TICKET_OFFER, // set expiration time
            })

            //schedule a job to expire this offer after the offer duration
            await ctx.scheduler.runAfter(
                DURATIONS.TICKET_OFFER,
                internal.waitingList.expireOffer,
                {
                    waitingListId,
                    eventId
                }
            )
        }else{
            //if not tickets available, add to waiting list
            await ctx.db.insert("waitingList", {
                eventId,
                userId,
                status: WAITING_LIST_STATUS.WAITING, //mark as waiting
            })
        }
        // return appropriate status message
        return{
            success: true,
            status: available
            ? WAITING_LIST_STATUS.OFFERED // if available, status is offered
            : WAITING_LIST_STATUS.WAITING, // if not available, status is waiting
            message: available
            ? `Ticket offered- you have ${DURATIONS.TICKET_OFFER / (60*1000)} minutes to purchase`
            : "Added to waiting list - you'll be notified when a ticket becomes available"
        }
       
    },
})
