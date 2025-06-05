import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import BuyerInfoForm from "../components/BuyerInfoForm";
import { useCart } from "../components/cart/CartContext";

// Mock the cart context
jest.mock("../components/cart/CartContext", () => ({
  useCart: jest.fn(),
}));

describe("BuyerInfoForm component", () => {
  const mockSetBuyerInfo = jest.fn();
  const mockOnComplete = jest.fn();

  beforeEach(() => {
    (useCart as jest.Mock).mockReturnValue({
      setBuyerInfo: mockSetBuyerInfo,
      buyerInfo: null,
    });
    jest.clearAllMocks();
  });

  test("renders form fields correctly", () => {
    render(<BuyerInfoForm onComplete={mockOnComplete} />);

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continue to payment/i })).toBeInTheDocument();
  });

  test("validates required fields", async () => {
    render(<BuyerInfoForm onComplete={mockOnComplete} />);

    // Try to submit without filling required fields
    fireEvent.click(screen.getByRole("button", { name: /continue to payment/i }));

    expect(await screen.findByText(/full name is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(mockOnComplete).not.toHaveBeenCalled();
  });

  test("validates email format", async () => {
    render(<BuyerInfoForm onComplete={mockOnComplete} />);

    // Fill in invalid email
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "invalid-email" },
    });

    // Try to submit
    fireEvent.click(screen.getByRole("button", { name: /continue to payment/i }));

    expect(await screen.findByText(/please enter a valid email address/i)).toBeInTheDocument();
    expect(mockOnComplete).not.toHaveBeenCalled();
  });

  test("submits form with valid data", async () => {
    render(<BuyerInfoForm onComplete={mockOnComplete} />);

    const validData = {
      fullName: "John Doe",
      email: "john@example.com",
      phone: "+1234567890",
    };

    // Fill in form
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: validData.fullName },
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: validData.email },
    });
    fireEvent.change(screen.getByLabelText(/phone number/i), {
      target: { value: validData.phone },
    });

    // Submit form
    fireEvent.click(screen.getByRole("button", { name: /continue to payment/i }));

    // Check if setBuyerInfo was called with correct data
    expect(mockSetBuyerInfo).toHaveBeenCalledWith(expect.objectContaining(validData));
    expect(mockOnComplete).toHaveBeenCalled();
  });

  test("pre-fills form with existing buyer info", () => {
    const existingBuyerInfo = {
      fullName: "Jane Doe",
      email: "jane@example.com",
      phone: "+9876543210",
    };

    (useCart as jest.Mock).mockReturnValue({
      setBuyerInfo: mockSetBuyerInfo,
      buyerInfo: existingBuyerInfo,
    });

    render(<BuyerInfoForm onComplete={mockOnComplete} />);

    expect(screen.getByLabelText(/full name/i)).toHaveValue(existingBuyerInfo.fullName);
    expect(screen.getByLabelText(/email address/i)).toHaveValue(existingBuyerInfo.email);
    expect(screen.getByLabelText(/phone number/i)).toHaveValue(existingBuyerInfo.phone);
  });

  test("validates phone number format", async () => {
    render(<BuyerInfoForm onComplete={mockOnComplete} />);

    // Fill in invalid phone number
    fireEvent.change(screen.getByLabelText(/phone number/i), {
      target: { value: "invalid-phone" },
    });

    // Try to submit
    fireEvent.click(screen.getByRole("button", { name: /continue to payment/i }));

    expect(await screen.findByText(/please enter a valid phone number/i)).toBeInTheDocument();
    expect(mockOnComplete).not.toHaveBeenCalled();
  });

  test("trims whitespace from input values", async () => {
    render(<BuyerInfoForm onComplete={mockOnComplete} />);

    const inputData = {
      fullName: "  John Doe  ",
      email: "  john@example.com  ",
      phone: "  +1234567890  ",
    };

    const expectedData = {
      fullName: "John Doe",
      email: "john@example.com",
      phone: "+1234567890",
    };

    // Fill in form with whitespace
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: inputData.fullName },
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: inputData.email },
    });
    fireEvent.change(screen.getByLabelText(/phone number/i), {
      target: { value: inputData.phone },
    });

    // Submit form
    
    fireEvent.click(screen.getByRole("button", { name: /continue to payment/i }));

    // Check if setBuyerInfo was called with trimmed data
    expect(mockSetBuyerInfo).toHaveBeenCalledWith(expect.objectContaining(expectedData));
  });
});
