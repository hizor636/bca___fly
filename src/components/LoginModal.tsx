import React, { useState } from 'react';
import { UserRole } from '../types';
import { useDemoStore } from '../context/DemoContext';
import { BcaFlyLogo } from './BcaFlyLogo';
import {
  X,
  Lock,
  Mail,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Eye,
  EyeOff
} from 'lucide-react';

interface LoginModalProps {
  onClose: () => void;
  onSuccessRedirect?: (role: UserRole) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  onClose,
  onSuccessRedirect
}) => {
  const { login, requestPasswordReset } = useDemoStore();

  const [email, setEmail] = useState('sarah.jenkins@bcafly.edu');
  const [password, setPassword] = useState('bca2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // View mode: 'login' | 'forgot-password'
  const [viewMode, setViewMode] = useState<'login' | 'forgot-password'>('login');

  // Error & Status Feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginSuccessRole, setLoginSuccessRole] = useState<UserRole | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const res = login(email, password);
      setIsSubmitting(false);

      if (res.success && res.role) {
        setLoginSuccessRole(res.role);
        setTimeout(() => {
          onClose();
          if (onSuccessRedirect) {
            onSuccessRedirect(res.role!);
          }
        }, 800);
      } else {
        setErrorMessage(res.error || 'Authentication failed. Please verify institutional credentials.');
      }
    }, 400);
  };

  const handleQuickRoleLogin = (role: UserRole, demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('bca2026!');
    setErrorMessage(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const res = login(demoEmail, 'bca2026!', role);
      setIsSubmitting(false);

      if (res.success && res.role) {
        setLoginSuccessRole(res.role);
        setTimeout(() => {
          onClose();
          if (onSuccessRedirect) {
            onSuccessRedirect(res.role!);
          }
        }, 600);
      } else {
        setErrorMessage(res.error || 'Quick login failed.');
      }
    }, 300);
  };

  const handlePasswordResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please enter your institutional email address.');
      return;
    }
    const res = requestPasswordReset(email.trim());
    setResetSuccessMessage(res.message);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        id="login-auth-modal"
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-block mb-3">
            <BcaFlyLogo size="md" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight font-serif">
            {viewMode === 'login' ? 'Institutional Authentication' : 'Password Recovery'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {viewMode === 'login'
              ? 'Sign in with institutional credentials to access your designated role workspace.'
              : 'Enter your registered university email to receive recovery instructions.'}
          </p>
        </div>

        {/* Success Confirmation State */}
        {loginSuccessRole ? (
          <div className="py-8 text-center space-y-3 animate-in fade-in">
            <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <h4 className="font-bold text-slate-900 text-lg">
              Authenticated Successfully
            </h4>
            <p className="text-xs text-slate-500">
              Resolved role:{' '}
              <strong className="text-slate-900 uppercase font-semibold">
                {loginSuccessRole === 'admin'
                  ? 'Academic Dean / Admin'
                  : loginSuccessRole === 'faculty'
                  ? 'Faculty Member'
                  : loginSuccessRole === 'student'
                  ? 'Student Portal'
                  : 'Counselor Portal'}
              </strong>
              . Loading secure workspace...
            </p>
          </div>
        ) : viewMode === 'forgot-password' ? (
          /* Forgot Password View */
          <div className="space-y-4 text-xs">
            {resetSuccessMessage ? (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 space-y-2 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="font-bold text-sm">Recovery Email Dispatched</p>
                <p className="text-xs text-emerald-700">{resetSuccessMessage}</p>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('login');
                    setResetSuccessMessage(null);
                  }}
                  className="mt-3 text-xs font-bold text-slate-900 hover:underline cursor-pointer"
                >
                  ← Return to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Registered Institutional Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. sarah.jenkins@bcafly.edu"
                      required
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-full transition-all cursor-pointer shadow-xs"
                >
                  Send Recovery Instructions
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('login');
                      setErrorMessage(null);
                    }}
                    className="text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* Standard Login Form */
          <div>
            {/* Error Notification Banner */}
            {errorMessage && (
              <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in">
                <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold block mb-0.5">Authentication Issue</span>
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Institutional Email or Campus User ID
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder="user@bcafly.edu"
                    required
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('forgot-password');
                      setErrorMessage(null);
                    }}
                    className="text-slate-500 hover:text-slate-900 font-medium cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <span>Remember session on this device</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-semibold text-xs sm:text-sm rounded-full transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
              >
                <span>{isSubmitting ? 'Verifying Credentials...' : 'Sign In to Workspace'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* 1-Click Role Exploration Test Grid (Specification: Allow seamless role testing while keeping authentications deterministic) */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  1-Click Role Persona Testing
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Demo Accounts</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* 1. Faculty */}
                <button
                  type="button"
                  onClick={() => handleQuickRoleLogin('faculty', 'sarah.jenkins@bcafly.edu')}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">Faculty</span>
                    <span className="text-[10px] text-slate-400 group-hover:text-slate-900 font-mono">→</span>
                  </div>
                  <span className="text-[11px] text-slate-600 block truncate">Dr. Sarah Jenkins</span>
                  <span className="text-[10px] text-slate-400 block truncate">42 Assigned Mentees</span>
                </button>

                {/* 2. Admin */}
                <button
                  type="button"
                  onClick={() => handleQuickRoleLogin('admin', 'dean.academic@bcafly.edu')}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">Academic Dean</span>
                    <span className="text-[10px] text-slate-400 group-hover:text-slate-900 font-mono">→</span>
                  </div>
                  <span className="text-[11px] text-slate-600 block truncate">Dr. V. Swaminathan</span>
                  <span className="text-[10px] text-slate-400 block truncate">Institution Admin</span>
                </button>

                {/* 3. Student */}
                <button
                  type="button"
                  onClick={() => handleQuickRoleLogin('student', 'alex.smith@student.bcafly.edu')}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">Student</span>
                    <span className="text-[10px] text-slate-400 group-hover:text-slate-900 font-mono">→</span>
                  </div>
                  <span className="text-[11px] text-slate-600 block truncate">Alex Smith</span>
                  <span className="text-[10px] text-slate-400 block truncate">BCA Sem 5 • 82%</span>
                </button>

                {/* 4. Counselor */}
                <button
                  type="button"
                  onClick={() => handleQuickRoleLogin('counselor', 'priya.counselor@bcafly.edu')}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">Counselor</span>
                    <span className="text-[10px] text-slate-400 group-hover:text-slate-900 font-mono">→</span>
                  </div>
                  <span className="text-[11px] text-slate-600 block truncate">Dr. Priya Sharma</span>
                  <span className="text-[10px] text-slate-400 block truncate">Confidential Intake</span>
                </button>
              </div>

              {/* Edge Case Testing Helpers: Suspended Account Test */}
              <div className="mt-3 pt-2 text-[10px] text-slate-400 flex items-center justify-between">
                <span>Security Test Accounts:</span>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('suspended@bcafly.edu');
                    setPassword('wrongpass');
                  }}
                  className="hover:text-slate-700 underline cursor-pointer"
                >
                  Load Suspended Account Test
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
