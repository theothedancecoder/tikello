"use client";

import { useState } from "react";
import { Ban } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { refundEventTickets } from "@/actions/refundEventTickets";

export default function CancelEventButton({
  eventId,
}: {
  eventId: Id<"events">;
}) {
  const [isCancelling, setIsCancelling] = useState(false);
  const router = useRouter();
  const cancelEvent = useMutation(api.events.cancelEvent);

  const handleCancel = async () => {
    const confirmed = confirm(
      "Are you sure you want to cancel this event? All tickets will be refunded and the event will be cancelled permanently."
    );

    if (!confirmed) return;

    setIsCancelling(true);

    try {
      const refundResult = await refundEventTickets(eventId);

       if (!refundResult.success) {
         const errorMessages = refundResult.failedTickets?. // add optional chaining here
           map((t: { ticketId: string; error?: string }) => `Ticket ${t.ticketId}: ${t.error ?? "Unknown error"}`)
           .join("\n");
         toast.error("Refund failed for some tickets", {
          description: errorMessages,
        });
        setIsCancelling(false);
        return;
      }

      await cancelEvent({ eventId });

      toast.success("Event cancelled", {
        description: "All tickets have been refunded successfully.",
      });

      router.push("/seller/events");
    } catch (error: any) {
      console.error("Failed to cancel event:", error);
      toast.error("Failed to cancel event", {
        description: error?.message || "Please try again.",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <button
      onClick={handleCancel}
      disabled={isCancelling}
      className={`flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors ${
        isCancelling ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <Ban className="w-4 h-4" />
      <span>{isCancelling ? "Processing..." : "Cancel Event"}</span>
    </button>
  );
}
