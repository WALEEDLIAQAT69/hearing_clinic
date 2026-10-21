import React from 'react';
import { X, CheckCircle2, ShieldCheck, Heart, Eye, Accessibility } from 'lucide-react';

interface AccessibilityStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessibilityStatementModal: React.FC<AccessibilityStatementModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <Accessibility className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Accessibility Statement</h3>
              <p className="text-xs text-slate-500">Committed to Universal Accessibility & Digital Inclusion</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
          <section>
            <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              Digital Accessibility Standard (WCAG 2.1 AA)
            </h4>
            <p className="text-xs sm:text-sm text-slate-600">
              Hearing Clinic is committed to ensuring digital accessibility for people with disabilities, particularly hearing loss, visual impairments, and mobility restrictions. We continuously improve our web experience applying the Web Content Accessibility Guidelines (WCAG) 2.1 level AA standards.
            </p>
          </section>

          <section className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
              Digital Features Implemented on this Site:
            </h4>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span><strong>High-Contrast Ratios:</strong> Colors tested to ensure contrast ratio ≥ 4.5:1 for standard body copy and headings.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span><strong>Screen Reader Optimized:</strong> ARIA labels, semantic landmark roles, and alt text for clinical diagrams and icons.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span><strong>Keyboard Navigation:</strong> Fully operable without a mouse; visible focus indicators on all inputs and buttons.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span><strong>Accessible Typography &amp; Scale:</strong> Clear typography, scalable text sizing, and high-contrast styling to assist senior citizens and visually impaired visitors.</span>
              </li>
            </ul>
          </section>

          <section>
            <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
              <Heart className="w-4 h-4 text-teal-600" />
              Physical Clinic Accessibility (Gulberg III, Lahore)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <strong>Wheelchair Ramp Access:</strong> Smooth ground-floor step-free entry directly into the consultation lounge.
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <strong>Senior Citizen Support:</strong> Dedicated audiology staff assistance, wheelchair loaners, and priority seating.
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <strong>Accessible Restrooms:</strong> Wide door clearance, grab bars, and emergency pull chords.
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <strong>Doorstep Parking:</strong> Dedicated patient drop-off bay directly facing the clinic entrance on MM Alam Road.
              </div>
            </div>
          </section>

          <section className="text-xs text-slate-500 border-t border-slate-100 pt-4">
            <p>
              If you experience any accessibility barrier while browsing or need special physical accommodations prior to your visit, please call our clinic coordinator directly at <strong className="text-teal-700">0321 4190400</strong> or email <strong className="text-teal-700">info@hearingclinic.pk</strong>.
            </p>
          </section>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-teal-600 text-white font-semibold rounded-xl text-xs hover:bg-teal-700 transition"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
