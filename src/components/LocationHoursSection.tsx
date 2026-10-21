import React from 'react';
import { MapPin, Phone, Clock, ExternalLink, Navigation, Compass } from 'lucide-react';
import { CLINIC_INFO } from '../data/clinicData';
import { getClinicCurrentStatus } from '../utils/clinicHelpers';

export const LocationHoursSection: React.FC = () => {
  const clinicStatus = getClinicCurrentStatus();

  return (
    <section
      id="location"
      aria-labelledby="location-heading"
      className="py-16 bg-[#F8FAFC] border-b border-slate-200/70"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 block mb-2">
            Visit Our Clinic
          </span>
          <h2
            id="location-heading"
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight"
          >
            Conveniently located on MM Alam Road, Gulberg III.
          </h2>
          <p className="mt-4 text-base text-slate-600 leading-relaxed">
            Our clinic is situated near Hussain Chowk in the heart of Gulberg III, Lahore, featuring ground-floor step-free access and reserved accessible parking directly outside.
          </p>
        </div>

        {/* Content Grid */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Details & Hours Table */}
          <div className="lg:col-span-5 space-y-6">
            {/* Address Card */}
            <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md p-6 shadow-xs">
              <div className="flex items-start gap-3.5">
                <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0">
                  <MapPin className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Clinic Address
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    {CLINIC_INFO.address}
                  </p>
                  <p className="mt-1.5 text-xs text-teal-700 font-semibold">
                    Landmark: Near Hussain Chowk, Gulberg III, Lahore
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2.5">
                    <a
                      href={CLINIC_INFO.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-teal-600 text-xs font-semibold text-white hover:bg-teal-700 transition-colors shadow-xs min-h-[44px]"
                      aria-label="Open directions in Google Maps (opens in a new tab)"
                    >
                      <Navigation className="h-4 w-4" aria-hidden="true" />
                      <span>Get Directions on Google Maps</span>
                      <ExternalLink className="h-3.5 w-3.5 ml-0.5 opacity-80" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Contact Card */}
            <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md p-6 shadow-xs">
              <div className="flex items-start gap-3.5">
                <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0">
                  <Phone className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    Direct Reception &amp; Inquiries
                  </h3>
                  <p className="text-sm text-slate-600">
                    Call or message reception for immediate clinical queries or same-day scheduling.
                  </p>
                  <div className="pt-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-medium">Main Clinic:</span>
                      <a
                        href={`tel:${CLINIC_INFO.phoneClean}`}
                        className="text-base font-extrabold text-teal-700 hover:text-teal-800 transition-colors"
                      >
                        {CLINIC_INFO.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-medium">Helpline:</span>
                      <a
                        href="tel:03008479266"
                        className="text-sm font-bold text-teal-700 hover:text-teal-800 transition-colors"
                      >
                        0300 8479266
                      </a>
                    </div>
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="text-xs text-slate-500 font-medium">Email:</span>
                      <a
                        href={`mailto:${CLINIC_INFO.email}`}
                        className="text-xs font-semibold text-teal-700 hover:underline transition-colors"
                      >
                        {CLINIC_INFO.email}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Operating Hours Table */}
            <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Clock className="h-4.5 w-4.5 text-teal-700" aria-hidden="true" />
                  <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                    Opening Hours
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      clinicStatus.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                    }`}
                    aria-hidden="true"
                  />
                  <span className="text-xs font-semibold text-slate-800">
                    {clinicStatus.statusText}
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-800 font-medium">Monday – Saturday</span>
                  <span className="font-semibold text-slate-900">10:00 AM – 7:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-slate-100">
                  <span className="text-slate-500">Sunday</span>
                  <span className="font-semibold text-rose-600">Closed</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
                <p>Appointments are recommended to avoid wait times. Emergency walk-in battery and filter checks welcomed during working hours.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Embedded Map */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
              {/* Map Header Bar */}
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Compass className="h-4 w-4 text-teal-700" aria-hidden="true" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    MM Alam Road Location Map
                  </span>
                </div>
                <span className="text-xs text-slate-500">Gulberg III, Lahore, 44600</span>
              </div>

              {/* Embedded Map Visual Container */}
              <div className="relative h-[360px] sm:h-[420px] bg-slate-100 flex items-center justify-center p-4">
                <iframe
                  title="Hearing Clinic Location Map, Gulberg III Lahore"
                  src="https://maps.google.com/maps?q=83A,+B+III,+Gulberg+III,+MM+Alam+Road,+near+Hussain+Chowk,+Lahore,+Pakistan&t=&z=16&ie=UTF8&iwloc=&output=embed"
                  className="absolute inset-0 w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  aria-label="Map showing Hearing Clinic on MM Alam Road, Gulberg III, Lahore"
                />

                {/* Floating Marker Card Overlay for Quick Reference */}
                <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-xs bg-white/95 backdrop-blur-md rounded-xl p-4 border border-slate-200 shadow-md pointer-events-auto">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="h-4.5 w-4.5 text-rose-500 shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="font-bold text-xs text-slate-900">Hearing Clinic</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">83A, B III, Gulberg III, MM Alam Road</p>
                      <p className="text-[11px] text-teal-700 font-semibold mt-1">Near Hussain Chowk</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Footer Landmark Notes */}
              <div className="p-6 bg-slate-50/70 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-bold text-slate-900 block mb-1">Transit &amp; Parking</span>
                  <p className="text-slate-600 leading-relaxed">
                    Easily accessible via Main Boulevard Gulberg and MM Alam Road. Dedicated wheelchair parking right outside the entrance.
                  </p>
                </div>
                <div>
                  <span className="font-bold text-slate-900 block mb-1">Clinic Landmarks</span>
                  <p className="text-slate-600 leading-relaxed">
                    Located just off Hussain Chowk on the prominent commercial stretch of MM Alam Road. Look for the Hearing Clinic signage.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
