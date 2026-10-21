import React from 'react';
import { Ear, ArrowLeft, Phone, Home, Mail } from 'lucide-react';
import { CLINIC_INFO } from '../data/clinicData';

interface NotFoundStateProps {
  onReturnHome: () => void;
}

export const NotFoundState: React.FC<NotFoundStateProps> = ({ onReturnHome }) => {
  return (
    <div
      role="main"
      aria-labelledby="not-found-heading"
      className="min-h-[75vh] flex items-center justify-center px-4 py-24 bg-[#F8FAFC]"
    >
      <div className="max-w-lg mx-auto text-center space-y-6">
        <div className="h-20 w-20 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 mx-auto shadow-xs">
          <Ear className="h-10 w-10" aria-hidden="true" />
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
            <span>HTTP 404 • Page or Section Not Found</span>
          </div>
          <h1 id="not-found-heading" className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Audiology Service or Record Not Found
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-md mx-auto">
            The page or clinical resource you were looking for doesn't exist or has moved. You can return to our main clinic homepage or speak directly with our reception.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onReturnHome}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-teal-700 shadow-sm transition-all active:scale-[0.98] min-h-[48px]"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            <span>Return to Clinic Home</span>
          </button>

          <a
            href={`tel:${CLINIC_INFO.phoneClean}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 hover:text-teal-800 hover:bg-slate-50 transition-colors shadow-xs min-h-[48px]"
          >
            <Phone className="h-4 w-4 text-teal-600" aria-hidden="true" />
            <span>Call Reception: {CLINIC_INFO.phone}</span>
          </a>
        </div>

        <div className="pt-4 border-t border-slate-200/80 flex items-center justify-center gap-4 text-xs text-slate-500">
          <a href={`mailto:${CLINIC_INFO.email}`} className="hover:text-teal-700 flex items-center gap-1">
            <Mail className="w-3.5 h-3.5" />
            <span>{CLINIC_INFO.email}</span>
          </a>
          <span>•</span>
          <span>MM Alam Road, Gulberg III, Lahore</span>
        </div>
      </div>
    </div>
  );
};
