import React, { useState } from 'react';
import { Award, GraduationCap, Clock, Stethoscope, Languages, ArrowRight, CheckCircle2 } from 'lucide-react';
import { CLINIC_TEAM } from '../data/clinicData';
import { TeamMember } from '../types';

interface TeamSectionProps {
  onConsultDoctor?: (doctorName: string) => void;
  lang?: 'en' | 'ur';
}

export const TeamSection: React.FC<TeamSectionProps> = ({ onConsultDoctor }) => {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  return (
    <section id="team" className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-3">
            <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
            Clinical Leadership &amp; Specialists
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Dedicated Audiologists &amp; Hearing Specialists
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            Our British &amp; Australian trained audiologists and acoustic engineers bring over three decades of hospital-grade precision to every hearing evaluation.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {CLINIC_TEAM.map((member) => (
            <div
              key={member.id}
              className="bg-slate-50 rounded-2xl border border-slate-200/80 overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300 group"
            >
              <div className="relative h-64 bg-slate-200 overflow-hidden">
                <img
                  src={member.image}
                  alt={`${member.name} - ${member.role} at Hearing Clinic Lahore`}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-teal-600/90 text-[11px] font-semibold tracking-wide">
                    <Clock className="w-3.5 h-3.5" />
                    {member.experienceYears}+ Years Experience
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1 leading-snug">
                    {member.name}
                  </h3>
                  <p className="text-xs text-teal-200 font-medium">{member.role}</p>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start gap-2 mb-3">
                    <GraduationCap className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-700 font-medium leading-relaxed">
                      {member.credentials}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                    {member.bio}
                  </p>

                  <div className="space-y-1.5 mb-4">
                    <p className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                      Key Specialties:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {member.specialties.slice(0, 2).map((s, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center text-[10px] bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-medium"
                        >
                          {s}
                        </span>
                      ))}
                      {member.specialties.length > 2 && (
                        <span className="text-[10px] text-teal-700 font-semibold px-1 py-0.5">
                          +{member.specialties.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMember(member)}
                    className="text-xs font-semibold text-slate-600 hover:text-teal-700 transition-colors"
                  >
                    Full Bio
                  </button>

                  <button
                    type="button"
                    onClick={() => onConsultDoctor && onConsultDoctor(member.name)}
                    className="inline-flex items-center gap-1 text-xs font-semibold bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700 transition shadow-sm"
                  >
                    <span>Consult</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Doctor Bio Modal */}
      {selectedMember && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <img
                src={selectedMember.image}
                alt={`${selectedMember.name} - ${selectedMember.role} clinical portrait`}
                className="w-20 h-20 rounded-xl object-cover shadow-md shrink-0 border border-slate-200"
              />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900">
                  {selectedMember.name}
                </h3>
                <p className="text-sm font-semibold text-teal-700">{selectedMember.role}</p>
                <p className="text-xs text-slate-500 mt-1">{selectedMember.credentials}</p>
              </div>
            </div>

            <div className="mt-6 space-y-4 text-sm text-slate-700 leading-relaxed border-t border-slate-100 pt-4">
              <p>{selectedMember.bio}</p>

              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
                  Clinical Specialties & Focus Areas
                </h4>
                <ul className="space-y-1.5">
                  {selectedMember.specialties.map((spec, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <Languages className="w-4 h-4 text-teal-600 shrink-0" />
                <span>
                  <strong>Consultation Languages:</strong> {selectedMember.languages.join(', ')}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const name = selectedMember.name;
                  setSelectedMember(null);
                  if (onConsultDoctor) onConsultDoctor(name);
                }}
                className="px-5 py-2 text-sm font-semibold bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition shadow"
              >
                Book Appointment with {selectedMember.name.split(' ')[0]}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
