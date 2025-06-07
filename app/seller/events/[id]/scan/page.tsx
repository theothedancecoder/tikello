"use client";

import { useParams } from "next/navigation";
import TicketScanner from "@/components/TicketScanner";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Search } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { ErrorBoundary } from "react-error-boundary";

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-bold text-red-600 mb-4">Something went wrong:</h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button
            onClick={resetErrorBoundary}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}

function ScanPageContent() {
  const params = useParams();
  
  // Validate and parse event ID
  if (!params.id) {
    throw new Error("Event ID is required");
  }
  
  const rawEventId = Array.isArray(params.id) ? params.id[0] : params.id;
  if (!rawEventId) {
    throw new Error("Invalid event ID format");
  }

  const eventId = rawEventId as Id<"events">;
  const event = useQuery(api.events.getById, { eventId });

  // Handle loading state
  if (event === undefined) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle not found state
  if (event === null) {
    throw new Error("Event not found. Please check the URL and try again.");
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8 text-white">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Search className="w-6 h-6" />
            Scan Tickets
          </h2>
          <p className="text-blue-100 mt-2">
            {event.name} - {event.eventDate ? new Date(event.eventDate).toLocaleDateString() : ''}
          </p>
        </div>

        {/* Main Content */}
        <div className="p-6">
          <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onReset={() => {
              // Reset the scanner state
              window.location.reload();
            }}
          >
            <TicketScanner eventId={eventId} />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}

export default function EventScanPage() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Reset the page state
        window.location.reload();
      }}
    >
      <ScanPageContent />
    </ErrorBoundary>
  );
}
