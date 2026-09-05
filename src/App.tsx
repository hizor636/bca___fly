import React, { Component, useState, useEffect, useCallback } from 'react';
import { DemoProvider, useDemoStore } from './context/DemoContext';
import { ScreenType, Student, UserRole } from './types';
import { INITIAL_NOTICES, INITIAL_FACULTY } from './data/academicData';
import { AuditTrailModal } from './components/AuditTrailModal';
import { Header } from './components/Header';
import { FacultyDashboardView } from './components/FacultyDashboardView';
import { LandingView } from './components/LandingView';
import { AssignedStudentsView } from './components/AssignedStudentsView';
import { AcademicTrackingView } from './components/AcademicTrackingView';
import { SmartWorkspaceView } from './components/SmartWorkspaceView';
import { FacultiesView } from './components/FacultiesView';
import { AdminPortalView } from './components/AdminPortalView';
import { StudentPortalView } from './components/StudentPortalView';
import { CounselorPortalView } from './components/CounselorPortalView';
import { Footer } from './components/Footer';
import { StudentDetailModal } from './components/StudentDetailModal';
import { DepartmentUpdateModal } from './components/DepartmentUpdateModal';
import { LoginModal } from './components/LoginModal';
import { AboutContactModals } from './components/AboutContactModals';
import { SixSemesterReportsModal } from './components/SixSemesterReportsModal';
import { SignInPage } from './components/SignInPage';
import { DashboardGuard } from './components/DashboardGuard';

/**
 * Maps the browser URL pathname to internal ScreenType
 */
function getScreenFromPath(pathname: string, isAuthenticated: boolean, role: UserRole): ScreenType {
  const cleanPath = pathname.replace(/\/$/, '') || '/';

  if (cleanPath === '/signin') {
    return 'signin';
  }
  if (cleanPath === '/dashboard/admin') {
    return 'dashboard-admin';
  }
  if (cleanPath === '/dashboard/faculty') {
    return 'dashboard-faculty';
  }
  if (cleanPath === '/dashboard/student') {
    return 'dashboard-student';
  }
  if (cleanPath === '/explore') {
    return 'explore';
  }
  if (cleanPath === '/counselor') {
    return 'counselor-portal';
  }

  // Root path handling
  if (cleanPath === '/') {
    if (isAuthenticated) {
      if (role === 'admin') return 'dashboard-admin';
      if (role === 'student') return 'dashboard-student';
      return 'dashboard-faculty';
    }
    return 'home';
  }

  return 'home';
}

const AppContent: React.FC = () => {
  const {
    isAuthenticated,
    currentRole,
    currentUser,
    switchRole,
    logout,
    activeFaculty,
    setActiveFaculty,
    students,
    activeStudent,
    getScopedStudentsForActiveFaculty
  } = useDemoStore();

  // Screen State initialized from current browser URL
  const [currentScreen, setCurrentScreen] = useState<ScreenType>(() => {
    return getScreenFromPath(window.location.pathname, isAuthenticated, currentRole);
  });

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showNoticeModal, setShowNoticeModal] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showAuditModal, setShowAuditModal] = useState<boolean>(false);
  const [showReportsModal, setShowReportsModal] = useState<boolean>(false);
  const [infoModalType, setInfoModalType] = useState<'about' | 'contact' | 'privacy' | 'terms' | null>(null);

  // Synchronize browser history & URL path
  const navigateTo = useCallback((path: string, screen: ScreenType) => {
    if (window.location.pathname !== path) {
      try {
        window.history.pushState({}, '', path);
      } catch {
        // ignore history state errors
      }
    }
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Listen for browser back / forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const targetScreen = getScreenFromPath(window.location.pathname, isAuthenticated, currentRole);
      setCurrentScreen(targetScreen);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAuthenticated, currentRole]);

  // Handle role redirect after sign-in
  const handleSignInRedirect = (role: UserRole) => {
    setShowLoginModal(false);
    if (role === 'admin') {
      navigateTo('/dashboard/admin', 'dashboard-admin');
    } else if (role === 'student') {
      navigateTo('/dashboard/student', 'dashboard-student');
    } else {
      navigateTo('/dashboard/faculty', 'dashboard-faculty');
    }
  };

  const handleNavigation = (screen: ScreenType) => {
    if (screen === 'about' || screen === 'contact') {
      setInfoModalType(screen);
      return;
    }

    if (screen === 'signin') {
      navigateTo('/signin', 'signin');
      return;
    }

    if (screen === 'home') {
      navigateTo('/', 'home');
      return;
    }

    if (screen === 'explore') {
      navigateTo('/explore', 'explore');
      return;
    }

    if (screen === 'dashboard-admin' || (screen === 'admin' && currentRole === 'admin')) {
      navigateTo('/dashboard/admin', 'dashboard-admin');
      return;
    }

    if (screen === 'dashboard-faculty' || (screen === 'dashboard' && currentRole === 'faculty')) {
      navigateTo('/dashboard/faculty', 'dashboard-faculty');
      return;
    }

    if (screen === 'dashboard-student' || (screen === 'student-portal' && currentRole === 'student')) {
      navigateTo('/dashboard/student', 'dashboard-student');
      return;
    }

    // Guard academic workspace screens if unauthenticated
    const protectedScreens: ScreenType[] = ['dashboard', 'students', 'tracking', 'workspace', 'faculties', 'dashboard-faculty', 'dashboard-admin', 'dashboard-student'];
    if (protectedScreens.includes(screen) && !isAuthenticated) {
      navigateTo('/signin', 'signin');
      return;
    }

    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scopedStudents = getScopedStudentsForActiveFaculty() || [];

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-slate-900 selection:bg-slate-200 selection:text-slate-900">
      {/* 1. Dedicated Sign-In Screen (/signin) */}
      {currentScreen === 'signin' ? (
        <SignInPage
          onSuccessRedirect={handleSignInRedirect}
          onNavigateLanding={() => navigateTo('/', 'home')}
        />
      ) : currentScreen === 'dashboard-admin' ? (
        /* 2. Role-Based Admin Dashboard (/dashboard/admin) */
        <DashboardGuard
          requiredRole="admin"
          onNavigateSignIn={() => navigateTo('/signin', 'signin')}
          onNavigateRoleDashboard={(role) => handleSignInRedirect(role)}
          onNavigateLanding={() => navigateTo('/', 'home')}
        >
          <div className="flex-1">
            <AdminPortalView
              onNavigateHome={() => navigateTo('/dashboard/admin', 'dashboard-admin')}
              onLogout={() => {
                logout();
                navigateTo('/signin', 'signin');
              }}
              onNavigatePublic={() => navigateTo('/', 'home')}
            />
          </div>
        </DashboardGuard>
      ) : currentScreen === 'dashboard-student' ? (
        /* 3. Role-Based Student Dashboard (/dashboard/student) */
        <DashboardGuard
          requiredRole="student"
          onNavigateSignIn={() => navigateTo('/signin', 'signin')}
          onNavigateRoleDashboard={(role) => handleSignInRedirect(role)}
          onNavigateLanding={() => navigateTo('/', 'home')}
        >
          <div className="flex-1">
            <StudentPortalView
              onNavigateHome={() => navigateTo('/dashboard/student', 'dashboard-student')}
              onLogout={() => {
                logout();
                navigateTo('/signin', 'signin');
              }}
              onNavigatePublic={() => navigateTo('/', 'home')}
            />
          </div>
        </DashboardGuard>
      ) : currentScreen === 'dashboard-faculty' || (isAuthenticated && currentRole === 'faculty' && ['dashboard', 'students', 'tracking', 'workspace', 'faculties'].includes(currentScreen)) ? (
        /* 4. Role-Based Faculty Dashboard (/dashboard/faculty & Sub-views) */
        <DashboardGuard
          requiredRole="faculty"
          onNavigateSignIn={() => navigateTo('/signin', 'signin')}
          onNavigateRoleDashboard={(role) => handleSignInRedirect(role)}
          onNavigateLanding={() => navigateTo('/', 'home')}
        >
          <Header
            currentScreen={currentScreen}
            onNavigate={handleNavigation}
            activeFaculty={activeFaculty}
            allFaculties={INITIAL_FACULTY}
            onSelectFaculty={(fac) => setActiveFaculty(fac)}
            onOpenLogin={() => navigateTo('/signin', 'signin')}
            onOpenReports={() => setShowReportsModal(true)}
            onOpenAudit={() => setShowAuditModal(true)}
          />

          <main className="flex-1 w-full">
            {(currentScreen === 'dashboard' || currentScreen === 'dashboard-faculty') && (
              <FacultyDashboardView
                onSelectStudent={(st) => setSelectedStudent(st)}
                onOpenNotice={() => setShowNoticeModal(true)}
                onOpenAudit={() => setShowAuditModal(true)}
                onOpenReports={() => setShowReportsModal(true)}
                onNavigateExplore={() => handleNavigation('explore')}
              />
            )}

            {currentScreen === 'students' && (
              <AssignedStudentsView
                students={scopedStudents}
                onSelectStudent={(st) => setSelectedStudent(st)}
                onNavigateHome={() => handleNavigation('dashboard-faculty')}
              />
            )}

            {currentScreen === 'tracking' && (
              <AcademicTrackingView
                students={scopedStudents}
                onNavigateHome={() => handleNavigation('dashboard-faculty')}
              />
            )}

            {currentScreen === 'workspace' && (
              <SmartWorkspaceView
                students={scopedStudents}
                notices={INITIAL_NOTICES}
                onOpenNotice={() => setShowNoticeModal(true)}
                onSelectStudent={(st) => setSelectedStudent(st)}
                onNavigateHome={() => handleNavigation('dashboard-faculty')}
                onOpenReports={() => setShowReportsModal(true)}
                onOpenAudit={() => setShowAuditModal(true)}
              />
            )}

            {currentScreen === 'faculties' && (
              <FacultiesView
                faculties={INITIAL_FACULTY}
                activeFaculty={activeFaculty}
                onSelectFaculty={(fac) => setActiveFaculty(fac)}
                onNavigateHome={() => handleNavigation('dashboard-faculty')}
              />
            )}
          </main>
        </DashboardGuard>
      ) : currentRole === 'counselor' && currentScreen === 'counselor-portal' ? (
        /* 5. Counselor Portal */
        <div className="flex-1">
          <CounselorPortalView
            onNavigateHome={() => navigateTo('/', 'home')}
            onLogout={() => {
              logout();
              navigateTo('/signin', 'signin');
            }}
            onNavigatePublic={() => navigateTo('/', 'home')}
          />
        </div>
      ) : (
        /* 6. Public Landing & Exploration Area (/) */
        <>
          <Header
            currentScreen={currentScreen}
            onNavigate={handleNavigation}
            activeFaculty={activeFaculty}
            allFaculties={INITIAL_FACULTY}
            onSelectFaculty={(fac) => setActiveFaculty(fac)}
            onOpenLogin={() => navigateTo('/signin', 'signin')}
            onOpenReports={() => setShowReportsModal(true)}
            onOpenAudit={() => setShowAuditModal(true)}
          />

          <main className="flex-1 w-full">
            <LandingView
              onNavigate={handleNavigation}
              onOpenLogin={() => navigateTo('/signin', 'signin')}
              onOpenAudit={() => setShowAuditModal(true)}
              onOpenReports={() => setShowReportsModal(true)}
            />
          </main>
        </>
      )}

      {/* Global Footer (Visible on landing and faculty pages) */}
      {currentScreen !== 'signin' && (
        <Footer
          onOpenPrivacy={() => setInfoModalType('privacy')}
          onOpenTerms={() => setInfoModalType('terms')}
        />
      )}

      {/* Global Audit Ledger Modal */}
      {showAuditModal && (
        <AuditTrailModal onClose={() => setShowAuditModal(false)} />
      )}

      {/* Global 6-Semester Reports Modal */}
      {showReportsModal && (
        <SixSemesterReportsModal
          isOpen={showReportsModal}
          onClose={() => setShowReportsModal(false)}
        />
      )}

      {/* Student Details Modal */}
      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}

      {/* Department Notice Modal */}
      {showNoticeModal && (
        <DepartmentUpdateModal
          notice={INITIAL_NOTICES[0]}
          onClose={() => setShowNoticeModal(false)}
          onOpenTracking={() => {
            setShowNoticeModal(false);
            handleNavigation('tracking');
          }}
        />
      )}

      {/* Optional Legacy Login Modal */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSuccessRedirect={handleSignInRedirect}
        />
      )}

      {/* About & Support Legal Modals */}
      {infoModalType && (
        <AboutContactModals
          type={infoModalType}
          onClose={() => setInfoModalType(null)}
        />
      )}
    </div>
  );
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('BcaFly App Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.clear();
    } catch {
      // ignore
    }
    window.location.href = '/signin';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-lg space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto text-xl font-bold">
              !
            </div>
            <h2 className="text-xl font-bold text-slate-900">Application Workspace Recovery</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              The application encountered an unexpected display issue. You can reload the workspace or reset session cache to continue.
            </p>
            {this.state.error && (
              <div className="p-3 bg-slate-100 rounded-xl text-left text-xs font-mono text-slate-700 overflow-x-auto max-h-28">
                {this.state.error.message}
              </div>
            )}
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                className="w-full py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Reset Demo Storage &amp; Go to Sign In
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <DemoProvider>
        <AppContent />
      </DemoProvider>
    </ErrorBoundary>
  );
}
