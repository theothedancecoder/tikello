// Currency formatting utilities for international users

export interface CurrencyConfig {
  code: string;
  symbol: string;
  locale: string;
}

// Default currency configurations by country/region
export const CURRENCY_CONFIGS: Record<string, CurrencyConfig> = {
  NO: { code: 'NOK', symbol: 'kr', locale: 'nb-NO' },
  US: { code: 'USD', symbol: '$', locale: 'en-US' },
  GB: { code: 'GBP', symbol: '£', locale: 'en-GB' },
  EU: { code: 'EUR', symbol: '€', locale: 'en-EU' },
  DK: { code: 'DKK', symbol: 'kr', locale: 'da-DK' },
  SE: { code: 'SEK', symbol: 'kr', locale: 'sv-SE' },
  // Add more as needed
};

// Get user's currency based on their location/preferences
export function getUserCurrency(): CurrencyConfig {
  // Check for saved preference first
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('preferred-currency');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Failed to parse saved currency preference');
      }
    }
    
    // Try to detect user's location from browser
    const userLocale = navigator.language || 'en-US';
    const countryCode = userLocale.split('-')[1]?.toUpperCase();
    
    // Return specific currency config if we have it
    if (countryCode && CURRENCY_CONFIGS[countryCode]) {
      return CURRENCY_CONFIGS[countryCode];
    }
    
    // Fallback based on language
    if (userLocale.startsWith('en-GB')) return CURRENCY_CONFIGS.GB;
    if (userLocale.startsWith('en-US')) return CURRENCY_CONFIGS.US;
    if (userLocale.startsWith('da')) return CURRENCY_CONFIGS.DK;
    if (userLocale.startsWith('sv')) return CURRENCY_CONFIGS.SE;
  }
  
  // Default to Norwegian Kroner (original currency)
  return CURRENCY_CONFIGS.NO;
}

// Format price with proper currency and locale
export function formatPrice(amount: number, currencyConfig?: CurrencyConfig): string {
  const config = currencyConfig || getUserCurrency();
  
  try {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback if Intl.NumberFormat fails
    return `${amount.toFixed(2)} ${config.symbol}`;
  }
}

// Convert NOK to other currencies (simplified - in production use real exchange rates)
export const EXCHANGE_RATES: Record<string, number> = {
  NOK: 1.0,
  USD: 0.092, // 1 NOK = ~0.092 USD
  GBP: 0.074, // 1 NOK = ~0.074 GBP
  EUR: 0.085, // 1 NOK = ~0.085 EUR
  DKK: 0.63,  // 1 NOK = ~0.63 DKK
  SEK: 0.97,  // 1 NOK = ~0.97 SEK
};

// Convert price from NOK to user's currency
export function convertPrice(nokAmount: number, targetCurrency: string): number {
  const rate = EXCHANGE_RATES[targetCurrency] || 1.0;
  return nokAmount * rate;
}

// Format price with currency conversion - now supports event currency
export function formatPriceWithConversion(amount: number, eventCurrency?: string, targetCurrency?: CurrencyConfig): string {
  const sourceCurrency = eventCurrency || 'NOK';
  const config = targetCurrency || getUserCurrency();
  
  // If source and target currencies are the same, just format
  if (config.code === sourceCurrency) {
    return formatPrice(amount, config);
  }
  
  // Convert from source currency to NOK first (if needed), then to target currency
  let nokAmount = amount;
  if (sourceCurrency !== 'NOK') {
    // Convert from source currency to NOK (reverse conversion)
    const sourceRate = EXCHANGE_RATES[sourceCurrency] || 1.0;
    nokAmount = amount / sourceRate;
  }
  
  // Then convert from NOK to target currency
  const convertedAmount = convertPrice(nokAmount, config.code);
  return formatPrice(convertedAmount, config);
}

// Format price using event's original currency (no conversion)
export function formatPriceInEventCurrency(amount: number, eventCurrency?: string): string {
  const currency = eventCurrency || 'NOK';
  const config = Object.values(CURRENCY_CONFIGS).find(c => c.code === currency) || CURRENCY_CONFIGS.NO;
  return formatPrice(amount, config);
}

// Get currency display info for UI
export function getCurrencyInfo(): { 
  currency: CurrencyConfig; 
  isConverted: boolean; 
  originalCurrency: string;
} {
  const currency = getUserCurrency();
  return {
    currency,
    isConverted: currency.code !== 'NOK',
    originalCurrency: 'NOK'
  };
}
