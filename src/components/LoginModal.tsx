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
  ShieldCheck,
  Eye,
  EyeOff,
  KeyRound,
  Fingerprint
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

  const [email, setEmail] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // View mode: 'login' | 'mfa' | 'forgot-password'
  const [viewMode, setViewMode] = useState<'login' | 'mfa' | 'forgot-password'>('login');
  const [mfaCode, setMfaCode] = useState('');
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);

  // Error & Status Feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginSuccessRole, setLoginSuccessRole] = useState<UserRole | null>(null);
  const [showAllStudents, setShowAllStudents] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const res = login(email, password);
      setIsSubmitting(false);

      if (res.success && res.role) {
        // If administrator role, simulate required MFA step
        if (res.role === 'admin' || res.role === 'super_admin') {
          setPendingRole(res.role);
          setViewMode('mfa');
        } else {
          completeLogin(res.role);
        }
      } else {
        setErrorMessage(res.error || 'Authentication failed. Please verify institutional credentials.');
      }
    }, 400);
  };

  const handleMfaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaCode.trim().length < 4) {
      setErrorMessage('Please enter the 6-digit verification code sent to your registered authenticator.');
      return;
    }

    if (pendingRole) {
      completeLogin(pendingRole);
    }
  };

  const completeLogin = (role: UserRole) => {
    setLoginSuccessRole(role);
    setTimeout(() => {
      onClose();
      if (onSuccessRedirect) {
        onSuccessRedirect(role);
      }
    }, 600);
  };

  const handleQuickRoleLogin = (role: UserRole, demoIdentifier: string, demoPassword = 'password123') => {
    setEmail(demoIdentifier);
    setPassword(demoPassword);
    setErrorMessage(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const res = login(demoIdentifier, demoPassword, role);
      setIsSubmitting(false);

      if (res.success && res.role) {
        if (res.role === 'admin' || res.role === 'super_admin') {
          setPendingRole(res.role);
          setViewMode('mfa');
        } else {
          completeLogin(res.role);
        }
      } else {
        setErrorMessage(res.error || 'Quick authentication failed.');
      }
    }, 300);
  };

  const handleSelectPersonaOnly = (role: UserRole, demoIdentifier: string, demoPassword = 'password123') => {
    setEmail(demoIdentifier);
    setPassword(demoPassword);
    setErrorMessage(null);
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
            {viewMode === 'login'
              ? 'Institutional Authentication'
              : viewMode === 'mfa'
              ? 'Multi-Factor Verification'
              : 'Password Recovery'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            {viewMode === 'login'
              ? 'Enter verified email or institutional ID. Server validates cryptographic role scope.'
              : viewMode === 'mfa'
              ? 'High-privilege account detected. Enter TOTP code from your mobile authenticator.'
              : 'Enter your registered institutional email to receive an instant recovery token.'}
          </p>
        </div>

        {/* Success Confirmation State */}
        {loginSuccessRole && (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2 animate-in fade-in duration-150">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto animate-bounce" />
            <h4 className="font-bold text-slate-900 text-base">Identity Verified</h4>
            <p className="text-xs text-slate-600">
              Redirecting to your role-scoped {loginSuccessRole.replace('_', ' ').toUpperCase()} workspace...
            </p>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800">
            <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {!loginSuccessRole && viewMode === 'login' && (
          <>
            {/* Demo Credentials Helper Box */}
            <div className="mb-5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-700 tracking-tight flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                  Quick Login Credentials (1-Click Fill)
                </span>
                <span className="text-[10px] text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-md font-semibold">
                  Pre-configured
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[11px] font-medium">
                <button
                  type="button"
                  onClick={() => handleQuickRoleLogin('super_admin', 'superadmin', 'superadmin123')}
                  className="py-1.5 px-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-800 cursor-pointer transition-colors text-left flex items-center justify-between shadow-2xs"
                >
                  <span className="font-semibold">Super Admin</span>
                  <span className="text-[10px] font-mono text-slate-500">superadmin</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickRoleLogin('admin', 'admin', 'admin123')}
                  className="py-1.5 px-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-800 cursor-pointer transition-colors text-left flex items-center justify-between shadow-2xs"
                >
                  <span className="font-semibold">Dept Admin (HOD)</span>
                  <span className="text-[10px] font-mono text-slate-500">admin</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickRoleLogin('faculty', 'faculty1', 'faculty123')}
                  className="py-1.5 px-2.5 bg-indigo-50/70 hover:bg-indigo-100 border border-indigo-200/80 rounded-xl text-indigo-950 cursor-pointer transition-colors text-left flex items-center justify-between shadow-2xs"
                >
                  <div>
                    <span className="font-semibold block leading-tight">Faculty 1</span>
                    <span className="text-[9px] text-indigo-600">Dr. Sarah (Group A)</span>
                  </div>
                  <span className="text-[10px] font-mono text-indigo-700">faculty1</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickRoleLogin('faculty', 'faculty2', 'faculty123')}
                  className="py-1.5 px-2.5 bg-indigo-50/70 hover:bg-indigo-100 border border-indigo-200/80 rounded-xl text-indigo-950 cursor-pointer transition-colors text-left flex items-center justify-between shadow-2xs"
                >
                  <div>
                    <span className="font-semibold block leading-tight">Faculty 2</span>
                    <span className="text-[9px] text-indigo-600">Prof. Rajesh (Group B)</span>
                  </div>
                  <span className="text-[10px] font-mono text-indigo-700">faculty2</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickRoleLogin('student', 'student1', 'student123')}
                  className="py-1.5 px-2.5 bg-emerald-50/70 hover:bg-emerald-100 border border-emerald-200/80 rounded-xl text-emerald-950 cursor-pointer transition-colors text-left flex items-center justify-between shadow-2xs"
                >
                  <div>
                    <span className="font-semibold block leading-tight">Student (Group A)</span>
                    <span className="text-[9px] text-emerald-600">Alexander Wright</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-700">student1</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickRoleLogin('student', 'student6', 'student123')}
                  className="py-1.5 px-2.5 bg-emerald-50/70 hover:bg-emerald-100 border border-emerald-200/80 rounded-xl text-emerald-950 cursor-pointer transition-colors text-left flex items-center justify-between shadow-2xs"
                >
                  <div>
                    <span className="font-semibold block leading-tight">Student (Group B)</span>
                    <span className="text-[9px] text-emerald-600">Aarav Patel</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-700">student6</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickRoleLogin('parent', 'parent1', 'parent123')}
                  className="py-1.5 px-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-800 cursor-pointer transition-colors text-left flex items-center justify-between shadow-2xs"
                >
                  <span className="font-semibold">Parent</span>
                  <span className="text-[10px] font-mono text-slate-500">parent1</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickRoleLogin('counselor', 'counselor1', 'counselor123')}
                  className="py-1.5 px-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-800 cursor-pointer transition-colors text-left flex items-center justify-between shadow-2xs"
                >
                  <span className="font-semibold">Counselor</span>
                  <span className="text-[10px] font-mono text-slate-500">counselor1</span>
                </button>
              </div>

              {/* Toggle to view all 10 students */}
              <div className="mt-2.5 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAllStudents(!showAllStudents)}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer flex items-center justify-between w-full"
                >
                  <span>{showAllStudents ? 'Hide All 10 Students' : 'View All 10 Students (5 in Group A, 5 in Group B)'}</span>
                  <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    pw: student123
                  </span>
                </button>

                {showAllStudents && (
                  <div className="mt-2 space-y-2 max-h-44 overflow-y-auto pr-1">
                    <div className="p-2 bg-indigo-50/50 rounded-lg border border-indigo-100">
                      <div className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider mb-1">
                        Group A (Mentor: Dr. Sarah Jenkins)
                      </div>
                      <div className="grid grid-cols-1 gap-1">
                        {[
                          { u: 'student1', n: 'Alexander Wright', s: 'BCA-2026-001' },
                          { u: 'student2', n: 'Elena Rostova', s: 'BCA-2026-002' },
                          { u: 'student3', n: 'Marcus Vance', s: 'BCA-2026-003' },
                          { u: 'student4', n: 'Chloe Bennett', s: 'BCA-2026-004' },
                          { u: 'student5', n: 'Devon Miller', s: 'BCA-2026-005' }
                        ].map((item) => (
                          <button
                            key={item.u}
                            type="button"
                            onClick={() => handleQuickRoleLogin('student', item.u, 'student123')}
                            className="w-full flex items-center justify-between px-2 py-1 bg-white hover:bg-indigo-50 rounded border border-slate-200 text-left cursor-pointer"
                          >
                            <span className="text-[10px] font-medium text-slate-800">{item.n} ({item.s})</span>
                            <span className="text-[10px] font-mono text-indigo-600 font-bold">{item.u}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-2 bg-emerald-50/50 rounded-lg border border-emerald-100">
                      <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-1">
                        Group B (Mentor: Prof. Rajesh Kumar)
                      </div>
                      <div className="grid grid-cols-1 gap-1">
                        {[
                          { u: 'student6', n: 'Aarav Patel', s: 'BCA-2026-006' },
                          { u: 'student7', n: 'Sophie Zhang', s: 'BCA-2026-007' },
                          { u: 'student8', n: "Liam O'Connor", s: 'BCA-2026-008' },
                          { u: 'student9', n: 'Ananya Sharma', s: 'BCA-2026-009' },
                          { u: 'student10', n: 'Lucas Garcia', s: 'BCA-2026-010' }
                        ].map((item) => (
                          <button
                            key={item.u}
                            type="button"
                            onClick={() => handleQuickRoleLogin('student', item.u, 'student123')}
                            className="w-full flex items-center justify-between px-2 py-1 bg-white hover:bg-emerald-50 rounded border border-slate-200 text-left cursor-pointer"
                          >
                            <span className="text-[10px] font-medium text-slate-800">{item.n} ({item.s})</span>
                            <span className="text-[10px] font-mono text-emerald-600 font-bold">{item.u}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Standard Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Username or Institutional Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. admin, faculty1, student1, superadmin"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => setViewMode('forgot-password')}
                    className="text-[11px] text-slate-500 hover:text-slate-900 font-medium transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-3.5 h-3.5"
                  />
                  <span>Remember verified session</span>
                </label>
                <span className="text-[11px] text-slate-400">TLS 1.3 • AES-256</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-semibold text-xs sm:text-sm rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Verify Credentials</span>
                    <ArrowRight className="w-4 h-4 text-slate-300" />
                  </>
                )}
              </button>
            </form>

            {/* SSO Providers */}
            <div className="mt-5 pt-5 border-t border-slate-100 text-center space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Institutional Single Sign-On &amp; Root Admin
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickRoleLogin('admin', 'admin@bcafly.edu')}
                  className="py-2 px-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 font-semibold text-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Admin Workspace</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickRoleLogin('super_admin', 'superadmin@bcafly.edu')}
                  className="py-2 px-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 font-semibold text-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Platform SuperAdmin</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* MFA Step */}
        {!loginSuccessRole && viewMode === 'mfa' && (
          <form onSubmit={handleMfaSubmit} className="space-y-4">
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
              <Fingerprint className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">MFA Policy Active</strong>
                <span>Administrator account required step-up verification. Enter code <strong>784912</strong> (simulated).</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                6-Digit Authenticator Token
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="784912"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-base font-mono tracking-widest text-slate-900 text-center focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setViewMode('login')}
                className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-full transition-colors cursor-pointer"
              >
                Back to Sign In
              </button>
              <button
                type="submit"
                className="w-1/2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-full transition-colors cursor-pointer"
              >
                Confirm Token
              </button>
            </div>
          </form>
        )}

        {/* Forgot Password Step */}
        {!loginSuccessRole && viewMode === 'forgot-password' && (
          <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
            {resetSuccessMessage ? (
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs space-y-2 text-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                <p>{resetSuccessMessage}</p>
                <button
                  type="button"
                  onClick={() => setViewMode('login')}
                  className="text-slate-900 font-bold underline cursor-pointer text-xs"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Registered Institutional Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="name@bcafly.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setViewMode('login')}
                    className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-full transition-colors cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-full transition-colors cursor-pointer"
                  >
                    Send Reset Link
                  </button>
                </div>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
