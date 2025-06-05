import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TicketTypeDisplay from "../components/TicketTypeDisplay";
import { useCart } from "../components/cart/CartContext";
import { api } from "../convex/_generated/api";

// Mock the cart context
jest.mock("../components/cart/CartContext", () => ({
  useCart: jest.fn(),
}));

// Mock the currency context
jest.mock("../components/CurrencyContext", () => ({
  useCurrency: () => ({
    currency: "USD",
    setCurrency: jest.fn(),
  }),
}));

// Mock Convex hooks and queries
jest.mock("convex/react", () => ({
  useQuery: jest.fn((query, args) => {
    if (query === api.ticketTypes.get) {
      return [
        {
          _id: "test-ticket-type-1",
          name: "VIP Ticket",
          description: "VIP access with special perks",
          price: 1000,
          totalQuantity: 100,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        },
      ];
    }
    if (query === api.events.getById) {
      return {
        _id: "test-event-1",
        title: "Test Event",
        currency: "USD",
      };
    }
    if (query === api.ticketTypes.getAvailability) {
      return {
        salesStatus: "available",
        remaining: 50,
      };
    }
    return null;
  }),
}));

describe("TicketTypeDisplay component", () => {
  const mockEventId = "test-event-1" as any;
  const mockUseQuery = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders ticket type information correctly", () => {
    render(<TicketTypeDisplay eventId={mockEventId} />);

    expect(screen.getByText("VIP Ticket")).toBeInTheDocument();
    expect(screen.getByText("VIP access with special perks")).toBeInTheDocument();
    expect(screen.getByText(/\$10\.00/)).toBeInTheDocument();
    expect(screen.getByText(/50 of 100 available/)).toBeInTheDocument();
  });

  test("renders multiple ticket types", () => {
    // Update mock to return multiple ticket types
    const useQuery = require("convex/react").useQuery;
    useQuery.mockImplementation((query: any, args: { eventId?: string; ticketTypeId?: string }) => {
      if (query === api.ticketTypes.get) {
        return [
          {
            _id: "test-ticket-type-1",
            name: "VIP Ticket",
            description: "VIP access with special perks",
            price: 1000,
            totalQuantity: 100,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 86400000).toISOString(),
          },
          {
            _id: "test-ticket-type-2",
            name: "Standard Ticket",
            description: "Regular admission",
            price: 500,
            totalQuantity: 200,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 86400000).toISOString(),
          },
        ];
      }
      if (query === api.events.getById) {
        return {
          _id: "test-event-1",
          title: "Test Event",
          currency: "USD",
        };
      }
      if (query === api.ticketTypes.getAvailability) {
        return {
          salesStatus: "available",
          remaining: 50,
        };
      }
      return null;
    });

    render(<TicketTypeDisplay eventId={mockEventId} />);

    expect(screen.getByText("VIP Ticket")).toBeInTheDocument();
    expect(screen.getByText("Standard Ticket")).toBeInTheDocument();
  });

  test("handles sold out ticket types", () => {
    // Mock sold out ticket type
    const useQuery = require("convex/react").useQuery;
    useQuery.mockImplementation((query: any, args: { eventId?: string; ticketTypeId?: string }) => {
      if (query === api.ticketTypes.getAvailability) {
        return {
          salesStatus: "sold_out",
          remaining: 0,
        };
      }
      // Return default mocks for other queries
      if (query === api.ticketTypes.get) {
        return [
          {
            _id: "test-ticket-type-1",
            name: "VIP Ticket",
            price: 1000,
            totalQuantity: 100,
          },
        ];
      }
      return null;
    });

    render(<TicketTypeDisplay eventId={mockEventId} />);

    const addButton = screen.getByRole("button");
    expect(addButton).toBeDisabled();
  });

  test("handles not on sale ticket types", () => {
    // Mock not on sale ticket type
    const useQuery = require("convex/react").useQuery;
    useQuery.mockImplementation((query: any, args: { eventId?: string; ticketTypeId?: string }) => {
      if (query === api.ticketTypes.getAvailability) {
        return {
          salesStatus: "not_on_sale",
          remaining: 100,
        };
      }
      // Return default mocks for other queries
      if (query === api.ticketTypes.get) {
        return [
          {
            _id: "test-ticket-type-1",
            name: "VIP Ticket",
            price: 1000,
            totalQuantity: 100,
          },
        ];
      }
      return null;
    });

    render(<TicketTypeDisplay eventId={mockEventId} />);

    const addButton = screen.getByRole("button");
    expect(addButton).toBeDisabled();
  });

  test("calls onSelectTicketType when provided", () => {
    const mockOnSelectTicketType = jest.fn();
    render(
      <TicketTypeDisplay 
        eventId={mockEventId} 
        onSelectTicketType={mockOnSelectTicketType} 
      />
    );

    const ticketTypeElement = screen.getByText("VIP Ticket").closest("div");
    fireEvent.click(ticketTypeElement!);

    expect(mockOnSelectTicketType).toHaveBeenCalledWith("test-ticket-type-1");
  });
});
