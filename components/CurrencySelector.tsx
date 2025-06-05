"use client";

import { useState } from "react";
import { Globe } from "lucide-react";
import { CURRENCY_CONFIGS, type CurrencyConfig } from "@/lib/currency";
import { useCurrency } from "./CurrencyContext";

export default function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);

  const handleCurrencyChange = (newCurrency: CurrencyConfig) => {
    setCurrency(newCurrency);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        title="Change currency"
      >
        <Globe className="w-4 h-4" />
        <span>{currency.code}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-2">
            <div className="text-xs text-gray-500 px-2 py-1 border-b border-gray-100 mb-1">
              Select Currency
            </div>
            {Object.entries(CURRENCY_CONFIGS).map(([countryCode, currencyItem]) => (
              <button
                key={currencyItem.code}
                onClick={() => handleCurrencyChange(currencyItem)}
                className={`w-full text-left px-2 py-2 text-sm rounded hover:bg-gray-100 flex items-center justify-between ${
                  currency.code === currencyItem.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                <span>{currencyItem.code}</span>
                <span className="text-xs text-gray-500">{currencyItem.symbol}</span>
              </button>
            ))}
            <div className="text-xs text-gray-400 px-2 py-1 border-t border-gray-100 mt-1">
              <div>Prices converted from NOK</div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
