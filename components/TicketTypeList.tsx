"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery, useMutation } from "convex/react";
import { Button } from "./ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import TicketTypeForm from "./TicketTypeForm";
import { formatPriceWithConversion } from "@/lib/currency";
import { toast } from "sonner";

export default function TicketTypeList({ eventId }: { eventId: Id<"events"> }) {
  const ticketTypes = useQuery(api.ticketTypes.get, { eventId }) || [];
  const event = useQuery(api.events.getById, { eventId });
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingTicketType, setEditingTicketType] = useState<Id<"ticketTypes"> | null>(null);
  const deleteTicketType = useMutation(api.ticketTypes.deleteTicketType);
  
  const handleDelete = async (ticketTypeId: Id<"ticketTypes">) => {
    try {
      await deleteTicketType({ ticketTypeId });
      toast.success("Ticket type deleted successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete ticket type");
    }
  };

  const handleEdit = (ticketTypeId: Id<"ticketTypes">) => {
    setEditingTicketType(ticketTypeId);
    setIsAddingNew(true);
  };

  if (isAddingNew) {
    return (
      <div>
        <Button
          variant="ghost"
          onClick={() => {
            setIsAddingNew(false);
            setEditingTicketType(null);
          }}
          className="mb-4"
        >
          ← Back to List
        </Button>
        <TicketTypeForm 
          eventId={eventId} 
          ticketTypeId={editingTicketType}
          onComplete={() => {
            setIsAddingNew(false);
            setEditingTicketType(null);
          }} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Current Ticket Types</h3>
        <Button
          onClick={() => setIsAddingNew(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Ticket Type
        </Button>
      </div>

      <div className="space-y-4">
        {ticketTypes.map((ticketType) => (
          <div
            key={ticketType._id}
            className="p-4 border border-gray-200 rounded-lg flex justify-between items-center"
          >
            <div>
              <h4 className="font-medium">{ticketType.name}</h4>
              <p className="text-sm text-gray-600">{ticketType.description}</p>
              <div className="mt-2 flex items-center gap-4 text-sm">
                <span className="text-green-600 font-medium">
                  {formatPriceWithConversion(ticketType.price, event?.currency)}
                </span>
                <span className="text-gray-600">
                  {ticketType.totalQuantity - ticketType.soldQuantity} available
                </span>
                {ticketType.startDate && (
                  <span className="text-gray-600">
                    Starts: {new Date(ticketType.startDate).toLocaleDateString()}
                  </span>
                )}
                {ticketType.endDate && (
                  <span className="text-gray-600">
                    Ends: {new Date(ticketType.endDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-blue-600"
                onClick={() => handleEdit(ticketType._id)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-red-600"
                onClick={async () => {
                  if (window.confirm('Are you sure you want to delete this ticket type?')) {
                    try {
                      await handleDelete(ticketType._id);
                    } catch (error) {
                      console.error('Failed to delete ticket type:', error);
                    }
                  }
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
