import React, { useState } from 'react';
import { ShieldCheck, Award, CheckCircle2, BatteryCharging, Droplets, Volume2, Sparkles, Filter } from 'lucide-react';
import { CLINIC_BRANDS, HEARING_AID_PRODUCTS } from '../data/clinicData';

interface BrandsSectionProps {
  onSelectProductForTrial?: (productName: string) => void;
}

export const BrandsSection: React.FC<BrandsSectionProps> = ({ onSelectProductForTrial }) => {
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('all');
  const hearingAidBrands = (CLINIC_BRANDS || []).filter((b) => b.category === 'hearing-aids');
  const diagnosticBrands = (CLINIC_BRANDS || []).filter((b) => b.category === 'diagnostic-equipment');

  const filteredProducts = (HEARING_AID_PRODUCTS || []).filter((p) => {
    if (selectedBrandFilter === 'all') return true;
    if (selectedBrandFilter === 'phonak') return p.brand === 'Phonak';
    if (selectedBrandFilter === 'beltone') return p.brand === 'Beltone';
    if (selectedBrandFilter === 'rechargeable') return p.batteryType === 'Rechargeable';
    if (selectedBrandFilter === 'profound') return p.lossLevel.includes('Profound');
    return true;
  });

  return (
    <section
      id="brands"
      aria-labelledby="brands-heading"
      className="py-16 bg-[#F8FAFC] border-b border-slate-200/70"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 block mb-2">
            Manufacturers, Products &amp; Distribution
          </span>
          <h2
            id="brands-heading"
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight"
          >
            World-class acoustic engineering, Phonak &amp; Beltone hearing systems.
          </h2>
          <p className="mt-4 text-base text-slate-600 leading-relaxed">
            We partner exclusively with leading manufacturers from Switzerland, Germany, Denmark, the UK, and the USA. Our patients receive genuine international warranty support and authentic clinical software programming.
          </p>
        </div>

        {/* Category 1: Digital Hearing Aid Brands */}
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-6">
            <Award className="h-5 w-5 text-teal-700" aria-hidden="true" />
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
              Authorized Manufacturer Partners
            </h3>
            <span className="text-xs text-slate-500 ml-2 hidden sm:inline">
              (RIC, BTE, ITE, ITC, and Titanium Invisible formats)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {hearingAidBrands.map((brand) => (
              <div
                key={brand.name}
                className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md p-6 shadow-xs hover:shadow-md hover:border-teal-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                      {brand.origin}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 border border-teal-100 text-teal-800">
                      Authorized Dispenser
                    </span>
                  </div>

                  <h4 className="text-xl font-bold text-slate-900">
                    {brand.name}
                  </h4>

                  <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {brand.description}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" aria-hidden="true" />
                  <span>Genuine manufacturer warranty</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category 2: Real Hearing Aid Models from Old Site */}
        <div className="mt-16 pt-12 border-t border-slate-200/80">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/70 text-teal-800 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>Phonak &amp; Beltone Flagship Catalog</span>
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">
                Explore Available Hearing Aid Models
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Custom-fit and programmed in our Lahore laboratory with official factory guarantees.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1.5 self-start md:self-auto">
              {[
                { id: 'all', label: 'All Models' },
                { id: 'phonak', label: 'Phonak Swiss' },
                { id: 'beltone', label: 'Beltone Danish' },
                { id: 'rechargeable', label: 'Rechargeable' },
                { id: 'profound', label: 'Severe-to-Profound' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedBrandFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    selectedBrandFilter === f.id
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:border-teal-400 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Real Official Product Photography */}
                  <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-50 border border-slate-100 mb-4 flex items-center justify-center">
                    <img
                      src={product.image}
                      alt={`${product.name} - official ${product.brand} hearing aid device`}
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        // graceful fallback if image fails
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/90 backdrop-blur-xs text-slate-700 shadow-xs border border-slate-200/60">
                        {product.brand}
                      </span>
                    </div>
                    {product.badge && (
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/90 text-white shadow-xs">
                          {product.badge}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">
                      {product.series}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-slate-900 text-base leading-snug">
                    {product.name}
                  </h4>

                  <span className="inline-block mt-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                    {product.style}
                  </span>

                  <p className="mt-3 text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {product.description}
                  </p>

                  <div className="mt-4 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Key Highlights:
                    </span>
                    <ul className="space-y-1">
                      {product.keyFeatures.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                          <CheckCircle2 className="w-3 h-3 text-teal-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium flex items-center gap-1">
                    <BatteryCharging className="w-3.5 h-3.5 text-teal-600" />
                    {product.batteryType}
                  </span>
                  <a
                    href="#contact"
                    className="font-bold text-teal-700 hover:text-teal-900 hover:underline"
                  >
                    Inquire / Trial &rarr;
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category 3: Sole Distributor Diagnostic Equipment Banner & Cards */}
        <div className="mt-16 rounded-3xl border border-teal-200/80 bg-white/80 backdrop-blur-md p-8 sm:p-10 shadow-sm">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-xs font-bold mb-3">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              <span>Official Pakistan Sole Distribution</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Diagnostic Audiometry &amp; Tympanometry Equipment
            </h3>
            <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
              Hearing Clinic is the exclusive sole distributor in Pakistan for clinical assessment equipment from Natus/Otometrics and Amplivox UK. We equip healthcare providers, ENT specialists, and audiology departments with certified diagnostic hardware and local calibration services.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {diagnosticBrands.map((brand) => (
              <div
                key={brand.name}
                className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                      {brand.origin}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 border border-slate-200 text-slate-700">
                      Sole Distributor
                    </span>
                  </div>

                  <h4 className="text-xl font-bold text-slate-900">
                    {brand.name}
                  </h4>

                  <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
                    {brand.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700">
                  <span className="font-medium">Audiometers • Tymps • Sound Booths</span>
                  <span className="text-teal-700 font-semibold">Institutional Supply &amp; Calibration</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

