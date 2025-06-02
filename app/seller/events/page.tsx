"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import Spinner from "@/components/Spinner";
import EventCard from "@/components/EventCard";
import { CalendarDays, Plus } from "lucide-react";
import Link from "next/link";

export default function SellerEventsPage() {
  const { user } = useUser();
  const events = useQuery(api.events.get);

  if (!events) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // Filter events created by the current user
  const userEvents = events.filter((event) => event.userId === user?.id);

  const upcomingEvents = userEvents
    .filter((event) => event.eventDate > Date.now())
    .sort((a, b) => a.eventDate - b.eventDate);

  const pastEvents = userEvents
    .filter((event) => event.eventDate <= Date.now())
    .sort((a, b) => b.eventDate - a.eventDate);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
          <p className="mt-2 text-gray-600">Manage your events and tickets</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-600">
              <CalendarDays className="w-5 h-5" />
              <span className="font-medium">
                {userEvents.length} Total Events
              </span>
            </div>
          </div>
          <Link
            href="/seller/new-event"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Event
          </Link>
        </div>
      </div>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Upcoming Events ({upcomingEvents.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {upcomingEvents.map((event) => (
              <EventCard key={event._id} eventId={event._id} />
            ))}
          </div>
        </>
      )}

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Past Events ({pastEvents.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastEvents.map((event) => (
              <EventCard key={event._id} eventId={event._id} />
            ))}
          </div>
        </>
      )}

      {/* Empty State */}
      {userEvents.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <CalendarDays className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No events yet</h3>
          <p className="text-gray-600 mt-1 mb-6">
            Create your first event to start selling tickets
          </p>
          <Link
            href="/seller/new-event"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Your First Event
          </Link>
        </div>
      )}
    </div>
  );
}
