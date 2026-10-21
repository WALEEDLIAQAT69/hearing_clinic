import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Loader2, Stethoscope, ShieldCheck } from 'lucide-react';
import { sendStaffPasswordReset, translateFirebaseError } from '../lib/firebase';

export const ResetPasswordApp: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Please enter your staff email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await sendStaffPasswordReset(cleanEmail);
      setIsSuccess(true);
    } catch (err) {
      console.error('Password reset error:', err);
      setErrorMessage(translateFirebaseError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-600/20 border border-teal-500/30 text-teal-400 mb-4 shadow-inner">
            <Stethoscope className="w-8 h-8 text-teal-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Staff Password Recovery
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-400">
            Hearing Clinic Lahore • Audiology Operations Portal
          </p>
        </div>

        <div className="mt-8 bg-slate-800/90 backdrop-blur-xl py-8 px-6 sm:px-10 rounded-2xl border border-slate-700 shadow-2xl">
          {isSuccess ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-bold text-white">Password Reset Link Sent</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                We have dispatched a password recovery email to <strong className="text-white">{email}</strong>. Follow the link inside to set a new practitioner password.
              </p>
              <div className="pt-4 border-t border-slate-700/80">
                <a
                  href="/admin/login.html"
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Return to Staff Login
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800/70 text-red-200 text-xs flex items-start gap-2.5 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                  <span className="leading-relaxed">{errorMessage}</span>
                </div>
              )}

              <div>
                <label htmlFor="staff-email" className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2">
                  Clinic Practitioner Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="staff-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="doctor@hearingclinic.pk"
                    className="block w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-slate-400">
                  Password reset emails can only be sent to authorized clinic staff domains.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending Recovery Link...
                  </>
                ) : (
                  'Send Password Reset Link'
                )}
              </button>

              <div className="pt-4 border-t border-slate-700/60 text-center">
                <a
                  href="/admin/login.html"
                  className="inline-flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 font-medium transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Staff Login
                </a>
              </div>
            </form>
          )}
        </div>

        <div className="mt-8 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-teal-500/70" />
          <span>Restricted Medical Access • Hearing Clinic Lahore</span>
        </div>
      </div>
    </div>
  );
};
