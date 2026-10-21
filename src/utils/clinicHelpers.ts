/**
 * Helper utilities for Hearing Clinic
 */

export interface ClinicStatus {
  isOpen: boolean;
  statusText: string;
  nextEventText: string;
}

/**
 * Calculates current clinic status based on Pakistan Standard Time (PKT, UTC+5).
 * Clinic Hours: Monday - Saturday 10:00 AM - 7:00 PM; Sunday Closed.
 */
export function getClinicCurrentStatus(referenceDate = new Date()): ClinicStatus {
  // Convert referenceDate to Pakistan Time (UTC+5)
  const utc = referenceDate.getTime() + referenceDate.getTimezoneOffset() * 60000;
  const pktDate = new Date(utc + 3600000 * 5);

  const day = pktDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const hours = pktDate.getHours();
  const minutes = pktDate.getMinutes();
  const currentTimeInMinutes = hours * 60 + minutes;

  const openTimeInMinutes = 10 * 60; // 10:00 AM = 600
  const closeTimeInMinutes = 19 * 60; // 7:00 PM = 1140

  const isSunday = day === 0;

  if (isSunday) {
    return {
      isOpen: false,
      statusText: 'Closed Today (Sunday)',
      nextEventText: 'Opens Monday at 10:00 AM PKT',
    };
  }

  if (currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes < closeTimeInMinutes) {
    const hoursLeft = Math.floor((closeTimeInMinutes - currentTimeInMinutes) / 60);
    const minsLeft = (closeTimeInMinutes - currentTimeInMinutes) % 60;
    const timeLeftNotice = hoursLeft > 0 ? `${hoursLeft}h ${minsLeft}m left` : `${minsLeft} mins left`;

    return {
      isOpen: true,
      statusText: 'Open Now',
      nextEventText: `Closes at 7:00 PM (${timeLeftNotice})`,
    };
  }

  if (currentTimeInMinutes < openTimeInMinutes) {
    return {
      isOpen: false,
      statusText: 'Closed Currently',
      nextEventText: 'Opens today at 10:00 AM',
    };
  }

  // After 7 PM
  if (day === 6) {
    // Saturday evening
    return {
      isOpen: false,
      statusText: 'Closed for the Evening',
      nextEventText: 'Opens Monday at 10:00 AM',
    };
  }

  return {
    isOpen: false,
    statusText: 'Closed for the Evening',
    nextEventText: 'Opens tomorrow at 10:00 AM',
  };
}

/**
 * Sanitizes input string to prevent unescaped rendering or injection.
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

/**
 * Validates Pakistani phone numbers:
 * Matches formats:
 * - 03214190400
 * - 0321 4190400
 * - 0321-4190400
 * - +92 321 4190400
 * - +923214190400
 * - 00923214190400
 */
export function validatePakistaniPhone(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s\-_]/g, '');
  // Pakistani mobile/landline regex
  const regex = /^((\+92)|(0092)|(0))?3[0-9]{9}$/;
  return regex.test(cleaned);
}

/**
 * Standard RFC-compliant email validation
 */
export function validateEmail(email: string): boolean {
  if (!email) return false;
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email.trim());
}
