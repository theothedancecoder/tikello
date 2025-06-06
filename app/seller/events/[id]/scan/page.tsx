"use client";

import { useParams } from "next/navigation";
import TicketScanner from "@/components/TicketScanner";

export default function EventScanPage() {
  const params = useParams();
  const eventId = params.id;

  // You can add access control logic here to restrict access to authorized users

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Scan Tickets for Event {eventId}</h1>
      <TicketScanner eventId={eventId} />
    </div>
  );
}
