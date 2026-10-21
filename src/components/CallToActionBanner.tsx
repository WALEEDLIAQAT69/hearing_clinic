import React from 'react';
import { Phone, Calendar } from 'lucide-react';
import { CLINIC_INFO } from '../data/clinicData';

interface CallToActionBannerProps {
  onBookClick: () => void;
}

export const CallToActionBanner: React.FC<CallToActionBannerProps> = ({ onBookClick }) => {
  return (
    <section className="w-full py-12 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-white/85 backdrop-blur-md border border-slate-200/80 p-8 sm:p-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="absolute -right-16 -top-16 w-72 h-72 bg-teal-100/50 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-60 h-60 bg-sky-100/40 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col gap-2.5 max-w-xl z-10 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Compassionate Audiological Care
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Schedule your confidential consultation at MM Alam Road.
            </h3>
            <p className="text-sm sm:text-base text-slate-600">
              Meet our senior audiology consultants for a thorough, unhurried assessment in our soundproof European acoustic suites.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full md:w-auto z-10 shrink-0">
            <a
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100/90 hover:bg-slate-200/80 text-slate-800 font-semibold text-sm flex items-center justify-center gap-2 transition-all border border-slate-200"
              href={`tel:${CLINIC_INFO.phoneClean}`}
            >
              <Phone className="w-4 h-4 text-teal-600" />
              <span>0321 4190400</span>
            </a>
            <button
              type="button"
              onClick={onBookClick}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm tracking-wide shadow-sm hover:shadow-md transition-all active:scale-[0.98] text-center cursor-pointer"
            >
              Book Appointment
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
