"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import Spinner from "@/components/Spinner";
import BuyerDashboard from "@/components/BuyerDashboard";
import DiscountCodeManager from "@/components/DiscountCodeManager";
import FinancialSummary from "@/components/FinancialSummary";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type TabType = "buyers" | "discounts" | "financial";

export default function EventDashboardPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const params = useParams();
  const eventId = params.id as Id<"events">;
  const event = useQuery(api.events.getById, isLoaded && isSignedIn ? { eventId } : "skip");
  const [activeTab, setActiveTab] = useState<TabType>("buyers");

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!isSignedIn || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please sign in to view the dashboard</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <Link
          href="/seller"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Seller Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          Event Dashboard: {event.name}
        </h1>
        <p className="text-gray-600 mt-2">
          View and manage your event details
        </p>
      </div>

      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4">
          <Button
            variant={activeTab === "buyers" ? "default" : "ghost"}
            onClick={() => setActiveTab("buyers")}
            className="relative px-4 py-2 -mb-px"
          >
            Buyers
          </Button>
          <Button
            variant={activeTab === "discounts" ? "default" : "ghost"}
            onClick={() => setActiveTab("discounts")}
            className="relative px-4 py-2 -mb-px"
          >
            Discount Codes
          </Button>
          <Button
            variant={activeTab === "financial" ? "default" : "ghost"}
            onClick={() => setActiveTab("financial")}
            className="relative px-4 py-2 -mb-px"
          >
            Financial Summary
          </Button>
        </div>
      </div>

      {activeTab === "buyers" && <BuyerDashboard eventId={eventId} />}
      {activeTab === "discounts" && (
        <DiscountCodeManager eventId={eventId} sellerId={user.id} />
      )}
      {activeTab === "financial" && <FinancialSummary eventId={eventId} />}
    </div>
  );
}
