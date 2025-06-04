"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { FileSpreadsheet, FileText } from "lucide-react";
import { formatPriceWithConversion, getCurrencyInfo } from "@/lib/currency";
import { useUser } from "@clerk/nextjs";
import Spinner from "./Spinner";

// Function to download data as CSV
function downloadAsCSV(buyers: any[]) {
  const currencyInfo = getCurrencyInfo();
  const headers = ["Name", "Email", "Ticket Type", "Status", "Purchase Date", "Amount"];
  const rows = buyers.map(buyer => [
    buyer.buyer.name,
    buyer.buyer.email,
    buyer.ticketType,
    buyer.status,
    new Date(buyer.purchasedAt).toLocaleString(),
    buyer.amount ? formatPriceWithConversion(buyer.amount, buyer.event?.currency) : "-"
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "buyer-data.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Function to download data as PDF (simplified version without external dependencies)
function downloadAsPDF(buyers: any[]) {
  // For now, we'll create a simple HTML table and print it
  const htmlContent = `
    <html>
      <head>
        <title>Buyer Dashboard</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          h1 { color: #333; }
        </style>
      </head>
      <body>
        <h1>Buyer Dashboard</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Ticket Type</th>
              <th>Status</th>
              <th>Purchase Date</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${buyers.map(buyer => `
              <tr>
                <td>${buyer.buyer.name}</td>
                <td>${buyer.buyer.email}</td>
                <td>${buyer.ticketType}</td>
                <td>${buyer.status}</td>
                <td>${new Date(buyer.purchasedAt).toLocaleString()}</td>
                <td>${buyer.amount ? formatPriceWithConversion(buyer.amount, buyer.event?.currency) : "-"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </body>
    </html>
  `;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  }
}

export default function BuyerDashboard({ eventId }: { eventId: Id<"events"> }) {
  const { user, isLoaded, isSignedIn } = useUser();
  const [search, setSearch] = useState("");
  const [ticketType, setTicketType] = useState("");
  const [status, setStatus] = useState<"valid" | "used" | "refunded" | "cancelled" | "">("");
  
  // Only query event if authenticated
  const event = useQuery(api.events.getById, 
    isLoaded && isSignedIn ? { eventId } : "skip"
  );

  // Only query buyers if authenticated and event exists
  const buyers = useQuery(
    api.buyers.getBuyersByEvent,
    isLoaded && isSignedIn && event && event.userId === user?.id ? {
      eventId,
      search: search || undefined,
      ticketType: ticketType || undefined,
      status: status === "" ? undefined : status as "valid" | "used" | "refunded" | "cancelled",
    } : "skip"
  );

  // Show loading state while auth or event data is loading
  if (!isLoaded || (isSignedIn && !event)) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-center h-32">
          <Spinner />
        </div>
      </div>
    );
  }

  // Show sign in prompt if not authenticated
  if (!isSignedIn || !user) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex flex-col items-center justify-center h-32 gap-4">
          <p className="text-gray-600">Please sign in to view the dashboard</p>
        </div>
      </div>
    );
  }

  // Verify event ownership and existence
  if (!event) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex flex-col items-center justify-center h-32 gap-4">
          <p className="text-red-600">Event not found</p>
        </div>
      </div>
    );
  }

  if (event.userId !== user.id) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex flex-col items-center justify-center h-32 gap-4">
          <p className="text-red-600">You do not have permission to view this dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Buyers Dashboard</h2>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex gap-4 flex-1">
          <input
            type="text"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 flex-grow"
          />
          <select
            value={ticketType}
            onChange={(e) => setTicketType(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value="">All Ticket Types</option>
            <option value="leader">Leader</option>
            <option value="follower">Follower</option>
            <option value="refreshment">Refreshment</option>
            <option value="afterparty">Afterparty</option>
            <option value="other">Other</option>
            <option value="standard ticket">Standard Ticket</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "valid" | "used" | "refunded" | "cancelled" | "")}
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value="">All Statuses</option>
            <option value="valid">Valid</option>
            <option value="used">Used</option>
            <option value="refunded">Refunded</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => downloadAsCSV(buyers || [])}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 border border-green-200 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export Excel
          </button>
          <button
            onClick={() => downloadAsPDF(buyers || [])}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 border border-red-200 transition-colors"
          >
            <FileText className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Ticket Type</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Purchase Date</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Amount</th>
          </tr>
        </thead>
        <tbody>
          {buyers && buyers.length > 0 ? (
            buyers.map((buyer) => (
              <tr key={buyer.ticketId}>
                <td className="border border-gray-300 px-4 py-2">{buyer.buyer.name}</td>
                <td className="border border-gray-300 px-4 py-2">{buyer.buyer.email}</td>
                <td className="border border-gray-300 px-4 py-2">{buyer.ticketType}</td>
                <td className="border border-gray-300 px-4 py-2">{buyer.status}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {new Date(buyer.purchasedAt).toLocaleString()}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {buyer.amount ? formatPriceWithConversion(buyer.amount, event?.currency) : "-"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="text-center py-4">
                No buyers found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
