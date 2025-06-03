"use client";

import { useState, useEffect } from "react";
import { Cookie, X, Info, Settings } from "lucide-react";
import { cleanupCookies, initializeAnalytics, initializeMarketing } from "@/lib/cookies";

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
    preferences: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Show banner after a short delay
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    saveCookiePreferences(allAccepted);
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    saveCookiePreferences(onlyNecessary);
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    saveCookiePreferences(preferences);
    setShowBanner(false);
    setShowDetails(false);
  };

  const saveCookiePreferences = (prefs: CookiePreferences) => {
    // Always save consent (this is necessary functionality)
    localStorage.setItem('cookie-consent', JSON.stringify({
      preferences: prefs,
      timestamp: Date.now(),
    }));
    
    // Clean up cookies that are not allowed
    cleanupCookies(prefs);
    
    // Initialize services based on preferences
    if (prefs.analytics) {
      initializeAnalytics();
    }
    if (prefs.marketing) {
      initializeMarketing();
    }
    if (prefs.preferences) {
      console.log('Preference cookies enabled - currency preferences will be saved');
    }
  };

  const handlePreferenceChange = (type: keyof CookiePreferences) => {
    if (type === 'necessary') return; // Can't disable necessary cookies
    
    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            <div className="flex items-start gap-3 flex-1">
              <Cookie className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  We use cookies to enhance your experience
                </h3>
                <p className="text-sm text-gray-600">
                  We use cookies to provide essential functionality, analyze usage, and personalize content. 
                  You can manage your preferences or learn more about our cookie policy.
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 lg:flex-nowrap">
              <button
                onClick={() => setShowDetails(true)}
                className="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                Customize
              </button>
              <button
                onClick={handleRejectAll}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
              >
                Reject All
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Cookie Settings Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Cookie Preferences</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="text-sm text-gray-600">
                  <p className="mb-4">
                    We use different types of cookies to provide you with the best experience on our website. 
                    You can choose which categories you'd like to allow.
                  </p>
                </div>

                {/* Necessary Cookies */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">Necessary Cookies</h3>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-2">Always Active</span>
                      <div className="w-10 h-6 bg-blue-600 rounded-full relative">
                        <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    These cookies are essential for the website to function properly. They enable core functionality 
                    such as security, network management, and accessibility.
                  </p>
                </div>

                {/* Analytics Cookies */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">Analytics Cookies</h3>
                    <button
                      onClick={() => handlePreferenceChange('analytics')}
                      className={`w-10 h-6 rounded-full relative transition-colors ${
                        preferences.analytics ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                        preferences.analytics ? 'translate-x-4' : 'translate-x-1'
                      }`}></div>
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">
                    These cookies help us understand how visitors interact with our website by collecting 
                    and reporting information anonymously.
                  </p>
                </div>

                {/* Marketing Cookies */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">Marketing Cookies</h3>
                    <button
                      onClick={() => handlePreferenceChange('marketing')}
                      className={`w-10 h-6 rounded-full relative transition-colors ${
                        preferences.marketing ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                        preferences.marketing ? 'translate-x-4' : 'translate-x-1'
                      }`}></div>
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">
                    These cookies are used to deliver advertisements more relevant to you and your interests. 
                    They may also be used to limit the number of times you see an advertisement.
                  </p>
                </div>

                {/* Preference Cookies */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">Preference Cookies</h3>
                    <button
                      onClick={() => handlePreferenceChange('preferences')}
                      className={`w-10 h-6 rounded-full relative transition-colors ${
                        preferences.preferences ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                        preferences.preferences ? 'translate-x-4' : 'translate-x-1'
                      }`}></div>
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">
                    These cookies allow the website to remember choices you make (such as your currency preference) 
                    and provide enhanced, more personal features.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowDetails(false)}
                  className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePreferences}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Save Preferences
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  For more information about our use of cookies, please read our{' '}
                  <a href="/privacy-policy" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </a>
                  {' '}and{' '}
                  <a href="/cookie-policy" className="text-blue-600 hover:underline">
                    Cookie Policy
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
