"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Ticket from "@/components/Ticket";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/CartContext";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function TicketSuccess() {
  const { user } = useUser();
  const { clearCart } = useCart();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [isLoading, setIsLoading] = useState(true);
  
  const tickets = useQuery(
    api.events.getUserTickets, 
    user ? { userId: user.id } : "skip"
  );

  useEffect(() => {
    if (!sessionId) {
      redirect("/");
      return;
    }

    // Clear the cart after successful purchase
    clearCart();

    // Give the webhook some time to process and create tickets
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [clearCart, sessionId]);

  if (!user) {
    redirect("/");
    return null;
  }

  if (tickets === undefined || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Processing Your Purchase
            </h1>
            <p className="mt-2 text-gray-600">
              Please wait while we confirm your tickets...
            </p>
          </div>
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  if (!tickets || tickets.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Purchase Processing
            </h1>
            <p className="mt-2 text-gray-600">
              Your purchase was successful, but we're still processing your tickets.
              Please check "My Tickets" in a few moments.
            </p>
          </div>
          <div className="flex justify-center mt-8">
            <a
              href="/tickets"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to My Tickets
            </a>
          </div>
        </div>
      </div>
    );
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
