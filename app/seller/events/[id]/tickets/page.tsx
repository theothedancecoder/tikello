"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import TicketTypeForm from "@/components/TicketTypeForm";
import TicketTypeList from "@/components/TicketTypeList";

export default function TicketTypesPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as Id<"events">;
  
  const event = useQuery(api.events.getById, { eventId });
  const ticketTypes = useQuery(api.ticketTypes.get, { eventId });

  if (!event) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Event
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900">
            Manage Ticket Types
          </h1>
          <p className="text-gray-600 mt-2">
            Configure different ticket types for "{event.name}"
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {ticketTypes && ticketTypes.length > 0 ? (
            <TicketTypeList eventId={eventId} />
          ) : (
            <TicketTypeForm eventId={eventId} />
          )}
        </div>
      </div>
    </div>
  );
}
