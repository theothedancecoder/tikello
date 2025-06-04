"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Ticket from "@/components/Ticket";
import { useEffect } from "react";
import { useCart } from "@/components/cart/CartContext";
import { Loader2 } from "lucide-react";

export default function TicketSuccess() {
  const { user } = useUser();
  const { clearCart } = useCart();
  
  const tickets = useQuery(
    api.events.getUserTickets, 
    user ? { userId: user.id } : "skip"
  );

  useEffect(() => {
    // Clear the cart after successful purchase
    clearCart();
  }, [clearCart]);

  if (!user) {
    redirect("/");
    return null;
  }

  if (tickets === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  if (!tickets || tickets.length === 0) {
    redirect("/");
    return null;
  }

  // Get the most recently purchased tickets (from this transaction)
  const sortedTickets = tickets.sort((a, b) => b.purchasedAt - a.purchasedAt);
  const latestPurchaseTime = sortedTickets[0].purchasedAt;
  const latestTickets = sortedTickets.filter(
    ticket => ticket.purchasedAt === latestPurchaseTime
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Purchase Successful!
          </h1>
          <p className="mt-2 text-gray-600">
            {latestTickets.length === 1 
              ? "Your ticket has been confirmed and is ready to use"
              : `Your ${latestTickets.length} tickets have been confirmed and are ready to use`
            }
          </p>
        </div>

        <div className="space-y-6">
          {latestTickets.map((ticket) => (
            <Ticket key={ticket._id} ticketId={ticket._id} />
          ))}
        </div>
      </div>
    </div>
  );
}
