"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import DiscountCodeForm from "./DiscountCodeForm";
import DiscountCodeList from "./DiscountCodeList";
import { Id } from "@/convex/_generated/dataModel";

interface DiscountCodeManagerProps {
  eventId: Id<"events">;
  sellerId: string;
}

export default function DiscountCodeManager({ eventId, sellerId }: DiscountCodeManagerProps) {
  const [showForm, setShowForm] = useState(false);

  const handleFormSuccess = () => {
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Discount Codes</h3>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Discount Code
        </Button>
      </div>

      {showForm && (
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h4 className="text-md font-medium mb-4">Create New Discount Code</h4>
          <DiscountCodeForm
            eventId={eventId}
            sellerId={sellerId}
            onSuccess={handleFormSuccess}
          />
        </div>
      )}

      <div className="bg-white border rounded-lg">
        <div className="p-4 border-b">
          <h4 className="text-md font-medium">Existing Discount Codes</h4>
        </div>
        <DiscountCodeList eventId={eventId} />
      </div>
    </div>
  );
}
