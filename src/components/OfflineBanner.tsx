import React, { useState, useEffect } from 'react';
import { WifiOff, Phone, MapPin } from 'lucide-react';
import { CLINIC_INFO } from '../data/clinicData';

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="sticky top-0 z-50 bg-amber-600 text-white px-4 py-3 shadow-md"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5 font-medium">
          <WifiOff className="h-5 w-5 shrink-0 text-amber-100" />
          <span>
            <strong>You are currently offline.</strong> Form submissions and live updates are paused until your internet connection is restored.
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <a
            href={`tel:${CLINIC_INFO.phoneClean}`}
            className="inline-flex items-center gap-1.5 underline hover:text-amber-100"
          >
            <Phone className="h-3.5 w-3.5" />
            Call: {CLINIC_INFO.phone}
          </a>
          <span className="hidden md:inline-flex items-center gap-1 text-amber-200">
            <MapPin className="h-3.5 w-3.5" />
            MM Alam Rd, Lahore
          </span>
        </div>
      </div>
    </div>
  );
};
