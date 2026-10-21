import React from 'react';
import { Star } from 'lucide-react';
import { CLINIC_INFO } from '../data/clinicData';

export const TestimonialsSection: React.FC = () => {
  const reviews = [
    {
      id: 'rev-1',
      name: 'Muhammad Amir Ali',
      initials: 'MA',
      treatment: 'Phonak Lumity Digital Fitting',
      quote:
        '“Stands out for professionalism and patient-focused care... top-quality solutions like Phonak. The difference in clarity within social gatherings has been life-changing.”',
      stars: 5,
    },
    {
      id: 'rev-2',
      name: 'Ashuu Butt',
      initials: 'AB',
      treatment: 'Diagnostic Audiology Patient',
      quote:
        '“The Doctor was very professional and the staff was also very good. Highly recommended for accurate hearing tests in Lahore.”',
      stars: 5,
    },
    {
      id: 'rev-3',
      name: 'Tariq Mehmood',
      initials: 'TM',
      treatment: 'Gulberg Clinic Consultation',
      quote:
        '“Very clean clinic on MM Alam Road. Valet parking was easy and the soundproof testing room is truly world class.”',
      stars: 5,
    },
  ];

  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-heading"
      className="w-full py-16 bg-white/60 border-y border-slate-200/70 relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Google Trust Header Banner */}
        <div className="flex flex-col items-center text-center gap-3 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-xs">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            <span className="text-xs font-bold text-slate-700 tracking-wide uppercase">Official Google Reviews</span>
          </div>

          <h2
            id="testimonials-heading"
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight"
          >
            Verified {CLINIC_INFO.googleRating} out of 5 stars based on {CLINIC_INFO.totalReviews}+ Google reviews
          </h2>

          <div className="flex items-center gap-1.5 text-amber-500">
            <div className="flex items-center gap-0.5">
              {[...Array(4)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
              <div className="relative w-5 h-5">
                <Star className="w-5 h-5 text-amber-400" />
                <div className="absolute inset-0 overflow-hidden w-[40%]">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                </div>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-700 ml-1">
              ({CLINIC_INFO.googleRating} / 5.0 Google Business Rating)
            </span>
          </div>

          <p className="text-sm text-slate-600 max-w-lg">
            Genuine experiences from patients and families who received diagnostic testing, hearing aid fittings, and speech rehabilitation at our MM Alam Road clinic.
          </p>

          <div className="pt-1">
            <a
              href={CLINIC_INFO.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-teal-700 hover:border-teal-300 shadow-xs transition-colors"
            >
              <span>View All Verified Reviews on Google Maps</span>
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-6 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(rev.stars)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                    <svg className="w-3 h-3 inline" viewBox="0 0 24 24">
                      <path
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                        fill="#0D9488"
                      />
                    </svg>
                    Verified Google Review
                  </span>
                </div>

                <blockquote className="text-sm text-slate-700 leading-relaxed font-normal italic">
                  {rev.quote}
                </blockquote>
              </div>

              <div className="flex items-center gap-3 pt-5 mt-4 border-t border-slate-100">
                <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 font-bold text-sm flex items-center justify-center">
                  {rev.initials}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900 leading-tight">{rev.name}</span>
                  <span className="text-[11px] text-slate-500">{rev.treatment}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
