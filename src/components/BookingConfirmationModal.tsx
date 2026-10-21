import React from 'react';
import { CheckCircle2, Printer, Calendar, MapPin, Phone, MessageSquare, Clock, ArrowRight, Download } from 'lucide-react';
import { CLINIC_INFO } from '../data/clinicData';

interface BookingConfirmationModalProps {
  isOpen: boolean;
  bookingData: {
    bookingId?: string;
    patientName: string;
    phoneNumber: string;
    serviceName: string;
    preferredDate: string;
    preferredTimeSlot: string;
  } | null;
  onClose: () => void;
}

export const BookingConfirmationModal: React.FC<BookingConfirmationModalProps> = ({
  isOpen,
  bookingData,
  onClose,
}) => {
  if (!isOpen || !bookingData) return null;

  const referenceId = bookingData.bookingId || `HC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadIcs = () => {
    const title = `Hearing Clinic Appointment - ${bookingData.serviceName}`;
    const description = `Appointment for ${bookingData.patientName} at Hearing Clinic Lahore (83A Gulberg III, MM Alam Road). Phone: ${CLINIC_INFO.phone}`;
    const location = CLINIC_INFO.address;
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Hearing Clinic Lahore//Appointment Slip//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      `STATUS:CONFIRMED`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `hearing-clinic-appointment-${referenceId}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const whatsappMessage = encodeURIComponent(
    `Hello Hearing Clinic, I have submitted my appointment request online.\nReference: ${referenceId}\nPatient: ${bookingData.patientName}\nService: ${bookingData.serviceName}\nPreferred Date: ${bookingData.preferredDate} (${bookingData.preferredTimeSlot})`
  );
  const whatsappUrl = `https://wa.me/923214190400?text=${whatsappMessage}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in print:p-0 print:static print:bg-white"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto print:max-w-none print:shadow-none print:border-none print:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success Icon */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Appointment Request Received!</h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Our clinic audiology coordinator will confirm your exact consultation slot within 2 hours.
          </p>
        </div>

        {/* Printable Slip Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6 text-sm text-slate-700 print:bg-white print:border-slate-400">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Booking Reference</p>
              <p className="text-lg font-mono font-extrabold text-teal-800">{referenceId}</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
                Pending Staff Confirmation
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 font-medium">Patient Name:</span>
              <p className="text-sm font-bold text-slate-900">{bookingData.patientName}</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Contact Phone:</span>
              <p className="text-sm font-bold text-slate-900">{bookingData.phoneNumber}</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Clinical Service:</span>
              <p className="text-sm font-bold text-teal-800">{bookingData.serviceName}</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Date & Time Preference:</span>
              <p className="text-sm font-bold text-slate-900">
                {bookingData.preferredDate} ({bookingData.preferredTimeSlot})
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/80 text-xs text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span><strong>Clinic Location:</strong> 83A Gulberg III, MM Alam Road, near Hussain Chowk, Lahore</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span><strong>Clinic Hours:</strong> Mon - Sat: 11:00 AM – 8:00 PM (Sunday Closed)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span><strong>Helpdesk:</strong> 0321 4190400 / (042) 3575 8899</span>
            </div>
          </div>
        </div>

        {/* Patient Instructions */}
        <div className="bg-teal-50/70 border border-teal-200/80 rounded-xl p-4 mb-6 text-xs text-teal-900 space-y-1.5">
          <p className="font-bold uppercase tracking-wider text-[11px] text-teal-950">Patient Visit Guidelines:</p>
          <p>• Please arrive 10 minutes before your slot for registration and otoscopic canal check.</p>
          <p>• Fasting is NOT required for audiometry or hearing aid programming.</p>
          <p>• Wheelchair ramp access and valet parking are available at our MM Alam entrance.</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 print:hidden">
          <div className="flex flex-col sm:flex-row gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Confirm on WhatsApp</span>
            </a>
            <button
              type="button"
              onClick={handleDownloadIcs}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2.5 rounded-xl text-xs font-semibold transition border border-slate-200"
            >
              <Download className="w-4 h-4" />
              <span>Add to Calendar</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <Printer className="w-4 h-4" />
              <span>Print Slip</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
