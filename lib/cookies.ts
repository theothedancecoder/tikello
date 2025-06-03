// Cookie management utilities

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export interface CookieConsent {
  preferences: CookiePreferences;
  timestamp: number;
}

// Get current cookie preferences
export function getCookiePreferences(): CookiePreferences | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const consent = localStorage.getItem('cookie-consent');
    if (consent) {
      const parsed: CookieConsent = JSON.parse(consent);
      return parsed.preferences;
    }
  } catch (error) {
    console.error('Failed to parse cookie preferences:', error);
  }
  
  return null;
}

// Check if a specific cookie type is allowed
export function isCookieAllowed(type: keyof CookiePreferences): boolean {
  const preferences = getCookiePreferences();
  if (!preferences) return false; // No consent given yet
  
  return preferences[type];
}

// Check if user has given any cookie consent
export function hasGivenCookieConsent(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('cookie-consent') !== null;
}

// Save data to localStorage only if preference cookies are allowed
export function saveToLocalStorage(key: string, value: any): boolean {
  if (!isCookieAllowed('preferences')) {
    console.log('Preference cookies not allowed, not saving to localStorage');
    return false;
  }
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    return false;
  }
}

// Get data from localStorage only if preference cookies are allowed
export function getFromLocalStorage(key: string): any {
  if (!isCookieAllowed('preferences')) {
    return null;
  }
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Failed to get from localStorage:', error);
    return null;
  }
}

// Initialize analytics based on cookie preferences
export function initializeAnalytics(): void {
  if (isCookieAllowed('analytics')) {
    console.log('Initializing analytics...');
    // Here you would initialize Google Analytics, etc.
    // Example:
    // gtag('config', 'GA_MEASUREMENT_ID');
  }
}

// Initialize marketing pixels based on cookie preferences
export function initializeMarketing(): void {
  if (isCookieAllowed('marketing')) {
    console.log('Initializing marketing pixels...');
    // Here you would initialize Facebook Pixel, Google Ads, etc.
    // Example:
    // fbq('init', 'FACEBOOK_PIXEL_ID');
  }
}

// Clean up cookies when user rejects them
export function cleanupCookies(preferences: CookiePreferences): void {
  if (!preferences.preferences) {
    // Remove preference-related localStorage items
    localStorage.removeItem('preferred-currency');
    console.log('Cleaned up preference cookies');
  }
  
  if (!preferences.analytics) {
    // Remove analytics cookies
    // This would typically involve removing Google Analytics cookies
    console.log('Cleaned up analytics cookies');
  }
  
  if (!preferences.marketing) {
    // Remove marketing cookies
    // This would typically involve removing Facebook Pixel, Google Ads cookies
    console.log('Cleaned up marketing cookies');
  }
}
