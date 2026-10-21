import React from 'react';
import { Phone, MessageSquare, Calendar } from 'lucide-react';
import { CLINIC_INFO } from '../data/clinicData';

interface StickyMobileBarProps {
  onOpenBooking: () => void;
  lang?: 'en' | 'ur';
}

export const StickyMobileBar: React.FC<StickyMobileBarProps> = ({ onOpenBooking }) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 shadow-lg safe-bottom">
      <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
        {/* Direct Call */}
        <a
          href={`tel:${CLINIC_INFO.phoneClean}`}
          className="flex flex-col items-center justify-center py-1.5 px-2 rounded-xl bg-slate-100 active:bg-slate-200 text-slate-800 transition"
        >
          <Phone className="w-4 h-4 text-teal-700" />
          <span className="text-[10px] font-bold mt-0.5">
            Call Now
          </span>
        </a>

        {/* WhatsApp Chat */}
        <a
          href={`https://wa.me/923214190400?text=${encodeURIComponent('Hello Hearing Clinic, I would like to inquire about hearing tests / hearing aids.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center py-1.5 px-2 rounded-xl bg-[#25D366]/10 active:bg-[#25D366]/20 text-[#128C7E] transition border border-[#25D366]/20"
        >
          <MessageSquare className="w-4 h-4 text-[#25D366]" />
          <span className="text-[10px] font-bold mt-0.5">WhatsApp</span>
        </a>

        {/* Book Appointment */}
        <button
          type="button"
          onClick={onOpenBooking}
          className="flex flex-col items-center justify-center py-1.5 px-2 rounded-xl bg-teal-600 active:bg-teal-700 text-white transition shadow-sm"
        >
          <Calendar className="w-4 h-4" />
          <span className="text-[10px] font-bold mt-0.5">
            Book Test
          </span>
        </button>
      </div>
    </div>
  );
};
