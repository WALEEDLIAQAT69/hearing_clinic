import React, { useState, useEffect } from 'react';
import { Cookie, X, Shield, ArrowRight } from 'lucide-react';

interface CookieConsentBannerProps {
  onOpenCookiePolicy: () => void;
  onOpenPrivacyPolicy: () => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({
  onOpenCookiePolicy,
  onOpenPrivacyPolicy,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('hc_cookie_consent');
      if (!consent) {
        // Small delay to ensure smooth entry after page loads
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // Storage unavailable in private browsing
    }
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem('hc_cookie_consent', 'all');
    } catch {
      // Ignore
    }
    setIsVisible(false);
  };

  const handleEssentialOnly = () => {
    try {
      localStorage.setItem('hc_cookie_consent', 'essential');
    } catch {
      // Ignore
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Cookie and Privacy Consent Banner"
      className="fixed bottom-4 inset-x-4 sm:left-auto sm:right-6 sm:max-w-md z-40 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-2xl p-4 sm:p-5 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0 mt-0.5">
          <Cookie className="w-5 h-5" />
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Privacy &amp; Cookie Preferences
            </h3>
            <button
              type="button"
              onClick={handleEssentialOnly}
              className="text-slate-400 hover:text-slate-600 p-1 -mr-1"
              aria-label="Dismiss cookie banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            We use essential local storage to safeguard appointment bookings and remember clinic preferences. We never sell your personal healthcare data or run third-party advertising trackers.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-teal-700 font-medium">
            <button
              type="button"
              onClick={onOpenCookiePolicy}
              className="hover:underline focus:outline-none"
            >
              Cookie Policy
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={onOpenPrivacyPolicy}
              className="hover:underline focus:outline-none"
            >
              Privacy Policy
            </button>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={handleAcceptAll}
              className="flex-1 px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors text-center min-h-[40px] flex items-center justify-center"
            >
              Accept All
            </button>
            <button
              type="button"
              onClick={handleEssentialOnly}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors text-center min-h-[40px] flex items-center justify-center"
            >
              Essential Only
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
