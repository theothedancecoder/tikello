"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery, useMutation } from "convex/react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { ChevronDown, ChevronRight, Eye } from "lucide-react";
import { formatPriceWithConversion } from "@/lib/currency";

interface DiscountCodeListProps {
  eventId: Id<"events">;
}

export default function DiscountCodeList({ eventId }: DiscountCodeListProps) {
  const discountCodes = useQuery(api.discountCodes.getByEvent, { eventId });
  const updateDiscountCode = useMutation(api.discountCodes.update);
  const [expandedCode, setExpandedCode] = useState<Id<"discountCodes"> | null>(null);
  
  const usageDetails = useQuery(
    api.discountCodes.getUsageDetails,
    expandedCode ? { discountCodeId: expandedCode } : "skip"
  );

  const handleToggleActive = async (discountCodeId: Id<"discountCodes">, currentActive: boolean) => {
    try {
      await updateDiscountCode({
        discountCodeId,
        updates: { active: !currentActive },
      });
      toast.success(`Discount code ${currentActive ? 'disabled' : 'enabled'}`);
    } catch (error) {
      toast.error('Failed to update discount code');
    }
  };

  const handleToggleExpand = (discountCodeId: Id<"discountCodes">) => {
    setExpandedCode(expandedCode === discountCodeId ? null : discountCodeId);
  };

  if (!discountCodes) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">Loading discount codes...</p>
      </div>
    );
  }

  if (discountCodes.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">No discount codes created yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Code
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Discount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Usage
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Valid Period
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {discountCodes.map((code) => {
            const isExpired = code.validTo && code.validTo < Date.now();
            const isNotStarted = code.validFrom && code.validFrom > Date.now();
            const isLimitReached = 
              code.usageLimit !== undefined && 
              code.usedCount >= code.usageLimit;

            const status = 
              !code.active ? "Disabled" :
              isExpired ? "Expired" :
              isNotStarted ? "Not Started" :
              isLimitReached ? "Limit Reached" :
              "Active";

            const statusColor = 
              !code.active ? "text-gray-500" :
              isExpired || isLimitReached ? "text-red-500" :
              isNotStarted ? "text-yellow-500" :
              "text-green-500";

            return (
              <>
                <tr key={code._id} className={expandedCode === code._id ? "bg-gray-50" : ""}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-6 w-6"
                        onClick={() => handleToggleExpand(code._id)}
                      >
                        {expandedCode === code._id ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      {code.code}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {code.percentage}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {code.usedCount}
                    {code.usageLimit ? ` / ${code.usageLimit}` : ""}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {code.validFrom && (
                      <div>
                        From: {formatDistanceToNow(code.validFrom, { addSuffix: true })}
                      </div>
                    )}
                    {code.validTo && (
                      <div>
                        To: {formatDistanceToNow(code.validTo, { addSuffix: true })}
                      </div>
                    )}
                    {!code.validFrom && !code.validTo && "No time limit"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`font-medium ${statusColor}`}>
                      {status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Button
                        variant={code.active ? "destructive" : "default"}
                        size="sm"
                        onClick={() => handleToggleActive(code._id, code.active)}
                      >
                        {code.active ? "Disable" : "Enable"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleExpand(code._id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
                {expandedCode === code._id && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                      <div className="space-y-4">
                        <h4 className="font-medium">Usage Details</h4>
                        {usageDetails && usageDetails.length > 0 ? (
                          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">User</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Purchase Date</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Original</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Discount</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Final</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {usageDetails.map((usage) => (
                                  <tr key={usage.ticketId}>
                                    <td className="px-4 py-2 text-sm">
                                      <div>{usage.userName}</div>
                                      <div className="text-xs text-gray-500">{usage.userEmail}</div>
                                    </td>
                                    <td className="px-4 py-2 text-sm">
                                      {new Date(usage.purchasedAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-2 text-sm">
                                      {formatPriceWithConversion(usage.originalAmount)}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-red-600">
                                      -{formatPriceWithConversion(usage.discountAmount)}
                                    </td>
                                    <td className="px-4 py-2 text-sm font-medium">
                                      {formatPriceWithConversion(usage.finalAmount)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No usage data available</p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
