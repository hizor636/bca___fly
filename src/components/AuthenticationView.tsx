import React, { useState, useMemo } from 'react';
import { UserRole } from '../types';
import { useDemoStore } from '../context/DemoContext';
import { BcaFlyLogo } from './BcaFlyLogo';
import {
  ShieldCheck,
  Building2,
  GraduationCap,
  User,
  Eye,
  EyeOff,
  ChevronDown,
  Lock,
  Mail,
  Users,
  Heart,
  Fingerprint,
  KeyRound,
  ArrowLeft,
} from 'lucide-react';

/**
 * BcaFly — Phase 1 Full-Page Authentication View
 * Implements: role selection rail, role-specific login, DemoContext backend
 * validation, MFA for admin/super_admin, error states, demo access drawer,
 * and role-based redirect — fully integrated with existing auth system.
 */

interface RoleDef {
  key: UserRole;
  label: string;
  idLabel: string;
  platform: string;
  icon: React.ElementType;
  blurb: string;
  color: string;
}

const ROLES: RoleDef[] = [
  {
    key: 'super_admin',
    label: 'Super Admin',
    idLabel: 'Email / Username',
    platform: 'Super Admin Platform',
    icon: ShieldCheck,
    blurb: 'Platform-wide oversight',
    color: 'text-rose-400',
  },
  {
    key: 'admin',
    label: 'Admin',
    idLabel: 'Email / Username',
    platform: 'Admin Control',
    icon: Building2,
    blurb: 'Institutional governance',
    color: 'text-purple-400',
  },
  {
    key: 'faculty',
    label: 'Faculty',
    idLabel: 'Faculty ID / Email',
    platform: 'Faculty Portal',
    icon: User,
    blurb: 'Teaching & mentoring',
    color: 'text-blue-400',
  },
  {
    key: 'student',
    label: 'Student',
    idLabel: 'Student ID / Email',
    platform: 'Student Portal',
    icon: GraduationCap,
    blurb: 'Self-service & records',
    color: 'text-emerald-400',
  },
  {
    key: 'parent',
    label: 'Parent',
    idLabel: 'Parent ID / Email',
    platform: 'Parent Portal',
    icon: Heart,
    blurb: 'Ward progress & updates',
    color: 'text-amber-400',
  },
  {
    key: 'counselor',
    label: 'Counselor',
    idLabel: 'Counselor ID / Email',
    platform: 'Counselor Portal',
    icon: Users,
    blurb: 'Student wellness support',
    color: 'text-sky-400',
  },
];

// Demo credentials — grouped by role for the collapsible drawer
const DEMO_ACCOUNTS: Record<UserRole, { key: string; name: string; note?: string }[]> = {
  super_admin: [{ key: 'superadmin', name: 'Platform Director Sarah Vance' }],
  admin: [{ key: 'admin', name: 'Dr. V. Swaminathan (HOD)' }],
  faculty: [
    { key: 'faculty1', name: 'Dr. Sarah Jenkins — Group A' },
    { key: 'faculty2', name: 'Prof. Rajesh Kumar — Group B' },
  ],
  student: [
    { key: 'student1', name: 'Alexander Wright (Group A)' },
    { key: 'student6', name: 'Aarav Patel (Group B)' },
  ],
  parent: [{ key: 'parent1', name: 'Robert Wright' }],
  counselor: [{ key: 'counselor1', name: 'Dr. Priya Sharma' }],
};

interface AuthenticationViewProps {
  onSuccessRedirect: (role: UserRole) => void;
  onNavigateHome: () => void;
}

export const AuthenticationView: React.FC<AuthenticationViewProps> = ({
  onSuccessRedirect,
  onNavigateHome,
}) => {
  const { login, requestPasswordReset } = useDemoStore();

  const [activeRole, setActiveRole] = useState<UserRole>('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success' | 'mfa' | 'forgot'>('idle');
  const [error, setError] = useState('');
  const [successRole, setSuccessRole] = useState<UserRole | null>(null);
  const [demoOpen, setDemoOpen] = useState(false);

  // MFA state
  const [mfaCode, setMfaCode] = useState('');
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);

  // Forgot password state
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const role = useMemo(() => ROLES.find((r) => r.key === activeRole)!, [activeRole]);

  function switchRole(key: UserRole) {
    setActiveRole(key);
    setUsername('');
    setPassword('');
    setStatus('idle');
    setError('');
    setSuccessRole(null);
    setMfaCode('');
    setPendingRole(null);
    setResetMessage(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password) {
      setStatus('error');
      setError('Please enter all required details');
      return;
    }
    setStatus('loading');
    setError('');

    setTimeout(() => {
      const res = login(username, password, activeRole);
      if (res.success && res.role) {
        // Admin roles require MFA step
        if (res.role === 'admin' || res.role === 'super_admin') {
          setPendingRole(res.role);
          setStatus('mfa');
        } else {
          completeLogin(res.role);
        }
      } else {
        setStatus('error');
        setError(res.error || 'Authentication failed. Please verify your credentials.');
      }
    }, 500);
  }

  function handleMfaSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mfaCode.trim().length < 4) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    if (pendingRole) {
      completeLogin(pendingRole);
    }
  }

  function completeLogin(loginRole: UserRole) {
    setSuccessRole(loginRole);
    setStatus('success');
    setTimeout(() => {
      onSuccessRedirect(loginRole);
    }, 1200);
  }

  function handleForgotSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter your institutional email address.');
      return;
    }
    const res = requestPasswordReset(username.trim());
    setResetMessage(res.message);
  }

  function fillDemo(key: string) {
    setUsername(key);
    setPassword('student123');
    setDemoOpen(false);
    setStatus('idle');
    setError('');
  }

  const demoAccounts = DEMO_ACCOUNTS[activeRole] || [];

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 py-6 px-4 sm:px-6">
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
      `}</style>

      <div
        className="w-full max-w-4xl flex border border-slate-200/80 min-h-[580px] overflow-hidden"
        style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          boxShadow: '0 1px 3px rgba(18, 32, 58, 0.06), 0 8px 24px rgba(18, 32, 58, 0.04)',
        }}
      >
        {/* ═══════════════ ROLE RAIL (LEFT SIDEBAR) ═══════════════ */}
        <div className="hidden sm:flex flex-col w-[240px] shrink-0 bg-slate-900 text-slate-100">
          {/* Brand header */}
          <div className="px-6 pt-7 pb-5 border-b border-white/10">
            <BcaFlyLogo size="md" className="[&_span]:!text-white [&_div]:!bg-white/10 [&_svg]:!text-white" />
            <p
              className="mt-3 text-[12.5px] leading-snug text-slate-400"
              style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
            >
              Institutional access, verified by role.
            </p>
          </div>

          {/* Role navigation */}
          <nav className="flex-1 py-2 overflow-y-auto">
            {ROLES.map((r, i) => {
              const Icon = r.icon;
              const active = r.key === activeRole;
              return (
                <button
                  key={r.key}
                  onClick={() => switchRole(r.key)}
                  className={`w-full text-left px-5 py-3.5 flex items-start gap-3 border-l-2 transition-all duration-200 cursor-pointer ${
                    active
                      ? 'border-l-amber-500 bg-white/[0.06]'
                      : 'border-l-transparent hover:bg-white/[0.03]'
                  }`}
                >
                  <span
                    className="text-[10px] mt-[3px] text-slate-500 w-4 shrink-0"
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    0{i + 1}
                  </span>
                  <Icon
                    size={15}
                    className={`mt-[2px] shrink-0 transition-colors ${active ? 'text-amber-400' : 'text-slate-500'}`}
                  />
                  <span className="flex-1 min-w-0">
                    <span className={`block text-[13px] font-medium ${active ? 'text-white' : 'text-slate-300'}`}>
                      {r.label}
                    </span>
                    <span className="block text-[11px] text-slate-500 mt-0.5">{r.blurb}</span>
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div
            className="px-5 py-4 border-t border-white/10 text-[10px] text-slate-600 tracking-wider"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            SESSION · TLS 1.3 · AES-256
          </div>
        </div>

        {/* ═══════════════ FORM PANE (RIGHT) ═══════════════ */}
        <div className="flex-1 bg-white flex flex-col">
          {/* Mobile role switcher (horizontal tabs) */}
          <div className="sm:hidden flex border-b border-slate-200 overflow-x-auto">
            {ROLES.map((r) => (
              <button
                key={r.key}
                onClick={() => switchRole(r.key)}
                className={`px-3.5 py-3 text-[12px] whitespace-nowrap border-b-2 font-medium transition-colors cursor-pointer ${
                  r.key === activeRole
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Back to home link */}
          <div className="px-8 sm:px-12 pt-6">
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 text-[12px] text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <ArrowLeft size={13} />
              Back to home
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 py-8">
            {/* ── SUCCESS STATE ── */}
            {status === 'success' && successRole ? (
              <SuccessPanel role={role} successRole={successRole} />
            ) : status === 'mfa' ? (
              /* ── MFA STATE ── */
              <MfaPanel
                error={error}
                mfaCode={mfaCode}
                setMfaCode={setMfaCode}
                onSubmit={handleMfaSubmit}
                onBack={() => {
                  setStatus('idle');
                  setMfaCode('');
                  setPendingRole(null);
                  setError('');
                }}
              />
            ) : status === 'forgot' ? (
              /* ── FORGOT PASSWORD STATE ── */
              <ForgotPanel
                username={username}
                setUsername={setUsername}
                error={error}
                resetMessage={resetMessage}
                onSubmit={handleForgotSubmit}
                onBack={() => {
                  setStatus('idle');
                  setError('');
                  setResetMessage(null);
                }}
              />
            ) : (
              /* ── LOGIN FORM ── */
              <>
                <p
                  className="text-[11px] tracking-widest text-amber-600/80 uppercase font-semibold"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  {role.key.replace('_', ' ')}
                </p>
                <h1
                  className="mt-2 text-[26px] sm:text-[28px] leading-tight text-slate-900 font-bold"
                  style={{ fontFamily: "'Source Serif 4', serif" }}
                >
                  {role.label} sign-in
                </h1>
                <p className="mt-2 text-[13.5px] text-slate-500 max-w-[40ch] leading-relaxed">
                  Verified access routes to the {role.platform} once your role is confirmed server-side.
                </p>

                <form onSubmit={handleSubmit} className="mt-7 space-y-4.5 max-w-[360px]">
                  {/* Username / ID field */}
                  <div>
                    <label className="block text-[12.5px] font-semibold text-slate-600 mb-1.5">{role.idLabel}</label>
                    <div className="relative">
                      <Mail
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder={`e.g. ${demoAccounts[0]?.key || 'username'}`}
                        className="w-full border border-slate-200 pl-9 pr-3 py-2.5 text-[13.5px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 bg-slate-50/50 rounded-xl transition-all"
                      />
                    </div>
                  </div>

                  {/* Password field */}
                  <div>
                    <div className="flex items-baseline justify-between mb-1.5">
                      <label className="text-[12.5px] font-semibold text-slate-600">Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          setStatus('forgot');
                          setError('');
                          setResetMessage(null);
                        }}
                        className="text-[11.5px] text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full border border-slate-200 pl-9 pr-10 py-2.5 text-[13.5px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 bg-slate-50/50 rounded-xl transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Error message */}
                  {status === 'error' && (
                    <div className="border-l-2 border-rose-500 bg-rose-50 px-3 py-2.5 text-[12.5px] text-rose-700 rounded-r-lg">
                      {error}
                    </div>
                  )}

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full bg-slate-900 text-white py-2.5 text-[13.5px] font-semibold tracking-wide hover:bg-slate-800 active:scale-[0.995] transition-all disabled:opacity-50 rounded-xl cursor-pointer flex items-center justify-center gap-2"
                  >
                    {status === 'loading' ? (
                      <>
                        <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Verifying…
                      </>
                    ) : (
                      'Verify & continue'
                    )}
                  </button>
                </form>

                {/* ── Demo access drawer ── */}
                <div className="mt-6 max-w-[360px] border-t border-slate-100 pt-4">
                  <button
                    onClick={() => setDemoOpen((o) => !o)}
                    className="flex items-center gap-1.5 text-[12px] text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    <ChevronDown
                      size={13}
                      className={`transition-transform duration-200 ${demoOpen ? 'rotate-180' : ''}`}
                    />
                    Demo access for this role
                  </button>
                  {demoOpen && (
                    <div className="mt-3 grid grid-cols-1 gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                      {demoAccounts.map((acct) => (
                        <button
                          key={acct.key}
                          onClick={() => fillDemo(acct.key)}
                          className="flex items-center justify-between border border-slate-200 px-3 py-2.5 text-left hover:border-slate-400 hover:bg-slate-50 rounded-lg transition-all cursor-pointer"
                        >
                          <span className="text-[12px] text-slate-700 font-medium">{acct.name}</span>
                          <span
                            className="text-[10.5px] text-slate-400"
                            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                          >
                            {acct.key}
                          </span>
                        </button>
                      ))}
                      <p
                        className="text-[10.5px] text-slate-400 mt-1"
                        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                      >
                        Password for all demo accounts: <span className="text-slate-600 font-semibold">student123</span>
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════ SUCCESS PANEL ═══════════════ */
function SuccessPanel({ role, successRole }: { role: RoleDef; successRole: UserRole }) {
  const Icon = role.icon;
  return (
    <div className="max-w-[360px]">
      <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-5">
        <Icon size={18} />
      </div>
      <p
        className="text-[11px] tracking-widest text-emerald-600 uppercase font-bold"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
      >
        SESSION CREATED
      </p>
      <h2
        className="mt-2 text-[24px] text-slate-900 font-bold"
        style={{ fontFamily: "'Source Serif 4', serif" }}
      >
        Identity Verified
      </h2>
      <p className="mt-2 text-[13.5px] text-slate-500">
        Role confirmed server-side. Redirecting to your workspace…
      </p>
      <div className="mt-4 border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between bg-slate-50">
        <span className="text-[13.5px] text-slate-900 font-medium">{role.platform}</span>
        <span
          className="text-[10.5px] text-slate-400"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          /{successRole.replace('_', '-')}
        </span>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span className="inline-block w-3 h-3 border-2 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
        <span className="text-[12px] text-emerald-600">Redirecting…</span>
      </div>
    </div>
  );
}

/* ═══════════════ MFA PANEL ═══════════════ */
function MfaPanel({
  error,
  mfaCode,
  setMfaCode,
  onSubmit,
  onBack,
}: {
  error: string;
  mfaCode: string;
  setMfaCode: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}) {
  return (
    <div className="max-w-[360px]">
      <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-5">
        <Fingerprint size={18} />
      </div>
      <p
        className="text-[11px] tracking-widest text-amber-600 uppercase font-bold"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
      >
        STEP-UP VERIFICATION
      </p>
      <h2
        className="mt-2 text-[24px] text-slate-900 font-bold"
        style={{ fontFamily: "'Source Serif 4', serif" }}
      >
        Multi-Factor Authentication
      </h2>
      <p className="mt-2 text-[13.5px] text-slate-500 leading-relaxed">
        Administrator account detected. Enter the 6-digit authenticator code.
      </p>

      <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200 text-[12px] text-amber-800">
        <strong>Simulated code:</strong>{' '}
        <span style={{ fontFamily: "'IBM Plex Mono', monospace" }} className="font-bold">
          784912
        </span>
      </div>

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <div>
          <label className="block text-[12.5px] font-semibold text-slate-600 mb-1.5">
            6-Digit Token
          </label>
          <div className="relative">
            <KeyRound
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              maxLength={6}
              placeholder="784912"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              className="w-full border border-slate-200 pl-9 pr-3 py-2.5 text-[15px] font-mono tracking-[0.25em] text-center text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 bg-slate-50/50 rounded-xl"
            />
          </div>
        </div>

        {error && (
          <div className="border-l-2 border-rose-500 bg-rose-50 px-3 py-2.5 text-[12.5px] text-rose-700 rounded-r-lg">
            {error}
          </div>
        )}

        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[13px] rounded-xl transition-colors cursor-pointer"
          >
            Back
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[13px] rounded-xl transition-colors cursor-pointer"
          >
            Confirm Token
          </button>
        </div>
      </form>
    </div>
  );
}

/* ═══════════════ FORGOT PASSWORD PANEL ═══════════════ */
function ForgotPanel({
  username,
  setUsername,
  error,
  resetMessage,
  onSubmit,
  onBack,
}: {
  username: string;
  setUsername: (v: string) => void;
  error: string;
  resetMessage: string | null;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}) {
  return (
    <div className="max-w-[360px]">
      <p
        className="text-[11px] tracking-widest text-slate-400 uppercase font-bold"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
      >
        PASSWORD RECOVERY
      </p>
      <h2
        className="mt-2 text-[24px] text-slate-900 font-bold"
        style={{ fontFamily: "'Source Serif 4', serif" }}
      >
        Reset your password
      </h2>
      <p className="mt-2 text-[13.5px] text-slate-500 leading-relaxed">
        Enter your registered institutional email to receive a recovery token.
      </p>

      {resetMessage ? (
        <div className="mt-5 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-[13px] text-emerald-800 text-center space-y-3">
          <p>{resetMessage}</p>
          <button
            type="button"
            onClick={onBack}
            className="text-slate-900 font-bold underline cursor-pointer text-[12.5px]"
          >
            Return to Sign In
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-[12.5px] font-semibold text-slate-600 mb-1.5">
              Institutional Email
            </label>
            <div className="relative">
              <Mail
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="name@bcafly.edu"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-slate-200 pl-9 pr-3 py-2.5 text-[13.5px] text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 bg-slate-50/50 rounded-xl"
              />
            </div>
          </div>

          {error && (
            <div className="border-l-2 border-rose-500 bg-rose-50 px-3 py-2.5 text-[12.5px] text-rose-700 rounded-r-lg">
              {error}
            </div>
          )}

          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[13px] rounded-xl transition-colors cursor-pointer"
            >
              Back to sign-in
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[13px] rounded-xl transition-colors cursor-pointer"
            >
              Send Reset Link
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
