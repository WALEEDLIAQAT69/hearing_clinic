import React, { useState, useEffect } from 'react';
import { Phone, MapPin, Menu, X, User, Ear, Mail, Clock, Sparkles, Calendar, MessageCircle, Globe } from 'lucide-react';
import { CLINIC_INFO, UI_STRINGS } from '../data/clinicData';
import { getClinicCurrentStatus } from '../utils/clinicHelpers';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onOpenPortal?: () => void;
  lang?: 'en' | 'ur';
  onToggleLang?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  activeSection, 
  onNavigate, 
  onOpenPortal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [clinicStatus, setClinicStatus] = useState(getClinicCurrentStatus());

  const t = UI_STRINGS;

  useEffect(() => {
    const interval = setInterval(() => {
      setClinicStatus(getClinicCurrentStatus());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close mobile menu on Escape key press
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const navLinks = [
    { id: 'hero', label: t.navHome },
    { id: 'services', label: t.navServices },
    { id: 'team', label: 'Team' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'articles', label: 'Guides' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'faqs', label: t.navFaqs },
    { id: 'contact', label: t.navContact },
  ];

  const handleLinkClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 px-4 sm:px-6 lg:px-8 pt-2 pointer-events-none">
      <div className="max-w-7xl mx-auto pointer-events-auto space-y-1.5">
        {/* Top Info Ribbon: Email, Operating Hours, Senior Screening Offer */}
        <div className="hidden sm:flex items-center justify-between px-4 py-1.5 rounded-xl bg-slate-900/90 text-white backdrop-blur-md border border-slate-800 text-[11px] shadow-sm">
          <div className="flex items-center gap-4">
            <a
              href="mailto:info@hearingclinic.com.pk"
              className="flex items-center gap-1.5 text-slate-300 hover:text-teal-300 transition-colors"
            >
              <Mail className="w-3 h-3 text-teal-400" />
              <span>info@hearingclinic.com.pk</span>
            </a>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3 h-3 text-teal-400" />
              <span>Mon - Sat: 10:00 AM - 7:00 PM</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-amber-300 font-medium">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Free Hearing Screening for Seniors (65+)</span>
            </span>
            <span className="text-slate-400">|</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${clinicStatus.isOpen ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className="text-slate-300 font-medium">{clinicStatus.statusText}</span>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="h-16 sm:h-20 px-3 sm:px-6 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-[0_4px_25px_-5px_rgba(15,23,42,0.06)] flex items-center justify-between gap-2 sm:gap-4">
          {/* Clinic Brand Identity */}
          <a
            href="#hero"
            onClick={(e) => handleLinkClick(e, 'hero')}
            className="flex items-center gap-2 sm:gap-3 shrink-0 group focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600 rounded-xl min-h-[44px]"
            aria-label="Hearing Clinic - Home"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-600/10 border border-teal-600/20 flex items-center justify-center text-teal-700 shadow-xs group-hover:bg-teal-600 group-hover:text-white transition-all shrink-0">
              <Ear className="w-4.5 h-4.5 sm:w-5 sm:h-5" aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[15px] sm:text-[18px] text-slate-900 tracking-tight leading-tight group-hover:text-teal-700 transition-colors">
                Hearing Clinic
              </span>
              <span className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-wider text-teal-700 leading-tight">
                Lahore • Est. 1992
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav aria-label="Primary Navigation" className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;

              return (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={(e) => handleLinkClick(e, link.id)}
                  className={`font-medium text-[13px] px-3 py-1.5 rounded-xl transition-all ${
                    isActive
                      ? 'text-teal-800 font-semibold bg-teal-50/80 border border-teal-200/60 flex items-center gap-1.5 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />}
                  <span>{link.label}</span>
                </a>
              );
            })}
          </nav>

          {/* Action Buttons & Staff Desk Trigger */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* PWA App Install Button */}
            <div className="hidden sm:block">
              <PWAInstallButton />
            </div>

            {/* Quick Dial Phone (Desktop & Tablet) */}
            <a
              href={`tel:${CLINIC_INFO.phoneClean}`}
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-teal-500/50 text-slate-700 hover:text-teal-800 transition-all shadow-xs text-xs font-semibold tracking-wide min-h-[40px]"
              aria-label="Call Hearing Clinic at 0321 4190400"
            >
              <Phone className="w-3.5 h-3.5 text-teal-600" />
              <span>0321 4190400</span>
            </a>

            {/* Quick Phone Call Icon on small mobile */}
            <a
              href={`tel:${CLINIC_INFO.phoneClean}`}
              className="md:hidden w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-teal-700 hover:bg-teal-50 transition-colors min-h-[40px] min-w-[40px]"
              aria-label="Call clinic now"
            >
              <Phone className="w-4 h-4" />
            </a>

            {/* Book Appointment CTA (Full text on sm+, compact on mobile) */}
            <button
              type="button"
              onClick={() => onNavigate('contact')}
              className="hidden sm:inline-flex items-center justify-center px-3.5 py-2 rounded-xl bg-teal-600 text-white font-semibold text-xs sm:text-sm shadow-sm hover:bg-teal-700 hover:shadow-md transition-all active:scale-[0.98] min-h-[40px]"
            >
              {t.bookConsultation}
            </button>

            {/* Compact Book Button for small phones */}
            <button
              type="button"
              onClick={() => onNavigate('contact')}
              className="sm:hidden inline-flex items-center justify-center px-2.5 py-1.5 rounded-xl bg-teal-600 text-white font-semibold text-xs shadow-xs hover:bg-teal-700 transition-all min-h-[40px]"
            >
              Book
            </button>

            {/* Staff Desk / Profile Trigger (Discreet Reception Portal - Desktop/Tablet) */}
            <button
              type="button"
              onClick={onOpenPortal}
              title="Clinic Staff & Receptionist Desk (Ctrl+Shift+A)"
              className="hidden sm:flex w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 border border-slate-200 items-center justify-center shrink-0 text-slate-600 hover:text-teal-700 hover:border-teal-400 hover:bg-teal-50/50 transition-all min-h-[36px] min-w-[36px]"
              aria-label="Open Clinic Staff Reception Desk"
            >
              <User className="w-4 h-4" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors min-h-[40px] min-w-[40px]"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden p-4 rounded-2xl bg-white/98 backdrop-blur-xl border border-slate-200 shadow-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-150 max-h-[calc(100dvh-5.5rem)] overflow-y-auto">
            {/* Status Strip on Mobile */}
            <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl border border-slate-100 text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                <span className={`w-2 h-2 rounded-full ${clinicStatus.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                {clinicStatus.statusText}
              </span>
              <span className="text-slate-500 text-[11px]">{clinicStatus.nextEventText}</span>
            </div>

            {/* Senior Screening Banner on Mobile */}
            <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900 font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Free Hearing Screening for Seniors 65+</span>
            </div>

            {/* Navigation links with comfortable 44px touch targets */}
            <div className="space-y-1">
              {navLinks.map((link) => {
                const isActive = activeSection === link.id;
                return (
                  <a
                    key={link.id}
                    href={`#${link.id}`}
                    onClick={(e) => handleLinkClick(e, link.id)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${
                      isActive
                        ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200/60'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-teal-700'
                    }`}
                  >
                    <span>{link.label}</span>
                    {isActive && <span className="w-2 h-2 rounded-full bg-teal-600" />}
                  </a>
                );
              })}
            </div>

            {/* Primary Action Buttons in Mobile Drawer */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <button
                type="button"
                onClick={(e) => handleLinkClick(e, 'contact')}
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors min-h-[44px]"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Appointment Consultation</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`tel:${CLINIC_INFO.phoneClean}`}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors min-h-[44px]"
                >
                  <Phone className="w-3.5 h-3.5 text-teal-600" />
                  <span>Call Reception</span>
                </a>
                <a
                  href={`https://wa.me/${CLINIC_INFO.whatsAppNumber}?text=${encodeURIComponent('Hello Hearing Clinic Lahore, I would like to inquire about audiology services.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors min-h-[44px]"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  <span>WhatsApp</span>
                </a>
              </div>

              {/* Clickable Email */}
              <a
                href={`mailto:${CLINIC_INFO.email}`}
                className="w-full py-2.5 px-3 rounded-xl bg-teal-50/70 border border-teal-100 text-teal-900 text-xs font-semibold flex items-center justify-center gap-2 transition-colors min-h-[44px]"
              >
                <Mail className="w-3.5 h-3.5 text-teal-700" />
                <span>{CLINIC_INFO.email}</span>
              </a>

              {/* PWA Install & Staff Portal Link in Drawer */}
              <div className="flex flex-col gap-2 pt-1">
                <div className="w-full flex items-center justify-center">
                  <PWAInstallButton />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenPortal?.();
                  }}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 text-slate-600 hover:text-teal-700 text-xs font-medium flex items-center justify-center gap-2 transition-colors min-h-[40px]"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Staff &amp; Reception Desk</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

