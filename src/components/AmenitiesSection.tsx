import React from 'react';
import { Accessibility, ShieldCheck, DoorOpen, CheckCircle, Hospital, Lock, Award } from 'lucide-react';

export const AmenitiesSection: React.FC = () => {
  return (
    <section id="amenities" aria-labelledby="amenities-heading" className="w-full py-16 relative bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div className="flex flex-col gap-1.5">
            <div className="inline-flex items-center gap-1.5 text-teal-700 text-xs font-bold uppercase tracking-widest">
              <Hospital className="w-4 h-4 text-teal-600" />
              <span>Patient-First Infrastructure</span>
            </div>
            <h2
              id="amenities-heading"
              className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight"
            >
              Accessible, Peaceful &amp; Modern Clinic Environment
            </h2>
          </div>
          <p className="text-sm text-slate-600 max-w-md leading-relaxed">
            From barrier-free entry to acoustic privacy suites, our MM Alam Road clinic guarantees dignity, safety, and pristine clinical standards for all ages.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature Card 1 */}
          <div className="flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-xs hover:shadow-md hover:border-teal-300 transition-all duration-300 group">
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 group-hover:scale-105 group-hover:bg-teal-600 group-hover:text-white transition-all shadow-xs">
                <Accessibility className="w-6 h-6" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  Wheelchair Accessible Ramp &amp; Seating
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Step-free, smooth ramp access right from the MM Alam Road frontage, accompanied by dedicated on-site valet assistance and extra-wide portals designed for wheelchair comfort.
                </p>
              </div>
            </div>
            <div className="pt-5 mt-4 border-t border-slate-100 flex items-center gap-2 text-teal-700 text-xs font-semibold">
              <CheckCircle className="w-4 h-4 text-teal-600" />
              <span>Barrier-Free &amp; Valet Parking</span>
            </div>
          </div>

          {/* Feature Card 2 */}
          <div className="flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-xs hover:shadow-md hover:border-teal-300 transition-all duration-300 group">
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 group-hover:scale-105 group-hover:bg-teal-600 group-hover:text-white transition-all shadow-xs">
                <Award className="w-6 h-6" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  Sole UK Technology Distributors (Amplivox UK)
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Authorized regional partner providing genuine UK-engineered Amplivox audiometers, computer-calibrated sound analyzers, and Swiss Phonak digital fitting systems.
                </p>
              </div>
            </div>
            <div className="pt-5 mt-4 border-t border-slate-100 flex items-center gap-2 text-teal-700 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Amplivox UK Certified Diagnostics</span>
            </div>
          </div>

          {/* Feature Card 3 */}
          <div className="flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-xs hover:shadow-md hover:border-teal-300 transition-all duration-300 group">
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 group-hover:scale-105 group-hover:bg-teal-600 group-hover:text-white transition-all shadow-xs">
                <DoorOpen className="w-6 h-6" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  Private Soundproof Consultation Suites
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Spacious, calming consultation chambers with medical-grade air filtration and sound insulation to protect your privacy and guarantee stress-free diagnostics.
                </p>
              </div>
            </div>
            <div className="pt-5 mt-4 border-t border-slate-100 flex items-center gap-2 text-teal-700 text-xs font-semibold">
              <Lock className="w-4 h-4 text-teal-600" />
              <span>Confidential Medical Discretion</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
