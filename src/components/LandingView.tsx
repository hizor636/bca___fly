import React, { useState } from 'react';
import { ScreenType } from '../types';
import { useDemoStore } from '../context/DemoContext';
import { BcaFlyLogo } from './BcaFlyLogo';
import {
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  Lock,
  Users,
  CheckCircle2,
  MessageSquare,
  BarChart2,
  Calendar,
  Send,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  MapPin,
  Building,
  Clock
} from 'lucide-react';

interface LandingViewProps {
  onNavigate: (screen: ScreenType) => void;
  onOpenLogin: () => void;
  onOpenAudit?: () => void;
  onOpenReports?: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onNavigate,
  onOpenLogin
}) => {
  const { isAuthenticated, currentUser, currentRole, logout } = useDemoStore();

  // Interactive Architecture Explorer Tab State
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<'mentoring' | 'attendance' | 'grading' | 'counseling'>('mentoring');

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Contact / Helpdesk Form State
  const [ticketName, setTicketName] = useState('');
  const [ticketEmail, setTicketEmail] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Academic Access / Credentials');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketSubmitted(true);
    setTimeout(() => {
      setTicketName('');
      setTicketEmail('');
      setTicketMessage('');
      setTicketSubmitted(false);
    }, 4000);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-white text-slate-900 antialiased selection:bg-slate-200">
      {/* Authenticated User Status Banner (Specification Rule: Allow exploration without forcing immediate redirect, but provide prominent 1-click jump back to workspace) */}
      {isAuthenticated && (
        <div className="sticky top-0 z-50 bg-slate-900 text-white border-b border-slate-800 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0"></span>
              <span className="text-slate-200">
                Authenticated Active Session:{' '}
                <strong className="text-white font-semibold">{currentUser?.name}</strong>{' '}
                <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ml-1">
                  {currentRole}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                id="landing-resume-workspace-btn"
                onClick={() => onNavigate('dashboard')}
                className="bg-white hover:bg-slate-100 text-slate-950 font-bold px-4 py-1.5 rounded-full transition-all text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Go to {currentRole === 'faculty' ? 'Faculty Workspace' : currentRole === 'admin' ? 'Admin Console' : currentRole === 'student' ? 'Student Portal' : 'Faculty Workspace'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                id="landing-banner-signout-btn"
                onClick={logout}
                className="text-slate-400 hover:text-white transition-colors underline cursor-pointer text-xs"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. PUBLIC HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-28 border-b border-slate-100 bg-linear-to-b from-slate-50/70 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Column: Public Value Proposition */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              {/* Institutional Governance Pill */}
              <div
                id="hero-governance-pill"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold tracking-wide mb-6 border border-slate-200/60 shadow-2xs"
              >
                <GraduationCap className="w-4 h-4 text-slate-700" />
                <span>Institutional Academic &amp; Mentoring Intelligence</span>
              </div>

              {/* Main Display Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-slate-900 leading-[1.1] tracking-tight font-serif">
                Unified Academic Workflows.
                <span className="block text-slate-500 font-sans font-normal mt-2 text-3xl sm:text-4xl lg:text-[44px]">
                  Confidential Student Care.
                </span>
              </h1>

              {/* Product Subtitle */}
              <p className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
                BcaFly is the enterprise academic management architecture engineered for Computer Applications faculties.
                Seamlessly bridges assigned mentee tracking, real-time working-day roll-call, continuous internal evaluation,
                and zero-knowledge psychological counseling referrals.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-3.5 sm:gap-4 w-full sm:w-auto">
                <button
                  id="hero-primary-login-btn"
                  onClick={onOpenLogin}
                  className="bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-medium px-7 py-3.5 rounded-full transition-all flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto cursor-pointer shadow-sm group"
                >
                  <span>Sign In to Academic Workspace</span>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  id="hero-explore-architecture-btn"
                  onClick={() => scrollToSection('architecture-preview')}
                  className="bg-white border border-slate-300 hover:bg-slate-50 active:scale-[0.98] text-slate-800 font-medium px-6 py-3.5 rounded-full transition-all text-sm sm:text-base w-full sm:w-auto cursor-pointer"
                >
                  Explore Platform Workflows
                </button>

                <button
                  id="hero-contact-support-btn"
                  onClick={() => scrollToSection('contact-support')}
                  className="text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 px-3 py-2 transition-colors cursor-pointer"
                >
                  Helpdesk &amp; Support →
                </button>
              </div>

              {/* Trust & Compliance Markers */}
              <div className="mt-10 pt-6 border-t border-slate-200/80 flex flex-wrap items-center gap-6 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-slate-800" />
                  <span>Role-Scoped Data Scopes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-800" />
                  <span>Encrypted Counseling Vault</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-800" />
                  <span>Tamper-Evident Audit Ledger</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Anonymized Operations Diagram */}
            <div id="architecture-preview" className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-[460px] bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Institutional Workflows
                    </span>
                    <h3 className="font-bold text-slate-900 text-base">
                      Core Academic Engine
                    </h3>
                  </div>
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                    Interactive Tour
                  </span>
                </div>

                {/* Workflow Switcher Tabs */}
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-2xl my-4 text-xs font-semibold">
                  <button
                    onClick={() => setActiveWorkflowTab('mentoring')}
                    className={`py-2 px-3 rounded-xl transition-all cursor-pointer ${
                      activeWorkflowTab === 'mentoring'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    1. Mentee Cohorts
                  </button>
                  <button
                    onClick={() => setActiveWorkflowTab('attendance')}
                    className={`py-2 px-3 rounded-xl transition-all cursor-pointer ${
                      activeWorkflowTab === 'attendance'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    2. Roll-Call &amp; SMS
                  </button>
                  <button
                    onClick={() => setActiveWorkflowTab('grading')}
                    className={`py-2 px-3 rounded-xl transition-all cursor-pointer ${
                      activeWorkflowTab === 'grading'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    3. 6-Sem Matrix
                  </button>
                  <button
                    onClick={() => setActiveWorkflowTab('counseling')}
                    className={`py-2 px-3 rounded-xl transition-all cursor-pointer ${
                      activeWorkflowTab === 'counseling'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    4. Well-Being Vault
                  </button>
                </div>

                {/* Interactive Card Content - Anonymized Conceptual Data Only */}
                <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 text-xs space-y-3">
                  {activeWorkflowTab === 'mentoring' && (
                    <div className="space-y-2.5 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">Assigned Cohort Scoping</span>
                        <span className="text-[10px] font-mono bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded">
                          Strict Boundary
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        Each faculty member receives an exclusive cohort of 40–42 students. Unauthorized cross-roster viewing is strictly rejected at the state layer.
                      </p>
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200/60 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-medium">Sample Cohort Size</span>
                          <span className="font-bold text-slate-900">42 BCA Students</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-medium">Risk Status Triggers</span>
                          <span className="text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded text-[10px]">
                            Auto-flagged on &lt;75% Attendance
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeWorkflowTab === 'attendance' && (
                    <div className="space-y-2.5 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">Automated Shortage Guardian Alert</span>
                        <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                          Working-Day Validated
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        Single-tap roll-call locks entries after daily cutoff. When attendance drops below 75%, institutional SMS/WhatsApp alerts trigger automatically to parent contact numbers.
                      </p>
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200/60 space-y-1">
                        <div className="text-[10px] font-bold text-slate-500 uppercase">System Template Dispatch</div>
                        <p className="text-[11px] font-mono text-slate-700 bg-slate-100 p-2 rounded-lg">
                          &quot;BCA Dept Alert: Student attendance is currently 71.4% (Threshold: 75%). Meet designated mentor.&quot;
                        </p>
                      </div>
                    </div>
                  )}

                  {activeWorkflowTab === 'grading' && (
                    <div className="space-y-2.5 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">6-Semester Continuous Evaluation</span>
                        <span className="text-[10px] font-mono bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded">
                          Semester 1 to 6
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        Tracks continuous internal assessment (CIA 1 &amp; 2), lab marks, viva-voce grading, and semester GPA across all six terms with instant condonation &amp; debarment rosters.
                      </p>
                      <div className="grid grid-cols-3 gap-1.5 text-center pt-1">
                        <div className="p-2 bg-white rounded-lg border border-slate-200/60">
                          <div className="text-[10px] text-slate-400 font-bold">CIA 1</div>
                          <div className="font-bold text-slate-900 text-xs">25 Marks</div>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-slate-200/60">
                          <div className="text-[10px] text-slate-400 font-bold">CIA 2</div>
                          <div className="font-bold text-slate-900 text-xs">25 Marks</div>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-slate-200/60">
                          <div className="text-[10px] text-slate-400 font-bold">Semester GPA</div>
                          <div className="font-bold text-slate-900 text-xs">10.0 Scale</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeWorkflowTab === 'counseling' && (
                    <div className="space-y-2.5 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">Zero-Knowledge Counseling Bridge</span>
                        <span className="text-[10px] font-mono bg-slate-900 text-white px-2 py-0.5 rounded font-semibold">
                          Encrypted Vault
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        Faculty mentors submit academic or emotional concern referrals. Clinical psychotherapy notes and treatment logs remain strictly sealed inside the counseling cell.
                      </p>
                      <div className="p-2 bg-white rounded-xl border border-slate-200/60 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">Faculty Mentor Visibility</span>
                        <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                          Sanitized Status Only
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Want to test live role dashboards?</span>
                  <button
                    onClick={onOpenLogin}
                    className="font-bold text-slate-900 hover:text-slate-600 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>Try 1-Click Demo Login</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE CAPABILITIES HIGHLIGHTS */}
      <section id="features" className="py-16 sm:py-20 bg-slate-50/50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl text-left mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">
              Enterprise Governance
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight font-serif">
              Built for Institutional Scale &amp; Strict Compliance
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
              Every feature aligns with university accreditation parameters (NAAC Criterion 2, NBA guidelines) and privacy standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/70 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Role-Scoped Governance</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Faculty, Academic Deans, Students, and Counselors operate within isolated boundaries. Zero unauthorized cross-roster data leakage.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/70 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Working-Day Validation</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Centralized academic calendar enforces valid instructional days, daily roll-call submission cutoffs, and official holiday lockouts.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/70 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold">
                <BarChart2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Six-Semester Progression</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Longitudinal CGPA tracking from Semester 1 foundational modules through Semester 6 AI &amp; Capstone Project viva-voce examinations.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/70 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Confidential Well-Being Vault</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Encrypted counseling referrals protect sensitive clinical records. Mentors receive non-stigmatizing progress indicators only.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FACULTY MENTORING & STUDENT MONITORING OVERVIEW */}
      <section id="mentoring-overview" className="py-16 sm:py-20 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-5">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Pillar 1 • Student Mentorship
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight font-serif">
                Continuous 1-on-1 Faculty Mentoring &amp; Early Warning
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                University guidelines mandate systematic faculty-student contact hours. BcaFly automates the administrative overhead so faculty can concentrate on guidance.
              </p>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-slate-900 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="font-semibold text-slate-900">40-Student Dedicated Rosters:</strong> Each professor manages their allocated batch with zero interference from external divisions.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-slate-900 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="font-semibold text-slate-900">Automated Shortage Badging:</strong> Students slipping below the statutory 75% threshold are immediately flagged in amber and red.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-slate-900 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="font-semibold text-slate-900">Structured Mentoring Notes:</strong> Document career advising, academic remedy agreements, and track follow-up appointments seamlessly.
                  </span>
                </li>
              </ul>
              <div className="pt-2">
                <button
                  onClick={onOpenLogin}
                  className="text-xs sm:text-sm font-bold text-slate-900 hover:text-slate-600 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Experience Faculty Workspace →</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200/80">
              <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="font-bold text-slate-900 text-sm">Mentoring Roster Overview</span>
                  <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">
                    Standard Allocation
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <div className="text-xl font-bold text-slate-900">42</div>
                    <div className="text-[11px] text-slate-500 font-medium">Assigned Mentees</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <div className="text-xl font-bold text-amber-700">3</div>
                    <div className="text-[11px] text-slate-500 font-medium">Shortage Alerts (&lt;75%)</div>
                  </div>
                </div>
                <div className="p-3 bg-slate-50/70 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                  <div className="font-semibold text-slate-800 mb-1">Standard Mentoring Protocol:</div>
                  Monthly check-ins, mid-term grade audit, and automated guardian notification trigger logs.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ATTENDANCE & NOTIFICATION WORKFLOW OVERVIEW */}
      <section id="attendance-workflow" className="py-16 sm:py-20 bg-slate-50/50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 order-2 lg:order-1 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-2xs">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-slate-900" />
                    <span className="font-bold text-slate-900 text-sm">Automated SMS / WhatsApp Gateway</span>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Active Pipeline
                  </span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-500 text-[10px] font-mono">
                    <span>GATEWAY: BcaFly-Institutional-SMS</span>
                    <span>TRIGGER: Attendance Finalized</span>
                  </div>
                  <p className="text-slate-700 font-mono text-[11px] bg-white p-3 rounded-xl border border-slate-200/70 leading-relaxed">
                    &quot;Dear Guardian, your ward was marked absent today in BCA-501 Enterprise Web Architecture. Cumulative attendance is 71.4% (Min Required: 75%). Please contact mentor Dr. Sarah Jenkins.&quot;
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>Delivery Status: Instant Dispatch</span>
                    <span>Audit Logged: Yes</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 order-1 lg:order-2 space-y-5">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Pillar 2 • Roll-Call Automation
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight font-serif">
                Working-Day Roll-Call with Direct Guardian Notifications
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Prevent end-of-semester attendance shocks with real-time digital roll-call and automatic parent communication when attendance drops below the 75% threshold.
              </p>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-slate-900 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="font-semibold text-slate-900">Rapid Single-Tap Roll-Call:</strong> Mark present, absent, or late in under 30 seconds for 60-student class sections.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-slate-900 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="font-semibold text-slate-900">Institutional Working Days:</strong> Official calendar integration prevents attendance from being logged on gazetted holidays.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-slate-900 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="font-semibold text-slate-900">Instant Guardian Alert:</strong> Finalizing a class session automatically compiles and dispatches pre-configured notification templates.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ACADEMIC TRACKING & SIX-SEMESTER REPORTS */}
      <section id="reports-progression" className="py-16 sm:py-20 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl text-left mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">
              Pillar 3 • Evaluation &amp; Transcripts
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight font-serif">
              Six-Semester Continuous Evaluation Matrix
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
              Consolidates CIA 1, CIA 2, assignments, lab vivas, and university exam scores into official, exportable transcripts and condonation lists.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/70 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                1–2
              </div>
              <h3 className="font-bold text-slate-900 text-base">Semesters 1 &amp; 2 (Foundations)</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Computer fundamentals, C programming, mathematics, digital electronics. Tracks initial academic adaptation and early mentor intervention.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/70 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                3–4
              </div>
              <h3 className="font-bold text-slate-900 text-base">Semesters 3 &amp; 4 (Core Systems)</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Data structures, OOP in C++, computer networks, database administration. CIA component scoring with strict moderation workflows.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/70 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                5–6
              </div>
              <h3 className="font-bold text-slate-900 text-base">Semesters 5 &amp; 6 (Capstone &amp; AI)</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Enterprise cloud systems, AI/ML capstone, final viva-voce, institutional condonation determination, and cumulative transcript export.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SECURITY, PRIVACY & AUDIT-TRAIL OVERVIEW */}
      <section id="security-audit" className="py-16 sm:py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-5">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Pillar 4 • Security Architecture
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight font-serif text-white">
                Tamper-Evident Institutional Audit Ledger &amp; Privacy Isolation
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Every sensitive state transition is captured in an append-only audit trail with actor ID, user role, exact timestamp, and network IP.
              </p>
              <div className="space-y-3 text-xs sm:text-sm text-slate-300">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-white flex-shrink-0" />
                  <span>Zero unauthorized data crossover between faculty cohorts</span>
                </div>
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-white flex-shrink-0" />
                  <span>Clinical counseling notes completely air-gapped from academic transcripts</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-white flex-shrink-0" />
                  <span>Immutable audit records for logins, mark changes, and attendance corrections</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 bg-slate-800 p-6 rounded-3xl border border-slate-700">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700 text-xs">
                <span className="font-bold text-white uppercase tracking-wider text-[10px]">
                  Institutional Audit Ledger Sample
                </span>
                <span className="text-[10px] font-mono text-emerald-400">Append-Only Verified</span>
              </div>
              <div className="space-y-2 mt-4 text-[11px] font-mono text-slate-300">
                <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-700/80 flex items-center justify-between">
                  <div>
                    <span className="text-emerald-400 font-bold">auth.login.success</span>
                    <span className="text-slate-400 block text-[10px]">Actor: Dr. Sarah Jenkins (Faculty) • IP: 10.0.0.12</span>
                  </div>
                  <span className="text-slate-500 text-[10px]">2026-09-04 09:15</span>
                </div>
                <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-700/80 flex items-center justify-between">
                  <div>
                    <span className="text-blue-400 font-bold">attendance.session.finalized</span>
                    <span className="text-slate-400 block text-[10px]">Class: BCA-501 • 38 Present, 4 Absent • SMS Dispatched</span>
                  </div>
                  <span className="text-slate-500 text-[10px]">2026-09-04 10:45</span>
                </div>
                <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-700/80 flex items-center justify-between">
                  <div>
                    <span className="text-purple-400 font-bold">counseling.referral.created</span>
                    <span className="text-slate-400 block text-[10px]">Encrypted Transfer to Student Well-being Center</span>
                  </div>
                  <span className="text-slate-500 text-[10px]">2026-09-04 11:20</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. ABOUT BCAFLY SECTION */}
      <section id="about" className="py-16 sm:py-20 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 flex flex-col items-start">
              <BcaFlyLogo size="lg" />
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight font-serif mt-4">
                About BcaFly
              </h2>
              <p className="mt-3 text-slate-600 text-sm leading-relaxed">
                The institutional academic intelligence platform conceived by university educators for the Department of Computer Applications.
              </p>
              <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs text-slate-600">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <Building className="w-4 h-4 text-slate-900" />
                  <span>Institutional Accreditation Alignment</span>
                </div>
                <p>
                  Directly satisfies NAAC Criterion 2 (Teaching-Learning and Evaluation) and NBA Outcome-Based Education (OBE) metrics.
                </p>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <div className="border-b border-slate-100 pb-5">
                <h3 className="font-bold text-slate-900 text-lg mb-2">Our Vision</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  To eliminate administrative friction for university faculty while creating a compassionate, privacy-first safety net for every student.
                </p>
              </div>
              <div className="border-b border-slate-100 pb-5">
                <h3 className="font-bold text-slate-900 text-lg mb-2">Architectural Principles</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Zero data exposure without authenticated role resolution, deterministic 75% attendance threshold rules, and zero-knowledge psychological confidentiality.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">Campus Governance Ready</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Built to scale from department pilots to 800+ user institutional deployments with zero loss of audit visibility.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CONTACT & CAMPUS SUPPORT DETAILS */}
      <section id="contact-support" className="py-16 sm:py-20 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl text-left mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">
              Assistance &amp; Inquiries
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight font-serif">
              Campus Helpdesk &amp; Support
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
              Have questions regarding portal access, student roster assignments, or university examination workflows? Contact the IT Cell or submit an inquiry.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Contact Info Cards */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200/70 shadow-2xs space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Registrar &amp; IT Helpdesk</h4>
                    <p className="text-xs text-slate-500">helpdesk@bcafly.edu</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600">
                  Direct inquiries regarding institutional single sign-on, faculty role delegation, and grade freeze deadlines.
                </p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200/70 shadow-2xs space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Academic Operations Hotline</h4>
                    <p className="text-xs text-slate-500">+1 (555) 777-BCA-FLY (Ext. 402)</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600">
                  Available Monday through Friday, 08:30 – 17:30 IST during active university terms.
                </p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200/70 shadow-2xs space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Physical Office</h4>
                    <p className="text-xs text-slate-500">Department of Computer Applications</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600">
                  Academic Block B, Ground Floor, Rooms 102–106. Campus IT Operations Wing.
                </p>
              </div>
            </div>

            {/* Direct Support Ticket Submission Form */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
              <h3 className="font-bold text-slate-900 text-lg mb-1">
                Submit an Academic Support Ticket
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Our campus registrar team responds within one business day during active semester evaluation cycles.
              </p>

              {ticketSubmitted ? (
                <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-emerald-900 text-base">Inquiry Dispatched Successfully</h4>
                  <p className="text-xs text-emerald-700">
                    Your institutional support ticket has been queued. A reference email has been sent to {ticketEmail || 'your inbox'}.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleTicketSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Your Full Name</label>
                      <input
                        type="text"
                        value={ticketName}
                        onChange={(e) => setTicketName(e.target.value)}
                        placeholder="e.g. Prof. David Vance"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Institutional Email</label>
                      <input
                        type="email"
                        value={ticketEmail}
                        onChange={(e) => setTicketEmail(e.target.value)}
                        placeholder="e.g. yourname@bcafly.edu"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Inquiry Category</label>
                    <select
                      value={ticketCategory}
                      onChange={(e) => setTicketCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-xs sm:text-sm cursor-pointer"
                    >
                      <option value="Academic Access / Credentials">Academic Access / Credentials</option>
                      <option value="Student Roster Reassignment">Student Roster Reassignment</option>
                      <option value="Attendance Shortage Appeal">Attendance Shortage Appeal</option>
                      <option value="Counseling Referral Clarification">Counseling Referral Clarification</option>
                      <option value="Other Institutional Inquiry">Other Institutional Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Message / Request Details</label>
                    <textarea
                      rows={4}
                      value={ticketMessage}
                      onChange={(e) => setTicketMessage(e.target.value)}
                      placeholder="Describe the issue or required assistance..."
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-xs sm:text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-semibold rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Send className="w-4 h-4" />
                    <span>Dispatch Support Request</span>
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Frequently Asked Questions */}
          <div className="mt-16 pt-12 border-t border-slate-200/80">
            <h3 className="font-bold text-slate-900 text-xl font-serif mb-6">
              Frequently Asked Platform Questions
            </h3>
            <div className="space-y-3">
              {[
                {
                  q: 'How does BcaFly handle student privacy and the 75% attendance rule?',
                  a: 'Attendance is calculated strictly against official institutional working days. When cumulative attendance falls below 75%, BcaFly triggers automated guardian SMS notifications and flags the student for mentor check-ins. Other students cannot view peer records.'
                },
                {
                  q: 'Are counseling notes visible to faculty mentors?',
                  a: 'No. Faculty mentors create referrals from the Faculty Workspace, while personal therapeutic notes remain protected. Faculty only receive sanitized non-clinical status markers (such as "Session Scheduled" or "Action Plan Recommended").'
                },
                {
                  q: 'How do I test different roles in the interactive demo?',
                  a: 'Click "Sign In to Academic Workspace" at the top of the page. The modal includes 1-click test credentials for Faculty, Academic Dean (Admin), Student, and Counselor roles.'
                },
                {
                  q: 'Can an unauthenticated visitor view real student records?',
                  a: 'Never. In accordance with university academic privacy regulations, all live student profiles, attendance ledgers, marks, and audit records require an authenticated session with appropriate role clearance.'
                }
              ].map((faq, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-slate-200/70 p-4 transition-colors">
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                    className="w-full flex items-center justify-between text-left font-bold text-slate-900 text-sm cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {openFaqIndex === idx ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                  {openFaqIndex === idx && (
                    <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed pt-1 border-t border-slate-100 animate-in fade-in duration-150">
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 9. CALL TO ACTION FOOTER BANNER */}
      <section className="py-12 bg-slate-950 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h3 className="text-2xl sm:text-3xl font-bold font-serif">
            Ready to experience the BcaFly Academic Workspace?
          </h3>
          <p className="mt-2 text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
            Log in with university credentials or select one of our four pre-configured persona profiles.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              id="footer-cta-login-btn"
              onClick={onOpenLogin}
              className="bg-white hover:bg-slate-100 text-slate-950 font-bold px-7 py-3 rounded-full text-sm transition-all cursor-pointer shadow-sm"
            >
              Sign In to BcaFly
            </button>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold px-6 py-3 rounded-full text-sm border border-slate-800 transition-all cursor-pointer"
            >
              Back to Top ↑
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
