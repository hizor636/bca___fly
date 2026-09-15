import React, { useState } from 'react';
import { BcaFlyLogo } from './BcaFlyLogo';
import { ScreenType, FacultyMember, UserRole } from '../types';
import { useDemoStore } from '../context/DemoContext';
import {
  User,
  LogOut,
  Check,
  BarChart2,
  LayoutDashboard,
  Users,
  FileText,
  Eye,
  ArrowRight,
  Menu,
  X,
  ShieldCheck,
  Building,
  GraduationCap,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  activeFaculty: FacultyMember;
  allFaculties: FacultyMember[];
  onSelectFaculty: (faculty: FacultyMember) => void;
  onOpenLogin: () => void;
  onOpenReports?: () => void;
  onOpenAudit?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  activeFaculty,
  allFaculties,
  onSelectFaculty,
  onOpenLogin,
  onOpenReports,
  onOpenAudit,
}) => {
  const { isAuthenticated, currentUser, currentRole, switchRole, logout } = useDemoStore();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isPublicScreen = currentScreen === 'home' || currentScreen === 'explore';

  const facultyName =
    currentUser?.name?.trim() ||
    activeFaculty?.name?.trim() ||
    currentUser?.email?.split('@')[0] ||
    'Faculty';

  const handleLogout = () => {
    setProfileDropdownOpen(false);
    logout();
    onNavigate('home');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <div
            id="nav-brand-logo"
            onClick={() => onNavigate(isAuthenticated ? (currentRole === 'faculty' ? 'dashboard' : currentRole === 'admin' ? 'admin' : currentRole === 'student' ? 'student-portal' : currentRole === 'super_admin' ? 'platform' : currentRole === 'parent' ? 'parent-portal' : 'counselor-portal') : 'home')}
            className="cursor-pointer transition-transform hover:opacity-95"
          >
            <BcaFlyLogo />
          </div>

          {/* Desktop Nav Items */}
          {isPublicScreen ? (
            /* Public Landing Navigation Links */
            <nav className="hidden md:flex items-center space-x-6 lg:space-x-8 text-xs sm:text-sm font-medium text-slate-600">
              <button
                onClick={() => {
                  onNavigate('home');
                  const el = document.getElementById('features');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hover:text-slate-950 transition-colors cursor-pointer"
              >
                Features
              </button>
              <button
                onClick={() => {
                  onNavigate('home');
                  const el = document.getElementById('mentoring-overview');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hover:text-slate-950 transition-colors cursor-pointer"
              >
                Mentoring
              </button>
              <button
                onClick={() => {
                  onNavigate('home');
                  const el = document.getElementById('attendance-workflow');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hover:text-slate-950 transition-colors cursor-pointer"
              >
                Roll-Call &amp; Alerts
              </button>
              <button
                onClick={() => {
                  onNavigate('home');
                  const el = document.getElementById('reports-progression');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hover:text-slate-950 transition-colors cursor-pointer"
              >
                6-Sem Matrix
              </button>
              <button
                onClick={() => {
                  onNavigate('home');
                  const el = document.getElementById('security-audit');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hover:text-slate-950 transition-colors cursor-pointer"
              >
                Security &amp; Audit
              </button>
              <button
                onClick={() => {
                  onNavigate('home');
                  const el = document.getElementById('contact-support');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hover:text-slate-950 transition-colors cursor-pointer"
              >
                Support
              </button>

            </nav>
          ) : (
            /* Authenticated Role-Specific Nav Links */
            <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 text-xs font-semibold">
              {currentRole === 'faculty' && (
                <>
                  <button
                    onClick={() => onNavigate('dashboard')}
                    className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                      currentScreen === 'dashboard' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => onNavigate('students')}
                    className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                      currentScreen === 'students' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Assigned Mentees ({activeFaculty?.assignedStudentsCount || 0})
                  </button>
                  <button
                    onClick={() => onNavigate('workspace')}
                    className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                      currentScreen === 'workspace' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Smart Workspace
                  </button>
                  <button
                    onClick={() => onNavigate('tracking')}
                    className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                      currentScreen === 'tracking' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Assessment Tracking
                  </button>
                </>
              )}

              {currentRole === 'student' && (
                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3.5 py-1.5 rounded-full">
                  🎓 Student Portal Active
                </span>
              )}

              {currentRole === 'admin' && (
                <span className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-3.5 py-1.5 rounded-full">
                  🏛️ Department Administration Active
                </span>
              )}

              {currentRole === 'super_admin' && (
                <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3.5 py-1.5 rounded-full">
                  🛡️ Platform Super Admin Active
                </span>
              )}

              {currentRole === 'parent' && (
                <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-full">
                  👨‍👧 Parent Portal Active
                </span>
              )}

              {currentRole === 'counselor' && (
                <span className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-3.5 py-1.5 rounded-full">
                  🔒 Confidential Counseling Vault
                </span>
              )}


            </nav>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {!isAuthenticated ? (
              <div className="flex items-center gap-2.5 sm:gap-3">

                <button
                  id="header-explore-btn"
                  onClick={() => onNavigate('explore')}
                  className="hidden sm:inline-block text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 transition-colors cursor-pointer"
                >
                  Platform Features
                </button>
                <button
                  id="header-login-btn"
                  onClick={onOpenLogin}
                  className="bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-full transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {isPublicScreen && (
                  <button
                    onClick={() => {
                      if (currentRole === 'faculty') onNavigate('dashboard');
                      else if (currentRole === 'admin') onNavigate('admin');
                      else if (currentRole === 'student') onNavigate('student-portal');
                      else if (currentRole === 'super_admin') onNavigate('platform');
                      else if (currentRole === 'parent') onNavigate('parent-portal');
                      else if (currentRole === 'counselor') onNavigate('counselor-portal');
                    }}
                    className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-full transition-all cursor-pointer shadow-xs"
                  >
                    <span>Go to Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* User Identity Pill */}
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-900 leading-tight">{facultyName}</span>
                  <span className="text-[10px] text-slate-400 capitalize">{currentRole.replace('_', ' ')}</span>
                </div>

                {/* User Profile Avatar & Dropdown */}
                <div className="relative">
                  <button
                    id="header-profile-avatar-btn"
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="h-9 w-9 rounded-full bg-slate-900 text-white hover:bg-slate-800 flex items-center justify-center text-xs font-bold transition-all border border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer shadow-xs"
                    title={`${facultyName} (${currentRole.toUpperCase()})`}
                  >
                    {facultyName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 space-y-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                      <div className="pb-3 border-b border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Signed In
                          </span>
                          <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                            {currentRole}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm mt-1">{facultyName}</h4>
                        <p className="text-xs text-slate-500 truncate">{currentUser?.email || 'faculty@bcafly.edu'}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{currentUser?.designation || activeFaculty?.designation || 'Faculty'}</p>
                      </div>

                      <div className="space-y-1 text-xs">
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            if (currentRole === 'faculty') onNavigate('dashboard');
                            else if (currentRole === 'admin') onNavigate('admin');
                            else if (currentRole === 'student') onNavigate('student-portal');
                            else if (currentRole === 'super_admin') onNavigate('platform');
                            else if (currentRole === 'parent') onNavigate('parent-portal');
                            else if (currentRole === 'counselor') onNavigate('counselor-portal');
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-800 font-medium transition-colors cursor-pointer"
                        >
                          Workspace Dashboard
                        </button>

                        {onOpenReports && (
                          <button
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              onOpenReports();
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-800 font-medium transition-colors cursor-pointer"
                          >
                            6-Semester Matrix
                          </button>
                        )}

                        {onOpenAudit && (
                          <button
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              onOpenAudit();
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-800 font-medium transition-colors cursor-pointer"
                          >
                            Audit Ledger
                          </button>
                        )}


                      </div>

                      <div className="pt-2 border-t border-slate-100">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <span>Sign Out of Session</span>
                          <LogOut className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
  );
};
