"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import AddToCartButton from "./cart/AddToCartButton";
import { formatPriceWithConversion } from "@/lib/currency";

interface TicketTypeDisplayProps {
  eventId: Id<"events">;
  onSelectTicketType?: (ticketTypeId: Id<"ticketTypes">) => void;
}

export default function TicketTypeDisplay({ 
  eventId, 
  onSelectTicketType 
}: TicketTypeDisplayProps) {
  const ticketTypes = useQuery(api.ticketTypes.get, { eventId }) || [];
  const event = useQuery(api.events.getById, { eventId });

  if (ticketTypes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Available Ticket Types</h3>
      <div className="grid gap-4">
        {ticketTypes.map((ticketType) => {
          const availability = useQuery(api.ticketTypes.getAvailability, {
            ticketTypeId: ticketType._id,
          });

          const isSoldOut = availability?.salesStatus === "sold_out";
          const isNotOnSale = availability?.salesStatus === "not_on_sale";
          const isAvailable = availability?.salesStatus === "available";

          return (
            <div
              key={ticketType._id}
              className={`p-4 border rounded-lg ${
                isSoldOut || isNotOnSale
                  ? "border-gray-200 bg-gray-50"
                  : "border-gray-300 bg-white hover:border-blue-300"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4
                    className={`font-medium ${
                      isSoldOut ? "line-through text-gray-500" : ""
                    }`}
                  >
                    {ticketType.name}
                  </h4>
                  {ticketType.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {ticketType.description}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-4">
                    <span
                      className={`font-semibold ${
                        isSoldOut ? "text-gray-500" : "text-green-600"
                      }`}
                    >
                      {formatPriceWithConversion(ticketType.price, event?.currency)}
                    </span>
                    <span className="text-sm text-gray-600">
                      {availability?.remaining || 0} of {ticketType.totalQuantity} available
                    </span>
                  </div>
                  {ticketType.startDate && (
                    <p className="text-xs text-gray-500 mt-1">
                      Sales start: {new Date(ticketType.startDate).toLocaleDateString()}
                    </p>
                  )}
                  {ticketType.endDate && (
                    <p className="text-xs text-gray-500">
                      Sales end: {new Date(ticketType.endDate).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="ml-4">
                  <AddToCartButton
                    ticketTypeId={ticketType._id}
                    eventId={eventId}
                    ticketTypeName={ticketType.name}
                    price={ticketType.price}
                    maxQuantity={availability?.remaining || 0}
                    disabled={isSoldOut || isNotOnSale}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
