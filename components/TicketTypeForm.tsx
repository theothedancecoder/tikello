"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { CalendarDays, Plus, Trash2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";

type TicketType = {
  name: string;
  description: string;
  price: number;
  totalQuantity: number;
  type: "leader" | "follower" | "refreshment" | "afterparty" | "other";
  startDate?: number;
  endDate?: number;
  sortOrder: number;
};

const TICKET_TYPES = [
  { value: "leader", label: "Leader Pass" },
  { value: "follower", label: "Follower Pass" },
  { value: "refreshment", label: "Refreshment Pass" },
  { value: "afterparty", label: "After Party Ticket" },
  { value: "other", label: "Other" },
] as const;

interface TicketTypeFormProps {
  eventId: Id<"events">;
  ticketTypeId?: Id<"ticketTypes"> | null;
  onComplete?: () => void;
}

export default function TicketTypeForm({ eventId, ticketTypeId, onComplete }: TicketTypeFormProps) {
  const createTicketType = useMutation(api.ticketTypes.create);
  const updateTicketType = useMutation(api.ticketTypes.update);
  const existingTicketTypes = useQuery(api.ticketTypes.get, { eventId }) || [];

  const existingTicketType = ticketTypeId ? useQuery(api.ticketTypes.getById, { ticketTypeId }) : null;

  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);

  // Initialize form with existing data or empty state
  useEffect(() => {
    if (existingTicketType) {
      setTicketTypes([{
        name: existingTicketType.name,
        description: existingTicketType.description || "",
        price: existingTicketType.price,
        totalQuantity: existingTicketType.totalQuantity,
        type: existingTicketType.type as TicketType["type"],
        startDate: existingTicketType.startDate,
        endDate: existingTicketType.endDate,
        sortOrder: existingTicketType.sortOrder || 0,
      }]);
    } else {
      setTicketTypes([{
        name: "",
        description: "",
        price: 0,
        totalQuantity: 0,
        type: "other",
        sortOrder: existingTicketTypes.length,
      }]);
    }
  }, [existingTicketType, existingTicketTypes.length]);

  const addTicketType = () => {
    setTicketTypes([
      ...ticketTypes,
      {
        name: "",
        description: "",
        price: 0,
        totalQuantity: 0,
        type: "other",
        sortOrder: ticketTypes.length,
      },
    ]);
  };

  const removeTicketType = (index: number) => {
    setTicketTypes(ticketTypes.filter((_, i) => i !== index));
  };

  const updateField = (
    index: number,
    field: keyof TicketType,
    value: string | number
  ) => {
    const newTicketTypes = [...ticketTypes];
    if (field === "price" || field === "totalQuantity") {
      newTicketTypes[index][field] = Number(value);
    } else if (
      field === "startDate" ||
      field === "endDate"
    ) {
      newTicketTypes[index][field] = value ? new Date(value).getTime() : undefined;
    } else {
      // @ts-ignore - We know these fields are strings
      newTicketTypes[index][field] = value;
    }
    setTicketTypes(newTicketTypes);
  };

  const handleSubmit = async () => {
    // Validate ticket types
    const validTicketTypes = ticketTypes.filter(
      (tt) => tt.name && tt.price > 0 && tt.totalQuantity > 0
    );

    if (ticketTypeId && validTicketTypes.length > 0) {
      // Update existing ticket type
      const ticketType = validTicketTypes[0];
      await updateTicketType({
        ticketTypeId,
        updates: {
          name: ticketType.name,
          description: ticketType.description,
          price: ticketType.price,
          totalQuantity: ticketType.totalQuantity,
          type: ticketType.type,
          startDate: ticketType.startDate,
          endDate: ticketType.endDate,
          sortOrder: ticketType.sortOrder,
        },
      });
    } else {
      // Create new ticket types
      for (const ticketType of validTicketTypes) {
        await createTicketType({
          eventId,
          ...ticketType,
        });
      }
    }

    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          {ticketTypeId ? "Edit Ticket Type" : "Ticket Types"}
        </h3>
        {!ticketTypeId && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addTicketType}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Ticket Type
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {ticketTypes.map((ticketType, index) => (
          <div
            key={index}
            className="p-4 border border-gray-200 rounded-lg space-y-4"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-4 flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`name-${index}`}>Name</Label>
                    <Input
                      id={`name-${index}`}
                      value={ticketType.name}
                      onChange={(e) =>
                        updateField(index, "name", e.target.value)
                      }
                      placeholder="e.g., VIP Pass"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`type-${index}`}>Type</Label>
                    <select
                      id={`type-${index}`}
                      value={ticketType.type}
                      onChange={(e) =>
                        updateField(
                          index,
                          "type",
                          e.target.value as TicketType["type"]
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      {TICKET_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`description-${index}`}>Description</Label>
                  <Input
                    id={`description-${index}`}
                    value={ticketType.description}
                    onChange={(e) =>
                      updateField(index, "description", e.target.value)
                    }
                    placeholder="Describe what's included with this ticket"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`price-${index}`}>Price (NOK)</Label>
                    <Input
                      id={`price-${index}`}
                      type="number"
                      value={ticketType.price}
                      onChange={(e) =>
                        updateField(index, "price", e.target.value)
                      }
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                    <Input
                      id={`quantity-${index}`}
                      type="number"
                      value={ticketType.totalQuantity}
                      onChange={(e) =>
                        updateField(index, "totalQuantity", e.target.value)
                      }
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`startDate-${index}`}>
                      Sale Start Date (Optional)
                    </Label>
                    <div className="relative">
                      <CalendarDays className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        id={`startDate-${index}`}
                        type="datetime-local"
                        className="pl-10"
                        onChange={(e) =>
                          updateField(index, "startDate", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`endDate-${index}`}>
                      Sale End Date (Optional)
                    </Label>
                    <div className="relative">
                      <CalendarDays className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        id={`endDate-${index}`}
                        type="datetime-local"
                        className="pl-10"
                        onChange={(e) =>
                          updateField(index, "endDate", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              {!ticketTypeId && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTicketType(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {ticketTypes.length > 0 && (
        <Button type="button" onClick={handleSubmit}>
          {ticketTypeId ? "Update Ticket Type" : "Save Ticket Types"}
        </Button>
      )}
    </div>
  );
}
