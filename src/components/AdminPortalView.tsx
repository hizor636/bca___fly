import React, { useState } from 'react';
import { useDemoStore } from '../context/DemoContext';
import { BcaFlyLogo } from './BcaFlyLogo';
import { UserManagementView } from './UserManagementView';
import { api } from '../services/api';
import {
  Users,
  Calendar,
  Clock,
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  Printer,
  LogOut,
  UserPlus,
  BookOpen,
  GraduationCap,
  Layers,
  ArrowRight,
  Building,
  ListChecks,
  Circle,
  Plus,
  FileSpreadsheet,
  Upload,
  X,
  RefreshCw,
  Archive,
  Trash2,
  Edit
} from 'lucide-react';
import { Department, AcademicYear, Course, FacultyMember, Student } from '../types';

interface AdminPortalViewProps {
  onNavigateHome?: () => void;
  onLogout?: () => void;
  onNavigatePublic?: () => void;
}

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({
  onNavigateHome,
  onLogout,
  onNavigatePublic
}) => {
  const {
    currentUser,
    logout,
    departments,
    academicYears,
    semesters,
    batches,
    courses,
    facultyList,
    students,
    studentCourseEnrollments,
    facultyCourseAssignments,
    workingDays,
    attendanceSettings,
    smsTemplates,
    smsMessages,
    auditLogs,
    addDepartment,
    addAcademicYear,
    configureSemester,
    addCourse,
    archiveCourse,
    deleteCourse,
    addFaculty,
    addStudent,
    enrollStudentInCourse,
    assignFacultyToCourse,
    reassignStudent,
    updateAttendanceSettings,
    toggleWorkingDay,
    updateCondonationStatus,
    updateSmsTemplate,
    correctionRequests,
    reviewCorrectionRequest,
    refreshData,
    isLoading
  } = useDemoStore();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'departments-years' | 'courses' | 'users' | 'assignments' | 'attendance-settings' | 'corrections' | 'sms' | 'reports'
  >('overview');

  const [reviewRemarks, setReviewRemarks] = useState<Record<string, string>>({});
  const [reportSubTab, setReportSubTab] = useState<'consolidated' | 'shortage' | 'transcripts' | 'audit'>('consolidated');

  // Feedback Notification
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Setup Modals State
  const [modalType, setModalType] = useState<
    'department' | 'academic-year' | 'semester' | 'course' | 'faculty' | 'student' | 'enroll' | 'allocate' | 'csv-import' | null
  >(null);

  // Forms State
  const [deptForm, setDeptForm] = useState({ name: '', code: '' });
  const [ayForm, setAyForm] = useState({ name: '2026-2027', startDate: '2026-06-01', endDate: '2027-05-31', attendanceRule: 75.0, isActive: true });
  const [semForm, setSemForm] = useState({ number: 1, name: 'Semester 1', credits: 24, minAttendance: 75.0, startDate: '2026-06-01', endDate: '2026-11-30', isCurrent: true });
  const [courseForm, setCourseForm] = useState({ courseCode: '', courseName: '', shortName: '', semester: 1, credits: 4, courseType: 'Theory' as const, maxMarks: 100, cia1MaxMarks: 20, attendanceRequired: 75.0 });
  const [facultyForm, setFacultyForm] = useState({ name: '', email: '', designation: 'Assistant Professor', department: 'BCA', phone: '', office: 'Lab Block 2', specialization: 'Computer Applications' });
  const [studentForm, setStudentForm] = useState({ name: '', studentId: '', email: '', phone: '', parentPhone: '', semester: 1, section: 'A', course: 'Bachelor of Computer Applications' });
  const [enrollForm, setEnrollForm] = useState({ studentId: '', courseId: '', semester: 1, section: 'A' });
  const [allocateForm, setAllocateForm] = useState({ facultyId: '', courseId: '', section: 'A', batch: '2026-27', academicYear: '2026-27' });

  // CSV Import State
  const [csvType, setCsvType] = useState<'students' | 'faculty' | 'courses'>('students');
  const [csvText, setCsvText] = useState('');
  const [csvError, setCsvError] = useState<string | null>(null);

  // Assignment search/filter state
  const [assignSearch, setAssignSearch] = useState('');
  const [assignSemFilter, setAssignSemFilter] = useState<number | 'all'>('all');
  const [reassigningStudentId, setReassigningStudentId] = useState<string | null>(null);

  // Course Filter state
  const [courseSemFilter, setCourseSemFilter] = useState<number | 'all'>('all');

  // SMS template editor state
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(smsTemplates[0]?.id || 'tpl-absent');
  const [templateEditText, setTemplateEditText] = useState<string>(smsTemplates[0]?.body || '');
  const [templateSaveFeedback, setTemplateSaveFeedback] = useState(false);

  // Transcript viewer state
  const [transcriptStudentId, setTranscriptStudentId] = useState<string>(students[0]?.id || '');
  const [reportSemester, setReportSemester] = useState<number>(5);

  // Stats
  const totalStudents = students.length;
  const shortageStudents = students.filter((s) => s.attendanceRate < 75);
  const honorStudents = students.filter((s) => s.attendanceRate >= 92);
  const totalSmsSent = smsMessages.filter((m) => m.status === 'sent').length;

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleSaveTemplate = () => {
    if (!selectedTemplateId) return;
    updateSmsTemplate(selectedTemplateId, templateEditText);
    setTemplateSaveFeedback(true);
    setTimeout(() => setTemplateSaveFeedback(false), 2000);
  };

  const selectedTemplate = smsTemplates.find((t) => t.id === selectedTemplateId) || smsTemplates[0] || null;

  const filteredAssignStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(assignSearch.toLowerCase()) ||
      s.studentId.includes(assignSearch) ||
      s.assignedFaculty.toLowerCase().includes(assignSearch.toLowerCase());
    const matchesSem = assignSemFilter === 'all' || s.semester === assignSemFilter;
    return matchesSearch && matchesSem;
  });

  const filteredCourses = courses.filter((c) => {
    return courseSemFilter === 'all' || c.semester === courseSemFilter;
  });

  const selectedTranscriptStudent = students.find((s) => s.id === transcriptStudentId) || students[0] || null;

  // Institutional Setup 8-Step Progress Tracking
  const setupSteps = [
    {
      id: 1,
      stepNumber: 1,
      title: 'Create department',
      description: 'Register academic department (e.g. BCA) and configure department head.',
      isCompleted: departments.length > 0,
      actionLabel: departments.length > 0 ? 'Manage Departments' : 'Create Department',
      onClick: () => setModalType('department')
    },
    {
      id: 2,
      stepNumber: 2,
      title: 'Create academic year',
      description: 'Define institutional academic calendar, working days schedule, and attendance cutoff.',
      isCompleted: academicYears.length > 0,
      actionLabel: academicYears.length > 0 ? 'Manage Academic Years' : 'Create Academic Year',
      onClick: () => setModalType('academic-year')
    },
    {
      id: 3,
      stepNumber: 3,
      title: 'Configure Sem 1 to Sem 6',
      description: 'Set up 6-semester progression framework, credit structures, and pass criteria.',
      isCompleted: semesters.length >= 6,
      actionLabel: 'Configure Semester',
      onClick: () => setModalType('semester')
    },
    {
      id: 4,
      stepNumber: 4,
      title: 'Add course master data',
      description: 'Register core theory courses, programming labs, and syllabus codes across Sem 1–6.',
      isCompleted: courses.length > 0,
      actionLabel: 'Add Course',
      onClick: () => setModalType('course')
    },
    {
      id: 5,
      stepNumber: 5,
      title: 'Add faculty accounts',
      description: 'Create faculty mentor profiles, assign academic designations, and provision logins.',
      isCompleted: facultyList.length > 0,
      actionLabel: 'Add Faculty',
      onClick: () => setModalType('faculty')
    },
    {
      id: 6,
      stepNumber: 6,
      title: 'Add student accounts',
      description: 'Register student accounts with official university roll numbers, emails, and parent contacts.',
      isCompleted: students.length > 0,
      actionLabel: 'Add Student',
      onClick: () => setModalType('student')
    },
    {
      id: 7,
      stepNumber: 7,
      title: 'Enroll students into semester/course',
      description: 'Associate enrolled students into their designated semester syllabus and active batches.',
      isCompleted: studentCourseEnrollments.length > 0,
      actionLabel: 'Enroll Student',
      onClick: () => setModalType('enroll')
    },
    {
      id: 8,
      stepNumber: 8,
      title: 'Assign faculty to students and courses',
      description: 'Allocate 1-on-1 mentees to professors and assign course coordinators to teaching batches.',
      isCompleted: facultyCourseAssignments.length > 0 || students.some(s => s.assignedFacultyId),
      actionLabel: 'Allocate Faculty',
      onClick: () => setModalType('allocate')
    }
  ];

  const completedStepsCount = setupSteps.filter(s => s.isCompleted).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-md animate-in fade-in duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Institutional Top Bar */}
      <div className="bg-slate-900 text-white p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="bg-white/10 p-2.5 rounded-2xl">
            <BcaFlyLogo />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-white/20 text-white">
                Academic Dean &amp; Institutional Admin
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5">
              {currentUser?.name || 'Institutional Administrator'}
            </h1>
            <p className="text-xs text-slate-400">
              Department of Computer Applications • Institutional Governance
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              logout();
              if (onLogout) onLogout();
              else if (onNavigateHome) onNavigateHome();
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/60 hover:bg-rose-900 border border-rose-800/40 px-3.5 py-2 rounded-full transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Institutional Master Data &amp; Governance
          </h2>
          <p className="text-xs text-slate-500">
            Centralized institutional database controlling Faculty Workspace, Student Portal, and Guardian Portal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
          {[
            { id: 'overview', label: 'Setup & Overview' },
            { id: 'departments-years', label: 'Dept & Calendar' },
            { id: 'courses', label: 'Course Master' },
            { id: 'users', label: 'User Directory' },
            { id: 'assignments', label: 'Allocations & Mentees' },
            { id: 'attendance-settings', label: 'Attendance Rules' },
            { id: 'corrections', label: 'Leave Reviews' },
            { id: 'sms', label: 'SMS Gateway' },
            { id: 'reports', label: 'Reports & Audit' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === tab.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: OVERVIEW & 8-STEP SETUP CHECKLIST */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Institution Setup Checklist Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-indigo-50 text-indigo-700">
                  <ListChecks className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    Institutional Setup Checklist (Administration-First)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Master academic data created here automatically propagates across Faculty Workspace, Student Portal, Attendance, and Reports.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                  {completedStepsCount} of {setupSteps.length} Configured
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${(completedStepsCount / setupSteps.length) * 100}%` }}
              />
            </div>

            {/* 8-Step Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              {setupSteps.map((step) => (
                <div
                  key={step.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    step.isCompleted
                      ? 'bg-emerald-50/30 border-emerald-100'
                      : 'bg-slate-50 border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        STEP {step.stepNumber}
                      </span>
                      {step.isCompleted ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Ready
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <Circle className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">{step.title}</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{step.description}</p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100">
                    <button
                      onClick={step.onClick}
                      className="w-full py-1.5 px-3 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <span>{step.actionLabel}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Departments</span>
              <div className="text-2xl font-bold text-slate-900">{departments.length}</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Active Courses</span>
              <div className="text-2xl font-bold text-slate-900">{courses.length}</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Faculty Mentors</span>
              <div className="text-2xl font-bold text-slate-900">{facultyList.length}</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Enrolled Students</span>
              <div className="text-2xl font-bold text-slate-900">{students.length}</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DEPARTMENTS & ACADEMIC CALENDAR */}
      {activeTab === 'departments-years' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Departments Section */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Academic Departments</h3>
                <p className="text-xs text-slate-500">Master departments registered in the institution.</p>
              </div>
              <button
                onClick={() => setModalType('department')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Department</span>
              </button>
            </div>

            {departments.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <Building className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                <span className="font-semibold text-slate-800 text-xs">No departments created yet</span>
                <p className="text-[11px] text-slate-400">Create your first department (e.g. BCA) to begin institutional setup.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {departments.map((d) => (
                  <div key={d.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{d.name}</span>
                      <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        {d.code}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      ID: <span className="font-mono">{d.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Academic Years Section */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Academic Years &amp; Calendar Rules</h3>
                <p className="text-xs text-slate-500">Configured institutional academic sessions.</p>
              </div>
              <button
                onClick={() => setModalType('academic-year')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Academic Year</span>
              </button>
            </div>

            {academicYears.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <Calendar className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                <span className="font-semibold text-slate-800 text-xs">No academic years configured yet</span>
                <p className="text-[11px] text-slate-400">Define Academic Year 2026–2027 and attendance statutory rules.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {academicYears.map((ay) => (
                  <div key={ay.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{ay.name}</span>
                      {ay.isActive && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Active Session
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-600">
                      Duration: {ay.startDate} to {ay.endDate}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Attendance Cutoff: <strong className="text-slate-900">{ay.attendanceRule}%</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: COURSE MASTER */}
      {activeTab === 'courses' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-5 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Course Master Directory (Sem 1 – 6)</h3>
              <p className="text-xs text-slate-500">Reusable curriculum syllabus, credits, and continuous internal assessment frameworks.</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs">
                <span className="text-slate-400 text-[11px] mr-1">Sem:</span>
                <button
                  onClick={() => setCourseSemFilter('all')}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer ${
                    courseSemFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  All
                </button>
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <button
                    key={num}
                    onClick={() => setCourseSemFilter(num)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer ${
                      courseSemFilter === num ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Sem {num}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setModalType('course')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Course</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="pb-2 pl-2">Course Code</th>
                  <th className="pb-2">Course Name</th>
                  <th className="pb-2">Semester</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Credits</th>
                  <th className="pb-2">Max Marks</th>
                  <th className="pb-2 pr-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCourses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center space-y-1">
                        <BookOpen className="w-6 h-6 text-slate-300 mb-1" />
                        <span className="font-semibold text-slate-700 text-xs">No courses configured yet</span>
                        <p className="text-[11px] text-slate-400">Add course master data across Semesters 1 through 6.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCourses.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 pl-2 font-mono font-bold text-slate-900">{c.courseCode}</td>
                      <td className="py-2.5 font-semibold text-slate-900">{c.courseName}</td>
                      <td className="py-2.5 text-slate-600">Semester {c.semester}</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {c.courseType}
                        </span>
                      </td>
                      <td className="py-2.5 font-semibold text-slate-800">{c.credits} Credits</td>
                      <td className="py-2.5 text-slate-600">{c.maxMarks} Marks</td>
                      <td className="py-2.5 pr-2 text-right">
                        <button
                          onClick={async () => {
                            if (window.confirm(`Archive course ${c.courseName}?`)) {
                              await archiveCourse(c.id);
                              showFeedback('success', `Course ${c.courseCode} archived.`);
                            }
                          }}
                          className="px-2.5 py-1 text-[11px] text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                        >
                          Archive
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: USER MANAGEMENT */}
      {activeTab === 'users' && <UserManagementView onRefreshGlobal={refreshData} />}

      {/* TAB 5: ASSIGNMENTS & MENTORS */}
      {activeTab === 'assignments' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-5 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Student-Faculty Allocation &amp; Access Scoping
              </h3>
              <p className="text-xs text-slate-500">
                Assign students to faculty mentors. Faculty will strictly access only their designated students in their respective portal.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setModalType('allocate')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Assign Faculty Course</span>
              </button>
              <button
                onClick={() => setModalType('enroll')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Enroll Student</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student name, roll number, or mentor..."
              value={assignSearch}
              onChange={(e) => setAssignSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 text-xs rounded-full border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="pb-2 pl-2">Student &amp; Roll</th>
                  <th className="pb-2">Semester</th>
                  <th className="pb-2">Attendance</th>
                  <th className="pb-2">Current Faculty Mentor</th>
                  <th className="pb-2 pr-2 text-right">Reassign Mentor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAssignStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center space-y-1">
                        <Users className="w-6 h-6 text-slate-300 mb-1" />
                        <span className="font-semibold text-slate-700 text-xs">No records yet</span>
                        <p className="text-[11px] text-slate-400">Add student accounts and faculty in the User Directory to configure mentor allocations.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAssignStudents.slice(0, 20).map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 pl-2">
                        <div className="font-semibold text-slate-900">{st.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Roll: {st.studentId} • Sec {st.section}</div>
                      </td>
                      <td className="py-2.5 text-slate-600">BCA Semester {st.semester}</td>
                      <td className="py-2.5">
                        <span className={`font-semibold ${st.attendanceRate < 75 ? 'text-rose-600' : 'text-slate-800'}`}>
                          {st.attendanceRate}%
                        </span>
                      </td>
                      <td className="py-2.5">
                        <div className="font-semibold text-slate-900">{st.assignedFaculty || 'Unassigned'}</div>
                        <span className="text-[10px] text-emerald-700 font-medium">Scoped Access Active</span>
                      </td>
                      <td className="py-2.5 pr-2 text-right">
                        {reassigningStudentId === st.id ? (
                          <select
                            defaultValue={st.assignedFacultyId}
                            onChange={async (e) => {
                              await reassignStudent(st.id, e.target.value);
                              setReassigningStudentId(null);
                              showFeedback('success', `Mentor updated for ${st.name}`);
                            }}
                            className="bg-white border border-slate-300 text-xs rounded-full px-2 py-1 focus:outline-none focus:ring-1 focus:ring-slate-900"
                          >
                            <option value="">Select Faculty Mentor</option>
                            {facultyList.map((f) => (
                              <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                          </select>
                        ) : (
                          <button
                            onClick={() => setReassigningStudentId(st.id)}
                            className="px-3 py-1 rounded-full text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
                          >
                            Change Mentor
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: ATTENDANCE RULES */}
      {activeTab === 'attendance-settings' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-6 animate-in fade-in duration-150">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Attendance Policies &amp; Cutoff Controls</h3>
            <p className="text-xs text-slate-500">Configure daily submission cutoffs and working days calendar.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <label className="text-xs font-bold text-slate-700 block">Daily Attendance Cutoff Time</label>
              <input
                type="time"
                value={attendanceSettings.dailyCutoffTime}
                onChange={(e) => updateAttendanceSettings({ dailyCutoffTime: e.target.value })}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono"
              />
              <p className="text-[11px] text-slate-400">Faculty attendance marked after this cutoff requires administrative review.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <label className="text-xs font-bold text-slate-700 block">SMS Automated Triggers</label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoSms"
                  checked={attendanceSettings.autoSmsOnFinalize}
                  onChange={(e) => updateAttendanceSettings({ autoSmsOnFinalize: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="autoSms" className="text-xs text-slate-700 font-medium">
                  Dispatch SMS to parents on absence finalization
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: CORRECTIONS */}
      {activeTab === 'corrections' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4 animate-in fade-in duration-150">
          <h3 className="text-lg font-bold text-slate-900">Attendance Correction &amp; Medical Leave Reviews</h3>
          <p className="text-xs text-slate-500">Review student-submitted leave certificates and condonation applications.</p>

          {correctionRequests.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="font-semibold text-slate-800 text-xs">No pending correction requests</span>
              <p className="text-[11px] text-slate-400">Student leave submissions will appear here for administrative approval.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {correctionRequests.map((req) => (
                <div key={req.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-bold text-slate-900 text-xs">{req.studentName} (Roll: {req.rollNumber})</div>
                    <div className="text-[11px] text-slate-500">{req.requestType} • {req.date} • {req.reason}</div>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${req.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : req.status === 'Rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                      {req.status}
                    </span>
                  </div>

                  {req.status === 'Pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          reviewCorrectionRequest(req.id, 'Approved', 'Approved by Dean');
                          showFeedback('success', `Request approved for ${req.studentName}`);
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          reviewCorrectionRequest(req.id, 'Rejected', 'Insufficient documentation');
                          showFeedback('error', `Request rejected for ${req.studentName}`);
                        }}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 8: SMS */}
      {activeTab === 'sms' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4 animate-in fade-in duration-150">
          <h3 className="text-lg font-bold text-slate-900">SMS Gateway &amp; Automated Templates</h3>
          <p className="text-xs text-slate-500">Edit institutional parent notification SMS drafts.</p>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 block">Select Template</label>
            <select
              value={selectedTemplateId}
              onChange={(e) => {
                setSelectedTemplateId(e.target.value);
                const t = smsTemplates.find((tmpl) => tmpl.id === e.target.value);
                if (t) setTemplateEditText(t.body);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs w-full max-w-md"
            >
              {smsTemplates.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>

            <textarea
              rows={4}
              value={templateEditText}
              onChange={(e) => setTemplateEditText(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono focus:outline-none focus:bg-white"
            />

            <button
              onClick={handleSaveTemplate}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              {templateSaveFeedback ? 'Saved!' : 'Save Template'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 9: REPORTS & AUDIT */}
      {activeTab === 'reports' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Institutional Governance &amp; Audit Trail</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setReportSubTab('audit')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl ${reportSubTab === 'audit' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}
              >
                Audit Trail ({auditLogs.length})
              </button>
              <button
                onClick={() => setReportSubTab('shortage')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl ${reportSubTab === 'shortage' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}
              >
                Shortage Register ({shortageStudents.length})
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {auditLogs.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <ShieldCheck className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                <span className="font-semibold text-slate-800 text-xs">No audit logs recorded</span>
                <p className="text-[11px] text-slate-400">All administrative mutations and student operations generate immutable audit events.</p>
              </div>
            ) : (
              auditLogs.slice(0, 30).map((log) => (
                <div key={log.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-900">{log.action}</div>
                    <div className="text-[10px] text-slate-400">By {log.actorName} ({log.actorRole}) • {log.createdAt}</div>
                  </div>
                  {log.afterJson && (
                    <span className="text-[10px] font-mono text-slate-600 bg-white px-2 py-1 rounded border border-slate-200 max-w-xs truncate">
                      {log.afterJson}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 🚀 INTERACTIVE SETUP MODALS                                        */}
      {/* ================================================================= */}

      {/* 1. Department Modal */}
      {modalType === 'department' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Register Academic Department</h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Department Name</label>
                <input
                  type="text"
                  placeholder="Bachelor of Computer Applications"
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Department Code</label>
                <input
                  type="text"
                  placeholder="BCA"
                  value={deptForm.code}
                  onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setModalType(null)} className="px-4 py-2 text-slate-600 font-semibold text-xs">Cancel</button>
              <button
                onClick={async () => {
                  if (!deptForm.name || !deptForm.code) return;
                  await addDepartment(deptForm);
                  setModalType(null);
                  showFeedback('success', `Department ${deptForm.code} created successfully.`);
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl cursor-pointer"
              >
                Create Department
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Academic Year Modal */}
      {modalType === 'academic-year' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Configure Academic Year</h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Academic Year</label>
                <input
                  type="text"
                  placeholder="2026–2027"
                  value={ayForm.name}
                  onChange={(e) => setAyForm({ ...ayForm, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={ayForm.startDate}
                    onChange={(e) => setAyForm({ ...ayForm, startDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={ayForm.endDate}
                    onChange={(e) => setAyForm({ ...ayForm, endDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Statutory Attendance Threshold (%)</label>
                <input
                  type="number"
                  value={ayForm.attendanceRule}
                  onChange={(e) => setAyForm({ ...ayForm, attendanceRule: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setModalType(null)} className="px-4 py-2 text-slate-600 font-semibold text-xs">Cancel</button>
              <button
                onClick={async () => {
                  if (!ayForm.name) return;
                  await addAcademicYear(ayForm);
                  setModalType(null);
                  showFeedback('success', `Academic Year ${ayForm.name} configured successfully.`);
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl cursor-pointer"
              >
                Save Academic Year
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Semester Modal */}
      {modalType === 'semester' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Configure Semester Framework</h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Semester Number</label>
                  <select
                    value={semForm.number}
                    onChange={(e) => setSemForm({ ...semForm, number: Number(e.target.value), name: `Semester ${e.target.value}` })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => <option key={num} value={num}>Semester {num}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Target Credits</label>
                  <input
                    type="number"
                    value={semForm.credits}
                    onChange={(e) => setSemForm({ ...semForm, credits: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setModalType(null)} className="px-4 py-2 text-slate-600 font-semibold text-xs">Cancel</button>
              <button
                onClick={async () => {
                  await configureSemester(semForm);
                  setModalType(null);
                  showFeedback('success', `Semester ${semForm.number} configured successfully.`);
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl cursor-pointer"
              >
                Save Semester
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Course Modal */}
      {modalType === 'course' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Add Course Master Data</h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Course Code</label>
                  <input
                    type="text"
                    placeholder="BCA101"
                    value={courseForm.courseCode}
                    onChange={(e) => setCourseForm({ ...courseForm, courseCode: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Semester</label>
                  <select
                    value={courseForm.semester}
                    onChange={(e) => setCourseForm({ ...courseForm, semester: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => <option key={num} value={num}>Semester {num}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Course Name</label>
                <input
                  type="text"
                  placeholder="Programming in C & Data Structures"
                  value={courseForm.courseName}
                  onChange={(e) => setCourseForm({ ...courseForm, courseName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Course Type</label>
                  <select
                    value={courseForm.courseType}
                    onChange={(e) => setCourseForm({ ...courseForm, courseType: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Theory">Theory</option>
                    <option value="Lab">Lab</option>
                    <option value="Elective">Elective</option>
                    <option value="Project">Project</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Credits</label>
                  <input
                    type="number"
                    value={courseForm.credits}
                    onChange={(e) => setCourseForm({ ...courseForm, credits: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setModalType(null)} className="px-4 py-2 text-slate-600 font-semibold text-xs">Cancel</button>
              <button
                onClick={async () => {
                  if (!courseForm.courseCode || !courseForm.courseName) return;
                  await addCourse(courseForm);
                  setModalType(null);
                  showFeedback('success', `Course ${courseForm.courseCode} added to Course Master.`);
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl cursor-pointer"
              >
                Add Course
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Faculty Modal */}
      {modalType === 'faculty' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Add Faculty Member</h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="Dr. Priya Rao"
                  value={facultyForm.name}
                  onChange={(e) => setFacultyForm({ ...facultyForm, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Official Email</label>
                <input
                  type="email"
                  placeholder="priya.rao@bcafly.edu"
                  value={facultyForm.email}
                  onChange={(e) => setFacultyForm({ ...facultyForm, email: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Designation</label>
                  <input
                    type="text"
                    value={facultyForm.designation}
                    onChange={(e) => setFacultyForm({ ...facultyForm, designation: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98765 00000"
                    value={facultyForm.phone}
                    onChange={(e) => setFacultyForm({ ...facultyForm, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setModalType(null)} className="px-4 py-2 text-slate-600 font-semibold text-xs">Cancel</button>
              <button
                onClick={async () => {
                  if (!facultyForm.name || !facultyForm.email) return;
                  await addFaculty(facultyForm);
                  setModalType(null);
                  showFeedback('success', `Faculty account ${facultyForm.name} created.`);
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl cursor-pointer"
              >
                Create Faculty Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Student Modal */}
      {modalType === 'student' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Add Student Account</h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="Aditya Sharma"
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">University Roll Number</label>
                  <input
                    type="text"
                    placeholder="BCA26101"
                    value={studentForm.studentId}
                    onChange={(e) => setStudentForm({ ...studentForm, studentId: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Official Email</label>
                <input
                  type="email"
                  placeholder="aditya.s@bcafly.edu"
                  value={studentForm.email}
                  onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Semester</label>
                  <select
                    value={studentForm.semester}
                    onChange={(e) => setStudentForm({ ...studentForm, semester: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => <option key={num} value={num}>Semester {num}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Section</label>
                  <select
                    value={studentForm.section}
                    onChange={(e) => setStudentForm({ ...studentForm, section: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setModalType(null)} className="px-4 py-2 text-slate-600 font-semibold text-xs">Cancel</button>
              <button
                onClick={async () => {
                  if (!studentForm.name || !studentForm.email) return;
                  await addStudent(studentForm);
                  setModalType(null);
                  showFeedback('success', `Student account ${studentForm.name} created.`);
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl cursor-pointer"
              >
                Create Student Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Enroll Student Modal */}
      {modalType === 'enroll' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Enroll Student in Course</h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Student</label>
                <select
                  value={enrollForm.studentId}
                  onChange={(e) => setEnrollForm({ ...enrollForm, studentId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="">Choose student...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.studentId})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Course</label>
                <select
                  value={enrollForm.courseId}
                  onChange={(e) => setEnrollForm({ ...enrollForm, courseId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="">Choose course...</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.courseCode} - {c.courseName} (Sem {c.semester})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setModalType(null)} className="px-4 py-2 text-slate-600 font-semibold text-xs">Cancel</button>
              <button
                onClick={async () => {
                  if (!enrollForm.studentId || !enrollForm.courseId) return;
                  await enrollStudentInCourse(enrollForm);
                  setModalType(null);
                  showFeedback('success', `Student enrolled in course.`);
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl cursor-pointer"
              >
                Enroll Student
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Allocate Faculty Modal */}
      {modalType === 'allocate' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Assign Faculty to Course &amp; Batch</h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Faculty Member</label>
                <select
                  value={allocateForm.facultyId}
                  onChange={(e) => setAllocateForm({ ...allocateForm, facultyId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="">Choose faculty...</option>
                  {facultyList.map((f) => (
                    <option key={f.id} value={f.id}>{f.name} ({f.designation})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Course</label>
                <select
                  value={allocateForm.courseId}
                  onChange={(e) => setAllocateForm({ ...allocateForm, courseId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="">Choose course...</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.courseCode} - {c.courseName} (Sem {c.semester})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Section</label>
                  <select
                    value={allocateForm.section}
                    onChange={(e) => setAllocateForm({ ...allocateForm, section: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Academic Year</label>
                  <input
                    type="text"
                    value={allocateForm.academicYear}
                    onChange={(e) => setAllocateForm({ ...allocateForm, academicYear: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setModalType(null)} className="px-4 py-2 text-slate-600 font-semibold text-xs">Cancel</button>
              <button
                onClick={async () => {
                  if (!allocateForm.facultyId || !allocateForm.courseId) return;
                  await assignFacultyToCourse(allocateForm);
                  setModalType(null);
                  showFeedback('success', `Faculty allocated to course.`);
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl cursor-pointer"
              >
                Assign Faculty
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {modalType === 'csv-import' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Controlled CSV Batch Import</h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>

            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              {(['students', 'faculty', 'courses'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setCsvType(t)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                    csvType === t ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-semibold text-slate-700 block">
                Paste CSV Data ({csvType === 'students' ? 'name, studentId, email, phone, semester' : csvType === 'faculty' ? 'name, email, designation, department' : 'courseCode, courseName, semester, credits'}):
              </label>
              <textarea
                rows={6}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder={
                  csvType === 'students'
                    ? 'Aditya Sharma, BCA26101, aditya@bcafly.edu, +919876543210, 1\nPooja Patel, BCA26102, pooja@bcafly.edu, +919876543211, 1'
                    : csvType === 'faculty'
                    ? 'Dr. Rajesh Kumar, rajesh.k@bcafly.edu, Professor, BCA\nDr. Sneha Verma, sneha.v@bcafly.edu, Associate Professor, BCA'
                    : 'BCA101, Programming in C, 1, 4\nBCA102, Digital Logic, 1, 4'
                }
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-[11px] focus:outline-none focus:bg-white"
              />
            </div>

            {csvError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                {csvError}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setModalType(null)} className="px-4 py-2 text-slate-600 font-semibold text-xs">Cancel</button>
              <button
                onClick={async () => {
                  try {
                    setCsvError(null);
                    const lines = csvText.trim().split('\n').filter(l => l.trim().length > 0);
                    if (lines.length === 0) {
                      setCsvError('Please enter at least one CSV row');
                      return;
                    }

                    if (csvType === 'students') {
                      const records = lines.map(line => {
                        const [name, studentId, email, phone, semester] = line.split(',').map(s => s.trim());
                        return { name, studentId, email, phone, semester: Number(semester || 1) };
                      });
                      const res = await api.importStudentsBatch(records);
                      showFeedback('success', `Imported ${res.importedCount} students.`);
                    } else if (csvType === 'faculty') {
                      const records = lines.map(line => {
                        const [name, email, designation, department] = line.split(',').map(s => s.trim());
                        return { name, email, designation: designation || 'Assistant Professor', department: department || 'BCA' };
                      });
                      const res = await api.importFacultyBatch(records);
                      showFeedback('success', `Imported ${res.importedCount} faculty accounts.`);
                    } else if (csvType === 'courses') {
                      for (const line of lines) {
                        const [courseCode, courseName, semester, credits] = line.split(',').map(s => s.trim());
                        await addCourse({ courseCode, courseName, semester: Number(semester || 1), credits: Number(credits || 4) });
                      }
                      showFeedback('success', `Courses imported successfully.`);
                    }

                    await refreshData();
                    setModalType(null);
                    setCsvText('');
                  } catch (err: any) {
                    setCsvError(err.message || 'Import failed');
                  }
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl cursor-pointer"
              >
                Validate &amp; Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
