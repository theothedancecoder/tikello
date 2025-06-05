import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import CurrencySelector from "../components/CurrencySelector";

// Mock the CurrencyContext
const mockSetCurrency = jest.fn();
jest.mock("../components/CurrencyContext", () => ({
  useCurrency: () => ({
    currency: "USD",
    setCurrency: mockSetCurrency,
  }),
}));

describe("CurrencySelector component", () => {
  beforeEach(() => {
    mockSetCurrency.mockClear();
  });

  test("renders currency selector with default USD", () => {
    render(<CurrencySelector />);
    expect(screen.getByDisplayValue("USD")).toBeInTheDocument();
  });

  test("calls setCurrency when currency is changed", () => {
    render(<CurrencySelector />);
    const select = screen.getByDisplayValue("USD");
    
    fireEvent.change(select, { target: { value: "EUR" } });
    
    expect(mockSetCurrency).toHaveBeenCalledWith("EUR");
  });

  test("displays all currency options", () => {
    render(<CurrencySelector />);
    const select = screen.getByDisplayValue("USD");
    
    // Check if common currencies are available
    expect(select).toContainHTML('<option value="USD">USD</option>');
    expect(select).toContainHTML('<option value="EUR">EUR</option>');
    expect(select).toContainHTML('<option value="NOK">NOK</option>');
  });
});
