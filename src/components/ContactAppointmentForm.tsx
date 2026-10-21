import React, { useState, useId, useEffect } from 'react';
import { 
  Calendar, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Phone, 
  Loader2, 
  Shield, 
  Clock,
  RefreshCw,
  MessageCircle,
  Mail,
  HelpCircle,
  WifiOff
} from 'lucide-react';
import { CLINIC_INFO, CLINIC_SERVICES } from '../data/clinicData';
import { validatePakistaniPhone, validateEmail, sanitizeInput } from '../utils/clinicHelpers';
import { createBookingInDb, createContactInDb, translateFirebaseError } from '../lib/firebase';
import { sendBookingEmailNotification, sendContactEmailNotification } from '../lib/emailService';
import { triggerPhoneNotification } from '../utils/notificationService';

interface ContactFormProps {
  initialServiceId?: string;
  onOpenPrivacyPolicy?: () => void;
  onBookingSuccess?: (details: {
    bookingRef: string;
    patientName: string;
    service: string;
    date: string;
  }) => void;
}

export const ContactAppointmentForm: React.FC<ContactFormProps> = ({ 
  initialServiceId,
  onOpenPrivacyPolicy,
  onBookingSuccess,
}) => {
  const formId = useId();
  const [activeFormTab, setActiveFormTab] = useState<'booking' | 'inquiry'>('booking');

  // Network online status
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // -------------------------------------------------------------
  // FORM 1: BOOKINGS STATE
  // -------------------------------------------------------------
  const [bookingData, setBookingData] = useState({
    name: '',
    phone: '',
    email: '',
    service: initialServiceId || CLINIC_SERVICES[0]?.name || 'Pure Tone Audiometry (PTA)',
    preferredDate: '',
    message: '',
    _honeypot: '',
  });

  const [bookingConsent, setBookingConsent] = useState(false);
  const [bookingErrors, setBookingErrors] = useState<Record<string, string>>({});
  const [bookingTouched, setBookingTouched] = useState<Record<string, boolean>>({});
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [bookingRefCode, setBookingRefCode] = useState('');
  const [bookingRateLimitMsg, setBookingRateLimitMsg] = useState<string | null>(null);

  // Sync initial service
  useEffect(() => {
    if (initialServiceId) {
      const match = CLINIC_SERVICES.find((s) => s.id === initialServiceId);
      if (match) {
        setBookingData((prev) => ({ ...prev, service: match.name }));
      }
    }
  }, [initialServiceId]);

  // Minimum date for scheduling: tomorrow
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const validateBookingField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Patient full name is required.';
        if (value.trim().length > 200) return 'Name must not exceed 200 characters.';
        return undefined;
      case 'phone':
        if (!value.trim()) return 'Contact phone number is required.';
        if (value.trim().length > 30) return 'Phone number must not exceed 30 characters.';
        if (!validatePakistaniPhone(value)) {
          return 'Please enter a valid phone number (e.g. 0321 4190400 or +923214190400).';
        }
        return undefined;
      case 'email':
        if (value.trim()) {
          if (value.trim().length > 200) return 'Email must not exceed 200 characters.';
          if (!validateEmail(value)) return 'Please enter a valid email address.';
        }
        return undefined;
      case 'service':
        if (!value.trim()) return 'Please select an audiology service.';
        if (value.trim().length > 100) return 'Service name is too long.';
        return undefined;
      case 'preferredDate':
        if (!value.trim()) return 'Please select or enter your preferred consultation date.';
        if (value.trim().length > 40) return 'Date description must not exceed 40 characters.';
        return undefined;
      case 'message':
        if (value.trim().length > 1000) return 'Remarks must not exceed 1000 characters.';
        return undefined;
      default:
        return undefined;
    }
  };

  const handleBookingChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({ ...prev, [name]: value }));
    if (bookingTouched[name]) {
      const err = validateBookingField(name, value);
      setBookingErrors((prev) => ({ ...prev, [name]: err || '' }));
    }
  };

  const handleBookingBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setBookingTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateBookingField(name, value);
    setBookingErrors((prev) => ({ ...prev, [name]: err || '' }));
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isOnline) {
      setBookingErrors((prev) => ({
        ...prev,
        general: 'You are currently offline. Please reconnect to submit your booking.',
      }));
      return;
    }

    // Honeypot check
    if (bookingData._honeypot) {
      setBookingStatus('success');
      return;
    }

    // 30s rate limiting check
    const now = Date.now();
    try {
      const lastBooking = parseInt(localStorage.getItem('hc_last_booking_submit') || '0', 10);
      if (lastBooking && now - lastBooking < 30000) {
        const wait = Math.ceil((30000 - (now - lastBooking)) / 1000);
        setBookingRateLimitMsg(`Submission rate limit active. Please wait ${wait} seconds before submitting another booking.`);
        return;
      }
    } catch {}
    setBookingRateLimitMsg(null);

    // Validate all fields
    const newErrors: Record<string, string> = {};
    const nameErr = validateBookingField('name', bookingData.name);
    if (nameErr) newErrors.name = nameErr;

    const phoneErr = validateBookingField('phone', bookingData.phone);
    if (phoneErr) newErrors.phone = phoneErr;

    const emailErr = validateBookingField('email', bookingData.email);
    if (emailErr) newErrors.email = emailErr;

    const serviceErr = validateBookingField('service', bookingData.service);
    if (serviceErr) newErrors.service = serviceErr;

    const dateErr = validateBookingField('preferredDate', bookingData.preferredDate);
    if (dateErr) newErrors.preferredDate = dateErr;

    const msgErr = validateBookingField('message', bookingData.message);
    if (msgErr) newErrors.message = msgErr;

    if (!bookingConsent) {
      newErrors.consent = 'Please confirm consent for clinical appointment scheduling.';
    }

    setBookingErrors(newErrors);
    setBookingTouched({
      name: true,
      phone: true,
      email: true,
      service: true,
      preferredDate: true,
      consent: true,
    });

    if (Object.keys(newErrors).length > 0) {
      const firstKey = Object.keys(newErrors)[0];
      const el = document.getElementById(`${formId}-booking-${firstKey}`);
      el?.focus();
      return;
    }

    setBookingStatus('submitting');

    try {
      // Step 1: Write directly to `bookings` collection with serverTimestamp()
      const bookingId = await createBookingInDb({
        name: sanitizeInput(bookingData.name),
        phone: sanitizeInput(bookingData.phone),
        email: bookingData.email ? sanitizeInput(bookingData.email) : undefined,
        service: sanitizeInput(bookingData.service),
        preferredDate: sanitizeInput(bookingData.preferredDate),
        message: bookingData.message ? sanitizeInput(bookingData.message) : undefined,
      });

      const refCode = `HC-${bookingId.slice(-6).toUpperCase()}`;
      setBookingRefCode(refCode);
      setBookingStatus('success');

      if (onBookingSuccess) {
        onBookingSuccess({
          bookingRef: refCode,
          patientName: bookingData.name,
          service: bookingData.service,
          date: bookingData.preferredDate,
        });
      }

      try {
        localStorage.setItem('hc_last_booking_submit', String(Date.now()));
      } catch {}

      // Step 2: Dispatched secondary clinic email notification via EmailJS (non-blocking)
      sendBookingEmailNotification({
        bookingId: refCode,
        name: bookingData.name,
        phone: bookingData.phone,
        email: bookingData.email,
        service: bookingData.service,
        preferredDate: bookingData.preferredDate,
        message: bookingData.message,
      });

      // Step 3: Trigger in-browser audio chime
      triggerPhoneNotification(
        `🔔 Booking Logged: ${bookingData.name}`,
        `${bookingData.service} on ${bookingData.preferredDate}`
      );
    } catch (err) {
      console.error('Booking submission error:', err);
      setBookingStatus('error');
      setBookingErrors((prev) => ({
        ...prev,
        general: translateFirebaseError(err),
      }));
    }
  };

  const handleResetBooking = () => {
    setBookingData({
      name: '',
      phone: '',
      email: '',
      service: CLINIC_SERVICES[0]?.name || 'Pure Tone Audiometry (PTA)',
      preferredDate: '',
      message: '',
      _honeypot: '',
    });
    setBookingConsent(false);
    setBookingErrors({});
    setBookingTouched({});
    setBookingStatus('idle');
  };

  // -------------------------------------------------------------
  // FORM 2: CONTACT INQUIRIES STATE
  // -------------------------------------------------------------
  const [contactData, setContactData] = useState({
    name: '',
    subject: '',
    message: '',
    phone: '',
    email: '',
    _honeypot: '',
  });

  const [contactConsent, setContactConsent] = useState(false);
  const [contactErrors, setContactErrors] = useState<Record<string, string>>({});
  const [contactTouched, setContactTouched] = useState<Record<string, boolean>>({});
  const [contactStatus, setContactStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [contactRefCode, setContactRefCode] = useState('');
  const [contactRateLimitMsg, setContactRateLimitMsg] = useState<string | null>(null);

  const validateContactField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Your full name is required.';
        if (value.trim().length > 200) return 'Name must not exceed 200 characters.';
        return undefined;
      case 'subject':
        if (!value.trim()) return 'Inquiry subject is required.';
        if (value.trim().length > 200) return 'Subject must not exceed 200 characters.';
        return undefined;
      case 'message':
        if (!value.trim()) return 'Please enter your message or question.';
        if (value.trim().length > 1000) return 'Message must not exceed 1000 characters.';
        return undefined;
      case 'phone':
        if (value.trim()) {
          if (value.trim().length > 30) return 'Phone must not exceed 30 characters.';
          if (!validatePakistaniPhone(value)) return 'Please enter a valid phone number.';
        }
        return undefined;
      case 'email':
        if (value.trim()) {
          if (value.trim().length > 200) return 'Email must not exceed 200 characters.';
          if (!validateEmail(value)) return 'Please enter a valid email address.';
        }
        return undefined;
      default:
        return undefined;
    }
  };

  const handleContactChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setContactData((prev) => ({ ...prev, [name]: value }));
    if (contactTouched[name]) {
      const err = validateContactField(name, value);
      setContactErrors((prev) => ({ ...prev, [name]: err || '' }));
    }
  };

  const handleContactBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setContactTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateContactField(name, value);
    setContactErrors((prev) => ({ ...prev, [name]: err || '' }));
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isOnline) {
      setContactErrors((prev) => ({
        ...prev,
        general: 'You are currently offline. Please reconnect to send your message.',
      }));
      return;
    }

    // Honeypot check
    if (contactData._honeypot) {
      setContactStatus('success');
      return;
    }

    // 30s rate limiting check
    const now = Date.now();
    try {
      const lastContact = parseInt(localStorage.getItem('hc_last_contact_submit') || '0', 10);
      if (lastContact && now - lastContact < 30000) {
        const wait = Math.ceil((30000 - (now - lastContact)) / 1000);
        setContactRateLimitMsg(`Rate limit active. Please wait ${wait} seconds before sending another message.`);
        return;
      }
    } catch {}
    setContactRateLimitMsg(null);

    // Validate fields
    const newErrors: Record<string, string> = {};
    const nameErr = validateContactField('name', contactData.name);
    if (nameErr) newErrors.name = nameErr;

    const subjectErr = validateContactField('subject', contactData.subject);
    if (subjectErr) newErrors.subject = subjectErr;

    const messageErr = validateContactField('message', contactData.message);
    if (messageErr) newErrors.message = messageErr;

    const phoneErr = validateContactField('phone', contactData.phone);
    if (phoneErr) newErrors.phone = phoneErr;

    const emailErr = validateContactField('email', contactData.email);
    if (emailErr) newErrors.email = emailErr;

    // At least one contact method required
    if (!contactData.phone.trim() && !contactData.email.trim()) {
      newErrors.contactMethod = 'Please provide either a phone number or email address so we can reply.';
    }

    if (!contactConsent) {
      newErrors.consent = 'Please confirm consent for receiving a response from our clinic.';
    }

    setContactErrors(newErrors);
    setContactTouched({
      name: true,
      subject: true,
      message: true,
      phone: true,
      email: true,
      consent: true,
    });

    if (Object.keys(newErrors).length > 0) {
      const firstKey = Object.keys(newErrors)[0];
      const el = document.getElementById(`${formId}-contact-${firstKey}`);
      el?.focus();
      return;
    }

    setContactStatus('submitting');

    try {
      // Step 1: Write to `contacts` collection with serverTimestamp()
      const contactId = await createContactInDb({
        name: sanitizeInput(contactData.name),
        subject: sanitizeInput(contactData.subject),
        message: sanitizeInput(contactData.message),
        phone: contactData.phone ? sanitizeInput(contactData.phone) : undefined,
        email: contactData.email ? sanitizeInput(contactData.email) : undefined,
      });

      const refCode = `INQ-${contactId.slice(-6).toUpperCase()}`;
      setContactRefCode(refCode);
      setContactStatus('success');

      try {
        localStorage.setItem('hc_last_contact_submit', String(Date.now()));
      } catch {}

      // Step 2: Dispatch secondary clinic email notification (non-blocking)
      sendContactEmailNotification({
        contactId: refCode,
        name: contactData.name,
        phone: contactData.phone,
        email: contactData.email,
        subject: contactData.subject,
        message: contactData.message,
      });
    } catch (err) {
      console.error('Contact submission error:', err);
      setContactStatus('error');
      setContactErrors((prev) => ({
        ...prev,
        general: translateFirebaseError(err),
      }));
    }
  };

  const handleResetContact = () => {
    setContactData({
      name: '',
      subject: '',
      message: '',
      phone: '',
      email: '',
      _honeypot: '',
    });
    setContactConsent(false);
    setContactErrors({});
    setContactTouched({});
    setContactStatus('idle');
  };

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="py-16 bg-[#F8FAFC] border-t border-slate-200/70"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Clinic Reception Details */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 block mb-2">
                MM Alam Road Reception
              </span>
              <h2
                id="contact-heading"
                className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight"
              >
                Schedule your audiological consultation.
              </h2>
              <p className="mt-4 text-base text-slate-600 leading-relaxed">
                Choose between booking a comprehensive clinical diagnostic evaluation or sending a general inquiry to our MM Alam Road audiology reception desk.
              </p>
            </div>

            {/* Offline Alert in Form */}
            {!isOnline && (
              <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-800 flex items-start gap-2.5">
                <WifiOff className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Offline Notice</span>
                  <span>Your device is currently offline. Please call our reception desk directly for immediate assistance.</span>
                </div>
              </div>
            )}

            {/* Direct Phone Assistance Banner */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                  <Phone className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Need Urgent Testing?</h3>
                  <p className="text-xs text-slate-500">Same-day appointments for sudden hearing loss or device repairs</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                If you are experiencing sudden hearing loss, acute ear pain, or urgent hearing aid malfunction, please call reception directly.
              </p>
              <div className="pt-1 flex flex-wrap items-center gap-4">
                <a
                  href={`tel:${CLINIC_INFO.phoneClean}`}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-700 hover:text-teal-800 transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  Landline: {CLINIC_INFO.phone}
                </a>
                <a
                  href={`tel:03008479266`}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-700 hover:text-teal-800 transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  Helpline: 0300 8479266
                </a>
              </div>
            </div>

            {/* Appointment Policies */}
            <div className="space-y-3 text-xs text-slate-500">
              <div className="flex items-start gap-2.5">
                <Shield className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" aria-hidden="true" />
                <span>Patient privacy guaranteed. Submissions are saved securely to our Firestore database and access is strictly gated to verified clinic staff.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" aria-hidden="true" />
                <span>Clinic Hours: Monday to Saturday, 10:00 AM – 7:00 PM PKT. Closed on Sunday.</span>
              </div>
            </div>
          </div>

          {/* Right Column: Forms Container */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-8 shadow-sm">
              {/* Tab Selector: Booking vs Contact Inquiry */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-4 mb-6">
                <button
                  type="button"
                  onClick={() => setActiveFormTab('booking')}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-center transition-all ${
                    activeFormTab === 'booking'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Calendar className="h-4 w-4 inline mr-1.5 -mt-0.5" />
                  Book Appointment
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFormTab('inquiry')}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-center transition-all ${
                    activeFormTab === 'inquiry'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Mail className="h-4 w-4 inline mr-1.5 -mt-0.5" />
                  General Inquiry
                </button>
              </div>

              {/* ========================================================= */}
              {/* FORM 1: BOOKINGS */}
              {/* ========================================================= */}
              {activeFormTab === 'booking' && (
                <div>
                  {bookingStatus === 'success' ? (
                    <div role="status" aria-live="polite" className="text-center py-6 space-y-5 animate-in fade-in">
                      <div className="mx-auto h-16 w-16 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                        <CheckCircle2 className="h-10 w-10 text-teal-600" aria-hidden="true" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Request Recorded</span>
                        <h3 className="text-2xl font-extrabold text-slate-900">Thank You, {bookingData.name.split(' ')[0]}</h3>
                        <p className="text-xs text-slate-600 max-w-md mx-auto">
                          Your appointment request has been safely logged in our clinical database. Our receptionist will call you within 2 business hours.
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left max-w-md mx-auto text-xs space-y-2">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                          <span className="text-slate-500">Booking Reference:</span>
                          <span className="font-mono font-bold text-teal-700 text-sm">{bookingRefCode}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Service:</span>
                          <span className="font-semibold text-slate-900">{bookingData.service}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Requested Timing:</span>
                          <span className="font-semibold text-slate-900">{bookingData.preferredDate}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Phone:</span>
                          <span className="font-semibold text-slate-900">{bookingData.phone}</span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <a
                          href={`https://wa.me/${CLINIC_INFO.whatsAppNumber}?text=${encodeURIComponent(
                            `Assalam-o-Alaikum Hearing Clinic Lahore,\nI have submitted an online appointment request:\n\n• Ref ID: ${bookingRefCode}\n• Patient Name: ${bookingData.name}\n• Service: ${bookingData.service}\n• Date: ${bookingData.preferredDate}\n• Phone: ${bookingData.phone}\n\nPlease confirm availability.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 w-full max-w-md mx-auto px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold shadow-sm transition-all"
                        >
                          <MessageCircle className="h-4 w-4 fill-current" />
                          <span>Send Receipt to Clinic on WhatsApp</span>
                        </a>
                      </div>

                      <div className="pt-2 flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={handleResetBooking}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          Book Another
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleBookingSubmit} noValidate className="space-y-4">
                      {/* Honeypot field */}
                      <div className="hidden" aria-hidden="true">
                        <input
                          type="text"
                          name="_honeypot"
                          value={bookingData._honeypot}
                          onChange={(e) => setBookingData((p) => ({ ...p, _honeypot: e.target.value }))}
                          tabIndex={-1}
                          autoComplete="off"
                        />
                      </div>

                      {bookingErrors.general && (
                        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                          <span>{bookingErrors.general}</span>
                        </div>
                      )}

                      {bookingRateLimitMsg && (
                        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                          <span>{bookingRateLimitMsg}</span>
                        </div>
                      )}

                      {/* Name */}
                      <div>
                        <label
                          htmlFor={`${formId}-booking-name`}
                          className="block text-xs font-bold uppercase tracking-wider text-slate-900 mb-1"
                        >
                          Patient Full Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          id={`${formId}-booking-name`}
                          name="name"
                          value={bookingData.name}
                          onChange={handleBookingChange}
                          onBlur={handleBookingBlur}
                          disabled={bookingStatus === 'submitting' || !isOnline}
                          placeholder="e.g. Tariq Mehmood"
                          maxLength={200}
                          className={`w-full rounded-xl border px-3.5 py-2 text-sm bg-white text-slate-900 ${
                            bookingErrors.name ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-teal-600'
                          }`}
                        />
                        {bookingErrors.name && (
                          <p className="mt-1 text-xs text-rose-600 font-medium">{bookingErrors.name}</p>
                        )}
                      </div>

                      {/* Phone & Email */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor={`${formId}-booking-phone`}
                            className="block text-xs font-bold uppercase tracking-wider text-slate-900 mb-1"
                          >
                            Mobile Number <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="tel"
                            id={`${formId}-booking-phone`}
                            name="phone"
                            value={bookingData.phone}
                            onChange={handleBookingChange}
                            onBlur={handleBookingBlur}
                            disabled={bookingStatus === 'submitting' || !isOnline}
                            placeholder="0321 4190400"
                            maxLength={30}
                            className={`w-full rounded-xl border px-3.5 py-2 text-sm bg-white text-slate-900 ${
                              bookingErrors.phone ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-teal-600'
                            }`}
                          />
                          {bookingErrors.phone && (
                            <p className="mt-1 text-xs text-rose-600 font-medium">{bookingErrors.phone}</p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor={`${formId}-booking-email`}
                            className="block text-xs font-bold uppercase tracking-wider text-slate-900 mb-1"
                          >
                            Email <span className="text-[11px] font-normal text-slate-500">(Optional)</span>
                          </label>
                          <input
                            type="email"
                            id={`${formId}-booking-email`}
                            name="email"
                            value={bookingData.email}
                            onChange={handleBookingChange}
                            onBlur={handleBookingBlur}
                            disabled={bookingStatus === 'submitting' || !isOnline}
                            placeholder="patient@example.com"
                            maxLength={200}
                            className={`w-full rounded-xl border px-3.5 py-2 text-sm bg-white text-slate-900 ${
                              bookingErrors.email ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-teal-600'
                            }`}
                          />
                          {bookingErrors.email && (
                            <p className="mt-1 text-xs text-rose-600 font-medium">{bookingErrors.email}</p>
                          )}
                        </div>
                      </div>

                      {/* Service */}
                      <div>
                        <label
                          htmlFor={`${formId}-booking-service`}
                          className="block text-xs font-bold uppercase tracking-wider text-slate-900 mb-1"
                        >
                          Audiology Service <span className="text-rose-500">*</span>
                        </label>
                        <select
                          id={`${formId}-booking-service`}
                          name="service"
                          value={bookingData.service}
                          onChange={handleBookingChange}
                          onBlur={handleBookingBlur}
                          disabled={bookingStatus === 'submitting' || !isOnline}
                          className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm bg-white text-slate-900 focus:border-teal-600"
                        >
                          {CLINIC_SERVICES.map((s) => (
                            <option key={s.id} value={s.name}>
                              {s.name} (~{s.durationMinutes} mins)
                            </option>
                          ))}
                        </select>
                        {bookingErrors.service && (
                          <p className="mt-1 text-xs text-rose-600 font-medium">{bookingErrors.service}</p>
                        )}
                      </div>

                      {/* Preferred Date (plain text or date picker, max 40 chars) */}
                      <div>
                        <label
                          htmlFor={`${formId}-booking-preferredDate`}
                          className="block text-xs font-bold uppercase tracking-wider text-slate-900 mb-1"
                        >
                          Preferred Date / Timing <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          id={`${formId}-booking-preferredDate`}
                          name="preferredDate"
                          value={bookingData.preferredDate}
                          onChange={handleBookingChange}
                          onBlur={handleBookingBlur}
                          disabled={bookingStatus === 'submitting' || !isOnline}
                          placeholder="e.g. Tomorrow 11:00 AM or Saturday morning"
                          maxLength={40}
                          className={`w-full rounded-xl border px-3.5 py-2 text-sm bg-white text-slate-900 ${
                            bookingErrors.preferredDate ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-teal-600'
                          }`}
                        />
                        {bookingErrors.preferredDate && (
                          <p className="mt-1 text-xs text-rose-600 font-medium">{bookingErrors.preferredDate}</p>
                        )}
                      </div>

                      {/* Message */}
                      <div>
                        <label
                          htmlFor={`${formId}-booking-message`}
                          className="block text-xs font-bold uppercase tracking-wider text-slate-900 mb-1"
                        >
                          Clinical Remarks / Symptoms <span className="text-[11px] font-normal text-slate-500">(Optional)</span>
                        </label>
                        <textarea
                          id={`${formId}-booking-message`}
                          name="message"
                          rows={2}
                          value={bookingData.message}
                          onChange={handleBookingChange}
                          onBlur={handleBookingBlur}
                          disabled={bookingStatus === 'submitting' || !isOnline}
                          placeholder="e.g. Ringing in ears (tinnitus), hearing aid battery issue..."
                          maxLength={1000}
                          className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm bg-white text-slate-900 focus:border-teal-600"
                        />
                        {bookingErrors.message && (
                          <p className="mt-1 text-xs text-rose-600 font-medium">{bookingErrors.message}</p>
                        )}
                      </div>

                      {/* Consent */}
                      <div className="pt-1">
                        <div className="flex items-start gap-2.5">
                          <input
                            type="checkbox"
                            id={`${formId}-booking-consent`}
                            checked={bookingConsent}
                            onChange={(e) => {
                              setBookingConsent(e.target.checked);
                              if (bookingErrors.consent) {
                                setBookingErrors((prev) => ({ ...prev, consent: '' }));
                              }
                            }}
                            disabled={bookingStatus === 'submitting' || !isOnline}
                            className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                          />
                          <label htmlFor={`${formId}-booking-consent`} className="text-xs text-slate-600 leading-relaxed cursor-pointer">
                            I consent to Hearing Clinic Lahore processing my contact details solely for appointment scheduling and consultation in accordance with the{' '}
                            <button
                              type="button"
                              onClick={onOpenPrivacyPolicy}
                              className="font-semibold text-teal-700 underline"
                            >
                              Privacy Policy
                            </button>
                            . <span className="text-rose-500 font-bold">*</span>
                          </label>
                        </div>
                        {bookingErrors.consent && (
                          <p className="mt-1 text-xs text-rose-600 font-medium pl-6">{bookingErrors.consent}</p>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={bookingStatus === 'submitting' || !isOnline}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white text-sm font-semibold py-3 px-4 shadow-sm transition-all disabled:opacity-60"
                      >
                        {bookingStatus === 'submitting' ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Recording Appointment...</span>
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            <span>Confirm Appointment Request</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* ========================================================= */}
              {/* FORM 2: GENERAL CONTACT INQUIRIES */}
              {/* ========================================================= */}
              {activeFormTab === 'inquiry' && (
                <div>
                  {contactStatus === 'success' ? (
                    <div role="status" aria-live="polite" className="text-center py-6 space-y-5 animate-in fade-in">
                      <div className="mx-auto h-16 w-16 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                        <CheckCircle2 className="h-10 w-10 text-teal-600" aria-hidden="true" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Message Received</span>
                        <h3 className="text-2xl font-extrabold text-slate-900">Thank You, {contactData.name.split(' ')[0]}</h3>
                        <p className="text-xs text-slate-600 max-w-md mx-auto">
                          Your message has been sent to our MM Alam Road reception team. We will respond promptly.
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left max-w-md mx-auto text-xs space-y-2">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                          <span className="text-slate-500">Inquiry Ref:</span>
                          <span className="font-mono font-bold text-teal-700 text-sm">{contactRefCode}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Subject:</span>
                          <span className="font-semibold text-slate-900">{contactData.subject}</span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={handleResetContact}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          Send Another Message
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} noValidate className="space-y-4">
                      {/* Honeypot field */}
                      <div className="hidden" aria-hidden="true">
                        <input
                          type="text"
                          name="_honeypot"
                          value={contactData._honeypot}
                          onChange={(e) => setContactData((p) => ({ ...p, _honeypot: e.target.value }))}
                          tabIndex={-1}
                          autoComplete="off"
                        />
                      </div>

                      {contactErrors.general && (
                        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                          <span>{contactErrors.general}</span>
                        </div>
                      )}

                      {contactRateLimitMsg && (
                        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                          <span>{contactRateLimitMsg}</span>
                        </div>
                      )}

                      {/* Name */}
                      <div>
                        <label
                          htmlFor={`${formId}-contact-name`}
                          className="block text-xs font-bold uppercase tracking-wider text-slate-900 mb-1"
                        >
                          Your Full Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          id={`${formId}-contact-name`}
                          name="name"
                          value={contactData.name}
                          onChange={handleContactChange}
                          onBlur={handleContactBlur}
                          disabled={contactStatus === 'submitting' || !isOnline}
                          placeholder="e.g. Asad Qureshi"
                          maxLength={200}
                          className={`w-full rounded-xl border px-3.5 py-2 text-sm bg-white text-slate-900 ${
                            contactErrors.name ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-teal-600'
                          }`}
                        />
                        {contactErrors.name && (
                          <p className="mt-1 text-xs text-rose-600 font-medium">{contactErrors.name}</p>
                        )}
                      </div>

                      {/* Subject */}
                      <div>
                        <label
                          htmlFor={`${formId}-contact-subject`}
                          className="block text-xs font-bold uppercase tracking-wider text-slate-900 mb-1"
                        >
                          Subject <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          id={`${formId}-contact-subject`}
                          name="subject"
                          value={contactData.subject}
                          onChange={handleContactChange}
                          onBlur={handleContactBlur}
                          disabled={contactStatus === 'submitting' || !isOnline}
                          placeholder="e.g. Hearing Aid Pricing Inquiry or Test Schedule"
                          maxLength={200}
                          className={`w-full rounded-xl border px-3.5 py-2 text-sm bg-white text-slate-900 ${
                            contactErrors.subject ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-teal-600'
                          }`}
                        />
                        {contactErrors.subject && (
                          <p className="mt-1 text-xs text-rose-600 font-medium">{contactErrors.subject}</p>
                        )}
                      </div>

                      {/* Phone & Email (At least one required) */}
                      <div className="space-y-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label
                              htmlFor={`${formId}-contact-phone`}
                              className="block text-xs font-bold uppercase tracking-wider text-slate-900 mb-1"
                            >
                              Phone Number
                            </label>
                            <input
                              type="tel"
                              id={`${formId}-contact-phone`}
                              name="phone"
                              value={contactData.phone}
                              onChange={handleContactChange}
                              onBlur={handleContactBlur}
                              disabled={contactStatus === 'submitting' || !isOnline}
                              placeholder="0321 4190400"
                              maxLength={30}
                              className={`w-full rounded-xl border px-3.5 py-2 text-sm bg-white text-slate-900 ${
                                contactErrors.phone ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-teal-600'
                              }`}
                            />
                            {contactErrors.phone && (
                              <p className="mt-1 text-xs text-rose-600 font-medium">{contactErrors.phone}</p>
                            )}
                          </div>

                          <div>
                            <label
                              htmlFor={`${formId}-contact-email`}
                              className="block text-xs font-bold uppercase tracking-wider text-slate-900 mb-1"
                            >
                              Email Address
                            </label>
                            <input
                              type="email"
                              id={`${formId}-contact-email`}
                              name="email"
                              value={contactData.email}
                              onChange={handleContactChange}
                              onBlur={handleContactBlur}
                              disabled={contactStatus === 'submitting' || !isOnline}
                              placeholder="name@example.com"
                              maxLength={200}
                              className={`w-full rounded-xl border px-3.5 py-2 text-sm bg-white text-slate-900 ${
                                contactErrors.email ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-teal-600'
                              }`}
                            />
                            {contactErrors.email && (
                              <p className="mt-1 text-xs text-rose-600 font-medium">{contactErrors.email}</p>
                            )}
                          </div>
                        </div>
                        {contactErrors.contactMethod && (
                          <p className="text-xs text-rose-600 font-medium">{contactErrors.contactMethod}</p>
                        )}
                      </div>

                      {/* Message */}
                      <div>
                        <label
                          htmlFor={`${formId}-contact-message`}
                          className="block text-xs font-bold uppercase tracking-wider text-slate-900 mb-1"
                        >
                          Your Message / Inquiry <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                          id={`${formId}-contact-message`}
                          name="message"
                          rows={3}
                          value={contactData.message}
                          onChange={handleContactChange}
                          onBlur={handleContactBlur}
                          disabled={contactStatus === 'submitting' || !isOnline}
                          placeholder="How can our clinical audiology staff help you?"
                          maxLength={1000}
                          className={`w-full rounded-xl border px-3.5 py-2 text-sm bg-white text-slate-900 ${
                            contactErrors.message ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-teal-600'
                          }`}
                        />
                        {contactErrors.message && (
                          <p className="mt-1 text-xs text-rose-600 font-medium">{contactErrors.message}</p>
                        )}
                      </div>

                      {/* Consent */}
                      <div className="pt-1">
                        <div className="flex items-start gap-2.5">
                          <input
                            type="checkbox"
                            id={`${formId}-contact-consent`}
                            checked={contactConsent}
                            onChange={(e) => {
                              setContactConsent(e.target.checked);
                              if (contactErrors.consent) {
                                setContactErrors((prev) => ({ ...prev, consent: '' }));
                              }
                            }}
                            disabled={contactStatus === 'submitting' || !isOnline}
                            className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                          />
                          <label htmlFor={`${formId}-contact-consent`} className="text-xs text-slate-600 leading-relaxed cursor-pointer">
                            I consent to Hearing Clinic Lahore storing and responding to my inquiry in accordance with the{' '}
                            <button
                              type="button"
                              onClick={onOpenPrivacyPolicy}
                              className="font-semibold text-teal-700 underline"
                            >
                              Privacy Policy
                            </button>
                            . <span className="text-rose-500 font-bold">*</span>
                          </label>
                        </div>
                        {contactErrors.consent && (
                          <p className="mt-1 text-xs text-rose-600 font-medium pl-6">{contactErrors.consent}</p>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={contactStatus === 'submitting' || !isOnline}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white text-sm font-semibold py-3 px-4 shadow-sm transition-all disabled:opacity-60"
                      >
                        {contactStatus === 'submitting' ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Sending Inquiry...</span>
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            <span>Send Inquiry to Clinic</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
