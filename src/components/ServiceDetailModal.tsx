import React from 'react';
import { X, Clock, Stethoscope, AlertCircle, CheckCircle, ArrowRight, FileText, UserCheck } from 'lucide-react';
import { ServiceItem } from '../types';

interface ServiceDetailModalProps {
  service: ServiceItem | null;
  onClose: () => void;
  onBookService: (serviceId: string) => void;
  lang?: 'en' | 'ur';
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  service,
  onClose,
  onBookService,
}) => {
  if (!service) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                <Clock className="w-3 h-3 text-teal-600" />
                <span>{service.durationMinutes} Minutes Session</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                {service.name}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-6 space-y-6 text-sm text-slate-700 leading-relaxed">
          {/* Overview */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              Clinical Description & Scope
            </h4>
            <p className="text-slate-600">{service.shortDescription}</p>
          </div>

          {/* Clinical Details */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Diagnostic Protocol & Technology
            </h4>
            <p className="text-slate-700 text-xs sm:text-sm">{service.clinicalDetails}</p>
            {service.equipmentOrFormat && (
              <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-teal-800 font-medium">
                <strong>Equipment Standards:</strong> {service.equipmentOrFormat}
              </div>
            )}
          </div>

          {/* Candidacy / Suitability */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-teal-600" />
              Who Should Schedule This Test?
            </h4>
            <p className="text-slate-600 bg-amber-50/70 border border-amber-200/80 p-3 rounded-lg text-xs sm:text-sm text-amber-900">
              {service.suitableFor}
            </p>
          </div>

          {/* Patient Preparation Instructions */}
          <div className="border-t border-slate-100 pt-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Patient Preparation & Advice
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>Avoid loud recreational or industrial noise exposure for at least 14 hours prior to diagnostic audiometry.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>Bring previous audiogram reports, ENT prescription records, or current hearing aids for comparison.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>Results and calibrated audiogram graphs are printed and explained immediately after test completion.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500 text-center sm:text-left">
            Same-day walk-ins accommodated subject to clinic acoustic suite availability.
          </p>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                const id = service.id;
                onClose();
                onBookService(id);
              }}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition shadow-sm"
            >
              <span>Book This Service</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
