import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  ShieldCheck, 
  AlertCircle, 
  Loader2,
  Stethoscope
} from 'lucide-react';
import { authenticateStaffWithEmail, observeAuthState, translateFirebaseError } from '../lib/firebase';
import { OfflineBanner } from '../components/OfflineBanner';

export const AdminLoginApp: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check URL parameters for inactivity reason
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('reason') === 'inactivity') {
      setInfoMessage('Your session timed out after 15 minutes of inactivity for patient confidentiality. Please sign in again.');
    }
  }, []);

  // If already logged in, redirect immediately to dashboard
  useEffect(() => {
    const unsubscribe = observeAuthState((user) => {
      if (user && !user.isAnonymous) {
        window.location.href = '/admin/dashboard.html';
      } else {
        setIsCheckingAuth(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Please enter your administrator email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your administrator password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await authenticateStaffWithEmail(cleanEmail, password);
      // Successful login will trigger auth state change and redirect
      window.location.href = '/admin/dashboard.html';
    } catch (err) {
      console.error('Admin authentication error:', err);
      setErrorMessage(translateFirebaseError(err));
      setIsSubmitting(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600 mb-3" />
        <p className="text-sm font-medium text-slate-500">Checking administrator session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
      <OfflineBanner />

      <header className="py-6 px-4 sm:px-6 max-w-7xl mx-auto w-full flex items-center justify-between">
        <a href="/" className="inline-flex items-center gap-2 text-slate-900 font-extrabold text-lg">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-xs">
            <Stethoscope className="h-4.5 w-4.5" />
          </div>
          <span>Hearing Clinic</span>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
            Admin Area
          </span>
        </a>

        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-teal-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Public Website</span>
        </a>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff Reception Sign In</h1>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Gated admin dashboard for managing patient consultation bookings and incoming public inquiries.
            </p>
          </div>

          {infoMessage && (
            <div
              role="status"
              className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2.5"
            >
              <ShieldCheck className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <span className="font-bold block">Session Notice</span>
                <span>{infoMessage}</span>
              </div>
            </div>
          )}

          {errorMessage && (
            <div
              role="alert"
              aria-live="assertive"
              className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
              <div>
                <span className="font-bold block">Authentication Failed</span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-bold uppercase tracking-wider text-slate-900 mb-1.5"
              >
                Staff Email Address
              </label>
              <div className="relative">
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="admin@hearingclinic.pk"
                  required
                  autoComplete="username"
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 text-sm bg-white text-slate-900 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 placeholder:text-slate-400"
                />
                <Mail className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-bold uppercase tracking-wider text-slate-900 mb-1.5"
              >
                Staff Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="••••••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-10 py-2.5 text-sm bg-white text-slate-900 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 placeholder:text-slate-400"
                />
                <Lock className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="mt-1 text-right">
                <a
                  href="/admin/reset-password.html"
                  className="text-xs text-teal-600 hover:text-teal-800 hover:underline font-medium"
                >
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white text-sm font-semibold py-3 px-4 shadow-sm transition-all disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Sign In to Dashboard</span>
                </>
              )}
            </button>
          </form>

          <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl text-[11px] text-slate-500 leading-relaxed">
            <span className="font-semibold text-slate-700 block mb-0.5">Strict Access Separation:</span>
            Admin accounts are provisioned directly in the Firebase Console. No public user registration is permitted. Firestore Security Rules enforce unauthenticated read/write blocks at the database level.
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-slate-400">
        Hearing Clinic Lahore • MM Alam Road, Gulberg III • Authorized Audiology Center
      </footer>
    </div>
  );
};
