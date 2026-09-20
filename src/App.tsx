import React, { Component, useState } from 'react';
import { DemoProvider, useDemoStore } from './context/DemoContext';
import { ScreenType, Student, UserRole } from './types';
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
import { SuperAdminConsole } from './components/SuperAdminConsole';
import { ParentPortalView } from './components/ParentPortalView';
import { Footer } from './components/Footer';
import { StudentDetailModal } from './components/StudentDetailModal';
import { DepartmentUpdateModal } from './components/DepartmentUpdateModal';
import { LoginModal } from './components/LoginModal';
import { AuthenticationView } from './components/AuthenticationView';
import { AboutContactModals } from './components/AboutContactModals';
import { SixSemesterReportsModal } from './components/SixSemesterReportsModal';

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
    facultyList,
    smsMessages,
    getScopedStudentsForActiveFaculty
  } = useDemoStore();

  // Initial screen: Unauthenticated visitors land on the Public Landing Page ('home')
  const [currentScreen, setCurrentScreen] = useState<ScreenType>(() => {
    return isAuthenticated ? 'dashboard' : 'home';
  });

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showNoticeModal, setShowNoticeModal] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showAuditModal, setShowAuditModal] = useState<boolean>(false);
  const [showReportsModal, setShowReportsModal] = useState<boolean>(false);
  const [infoModalType, setInfoModalType] = useState<'about' | 'contact' | 'privacy' | 'terms' | null>(null);

  // Scoped students for active faculty
  const scopedStudents = getScopedStudentsForActiveFaculty() || [];

  const handleNavigation = (screen: ScreenType) => {
    if (screen === 'about' || screen === 'contact') {
      setInfoModalType(screen);
      return;
    }

    // Guard academic workspace screens if unauthenticated
    const protectedScreens: ScreenType[] = ['dashboard', 'students', 'tracking', 'workspace', 'faculties', 'admin', 'student-portal', 'parent-portal', 'platform'];
    if (protectedScreens.includes(screen) && !isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (role: UserRole) => {
    setShowLoginModal(false);
    if (role === 'super_admin') {
      setCurrentScreen('platform');
    } else if (role === 'admin') {
      setCurrentScreen('admin');
    } else if (role === 'faculty') {
      setCurrentScreen('dashboard');
    } else if (role === 'student') {
      setCurrentScreen('student-portal');
    } else if (role === 'parent') {
      setCurrentScreen('parent-portal');
    }
  };

  // Determine if we should display the public landing / explore view
  const isPublicScreen = currentScreen === 'home' || currentScreen === 'explore';
  const isSignInScreen = currentScreen === 'sign-in';

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-slate-900 selection:bg-slate-200 selection:text-slate-900">
      {isSignInScreen ? (
        /* Full-Page Role-Based Authentication Screen */
        <main className="flex-1 w-full">
          <AuthenticationView
            onSuccessRedirect={handleLoginSuccess}
            onNavigateHome={() => setCurrentScreen('home')}
          />
        </main>
      ) : isPublicScreen ? (
        <>
          <Header
            currentScreen={currentScreen}
            onNavigate={handleNavigation}
            activeFaculty={activeFaculty}
            allFaculties={facultyList}
            onSelectFaculty={(fac) => setActiveFaculty(fac)}
            onOpenLogin={() => handleNavigation('sign-in')}
            onOpenReports={() => setShowReportsModal(true)}
            onOpenAudit={() => setShowAuditModal(true)}
          />

          <main className="flex-1 w-full">
            <LandingView
              onNavigate={handleNavigation}
              onOpenLogin={() => handleNavigation('sign-in')}
              onOpenAudit={() => setShowAuditModal(true)}
              onOpenReports={() => setShowReportsModal(true)}
            />
          </main>
        </>
      ) : !isAuthenticated ? (
        /* 2. Unauthenticated Guard Fallback: Redirect to Sign-In Page */
        <>
          <Header
            currentScreen="home"
            onNavigate={handleNavigation}
            activeFaculty={activeFaculty}
            allFaculties={facultyList}
            onSelectFaculty={(fac) => setActiveFaculty(fac)}
            onOpenLogin={() => handleNavigation('sign-in')}
          />
          <main className="flex-1 w-full">
            <LandingView
              onNavigate={handleNavigation}
              onOpenLogin={() => handleNavigation('sign-in')}
            />
          </main>
        </>
      ) : currentRole === 'super_admin' ? (
        /* 3. Platform Hub: Super Admin Console */
        <div className="flex-1">
          <SuperAdminConsole
            onLogout={() => {
              logout();
              setCurrentScreen('home');
            }}
            onNavigatePublic={() => setCurrentScreen('home')}
          />
        </div>
      ) : currentRole === 'admin' ? (
        /* 4. Secure Academic Workspace: Admin / Academic Dean */
        <div className="flex-1">
          <AdminPortalView
            onNavigateHome={() => {
              switchRole('faculty');
              setCurrentScreen('dashboard');
            }}
            onLogout={() => {
              logout();
              setCurrentScreen('home');
            }}
            onNavigatePublic={() => setCurrentScreen('home')}
          />
        </div>
      ) : currentRole === 'student' ? (
        /* 5. Secure Academic Workspace: Student Portal */
        <div className="flex-1">
          <StudentPortalView
            onNavigateHome={() => {
              switchRole('faculty');
              setCurrentScreen('dashboard');
            }}
            onLogout={() => {
              logout();
              setCurrentScreen('home');
            }}
            onNavigatePublic={() => setCurrentScreen('home')}
          />
        </div>
      ) : currentRole === 'parent' ? (
        /* 6. Secure Academic Workspace: Parent Portal */
        <div className="flex-1">
          <ParentPortalView
            onNavigateHome={() => {
              switchRole('faculty');
              setCurrentScreen('dashboard');
            }}
            onLogout={() => {
              logout();
              setCurrentScreen('home');
            }}
            onNavigatePublic={() => setCurrentScreen('home')}
          />
        </div>
      ) : (
        /* 6. Secure Academic Workspace: Faculty Member Dashboard */
        <>
          <Header
            currentScreen={currentScreen}
            onNavigate={handleNavigation}
            activeFaculty={activeFaculty}
            allFaculties={facultyList}
            onSelectFaculty={(fac) => setActiveFaculty(fac)}
            onOpenLogin={() => setShowLoginModal(true)}
            onOpenReports={() => setShowReportsModal(true)}
            onOpenAudit={() => setShowAuditModal(true)}
          />

          <main className="flex-1 w-full">
            {currentScreen === 'dashboard' && (
              <FacultyDashboardView
                onSelectStudent={(st) => setSelectedStudent(st)}
                onOpenNotice={() => setShowNoticeModal(true)}
                onOpenAudit={() => setShowAuditModal(true)}
                onOpenReports={() => setShowReportsModal(true)}
              />
            )}

            {currentScreen === 'students' && (
              <AssignedStudentsView
                students={scopedStudents}
                onSelectStudent={(st) => setSelectedStudent(st)}
                onNavigateHome={() => handleNavigation('dashboard')}
              />
            )}

            {currentScreen === 'tracking' && (
              <AcademicTrackingView
                students={scopedStudents}
                onNavigateHome={() => handleNavigation('dashboard')}
              />
            )}

            {currentScreen === 'workspace' && (
              <SmartWorkspaceView
                students={scopedStudents}
                notices={[]}
                onOpenNotice={() => setShowNoticeModal(true)}
                onSelectStudent={(st) => setSelectedStudent(st)}
                onNavigateHome={() => handleNavigation('dashboard')}
                onOpenReports={() => setShowReportsModal(true)}
                onOpenAudit={() => setShowAuditModal(true)}
              />
            )}

            {currentScreen === 'faculties' && (
              <FacultiesView
                faculties={facultyList}
                activeFaculty={activeFaculty}
                onSelectFaculty={(fac) => setActiveFaculty(fac)}
                onNavigateHome={() => handleNavigation('dashboard')}
              />
            )}

          </main>
        </>
      )}

      {/* Global Footer */}
      <Footer
        onOpenPrivacy={() => setInfoModalType('privacy')}
        onOpenTerms={() => setInfoModalType('terms')}
      />

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

      {/* Student Details Modal (Protected to authenticated faculty/admin) */}
      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}

      {/* Department Notice Modal */}
      {showNoticeModal && (
        <DepartmentUpdateModal
          notice={null}
          onClose={() => setShowNoticeModal(false)}
          onOpenTracking={() => {
            setShowNoticeModal(false);
            setCurrentScreen('tracking');
          }}
        />
      )}

      {/* Authentication Login Modal */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSuccessRedirect={handleLoginSuccess}
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
    window.location.reload();
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
                Reset Demo Storage &amp; Refresh
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
