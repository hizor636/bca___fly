import React, { useState, useMemo } from 'react';
import { useDemoStore } from '../context/DemoContext';
import { Student, DepartmentNotice, FacultyMember } from '../types';
import { INITIAL_NOTICES } from '../data/academicData';
import { DashboardRibbon } from './DashboardRibbon';
import { SixSemesterReportsModal } from './SixSemesterReportsModal';
import { CourseAcademicWorkspace } from './CourseAcademicWorkspace';
import {
  Users,
  LayoutDashboard,
  BookOpen,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Award,
  Calendar,
  Clock,
  Send,
  Sparkles,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
  FileText,
  ShieldCheck,
  HeartHandshake,
  UserCheck,
  Phone,
  Mail,
  Check,
  X,
  RefreshCw,
  Bell,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface FacultyDashboardViewProps {
  onSelectStudent: (student: Student) => void;
  onOpenNotice?: (notice: DepartmentNotice) => void;
  onOpenAudit: () => void;
  onOpenReports: () => void;
  onNavigateExplore?: () => void;
}

interface QuickTask {
  id: string;
  title: string;
  dueTime: string;
  tag: string;
  completed: boolean;
}

export const FacultyDashboardView: React.FC<FacultyDashboardViewProps> = ({
  onSelectStudent,
  onOpenNotice,
  onOpenAudit,
  onNavigateExplore,
}) => {
  const {
    activeFaculty,
    getScopedStudentsForActiveFaculty,
    workingDays,
    attendanceSettings,
    counselingReferrals,
    addMentoringSession,
    createCounselingReferral,
    markAndFinalizeAttendance,
    smsMessages
  } = useDemoStore();

  const notices = INITIAL_NOTICES;

  // Scoped students assigned strictly to activeFaculty (e.g. 42 for Dr. Sarah Jenkins)
  const scopedStudents = getScopedStudentsForActiveFaculty() || [];
  const assignedCount = scopedStudents.length;

  // Primary Active Tab: 'courses' (Course & Semester Management), 'students' (Assigned Students (42)) or 'workspace' (Smart Workspace)
  const [activeTab, setActiveTab] = useState<'courses' | 'students' | 'workspace'>('courses');

  // Reports Modal State
  const [showReportsModal, setShowReportsModal] = useState(false);

  // --- TAB 1: ASSIGNED STUDENTS STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<number | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Mentoring & Counseling Modals
  const [mentoringTargetStudent, setMentoringTargetStudent] = useState<Student | null>(null);
  const [mentoringNotes, setMentoringNotes] = useState('');
  const [mentoringActionItems, setMentoringActionItems] = useState('');
  const [mentoringType, setMentoringType] = useState<'Academic' | 'Personal' | 'Career' | 'Attendance'>('Attendance');

  const [referralTargetStudent, setReferralTargetStudent] = useState<Student | null>(null);
  const [referralReason, setReferralReason] = useState('');
  const [referralPriority, setReferralPriority] = useState<'Normal' | 'Urgent'>('Normal');
  const [referralSuccessMsg, setReferralSuccessMsg] = useState(false);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return scopedStudents.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSemester = selectedSemester === 'all' || s.semester === selectedSemester;
      const matchesStatus =
        selectedStatus === 'all' ||
        (selectedStatus === 'mentoring' && s.mentoringStatus === 'Mentoring') ||
        (selectedStatus === 'concern' && (s.mentoringStatus === 'Academic Concern' || s.attendanceRate < 75)) ||
        (selectedStatus === 'honor' && s.mentoringStatus === 'Honor Roll');

      return matchesSearch && matchesSemester && matchesStatus;
    });
  }, [scopedStudents, searchQuery, selectedSemester, selectedStatus]);

  // Key metrics for assigned students
  const avgAttendance = assignedCount
    ? Math.round(scopedStudents.reduce((acc, curr) => acc + curr.attendanceRate, 0) / assignedCount)
    : 0;
  const atRiskCount = scopedStudents.filter((s) => s.attendanceRate < 75).length;
  const honorCount = scopedStudents.filter((s) => s.attendanceRate >= 90).length;

  // --- TAB 2: SMART WORKSPACE STATE ---
  const todayDateStr = '2026-09-04';
  const todayCalendar = workingDays?.find((d) => d.date === todayDateStr) || {
    date: todayDateStr,
    isWorking: true,
    dayName: 'Friday',
    reason: 'Regular Academic Working Day',
  };

  const [selectedCourse, setSelectedCourse] = useState('BCA-301: Data Structures');
  const [attendanceSheet, setAttendanceSheet] = useState<Record<string, 'present' | 'absent' | 'late'>>(() => {
    const initial: Record<string, 'present' | 'absent' | 'late'> = {};
    scopedStudents.forEach((st, idx) => {
      // Seed some realistic statuses
      if (idx % 8 === 2) initial[st.id] = 'absent';
      else if (idx % 12 === 5) initial[st.id] = 'late';
      else initial[st.id] = 'present';
    });
    return initial;
  });

  const [finalizing, setFinalizing] = useState(false);
  const [finalizedSuccess, setFinalizedSuccess] = useState(false);
  const [finalizedResultCount, setFinalizedResultCount] = useState({ absent: 0, smsDispatched: 0 });

  // Tasks
  const [tasks, setTasks] = useState<QuickTask[]>([
    {
      id: 'task-1',
      title: 'Review mid-term CIA-1 papers for BCA 3rd Sem Data Structures',
      dueTime: '2:00 PM',
      tag: 'Grading',
      completed: false,
    },
    {
      id: 'task-2',
      title: 'Follow-up with students having attendance under 75% for medical condonation',
      dueTime: '3:30 PM',
      tag: 'Mentoring',
      completed: false,
    },
    {
      id: 'task-3',
      title: 'Submit monthly BCA laboratory maintenance sign-off to HOD office',
      dueTime: '5:00 PM',
      tag: 'Admin',
      completed: true,
    },
  ]);

  const toggleTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendanceSheet((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status: 'present' | 'absent') => {
    const next: Record<string, 'present' | 'absent' | 'late'> = {};
    scopedStudents.forEach((st) => {
      next[st.id] = status;
    });
    setAttendanceSheet(next);
  };

  const handleFinalizeAttendance = () => {
    if (!todayCalendar.isWorking) {
      alert('Attendance cannot be finalized on a designated non-working day or holiday.');
      return;
    }

    setFinalizing(true);
    const records = Object.entries(attendanceSheet).map(([studentId, status]) => ({
      studentId,
      status,
    }));

    const result = markAndFinalizeAttendance(
      'cls-bca-301',
      records
    );

    setTimeout(() => {
      setFinalizing(false);
      setFinalizedSuccess(true);
      setFinalizedResultCount({
        absent: records.filter((r) => r.status === 'absent').length,
        smsDispatched: result?.smsCount || 0,
      });
    }, 400);
  };

  const handleSaveMentoringRecord = () => {
    if (!mentoringTargetStudent) return;
    addMentoringSession(mentoringTargetStudent.id, {
      date: todayDateStr,
      topic: `${mentoringType} Mentoring Review`,
      notes: mentoringNotes || 'Regular review of academic progress, course syllabus milestones, and attendance compliance.',
      actionItems: mentoringActionItems || 'Maintain minimum 75% attendance in theory and labs.',
      status: 'Follow-up Required'
    });
    setMentoringTargetStudent(null);
    setMentoringNotes('');
    setMentoringActionItems('');
  };

  const handleCreateReferral = () => {
    if (!referralTargetStudent) return;
    createCounselingReferral(
      referralTargetStudent.id,
      'attendance_deficit',
      referralReason || 'Observed signs of academic distress and irregular attendance patterns.'
    );
    setReferralSuccessMsg(true);
    setTimeout(() => {
      setReferralSuccessMsg(false);
      setReferralTargetStudent(null);
      setReferralReason('');
    }, 1200);
  };

  const getCiaMarks = (st: Student) => {
    const rawCia1 = (st as any)?.internalMarks?.cia1;
    const rawCia2 = (st as any)?.internalMarks?.cia2;
    const cia1 = rawCia1 !== undefined ? rawCia1 : (st.subjectGrades?.[0]?.internalObtained ? Math.round((st.subjectGrades[0].internalObtained / (st.subjectGrades[0].internalMax || 30)) * 25) : Math.min(25, Math.max(14, Math.round(st.cgpa * 2.6))));
    const cia2 = rawCia2 !== undefined ? rawCia2 : (st.subjectGrades?.[1]?.internalObtained ? Math.round((st.subjectGrades[1].internalObtained / (st.subjectGrades[1].internalMax || 30)) * 25) : Math.min(25, Math.max(13, Math.round(st.cgpa * 2.5))));
    return { cia1, cia2 };
  };

  const presentCount = Object.values(attendanceSheet).filter((st) => st === 'present').length;
  const absentCount = Object.values(attendanceSheet).filter((st) => st === 'absent').length;
  const lateCount = Object.values(attendanceSheet).filter((st) => st === 'late').length;

  return (
    <div className="w-full bg-slate-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* 1. TOP DASHBOARD UTILITY RIBBON */}
        {/* Contains: Demo Mode (Pure Free), faculty: Dr. Sarah Jenkins, 6-Sem Reports, Audit Trail */}
        <DashboardRibbon
          onOpenAudit={onOpenAudit}
          onOpenReports={() => setShowReportsModal(true)}
        />

        {/* 2. DASHBOARD HERO BANNER */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
                  <UserCheck className="w-3.5 h-3.5 text-slate-700" />
                  <span>Faculty Academic Dashboard</span>
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-medium text-slate-600">
                  Department of Computer Applications (BCA)
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Scoped Mentoring Active
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
                Welcome, {activeFaculty.name}
              </h1>

              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
                Empowering your 1-on-1 mentoring, automated roll-call verification, and confidential counseling referrals for your assigned mentees.
              </p>
            </div>

            {/* Quick Stat Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-center sm:text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Assigned Mentees
                </span>
                <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
                  {assignedCount} Students
                </div>
                <span className="text-[11px] text-slate-500 font-medium">100% Scoped Access</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-center sm:text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Avg Attendance
                </span>
                <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
                  {avgAttendance}%
                </div>
                <span className="text-[11px] text-rose-600 font-semibold">{atRiskCount} &lt;75% deficit</span>
              </div>

              <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-center sm:text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Today's Roll-Call
                </span>
                <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5 flex items-center justify-center sm:justify-start gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${todayCalendar.isWorking ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <span>{todayCalendar.isWorking ? 'Working Day' : 'Holiday'}</span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">Cutoff: {attendanceSettings.dailyCutoffTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. PRIMARY DASHBOARD TABS: "Courses & Classes (Sem 1-6)", "Assigned Students (42)" & "Smart Workspace" */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2 bg-slate-100/90 p-1.5 rounded-2xl w-fit flex-wrap">
            <button
              id="dashboard-tab-courses"
              onClick={() => setActiveTab('courses')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'courses'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <BookOpen className="w-4 h-4 text-slate-700" />
              <span>Courses &amp; Classes (Sem 1-6)</span>
            </button>

            <button
              id="dashboard-tab-assigned-students"
              onClick={() => setActiveTab('students')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'students'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Users className="w-4 h-4 text-slate-700" />
              <span>Assigned Mentees ({assignedCount})</span>
            </button>

            <button
              id="dashboard-tab-smart-workspace"
              onClick={() => setActiveTab('workspace')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'workspace'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-slate-700" />
              <span>Smart Workspace</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowReportsModal(true)}
              className="px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
              <span>6-Sem Reports</span>
            </button>

            <button
              onClick={onOpenAudit}
              className="px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
              <span>Audit Trail</span>
            </button>

            {onNavigateExplore && (
              <button
                onClick={onNavigateExplore}
                className="text-xs text-slate-400 hover:text-slate-700 transition-colors px-2 py-1"
                title="View original landing page overview"
              >
                Explore Landing →
              </button>
            )}
          </div>
        </div>

        {/* 4. TAB CONTENT: COURSE ACADEMIC MANAGEMENT (Sem 1-6, Allocation, Attendance, Marks, Record) */}
        {activeTab === 'courses' && (
          <CourseAcademicWorkspace
            onSelectStudent={onSelectStudent}
            onOpenReports={() => setShowReportsModal(true)}
            onOpenAudit={onOpenAudit}
          />
        )}

        {/* 5. TAB CONTENT: ASSIGNED STUDENTS */}
        {activeTab === 'students' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Filter & Search Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, roll no, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-start md:justify-end">
                {/* Semester Filter (All 6 Semesters Supported) */}
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-slate-400 font-medium">Sem:</span>
                  <select
                    value={selectedSemester}
                    onChange={(e) =>
                      setSelectedSemester(e.target.value === 'all' ? 'all' : Number(e.target.value))
                    }
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Semesters (1-6)</option>
                    <option value="1">Sem 1</option>
                    <option value="2">Sem 2</option>
                    <option value="3">Sem 3</option>
                    <option value="4">Sem 4</option>
                    <option value="5">Sem 5</option>
                    <option value="6">Sem 6</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-slate-400 font-medium">Status:</span>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    <option value="mentoring">Mentoring</option>
                    <option value="concern">Academic Concern (&lt;75%)</option>
                    <option value="honor">Honor Roll (≥90%)</option>
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-slate-100 p-1 rounded-full text-xs">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                      viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    Table
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                      viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    Cards
                  </button>
                </div>
              </div>
            </div>

            {/* Students View: Table or Grid */}
            {viewMode === 'table' ? (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider bg-slate-50/80">
                        <th className="py-3 pl-4">Student</th>
                        <th className="py-3">Roll ID</th>
                        <th className="py-3">Semester</th>
                        <th className="py-3">Attendance %</th>
                        <th className="py-3">CIA-1 / CIA-2</th>
                        <th className="py-3">CGPA</th>
                        <th className="py-3">Mentoring Status</th>
                        <th className="py-3">Parent Contact</th>
                        <th className="py-3 pr-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-10 text-center text-slate-400">
                            No students match your filter criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map((st) => {
                          const isShortage = st.attendanceRate < 75;
                          const hasCounselingReferral = counselingReferrals.some((r) => r.studentId === st.id);

                          return (
                            <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-3 pl-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-800 text-xs">
                                    {st.avatarText || st.name.slice(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                    <button
                                      onClick={() => onSelectStudent(st)}
                                      className="font-bold text-slate-900 hover:text-slate-600 text-left cursor-pointer"
                                    >
                                      {st.name}
                                    </button>
                                    <span className="text-[10px] text-slate-400 block">{st.email}</span>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 font-mono text-slate-500 font-semibold">{st.studentId}</td>

                              <td className="py-3">
                                <span className="font-semibold text-slate-700">Sem {st.semester}</span>
                              </td>

                              <td className="py-3">
                                <div className="space-y-1 w-28">
                                  <div className="flex items-center justify-between">
                                    <span
                                      className={`font-bold text-xs ${
                                        isShortage ? 'text-rose-600' : st.attendanceRate >= 90 ? 'text-emerald-700' : 'text-slate-900'
                                      }`}
                                    >
                                      {st.attendanceRate}%
                                    </span>
                                    {isShortage && (
                                      <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded-full border border-rose-200">
                                        Shortage
                                      </span>
                                    )}
                                  </div>
                                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${
                                        isShortage ? 'bg-rose-500' : st.attendanceRate >= 90 ? 'bg-emerald-500' : 'bg-slate-800'
                                      }`}
                                      style={{ width: `${st.attendanceRate}%` }}
                                    />
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 text-slate-600 font-medium">
                                {(() => {
                                  const { cia1, cia2 } = getCiaMarks(st);
                                  return (
                                    <>
                                      <span className="text-slate-900 font-bold">{cia1}</span> / 25 •{' '}
                                      <span className="text-slate-900 font-bold">{cia2}</span> / 25
                                    </>
                                  );
                                })()}
                              </td>

                              <td className="py-3">
                                <span className="font-bold text-slate-900">{st.cgpa.toFixed(2)}</span>
                              </td>

                              <td className="py-3">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                      st.mentoringStatus === 'Honor Roll'
                                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                        : isShortage || st.mentoringStatus === 'Academic Concern'
                                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                        : 'bg-slate-100 text-slate-700'
                                    }`}
                                  >
                                    {st.mentoringStatus}
                                  </span>
                                  {hasCounselingReferral && (
                                    <span
                                      className="text-[9px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded-full border border-purple-200"
                                      title="Referred to Counseling"
                                    >
                                      Referred
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td className="py-3 text-slate-500 font-mono text-[11px]">
                                {st.parentPhone || '+91 98450 11223'}
                              </td>

                              <td className="py-3 pr-4 text-right space-x-1.5">
                                <button
                                  onClick={() => setMentoringTargetStudent(st)}
                                  className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-[11px] transition-colors cursor-pointer"
                                  title="Log 1-on-1 mentoring notes"
                                >
                                  Log Note
                                </button>
                                <button
                                  onClick={() => setReferralTargetStudent(st)}
                                  className="px-2.5 py-1 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-800 font-semibold text-[11px] transition-colors cursor-pointer"
                                  title="Confidential referral to counselor"
                                >
                                  Refer
                                </button>
                                <button
                                  onClick={() => onSelectStudent(st)}
                                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 inline-block cursor-pointer align-middle"
                                  title="View full student record"
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Grid View */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStudents.map((st) => {
                  const isShortage = st.attendanceRate < 75;
                  return (
                    <div
                      key={st.id}
                      className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:border-slate-300 transition-all space-y-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-800 text-sm">
                            {st.avatarText || st.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h4
                              onClick={() => onSelectStudent(st)}
                              className="font-bold text-slate-900 hover:text-slate-600 text-sm cursor-pointer"
                            >
                              {st.name}
                            </h4>
                            <span className="text-xs font-mono text-slate-400">{st.studentId}</span>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isShortage
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          Sem {st.semester}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Attendance</span>
                          <span className={`font-bold ${isShortage ? 'text-rose-600' : 'text-slate-900'}`}>
                            {st.attendanceRate}%
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">CGPA</span>
                          <span className="font-bold text-slate-900">{st.cgpa.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">CIA-1 / CIA-2</span>
                          <span className="font-semibold text-slate-700">
                            {(() => {
                              const { cia1, cia2 } = getCiaMarks(st);
                              return `${cia1} / ${cia2}`;
                            })()}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Mentoring</span>
                          <span className="font-semibold text-slate-700 truncate block">
                            {st.mentoringStatus}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <button
                          onClick={() => setMentoringTargetStudent(st)}
                          className="text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
                        >
                          Log Note →
                        </button>
                        <button
                          onClick={() => onSelectStudent(st)}
                          className="text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-full transition-colors cursor-pointer"
                        >
                          View Profile
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 5. TAB CONTENT: SMART WORKSPACE */}
        {activeTab === 'workspace' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Quick Roll-Call Session Header */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Daily Attendance Roll-Call
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      todayCalendar.isWorking ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {todayCalendar.isWorking ? 'Working Day Confirmed' : 'Holiday - Roll-Call Inactive'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
                    Live Mentee Class Roll-Call &amp; SMS Dispatch
                  </h3>
                  <p className="text-xs text-slate-500">
                    Finalizing attendance automatically validates calendar rules and dispatches instant simulated SMS to absent students and parents.
                  </p>
                </div>

                {/* Course Selection */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Course:</span>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs font-semibold text-slate-900 focus:outline-none cursor-pointer"
                  >
                    <option value="BCA-301: Data Structures">BCA-301: Data Structures (Sem 3)</option>
                    <option value="BCA-502: Web Technologies">BCA-502: Web Technologies (Sem 5)</option>
                    <option value="BCA-101: Problem Solving in C">BCA-101: Problem Solving in C (Sem 1)</option>
                  </select>
                </div>
              </div>

              {/* Status Tally Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/70">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-semibold text-slate-700">Present:</span>
                    <span className="text-xs font-bold text-slate-900">{presentCount}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="text-xs font-semibold text-slate-700">Absent:</span>
                    <span className="text-xs font-bold text-rose-600">{absentCount}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="text-xs font-semibold text-slate-700">Late:</span>
                    <span className="text-xs font-bold text-amber-700">{lateCount}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => markAll('present')}
                    className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 rounded-full transition-colors cursor-pointer"
                  >
                    Mark All Present
                  </button>
                  <button
                    onClick={() => markAll('absent')}
                    className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 rounded-full transition-colors cursor-pointer"
                  >
                    Mark All Absent
                  </button>
                  <button
                    disabled={finalizing || !todayCalendar.isWorking}
                    onClick={handleFinalizeAttendance}
                    className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-full transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{finalizing ? 'Finalizing...' : 'Finalize & Dispatch SMS'}</span>
                  </button>
                </div>
              </div>

              {/* Attendance Sheet List */}
              <div className="border border-slate-200/90 rounded-2xl overflow-hidden max-h-96 overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 bg-slate-100 z-10">
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                      <th className="py-2.5 pl-4">Student</th>
                      <th className="py-2.5">Roll ID</th>
                      <th className="py-2.5">Attendance Health</th>
                      <th className="py-2.5 pr-4 text-right">Status Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {scopedStudents.map((st) => {
                      const currentStatus = attendanceSheet[st.id] || 'present';
                      return (
                        <tr key={st.id} className="hover:bg-slate-50/70">
                          <td className="py-2.5 pl-4">
                            <span className="font-bold text-slate-900">{st.name}</span>
                          </td>
                          <td className="py-2.5 font-mono text-slate-500">{st.studentId}</td>
                          <td className="py-2.5">
                            <span className={`font-semibold ${st.attendanceRate < 75 ? 'text-rose-600' : 'text-slate-700'}`}>
                              {st.attendanceRate}% cumulative
                            </span>
                          </td>
                          <td className="py-2.5 pr-4 text-right">
                            <div className="inline-flex rounded-full bg-slate-100 p-0.5">
                              <button
                                onClick={() => handleStatusChange(st.id, 'present')}
                                className={`px-2.5 py-0.5 rounded-full font-semibold text-[11px] transition-colors cursor-pointer ${
                                  currentStatus === 'present'
                                    ? 'bg-emerald-600 text-white font-bold'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                P
                              </button>
                              <button
                                onClick={() => handleStatusChange(st.id, 'absent')}
                                className={`px-2.5 py-0.5 rounded-full font-semibold text-[11px] transition-colors cursor-pointer ${
                                  currentStatus === 'absent'
                                    ? 'bg-rose-600 text-white font-bold'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                A
                              </button>
                              <button
                                onClick={() => handleStatusChange(st.id, 'late')}
                                className={`px-2.5 py-0.5 rounded-full font-semibold text-[11px] transition-colors cursor-pointer ${
                                  currentStatus === 'late'
                                    ? 'bg-amber-600 text-white font-bold'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                L
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Timetable, Circulars & Faculty Tasks Bento */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Today's Timetable */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-700" />
                    <h3 className="font-bold text-slate-900 text-sm">Today's Class Timetable</h3>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">Friday</span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">09:30 AM - 10:30 AM</span>
                      <span className="text-emerald-700 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-full">Completed</span>
                    </div>
                    <div className="font-semibold text-slate-800 text-xs mt-1">BCA-301 Data Structures Theory</div>
                    <div className="text-[10px] text-slate-400">Room 304 • Semester 3</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-900 text-white">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">11:00 AM - 01:00 PM</span>
                      <span className="text-amber-300 font-bold text-[10px] bg-slate-800 px-2 py-0.5 rounded-full">Active</span>
                    </div>
                    <div className="font-semibold text-slate-100 text-xs mt-1">Data Structures &amp; Algorithms Lab</div>
                    <div className="text-[10px] text-slate-300">Lab 2 (System 1-42) • Roll-Call Active</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">02:30 PM - 03:30 PM</span>
                      <span className="text-slate-400 font-semibold text-[10px]">Upcoming</span>
                    </div>
                    <div className="font-semibold text-slate-800 text-xs mt-1">Mentee 1-on-1 Office Hours</div>
                    <div className="text-[10px] text-slate-400">Faculty Cabin #12 • Attendance Reviews</div>
                  </div>
                </div>
              </div>

              {/* Department Circulars */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-slate-700" />
                    <h3 className="font-bold text-slate-900 text-sm">Department Circulars</h3>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">{notices.length} Notices</span>
                </div>

                <div className="space-y-3">
                  {notices.slice(0, 3).map((notice) => (
                    <div
                      key={notice.id}
                      onClick={() => onOpenNotice && onOpenNotice(notice)}
                      className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-100 cursor-pointer transition-colors space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-slate-500 uppercase">{notice.priority}</span>
                        <span className="text-slate-400">{notice.date}</span>
                      </div>
                      <div className="font-bold text-slate-900 text-xs leading-snug">{notice.title}</div>
                      <p className="text-[11px] text-slate-500 line-clamp-2">{notice.body}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Faculty Priority Tasks */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-slate-700" />
                    <h3 className="font-bold text-slate-900 text-sm">Mentoring Tasks</h3>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">
                    {tasks.filter((t) => t.completed).length} / {tasks.length} Done
                  </span>
                </div>

                <div className="space-y-2.5">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                        task.completed
                          ? 'bg-slate-50/60 border-slate-100 text-slate-400 line-through'
                          : 'bg-white border-slate-200/80 text-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => {}}
                        className="mt-0.5 rounded text-slate-900 focus:ring-slate-900 cursor-pointer"
                      />
                      <div className="flex-1 text-xs">
                        <div className="font-semibold">{task.title}</div>
                        <div className="flex items-center gap-2 mt-1 text-[10px]">
                          <span className="text-slate-400">Due {task.dueTime}</span>
                          <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-semibold">
                            {task.tag}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. MODALS: 6-SEM REPORTS MODAL */}
        <SixSemesterReportsModal
          isOpen={showReportsModal}
          onClose={() => setShowReportsModal(false)}
        />

        {/* 7. MODAL: LOG MENTORING RECORD */}
        {mentoringTargetStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Log 1-on-1 Mentoring Note</h3>
                  <span className="text-xs text-slate-500">
                    Student: {mentoringTargetStudent.name} ({mentoringTargetStudent.studentId})
                  </span>
                </div>
                <button
                  onClick={() => setMentoringTargetStudent(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Session Category</label>
                  <div className="flex gap-2">
                    {(['Attendance', 'Academic', 'Career', 'Personal'] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setMentoringType(cat)}
                        className={`px-3 py-1.5 rounded-full font-semibold cursor-pointer ${
                          mentoringType === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Observation &amp; Discussion Summary</label>
                  <textarea
                    rows={3}
                    placeholder="Enter key discussion points regarding attendance, academic syllabus, or challenges..."
                    value={mentoringNotes}
                    onChange={(e) => setMentoringNotes(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Action Items (One per line)</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Submit Lab Assignment 3 by Monday&#10;Meet subject faculty for CIA review"
                    value={mentoringActionItems}
                    onChange={(e) => setMentoringActionItems(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setMentoringTargetStudent(null)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveMentoringRecord}
                  className="px-5 py-2 rounded-full text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white cursor-pointer shadow-xs"
                >
                  Save to Mentoring History
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 8. MODAL: CONFIDENTIAL COUNSELOR REFERRAL */}
        {referralTargetStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <HeartHandshake className="w-5 h-5 text-purple-700" />
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Confidential Counseling Referral</h3>
                    <span className="text-xs text-slate-500">
                      Referred Student: {referralTargetStudent.name} ({referralTargetStudent.studentId})
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setReferralTargetStudent(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {referralSuccessMsg ? (
                <div className="py-6 text-center space-y-2">
                  <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-slate-900 text-sm">Referral Dispatched to Counselor</h4>
                  <p className="text-xs text-slate-500">
                    Dr. Priya Sharma has received the case file. Clinical notes will remain strictly confidential.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-xs text-slate-500">
                    Notice: Referral status (Under Review, Session Scheduled, Resolved) will be mirrored back to you as mentor, but the student's personal therapeutic session notes will remain strictly protected.
                  </p>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Reason for Referral</label>
                      <textarea
                        rows={3}
                        placeholder="Detail reasons such as severe attendance drop, anxiety during assessments, emotional distress..."
                        value={referralReason}
                        onChange={(e) => setReferralReason(e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Priority</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setReferralPriority('Normal')}
                          className={`px-3.5 py-1.5 rounded-full font-semibold cursor-pointer ${
                            referralPriority === 'Normal' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          Normal
                        </button>
                        <button
                          onClick={() => setReferralPriority('Urgent')}
                          className={`px-3.5 py-1.5 rounded-full font-semibold cursor-pointer ${
                            referralPriority === 'Urgent' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          Urgent (Needs immediate session)
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setReferralTargetStudent(null)}
                      className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateReferral}
                      className="px-5 py-2 rounded-full text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white cursor-pointer shadow-xs"
                    >
                      Submit Confidential Referral
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* 9. MODAL: FINALIZED ATTENDANCE & SMS DISPATCH CONFIRMATION */}
        {finalizedSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle className="w-6 h-6" />
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-lg">Attendance Finalized &amp; Logged</h3>
                <p className="text-xs text-slate-500 mt-1">
                  SHA-256 tamper-evident record committed to the institutional audit trail for {selectedCourse.split(':')[0]}.
                </p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70 text-xs text-slate-700 space-y-1.5 text-left">
                <div className="flex justify-between">
                  <span className="text-slate-400">Course:</span>
                  <span className="font-semibold">{selectedCourse}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Absent:</span>
                  <span className="font-bold text-rose-600">{finalizedResultCount.absent} Students</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Simulated SMS Dispatched:</span>
                  <span className="font-bold text-emerald-700">{finalizedResultCount.smsDispatched} Messages</span>
                </div>
              </div>

              <button
                onClick={() => setFinalizedSuccess(false)}
                className="w-full py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
