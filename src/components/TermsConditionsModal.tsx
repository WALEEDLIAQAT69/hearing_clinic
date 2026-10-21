import React, { useEffect } from 'react';
import { X, FileText, CheckCircle2, AlertCircle, Phone, Mail } from 'lucide-react';
import { CLINIC_INFO } from '../data/clinicData';

interface TermsConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsConditionsModal: React.FC<TermsConditionsModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-conditions-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
    >
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 id="terms-conditions-title" className="text-base font-bold text-slate-900">
                Terms &amp; Conditions of Clinical Care
              </h2>
              <p className="text-[11px] text-slate-500">Effective Date: September 2026 • Hearing Clinic Lahore</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors"
            aria-label="Close terms and conditions"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-700 text-sm leading-relaxed">
          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-600" />
              1. Clinical Appointments &amp; Consultations
            </h3>
            <p>
              By scheduling an appointment through this platform or by calling our MM Alam Road reception:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Appointments are confirmed subject to doctor availability and sound booth scheduling.</li>
              <li>Please arrive 10 minutes prior to your allocated slot to allow acoustic acclimatization.</li>
              <li>If you need to reschedule or cancel, please notify us at least 2 hours in advance so another patient can be accommodated.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-600" />
              2. Medical &amp; Diagnostic Scope
            </h3>
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                Hearing tests (PTA, Tympanometry, BERA/OAE) and hearing aid evaluations conducted at Hearing Clinic are diagnostic and rehabilitative. In cases of sudden sensorineural hearing loss, active ear bleeding, or acute bacterial infection, we immediately coordinate with consultant ENT surgeons.
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-600" />
              3. Ala Samat Hearing Instruments &amp; Warranties
            </h3>
            <p>
              Hearing instruments (Phonak, Signia, Beltone, A&amp;M) dispensed by Hearing Clinic Lahore are genuine imported medical devices with official manufacturer warranty coverage:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li><strong>Manufacturer Warranty:</strong> 1 to 2 years covering internal digital processor and receiver components under normal usage.</li>
              <li><strong>Complimentary Fine-Tuning:</strong> Up to 3 complimentary computer fine-tuning and reprogramming sessions within the first 6 months of purchase.</li>
              <li><strong>Custom Earmolds &amp; Shells:</strong> Custom impressions (ITE, ITC, CIC, Titanium) are tailored to individual ear canal anatomy. Any remaking for comfort is accommodated within 30 days of initial delivery.</li>
              <li>Physical trauma, water submersion (for non-waterproof units), and unauthorized third-party tampering void warranty protection.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-600" />
              4. Payment &amp; Transparency
            </h3>
            <p>
              Diagnostic testing fees and instrument prices are communicated transparently before any procedure. We accept cash, major Pakistani debit cards, and MasterCard at our clinic counter.
            </p>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h3 className="font-bold text-slate-900 text-base">Questions Regarding Clinical Policies?</h3>
            <p className="text-xs text-slate-600">
              Our clinical administration team is always available to assist:
            </p>
            <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-800 pt-1">
              <a href={`mailto:${CLINIC_INFO.email}`} className="flex items-center gap-1.5 text-teal-700 hover:underline">
                <Mail className="w-3.5 h-3.5" />
                <span>{CLINIC_INFO.email}</span>
              </a>
              <a href={`tel:${CLINIC_INFO.phoneClean}`} className="flex items-center gap-1.5 text-teal-700 hover:underline">
                <Phone className="w-3.5 h-3.5" />
                <span>{CLINIC_INFO.phone}</span>
              </a>
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            Acknowledge Terms
          </button>
        </div>
      </div>
    </div>
  );
};
