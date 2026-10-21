import React from 'react';
import { Phone, MapPin, Clock, ArrowUp, ShieldCheck, Ear, Mail, AlertCircle } from 'lucide-react';
import { CLINIC_INFO } from '../data/clinicData';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  onOpenPortal?: () => void;
  onOpenPrivacyPolicy?: () => void;
  onOpenTerms?: () => void;
  onOpenCookiePolicy?: () => void;
  onOpenAccessibility?: () => void;
  onOpen404?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  onNavigate, 
  onOpenPortal,
  onOpenPrivacyPolicy,
  onOpenTerms,
  onOpenCookiePolicy,
  onOpenAccessibility,
  onOpen404,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="clinic-footer" className="w-full bg-white border-t border-slate-200/80 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Clinic Identity & Mission */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                <Ear className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-slate-900">Hearing Clinic</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
              Lahore’s trusted hearing healthcare sanctuary since 1992, offering Swiss &amp; European acoustic diagnostics, hearing aid fittings, and custom sound solutions.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <a
                href={CLINIC_INFO.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Clinic Google Maps Location"
                className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-teal-700 hover:border-teal-300 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5" />
              </a>
              <a
                href={`mailto:${CLINIC_INFO.email}`}
                aria-label="Send Email to Reception"
                className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-teal-700 hover:border-teal-300 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
              </a>
              <div
                title="Verified Healthcare Facility"
                className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-teal-700"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="pt-1">
              <a 
                href={`mailto:${CLINIC_INFO.email}`}
                className="text-xs text-teal-700 hover:underline font-medium inline-flex items-center gap-1.5"
              >
                <Mail className="w-3 h-3" />
                <span>{CLINIC_INFO.email}</span>
              </a>
            </div>
          </div>

          {/* Col 2: Location & Access */}
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900">Location &amp; Access</span>
            <div className="flex items-start gap-2 text-slate-600">
              <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span className="text-xs leading-relaxed">
                83A, MM Alam Road, Block B-1, Gulberg III,<br />
                Lahore, Punjab, Pakistan
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 pt-1">
              <Clock className="w-4 h-4 text-teal-600 shrink-0" />
              <span className="text-xs">Mon – Sat: 10:00 AM – 7:00 PM</span>
            </div>
          </div>

          {/* Col 3: Concierge Care & Direct Phone */}
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900">Direct Contact</span>
            <div className="flex items-center gap-2 text-slate-700">
              <Phone className="w-4 h-4 text-teal-600 shrink-0" />
              <a 
                className="text-xs font-semibold text-teal-800 hover:underline" 
                href={`tel:${CLINIC_INFO.phoneClean}`}
                aria-label="Call clinic phone 0321 4190400"
              >
                {CLINIC_INFO.phone}
              </a>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Phone className="w-4 h-4 text-teal-600 shrink-0" />
              <a 
                className="text-xs font-semibold text-teal-800 hover:underline" 
                href="tel:03008479266"
                aria-label="Call secondary helpline 0300 8479266"
              >
                0300 8479266
              </a>
            </div>
            <div className="flex items-start gap-2 text-slate-600 pt-1">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-bold text-rose-600 block uppercase">Emergency Helpline</span>
                <span className="text-xs text-slate-700">+92 (42) 3575-CARE</span>
              </div>
            </div>
          </div>

          {/* Col 4: Acoustic Partners */}
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900">Acoustic Partners</span>
            <p className="text-xs text-slate-600">Official dispenser &amp; calibration laboratory for international audiology manufacturers.</p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-700">
                Amplivox UK
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-700">
                Phonak
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-700">
                Signia
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-700">
                Beltone
              </span>
            </div>
          </div>
        </div>

        {/* Legal & Policy Navigation Row */}
        <div className="border-t border-slate-100 pt-5 pb-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-3 sm:gap-5">
            <button
              type="button"
              onClick={onOpenPrivacyPolicy}
              className="text-slate-600 hover:text-teal-700 font-medium transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={onOpenTerms}
              className="text-slate-600 hover:text-teal-700 font-medium transition-colors cursor-pointer"
            >
              Terms &amp; Conditions
            </button>
            <button
              type="button"
              onClick={onOpenCookiePolicy}
              className="text-slate-600 hover:text-teal-700 font-medium transition-colors cursor-pointer"
            >
              Cookie Policy
            </button>
            <button
              type="button"
              onClick={onOpenAccessibility}
              className="text-slate-600 hover:text-teal-700 font-medium transition-colors cursor-pointer"
            >
              Accessibility
            </button>
            <a
              href="/sitemap.html"
              className="text-slate-500 hover:text-teal-700 transition-colors"
            >
              HTML Sitemap
            </a>
            <a
              href="/.well-known/security.txt"
              className="text-slate-500 hover:text-teal-700 transition-colors"
            >
              security.txt
            </a>
            <button
              type="button"
              onClick={onOpen404 || (() => { window.location.hash = '#404'; })}
              className="text-slate-500 hover:text-teal-700 transition-colors cursor-pointer"
            >
              404 Page
            </button>
            <a
              href="/offline.html"
              className="text-slate-500 hover:text-teal-700 transition-colors"
            >
              Offline Page
            </a>
            <a
              href="/system-status.html"
              className="text-slate-500 hover:text-teal-700 transition-colors"
            >
              System Status
            </a>
            <a
              href="/admin/login.html"
              className="text-slate-500 hover:text-teal-700 transition-colors font-medium"
            >
              Admin Login
            </a>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (onOpenPortal) {
                  onOpenPortal();
                } else {
                  window.location.hash = '#admin';
                }
              }}
              title="Staff & Reception Desk (PIN Protected)"
              className="hover:text-teal-700 transition-colors cursor-pointer text-slate-500 font-medium"
            >
              Staff Desk
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={scrollToTop}
              className="flex items-center gap-1 text-slate-600 hover:text-teal-700 font-medium transition-colors cursor-pointer"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="border-t border-slate-100 pt-4 flex flex-col md:flex-row items-center justify-between gap-2 text-slate-500 text-[11px]">
          <span>© {new Date().getFullYear()} Hearing Clinic Lahore. Bespoke Audiology &amp; Hearing Restoration since 1992.</span>
          <span>MM Alam Road, Gulberg III, Lahore, Pakistan • All Rights Reserved</span>
        </div>
      </div>
    </footer>
  );
};
