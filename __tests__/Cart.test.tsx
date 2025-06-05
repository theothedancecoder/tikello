import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Cart from "../components/cart/Cart";

// Mock the currency context
jest.mock("../components/CurrencyContext", () => ({
  useCurrency: () => ({
    currency: "USD",
    setCurrency: jest.fn(),
  }),
}));

// Mock the convex hooks and API
jest.mock("convex/react", () => ({
  useQuery: jest.fn((query, args) => {
    if (query && query.toString().includes('getById')) {
      return {
        _id: "test-event-id",
        title: "Test Event",
        currency: "USD",
        isLoading: false,
        error: null,
      };
    }
    return null;
  }),
}));

const mockCartItems = [
  {
    ticketTypeId: "test-ticket-type-1" as any,
    eventId: "test-event-id" as any,
    quantity: 2,
    price: 1000,
    name: "VIP Ticket",
    maxQuantity: 10,
  },
  {
    ticketTypeId: "test-ticket-type-2" as any,
    eventId: "test-event-id" as any,
    quantity: 1,
    price: 500,
    name: "Standard Ticket",
    maxQuantity: 5,
  },
];

// Mock the cart context
const mockRemoveFromCart = jest.fn();
const mockUpdateQuantity = jest.fn();
const mockClearCart = jest.fn();

jest.mock("../components/cart/CartContext", () => ({
  useCart: () => ({
    items: mockCartItems,
    removeFromCart: mockRemoveFromCart,
    updateQuantity: mockUpdateQuantity,
    clearCart: mockClearCart,
    getTotalPrice: () => 2500, // (2 * 1000) + (1 * 500)
    getTotalItems: () => 3,
    getFinalPrice: () => 2500,
    discountCode: null,
    buyerInfo: null,
  }),
}));

describe("Cart component", () => {
  beforeEach(() => {
    mockRemoveFromCart.mockClear();
    mockUpdateQuantity.mockClear();
    mockClearCart.mockClear();
  });

  test("renders cart with items", () => {
    render(<Cart />);
    
    expect(screen.getByText("VIP Ticket")).toBeInTheDocument();
    expect(screen.getByText("Standard Ticket")).toBeInTheDocument();
  });

  test("displays correct total price", () => {
    render(<Cart />);
    
    // Should display the total price
    expect(screen.getByText(/2500/)).toBeInTheDocument();
  });

  test("calls removeFromCart when remove button is clicked", () => {
    render(<Cart />);
    
    const removeButtons = screen.getAllByRole("button", { name: /remove/i });
    fireEvent.click(removeButtons[0]);
    
    expect(mockRemoveFromCart).toHaveBeenCalledWith("test-ticket-type-1");
  });

  test("displays total items count", () => {
    render(<Cart />);
    
    // Should show total items (2 + 1 = 3)
    expect(screen.getByText(/3/)).toBeInTheDocument();
  });
});

// Test empty cart scenario
describe("Cart component - empty state", () => {
  beforeEach(() => {
    // Mock empty cart
    jest.clearAllMocks();
    jest.doMock("../components/cart/CartContext", () => ({
      useCart: () => ({
        items: [],
        removeFromCart: jest.fn(),
        updateQuantity: jest.fn(),
        clearCart: jest.fn(),
        getTotalPrice: () => 0,
        getTotalItems: () => 0,
        getFinalPrice: () => 0,
        discountCode: null,
        buyerInfo: null,
      }),
    }));
  });

  test("displays empty cart message when no items", () => {
    const { useCart } = require("../components/cart/CartContext");
    useCart.mockReturnValue({
      items: [],
      removeFromCart: jest.fn(),
      updateQuantity: jest.fn(),
      clearCart: jest.fn(),
      getTotalPrice: () => 0,
      getTotalItems: () => 0,
      getFinalPrice: () => 0,
      discountCode: null,
      buyerInfo: null,
    });

    render(<Cart />);
    
    expect(screen.getByText(/cart is empty/i)).toBeInTheDocument();
  });
});
