import React, { useState } from 'react';
import { BcaFlyLogo } from './BcaFlyLogo';
import { ScreenType, FacultyMember } from '../types';
import { useDemoStore } from '../context/DemoContext';
import {
  User,
  LogOut,
  ChevronDown,
  Check,
  GraduationCap,
  BarChart2,
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  Eye,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
  Menu,
  X
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
  const { isAuthenticated, currentUser, currentRole, logout } = useDemoStore();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isPublicScreen = currentScreen === 'home' || currentScreen === 'explore';

  const handleLogout = () => {
    setProfileDropdownOpen(false);
    logout();
    onNavigate('signin');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          id="nav-brand-logo"
          onClick={() => onNavigate(isAuthenticated ? 'dashboard' : 'home')}
          className="cursor-pointer transition-transform hover:opacity-95"
        >
          <BcaFlyLogo />
        </div>

        {/* Desktop Nav Items: Dynamic based on Public vs Workspace mode */}
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
          /* Workspace Navigation Links (When inside Secure Academic Workspace) */
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
            <button
              id="nav-dashboard-btn"
              onClick={() => onNavigate('dashboard')}
              className={`text-sm font-medium transition-colors cursor-pointer ${
                currentScreen === 'dashboard'
                  ? 'text-slate-900 font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Dashboard
            </button>

            <button
              id="nav-quick-students-btn"
              onClick={() => onNavigate('students')}
              className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
                currentScreen === 'students'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Assigned Students (42)
            </button>

            <button
              id="nav-quick-workspace-btn"
              onClick={() => onNavigate('workspace')}
              className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
                currentScreen === 'workspace'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Smart Workspace
            </button>

            <button
              id="nav-faculties-btn"
              onClick={() => onNavigate('faculties')}
              className={`text-sm font-medium transition-colors cursor-pointer ${
                currentScreen === 'faculties'
                  ? 'text-slate-900 font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Faculties
            </button>

            <button
              id="nav-explore-btn"
              onClick={() => onNavigate('home')}
              className="text-xs text-slate-400 hover:text-slate-700 font-medium transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Public Site</span>
            </button>
          </nav>
        )}

        {/* Right Side Actions */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {!isAuthenticated ? (
            /* Unauthenticated Visitor Actions */
            <div className="flex items-center gap-3">
              <button
                id="header-explore-btn"
                onClick={() => onNavigate('explore')}
                className="hidden sm:inline-block text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 transition-colors cursor-pointer"
              >
                Explore Platform
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
            /* Authenticated User Actions */
            <div className="flex items-center gap-3">
              {isPublicScreen && (
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-full transition-all cursor-pointer shadow-xs"
                >
                  <span>Go to Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {/* User Profile avatar & dropdown */}
              <div className="relative">
                <button
                  id="header-profile-avatar-btn"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="h-9 w-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold transition-all border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 cursor-pointer"
                  title={`${currentUser?.name || activeFaculty.name} (${currentRole.toUpperCase()})`}
                >
                  {(currentUser?.name || activeFaculty.name)
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </button>

                {/* Profile & Switcher Dropdown */}
                {profileDropdownOpen && (
                  <div
                    id="header-profile-dropdown"
                    className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  >
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                          {(currentUser?.name || activeFaculty.name)
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {currentUser?.name || activeFaculty.name}
                          </p>
                          <p className="text-xs text-slate-500 truncate capitalize">
                            {currentUser?.email || activeFaculty.email}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider bg-slate-900 text-white px-2 py-0.5 rounded-full">
                          {currentRole}
                        </span>
                        {currentRole === 'faculty' && (
                          <span className="text-xs text-slate-500">
                            42 BCA Students
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="px-3 py-2">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 px-2 mb-1">
                        Workspace Actions
                      </p>
                      <button
                        onClick={() => {
                          onNavigate('dashboard');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-slate-500" />
                        Faculty Dashboard
                      </button>
                      <button
                        onClick={() => {
                          onNavigate('students');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        Assigned Students (42)
                      </button>
                      <button
                        onClick={() => {
                          onNavigate('tracking');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <BarChart2 className="w-3.5 h-3.5 text-slate-500" />
                        Grades &amp; Roll-Call
                      </button>
                      {onOpenReports && (
                        <button
                          onClick={() => {
                            onOpenReports();
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-500" />
                          6-Sem Reports
                        </button>
                      )}
                      {onOpenAudit && (
                        <button
                          onClick={() => {
                            onOpenAudit();
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          Audit Ledger
                        </button>
                      )}
                    </div>

                    {/* Faculty switcher for testing */}
                    {currentRole === 'faculty' && (
                      <div className="border-t border-slate-100 px-3 py-2">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 px-2 mb-1">
                          Switch Faculty Account
                        </p>
                        {allFaculties.map((f) => (
                          <button
                            key={f.id}
                            onClick={() => {
                              onSelectFaculty(f);
                              setProfileDropdownOpen(false);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between text-slate-600 hover:bg-slate-50 cursor-pointer"
                          >
                            <span className="truncate">{f.name}</span>
                            {f.id === activeFaculty.id && (
                              <Check className="w-3.5 h-3.5 text-slate-900" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Sign Out / Exit Session */}
                    <div className="border-t border-slate-100 pt-1 px-3">
                      <button
                        id="header-signout-btn"
                        onClick={handleLogout}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Log Out &amp; Return to Public Site
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-2 pb-4 space-y-1">
          {isPublicScreen ? (
            <>
              <button
                onClick={() => {
                  onNavigate('home');
                  setMobileMenuOpen(false);
                  const el = document.getElementById('features');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="block w-full text-left py-2 px-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Features
              </button>
              <button
                onClick={() => {
                  onNavigate('home');
                  setMobileMenuOpen(false);
                  const el = document.getElementById('mentoring-overview');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="block w-full text-left py-2 px-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Mentoring
              </button>
              <button
                onClick={() => {
                  onNavigate('home');
                  setMobileMenuOpen(false);
                  const el = document.getElementById('attendance-workflow');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="block w-full text-left py-2 px-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Roll-Call &amp; Alerts
              </button>
              <button
                onClick={() => {
                  onNavigate('home');
                  setMobileMenuOpen(false);
                  const el = document.getElementById('reports-progression');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="block w-full text-left py-2 px-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                6-Sem Matrix
              </button>
              <button
                onClick={() => {
                  onNavigate('home');
                  setMobileMenuOpen(false);
                  const el = document.getElementById('contact-support');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="block w-full text-left py-2 px-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Campus Support
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  onNavigate('dashboard');
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left py-2 px-3 rounded-xl text-sm font-medium ${
                  currentScreen === 'dashboard' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => {
                  onNavigate('students');
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left py-2 px-3 rounded-xl text-sm font-medium ${
                  currentScreen === 'students' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Assigned Students (42)
              </button>
              <button
                onClick={() => {
                  onNavigate('workspace');
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left py-2 px-3 rounded-xl text-sm font-medium ${
                  currentScreen === 'workspace' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Smart Workspace
              </button>
              <button
                onClick={() => {
                  onNavigate('tracking');
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left py-2 px-3 rounded-xl text-sm font-medium ${
                  currentScreen === 'tracking' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Academic Tracking
              </button>
            </>
          )}

          <div className="pt-2 border-t border-slate-100">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="block w-full text-left py-2 px-3 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
              >
                Log Out ({currentUser?.name})
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLogin();
                }}
                className="block w-full text-center py-2.5 px-3 rounded-full text-sm font-bold bg-slate-900 text-white cursor-pointer"
              >
                Sign In to Workspace
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
