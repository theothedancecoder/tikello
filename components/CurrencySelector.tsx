"use client";

import { useState, useEffect } from "react";
import { Globe } from "lucide-react";
import { CURRENCY_CONFIGS, getUserCurrency, type CurrencyConfig } from "@/lib/currency";

export default function CurrencySelector() {
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyConfig>(getUserCurrency());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load saved currency preference from localStorage
    const saved = localStorage.getItem('preferred-currency');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSelectedCurrency(parsed);
      } catch (error) {
        console.error('Failed to parse saved currency preference');
      }
    }
  }, []);

  const handleCurrencyChange = (currency: CurrencyConfig) => {
    setSelectedCurrency(currency);
    localStorage.setItem('preferred-currency', JSON.stringify(currency));
    setIsOpen(false);
    // Trigger a page refresh to update all prices
    window.location.reload();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        title="Change currency"
      >
        <Globe className="w-4 h-4" />
        <span>{selectedCurrency.code}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-2">
            <div className="text-xs text-gray-500 px-2 py-1 border-b border-gray-100 mb-1">
              Select Currency
            </div>
            {Object.entries(CURRENCY_CONFIGS).map(([countryCode, currency]) => (
              <button
                key={currency.code}
                onClick={() => handleCurrencyChange(currency)}
                className={`w-full text-left px-2 py-2 text-sm rounded hover:bg-gray-100 flex items-center justify-between ${
                  selectedCurrency.code === currency.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                <span>{currency.code}</span>
                <span className="text-xs text-gray-500">{currency.symbol}</span>
              </button>
            ))}
            <div className="text-xs text-gray-400 px-2 py-1 border-t border-gray-100 mt-1">
              Prices converted from NOK
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
