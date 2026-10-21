import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Check, 
  Phone, 
  HelpCircle, 
  Sparkles,
  Calendar,
  MessageCircle,
  Award
} from 'lucide-react';
import { ALA_SAMAT_PRICE_TIERS, CLINIC_INFO } from '../data/clinicData';

interface AlaSamatPriceGuideProps {
  onBookConsultation: () => void;
}

export const AlaSamatPriceGuide: React.FC<AlaSamatPriceGuideProps> = ({ onBookConsultation }) => {
  const [selectedTierId, setSelectedTierId] = useState<string>('midrange-ala-samat');

  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="py-16 bg-[#F8FAFC] border-b border-slate-200/70"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-10 border-b border-slate-200/80">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/60 text-teal-800 text-xs font-bold mb-3">
              <Sparkles className="h-3.5 w-3.5 text-teal-600" />
              <span>Transparent Price Guide in Pakistan</span>
            </div>
            <h2
              id="pricing-heading"
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight"
            >
              Ala Samat (Hearing Aid) Pricing &amp; Patient Advisory
            </h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              Transparent, genuine manufacturer pricing backed by official Swiss and Danish warranties. Understand the investment in your hearing health with no hidden fees.
            </p>
          </div>

          {/* Quick Helpline Box */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <button
              type="button"
              onClick={onBookConsultation}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold shadow-xs transition-all min-h-[44px]"
            >
              <Calendar className="h-4 w-4" />
              <span>Book Audiogram &amp; Trial</span>
            </button>
            <a
              href={`https://wa.me/${CLINIC_INFO.whatsAppNumber}?text=${encodeURIComponent('Hello Hearing Clinic Lahore, I would like to inquire about Ala Samat prices and model recommendations.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-semibold transition-all shadow-xs min-h-[44px]"
            >
              <MessageCircle className="h-4 w-4 fill-current" />
              <span>Price Inquiry on WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Vital Clinical Warning: Medical Digital Aid vs Cheap Sound Amplifiers */}
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/70 p-5 sm:p-6 text-slate-800">
          <div className="flex items-start gap-3.5">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-sm leading-relaxed">
              <span className="font-bold text-slate-900 text-base block mb-1">
                Crucial Medical Advisory: Certified Digital Hearing Aid vs. Cheap Sound Amplifier
              </span>
              <p className="text-slate-700">
                Patients are strongly advised against buying uncalibrated cheap analog sound amplifiers (PKR 3,000–5,000 sold by street vendors or unverified online shops). These simple amplifiers blast all incoming sounds—including deafening traffic and sudden impacts—equally loud into the ear, causing <strong>irreversible acoustic nerve damage</strong>. Real medical Ala Samats feature high-speed digital DSP chips programmed by qualified audiologists specifically to match your frequency audiogram curve.
              </p>
            </div>
          </div>
        </div>

        {/* 3 Price Tiers Grid */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {ALA_SAMAT_PRICE_TIERS.map((tier) => {
            const isSelected = tier.id === selectedTierId;
            return (
              <div
                key={tier.id}
                onClick={() => setSelectedTierId(tier.id)}
                className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-200 cursor-pointer ${
                  tier.isPopular
                    ? 'border-2 border-teal-600 bg-white shadow-lg ring-4 ring-teal-600/10'
                    : isSelected
                    ? 'border-2 border-teal-500 bg-white shadow-md'
                    : 'border border-slate-200/80 bg-white/90 hover:border-teal-300 hover:shadow-xs'
                }`}
              >
                {tier.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-teal-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-xs flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    <span>Most Requested in Pakistan</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                      Digital Technology Level
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                        Active Selection
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-extrabold text-slate-900">
                    {tier.title}
                  </h3>

                  <div className="mt-4 pb-4 border-b border-slate-100">
                    <span className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                      {tier.priceRangePKR}
                    </span>
                    <span className="block text-xs text-slate-500 mt-1">
                      Per instrument • Official warranty included
                    </span>
                  </div>

                  <p className="mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {tier.description}
                  </p>

                  <div className="mt-5 space-y-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                      Included Clinical Features:
                    </span>
                    <ul className="space-y-2">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600">
                          <Check className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" aria-hidden="true" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-100">
                  <div className="mb-4">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                      Recommended Models:
                    </span>
                    <span className="text-xs font-semibold text-slate-800 block mt-0.5">
                      {tier.recommendedModels}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onBookConsultation();
                    }}
                    className={`w-full py-3 rounded-xl font-semibold text-xs tracking-wide transition-all min-h-[44px] flex items-center justify-center ${
                      tier.isPopular || isSelected
                        ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-xs'
                        : 'bg-slate-100 text-slate-800 hover:bg-teal-50 hover:text-teal-800'
                    }`}
                  >
                    Select This Tier for Evaluation
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Benefits Guarantee Strip */}
        <div className="mt-12 rounded-2xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-sm font-bold text-slate-900 block">Official Warranty</span>
              <span className="text-xs text-slate-600">1 to 2 years manufacturer coverage with genuine factory parts</span>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Award className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-sm font-bold text-slate-900 block">Complimentary Tuning</span>
              <span className="text-xs text-slate-600">Free computer adjustments during the first 6 months of adaptation</span>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-sm font-bold text-slate-900 block">Senior Discounts</span>
              <span className="text-xs text-slate-600">Complimentary screening &amp; special pricing support for pensioners</span>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-sm font-bold text-slate-900 block">Custom 3D Earmolds</span>
              <span className="text-xs text-slate-600">Anatomically molded shells for zero acoustic feedback &amp; maximum comfort</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
