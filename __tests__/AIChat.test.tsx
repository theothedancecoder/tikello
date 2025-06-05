import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom';
import AIChat from "../components/AIChat";

describe("AIChat component", () => {
  beforeEach(() => {
    // Mock scrollIntoView to avoid errors in test environment
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  test("renders buyer mode with welcome message", () => {
    render(<AIChat mode="buyer" />);
    expect(screen.getByText("Tikello")).toBeInTheDocument();
    expect(screen.getByText("How can I help?")).toBeInTheDocument();
  });

  test("renders seller mode with waving emoji", () => {
    render(<AIChat mode="seller" />);
    expect(screen.getByText("Seller Assistant")).toBeInTheDocument();
    expect(screen.getByLabelText("waving smiling face")).toBeInTheDocument();
  });

  test("sends message and receives response", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: "Hello from AI" }),
      })
    ) as jest.Mock;

    render(<AIChat mode="buyer" />);
    const textarea = screen.getByPlaceholderText("Type your message...");
    fireEvent.change(textarea, { target: { value: "Hi" } });
    fireEvent.keyDown(textarea, { key: "Enter", code: "Enter" });

    await waitFor(() => {
      expect(screen.getByText("Hi")).toBeInTheDocument();
      expect(screen.getByText("Hello from AI")).toBeInTheDocument();
    });

    (global.fetch as jest.Mock).mockRestore();
  });
});
