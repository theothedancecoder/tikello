import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { DURATIONS, TICKET_STATUS, WAITING_LIST_STATUS } from "./constant"
import { internal } from "./_generated/api"

// Helper function to calculate event availability
async function calculateEventAvailability(ctx: any, eventId: string) {
    const now = Date.now()
    
    // Count total purchased tickets
    const purchasedCount = await ctx.db
        .query("tickets")
        .withIndex("by_event", (q: any) => q.eq("eventId", eventId))
        .collect()
        .then((tickets: any[]) =>
            tickets.filter(
                (t) =>
                    t.status === TICKET_STATUS.VALID ||
                    t.status === TICKET_STATUS.USED
            ).length
        )

    // Count current valid offers
    const activeOffers = await ctx.db
        .query("waitingList")
        .withIndex("by_event_status", (q: any) =>
            q.eq("eventId", eventId).eq("status", WAITING_LIST_STATUS.OFFERED)
        )
        .collect()
        .then((entries: any[]) => 
            entries.filter((e) => (e.offerExpiresAt ?? 0) > now).length
        )

    return { purchasedCount, activeOffers }
}

// Input validation helper
function validateEventInput(args: any) {
    if (args.price < 0) {
        throw new Error("Price must be non-negative")
    }
    if (args.totalTickets <= 0) {
        throw new Error("Total tickets must be greater than 0")
    }
    if (args.eventDate <= Date.now()) {
        throw new Error("Event date must be in the future")
    }
    if (args.name.trim().length === 0) {
        throw new Error("Event name cannot be empty")
    }
    if (args.location.trim().length === 0) {
        throw new Error("Event location cannot be empty")
    }
}

//Create Event
export const create = mutation({
    args:{
        name: v.string(),
        description: v.string(),
        location: v.string(),
        eventDate: v.number(),// store as timestamp
        price: v.number(),
        totalTickets: v.number(),
        userId: v.string()
    },
    handler: async (ctx,args)=>{
        // Validate input
        validateEventInput(args)

        const eventId = await ctx.db.insert("events",{
            name: args.name.trim(),
            description: args.description.trim(),
            location: args.location.trim(),
            eventDate: args.eventDate,
            price: args.price,
            totalTickets: args.totalTickets,
            userId: args.userId
        })
        return eventId
    }
})


// Event update schema
const eventUpdateSchema = {
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    location: v.optional(v.string()),
    eventDate: v.optional(v.number()),
    price: v.optional(v.number()),
    totalTickets: v.optional(v.number()),
}

// Update event mutation
export const update = mutation({
    args: {
        eventId: v.id("events"),
        updates: v.object(eventUpdateSchema),
    },
    handler: async (ctx, { eventId, updates }) => {
        const event = await ctx.db.get(eventId);
        if (!event) {
            throw new Error("Event not found");
        }

        // Validate updates if provided
        if (updates.price !== undefined && updates.price < 0) {
            throw new Error("Price must be non-negative")
        }
        if (updates.totalTickets !== undefined && updates.totalTickets <= 0) {
            throw new Error("Total tickets must be greater than 0")
        }
        if (updates.eventDate !== undefined && updates.eventDate <= Date.now()) {
            throw new Error("Event date must be in the future")
        }
        if (updates.name !== undefined && updates.name.trim().length === 0) {
            throw new Error("Event name cannot be empty")
        }
        if (updates.location !== undefined && updates.location.trim().length === 0) {
            throw new Error("Event location cannot be empty")
        }

        // Check sold tickets constraint
        if (updates.totalTickets !== undefined) {
            const { purchasedCount } = await calculateEventAvailability(ctx, eventId);
            if (updates.totalTickets < purchasedCount) {
                throw new Error(`Cannot reduce total tickets below ${purchasedCount} (number of tickets already sold)`)
            }
        }

        // Trim string fields if they exist
        const sanitizedUpdates = { ...updates }
        if (sanitizedUpdates.name) sanitizedUpdates.name = sanitizedUpdates.name.trim()
        if (sanitizedUpdates.location) sanitizedUpdates.location = sanitizedUpdates.location.trim()
        if (sanitizedUpdates.description) sanitizedUpdates.description = sanitizedUpdates.description.trim()

        // Update the event with the provided fields
        await ctx.db.patch(eventId, sanitizedUpdates);
        return eventId
    },
});

export const get = query({
    args: {
        paginationOpts: v.optional(v.object({
            numItems: v.number(),
            cursor: v.optional(v.union(v.string(), v.null())),
        })),
    },
    handler: async (ctx, { paginationOpts }) => {
        let query = ctx.db
            .query("events")
            .filter((q) => q.eq(q.field("is_cancelled"), undefined))
            .order("desc")

        if (paginationOpts) {
            const { cursor, numItems } = paginationOpts
            return await query.paginate({
                numItems,
                cursor: cursor ?? null
            })
        }
        
        return await query.collect()
    },
})

// Get events by user ID
export const getByUserId = query({
    args: { 
        userId: v.string(),
        paginationOpts: v.optional(v.object({
            numItems: v.number(),
            cursor: v.optional(v.union(v.string(), v.null())),
        })),
    },
    handler: async (ctx, { userId, paginationOpts }) => {
        let query = ctx.db
            .query("events")
            .filter((q) => 
                q.and(
                    q.eq(q.field("userId"), userId),
                    q.eq(q.field("is_cancelled"), undefined)
                )
            )
            .order("desc")

        if (paginationOpts) {
            const { cursor, numItems } = paginationOpts
            return await query.paginate({
                numItems,
                cursor: cursor ?? null
            })
        }
        
        return await query.collect()
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

        const { purchasedCount, activeOffers } = await calculateEventAvailability(ctx, eventId)
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

        const { purchasedCount, activeOffers } = await calculateEventAvailability(ctx, eventId)
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

// Cancel/Delete event
export const cancelEvent = mutation({
    args: { eventId: v.id("events") },
    handler: async (ctx, { eventId }) => {
        const event = await ctx.db.get(eventId)
        if (!event) throw new Error("Event not found")

        // Check if there are any sold tickets
        const { purchasedCount } = await calculateEventAvailability(ctx, eventId)
        if (purchasedCount > 0) {
            throw new Error("Cannot cancel event with sold tickets. Please refund tickets first.")
        }

        // Mark event as cancelled instead of deleting
        await ctx.db.patch(eventId, { is_cancelled: true })
        
        // Cancel all waiting list entries for this event
        const waitingListEntries = await ctx.db
            .query("waitingList")
            .withIndex("by_event_status", (q) => q.eq("eventId", eventId))
            .collect()

        await Promise.all(
            waitingListEntries.map(entry => 
                ctx.db.patch(entry._id, { status: WAITING_LIST_STATUS.EXPIRED })
            )
        )

        return { success: true, message: "Event cancelled successfully" }
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

        // Check if there are any available tickets right now
        const { purchasedCount, activeOffers } = await calculateEventAvailability(ctx, eventId)
        const availableSpots = event.totalTickets - (purchasedCount + activeOffers)
        const available = availableSpots > 0
        const now = Date.now()

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
