import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDocFromServer,
  serverTimestamp,
  Firestore
} from 'firebase/firestore';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  updatePassword,
  onAuthStateChanged,
  User,
  Auth
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { AppointmentRecord, BookingRecord, ContactRecord } from '../types';

// Initialize Firebase safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Configure Firestore with auto-detect long polling to ensure reliable connectivity
// inside sandboxed iframes, proxies, and constrained network environments
try {
  if (firebaseConfig.firestoreDatabaseId) {
    initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
    }, firebaseConfig.firestoreDatabaseId);
  } else {
    initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
    });
  }
} catch {
  // If Firestore is already initialized
}

// Target provisioned Firestore database
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */

// Target Firebase Auth
export const auth: Auth = getAuth(app);

const APPOINTMENTS_COLLECTION = 'appointments';

// Test database connectivity on boot per Firebase guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Basic sanitization to prevent XSS / script injection attacks
 */
export function sanitizeText(input: string, maxLength: number = 500): string {
  if (!input) return '';
  return input
    .replace(/[<>]/g, '') // strip < and >
    .replace(/javascript:/gi, '') // strip pseudo-protocols
    .replace(/eval\(/gi, '')
    .trim()
    .slice(0, maxLength);
}

/**
 * Authenticate staff member using authorized Clinic Staff Credentials
 */
export async function authenticateStaffWithEmail(email: string, pass: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), pass);
  return credential.user;
}

/**
 * Send official password reset email to registered clinic staff address
 */
export async function sendStaffPasswordReset(email: string): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Please enter a valid clinic email address.');
  }
  await sendPasswordResetEmail(auth, cleanEmail);
}

/**
 * Compute cryptographic SHA-256 hash
 */
async function computeSha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Pre-computed SHA-256 hashes of authorized clinic access keys
// (Old default PIN 1992 has been completely decommissioned and removed)
const AUTHORIZED_KEY_HASHES = new Set([
  'ddec73e1857ca2cc62ab9c507b985da2e8801e98e05d0fa08d5d8ddc9791c2a1', // 4190400 (Clinic Landline)
  'addeb6ef2605d001a7b6aa6249daf667c80d7f613bd6bac0d2d433b148c87f67', // 03214190400 (Clinic Direct Line)
  'e2f691407acb1efa4c9f9f8b1ae626cf6d9a4d96e73e207e9ea7f429293127a8', // 7860
  '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', // admin
]);

/**
 * Configure and persist a custom staff security PIN
 */
export async function setCustomStaffPin(newPin: string): Promise<void> {
  const cleanPin = newPin.trim();
  if (cleanPin.length < 4 || cleanPin.length > 12) {
    throw new Error('PIN must be between 4 and 12 characters.');
  }
  const hash = await computeSha256(cleanPin.toLowerCase());
  try {
    localStorage.setItem('hc_custom_staff_pin_hash', hash);
  } catch {}
}

/**
 * Check if a custom PIN is currently configured in browser clinic storage
 */
export function hasCustomStaffPin(): boolean {
  try {
    return Boolean(localStorage.getItem('hc_custom_staff_pin_hash'));
  } catch {
    return false;
  }
}

/**
 * Authenticate staff member using authorized Clinic Key / PIN
 * Validates against pre-computed cryptographic hashes or user-configured custom PIN.
 */
export async function authenticateStaffWithKey(key: string): Promise<User> {
  // Mitigate timing side-channel attacks with a micro-jitter delay
  await new Promise((resolve) => setTimeout(resolve, 250 + Math.random() * 100));

  const cleanKey = key.trim().toLowerCase();
  const inputHash = await computeSha256(cleanKey);

  let isAuthorized = false;
  try {
    const customHash = localStorage.getItem('hc_custom_staff_pin_hash');
    if (customHash && inputHash === customHash) {
      isAuthorized = true;
    }
  } catch {}

  if (!isAuthorized && AUTHORIZED_KEY_HASHES.has(inputHash)) {
    isAuthorized = true;
  }

  if (!isAuthorized) {
    throw new Error('Invalid Clinic Access PIN. Access denied.');
  }

  // Attempt anonymous sign-in to obtain an authenticated Firebase token for firestore.rules
  try {
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch (err) {
    if (auth.currentUser) return auth.currentUser;
    // Return a mock user object if anonymous sign-in is disabled in Firebase console
    console.warn('Anonymous sign-in not available, user verified by PIN:', err);
    return { uid: 'staff-pin-verified', isAnonymous: true } as User;
  }
}

/**
 * Sign in clinic staff using Google popup (e.g. for waleedliaqat69@gmail.com)
 */
export async function authenticateStaffWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const credential = await signInWithPopup(auth, provider);
  return credential.user;
}

/**
 * Register or activate clinic practitioner account with email & password
 */
export async function registerStaffWithEmail(email: string, pass: string): Promise<User> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Please enter a valid clinic email address.');
  }
  if (pass.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }
  const credential = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
  return credential.user;
}

/**
 * Update authenticated staff practitioner password
 */
export async function updateStaffPassword(newPass: string): Promise<void> {
  if (!auth.currentUser) {
    throw new Error('No authenticated practitioner session found.');
  }
  if (newPass.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }
  await updatePassword(auth.currentUser, newPass);
}

/**
 * Sign out clinic staff and revoke access session
 */
export async function logoutStaff(): Promise<void> {
  await fbSignOut(auth);
}

/**
 * Observe staff authentication state
 */
export function observeAuthState(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

/**
 * Save a new appointment request to Firestore with strict schema sanitization
 */
export async function createAppointmentInDb(data: {
  patientName: string;
  phone: string;
  email?: string;
  serviceId: string;
  serviceName: string;
  preferredDate: string;
  preferredTime: string;
  notes?: string;
}): Promise<string> {
  const colRef = collection(db, APPOINTMENTS_COLLECTION);
  const now = new Date().toISOString();

  // Strict sanitization & constraints matching firestore.rules
  const cleanName = sanitizeText(data.patientName, 80);
  const cleanPhone = sanitizeText(data.phone, 25);
  const cleanEmail = sanitizeText(data.email || '', 100);
  const cleanServiceId = sanitizeText(data.serviceId, 50);
  const cleanServiceName = sanitizeText(data.serviceName, 100);
  const cleanDate = sanitizeText(data.preferredDate, 20);
  const cleanTime = sanitizeText(data.preferredTime, 50);
  const cleanNotes = sanitizeText(data.notes || '', 500);

  if (cleanName.length < 2) {
    throw new Error('Please enter a valid patient name (minimum 2 characters).');
  }
  if (cleanPhone.length < 7) {
    throw new Error('Please enter a valid contact phone number.');
  }

  try {
    const docRef = await addDoc(colRef, {
      patientName: cleanName,
      phone: cleanPhone,
      email: cleanEmail,
      serviceId: cleanServiceId,
      serviceName: cleanServiceName,
      preferredDate: cleanDate,
      preferredTime: cleanTime,
      notes: cleanNotes,
      status: 'pending',
      internalNotes: '',
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, APPOINTMENTS_COLLECTION);
    throw error;
  }
}

/**
 * Real-time subscription to appointments for staff dashboard (Requires Auth)
 */
export function subscribeToAppointments(
  onUpdate: (appointments: AppointmentRecord[]) => void,
  onError?: (err: Error) => void
): () => void {
  const colRef = collection(db, APPOINTMENTS_COLLECTION);
  const q = query(colRef, orderBy('createdAt', 'desc'));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const records: AppointmentRecord[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          patientName: data.patientName || 'Unknown Patient',
          phone: data.phone || '',
          email: data.email || '',
          serviceId: data.serviceId || '',
          serviceName: data.serviceName || 'General Audiology Consultation',
          preferredDate: data.preferredDate || '',
          preferredTime: data.preferredTime || '',
          notes: data.notes || '',
          status: data.status || 'pending',
          internalNotes: data.internalNotes || '',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        };
      });
      onUpdate(records);
    },
    (err) => {
      if (onError) onError(err);
      try {
        handleFirestoreError(err, OperationType.LIST, APPOINTMENTS_COLLECTION);
      } catch {
        // Formatted FirestoreErrorInfo logged
      }
    }
  );

  return unsubscribe;
}

/**
 * Update status or staff notes for an appointment (Requires Auth)
 */
export async function updateAppointment(
  appointmentId: string,
  updates: {
    status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    internalNotes?: string;
  }
): Promise<void> {
  const docPath = `${APPOINTMENTS_COLLECTION}/${appointmentId}`;
  const docRef = doc(db, APPOINTMENTS_COLLECTION, appointmentId);
  const sanitizedUpdates: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };

  if (updates.status) {
    sanitizedUpdates.status = updates.status;
  }
  if (updates.internalNotes !== undefined) {
    sanitizedUpdates.internalNotes = sanitizeText(updates.internalNotes, 1000);
  }

  try {
    await updateDoc(docRef, sanitizedUpdates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
    throw error;
  }
}

/**
 * Delete an appointment record (Requires Auth)
 */
export async function removeAppointment(appointmentId: string): Promise<void> {
  const docPath = `${APPOINTMENTS_COLLECTION}/${appointmentId}`;
  const docRef = doc(db, APPOINTMENTS_COLLECTION, appointmentId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
    throw error;
  }
}

// ---------------------------------------------------------------------------
// 1. PUBLIC BOOKINGS COLLECTION (Strict match for prompt & firestore.rules)
// ---------------------------------------------------------------------------
const BOOKINGS_COLLECTION = 'bookings';

export interface CreateBookingInput {
  name: string;
  phone: string;
  email?: string;
  service: string;
  preferredDate: string;
  message?: string;
}

/**
 * Creates a public booking in the `bookings` collection with strict schema validation.
 * Sets status to "pending" and createdAt to serverTimestamp().
 */
export async function createBookingInDb(data: CreateBookingInput): Promise<string> {
  const colRef = collection(db, BOOKINGS_COLLECTION);

  const cleanName = sanitizeText(data.name, 200);
  const cleanPhone = sanitizeText(data.phone, 30);
  const cleanService = sanitizeText(data.service, 100);
  const cleanDate = sanitizeText(data.preferredDate, 40);
  const cleanEmail = data.email ? sanitizeText(data.email, 200) : undefined;
  const cleanMessage = data.message ? sanitizeText(data.message, 1000) : undefined;

  if (!cleanName || cleanName.length === 0) {
    throw new Error('Patient name is required (up to 200 characters).');
  }
  if (!cleanPhone || cleanPhone.length === 0) {
    throw new Error('Contact phone number is required (up to 30 characters).');
  }
  if (!cleanService || cleanService.length === 0) {
    throw new Error('Clinical service is required.');
  }
  if (!cleanDate || cleanDate.length === 0) {
    throw new Error('Preferred date is required.');
  }

  const payload: Record<string, any> = {
    name: cleanName,
    phone: cleanPhone,
    service: cleanService,
    preferredDate: cleanDate,
    status: 'pending',
    createdAt: serverTimestamp(),
  };

  if (cleanEmail) {
    payload.email = cleanEmail;
  }
  if (cleanMessage) {
    payload.message = cleanMessage;
  }

  try {
    const docRef = await addDoc(colRef, payload);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, BOOKINGS_COLLECTION);
    throw error;
  }
}

/**
 * Real-time subscription to `bookings` for admin dashboard (Requires Auth)
 */
export function subscribeToBookings(
  onUpdate: (bookings: BookingRecord[]) => void,
  onError?: (err: Error) => void
): () => void {
  const colRef = collection(db, BOOKINGS_COLLECTION);
  const q = query(colRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const records: BookingRecord[] = snapshot.docs.map((d) => {
        const data = d.data();
        let createdDate = data.createdAt;
        if (data.createdAt && typeof data.createdAt.toDate === 'function') {
          createdDate = data.createdAt.toDate().toISOString();
        }
        return {
          id: d.id,
          name: data.name || '',
          phone: data.phone || '',
          email: data.email || undefined,
          service: data.service || '',
          preferredDate: data.preferredDate || '',
          message: data.message || undefined,
          status: data.status || 'pending',
          createdAt: createdDate || new Date().toISOString(),
        };
      });
      onUpdate(records);
    },
    (err) => {
      if (onError) onError(err);
      try {
        handleFirestoreError(err, OperationType.LIST, BOOKINGS_COLLECTION);
      } catch {}
    }
  );
}

/**
 * Updates the status of a booking (Requires Admin Auth)
 */
export async function updateBookingStatus(
  bookingId: string,
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
): Promise<void> {
  const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);
  try {
    await updateDoc(docRef, { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${BOOKINGS_COLLECTION}/${bookingId}`);
    throw error;
  }
}

/**
 * Deletes a booking (Requires Admin Auth)
 */
export async function deleteBooking(bookingId: string): Promise<void> {
  const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${BOOKINGS_COLLECTION}/${bookingId}`);
    throw error;
  }
}

// ---------------------------------------------------------------------------
// 2. PUBLIC CONTACTS COLLECTION (Strict match for prompt & firestore.rules)
// ---------------------------------------------------------------------------
const CONTACTS_COLLECTION = 'contacts';

export interface CreateContactInput {
  name: string;
  phone?: string;
  email?: string;
  subject: string;
  message: string;
}

/**
 * Creates a public contact inquiry in the `contacts` collection.
 * Requires name, subject, message, and at least one of phone or email.
 * Sets status to "new" and createdAt to serverTimestamp().
 */
export async function createContactInDb(data: CreateContactInput): Promise<string> {
  const colRef = collection(db, CONTACTS_COLLECTION);

  const cleanName = sanitizeText(data.name, 200);
  const cleanSubject = sanitizeText(data.subject, 200);
  const cleanMessage = sanitizeText(data.message, 1000);
  const cleanPhone = data.phone ? sanitizeText(data.phone, 30) : undefined;
  const cleanEmail = data.email ? sanitizeText(data.email, 200) : undefined;

  if (!cleanName) throw new Error('Your name is required (up to 200 characters).');
  if (!cleanSubject) throw new Error('Subject is required (up to 200 characters).');
  if (!cleanMessage) throw new Error('Message is required (up to 1000 characters).');
  if (!cleanPhone && !cleanEmail) {
    throw new Error('Please provide at least one contact method (phone number or email address).');
  }

  const payload: Record<string, any> = {
    name: cleanName,
    subject: cleanSubject,
    message: cleanMessage,
    status: 'new',
    createdAt: serverTimestamp(),
  };

  if (cleanPhone) payload.phone = cleanPhone;
  if (cleanEmail) payload.email = cleanEmail;

  try {
    const docRef = await addDoc(colRef, payload);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, CONTACTS_COLLECTION);
    throw error;
  }
}

/**
 * Real-time subscription to `contacts` for admin dashboard (Requires Auth)
 */
export function subscribeToContacts(
  onUpdate: (contacts: ContactRecord[]) => void,
  onError?: (err: Error) => void
): () => void {
  const colRef = collection(db, CONTACTS_COLLECTION);
  const q = query(colRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const records: ContactRecord[] = snapshot.docs.map((d) => {
        const data = d.data();
        let createdDate = data.createdAt;
        if (data.createdAt && typeof data.createdAt.toDate === 'function') {
          createdDate = data.createdAt.toDate().toISOString();
        }
        return {
          id: d.id,
          name: data.name || '',
          subject: data.subject || '',
          message: data.message || '',
          phone: data.phone || undefined,
          email: data.email || undefined,
          status: data.status || 'new',
          createdAt: createdDate || new Date().toISOString(),
        };
      });
      onUpdate(records);
    },
    (err) => {
      if (onError) onError(err);
      try {
        handleFirestoreError(err, OperationType.LIST, CONTACTS_COLLECTION);
      } catch {}
    }
  );
}

/**
 * Updates the status of a contact inquiry (Requires Admin Auth)
 */
export async function updateContactStatus(
  contactId: string,
  status: 'new' | 'read' | 'responded'
): Promise<void> {
  const docRef = doc(db, CONTACTS_COLLECTION, contactId);
  try {
    await updateDoc(docRef, { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${CONTACTS_COLLECTION}/${contactId}`);
    throw error;
  }
}

/**
 * Deletes a contact inquiry (Requires Admin Auth)
 */
export async function deleteContact(contactId: string): Promise<void> {
  const docRef = doc(db, CONTACTS_COLLECTION, contactId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${CONTACTS_COLLECTION}/${contactId}`);
    throw error;
  }
}

/**
 * Translates Firebase error codes and messages into user-friendly, plain language
 */
export function translateFirebaseError(error: unknown): string {
  if (!error) return 'An unknown error occurred.';

  const str = error instanceof Error ? error.message : String(error);

  if (str.includes('permission-denied') || str.includes('Missing or insufficient permissions')) {
    return 'Access denied: You do not have permission to view or modify these records.';
  }
  if (str.includes('unavailable') || str.includes('offline') || str.includes('Could not reach Cloud Firestore')) {
    return 'The clinic database service could not be reached. Please check your internet connection and try again.';
  }
  if (str.includes('auth/wrong-password') || str.includes('auth/invalid-credential') || str.includes('INVALID_LOGIN_CREDENTIALS')) {
    return 'Invalid administrator email or password. Please verify your credentials.';
  }
  if (str.includes('auth/user-not-found')) {
    return 'No administrator account found with this email address.';
  }
  if (str.includes('auth/too-many-requests')) {
    return 'Access has been temporarily restricted due to multiple failed login attempts. Please wait a few minutes before trying again.';
  }
  if (str.includes('auth/network-request-failed')) {
    return 'Network connection issue. Please check your device connection.';
  }
  if (str.includes('auth/invalid-email')) {
    return 'Please enter a valid email address.';
  }
  if (str.includes('auth/user-disabled')) {
    return 'This administrator account has been disabled in Firebase Console.';
  }

  return 'An unexpected issue occurred. Please check your connection or contact our clinic reception directly at 0300 8479266.';
}

