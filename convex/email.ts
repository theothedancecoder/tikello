import { action } from "./_generated/server";
import { v } from "convex/values";
import { sendTicketConfirmationEmail } from "@/lib/email";

export const sendTicketConfirmation = action({
  args: {
    userEmail: v.string(),
    userName: v.string(),
    eventName: v.string(),
    eventDescription: v.string(),
    eventLocation: v.string(),
    eventDate: v.string(),
    ticketId: v.string(),
    amount: v.number(),
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    return await sendTicketConfirmationEmail({
      userEmail: args.userEmail,
      userName: args.userName,
      eventName: args.eventName,
      eventDescription: args.eventDescription,
      eventLocation: args.eventLocation,
      eventDate: args.eventDate,
      ticketId: args.ticketId,
      amount: args.amount,
      currency: args.currency,
    });
  },
});
