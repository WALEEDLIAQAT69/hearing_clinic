import React, { useEffect } from 'react';
import { X, ShieldCheck, Lock, FileText, Check, Phone, Mail } from 'lucide-react';
import { CLINIC_INFO } from '../data/clinicData';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
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
      aria-labelledby="privacy-policy-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
    >
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 id="privacy-policy-title" className="text-base font-bold text-slate-900">
                Privacy Policy &amp; Patient Data Protection
              </h2>
              <p className="text-[11px] text-slate-500">Effective Date: September 2026 • Hearing Clinic Lahore</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors"
            aria-label="Close privacy policy"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-700 text-sm leading-relaxed">
          <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-100 text-xs text-teal-900 flex items-start gap-3">
            <Lock className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-teal-950 mb-0.5">Strict Healthcare Confidentiality</span>
              Hearing Clinic Lahore is committed to upholding medical confidentiality and ethical data stewardship. We only collect the minimal personal information required to safely schedule, confirm, and provide audiological consultations.
            </div>
          </div>

          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-600" />
              1. What Data We Collect
            </h3>
            <p>
              When you book a hearing test, request an Ala Samat fitting, or contact our reception, we collect:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li><strong>Patient Contact Information:</strong> Full name, telephone/mobile number, and optional email address.</li>
              <li><strong>Appointment Specifics:</strong> Desired clinical service (e.g. PTA, Tympanometry, Hearing Aid Fitting), preferred date, and preferred time window.</li>
              <li><strong>Voluntary Symptom Notes:</strong> Any brief hearing symptoms or specific requirements you voluntarily share to help our audiology team prepare.</li>
            </ul>
            <p className="text-xs text-slate-500 italic">
              Note: We do NOT store payment card details, bank information, or sensitive national identity numbers on this website.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-600" />
              2. How Your Information Is Used
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>To schedule, confirm, or reschedule your requested diagnostic audiology appointment.</li>
              <li>To contact you via phone, SMS, or WhatsApp regarding appointment arrival or sound suite preparation.</li>
              <li>To answer technical inquiries regarding Ala Samat warranties, models, or repair requests.</li>
              <li>We <strong>never sell, rent, or trade</strong> your personal details to third-party advertisers or telemarketers.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-600" />
              3. Cloud Infrastructure &amp; Security
            </h3>
            <p>
              Appointment requests are transmitted over encrypted HTTPS (TLS 1.3) and stored within a secured Google Cloud Firestore database protected by enterprise security rules. Access is restricted exclusively to authorized clinical reception staff.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-600" />
              4. Patient Rights &amp; Record Deletion
            </h3>
            <p>
              As a patient, you have full rights to:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Request an extract of your logged contact details.</li>
              <li>Request immediate deletion or redaction of your appointment booking entry once your visit is completed.</li>
              <li>Opt out of any follow-up reminder messages at any time.</li>
            </ul>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h3 className="font-bold text-slate-900 text-base">Contact Our Data Steward</h3>
            <p className="text-xs text-slate-600">
              For any questions regarding your medical privacy or to request data removal, please contact:
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
            I Understand &amp; Agree
          </button>
        </div>
      </div>
    </div>
  );
};
