import React from 'react';
import { Phone, Calendar, MessageCircle, ShieldCheck, DoorOpen, CheckCircle } from 'lucide-react';
import { CLINIC_INFO } from '../data/clinicData';
import { getClinicCurrentStatus } from '../utils/clinicHelpers';

interface HeroProps {
  onBookClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onBookClick }) => {
  const clinicStatus = getClinicCurrentStatus();

  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="relative w-full overflow-hidden pb-12 sm:pb-16 pt-24 sm:pt-32 lg:pt-36 bg-[#F8FAFC]"
    >
      {/* Ambient background glows matching user reference */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-teal-100/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-48 right-10 w-[420px] h-[420px] bg-sky-100/40 rounded-full blur-[90px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headline, Narrative & Legacy Metrics */}
          <div className="lg:col-span-6 flex flex-col gap-4 sm:gap-5 z-10">
            <div className="inline-flex items-center gap-2 self-start px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white/90 border border-teal-200/70 shadow-xs backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-teal-800">
                Lahore's trusted hearing care since 1992
              </span>
            </div>

            <h1
              id="hero-heading"
              className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.2] sm:leading-[1.15]"
            >
              World-class diagnostic audiology in the heart of Gulberg.
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed max-w-xl">
              For more than three decades along MM Alam Road, Gulberg III, Hearing Clinic has set Pakistan’s gold standard in gentle diagnostic hearing care. Combining British and Swiss acoustic testing booths with board-certified compassionate consultants devoted to restoring your auditory connection.
            </p>

            {/* Key Legacy Metric Counters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 sm:pt-2">
              <div className="flex flex-col p-3.5 sm:p-4 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-xs hover:border-teal-300 transition-all">
                <span className="text-2xl lg:text-3xl font-bold text-teal-700">32+</span>
                <span className="text-[11px] sm:text-[12px] font-bold uppercase tracking-wider text-slate-900 pt-0.5">Years of Excellence</span>
                <span className="text-[11px] sm:text-[12px] text-slate-500 mt-0.5">MM Alam Road, Lahore</span>
              </div>
              <div className="flex flex-col p-3.5 sm:p-4 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-xs hover:border-teal-300 transition-all">
                <span className="text-2xl lg:text-3xl font-bold text-teal-700">45,000+</span>
                <span className="text-[11px] sm:text-[12px] font-bold uppercase tracking-wider text-slate-900 pt-0.5">Satisfied Patients</span>
                <span className="text-[11px] sm:text-[12px] text-slate-500 mt-0.5">Restored hearing clarity</span>
              </div>
              <div className="flex flex-col p-3.5 sm:p-4 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-xs hover:border-teal-300 transition-all">
                <span className="text-2xl lg:text-3xl font-bold text-teal-700">100%</span>
                <span className="text-[11px] sm:text-[12px] font-bold uppercase tracking-wider text-slate-900 pt-0.5">Calibrated Suites</span>
                <span className="text-[11px] sm:text-[12px] text-slate-500 mt-0.5">ISO sound isolation</span>
              </div>
            </div>

            {/* Interactive Functional Buttons (All working intact) */}
            <div className="pt-2 sm:pt-3 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={onBookClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all active:scale-[0.98] min-h-[48px]"
              >
                <Calendar className="h-4.5 w-4.5" />
                <span>Book Appointment</span>
              </button>

              <a
                href={`https://wa.me/${CLINIC_INFO.whatsAppNumber}?text=${encodeURIComponent('Hello Hearing Clinic Lahore, I would like to inquire about hearing tests and appointment availability.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-sm font-semibold text-white transition-all shadow-xs active:scale-[0.98] min-h-[48px]"
              >
                <MessageCircle className="h-4.5 w-4.5 fill-current" />
                <span>Chat on WhatsApp</span>
              </a>

              <a
                href={`tel:${CLINIC_INFO.phoneClean}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-teal-800 border border-slate-200/90 text-sm font-semibold transition-all shadow-xs min-h-[48px]"
              >
                <Phone className="h-4 w-4 text-teal-600" />
                <span>0321 4190400</span>
              </a>
            </div>

            {/* Operating Live Status Chip */}
            <div className="pt-2 flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <span className={`w-2 h-2 rounded-full ${clinicStatus.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                {clinicStatus.statusText}
              </span>
              <span>•</span>
              <span>Mon – Sat: 10:00 AM – 7:00 PM</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">Gulberg III Flagship</span>
            </div>
          </div>

          {/* Right Column: Real Clinic Images Composite Showcase */}
          <div className="lg:col-span-6 relative mt-4 lg:mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              {/* Main chamber photography with soundproof badge */}
              <div className="sm:col-span-7 relative group">
                <div className="overflow-hidden rounded-2xl bg-white/90 border border-slate-200/80 shadow-md">
                  <img
                    alt="Modern bright soundproof audiology testing booth and consultation clinic room with warm wood accents"
                    className="w-full h-64 sm:h-80 object-cover rounded-2xl transition-transform duration-500 group-hover:scale-102"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAAw5-PSG89Ek5LOnaVLfHI1p9Poek0MYFRMWhzcTMa2P0SdkqaR-Mf_vT3uNxgWeJcTe373QEvKn56c0FDy5ZwDvLS3aUCfZN0VTaHYW2QP34Gko9TC0LePkrHs343297KE0P1hh1Ra1SbmICBtGZ_ezfVlU-RVghDhiQeVLdGenc4HvxH51wy0Ij7ZXedjtTlJrLWIzpDxPHwV4jq0nXUnGpVd8qeyOWM_2am01ELBY0Vu0M5hgv-"
                  />
                </div>
                <div className="mt-3 sm:mt-0 sm:absolute sm:-bottom-4 sm:left-3 sm:right-3 p-3 bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-lg rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                    <DoorOpen className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-900 leading-none">Audiometric Chamber</span>
                    <span className="text-[11px] text-slate-500 mt-0.5">Double-walled soundproof isolation</span>
                  </div>
                </div>
              </div>

              {/* Specialist doctor examination & certification badges */}
              <div className="sm:col-span-5 flex flex-col gap-4">
                <div className="overflow-hidden rounded-2xl bg-white/90 border border-slate-200/80 shadow-md group">
                  <img
                    alt="Authentic photography of a friendly female audiologist conducting an otoscopic hearing examination"
                    className="w-full h-44 object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAxoXMB_Wulny3leZUKLgm2ueyefV1ILjmNAFlOvaw1_5F9I1BhrY8YplBPefJPAcfozSYFfJwUNhH0axbOT0XRaRGK_fx01MxoUNMZgPvIG_JRPxzD5ehAx8FEB3BbK-DAlzKNJSAK2ZekC5vQbMN59mQg8qzBMFmPA9jsBqMaGZ0tWPmPOVjDVymHHz339-YEXqvzRqN_r1WV0UxKFGSWsG0OCtKdpqbYvBzLAzt3M6xRARKtzZ4g"
                  />
                </div>
                <div className="p-3.5 sm:p-4 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-xs flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-teal-700">
                    <ShieldCheck className="w-4.5 h-4.5" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">Certified Care</span>
                  </div>
                  <p className="text-[12px] text-slate-600 leading-snug">
                    European Sonova &amp; Amplivox acoustic diagnostic protocols.
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
