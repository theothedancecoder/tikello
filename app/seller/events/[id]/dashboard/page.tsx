"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import Spinner from "@/components/Spinner";
import BuyerDashboard from "@/components/BuyerDashboard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function EventDashboardPage() {
  const params = useParams();
  const eventId = params.id as Id<"events">;
  const event = useQuery(api.events.getById, { eventId });

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <Link
          href="/seller"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Seller Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          Event Dashboard: {event.name}
        </h1>
        <p className="text-gray-600 mt-2">
          View and manage buyers for this event
        </p>
      </div>

      <BuyerDashboard eventId={eventId} />
    </div>
  );
}
