import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { ServicesSection } from './components/ServicesSection';
import { BrandsSection } from './components/BrandsSection';
import { AlaSamatPriceGuide } from './components/AlaSamatPriceGuide';
import { FaqSection } from './components/FaqSection';
import { LocationHoursSection } from './components/LocationHoursSection';
import { AmenitiesSection } from './components/AmenitiesSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { CallToActionBanner } from './components/CallToActionBanner';
import { ContactAppointmentForm } from './components/ContactAppointmentForm';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NotFoundState } from './components/NotFoundState';
import { StaffAppointmentsPortal } from './components/StaffAppointmentsPortal';
import { FloatingWhatsAppButton } from './components/FloatingWhatsAppButton';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { TermsConditionsModal } from './components/TermsConditionsModal';
import { CookiePolicyModal } from './components/CookiePolicyModal';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { OfflineBanner } from './components/OfflineBanner';
import { TeamSection } from './components/TeamSection';
import { HealthArticlesSection } from './components/HealthArticlesSection';
import { ClinicGallerySection } from './components/ClinicGallerySection';
import { ServiceDetailModal } from './components/ServiceDetailModal';
import { AccessibilityStatementModal } from './components/AccessibilityStatementModal';
import { BookingConfirmationModal } from './components/BookingConfirmationModal';
import { StickyMobileBar } from './components/StickyMobileBar';
import { BackToTopButton } from './components/BackToTopButton';
import { ClinicService } from './types';

export default function App() {
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<string>('pure-tone-audiometry');
  const [is404, setIs404] = useState<boolean>(false);
  const [isPortalOpen, setIsPortalOpen] = useState<boolean>(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState<boolean>(false);
  const [isTermsOpen, setIsTermsOpen] = useState<boolean>(false);
  const [isCookiePolicyOpen, setIsCookiePolicyOpen] = useState<boolean>(false);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState<boolean>(false);

  // Modals for deep content
  const [selectedServiceForModal, setSelectedServiceForModal] = useState<ClinicService | null>(null);
  const [confirmationData, setConfirmationData] = useState<{
    isOpen: boolean;
    bookingRef: string;
    patientName: string;
    service: string;
    date: string;
  }>({
    isOpen: false,
    bookingRef: '',
    patientName: '',
    service: '',
    date: '',
  });

  // Language state (English / Urdu)
  const [lang, setLang] = useState<'en' | 'ur'>(() => {
    try {
      return (localStorage.getItem('hc_preferred_lang') as 'en' | 'ur') || 'en';
    } catch {
      return 'en';
    }
  });

  const toggleLanguage = () => {
    setLang((prev) => {
      const next = prev === 'en' ? 'ur' : 'en';
      try {
        localStorage.setItem('hc_preferred_lang', next);
      } catch {}
      return next;
    });
  };

  // Check URL hash for potential 404 test, staff portal, or legal modals
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#404') {
        setIs404(true);
      } else {
        setIs404(false);
      }

      if (
        hash === '#reception' ||
        hash === '#portal' ||
        hash === '#admin' ||
        hash === '#staff'
      ) {
        setIsPortalOpen(true);
      }

      if (hash === '#privacy' || hash === '#privacy-policy') {
        setIsPrivacyOpen(true);
      }

      if (hash === '#terms' || hash === '#terms-and-conditions') {
        setIsTermsOpen(true);
      }

      if (hash === '#cookies' || hash === '#cookie-policy') {
        setIsCookiePolicyOpen(true);
      }

      if (hash === '#accessibility' || hash === '#access') {
        setIsAccessibilityOpen(true);
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);

    // Discrete Staff Desk Shortcut: Ctrl+Shift+A or Cmd+Shift+A
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsPortalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // IntersectionObserver to highlight active navigation link smoothly
  useEffect(() => {
    const sections = [
      'hero',
      'amenities',
      'services',
      'team',
      'brands',
      'pricing',
      'articles',
      'gallery',
      'faqs',
      'about',
      'location',
      'testimonials',
      'contact'
    ];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -40% 0px',
        threshold: [0.25, 0.5],
      }
    );

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [is404]);

  const scrollToSection = (sectionId: string) => {
    if (is404) {
      setIs404(false);
      window.location.hash = sectionId;
    }
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectServiceForBooking = (serviceId: string) => {
    setSelectedServiceForBooking(serviceId);
    scrollToSection('contact');
  };

  if (is404) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
        <Header 
          activeSection={activeSection} 
          onNavigate={scrollToSection} 
          lang={lang}
          onToggleLang={toggleLanguage}
        />
        <main className="flex-1">
          <NotFoundState onReturnHome={() => scrollToSection('hero')} />
        </main>
        <Footer 
          onNavigate={scrollToSection}
          onOpenPrivacyPolicy={() => setIsPrivacyOpen(true)}
          onOpenTerms={() => setIsTermsOpen(true)}
          onOpenCookiePolicy={() => setIsCookiePolicyOpen(true)}
          onOpenAccessibility={() => setIsAccessibilityOpen(true)}
          onOpen404={() => setIs404(true)}
        />
        <PrivacyPolicyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
        <TermsConditionsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
        <CookiePolicyModal isOpen={isCookiePolicyOpen} onClose={() => setIsCookiePolicyOpen(false)} />
        <AccessibilityStatementModal isOpen={isAccessibilityOpen} onClose={() => setIsAccessibilityOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 selection:bg-teal-600 selection:text-white pb-14 sm:pb-0">
      {/* Network Connectivity Offline Alert Banner */}
      <OfflineBanner />

      {/* Skip to Content for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 px-4 py-2 bg-teal-600 text-white rounded-md font-medium text-xs shadow-lg"
      >
        Skip to main audiology content
      </a>

      {/* Floating Header with Call and Navigation */}
      <Header
        activeSection={activeSection}
        onNavigate={scrollToSection}
        onOpenPortal={() => setIsPortalOpen(true)}
        lang={lang}
        onToggleLang={toggleLanguage}
      />

      {/* Main Content Sections wrapped in Error Boundaries */}
      <main id="main-content" className="flex-1 focus:outline-none">
        {/* Hero Section */}
        <ErrorBoundary fallbackTitle="Hero Presentation Unavailable">
          <Hero onBookClick={() => scrollToSection('contact')} />
        </ErrorBoundary>

        {/* Accessibility & Clinic Amenities Section */}
        <ErrorBoundary fallbackTitle="Accessibility Amenities Unavailable">
          <AmenitiesSection />
        </ErrorBoundary>

        {/* Clinical Services Grid */}
        <ErrorBoundary fallbackTitle="Audiology Services Unavailable">
          <ServicesSection 
            onSelectService={handleSelectServiceForBooking}
            onViewServiceDetails={(service) => setSelectedServiceForModal(service)}
          />
        </ErrorBoundary>

        {/* Audiology Team Bios Section */}
        <ErrorBoundary fallbackTitle="Our Audiology Team Unavailable">
          <TeamSection onConsultDoctor={() => scrollToSection('contact')} lang={lang} />
        </ErrorBoundary>

        {/* Brands & Distribution Section */}
        <ErrorBoundary fallbackTitle="Brands Information Unavailable">
          <BrandsSection />
        </ErrorBoundary>

        {/* Ala Samat Transparent Pricing Guide & Advisory */}
        <ErrorBoundary fallbackTitle="Ala Samat Pricing Guide Unavailable">
          <AlaSamatPriceGuide onBookConsultation={() => scrollToSection('contact')} />
        </ErrorBoundary>

        {/* Evidence-based Health Articles & Patient Guides */}
        <ErrorBoundary fallbackTitle="Health Articles Unavailable">
          <HealthArticlesSection 
            onBookService={(serviceId) => handleSelectServiceForBooking(serviceId)} 
            lang={lang} 
          />
        </ErrorBoundary>

        {/* Clinical Facilities & Acoustic Tour Section */}
        <ErrorBoundary fallbackTitle="Clinic Tour Unavailable">
          <ClinicGallerySection lang={lang} />
        </ErrorBoundary>

        {/* Audiology & Clinical FAQs */}
        <ErrorBoundary fallbackTitle="Audiology FAQs Unavailable">
          <FaqSection />
        </ErrorBoundary>

        {/* About & Clinical Heritage Section */}
        <ErrorBoundary fallbackTitle="About Section Unavailable">
          <AboutSection />
        </ErrorBoundary>

        {/* Location & Hours Section */}
        <ErrorBoundary fallbackTitle="Location & Hours Unavailable">
          <LocationHoursSection />
        </ErrorBoundary>

        {/* Google Reviews & Social Proof Section */}
        <ErrorBoundary fallbackTitle="Testimonials Section Unavailable">
          <TestimonialsSection />
        </ErrorBoundary>

        {/* Call to Action Banner */}
        <ErrorBoundary fallbackTitle="Call to Action Unavailable">
          <CallToActionBanner onBookClick={() => scrollToSection('contact')} />
        </ErrorBoundary>

        {/* Working Appointment & Contact Form Section */}
        <ErrorBoundary fallbackTitle="Appointment Booking Form Unavailable">
          <ContactAppointmentForm 
            initialServiceId={selectedServiceForBooking} 
            onOpenPrivacyPolicy={() => setIsPrivacyOpen(true)}
            onBookingSuccess={(details) => {
              setConfirmationData({
                isOpen: true,
                ...details,
              });
            }}
          />
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <Footer
        onNavigate={scrollToSection}
        onOpenPortal={() => setIsPortalOpen(true)}
        onOpenPrivacyPolicy={() => setIsPrivacyOpen(true)}
        onOpenTerms={() => setIsTermsOpen(true)}
        onOpenCookiePolicy={() => setIsCookiePolicyOpen(true)}
        onOpenAccessibility={() => setIsAccessibilityOpen(true)}
        onOpen404={() => setIs404(true)}
      />

      {/* Staff & Receptionist Appointment Management Modal (Private Backend Only) */}
      <StaffAppointmentsPortal
        isOpen={isPortalOpen}
        onClose={() => {
          setIsPortalOpen(false);
          const hash = window.location.hash;
          if (hash === '#reception' || hash === '#portal' || hash === '#admin' || hash === '#staff') {
            window.history.replaceState(null, '', window.location.pathname);
          }
        }}
      />

      {/* Legal & Policy Modals */}
      <PrivacyPolicyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
      <TermsConditionsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
      <CookiePolicyModal isOpen={isCookiePolicyOpen} onClose={() => setIsCookiePolicyOpen(false)} />
      <AccessibilityStatementModal isOpen={isAccessibilityOpen} onClose={() => setIsAccessibilityOpen(false)} />

      {/* Service Detail Modal */}
      <ServiceDetailModal
        service={selectedServiceForModal}
        onClose={() => setSelectedServiceForModal(null)}
        onBookService={(serviceId) => {
          setSelectedServiceForModal(null);
          handleSelectServiceForBooking(serviceId);
        }}
        lang={lang}
      />

      {/* Booking Confirmation / Thank You Modal */}
      <BookingConfirmationModal
        isOpen={confirmationData.isOpen}
        onClose={() => setConfirmationData((prev) => ({ ...prev, isOpen: false }))}
        bookingData={
          confirmationData.isOpen
            ? {
                bookingId: confirmationData.bookingRef,
                patientName: confirmationData.patientName,
                phoneNumber: 'Registered in System',
                serviceName: confirmationData.service,
                preferredDate: confirmationData.date,
                preferredTimeSlot: 'Confirmed with Reception',
              }
            : null
        }
      />

      {/* Cookie & Storage Consent Banner */}
      <CookieConsentBanner
        onOpenCookiePolicy={() => setIsCookiePolicyOpen(true)}
        onOpenPrivacyPolicy={() => setIsPrivacyOpen(true)}
      />

      {/* Floating WhatsApp Quick-Chat Desk */}
      <FloatingWhatsAppButton />

      {/* Sticky Mobile Bar with Call, WhatsApp, and Book Actions */}
      <StickyMobileBar onOpenBooking={() => scrollToSection('contact')} lang={lang} />

      {/* Back to Top Floating Action Button */}
      <BackToTopButton />
    </div>
  );
}
