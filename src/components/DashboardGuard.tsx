import React, { useEffect } from 'react';
import { UserRole } from '../types';
import { useDemoStore } from '../context/DemoContext';
import { BcaFlyLogo } from './BcaFlyLogo';
import {
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  LogOut,
  User,
  CheckCircle2,
  Lock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface DashboardGuardProps {
  requiredRole: 'admin' | 'faculty' | 'student';
  onNavigateSignIn: () => void;
  onNavigateRoleDashboard: (role: UserRole) => void;
  onNavigateLanding?: () => void;
  children: React.ReactNode;
}

export const DashboardGuard: React.FC<DashboardGuardProps> = ({
  requiredRole,
  onNavigateSignIn,
  onNavigateRoleDashboard,
  onNavigateLanding,
  children
}) => {
  const { isAuthenticated, currentRole, currentUser, sessionToken, logout } = useDemoStore();

  const isRoleMatch = currentRole === requiredRole;

  // If not authenticated, redirect to sign-in
  useEffect(() => {
    if (!isAuthenticated) {
      onNavigateSignIn();
    }
  }, [isAuthenticated, onNavigateSignIn]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-lg space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Authentication Required</h2>
          <p className="text-sm text-slate-600">
            You must be signed in with an active session to access <span className="font-mono text-slate-900 font-semibold">/dashboard/{requiredRole}</span>.
          </p>
          <button
            onClick={onNavigateSignIn}
            className="w-full py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Go to Sign-In Page
          </button>
        </div>
      </div>
    );
  }

  // If role mismatch
  if (!isRoleMatch) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl border border-rose-200 p-8 text-center shadow-lg space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Unauthorized Role Access</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your authenticated account role is <span className="font-bold text-slate-900 uppercase tracking-wider">{currentRole}</span>.
            You do not have administrative permission to access <span className="font-mono font-semibold">/dashboard/{requiredRole}</span>.
          </p>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-1">
            <div className="text-slate-500">Authenticated Identity:</div>
            <div className="font-bold text-slate-900">{currentUser.name} ({currentUser.email})</div>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => onNavigateRoleDashboard(currentRole)}
              className="w-full py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Go to My {currentRole.toUpperCase()} Dashboard
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                logout();
                onNavigateSignIn();
              }}
              className="w-full py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              Sign Out &amp; Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  const roleTitleMap = {
    admin: 'Admin Dashboard',
    faculty: 'Faculty Dashboard',
    student: 'Student Dashboard'
  };

  const roleBadgeMap = {
    admin: 'bg-indigo-900 text-indigo-100 border-indigo-700',
    faculty: 'bg-emerald-900 text-emerald-100 border-emerald-700',
    student: 'bg-sky-900 text-sky-100 border-sky-700'
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Spec-Defined Role Dashboard Header Banner */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <BcaFlyLogo />
            <div className="h-5 w-px bg-slate-700 hidden sm:block" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  {roleTitleMap[requiredRole]}
                </h1>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${roleBadgeMap[requiredRole]}`}>
                  /dashboard/{requiredRole}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Active Session: <span className="text-slate-200 font-medium">{currentUser.name}</span> &bull; <span className="font-mono text-slate-400">{currentUser.email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onNavigateLanding && (
              <button
                onClick={onNavigateLanding}
                className="text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
              >
                Public Home
              </button>
            )}

            <button
              onClick={() => {
                logout();
                onNavigateSignIn();
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-rose-300 hover:text-rose-100 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/60 px-3.5 py-1.5 rounded-full transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Render Protected Content */}
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  );
};
