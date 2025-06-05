import React from "react";
import { render, screen } from "@testing-library/react";
import { ClerkProvider } from "@clerk/clerk-react";

import { api } from "../convex/_generated/api";

// Mock the api import to avoid module not found error
jest.mock("../convex/_generated/api", () => ({
  api: {
    events: {
      getUserTickets: jest.fn(),
      getById: jest.fn(),
    },
    tickets: {
      getUserTickets: jest.fn(),
    },
    buyers: {
      getBuyersByEvent: jest.fn(),
    },
  },
}));

// Mock useQuery hook from convex/react
jest.mock("convex/react", () => ({
  useQuery: jest.fn((query, args) => {
    if (query === "skip") return null;
    
    // Return mock event data when querying for event
    if (query && query.toString().includes('getById')) {
      return {
        _id: "test-event-id",
        title: "Test Event",
        userId: "test-user-id",
        isLoading: false,
        error: null,
      };
    }
    // Return mock buyers data for getBuyersByEvent
    if (query && query.toString().includes('getBuyersByEvent')) {
      return [
        {
          ticketId: "test-ticket-1",
          buyer: { name: "Test Buyer", email: "test@example.com" },
          ticketType: "standard",
          status: "valid",
          purchasedAt: new Date().toISOString(),
          amount: 1000,
        }
      ];
    }
    // Return empty array for other queries
    return [];
  }),
}));

// Mock Clerk to avoid authentication issues in tests
jest.mock("@clerk/clerk-react", () => ({
  ClerkProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useUser: () => ({
    user: { id: "test-user-id" },
    isLoaded: true,
    isSignedIn: true,
  }),
}));

import BuyerDashboard from "../components/BuyerDashboard";

describe("BuyerDashboard component", () => {
  test("renders BuyerDashboard with expected elements", () => {
    // Mock Id type for eventId without import to avoid module error
    const mockEventId = { __tableName: "events", toString: () => "test-event-id" } as any;
    render(<BuyerDashboard eventId={mockEventId} />);
    expect(screen.getByText(/You do not have permission to view this dashboard/i)).toBeInTheDocument();
  });
});
