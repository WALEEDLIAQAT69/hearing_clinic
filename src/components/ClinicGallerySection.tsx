import React, { useState } from 'react';
import { Camera, ShieldCheck, Activity, Wrench, Eye, Smile, HeartHandshake, ZoomIn, CheckCircle2 } from 'lucide-react';
import { CLINIC_GALLERY } from '../data/clinicData';
import { GalleryItem } from '../types';

interface ClinicGallerySectionProps {
  lang?: 'en' | 'ur';
}

export const ClinicGallerySection: React.FC<ClinicGallerySectionProps> = () => {
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

  const getIcon = (name: string) => {
    switch (name) {
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-teal-600" />;
      case 'Activity': return <Activity className="w-5 h-5 text-teal-600" />;
      case 'Wrench': return <Wrench className="w-5 h-5 text-teal-600" />;
      case 'Eye': return <Eye className="w-5 h-5 text-teal-600" />;
      case 'Smile': return <Smile className="w-5 h-5 text-teal-600" />;
      case 'HeartHandshake': return <HeartHandshake className="w-5 h-5 text-teal-600" />;
      default: return <Camera className="w-5 h-5 text-teal-600" />;
    }
  };

  return (
    <section id="gallery" className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-3">
            <Camera className="w-3.5 h-3.5 text-teal-600" />
            Clinical Facilities &amp; Technology Tour
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Hospital-Grade Acoustic Environment &amp; Diagnostic Suites
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            Take a virtual walkthrough of our soundproof audiometric suites, computerized clinical analyzers, and in-house 3D earmold laboratory on MM Alam Road, Gulberg III, Lahore.
          </p>
        </div>

        {/* Gallery Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CLINIC_GALLERY.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveItem(item)}
              className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                    {getIcon(item.iconName)}
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                    {item.category}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors leading-snug">
                  {item.title}
                </h3>

                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  {item.equipmentBrand}
                </span>
                <span className="text-teal-700 font-bold inline-flex items-center gap-1 group-hover:underline">
                  <ZoomIn className="w-3.5 h-3.5" />
                  Details
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Lightbox Modal */}
      {activeItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setActiveItem(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center">
                {getIcon(activeItem.iconName)}
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                {activeItem.category}
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {activeItem.title}
            </h3>

            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              {activeItem.description}
            </p>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1.5 mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span><strong>Calibrated Brand:</strong> {activeItem.equipmentBrand}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span><strong>Location:</strong> 83A Gulberg III, MM Alam Road, Lahore</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span><strong>Standards:</strong> ISO Acoustic Isolation &amp; British Health Authority Calibration</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setActiveItem(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
