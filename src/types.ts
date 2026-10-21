/**
 * Type definitions for Hearing Clinic application
 */

export interface ServiceItem {
  id: string;
  name: string;
  shortDescription: string;
  clinicalDetails: string;
  category: 'diagnostic' | 'fitting' | 'therapy' | 'referral';
  durationMinutes: number;
  equipmentOrFormat?: string;
  suitableFor: string;
  procedureSteps?: string[];
  prepInstructions?: string[];
  keyBenefits?: string[];
  faqs?: { q: string; a: string }[];
}

export type ClinicService = ServiceItem;

export interface BrandItem {
  name: string;
  category: 'hearing-aids' | 'diagnostic-equipment' | 'cochlear-implants';
  origin: string;
  description: string;
  role: 'Authorized Dispenser' | 'Sole Distributor for Pakistan' | 'Authorized Implantation Center';
}

export interface ClinicLocation {
  id: string;
  city: string;
  province: 'Punjab' | 'Sindh' | 'Khyber Pakhtunkhwa' | 'Islamabad Capital Territory';
  name: string;
  address: string;
  landmark: string;
  phone: string;
  phoneAlt?: string;
  timings: string;
  isOpenSunday?: boolean;
  servicesOffered: string[];
  isFlagship?: boolean;
  googleMapsUrl: string;
}

export interface CochlearImplantInfo {
  title: string;
  tagline: string;
  description: string;
  technologyBrand: string;
  systemModel: string;
  keyFeatures: string[];
  candidacyCriteria: string[];
  journeySteps: {
    step: number;
    title: string;
    description: string;
  }[];
}

export interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  dateText: string;
  verified: boolean;
  content: string;
  serviceMentioned?: string;
}

export interface AmenityItem {
  id: string;
  title: string;
  description: string;
  category: 'accessibility' | 'facility' | 'payment';
}

export interface AppointmentFormData {
  fullName: string;
  phoneNumber: string;
  email: string;
  serviceId: string;
  preferredDate: string;
  preferredTimeSlot: string;
  additionalNotes: string;
  _honeypot: string; // Anti-spam hidden field
}

export interface FormErrors {
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  serviceId?: string;
  preferredDate?: string;
  consent?: string;
  general?: string;
}

export type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export interface AppointmentRecord {
  id: string;
  patientName: string;
  phone: string;
  email?: string;
  serviceId: string;
  serviceName: string;
  preferredDate: string;
  preferredTime: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingRecord {
  id: string;
  name: string;
  phone: string;
  email?: string;
  service: string;
  preferredDate: string;
  message?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: any;
}

export interface ContactRecord {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'responded';
  createdAt: any;
}

export interface ContactFormData {
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  _honeypot: string;
}

export interface ContactFormErrors {
  name?: string;
  phone?: string;
  email?: string;
  subject?: string;
  message?: string;
  contactMethod?: string;
  general?: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: 'pricing' | 'care' | 'products' | 'tests';
}

export interface HearingAidProduct {
  id: string;
  name: string;
  brand: 'Phonak' | 'Beltone' | 'Signia';
  series: string;
  style: string;
  description: string;
  keyFeatures: string[];
  batteryType: 'Rechargeable' | 'Zinc-Air 312 / 13' | 'Custom Lithium-Ion';
  lossLevel:
    | 'Mild to Moderate'
    | 'Mild to Severe'
    | 'Moderate to Severe'
    | 'Moderate to Profound'
    | 'Severe to Profound'
    | 'Mild to Profound';
  badge?: string;
  image: string;
}

export interface PriceTier {
  id: string;
  title: string;
  priceRangePKR: string;
  description: string;
  bestFor: string;
  features: string[];
  recommendedModels: string;
  isPopular?: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  credentials: string;
  experienceYears: number;
  bio: string;
  specialties: string[];
  languages: string[];
  image: string;
}

export interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  category: 'Audiology' | 'Hearing Aids' | 'Pediatrics' | 'Tinnitus' | 'Prevention';
  summary: string;
  readTimeMinutes: number;
  publishedDate: string;
  author: string;
  keyTakeaways: string[];
  contentParagraphs: string[];
  relatedServiceId?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Acoustic Suite' | 'Audiometers' | 'Fitting Lab' | 'Examination' | 'Lounge';
  description: string;
  equipmentBrand?: string;
  iconName: string;
}

export interface AuditLogEntry {
  status: string;
  changedBy: string;
  changedAt: string;
  note?: string;
}
