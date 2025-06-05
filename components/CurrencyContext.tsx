"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CurrencyConfig, CURRENCY_CONFIGS, getUserCurrency } from "@/lib/currency";

interface CurrencyContextType {
  currency: CurrencyConfig;
  setCurrency: (currency: CurrencyConfig) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyConfig>(CURRENCY_CONFIGS.NO);

  useEffect(() => {
    // Load saved currency preference or detect user currency
    const savedCurrency = typeof window !== "undefined" ? localStorage.getItem("preferred-currency") : null;
    if (savedCurrency) {
      try {
        setCurrency(JSON.parse(savedCurrency));
      } catch {
        setCurrency(getUserCurrency());
      }
    } else {
      setCurrency(getUserCurrency());
    }
  }, []);

  const updateCurrency = (newCurrency: CurrencyConfig) => {
    setCurrency(newCurrency);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("preferred-currency", JSON.stringify(newCurrency));
      } catch (error) {
        console.error("Failed to save currency preference", error);
      }
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency: updateCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
