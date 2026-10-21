import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  Clock,
  Phone,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock3,
  Trash2,
  Edit3,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  User,
  Activity,
  Plus,
  Save,
  Check,
  X,
  Database,
  ArrowLeft,
  Bell,
  Volume2,
  VolumeX,
  Smartphone,
  Send,
  Share2,
  Lock,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  Shield,
  Fingerprint,
  Mail,
  LogOut,
  Eye,
  EyeOff,
  LogIn,
  Key
} from 'lucide-react';
import { AppointmentRecord } from '../types';
import {
  subscribeToAppointments,
  updateAppointment,
  removeAppointment,
  createAppointmentInDb,
  authenticateStaffWithKey,
  authenticateStaffWithEmail,
  authenticateStaffWithGoogle,
  registerStaffWithEmail,
  updateStaffPassword,
  setCustomStaffPin,
  hasCustomStaffPin,
  sendStaffPasswordReset,
  logoutStaff,
  observeAuthState,
  auth
} from '../lib/firebase';
import type { User as FirebaseUser } from 'firebase/auth';
import { CLINIC_SERVICES, CLINIC_INFO } from '../data/clinicData';
import {
  playNotificationChime,
  triggerPhoneNotification,
  requestNotificationPermission,
  getNotificationPermission,
  isNotificationSupported,
} from '../utils/notificationService';

interface StaffAppointmentsPortalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StaffAppointmentsPortal: React.FC<StaffAppointmentsPortalProps> = ({
  isOpen,
  onClose,
}) => {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Walk-in / Call booking state
  const [newBooking, setNewBooking] = useState({
    patientName: '',
    phone: '',
    email: '',
    serviceId: CLINIC_SERVICES[0]?.id || 'pure-tone-audiometry',
    preferredDate: new Date().toISOString().split('T')[0],
    preferredTime: 'Morning (10:00 AM – 1:00 PM)',
    notes: '',
  });
  const [addBookingError, setAddBookingError] = useState<string | null>(null);
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);

  // Phone Notification & Sound Alert state
  const [notificationPerm, setNotificationPerm] = useState<NotificationPermission | 'unsupported'>(
    getNotificationPermission()
  );
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [recentAlert, setRecentAlert] = useState<string | null>(null);

  // Firebase Auth Current User & Authentication State (Locked by default when closed)
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(() => auth.currentUser);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authMethod, setAuthMethod] = useState<'pin' | 'email'>('pin');
  const [pinCode, setPinCode] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Close and lock helper: Guaranteed to clear session and lock whenever admin panel is closed
  const handleCloseAndLock = () => {
    setIsAuthenticated(false);
    try {
      sessionStorage.removeItem('hc_staff_authenticated');
    } catch {}
    setPinCode('');
    setPinError(null);
    setShowPin(false);
    setShowAddModal(false);
    setShowSecurityModal(false);
    setShowForgotPassword(false);
    setEditingNotesId(null);
    onClose();
  };

  // Lock desk helper: Locks view immediately and requires PIN or practitioner authentication
  const handleLockDesk = () => {
    setIsAuthenticated(false);
    try {
      sessionStorage.removeItem('hc_staff_authenticated');
    } catch {}
    setPinCode('');
    setPinError(null);
    setShowPin(false);
  };

  // Quick unlock for authenticated practitioner session
  const handleQuickUnlockPractitioner = () => {
    setIsAuthenticated(true);
    try {
      sessionStorage.setItem('hc_staff_authenticated', 'true');
    } catch {}
    setPinError(null);
    setPinCode('');
  };

  // Click on background backdrop to close and lock
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleCloseAndLock();
    }
  };

  // Critical requirement: Whenever admin panel is closed or isOpen becomes false, lock it immediately
  useEffect(() => {
    if (!isOpen) {
      setIsAuthenticated(false);
      try {
        sessionStorage.removeItem('hc_staff_authenticated');
      } catch {}
      setPinCode('');
      setPinError(null);
      setShowPin(false);
      setShowAddModal(false);
      setShowSecurityModal(false);
      setShowForgotPassword(false);
      setEditingNotesId(null);
    }
  }, [isOpen]);

  // Custom PIN & Credentials Management Modal
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [newCustomPin, setNewCustomPin] = useState('');
  const [customPinMsg, setCustomPinMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [newPasswordVal, setNewPasswordVal] = useState('');
  const [passwordChangeMsg, setPasswordChangeMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  // Brute-force protection: Dual storage persistence (localStorage + sessionStorage)
  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const l = localStorage.getItem('hc_staff_failed_attempts');
      const s = sessionStorage.getItem('hc_staff_failed_attempts');
      return Math.max(l ? parseInt(l, 10) : 0, s ? parseInt(s, 10) : 0);
    } catch {
      return 0;
    }
  });
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const l = localStorage.getItem('hc_staff_lockout_ts');
      const s = sessionStorage.getItem('hc_staff_lockout_ts');
      const expiry = Math.max(l ? parseInt(l, 10) : 0, s ? parseInt(s, 10) : 0);
      return Date.now() < expiry ? expiry : null;
    } catch {
      return null;
    }
  });
  const [lockoutCountdown, setLockoutCountdown] = useState<number>(0);

  // Forgot Password state & rate limiting
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetFeedback, setResetFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [lastResetTime, setLastResetTime] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const saved = localStorage.getItem('hc_last_pwd_reset_ts');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Countdown timer for brute-force lockout
  useEffect(() => {
    if (!lockoutUntil) {
      setLockoutCountdown(0);
      return;
    }
    const updateTimer = () => {
      const remaining = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
      setLockoutCountdown(remaining);
      if (remaining <= 0) {
        setLockoutUntil(null);
        setFailedAttempts(0);
        try {
          localStorage.removeItem('hc_staff_lockout_ts');
          sessionStorage.removeItem('hc_staff_lockout_ts');
          localStorage.removeItem('hc_staff_failed_attempts');
          sessionStorage.removeItem('hc_staff_failed_attempts');
        } catch {}
      }
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  // Keyboard shortcut: Escape key closes and locks the admin panel
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showAddModal) {
          setShowAddModal(false);
        } else if (showSecurityModal) {
          setShowSecurityModal(false);
        } else if (showForgotPassword) {
          setShowForgotPassword(false);
        } else {
          handleCloseAndLock();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showAddModal, showSecurityModal, showForgotPassword]);

  // Sync with Firebase Auth state - updates currentUser credentials for Firestore without bypassing lock screen
  useEffect(() => {
    const unsub = observeAuthState((user) => {
      setCurrentUser(user);
      if (!user) {
        setIsAuthenticated(false);
        try {
          sessionStorage.removeItem('hc_staff_authenticated');
        } catch {}
      }
    });
    return () => unsub();
  }, []);

  // 15-Minute Inactivity Auto-Lock for Reception Desk Security
  useEffect(() => {
    if (!isAuthenticated) return;
    let timer: NodeJS.Timeout;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        handleLockDesk();
      }, 15 * 60 * 1000); // 15 minutes
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('touchstart', resetTimer);
    resetTimer();

    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
    };
  }, [isAuthenticated]);

  const handleVerifyAuth = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (lockoutUntil && Date.now() < lockoutUntil) {
      setPinError(`Security Lockout: Please wait ${lockoutCountdown} seconds before retrying.`);
      return;
    }

    setIsAuthenticating(true);
    setPinError(null);

    try {
      if (authMethod === 'pin') {
        const cleanPin = pinCode.trim().toLowerCase();
        if (!currentUser && !auth.currentUser) {
          setPinError('Cloud Session Required: To securely synchronize patient records with Google Cloud Firestore, please click "Sign in with Google Account" below. Once signed in, you can unlock the reception desk with your PIN anytime.');
          return;
        }
        await authenticateStaffWithKey(cleanPin);
      } else {
        if (!staffEmail.trim() || !staffPassword) {
          throw new Error('Please enter both clinic email and password.');
        }
        if (isRegisterMode) {
          await registerStaffWithEmail(staffEmail, staffPassword);
        } else {
          await authenticateStaffWithEmail(staffEmail, staffPassword);
        }
      }

      // Success: Reset brute-force counters in dual storage
      setIsAuthenticated(true);
      sessionStorage.setItem('hc_staff_authenticated', 'true');
      setFailedAttempts(0);
      try {
        localStorage.removeItem('hc_staff_failed_attempts');
        sessionStorage.removeItem('hc_staff_failed_attempts');
        localStorage.removeItem('hc_staff_lockout_ts');
        sessionStorage.removeItem('hc_staff_lockout_ts');
      } catch {}
      setPinError(null);
      setPinCode('');
      setStaffPassword('');
    } catch (err: any) {
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);
      try {
        localStorage.setItem('hc_staff_failed_attempts', String(nextAttempts));
        sessionStorage.setItem('hc_staff_failed_attempts', String(nextAttempts));
      } catch {}

      if (nextAttempts >= 5) {
        // Progressive delay: 5-7 attempts = 5 mins, 8+ attempts = 15 mins
        const lockDurationMs = nextAttempts >= 8 ? 15 * 60 * 1000 : 5 * 60 * 1000;
        const lockExpiry = Date.now() + lockDurationMs;
        setLockoutUntil(lockExpiry);
        try {
          localStorage.setItem('hc_staff_lockout_ts', String(lockExpiry));
          sessionStorage.setItem('hc_staff_lockout_ts', String(lockExpiry));
        } catch {}
        setPinError(`Security threshold exceeded: Too many failed access attempts. Access locked for ${Math.round(lockDurationMs / 60000)} minutes.`);
      } else {
        const remainingAttempts = 5 - nextAttempts;
        let msg = '';
        if (err?.code === 'auth/operation-not-allowed') {
          msg = 'Email/Password provider is not active in this Firebase project. Please click "Sign in with Google Account" below.';
        } else if (err?.code === 'auth/email-already-in-use') {
          msg = 'This email is already registered in Firebase. Switch to Sign In or use Google Sign-In.';
        } else if (err?.code === 'auth/user-not-found' || err?.code === 'auth/invalid-credential') {
          msg = 'Account not found or password incorrect. Please sign in with Google Account below.';
        } else if (err?.code === 'auth/weak-password') {
          msg = 'Password should be at least 6 characters.';
        } else if (err?.message?.includes('Invalid Clinic Staff Key') || err?.message?.includes('Invalid Clinic Access PIN')) {
          msg = `Invalid Staff Access PIN. (${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining)`;
        } else {
          msg = err?.message || `Authentication failed. (${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining)`;
        }
        setPinError(msg);
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (lockoutUntil && Date.now() < lockoutUntil) {
      setPinError(`Security Lockout: Please wait ${lockoutCountdown} seconds before retrying.`);
      return;
    }
    setIsAuthenticating(true);
    setPinError(null);
    try {
      const user = await authenticateStaffWithGoogle();
      setCurrentUser(user);
      setIsAuthenticated(true);
      sessionStorage.setItem('hc_staff_authenticated', 'true');
      setFailedAttempts(0);
      try {
        localStorage.removeItem('hc_staff_failed_attempts');
        sessionStorage.removeItem('hc_staff_failed_attempts');
        localStorage.removeItem('hc_staff_lockout_ts');
        sessionStorage.removeItem('hc_staff_lockout_ts');
      } catch {}
    } catch (err: any) {
      console.warn('Google Sign-in error:', err);
      if (err?.code === 'auth/popup-closed-by-user') {
        setPinError('Google sign-in popup was closed before completing. Please try again.');
      } else if (err?.code === 'auth/cancelled-popup-request') {
        // Ignored
      } else {
        setPinError(err?.message || 'Google Authentication failed. Please retry.');
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSaveCustomPin = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newCustomPin.trim();
    if (clean.length < 4 || clean.length > 12) {
      setCustomPinMsg({ type: 'error', text: 'PIN must be between 4 and 12 characters.' });
      return;
    }
    setIsUpdatingSettings(true);
    setCustomPinMsg(null);
    try {
      await setCustomStaffPin(clean);
      setCustomPinMsg({ type: 'success', text: 'New custom PIN successfully saved! You can now use it to authenticate.' });
      setNewCustomPin('');
    } catch (err: any) {
      setCustomPinMsg({ type: 'error', text: err?.message || 'Failed to update PIN.' });
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPasswordVal.length < 6) {
      setPasswordChangeMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    setIsUpdatingSettings(true);
    setPasswordChangeMsg(null);
    try {
      await updateStaffPassword(newPasswordVal);
      setPasswordChangeMsg({ type: 'success', text: 'Password successfully updated in Firebase Auth!' });
      setNewPasswordVal('');
    } catch (err: any) {
      setPasswordChangeMsg({ type: 'error', text: err?.message || 'Failed to update password. Please re-authenticate first.' });
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const handleSendPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = (forgotEmail || staffEmail).trim().toLowerCase();
    if (!targetEmail || !targetEmail.includes('@')) {
      setResetFeedback({ type: 'error', message: 'Please enter a valid clinic email address.' });
      return;
    }

    // Rate limit: 60s cooldown between password reset triggers
    const now = Date.now();
    const elapsed = now - lastResetTime;
    if (elapsed < 60000) {
      const waitSec = Math.ceil((60000 - elapsed) / 1000);
      setResetFeedback({
        type: 'error',
        message: `Rate limit active: Please wait ${waitSec} seconds before requesting another password reset.`
      });
      return;
    }

    setIsSendingReset(true);
    setResetFeedback(null);

    try {
      await sendStaffPasswordReset(targetEmail);
      setLastResetTime(now);
      try {
        localStorage.setItem('hc_last_pwd_reset_ts', String(now));
      } catch {}
      setResetFeedback({
        type: 'success',
        message: `Password reset request dispatched for ${targetEmail}. Please check your inbox AND Spam/Junk folder. Note: If this email was never registered in Firebase, Google will not send a reset email — you can register/activate your password directly or use Google Sign-In.`
      });
    } catch (err: any) {
      console.warn('Password reset error:', err);
      // Give safe feedback without exposing system internals
      const message = err?.code === 'auth/user-not-found'
        ? 'No authorized clinic practitioner found with this email. You can activate it directly.'
        : err?.message || 'Unable to dispatch reset email. Please contact clinic IT.';
      setResetFeedback({ type: 'error', message });
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutStaff();
    } catch (e) {
      console.warn('Logout warning:', e);
    }
    setCurrentUser(null);
    setIsAuthenticated(false);
    setAppointments([]);
    sessionStorage.removeItem('hc_staff_authenticated');
  };

  // Track known IDs so we only alert for NEW incoming bookings
  const knownIdsRef = useRef<Set<string>>(new Set());
  const initialSyncRef = useRef<boolean>(true);

  // Real-time Firestore subscription with live phone & sound alert dispatch (ONLY WHEN AUTHENTICATED)
  useEffect(() => {
    if (!isOpen || !isAuthenticated || !currentUser) {
      if (!isAuthenticated || !currentUser) {
        setAppointments([]);
      }
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToAppointments(
      (data) => {
        if (initialSyncRef.current) {
          knownIdsRef.current = new Set(data.map((item) => item.id));
          initialSyncRef.current = false;
        } else {
          // Identify any new appointments added in Firestore
          const newAppointments = data.filter((item) => !knownIdsRef.current.has(item.id));
          if (newAppointments.length > 0) {
            newAppointments.forEach((newApp) => {
              knownIdsRef.current.add(newApp.id);

              // Play audible medical chime
              if (soundEnabled) {
                playNotificationChime();
              }

              // Fire phone notification with vibration
              triggerPhoneNotification(
                `🔔 New Appointment: ${newApp.patientName}`,
                `Requested ${newApp.serviceName} • 📅 ${newApp.preferredDate} (${newApp.preferredTime})`
              );

              setRecentAlert(`New booking received: ${newApp.patientName} (${newApp.serviceName})`);
            });
          }
        }

        setAppointments(data);
        setLoading(false);
        setError(null);
      },
      (err: any) => {
        const msg = err?.message || '';
        if (msg.includes('permission') || msg.includes('insufficient')) {
          setError('Google Cloud Security: Please sign in with the clinic Google account (waleedliaqat69@gmail.com) to synchronize patient records.');
        } else if (msg.includes('unavailable') || msg.includes('offline')) {
          setError('Operating in offline mode. The client will automatically reconnect when a network connection is available.');
        } else {
          setError('Failed to load appointments from Firestore. Please check connection.');
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isOpen, isAuthenticated, currentUser, soundEnabled]);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationPerm(granted ? 'granted' : 'denied');
    if (granted) {
      triggerPhoneNotification(
        'Phone Notifications Active! 🔔',
        'Hearing Clinic Reception Desk will now notify your phone for all new appointments.'
      );
      setRecentAlert('Phone notifications activated successfully.');
    }
  };

  const handleTestAlert = () => {
    if (soundEnabled) {
      playNotificationChime();
    }
    triggerPhoneNotification(
      'Test Alert: Hearing Clinic Lahore 🔔',
      'Audio chime and phone push notification are active and working!'
    );
    setRecentAlert('Test notification dispatched to your phone/browser.');
  };

  if (!isOpen) return null;

  const handleStatusChange = async (
    id: string,
    newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  ) => {
    setIsUpdating(id);
    try {
      await updateAppointment(id, { status: newStatus });
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Could not update status. Please check your connection.');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleSaveNotes = async (id: string) => {
    setIsUpdating(id);
    try {
      await updateAppointment(id, { internalNotes: tempNotes });
      setEditingNotesId(null);
    } catch (err) {
      console.error('Failed to save staff notes:', err);
      alert('Could not save notes.');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDelete = async (id: string, patientName: string) => {
    if (window.confirm(`Are you sure you want to remove the appointment for ${patientName}?`)) {
      try {
        await removeAppointment(id);
      } catch (err) {
        console.error('Failed to delete appointment:', err);
        alert('Could not delete appointment.');
      }
    }
  };

  const handleCreateWalkIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBooking.patientName.trim() || !newBooking.phone.trim()) {
      setAddBookingError('Please enter both Patient Name and Phone Number.');
      return;
    }

    setIsSubmittingNew(true);
    setAddBookingError(null);

    const serviceObj = CLINIC_SERVICES.find((s) => s.id === newBooking.serviceId);

    try {
      await createAppointmentInDb({
        patientName: newBooking.patientName,
        phone: newBooking.phone,
        email: newBooking.email,
        serviceId: newBooking.serviceId,
        serviceName: serviceObj?.name || 'General Audiology Consultation',
        preferredDate: newBooking.preferredDate,
        preferredTime: newBooking.preferredTime,
        notes: newBooking.notes ? `[Walk-in / Desk Logged]: ${newBooking.notes}` : '[Logged by Reception Desk]',
      });

      setShowAddModal(false);
      setNewBooking({
        patientName: '',
        phone: '',
        email: '',
        serviceId: CLINIC_SERVICES[0]?.id || 'pure-tone-audiometry',
        preferredDate: new Date().toISOString().split('T')[0],
        preferredTime: 'Morning (10:00 AM – 1:00 PM)',
        notes: '',
      });
    } catch (err) {
      console.error('Failed to create walk-in appointment:', err);
      setAddBookingError('Failed to record appointment in database.');
    } finally {
      setIsSubmittingNew(false);
    }
  };

  // Filtered appointments
  const filteredAppointments = appointments.filter((app) => {
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      app.patientName.toLowerCase().includes(query) ||
      app.phone.toLowerCase().includes(query) ||
      app.serviceName.toLowerCase().includes(query) ||
      (app.notes && app.notes.toLowerCase().includes(query));

    return matchesStatus && matchesQuery;
  });

  // Count statistics
  const pendingCount = appointments.filter((a) => a.status === 'pending').length;
  const confirmedCount = appointments.filter((a) => a.status === 'confirmed').length;
  const completedCount = appointments.filter((a) => a.status === 'completed').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
            <Clock3 className="h-3.5 w-3.5 text-amber-700" />
            Pending Confirmation
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-700" />
            Confirmed
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-900 border border-blue-300">
            <Check className="h-3.5 w-3.5 text-blue-700" />
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-900 border border-rose-300">
            <XCircle className="h-3.5 w-3.5 text-rose-700" />
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const formatCleanWhatsApp = (phone: string) => {
    // Convert 0300 1234567 or 03214190400 to 923001234567
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('0')) {
      return `92${digits.slice(1)}`;
    }
    if (digits.startsWith('92')) {
      return digits;
    }
    return digits;
  };

  if (!isOpen) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lock-title"
        onClick={handleBackdropClick}
        className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E5DFD5] overflow-hidden text-[#1B2928] my-auto"
        >
          <div className="bg-[#0F3838] p-5 sm:p-6 text-white text-center relative border-b border-[#0A2727]">
            <button
              type="button"
              onClick={handleCloseAndLock}
              className="absolute right-2 top-2 sm:right-3 sm:top-3 text-white/80 hover:text-white p-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mx-auto w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-emerald-300 mb-3 border border-emerald-400/20 shadow-inner">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 id="lock-title" className="font-editorial text-lg sm:text-xl font-bold">Hearing Clinic Lahore</h2>
            <p className="text-xs text-white/80 mt-0.5">Staff & Patient Records Management Desk</p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-300 text-[10px] sm:text-[11px] font-medium border border-emerald-500/30">
              <Lock className="h-3 w-3" />
              <span>Zero-Trust Google Cloud Security Active</span>
            </div>
          </div>

          {/* Auth Method Switcher & Forgot Password view */}
          {showForgotPassword ? (
            <div className="p-4 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetFeedback(null);
                  }}
                  className="p-2 rounded-md text-[#556B69] hover:text-[#0F3838] hover:bg-[#F3EEE7] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Back to Login"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div>
                  <h3 className="text-sm font-bold text-[#1B2928]">Staff Password Recovery</h3>
                  <p className="text-xs text-[#556B69]">
                    Firebase Auth will dispatch a secure one-time reset link.
                  </p>
                </div>
              </div>

              {resetFeedback && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                    resetFeedback.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}
                >
                  {resetFeedback.type === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <span className="leading-relaxed">{resetFeedback.message}</span>
                </div>
              )}

              <form onSubmit={handleSendPasswordReset} className="space-y-4">
                <div>
                  <label htmlFor="recovery-email" className="block text-xs font-bold text-[#1B2928] mb-1">
                    Registered Clinic Practitioner Email
                  </label>
                  <input
                    id="recovery-email"
                    type="email"
                    required
                    disabled={isSendingReset}
                    placeholder="e.g. waleedliaqat69@gmail.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-base sm:text-xs rounded-lg border border-[#E5DFD5] bg-[#FAF8F5] text-[#1B2928] focus:outline-none focus:ring-2 focus:ring-[#0F3838] min-h-[44px]"
                  />
                  <p className="text-[11px] text-[#556B69] mt-1">
                    Enter the authorized email associated with your clinic administrator or practitioner profile.
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetFeedback(null);
                    }}
                    className="flex-1 py-3 px-4 rounded-lg border border-[#E5DFD5] bg-white text-xs font-semibold text-[#556B69] hover:bg-[#F3EEE7] transition-colors min-h-[44px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingReset}
                    className="flex-1 py-3 px-4 rounded-lg bg-[#0F3838] hover:bg-[#1A5454] text-xs font-bold text-white transition-colors flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50 min-h-[44px]"
                  >
                    {isSendingReset ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Sending Link...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        <span>Send Reset Link</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="pt-3 border-t border-[#E5DFD5] text-center space-y-1">
                  <p className="text-[11px] text-[#556B69]">
                    Not receiving the email or need to set up your password?
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setAuthMethod('email');
                      setIsRegisterMode(true);
                      setStaffEmail(forgotEmail || '');
                      setResetFeedback(null);
                    }}
                    className="text-xs font-bold text-[#0F3838] hover:underline min-h-[36px] inline-flex items-center justify-center"
                  >
                    → Register &amp; Set Password directly
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-4 sm:p-6 space-y-4">
              {/* Brute-force lockout alert */}
              {lockoutUntil && lockoutCountdown > 0 && (
                <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-900 text-xs">
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <ShieldAlert className="h-4 w-4 text-red-600 shrink-0" />
                    <span>Brute-Force Rate Limiting Active</span>
                  </div>
                  <p className="text-red-700 leading-relaxed">
                    Too many incorrect authentication attempts. To protect patient medical confidentiality, portal access is locked for:
                  </p>
                  <div className="mt-2 font-mono text-center text-base font-bold text-red-700 bg-white py-1 rounded border border-red-200">
                    {Math.floor(lockoutCountdown / 60)}m {lockoutCountdown % 60}s
                  </div>
                </div>
              )}

              {/* Primary Google Cloud SSO Sign-In Card */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F3838] flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    {currentUser ? 'Active Practitioner Session' : 'Verified Practitioner Access'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                    {currentUser ? 'Session Connected' : 'Cloud Auth Active'}
                  </span>
                </div>

                {currentUser ? (
                  <>
                    <p className="text-xs text-[#556B69] leading-relaxed">
                      Signed in as <strong className="text-[#1B2928]">{currentUser.email || 'Practitioner'}</strong>. Portal is locked for patient medical confidentiality.
                    </p>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <button
                        type="button"
                        onClick={handleQuickUnlockPractitioner}
                        disabled={Boolean(lockoutUntil && lockoutCountdown > 0) || isAuthenticating}
                        className="flex-1 py-3 px-4 rounded-lg bg-[#0F3838] hover:bg-[#1A5454] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50 min-h-[44px]"
                      >
                        <ShieldCheck className="h-4 w-4 text-emerald-300" />
                        <span>1-Click Unlock Desk</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="py-3 px-4 rounded-lg border border-[#E5DFD5] bg-white hover:bg-red-50 hover:text-red-700 text-[#556B69] text-xs font-semibold transition-colors min-h-[44px]"
                        title="Sign out of Google Account"
                      >
                        Sign Out
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-[#556B69] leading-relaxed">
                      Sign in with the authorized clinic practitioner account (<strong className="text-[#1B2928]">waleedliaqat69@gmail.com</strong>) to securely view and manage patient appointments.
                    </p>
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={Boolean(lockoutUntil && lockoutCountdown > 0) || isAuthenticating}
                      className="w-full py-3 px-4 rounded-lg bg-[#0F3838] hover:bg-[#1A5454] text-white text-xs font-bold transition-all flex items-center justify-center gap-2.5 shadow-sm hover:shadow-md disabled:opacity-50 min-h-[44px]"
                    >
                      <LogIn className="h-4 w-4 text-emerald-300" />
                      <span>Sign in with Google Account</span>
                    </button>
                  </>
                )}
              </div>

              {/* Divider */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-[#E5DFD5]"></div>
                <span className="flex-shrink mx-3 text-[11px] text-[#556B69] uppercase font-semibold">Or Quick PIN Unlock</span>
                <div className="flex-grow border-t border-[#E5DFD5]"></div>
              </div>

              {/* Staff PIN Form */}
              <form onSubmit={handleVerifyAuth} className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="staff-pin" className="block text-xs font-bold text-[#1B2928]">
                      Desk Unlock PIN
                    </label>
                    <span className="text-[11px] text-[#556B69]">Reception Quick-Lock</span>
                  </div>
                  <div className="relative">
                    <input
                      id="staff-pin"
                      type={showPin ? 'text' : 'password'}
                      inputMode="numeric"
                      maxLength={12}
                      disabled={Boolean(lockoutUntil && lockoutCountdown > 0) || isAuthenticating}
                      placeholder="Enter Staff Access PIN"
                      value={pinCode}
                      onChange={(e) => {
                        setPinCode(e.target.value);
                        if (pinError) setPinError(null);
                      }}
                      className="w-full px-4 py-3 rounded-lg border border-[#E5DFD5] bg-[#FAF8F5] text-[#1B2928] font-mono text-center tracking-widest text-lg sm:text-base focus:outline-none focus:ring-2 focus:ring-[#0F3838] focus:border-transparent disabled:opacity-50 min-h-[48px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[#556B69] hover:text-[#1B2928] p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                      aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
                    >
                      {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {pinError && (
                  <div className="p-2.5 rounded-md bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{pinError}</span>
                  </div>
                )}

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCloseAndLock}
                    className="flex-1 py-3 px-4 rounded-lg border border-[#E5DFD5] bg-white text-xs font-semibold text-[#556B69] hover:bg-[#F3EEE7] transition-colors min-h-[44px]"
                  >
                    Back to Website
                  </button>
                  <button
                    type="submit"
                    disabled={Boolean(lockoutUntil && lockoutCountdown > 0) || isAuthenticating}
                    className="flex-1 py-3 px-4 rounded-lg bg-[#FAF8F5] hover:bg-[#F3EEE7] text-[#0F3838] border border-[#0F3838]/20 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50 min-h-[44px]"
                  >
                    {isAuthenticating ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="h-3.5 w-3.5" />
                        <span>Unlock with PIN</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="portal-title"
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 lg:p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FAF8F5] w-full h-full sm:h-auto sm:max-h-[92vh] max-w-6xl rounded-none sm:rounded-2xl shadow-2xl border-0 sm:border border-[#E5DFD5] flex flex-col overflow-hidden text-[#1B2928] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Top Header Bar */}
        <div className="bg-[#0F3838] text-[#FAF8F5] px-3.5 sm:px-6 py-3 sm:py-4 flex flex-col gap-3 border-b border-[#092626] shrink-0">
          {/* Top Row: Icon + Title + Status badge + Close button */}
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-white/10 flex items-center justify-center text-[#FAF8F5] shrink-0">
                <Database className="h-4.5 w-4.5 sm:h-5 sm:w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <h2 id="portal-title" className="font-editorial text-base sm:text-xl font-bold tracking-tight text-white truncate">
                    Reception Desk
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Live Cloud</span>
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-white/75 truncate">
                  Gulberg III, Lahore • Real-time patient bookings
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCloseAndLock}
              className="h-10 w-10 sm:h-9 sm:w-9 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              aria-label="Close & Lock Staff Portal"
              title="Close and Lock"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Action buttons row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 -mx-1 px-1">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#FAF8F5] text-[#0F3838] text-xs font-bold hover:bg-white transition-colors shadow-xs min-h-[42px] whitespace-nowrap"
            >
              <Plus className="h-4 w-4 shrink-0" />
              <span>+ Record Walk-in</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowSecurityModal(true);
                setCustomPinMsg(null);
                setPasswordChangeMsg(null);
              }}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors min-h-[42px] whitespace-nowrap"
              title="Change Staff PIN or account password"
            >
              <Key className="h-4 w-4 shrink-0" />
              <span>PIN &amp; Security</span>
            </button>

            <button
              type="button"
              onClick={handleLockDesk}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors min-h-[42px] whitespace-nowrap"
              title="Lock reception desk immediately"
            >
              <Lock className="h-4 w-4 shrink-0" />
              <span>Lock</span>
            </button>
          </div>
        </div>

        {/* Sub-Header KPI Metrics */}
        <div className="bg-[#F3EEE7] border-b border-[#E5DFD5] px-3.5 sm:px-6 py-3 sm:py-3.5 shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-xs">
            <div className="flex items-center gap-2.5 sm:gap-3 bg-white/80 p-2.5 sm:px-3.5 sm:py-2 rounded-lg border border-[#E5DFD5]">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded bg-[#EEF4F3] flex items-center justify-center text-[#0F3838] font-bold shrink-0 text-xs sm:text-sm">
                {appointments.length}
              </div>
              <div className="min-w-0">
                <span className="block text-[#556B69] text-[10px] sm:text-[11px] truncate">Total</span>
                <span className="font-bold text-[#1B2928] text-xs sm:text-sm">{appointments.length} Records</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3 bg-white/80 p-2.5 sm:px-3.5 sm:py-2 rounded-lg border border-[#E5DFD5]">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded bg-amber-100 flex items-center justify-center text-amber-800 font-bold shrink-0 text-xs sm:text-sm">
                {pendingCount}
              </div>
              <div className="min-w-0">
                <span className="block text-[#556B69] text-[10px] sm:text-[11px] truncate">Pending</span>
                <span className="font-bold text-amber-900 text-xs sm:text-sm">{pendingCount} Waiting</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3 bg-white/80 p-2.5 sm:px-3.5 sm:py-2 rounded-lg border border-[#E5DFD5]">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold shrink-0 text-xs sm:text-sm">
                {confirmedCount}
              </div>
              <div className="min-w-0">
                <span className="block text-[#556B69] text-[10px] sm:text-[11px] truncate">Confirmed</span>
                <span className="font-bold text-emerald-900 text-xs sm:text-sm">{confirmedCount} Scheduled</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3 bg-white/80 p-2.5 sm:px-3.5 sm:py-2 rounded-lg border border-[#E5DFD5]">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded bg-blue-100 flex items-center justify-center text-blue-800 font-bold shrink-0 text-xs sm:text-sm">
                {completedCount}
              </div>
              <div className="min-w-0">
                <span className="block text-[#556B69] text-[10px] sm:text-[11px] truncate">Completed</span>
                <span className="font-bold text-blue-900 text-xs sm:text-sm">{completedCount} Visited</span>
              </div>
            </div>
          </div>

          {/* Security & Data Protection Bar */}
          <div className="mt-2.5 pt-2 border-t border-[#E5DFD5]/60 flex flex-wrap items-center justify-between gap-1.5 text-[10px] sm:text-[11px] text-[#556B69]">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span className="font-semibold text-[#0F3838]">Zero-Trust Security Active</span>
              <span className="hidden md:inline">• Rules Enforced • Public Reading Prohibited</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="inline-flex items-center gap-1 text-slate-600">
                <Clock className="h-3 w-3" />
                Auto-lock 30m
              </span>
              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-medium">
                <Fingerprint className="h-3 w-3" />
                Encrypted
              </span>
            </div>
          </div>

          {/* Live Phone Notification & Audio Alert Control Bar */}
          <div className="mt-2.5 pt-2 border-t border-[#E5DFD5]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-[#0F3838] text-white flex items-center justify-center shrink-0">
                <Bell className="h-3 w-3" />
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-[#1B2928] flex items-center gap-1.5 text-xs">
                  <span>Inquiry Audio &amp; Phone Alerts</span>
                  {notificationPerm === 'granted' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full border border-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-ping" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-[10px] font-medium text-[#556B69] bg-[#E5DFD5] px-1.5 py-0.5 rounded-full">
                      Ready
                    </span>
                  )}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {notificationPerm !== 'granted' && (
                <button
                  type="button"
                  onClick={handleEnableNotifications}
                  className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-md bg-[#0F3838] text-white font-semibold text-[11px] sm:text-xs hover:bg-[#1A5454] transition-colors shadow-2xs min-h-[36px]"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  <span>Enable Push Alerts</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-md border text-[11px] sm:text-xs font-semibold transition-colors min-h-[36px] ${
                  soundEnabled
                    ? 'bg-white border-[#E5DFD5] text-[#1B2928] hover:bg-[#F3EEE7]'
                    : 'bg-amber-50 border-amber-300 text-amber-900'
                }`}
                title="Toggle chime sound"
              >
                {soundEnabled ? (
                  <>
                    <Volume2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Sound: ON</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="h-3.5 w-3.5 text-amber-700" />
                    <span>Sound: OFF</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleTestAlert}
                className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-md bg-white border border-[#E5DFD5] text-[#0F3838] font-semibold text-[11px] sm:text-xs hover:bg-[#F3EEE7] transition-colors shadow-2xs min-h-[36px]"
                title="Dispatch a test push notification and sound alert to this device"
              >
                <Bell className="h-3.5 w-3.5" />
                <span>Test Alert</span>
              </button>
            </div>
          </div>

          {/* Real-time Alert Toast Notification */}
          {recentAlert && (
            <div className="mt-2.5 p-2 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center justify-between animate-in fade-in slide-in-from-top-1">
              <span className="flex items-center gap-2 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                {recentAlert}
              </span>
              <button
                type="button"
                onClick={() => setRecentAlert(null)}
                className="text-emerald-700 hover:text-emerald-900 font-bold px-2 py-1 min-h-[36px] flex items-center"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>

        {/* Toolbar: Search and Filter Tabs */}
        <div className="p-3 sm:px-6 border-b border-[#E5DFD5] bg-white flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between shrink-0">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 -mx-1 px-1">
            {[
              { id: 'all', label: `All (${appointments.length})` },
              { id: 'pending', label: `Pending (${pendingCount})` },
              { id: 'confirmed', label: `Confirmed (${confirmedCount})` },
              { id: 'completed', label: `Completed (${completedCount})` },
              { id: 'cancelled', label: 'Cancelled' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors min-h-[38px] ${
                  statusFilter === tab.id
                    ? 'bg-[#0F3838] text-[#FAF8F5]'
                    : 'bg-[#F3EEE7] text-[#1B2928] hover:bg-[#E5DFD5]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-3 sm:top-2.5 h-4 w-4 text-[#556B69]" />
            <input
              type="text"
              placeholder="Search patient, phone, service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 sm:py-1.5 text-base sm:text-xs rounded-lg border border-[#E5DFD5] bg-[#FAF8F5] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0F3838] min-h-[42px] sm:min-h-[36px]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 sm:top-2 text-[#556B69] hover:text-[#1B2928] text-xs p-1"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Main Appointment Records Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#FAF8F5]">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-[#0F3838] border-t-transparent" />
              <p className="text-xs text-[#556B69]">Synchronizing appointments with Google Cloud Firestore...</p>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-800 space-y-2">
              <AlertCircle className="h-6 w-6 mx-auto text-rose-600" />
              <p className="font-semibold text-sm">{error}</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="py-16 text-center max-w-md mx-auto space-y-4">
              <div className="h-16 w-16 rounded-full bg-[#EEF4F3] flex items-center justify-center text-[#0F3838] mx-auto">
                <Calendar className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-editorial text-xl font-bold text-[#1B2928]">
                  {appointments.length === 0 ? 'No Appointments in Database Yet' : 'No Matching Appointments'}
                </h3>
                <p className="text-xs text-[#556B69]">
                  {appointments.length === 0
                    ? 'When a patient fills out the booking form on the website, their appointment appears here instantly in real time.'
                    : 'Try changing your search term or filter selection above.'}
                </p>
              </div>
              {appointments.length === 0 && (
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#0F3838] text-[#FAF8F5] text-xs font-semibold hover:bg-[#1A5454]"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Sample / Test Booking</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((app) => {
                const dateObj = new Date(app.createdAt);
                const formattedCreated = !isNaN(dateObj.getTime())
                  ? dateObj.toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : app.createdAt;

                const waNumber = formatCleanWhatsApp(app.phone);

                return (
                  <div
                    key={app.id}
                    className="rounded-xl border border-[#E5DFD5] bg-white p-3.5 sm:p-5 shadow-2xs hover:border-[#0F3838]/40 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      {/* Left: Patient Info & Service */}
                      <div className="space-y-3 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-editorial text-base sm:text-lg font-bold text-[#1B2928]">
                              {app.patientName}
                            </span>
                            <span className="text-[11px] font-mono text-[#556B69] bg-[#F3EEE7] px-2 py-0.5 rounded">
                              ID: {app.id.slice(-6).toUpperCase()}
                            </span>
                          </div>
                          {getStatusBadge(app.status)}
                        </div>

                        {/* Contact Details & Direct Call / WhatsApp */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-[#556B69]">
                            <div className="flex items-center gap-1.5 font-bold text-[#1B2928] bg-[#FAF8F5] px-2.5 py-1.5 rounded-lg border border-[#EDE8E1]">
                              <Phone className="h-3.5 w-3.5 text-[#0F3838]" />
                              <span className="font-mono text-xs sm:text-sm">{app.phone}</span>
                            </div>
                            {app.email && (
                              <span className="text-[#556B69] text-xs">
                                {app.email}
                              </span>
                            )}
                          </div>

                          {/* Quick Communication Actions */}
                          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 text-xs">
                            <a
                              href={`tel:${app.phone.replace(/\s+/g, '')}`}
                              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#0F3838]/10 text-[#0F3838] font-bold hover:bg-[#0F3838]/20 transition-colors min-h-[40px]"
                              title="Call Patient Directly"
                            >
                              <Phone className="h-3.5 w-3.5" />
                              <span>Call</span>
                            </a>

                            {waNumber && (
                              <a
                                href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                                  `Hello ${app.patientName}, this is Hearing Clinic Lahore regarding your audiology appointment for ${app.serviceName}.`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold hover:bg-emerald-100 transition-colors min-h-[40px]"
                                title="Send WhatsApp confirmation message to patient"
                              >
                                <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                                <span>WhatsApp</span>
                              </a>
                            )}

                            <a
                              href={`https://wa.me/${CLINIC_INFO.whatsAppNumber}?text=${encodeURIComponent(
                                `🔔 *HEARING CLINIC APPOINTMENT ALERT*\n\n• *Patient*: ${app.patientName}\n• *Phone*: ${app.phone}\n• *Service*: ${app.serviceName}\n• *Date*: ${app.preferredDate}\n• *Time Window*: ${app.preferredTime}\n• *Current Status*: ${app.status.toUpperCase()}\n• *Notes*: ${app.notes || 'None'}\n• *Ref ID*: ${app.id.slice(-6).toUpperCase()}`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#25D366]/10 text-[#075E54] border border-[#25D366]/30 font-bold hover:bg-[#25D366]/20 transition-colors min-h-[40px]"
                              title="Forward appointment alert to Clinic Manager on WhatsApp"
                            >
                              <Share2 className="h-3.5 w-3.5 text-[#25D366]" />
                              <span>Forward to Desk</span>
                            </a>
                          </div>
                        </div>

                        {/* Service & Preferred Date */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="bg-[#FAF8F5] p-2.5 rounded-lg border border-[#EDE8E1]">
                            <span className="block text-[10px] sm:text-[11px] text-[#556B69] uppercase font-bold tracking-wider">
                              Requested Service
                            </span>
                            <span className="font-semibold text-[#0F3838] text-xs sm:text-sm">
                              {app.serviceName}
                            </span>
                          </div>

                          <div className="bg-[#FAF8F5] p-2.5 rounded-lg border border-[#EDE8E1]">
                            <span className="block text-[10px] sm:text-[11px] text-[#556B69] uppercase font-bold tracking-wider">
                              Preferred Visit Time
                            </span>
                            <span className="font-semibold text-[#1B2928] text-xs sm:text-sm">
                              📅 {app.preferredDate} • ⏰ {app.preferredTime}
                            </span>
                          </div>
                        </div>

                        {/* Patient Notes */}
                        {app.notes && (
                          <div className="text-xs bg-[#F9F7F4] p-2.5 rounded-lg border border-[#E5DFD5]/70 text-[#556B69]">
                            <strong className="text-[#1B2928]">Patient Symptoms / Note: </strong>
                            <span>{app.notes}</span>
                          </div>
                        )}

                        {/* Internal Reception Notes */}
                        <div className="text-xs">
                          {editingNotesId === app.id ? (
                            <div className="space-y-2 bg-[#FAF8F5] p-3 rounded-lg border border-[#0F3838]/30">
                              <label className="block font-semibold text-[#0F3838]">
                                Staff / Receptionist Internal Note:
                              </label>
                              <textarea
                                value={tempNotes}
                                onChange={(e) => setTempNotes(e.target.value)}
                                placeholder="E.g. Called patient, confirmed for 11:30 AM with Dr. Asif. Pure Tone Audiometry booth reserved."
                                className="w-full text-base sm:text-xs p-2.5 rounded-lg border border-[#E5DFD5] bg-white focus:outline-none focus:ring-1 focus:ring-[#0F3838]"
                                rows={2}
                              />
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleSaveNotes(app.id)}
                                  disabled={isUpdating === app.id}
                                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#0F3838] text-white rounded-lg text-xs font-semibold hover:bg-[#1A5454] min-h-[40px]"
                                >
                                  <Save className="h-3.5 w-3.5" />
                                  <span>Save Note</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingNotesId(null)}
                                  className="px-3 py-2 bg-white border border-[#E5DFD5] text-[#1B2928] rounded-lg text-xs min-h-[40px]"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs bg-[#FAF8F5] px-3 py-2 rounded-lg border border-[#EDE8E1]">
                              <div>
                                <span className="font-semibold text-[#0F3838]">Desk Note: </span>
                                <span className="text-[#556B69]">
                                  {app.internalNotes || 'No internal note yet.'}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingNotesId(app.id);
                                  setTempNotes(app.internalNotes || '');
                                }}
                                className="inline-flex items-center gap-1 text-[#0F3838] font-semibold hover:underline self-start sm:self-auto py-1"
                              >
                                <Edit3 className="h-3 w-3" />
                                <span>{app.internalNotes ? 'Edit' : '+ Add Note'}</span>
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="text-[11px] text-[#556B69]/80">
                          Logged: {formattedCreated}
                        </div>
                      </div>

                      {/* Right: Quick Action Controls */}
                      <div className="w-full lg:w-48 flex flex-col gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#E5DFD5]">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#556B69]">
                          Manage Status
                        </span>

                        <div className="grid grid-cols-2 lg:flex lg:flex-col gap-2">
                          {app.status !== 'confirmed' && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(app.id, 'confirmed')}
                              disabled={isUpdating === app.id}
                              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-2xs min-h-[40px]"
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span>Confirm</span>
                            </button>
                          )}

                          {app.status !== 'completed' && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(app.id, 'completed')}
                              disabled={isUpdating === app.id}
                              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-2xs min-h-[40px]"
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                              <span>Complete</span>
                            </button>
                          )}

                          {app.status !== 'pending' && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(app.id, 'pending')}
                              disabled={isUpdating === app.id}
                              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold hover:bg-amber-200 transition-colors min-h-[40px]"
                            >
                              <Clock3 className="h-3.5 w-3.5" />
                              <span>Set Pending</span>
                            </button>
                          )}

                          {app.status !== 'cancelled' && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(app.id, 'cancelled')}
                              disabled={isUpdating === app.id}
                              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-[#E5DFD5] text-rose-700 text-xs font-semibold hover:bg-rose-50 transition-colors min-h-[40px]"
                            >
                              <X className="h-3.5 w-3.5" />
                              <span>Cancel</span>
                            </button>
                          )}
                        </div>

                        <div className="pt-1.5 border-t border-[#EDE8E1]">
                          <button
                            type="button"
                            onClick={() => handleDelete(app.id, app.patientName)}
                            className="w-full inline-flex items-center justify-center gap-1 text-xs text-rose-600 hover:text-rose-800 transition-colors py-1.5 min-h-[36px]"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Remove Record</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer / Database Info Bar */}
        <div className="bg-[#F3EEE7] px-3.5 sm:px-6 py-2.5 sm:py-3 border-t border-[#E5DFD5] flex flex-col sm:flex-row items-center justify-between gap-1.5 text-[11px] sm:text-xs text-[#556B69] shrink-0">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-600 shrink-0" />
            <span className="truncate">
              Firestore: <strong>ai-studio-hearingcliniclah</strong>
            </span>
          </div>
          <div>
            <span>Reception Desk: <strong>{CLINIC_INFO.phone}</strong></span>
          </div>
        </div>
      </div>

      {/* Add Walk-in / Phone Inbound Modal */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-60 overflow-y-auto bg-black/70 flex items-center justify-center p-3 sm:p-4"
        >
          <div className="bg-white max-w-lg w-full max-h-[92vh] overflow-y-auto rounded-2xl p-4 sm:p-6 shadow-2xl border border-[#E5DFD5] space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-3">
              <h3 className="font-editorial text-lg sm:text-xl font-bold text-[#1B2928]">
                Record Walk-in or Phone Booking
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="h-9 w-9 rounded-lg text-[#556B69] hover:text-[#1B2928] hover:bg-[#F3EEE7] flex items-center justify-center transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {addBookingError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
                {addBookingError}
              </div>
            )}

            <form onSubmit={handleCreateWalkIn} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#1B2928] mb-1">
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tariq Mehmood"
                  value={newBooking.patientName}
                  onChange={(e) =>
                    setNewBooking((prev) => ({ ...prev, patientName: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-xs rounded-lg border border-[#E5DFD5] focus:outline-none focus:ring-1 focus:ring-[#0F3838] min-h-[44px] sm:min-h-[38px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1B2928] mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0300 1234567"
                    value={newBooking.phone}
                    onChange={(e) =>
                      setNewBooking((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-xs rounded-lg border border-[#E5DFD5] focus:outline-none focus:ring-1 focus:ring-[#0F3838] min-h-[44px] sm:min-h-[38px]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1B2928] mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="name@gmail.com"
                    value={newBooking.email}
                    onChange={(e) =>
                      setNewBooking((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-xs rounded-lg border border-[#E5DFD5] focus:outline-none focus:ring-1 focus:ring-[#0F3838] min-h-[44px] sm:min-h-[38px]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1B2928] mb-1">
                  Audiology Service
                </label>
                <select
                  value={newBooking.serviceId}
                  onChange={(e) =>
                    setNewBooking((prev) => ({ ...prev, serviceId: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-xs rounded-lg border border-[#E5DFD5] focus:outline-none focus:ring-1 focus:ring-[#0F3838] bg-white min-h-[44px] sm:min-h-[38px]"
                >
                  {CLINIC_SERVICES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.durationMinutes} mins)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1B2928] mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newBooking.preferredDate}
                    onChange={(e) =>
                      setNewBooking((prev) => ({ ...prev, preferredDate: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-xs rounded-lg border border-[#E5DFD5] focus:outline-none focus:ring-1 focus:ring-[#0F3838] min-h-[44px] sm:min-h-[38px]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1B2928] mb-1">
                    Time Slot
                  </label>
                  <select
                    value={newBooking.preferredTime}
                    onChange={(e) =>
                      setNewBooking((prev) => ({ ...prev, preferredTime: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-xs rounded-lg border border-[#E5DFD5] focus:outline-none focus:ring-1 focus:ring-[#0F3838] bg-white min-h-[44px] sm:min-h-[38px]"
                  >
                    <option value="Morning (10:00 AM – 1:00 PM)">Morning (10:00 AM – 1:00 PM)</option>
                    <option value="Afternoon (1:00 PM – 4:00 PM)">Afternoon (1:00 PM – 4:00 PM)</option>
                    <option value="Evening (4:00 PM – 7:00 PM)">Evening (4:00 PM – 7:00 PM)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1B2928] mb-1">
                  Symptoms or Receptionist Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="E.g. Patient complains of tinnitus in left ear; referred by Dr. Tariq"
                  value={newBooking.notes}
                  onChange={(e) =>
                    setNewBooking((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-base sm:text-xs rounded-lg border border-[#E5DFD5] focus:outline-none focus:ring-1 focus:ring-[#0F3838]"
                />
              </div>

              <div className="pt-3 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 border-t border-[#E5DFD5]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-lg border border-[#E5DFD5] text-[#1B2928] hover:bg-[#F3EEE7] min-h-[42px] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNew}
                  className="w-full sm:w-auto px-5 py-2.5 sm:py-2 rounded-lg bg-[#0F3838] text-white font-semibold hover:bg-[#1A5454] disabled:opacity-50 min-h-[42px]"
                >
                  {isSubmittingNew ? 'Saving...' : 'Save to Firestore'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Security & PIN Settings Modal */}
      {showSecurityModal && (
        <div
          role="dialog"
          aria-labelledby="security-modal-title"
          className="fixed inset-0 z-60 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
        >
          <div className="bg-white w-full max-w-md max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl border border-[#E5DFD5] text-[#1B2928] animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#0F3838] px-4 sm:px-6 py-3.5 sm:py-4 text-white flex items-center justify-between border-b border-[#0A2727] sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-5 w-5 text-emerald-300 shrink-0" />
                <h3 id="security-modal-title" className="font-editorial text-base sm:text-lg font-bold">
                  Staff Security &amp; Credentials
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSecurityModal(false)}
                className="h-8 w-8 rounded-lg text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-5">
              {/* Active Session Info */}
              <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E5DFD5] text-xs">
                <span className="font-semibold text-[#1B2928] block mb-1">Active Authentication Session:</span>
                <p className="text-[#556B69] break-all">
                  {auth.currentUser?.email
                    ? `Logged in as: ${auth.currentUser.email}`
                    : 'Authenticated Clinic Personnel Session'}
                </p>
                <p className="text-[11px] text-emerald-700 mt-1 font-medium flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  Live Firestore Access Active
                </p>
              </div>

              {/* Set New Custom PIN */}
              <form onSubmit={handleSaveCustomPin} className="space-y-2.5">
                <div>
                  <label htmlFor="custom-pin-input" className="block text-xs font-bold text-[#1B2928] mb-1">
                    Set New Staff Access PIN
                  </label>
                  <p className="text-[11px] text-[#556B69] mb-2">
                    Create a new custom PIN (4 to 12 digits) for rapid reception login.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      id="custom-pin-input"
                      type="text"
                      maxLength={12}
                      placeholder="e.g. 8421"
                      value={newCustomPin}
                      onChange={(e) => setNewCustomPin(e.target.value)}
                      className="flex-1 px-3 py-2 text-base sm:text-xs rounded-lg border border-[#E5DFD5] bg-[#FAF8F5] text-[#1B2928] font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-[#0F3838] min-h-[42px]"
                    />
                    <button
                      type="submit"
                      disabled={isUpdatingSettings || !newCustomPin.trim()}
                      className="px-4 py-2 rounded-lg bg-[#0F3838] hover:bg-[#1A5454] text-xs font-bold text-white transition-colors disabled:opacity-50 min-h-[42px] whitespace-nowrap"
                    >
                      Update PIN
                    </button>
                  </div>
                </div>

                {customPinMsg && (
                  <div
                    className={`p-2.5 rounded-lg text-xs flex items-start gap-1.5 ${
                      customPinMsg.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                  >
                    {customPinMsg.type === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <span>{customPinMsg.text}</span>
                  </div>
                )}
              </form>

              {/* Change Account Password (if email user logged in) */}
              {auth.currentUser?.email && (
                <form onSubmit={handleUpdatePassword} className="space-y-2.5 pt-3 border-t border-[#E5DFD5]">
                  <div>
                    <label htmlFor="new-pwd-input" className="block text-xs font-bold text-[#1B2928] mb-1">
                      Update Account Password
                    </label>
                    <p className="text-[11px] text-[#556B69] mb-2 truncate">
                      {auth.currentUser.email}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        id="new-pwd-input"
                        type="password"
                        placeholder="New password (min 6 chars)"
                        value={newPasswordVal}
                        onChange={(e) => setNewPasswordVal(e.target.value)}
                        className="flex-1 px-3 py-2 text-base sm:text-xs rounded-lg border border-[#E5DFD5] bg-[#FAF8F5] text-[#1B2928] focus:outline-none focus:ring-2 focus:ring-[#0F3838] min-h-[42px]"
                      />
                      <button
                        type="submit"
                        disabled={isUpdatingSettings || newPasswordVal.length < 6}
                        className="px-4 py-2 rounded-lg bg-[#0F3838] hover:bg-[#1A5454] text-xs font-bold text-white transition-colors disabled:opacity-50 min-h-[42px] whitespace-nowrap"
                      >
                        Save Password
                      </button>
                    </div>
                  </div>

                  {passwordChangeMsg && (
                    <div
                      className={`p-2.5 rounded-lg text-xs flex items-start gap-1.5 ${
                        passwordChangeMsg.type === 'success'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}
                    >
                      {passwordChangeMsg.type === 'success' ? (
                        <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                      )}
                      <span>{passwordChangeMsg.text}</span>
                    </div>
                  )}
                </form>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowSecurityModal(false)}
                  className="w-full sm:w-auto px-5 py-2 rounded-lg border border-[#E5DFD5] bg-[#F3EEE7] text-xs font-bold text-[#1B2928] hover:bg-[#E5DFD5] transition-colors min-h-[40px]"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
