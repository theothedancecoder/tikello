"use client";

import { useParams } from "next/navigation";
import TicketScanner from "@/components/TicketScanner";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Search } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

export default function EventScanPage() {
  const params = useParams();
  const rawEventId = Array.isArray(params.id) ? params.id[0] : params.id;
  const eventId = rawEventId as Id<"events">;
  const event = useQuery(api.events.getById, { eventId });

  if (!event) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <p className="text-red-600">Loading event details...</p>
          </div>
        </div>
      </div>
    );
  }

  // You can add access control logic here to restrict access to authorized users

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8 text-white">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Search className="w-6 h-6" />
            Scan Tickets
          </h2>
          {event && (
            <p className="text-blue-100 mt-2">
              {event.name} - {event.eventDate ? new Date(event.eventDate).toLocaleDateString() : ''}
            </p>
          )}
        </div>

        {/* Main Content */}
        <div className="p-6">
          <TicketScanner eventId={eventId} />
        </div>
      </div>
    </div>
  );
}
