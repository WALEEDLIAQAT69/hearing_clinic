import emailjs from '@emailjs/browser';

/**
 * Secondary Email notification service using EmailJS (Client-side)
 * Never throws or blocks form submissions if service is unconfigured or offline.
 */

// Clinic notification recipient address
const CLINIC_INBOX_EMAIL = 'hearingcliniclahore@gmail.com';

export interface BookingNotificationPayload {
  bookingId: string;
  name: string;
  phone: string;
  email?: string;
  service: string;
  preferredDate: string;
  message?: string;
}

export interface ContactNotificationPayload {
  contactId: string;
  name: string;
  phone?: string;
  email?: string;
  subject: string;
  message: string;
}

/**
 * Dispatches secondary clinic email notification for new booking
 */
export async function sendBookingEmailNotification(
  data: BookingNotificationPayload
): Promise<boolean> {
  try {
    const metaEnv = (import.meta as any).env || {};
    const serviceId = metaEnv.VITE_EMAILJS_SERVICE_ID || 'service_hearing_clinic';
    const templateId = metaEnv.VITE_EMAILJS_TEMPLATE_ID || 'template_booking_alert';
    const publicKey = metaEnv.VITE_EMAILJS_PUBLIC_KEY || '';

    // If no public key is set in environment, log gracefully without failing
    if (!publicKey) {
      console.info(
        `[EmailJS Notification Queued] New Booking #${data.bookingId} from ${data.name} (${data.phone}) for ${data.service} on ${data.preferredDate}. Direct notification ready for EmailJS key configuration.`
      );
      return true;
    }

    const templateParams = {
      to_email: CLINIC_INBOX_EMAIL,
      patient_name: data.name,
      patient_phone: data.phone,
      patient_email: data.email || 'Not provided',
      service_name: data.service,
      preferred_date: data.preferredDate,
      patient_message: data.message || 'No additional notes provided',
      booking_id: data.bookingId,
      submission_time: new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' }),
    };

    await emailjs.send(serviceId, templateId, templateParams, publicKey);
    return true;
  } catch (err) {
    // Non-blocking catch: Data is already safely saved in Firestore
    console.warn('[EmailJS Notification] Secondary email dispatch notice:', err);
    return false;
  }
}

/**
 * Dispatches secondary clinic email notification for new contact inquiry
 */
export async function sendContactEmailNotification(
  data: ContactNotificationPayload
): Promise<boolean> {
  try {
    const metaEnv = (import.meta as any).env || {};
    const serviceId = metaEnv.VITE_EMAILJS_SERVICE_ID || 'service_hearing_clinic';
    const templateId = metaEnv.VITE_EMAILJS_CONTACT_TEMPLATE_ID || 'template_contact_alert';
    const publicKey = metaEnv.VITE_EMAILJS_PUBLIC_KEY || '';

    if (!publicKey) {
      console.info(
        `[EmailJS Notification Queued] New Contact Inquiry #${data.contactId} from ${data.name} regarding "${data.subject}". Direct notification ready for EmailJS key configuration.`
      );
      return true;
    }

    const templateParams = {
      to_email: CLINIC_INBOX_EMAIL,
      sender_name: data.name,
      sender_phone: data.phone || 'Not provided',
      sender_email: data.email || 'Not provided',
      subject: data.subject,
      message: data.message,
      contact_id: data.contactId,
      submission_time: new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' }),
    };

    await emailjs.send(serviceId, templateId, templateParams, publicKey);
    return true;
  } catch (err) {
    console.warn('[EmailJS Notification] Secondary contact email notice:', err);
    return false;
  }
}
