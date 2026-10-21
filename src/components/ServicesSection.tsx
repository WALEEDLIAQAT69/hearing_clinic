import React, { useState } from 'react';
import { 
  Activity, 
  Ear, 
  Volume2, 
  GitPullRequest, 
  AudioLines, 
  Smile, 
  Clock, 
  CheckCircle, 
  ChevronRight, 
  Info,
  Calendar,
  Brain,
  BellOff
} from 'lucide-react';
import { CLINIC_SERVICES, FORMAT_OPTIONS } from '../data/clinicData';

interface ServicesSectionProps {
  onSelectService: (serviceId: string) => void;
  onViewServiceDetails?: (service: any) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ 
  onSelectService,
  onViewServiceDetails 
}) => {
  const [selectedServiceId, setSelectedServiceId] = useState<string>(CLINIC_SERVICES[0]?.id || 'pure-tone-audiometry');
  const [activeFormatTab, setActiveFormatTab] = useState<string>('RIC');

  const selectedService = CLINIC_SERVICES.find((s) => s.id === selectedServiceId) || CLINIC_SERVICES[0];

  const getServiceIcon = (id: string) => {
    switch (id) {
      case 'pure-tone-audiometry':
        return <Activity className="h-5 w-5 text-teal-700" aria-hidden="true" />;
      case 'bera-abr-assr':
        return <Brain className="h-5 w-5 text-teal-700" aria-hidden="true" />;
      case 'speech-audiometry':
        return <Volume2 className="h-5 w-5 text-teal-700" aria-hidden="true" />;
      case 'hearing-aid-fitting':
        return <Ear className="h-5 w-5 text-teal-700" aria-hidden="true" />;
      case 'tinnitus-therapy':
        return <BellOff className="h-5 w-5 text-teal-700" aria-hidden="true" />;
      case 'cochlear-implant-referrals':
        return <GitPullRequest className="h-5 w-5 text-teal-700" aria-hidden="true" />;
      case 'tympanometry':
        return <AudioLines className="h-5 w-5 text-teal-700" aria-hidden="true" />;
      case 'speech-therapy-kids':
        return <Smile className="h-5 w-5 text-teal-700" aria-hidden="true" />;
      default:
        return <Activity className="h-5 w-5 text-teal-700" aria-hidden="true" />;
    }
  };

  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="py-16 bg-[#F8FAFC] border-b border-slate-200/70"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-slate-200/80">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 block mb-2">
              Clinical Audiological Services
            </span>
            <h2
              id="services-heading"
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight"
            >
              Comprehensive diagnostic, rehabilitative, and therapeutic care.
            </h2>
          </div>
          <p className="text-sm sm:text-base text-slate-600 max-w-md">
            All audiological assessments are performed with calibrated diagnostic instruments meeting international acoustic standards.
          </p>
        </div>

        {/* 6 Services Grid */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(CLINIC_SERVICES || []).map((service) => {
            const isSelected = service.id === selectedServiceId;
            return (
              <div
                key={service.id}
                onClick={() => setSelectedServiceId(service.id)}
                className={`group cursor-pointer rounded-2xl p-6 transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'border-2 border-teal-600 bg-white shadow-md'
                    : 'border border-slate-200/80 bg-white/80 hover:bg-white hover:border-teal-300 hover:shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center">
                      {getServiceIcon(service.id)}
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      ~{service.durationMinutes} mins
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                    {service.name}
                  </h3>

                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    {service.shortDescription}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-teal-700">
                  <span>{isSelected ? 'Active Protocol Selected' : 'View Clinical Protocol'}</span>
                  <ChevronRight
                    className={`h-4 w-4 transition-transform ${isSelected ? 'rotate-90 text-teal-700' : 'group-hover:translate-x-1 text-slate-400'}`}
                    aria-hidden="true"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Service Clinical Protocol Detail Card */}
        {selectedService && (
          <div className="mt-10 rounded-2xl border border-teal-200/80 bg-white/95 backdrop-blur-md p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
                  {getServiceIcon(selectedService.id)}
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-700 block">
                    Clinical Examination Protocol
                  </span>
                  <h3 className="text-lg sm:text-2xl font-extrabold text-slate-900">
                    {selectedService.name}
                  </h3>
                </div>
              </div>

              <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                {onViewServiceDetails && (
                  <button
                    type="button"
                    onClick={() => onViewServiceDetails(selectedService)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition-all min-h-[44px]"
                  >
                    <Info className="h-4 w-4 text-teal-600" aria-hidden="true" />
                    <span>Protocol &amp; Prep Guide</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onSelectService(selectedService.id)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-teal-600 text-white font-semibold text-xs sm:text-sm hover:bg-teal-700 shadow-sm transition-all active:scale-[0.98] min-h-[44px]"
                >
                  <Calendar className="h-4 w-4 text-white" aria-hidden="true" />
                  <span>Book This Service</span>
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 text-sm">
              <div className="lg:col-span-7 space-y-4">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1.5">
                    Clinical Assessment Method
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    {selectedService.clinicalDetails}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1.5">
                    Ideal Candidate / Indications
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    {selectedService.suitableFor}
                  </p>
                </div>

                {selectedService.equipmentOrFormat && (
                  <div className="flex items-center gap-2 pt-2 text-xs text-slate-700 font-medium">
                    <Info className="h-4 w-4 text-teal-600 shrink-0" aria-hidden="true" />
                    <span>Instrumentation / Protocol: {selectedService.equipmentOrFormat}</span>
                  </div>
                )}
              </div>

              {/* Special Format Breakdown for Hearing Aid Fitting */}
              {selectedService.id === 'hearing-aid-fitting' ? (
                <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block mb-3">
                    Available Digital Form Factors:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                    {FORMAT_OPTIONS.map((f) => (
                      <button
                        key={f.code}
                        type="button"
                        onClick={() => setActiveFormatTab(f.code)}
                        className={`py-2 px-2 text-xs font-bold rounded-lg transition-colors min-h-[40px] flex items-center justify-center ${
                          activeFormatTab === f.code
                            ? 'bg-teal-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {f.code}
                      </button>
                    ))}
                  </div>
                  {(() => {
                    const activeF = FORMAT_OPTIONS.find((f) => f.code === activeFormatTab) || FORMAT_OPTIONS[2];
                    return (
                      <div className="space-y-1.5 bg-white border border-slate-200/80 rounded-lg p-3 sm:p-3.5">
                        <span className="font-bold text-slate-900 text-sm block">
                          {activeF.code} ({activeF.name})
                        </span>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {activeF.summary}
                        </p>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                    Appointment Highlights
                  </span>
                  <ul className="space-y-2.5 text-xs text-slate-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-teal-600" aria-hidden="true" />
                      <span>Duration: Approx. {selectedService.durationMinutes} minutes</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-teal-600" aria-hidden="true" />
                      <span>Same-day printed report and audiogram provided</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-teal-600" aria-hidden="true" />
                      <span>Conducted in sound-treated European testing suite</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
