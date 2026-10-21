import React, { useEffect } from 'react';
import { X, Cookie, ShieldCheck, Check, Info } from 'lucide-react';

interface CookiePolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CookiePolicyModal: React.FC<CookiePolicyModalProps> = ({ isOpen, onClose }) => {
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
      aria-labelledby="cookie-policy-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Cookie className="w-4 h-4" />
            </div>
            <div>
              <h2 id="cookie-policy-title" className="text-base font-bold text-slate-900">
                Cookies &amp; Local Storage Policy
              </h2>
              <p className="text-[11px] text-slate-500">Hearing Clinic Lahore • Transparency in Privacy</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors"
            aria-label="Close cookie policy"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-700 text-sm leading-relaxed">
          <p>
            Hearing Clinic uses minimal, privacy-respecting client-side storage technologies to ensure seamless appointment booking and security. We <strong>do not</strong> employ cross-site tracking, third-party advertising cookies, or invasive data brokers.
          </p>

          <section className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
              1. Essential Technical Storage (Always Active)
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex justify-between items-center font-semibold text-slate-900 mb-1">
                  <span>hc_cookie_consent</span>
                  <span className="text-teal-700 font-mono text-[10px]">LocalStorage</span>
                </div>
                <p className="text-slate-600">Stores your accepted cookie and storage preferences so you do not see repeated consent banners.</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex justify-between items-center font-semibold text-slate-900 mb-1">
                  <span>hc_last_submit_time</span>
                  <span className="text-teal-700 font-mono text-[10px]">LocalStorage</span>
                </div>
                <p className="text-slate-600">Prevents accidental duplicate booking form submissions (rate limiting &amp; anti-bot safeguard).</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex justify-between items-center font-semibold text-slate-900 mb-1">
                  <span>clinic_staff_auth</span>
                  <span className="text-teal-700 font-mono text-[10px]">SessionStorage</span>
                </div>
                <p className="text-slate-600">Temporarily authenticates authorized clinic receptionists during their active shift in the staff desk.</p>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
              2. Third-Party Maps Embeds
            </h3>
            <p className="text-xs text-slate-600">
              Our location section embeds Google Maps to help you navigate to 83A MM Alam Road, Gulberg III, Lahore. Google Maps may place its own functional cookies when viewing interactive maps in accordance with Google's Privacy Policy.
            </p>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-3">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
              3. Managing Your Browser Storage
            </h3>
            <p className="text-xs text-slate-600">
              You can clear cookies and local storage anytime via your browser settings. Doing so will reset your consent preferences and requires re-entering consultation inquiries.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            Close Cookie Information
          </button>
        </div>
      </div>
    </div>
  );
};
