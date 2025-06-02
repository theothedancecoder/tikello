"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import Spinner from "@/components/Spinner";
import EditEventForm from "@/components/EditEventForm";

export default function EditEventPage() {
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
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Edit Event: {event.name}</h1>
        <EditEventForm event={event} />
      </div>
    </div>
  );
}
