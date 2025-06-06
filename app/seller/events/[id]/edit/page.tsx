"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import Spinner from "@/components/Spinner";
import EditEventForm from "@/components/EditEventForm";
import AIChat from "@/components/AIChat";
import { useState } from "react";
import { duplicateEvent } from "@/actions/duplicateEvent";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import CancelEventButton from "@/components/CancelEventButton";

function DuplicateEventForm({ eventId }: { eventId: Id<"events"> }) {
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [isDuplicating, setIsDuplicating] = useState(false);
  const router = useRouter();

  const handleDuplicate = async () => {
    if (!newStartDate || !newEndDate) {
      toast.error("Please enter both start and end dates");
      return;
    }
    setIsDuplicating(true);
    try {
      const result = await duplicateEvent({ eventId, newStartDate, newEndDate });
      if (result.success) {
        toast.success("Event duplicated successfully");
        router.push(`/seller/events/${result.newEventId}/edit`);
      } else {
        toast.error("Failed to duplicate event");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to duplicate event");
    } finally {
      setIsDuplicating(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 max-w-md">
      <label>
        New Start Date:
        <input
          type="date"
          value={newStartDate}
          onChange={(e) => setNewStartDate(e.target.value)}
          className="border p-1 rounded w-full"
          disabled={isDuplicating}
        />
      </label>
      <label>
        New End Date:
        <input
          type="date"
          value={newEndDate}
          onChange={(e) => setNewEndDate(e.target.value)}
          className="border p-1 rounded w-full"
          disabled={isDuplicating}
        />
      </label>
      <button
        onClick={handleDuplicate}
        disabled={isDuplicating}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isDuplicating ? "Duplicating..." : "Duplicate Event"}
      </button>
    </div>
  );
}

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
        <CancelEventButton eventId={event._id} />

        <div className="mt-8 p-4 border rounded-lg bg-gray-50">
          <h2 className="text-lg font-semibold mb-2">Duplicate Event</h2>
          <DuplicateEventForm eventId={event._id} />
        </div>
        <AIChat mode="seller" />
      </div>
    </div>
  );
}
