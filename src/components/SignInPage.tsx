import React, { useState } from 'react';
import { UserRole } from '../types';
import { useDemoStore } from '../context/DemoContext';
import { apiSignIn } from '../services/authApi';
import { BcaFlyLogo } from './BcaFlyLogo';
import {
  Lock,
  Mail,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  UserCheck,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';

interface SignInPageProps {
  onSuccessRedirect: (role: UserRole) => void;
  onNavigateLanding?: () => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({
  onSuccessRedirect,
  onNavigateLanding
}) => {
  const { login, requestPasswordReset } = useDemoStore();

  const [email, setEmail] = useState('dean.academic@bcafly.edu');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [loginSuccessRole, setLoginSuccessRole] = useState<UserRole | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setResetMessage(null);
    setIsSubmitting(true);

    try {
      const res = await apiSignIn({ email, password });
      const result = res.data;

      if (result.ok) {
        const userRole = result.user.role as UserRole;
        // Sync with app state
        login(email, password, userRole);
        setLoginSuccessRole(userRole);

        setTimeout(() => {
          setIsSubmitting(false);
          onSuccessRedirect(userRole);
        }, 500);
      } else {
        setIsSubmitting(false);
        const errCode = result.error;
        if (errCode === 'INVALID_PAYLOAD') {
          setErrorMessage('Please provide both email and password.');
        } else if (errCode === 'INVALID_CREDENTIALS') {
          setErrorMessage('Invalid institutional email or password.');
        } else {
          setErrorMessage(errCode || 'Authentication failed. Please verify your credentials.');
        }
      }
    } catch {
      setIsSubmitting(false);
      setErrorMessage('Network error during authentication. Please try again.');
    }
  };

  const handleQuickRoleFill = (role: 'admin' | 'faculty' | 'student') => {
    setErrorMessage(null);
    if (role === 'admin') {
      setEmail('dean.academic@bcafly.edu');
      setPassword('admin123');
    } else if (role === 'faculty') {
      setEmail('sarah.jenkins@bcafly.edu');
      setPassword('faculty123');
    } else if (role === 'student') {
      setEmail('alex.smith@student.bcafly.edu');
      setPassword('student123');
    }
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setErrorMessage('Please enter your institutional email.');
      return;
    }
    const res = requestPasswordReset(resetEmail.trim());
    setResetMessage(res.message);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col justify-between p-4 sm:p-6 md:p-10 font-sans selection:bg-slate-200">
      {/* Top Bar / Navigation */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BcaFlyLogo />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-200/70 px-2.5 py-0.5 rounded-full">
            Auth v2.4
          </span>
        </div>

        {onNavigateLanding && (
          <button
            onClick={onNavigateLanding}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 px-3.5 py-2 rounded-full border border-slate-200 shadow-xs transition-all cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Back to Public Portal
          </button>
        )}
      </div>

      {/* Main Sign-In Card Container */}
      <div className="max-w-md w-full mx-auto my-8">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
          {/* Header Banner */}
          <div className="bg-slate-900 text-white p-6 sm:p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/10 text-white mb-3 shadow-inner">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">Institutional Sign-In</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
              Secure single sign-on access to BcaFly academic &amp; departmental dashboards
            </p>
          </div>

          {/* Form Body */}
          <div className="p-6 sm:p-8 space-y-5">
            {/* Quick Demo Role Selector for Testing */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Quick Demo Accounts
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Click to populate</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickRoleFill('admin')}
                  className={`py-2 px-2 text-center rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    email.includes('admin') || email.includes('dean')
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <span className="block font-bold">Admin</span>
                  <span className="text-[10px] opacity-80">/dashboard/admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickRoleFill('faculty')}
                  className={`py-2 px-2 text-center rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    email.includes('jenkins') || email.includes('faculty')
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <span className="block font-bold">Faculty</span>
                  <span className="text-[10px] opacity-80">/dashboard/faculty</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickRoleFill('student')}
                  className={`py-2 px-2 text-center rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    email.includes('student') || email.includes('alex')
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <span className="block font-bold">Student</span>
                  <span className="text-[10px] opacity-80">/dashboard/student</span>
                </button>
              </div>
            </div>

            {/* Error Notification */}
            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-start gap-2.5 text-xs animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Sign-in Error</span>
                  {errorMessage}
                </div>
              </div>
            )}

            {/* Success Feedback Notification */}
            {loginSuccessRole && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2.5 text-xs animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">
                  Authentication verified! Redirecting to <span className="font-mono">/dashboard/{loginSuccessRole}</span>...
                </span>
              </div>
            )}

            {/* Sign-In Form */}
            {!showForgotPassword ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Institutional Email / Username
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@bcafly.edu"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(true);
                        setResetEmail(email);
                      }}
                      className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 underline underline-offset-2 cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-11 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || Boolean(loginSuccessRole)}
                    className="w-full py-3 rounded-full bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <RotateCcw className="w-4 h-4 animate-spin" />
                        Validating Credentials...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Forgot Password Stub */
              <form onSubmit={handlePasswordReset} className="space-y-4 animate-in fade-in">
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs space-y-1">
                  <span className="font-bold block">Password Recovery (Add-On Stub)</span>
                  <p>Enter your institutional email to dispatch a secure 15-minute reset token.</p>
                </div>

                {resetMessage && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{resetMessage}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Institutional Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="user@bcafly.edu"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Send Reset Token
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetMessage(null);
                    }}
                    className="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            )}

            {/* Spec & Security Note */}
            <div className="pt-2 border-t border-slate-100 text-center">
              <p className="text-[11px] text-slate-500">
                Specification Compliant: <span className="font-mono text-slate-700">POST /api/auth/signin</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Institutional Security Notice */}
      <div className="max-w-md w-full mx-auto text-center space-y-1">
        <p className="text-xs text-slate-500 font-medium">
          &copy; {new Date().getFullYear()} Department of Computer Applications &bull; BcaFly Platform
        </p>
        <p className="text-[11px] text-slate-400">
          Protected by HTTPS &bull; Role-Based Session Tokens &bull; Audit Trail Logging
        </p>
      </div>
    </div>
  );
};
