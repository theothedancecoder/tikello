import { NextRequest, NextResponse } from "next/server";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export async function POST(request: NextRequest) {
  try {
    const { ticketId, eventId } = await request.json();

    if (!ticketId || typeof ticketId !== "string" || ticketId.trim() === "") {
      return NextResponse.json({ success: false, message: "Ticket ID is required and must be a non-empty string" }, { status: 400 });
    }

    if (!eventId || typeof eventId !== "string" || eventId.trim() === "") {
      return NextResponse.json({ success: false, message: "Event ID is required" }, { status: 400 });
    }

    const convex = getConvexClient();

    try {
      // Fetch the ticket details
      const ticket = await convex.query(api.tickets.getTicketWithDetails, { ticketId: ticketId as Id<"tickets"> });

      if (!ticket) {
        return NextResponse.json({ success: false, message: "Ticket not found" }, { status: 404 });
      }

      // Verify the ticket belongs to this event
      if (ticket.eventId !== eventId) {
        return NextResponse.json({ 
          success: false, 
          message: "This ticket is for a different event",
          ticket: {
            event: ticket.event?.name,
            type: ticket.ticketTypeId ? "Premium" : "Standard"
          }
        }, { status: 400 });
      }

      if (ticket.status === "used") {
        const usedDate = new Date(ticket.purchasedAt).toLocaleString();
        return NextResponse.json({ 
          success: false, 
          message: "Ticket has already been used",
          ticket: {
            status: ticket.status,
            event: ticket.event?.name,
            type: ticket.ticketTypeId ? "Premium" : "Standard",
            usedAt: usedDate
          }
        }, { status: 400 });
      }

      if (ticket.status !== "valid") {
        return NextResponse.json({ 
          success: false, 
          message: `Ticket status is ${ticket.status}, not valid for entry`,
          ticket: {
            status: ticket.status,
            event: ticket.event?.name,
            type: ticket.ticketTypeId ? "Premium" : "Standard"
          }
        }, { status: 400 });
      }

      // Mark the ticket as used
      await convex.mutation(api.tickets.updateTicketStatus, { 
        ticketId: ticketId as Id<"tickets">, 
        status: "used" 
      });

      return NextResponse.json({ 
        success: true, 
        message: "Ticket validated successfully",
        ticket: {
          event: ticket.event?.name,
          type: ticket.ticketTypeId ? "Premium" : "Standard",
          purchasedAt: new Date(ticket.purchasedAt).toLocaleString(),
          amount: ticket.amount
        }
      });
    } catch (convexError: any) {
      console.error("Convex error:", convexError);
      
      // Check if it's a server error that's likely due to invalid ticket ID format
      // Convex wraps ArgumentValidationError in a generic "Server Error"
      const messageString = (convexError.message || '').toLowerCase();
      
      if (messageString.includes("server error") && messageString.includes("request id")) {
        // This is likely an ArgumentValidationError wrapped by Convex
        return NextResponse.json({ 
          success: false, 
          message: "Invalid ticket ID format. Please ensure you are using a valid ticket ID." 
        }, { status: 400 });
      }

      throw convexError; // Re-throw other errors to be caught by outer catch
    }
  } catch (error) {
    console.error("Error in /api/validate-ticket:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
