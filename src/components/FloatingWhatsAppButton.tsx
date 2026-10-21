import React, { useState } from 'react';
import { MessageCircle, X, Clock, MapPin, Send, Check } from 'lucide-react';
import { CLINIC_INFO } from '../data/clinicData';

export const FloatingWhatsAppButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('General Consultation');

  const topics = [
    { label: 'General Inquiry', message: 'Hello Hearing Clinic Lahore, I would like to inquire about your audiology services.' },
    { label: 'Hearing Test (PTA)', message: 'Hello Hearing Clinic, I want to book a Pure Tone Audiometry (PTA) hearing test.' },
    { label: 'Hearing Aid Pricing', message: 'Hello Hearing Clinic, I would like to know pricing and models for digital hearing aids.' },
    { label: 'Urgent Assessment', message: 'Hello Hearing Clinic, I need an urgent hearing assessment consultation.' },
  ];

  const currentTopic = topics.find((t) => t.label === selectedTopic) || topics[0];
  const whatsAppUrl = `https://wa.me/${CLINIC_INFO.whatsAppNumber}?text=${encodeURIComponent(currentTopic.message)}`;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end">
      {/* Pop-up Quick Chat Card */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="WhatsApp Quick Chat"
          className="mb-3 w-[calc(100vw-2rem)] max-w-sm sm:w-96 rounded-2xl bg-white shadow-2xl border border-[#E5DFD5] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 text-[#1B2928]"
        >
          {/* Card Header */}
          <div className="bg-[#0F3838] p-4 text-[#FAF8F5] flex items-center justify-between border-b border-[#092626]">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-xs">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 border-2 border-[#0F3838]" />
              </div>
              <div>
                <h3 className="font-editorial text-base font-bold leading-tight">
                  Hearing Clinic Reception
                </h3>
                <p className="text-[11px] text-[#25D366] font-medium flex items-center gap-1">
                  <span>●</span> Online • MM Alam Road, Lahore
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
              aria-label="Close WhatsApp chat dialog"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Card Body */}
          <div className="p-4 bg-[#FAF8F5] space-y-3.5 text-xs">
            {/* Agent Welcome Bubble */}
            <div className="bg-white p-3 rounded-xl rounded-tl-none border border-[#E5DFD5] shadow-2xs space-y-1">
              <p className="text-[#1B2928] font-medium leading-relaxed">
                Assalam-o-Alaikum! Welcome to Hearing Clinic Lahore. How can our audiology team assist you today?
              </p>
              <span className="block text-[10px] text-[#556B69] text-right">
                Direct Line: {CLINIC_INFO.phone}
              </span>
            </div>

            {/* Quick Topic Selector */}
            <div className="space-y-1.5">
              <span className="block text-[11px] font-bold text-[#556B69] uppercase tracking-wider">
                Select your inquiry topic:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {topics.map((t) => (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => setSelectedTopic(t.label)}
                    className={`p-2 rounded-lg text-left text-[11px] font-medium transition-all border ${
                      selectedTopic === t.label
                        ? 'bg-[#0F3838] text-white border-[#0F3838]'
                        : 'bg-white text-[#1B2928] border-[#E5DFD5] hover:bg-[#F3EEE7]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Preview */}
            <div className="bg-[#F3EEE7] p-2.5 rounded-lg border border-[#EDE8E1] text-[11px] text-[#556B69]">
              <span className="font-semibold text-[#1B2928]">Message preview: </span>
              "{currentTopic.message}"
            </div>

            {/* Direct Open WhatsApp Button */}
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm shadow-md transition-all active:scale-[0.99]"
            >
              <MessageCircle className="h-5 w-5 fill-current" />
              <span>Start WhatsApp Chat</span>
            </a>

            <div className="text-center text-[10px] text-[#556B69] flex items-center justify-center gap-2">
              <Clock className="h-3 w-3 text-[#0F3838]" />
              <span>Mon – Sat: 10:00 AM – 7:00 PM PKT</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        type="button"
        id="whatsapp-floating-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white p-3.5 sm:px-5 sm:py-3.5 shadow-xl hover:shadow-2xl transition-all duration-200 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
        aria-label={isOpen ? 'Close WhatsApp inquiry window' : 'Chat with Hearing Clinic on WhatsApp'}
      >
        {/* Pulsing Accent Glow */}
        <span className="absolute -inset-0.5 rounded-full bg-[#25D366] opacity-40 group-hover:opacity-70 blur-xs animate-ping" />

        <div className="relative flex items-center gap-2.5">
          <MessageCircle className="h-6 w-6 fill-current text-white shrink-0" />
          <span className="hidden sm:inline font-bold text-sm tracking-wide">
            Chat on WhatsApp
          </span>
        </div>
      </button>
    </div>
  );
};
