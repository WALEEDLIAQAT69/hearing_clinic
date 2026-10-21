import React from 'react';
import { Award, ShieldCheck, Stethoscope, Building2 } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="py-16 bg-[#F8FAFC] border-b border-slate-200/70"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 block mb-2">
            Clinical Heritage &amp; Authority
          </span>
          <h2
            id="about-heading"
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight"
          >
            Pioneering audiological care and diagnostic standards in Pakistan since 1992.
          </h2>
        </div>

        {/* Narrative Grid */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Left Column: Clinical Mission & Background */}
          <div className="lg:col-span-7 space-y-6 text-base text-slate-600 leading-relaxed">
            <p className="text-lg text-slate-900 font-medium leading-relaxed">
              Founded in 1992 in Lahore, Hearing Clinic has spent over 30 years helping individuals reconnect with the sounds of their family, work, and community. Located at 83A, B III on MM Alam Road in Gulberg III, our facility operates with an uncompromising commitment to clinical precision.
            </p>
            <p>
              We believe accurate hearing rehabilitation begins with exact diagnostics. Rather than simply selling off-the-shelf devices, our qualified audiologists perform comprehensive pure tone and speech audiometry in calibrated acoustic environments to map each patient’s unique auditory threshold before recommending any intervention.
            </p>
            <p>
              Our dispensary offers advanced digital hearing instruments from the world’s most respected acoustic engineering houses: <strong className="text-slate-900">Phonak</strong> (Switzerland), <strong className="text-slate-900">Signia</strong> (Germany), <strong className="text-slate-900">A&amp;M</strong> (Germany), and <strong className="text-slate-900">Beltone</strong> (USA/Denmark). Every unit is custom-fitted to the patient’s ear anatomy and programmed using computer-driven acoustic curves.
            </p>

            {/* Diagnostic Sole Distribution Feature Callout */}
            <div className="mt-8 rounded-2xl border border-teal-200/80 bg-white/90 backdrop-blur-md p-6 sm:p-7 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-teal-700">
                <ShieldCheck className="h-5 w-5 shrink-0" aria-hidden="true" />
                <h3 className="font-bold text-slate-900 text-base">
                  Sole Distributor for Pakistan: Natus/Otometrics &amp; Amplivox UK
                </h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Beyond clinical patient consultations, Hearing Clinic is the authorized sole distributor in Pakistan for Natus/Otometrics and Amplivox UK. We supply certified clinical audiometers, tympanometers, acoustic sound booths, and vestibular assessment equipment to tertiary hospitals, ENT departments, and research institutions nationwide.
              </p>
            </div>
          </div>

          {/* Right Column: Pillars of Practice */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md p-6 shadow-xs hover:shadow-sm transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center">
                  <Stethoscope className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Evidence-Based Diagnostics
                </h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                We utilize calibrated British and Danish instrumentation to evaluate middle ear compliance, acoustic reflexes, bone conduction, and word recognition scores without guesswork.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md p-6 shadow-xs hover:shadow-sm transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center">
                  <Award className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Unbiased Brand Selection
                </h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                As an authorized multi-brand dispenser, we match patients with the ideal acoustic platform (Phonak, Signia, Beltone, or A&amp;M) based on audiogram severity, lifestyle, ear anatomy, and budget.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md p-6 shadow-xs hover:shadow-sm transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center">
                  <Building2 className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Dedicated Pediatric Care
                </h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Early childhood hearing health demands specialized care. Our pediatric speech therapy and cochlear implant referral protocols ensure developmental milestones are protected.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
