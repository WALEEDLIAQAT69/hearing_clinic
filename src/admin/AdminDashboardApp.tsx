import React, { useState, useEffect, useMemo } from 'react';
import {
  Stethoscope,
  LogOut,
  Calendar,
  Inbox,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Phone,
  Mail,
  Trash2,
  MessageCircle,
  ChevronDown,
  Filter,
  Radio,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import {
  auth,
  logoutStaff,
  observeAuthState,
  subscribeToBookings,
  updateBookingStatus,
  deleteBooking,
  subscribeToContacts,
  updateContactStatus,
  deleteContact,
  translateFirebaseError
} from '../lib/firebase';
import { BookingRecord, ContactRecord } from '../types';
import { OfflineBanner } from '../components/OfflineBanner';

export const AdminDashboardApp: React.FC = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'bookings' | 'contacts'>('bookings');

  // Bookings State
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [isBookingsLoading, setIsBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState<string | null>(null);
  const [bookingFilter, setBookingFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [bookingSearch, setBookingSearch] = useState('');

  // Contacts State
  const [contacts, setContacts] = useState<ContactRecord[]>([]);
  const [isContactsLoading, setIsContactsLoading] = useState(true);
  const [contactsError, setContactsError] = useState<string | null>(null);
  const [contactFilter, setContactFilter] = useState<'all' | 'new' | 'read' | 'responded'>('all');
  const [contactSearch, setContactSearch] = useState('');

  // General Action State
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  // Authentication guard
  useEffect(() => {
    const unsubscribe = observeAuthState((user) => {
      if (!user || user.isAnonymous) {
        window.location.href = '/admin/login.html';
      } else {
        setUserEmail(user.email);
      }
    });
    return () => unsubscribe();
  }, []);

  // 15-minute Inactivity Auto-Logout for patient data protection
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const INACTIVITY_LIMIT_MS = 15 * 60 * 1000;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        try {
          await logoutStaff();
        } catch {}
        window.location.href = '/admin/login.html?reason=inactivity';
      }, INACTIVITY_LIMIT_MS);
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach((evt) => window.addEventListener(evt, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, []);

  // Real-time listener for Bookings
  useEffect(() => {
    setIsBookingsLoading(true);
    setBookingsError(null);

    const unsubscribe = subscribeToBookings(
      (data) => {
        setBookings(data);
        setIsBookingsLoading(false);
      },
      (err) => {
        console.error('Bookings listener error:', err);
        setBookingsError(translateFirebaseError(err));
        setIsBookingsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [retryKey]);

  // Real-time listener for Contacts
  useEffect(() => {
    setIsContactsLoading(true);
    setContactsError(null);

    const unsubscribe = subscribeToContacts(
      (data) => {
        setContacts(data);
        setIsContactsLoading(false);
      },
      (err) => {
        console.error('Contacts listener error:', err);
        setContactsError(translateFirebaseError(err));
        setIsContactsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [retryKey]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await logoutStaff();
      window.location.href = '/admin/login.html';
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  // Booking Actions
  const handleUpdateBookingStatus = async (
    id: string,
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  ) => {
    setActionLoadingId(id);
    setActionMessage(null);
    try {
      await updateBookingStatus(id, status);
      setActionMessage(`Booking status updated to ${status}`);
    } catch (err) {
      alert(translateFirebaseError(err));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteBooking = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete the booking for ${name}?`)) {
      return;
    }
    setActionLoadingId(id);
    try {
      await deleteBooking(id);
      setActionMessage('Booking deleted successfully');
    } catch (err) {
      alert(translateFirebaseError(err));
    } finally {
      setActionLoadingId(null);
    }
  };

  // Contact Actions
  const handleUpdateContactStatus = async (
    id: string,
    status: 'new' | 'read' | 'responded'
  ) => {
    setActionLoadingId(id);
    setActionMessage(null);
    try {
      await updateContactStatus(id, status);
      setActionMessage(`Inquiry marked as ${status}`);
    } catch (err) {
      alert(translateFirebaseError(err));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteContact = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete inquiry from ${name}?`)) {
      return;
    }
    setActionLoadingId(id);
    try {
      await deleteContact(id);
      setActionMessage('Inquiry deleted successfully');
    } catch (err) {
      alert(translateFirebaseError(err));
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchesFilter = bookingFilter === 'all' || b.status === bookingFilter;
      const q = bookingSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        b.name.toLowerCase().includes(q) ||
        b.phone.toLowerCase().includes(q) ||
        (b.email && b.email.toLowerCase().includes(q)) ||
        b.service.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [bookings, bookingFilter, bookingSearch]);

  // Filtered Contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      const matchesFilter = contactFilter === 'all' || c.status === contactFilter;
      const q = contactSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q) ||
        (c.phone && c.phone.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        c.message.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [contacts, contactFilter, contactSearch]);

  // Counts
  const pendingBookingsCount = bookings.filter((b) => b.status === 'pending').length;
  const newContactsCount = contacts.filter((c) => c.status === 'new').length;

  const formatDate = (isoOrStr: any) => {
    if (!isoOrStr) return 'Just now';
    try {
      const d = new Date(isoOrStr);
      if (isNaN(d.getTime())) return String(isoOrStr);
      return d.toLocaleDateString('en-PK', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return String(isoOrStr);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <OfflineBanner />

      {/* Top Staff Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-xs">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">Hearing Clinic</h1>
                <span className="hidden sm:inline-flex text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Staff Reception
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden md:block">MM Alam Road, Gulberg III, Lahore</p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Live Firestore indicator */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Live Sync Active</span>
            </div>

            <div className="text-right hidden sm:block">
              <span className="text-xs font-semibold text-slate-800 block truncate max-w-[180px]">
                {userEmail || 'Admin Staff'}
              </span>
              <span className="text-[10px] text-slate-400">Authenticated Receptionist</span>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-xs font-semibold text-slate-700 transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Metric Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Total Bookings</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{bookings.length}</span>
              <span className="text-xs text-slate-400">records</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200 bg-amber-50/20 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 block mb-1">Pending Bookings</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-600">{pendingBookingsCount}</span>
              <span className="text-xs text-amber-600/80">needs confirmation</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Total Inquiries</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{contacts.length}</span>
              <span className="text-xs text-slate-400">messages</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-teal-200 bg-teal-50/20 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 block mb-1">New Messages</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-teal-600">{newContactsCount}</span>
              <span className="text-xs text-teal-600/80">unread</span>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                activeTab === 'bookings'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Patient Bookings</span>
              {pendingBookingsCount > 0 && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    activeTab === 'bookings' ? 'bg-white text-teal-800' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {pendingBookingsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('contacts')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                activeTab === 'contacts'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Inbox className="h-4 w-4" />
              <span>Contact Inquiries</span>
              {newContactsCount > 0 && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    activeTab === 'contacts' ? 'bg-white text-teal-800' : 'bg-teal-100 text-teal-800'
                  }`}
                >
                  {newContactsCount}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setRetryKey((prev) => prev + 1)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-600 transition-colors shadow-2xs"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh Stream</span>
            </button>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-600 transition-colors shadow-2xs"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>View Public Site</span>
            </a>
          </div>
        </div>

        {/* Action toast message */}
        {actionMessage && (
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs font-semibold text-teal-800 flex items-center justify-between animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-teal-600" />
              <span>{actionMessage}</span>
            </div>
            <button
              onClick={() => setActionMessage(null)}
              className="text-teal-600 hover:text-teal-800 text-xs underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: PATIENT BOOKINGS */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {/* Filter and Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Status pills */}
              <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setBookingFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                      bookingFilter === st
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative w-full md:w-72">
                <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  placeholder="Search patient, phone, service..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                />
              </div>
            </div>

            {/* Error with retry */}
            {bookingsError && (
              <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-3">
                <AlertTriangle className="h-8 w-8 text-rose-500 mx-auto" />
                <h3 className="font-bold text-rose-900 text-sm">Failed to stream patient bookings</h3>
                <p className="text-xs text-rose-700 max-w-md mx-auto">{bookingsError}</p>
                <button
                  onClick={() => setRetryKey((prev) => prev + 1)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Retry Connection
                </button>
              </div>
            )}

            {/* Loading Skeletons */}
            {isBookingsLoading && (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 animate-pulse">
                    <div className="flex justify-between items-center">
                      <div className="h-5 bg-slate-200 rounded w-1/4"></div>
                      <div className="h-5 bg-slate-200 rounded w-20"></div>
                    </div>
                    <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                    <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isBookingsLoading && !bookingsError && filteredBookings.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <Calendar className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-800">No Patient Bookings Found</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {bookingSearch || bookingFilter !== 'all'
                      ? 'No bookings match your selected filter or search term.'
                      : 'There are currently no patient booking requests logged in Firestore.'}
                  </p>
                </div>
                {(bookingSearch || bookingFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setBookingFilter('all');
                      setBookingSearch('');
                    }}
                    className="text-xs font-semibold text-teal-700 hover:underline"
                  >
                    Clear active filters
                  </button>
                )}
              </div>
            )}

            {/* Bookings Card List */}
            {!isBookingsLoading && !bookingsError && filteredBookings.length > 0 && (
              <div className="space-y-3">
                {filteredBookings.map((b) => {
                  const statusColors: Record<string, string> = {
                    pending: 'bg-amber-50 text-amber-800 border-amber-200',
                    confirmed: 'bg-blue-50 text-blue-800 border-blue-200',
                    completed: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                    cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
                  };

                  const cleanPhone = b.phone.replace(/[^0-9]/g, '');
                  const waNumber = cleanPhone.startsWith('92')
                    ? cleanPhone
                    : cleanPhone.startsWith('0')
                    ? `92${cleanPhone.slice(1)}`
                    : cleanPhone;

                  return (
                    <div
                      key={b.id}
                      className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-xs transition-shadow space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-3">
                          <h3 className="font-extrabold text-slate-900 text-base">{b.name}</h3>
                          <span
                            className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                              statusColors[b.status] || 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {b.status}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          ID: HC-{b.id.slice(-6).toUpperCase()} • {formatDate(b.createdAt)}
                        </span>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600">
                        <div>
                          <span className="text-slate-400 block font-medium">Clinical Service:</span>
                          <span className="font-semibold text-slate-900">{b.service}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Requested Timing:</span>
                          <span className="font-semibold text-slate-900">{b.preferredDate}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Patient Contact:</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <a
                              href={`tel:${b.phone}`}
                              className="font-semibold text-teal-700 hover:underline inline-flex items-center gap-1"
                            >
                              <Phone className="h-3 w-3" />
                              {b.phone}
                            </a>
                            {b.email && (
                              <a
                                href={`mailto:${b.email}`}
                                className="text-slate-500 hover:text-slate-700"
                                title={b.email}
                              >
                                <Mail className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Patient Message if provided */}
                      {b.message && (
                        <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-xs text-slate-600 leading-relaxed">
                          <span className="font-semibold text-slate-700 block mb-0.5">Patient Remarks / Symptoms:</span>
                          {b.message}
                        </div>
                      )}

                      {/* Action Controls */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
                        {/* Status Change Dropdown */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 font-medium">Change Status:</span>
                          <select
                            value={b.status}
                            onChange={(e) =>
                              handleUpdateBookingStatus(b.id, e.target.value as any)
                            }
                            disabled={actionLoadingId === b.id}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 focus:border-teal-600"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>

                        {/* Quick Contact & Delete Actions */}
                        <div className="flex items-center gap-2">
                          <a
                            href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                              `Assalam-o-Alaikum ${b.name},\nThis is Hearing Clinic Lahore regarding your appointment request for ${b.service} on ${b.preferredDate}. We would like to confirm your schedule.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-semibold transition-colors"
                          >
                            <MessageCircle className="h-3.5 w-3.5 fill-current" />
                            <span>WhatsApp</span>
                          </a>

                          <a
                            href={`tel:${b.phone}`}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors"
                          >
                            <Phone className="h-3.5 w-3.5" />
                            <span>Call</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => handleDeleteBooking(b.id, b.name)}
                            disabled={actionLoadingId === b.id}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Delete booking"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: CONTACT INQUIRIES */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'contacts' && (
          <div className="space-y-4">
            {/* Filter and Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                {(['all', 'new', 'read', 'responded'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setContactFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                      contactFilter === st
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-72">
                <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                  placeholder="Search sender, subject, phone..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                />
              </div>
            </div>

            {/* Error with retry */}
            {contactsError && (
              <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-3">
                <AlertTriangle className="h-8 w-8 text-rose-500 mx-auto" />
                <h3 className="font-bold text-rose-900 text-sm">Failed to stream contact inquiries</h3>
                <p className="text-xs text-rose-700 max-w-md mx-auto">{contactsError}</p>
                <button
                  onClick={() => setRetryKey((prev) => prev + 1)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Retry Connection
                </button>
              </div>
            )}

            {/* Loading Skeletons */}
            {isContactsLoading && (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 animate-pulse">
                    <div className="flex justify-between items-center">
                      <div className="h-5 bg-slate-200 rounded w-1/4"></div>
                      <div className="h-5 bg-slate-200 rounded w-20"></div>
                    </div>
                    <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isContactsLoading && !contactsError && filteredContacts.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <Inbox className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-800">No Contact Inquiries Found</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {contactSearch || contactFilter !== 'all'
                      ? 'No inquiries match your selected filter or search term.'
                      : 'No public inquiries have been sent yet.'}
                  </p>
                </div>
                {(contactSearch || contactFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setContactFilter('all');
                      setContactSearch('');
                    }}
                    className="text-xs font-semibold text-teal-700 hover:underline"
                  >
                    Clear active filters
                  </button>
                )}
              </div>
            )}

            {/* Contacts Card List */}
            {!isContactsLoading && !contactsError && filteredContacts.length > 0 && (
              <div className="space-y-3">
                {filteredContacts.map((c) => {
                  const statusColors: Record<string, string> = {
                    new: 'bg-amber-50 text-amber-800 border-amber-200',
                    read: 'bg-slate-100 text-slate-600 border-slate-200',
                    responded: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                  };

                  return (
                    <div
                      key={c.id}
                      className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-xs transition-shadow space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-3">
                          <h3 className="font-extrabold text-slate-900 text-base">{c.name}</h3>
                          <span
                            className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                              statusColors[c.status] || 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {c.status}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          ID: INQ-{c.id.slice(-6).toUpperCase()} • {formatDate(c.createdAt)}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="text-xs font-bold text-slate-800">
                          Subject: <span className="font-semibold text-slate-700">{c.subject}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 whitespace-pre-wrap">
                          {c.message}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100 text-xs">
                        <div className="flex items-center gap-4 text-slate-500">
                          {c.phone && (
                            <a
                              href={`tel:${c.phone}`}
                              className="font-semibold text-teal-700 hover:underline inline-flex items-center gap-1"
                            >
                              <Phone className="h-3.5 w-3.5" />
                              {c.phone}
                            </a>
                          )}
                          {c.email && (
                            <a
                              href={`mailto:${c.email}?subject=${encodeURIComponent(
                                `Re: ${c.subject} - Hearing Clinic Lahore`
                              )}`}
                              className="font-semibold text-teal-700 hover:underline inline-flex items-center gap-1"
                            >
                              <Mail className="h-3.5 w-3.5" />
                              {c.email}
                            </a>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-medium">Status:</span>
                          <select
                            value={c.status}
                            onChange={(e) =>
                              handleUpdateContactStatus(c.id, e.target.value as any)
                            }
                            disabled={actionLoadingId === c.id}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 focus:border-teal-600"
                          >
                            <option value="new">New</option>
                            <option value="read">Read</option>
                            <option value="responded">Responded</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => handleDeleteContact(c.id, c.name)}
                            disabled={actionLoadingId === c.id}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Delete inquiry"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="py-6 border-t border-slate-200 bg-white text-center text-xs text-slate-400">
        Hearing Clinic Lahore • MM Alam Road, Gulberg III • Authorized Audiology Center
      </footer>
    </div>
  );
};
