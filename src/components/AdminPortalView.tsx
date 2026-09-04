import React, { useState } from 'react';
import { useDemoStore } from '../context/DemoContext';
import { BcaFlyLogo } from './BcaFlyLogo';
import {
  Users,
  Calendar,
  Clock,
  MessageSquare,
  FileBarChart,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Send,
  Download,
  Printer,
  ChevronRight,
  ArrowRight,
  Edit2,
  RefreshCw,
  Sliders,
  UserCheck,
  LogOut
} from 'lucide-react';

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
    switchRole,
    students,
    facultyList,
    workingDays,
    attendanceSettings,
    smsTemplates,
    smsMessages,
    counselingReferrals,
    auditLogs,
    semesters,
    updateAttendanceSettings,
    toggleWorkingDay,
    updateCondonationStatus,
    updateSmsTemplate,
    reassignStudent
  } = useDemoStore();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'assignments' | 'attendance-settings' | 'sms' | 'reports'
  >('overview');

  const [reportSubTab, setReportSubTab] = useState<
    'consolidated' | 'shortage' | 'transcripts' | 'audit'
  >('consolidated');

  // Assignment search/filter state
  const [assignSearch, setAssignSearch] = useState('');
  const [assignSemFilter, setAssignSemFilter] = useState<number | 'all'>('all');
  const [reassigningStudentId, setReassigningStudentId] = useState<string | null>(null);

  // SMS template editor state
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(smsTemplates[0].id);
  const [templateEditText, setTemplateEditText] = useState<string>(smsTemplates[0].body);
  const [templateSaveFeedback, setTemplateSaveFeedback] = useState(false);

  // Transcript viewer state
  const [transcriptStudentId, setTranscriptStudentId] = useState<string>(students[0].id);

  // Report semester filter
  const [reportSemester, setReportSemester] = useState<number>(5);

  // Stats
  const totalStudents = 800; // Total platform ecosystem
  const activeEnrolledCount = students.length;
  const shortageStudents = students.filter((s) => s.attendanceRate < 75);
  const honorStudents = students.filter((s) => s.attendanceRate >= 92);
  const todayWorkingDay = workingDays.find((wd) => wd.date === '2026-09-04');
  const totalSmsSent = smsMessages.filter((m) => m.status === 'sent').length;

  const handleSaveTemplate = () => {
    updateSmsTemplate(selectedTemplateId, templateEditText);
    setTemplateSaveFeedback(true);
    setTimeout(() => setTemplateSaveFeedback(false), 2000);
  };

  const selectedTemplate = smsTemplates.find((t) => t.id === selectedTemplateId) || smsTemplates[0];

  const filteredAssignStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(assignSearch.toLowerCase()) ||
      s.studentId.includes(assignSearch) ||
      s.assignedFaculty.toLowerCase().includes(assignSearch.toLowerCase());
    const matchesSem = assignSemFilter === 'all' || s.semester === assignSemFilter;
    return matchesSearch && matchesSem;
  });

  const selectedTranscriptStudent = students.find((s) => s.id === transcriptStudentId) || students[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
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
              <span className="text-xs text-slate-400">Authenticated Session</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5">
              {currentUser?.name || 'Dr. V. Swaminathan'}
            </h1>
            <p className="text-xs text-slate-400">
              Department of Computer Applications • 800 User System Governance
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onNavigatePublic && (
            <button
              onClick={onNavigatePublic}
              className="text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3.5 py-2 rounded-full transition-colors cursor-pointer"
            >
              Public Site
            </button>
          )}

          {/* Quick Persona Switcher for Evaluators */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-full text-xs text-slate-300">
            <span className="text-[10px] uppercase font-bold text-slate-500 px-2">Role:</span>
            <button
              onClick={() => switchRole('faculty')}
              className="px-2.5 py-1 rounded-full hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
              title="Switch to Faculty Persona"
            >
              Faculty
            </button>
            <button
              onClick={() => switchRole('student')}
              className="px-2.5 py-1 rounded-full hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
              title="Switch to Student Persona"
            >
              Student
            </button>
            <button
              onClick={() => switchRole('counselor')}
              className="px-2.5 py-1 rounded-full hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
              title="Switch to Counselor Persona"
            >
              Counselor
            </button>
          </div>

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

      {/* Sub Header & Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Academic Operations &amp; Faculty Mentorship Governance
          </h2>
          <p className="text-xs text-slate-500">
            Configure working-day calendars, assign student mentee cohorts, verify condonation lists, and manage SMS alert gateways.
          </p>
        </div>

        {/* Tab Navigation Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-50 border border-slate-200/80 rounded-full text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-3.5 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${
              activeTab === 'assignments'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Assignments
          </button>
          <button
            onClick={() => setActiveTab('attendance-settings')}
            className={`px-3.5 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${
              activeTab === 'attendance-settings'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Attendance &amp; Calendar
          </button>
          <button
            onClick={() => setActiveTab('sms')}
            className={`px-3.5 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${
              activeTab === 'sms'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            SMS Center
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3.5 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Reports (1–6)
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Metrics Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Ecosystem Users
              </span>
              <div className="text-2xl font-bold text-slate-900">{totalStudents}</div>
              <span className="text-[11px] text-slate-500">6 Semesters BCA</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Faculty Mentors
              </span>
              <div className="text-2xl font-bold text-slate-900">{facultyList.length}</div>
              <span className="text-[11px] text-slate-500">100% scoped allocation</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Today's Calendar
              </span>
              <div className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${todayWorkingDay?.isWorking ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <span>{todayWorkingDay?.isWorking ? 'Working Day' : 'Non-working'}</span>
              </div>
              <span className="text-[11px] text-slate-400">Cutoff: {attendanceSettings.dailyCutoffTime}</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Simulated SMS
              </span>
              <div className="text-2xl font-bold text-slate-900">{totalSmsSent}</div>
              <span className="text-[11px] text-slate-500">Automated dispatches</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Shortage Alerts
              </span>
              <div className="text-2xl font-bold text-slate-900">{shortageStudents.length}</div>
              <span className="text-[11px] text-rose-600 font-semibold">&lt;75% Attendance</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Counseling Queue
              </span>
              <div className="text-2xl font-bold text-slate-900">{counselingReferrals.length}</div>
              <span className="text-[11px] text-slate-500">Confidential cases</span>
            </div>
          </div>

          {/* Quick Action Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Working Day & Cutoff Summary Card */}
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-900" />
                  <h3 className="font-bold text-slate-900 text-sm">Attendance Cutoff &amp; Automation</h3>
                </div>
                <button
                  onClick={() => setActiveTab('attendance-settings')}
                  className="text-xs font-semibold text-slate-700 hover:text-slate-900"
                >
                  Configure →
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Daily attendance is finalized before the cutoff time. Automated SMS notifications are generated and logged exclusively on verified working days.
              </p>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Cutoff Time:</span>
                  <span className="font-semibold text-slate-900">{attendanceSettings.dailyCutoffTime} (Local)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Working Days Rule:</span>
                  <span className="font-semibold text-emerald-700">Enforced (Weekend SMS Blocked)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Auto-SMS on Finalize:</span>
                  <span className="font-semibold text-slate-900">{attendanceSettings.autoSmsOnFinalize ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
            </div>

            {/* Attendance Shortage Action Box */}
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Attendance Shortage Register</h3>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('reports');
                    setReportSubTab('shortage');
                  }}
                  className="text-xs font-semibold text-slate-700 hover:text-slate-900"
                >
                  View Register →
                </button>
              </div>

              <p className="text-xs text-slate-500">
                {shortageStudents.length} students currently require institutional condonation review or debarment processing under university statutes.
              </p>

              <div className="space-y-1.5">
                {shortageStudents.slice(0, 3).map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs border border-slate-100"
                  >
                    <div>
                      <span className="font-semibold text-slate-900 block">{st.name}</span>
                      <span className="text-[10px] text-slate-400">Sem {st.semester} • Mentor: {st.assignedFaculty}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-rose-600">{st.attendanceRate}%</span>
                      <span className="text-[10px] text-slate-400 block">{st.condonationStatus || 'Action Req'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Health & Audit Quick Snapshot */}
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-slate-900" />
                  <h3 className="font-bold text-slate-900 text-sm">Governance &amp; Audit Trail</h3>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('reports');
                    setReportSubTab('audit');
                  }}
                  className="text-xs font-semibold text-slate-700 hover:text-slate-900"
                >
                  Full Log →
                </button>
              </div>

              <p className="text-xs text-slate-500">
                {auditLogs.length} immutable events recorded this session. Every attendance sign-off, referral, and setting modification is tracked.
              </p>

              <div className="space-y-2">
                {auditLogs.slice(0, 3).map((log) => (
                  <div key={log.id} className="text-xs border-b border-slate-50 pb-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">{log.action}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{log.createdAt.slice(11)}</span>
                    </div>
                    <span className="text-[11px] text-slate-500">By {log.actorName} ({log.actorRole})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ASSIGNMENTS */}
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

            {/* Semester Filter */}
            <div className="flex items-center gap-1 overflow-x-auto text-xs">
              <span className="text-slate-400 text-[11px] mr-1">Sem:</span>
              <button
                onClick={() => setAssignSemFilter('all')}
                className={`px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer ${
                  assignSemFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                All
              </button>
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  onClick={() => setAssignSemFilter(num)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer ${
                    assignSemFilter === num ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Sem {num}
                </button>
              ))}
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
                {filteredAssignStudents.slice(0, 15).map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 pl-2">
                      <div className="font-semibold text-slate-900">{st.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Roll: {st.studentId} • Sec {st.section}</div>
                    </td>
                    <td className="py-2.5 text-slate-600">
                      BCA Semester {st.semester}
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`font-semibold ${
                          st.attendanceRate < 75 ? 'text-rose-600' : 'text-slate-800'
                        }`}
                      >
                        {st.attendanceRate}%
                      </span>
                    </td>
                    <td className="py-2.5">
                      <div className="font-semibold text-slate-900">{st.assignedFaculty}</div>
                      <span className="text-[10px] text-emerald-700 font-medium">Scoped Access Active</span>
                    </td>
                    <td className="py-2.5 pr-2 text-right">
                      {reassigningStudentId === st.id ? (
                        <select
                          defaultValue={st.assignedFacultyId}
                          onChange={(e) => {
                            reassignStudent(st.id, e.target.value);
                            setReassigningStudentId(null);
                          }}
                          className="bg-white border border-slate-300 text-xs rounded-full px-2 py-1 focus:outline-none focus:ring-1 focus:ring-slate-900"
                        >
                          {facultyList.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.name}
                            </option>
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
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-[11px] text-slate-400 text-center pt-2">
            Showing top {Math.min(filteredAssignStudents.length, 15)} of {filteredAssignStudents.length} assigned students across the ecosystem.
          </div>
        </div>
      )}

      {/* TAB 3: ATTENDANCE & CALENDAR */}
      {activeTab === 'attendance-settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-150">
          {/* Working Days Calendar */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Academic Working Days Calendar
              </h3>
              <p className="text-xs text-slate-500">
                Automated SMS alerts are sent strictly on working days. Toggle days to test non-working day SMS suppression.
              </p>
            </div>

            <div className="space-y-2">
              {workingDays.map((wd) => (
                <div
                  key={wd.id}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-900 mr-2">{wd.date}</span>
                    <span className="text-slate-500">({wd.dayOfWeek})</span>
                    {wd.reason && (
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full ml-2">
                        {wd.reason}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => toggleWorkingDay(wd.date)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      wd.isWorking
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                    }`}
                  >
                    {wd.isWorking ? 'Working Day' : 'Non-working / Off'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Cutoff Configuration */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Attendance Cutoff &amp; SMS Automation Rules
              </h3>
              <p className="text-xs text-slate-500">
                Configure timing constraints for faculty attendance submissions and SMS dispatch triggers.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Daily Attendance Cutoff Time
                </label>
                <input
                  type="time"
                  value={attendanceSettings.dailyCutoffTime}
                  onChange={(e) => updateAttendanceSettings({ dailyCutoffTime: e.target.value })}
                  className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
                <span className="block text-[11px] text-slate-400 mt-1">
                  Faculty must finalize attendance before this hour for automated same-day parent SMS delivery.
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-3">
                <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
                  <div>
                    <span className="font-semibold text-slate-900 text-xs block">
                      Enforce Strict Cutoff
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Warn faculty if attendance is submitted after configured cutoff time.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={attendanceSettings.cutoffEnforced}
                    onChange={(e) => updateAttendanceSettings({ cutoffEnforced: e.target.checked })}
                    className="w-4 h-4 rounded text-slate-900"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
                  <div>
                    <span className="font-semibold text-slate-900 text-xs block">
                      Auto-Trigger SMS on Finalize
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Instantly simulate SMS delivery to absentees upon faculty finalization.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={attendanceSettings.autoSmsOnFinalize}
                    onChange={(e) => updateAttendanceSettings({ autoSmsOnFinalize: e.target.checked })}
                    className="w-4 h-4 rounded text-slate-900"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
                  <div>
                    <span className="font-semibold text-slate-900 text-xs block">
                      Suppress SMS on Weekends &amp; Holidays
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Respect working days calendar and avoid sending messages on off days.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={attendanceSettings.smsWorkingDaysOnly}
                    onChange={(e) => updateAttendanceSettings({ smsWorkingDaysOnly: e.target.checked })}
                    className="w-4 h-4 rounded text-slate-900"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SMS AUTOMATION CENTER */}
      {activeTab === 'sms' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Templates */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                SMS Templates
              </h3>
              <div className="space-y-2">
                {smsTemplates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedTemplateId(t.id);
                      setTemplateEditText(t.body);
                    }}
                    className={`w-full text-left p-3 rounded-2xl text-xs transition-colors cursor-pointer ${
                      selectedTemplateId === t.id
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-100'
                    }`}
                  >
                    <div className="font-semibold">{t.name}</div>
                    <div className={`text-[10px] truncate mt-1 ${selectedTemplateId === t.id ? 'text-slate-300' : 'text-slate-400'}`}>
                      {t.body}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Template Editor & Preview */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  Edit Template &amp; Variable Mapping
                </h3>
                {templateSaveFeedback && (
                  <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Saved &amp; Audit-Logged
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Template Body
                </label>
                <textarea
                  rows={3}
                  value={templateEditText}
                  onChange={(e) => setTemplateEditText(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
                />
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs space-y-2">
                <span className="font-semibold text-slate-700 block">Available Parameters:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTemplate.variables.map((v) => (
                    <span key={v} className="font-mono text-[11px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded-full">
                      {v}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveTemplate}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-full transition-all cursor-pointer"
                >
                  Save Template
                </button>
              </div>
            </div>
          </div>

          {/* Live Simulated SMS Logs */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  Simulated SMS Delivery Logs
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time audit log of automated SMS dispatches generated on working days with idempotency keys.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                {smsMessages.length} Messages Dispatched
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="pb-2 pl-2">Timestamp</th>
                    <th className="pb-2">Recipient</th>
                    <th className="pb-2">Student</th>
                    <th className="pb-2">Message Body</th>
                    <th className="pb-2">Idempotency &amp; Provider</th>
                    <th className="pb-2 pr-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {smsMessages.map((msg) => (
                    <tr key={msg.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 pl-2 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {msg.sentAt}
                      </td>
                      <td className="py-2.5">
                        <div className="font-semibold text-slate-900">{msg.recipientType}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{msg.recipientPhone}</div>
                      </td>
                      <td className="py-2.5 font-semibold text-slate-800">
                        {msg.studentName}
                      </td>
                      <td className="py-2.5 max-w-sm">
                        <p className="text-slate-600 text-xs line-clamp-2">{msg.body}</p>
                      </td>
                      <td className="py-2.5 font-mono text-[10px] text-slate-400">
                        <div>{msg.idempotencyKey}</div>
                        <div>{msg.providerMessageId}</div>
                      </td>
                      <td className="py-2.5 pr-2 text-right">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {msg.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: REPORTS & EXPORTS (SEMESTERS 1 TO 6) */}
      {activeTab === 'reports' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-6 animate-in fade-in duration-150">
          {/* Sub-tab Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 overflow-x-auto">
              {(
                [
                  { id: 'consolidated', label: '1. Consolidated Semester Report' },
                  { id: 'shortage', label: '2. Attendance Shortage Register' },
                  { id: 'transcripts', label: '3. Student Transcripts' },
                  { id: 'audit', label: '4. Governance & Audit Trail' }
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setReportSubTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                    reportSubTab === tab.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Document</span>
            </button>
          </div>

          {/* SUB-TAB: CONSOLIDATED SEMESTER REPORT */}
          {reportSubTab === 'consolidated' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                    Consolidated 6-Semester Academic Benchmarking Report
                  </h3>
                  <p className="text-xs text-slate-500">
                    Institutional enrollment, aggregate attendance rates, SGPA bands, and arrears across Semesters 1 through 6.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider bg-slate-50/70">
                      <th className="py-2.5 pl-3">Semester</th>
                      <th className="py-2.5">Enrolled</th>
                      <th className="py-2.5">Avg Attendance</th>
                      <th className="py-2.5">Benchmarked &gt;85%</th>
                      <th className="py-2.5">Marginal (75-85%)</th>
                      <th className="py-2.5">Shortage (&lt;75%)</th>
                      <th className="py-2.5">Avg SGPA</th>
                      <th className="py-2.5 pr-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {semesters.map((sem) => {
                      const semStudents = students.filter((s) => s.semester === sem.number);
                      const count = semStudents.length || 20;
                      const avgAtt = semStudents.length
                        ? Math.round(semStudents.reduce((acc, s) => acc + s.attendanceRate, 0) / count)
                        : 84 + (sem.number % 3);
                      const above85 = semStudents.filter((s) => s.attendanceRate >= 85).length || Math.round(count * 0.55);
                      const marginal = semStudents.filter((s) => s.attendanceRate >= 75 && s.attendanceRate < 85).length || Math.round(count * 0.35);
                      const shortage = semStudents.filter((s) => s.attendanceRate < 75).length || Math.round(count * 0.1);
                      const avgSgpa = (7.4 + (sem.number * 0.18)).toFixed(2);

                      return (
                        <tr key={sem.id} className="hover:bg-slate-50/60">
                          <td className="py-3 pl-3 font-semibold text-slate-900">
                            {sem.name}
                          </td>
                          <td className="py-3 text-slate-700">{sem.totalEnrolled} students</td>
                          <td className="py-3 font-bold text-slate-900">{avgAtt}%</td>
                          <td className="py-3 text-emerald-700 font-semibold">{above85} students</td>
                          <td className="py-3 text-amber-700 font-semibold">{marginal} students</td>
                          <td className="py-3 text-rose-600 font-bold">{shortage} flagged</td>
                          <td className="py-3 font-mono text-slate-800">{avgSgpa} / 10</td>
                          <td className="py-3 pr-3 text-right">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                sem.isCurrent
                                  ? 'bg-slate-900 text-white'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {sem.isCurrent ? 'Current Term' : 'Archived'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUB-TAB: ATTENDANCE SHORTAGE REGISTER */}
          {reportSubTab === 'shortage' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  Attendance Shortage Register (Criteria &lt;75%)
                </h3>
                <p className="text-xs text-slate-500">
                  Official register of students failing the 75% minimum university threshold. Requires Academic Council condonation or debarment from semester exams.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider bg-slate-50/70">
                      <th className="py-2.5 pl-3">Student Name</th>
                      <th className="py-2.5">Roll No</th>
                      <th className="py-2.5">Semester</th>
                      <th className="py-2.5">Classes Attended</th>
                      <th className="py-2.5">Attendance %</th>
                      <th className="py-2.5">Shortage Deficit</th>
                      <th className="py-2.5">Condonation Status</th>
                      <th className="py-2.5 pr-3 text-right">Council Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {shortageStudents.map((st) => {
                      const shortagePercent = 75 - st.attendanceRate;
                      return (
                        <tr key={st.id} className="hover:bg-slate-50/60">
                          <td className="py-3 pl-3 font-semibold text-slate-900">{st.name}</td>
                          <td className="py-3 font-mono text-slate-500">{st.studentId}</td>
                          <td className="py-3 text-slate-600">BCA Sem {st.semester}</td>
                          <td className="py-3 text-slate-700">{st.totalClassesAttended} / {st.totalClassesHeld}</td>
                          <td className="py-3 font-bold text-rose-600">{st.attendanceRate}%</td>
                          <td className="py-3 font-semibold text-amber-700">-{shortagePercent}%</td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                st.condonationStatus === 'Approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : st.condonationStatus === 'Debarred'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {st.condonationStatus || 'Pending Medical'}
                            </span>
                          </td>
                          <td className="py-3 pr-3 text-right space-x-1.5">
                            <button
                              onClick={() => updateCondonationStatus(st.id, 'Approved')}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-[11px] rounded-full cursor-pointer transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateCondonationStatus(st.id, 'Debarred')}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 font-semibold text-[11px] rounded-full cursor-pointer transition-colors"
                            >
                              Debar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUB-TAB: TRANSCRIPTS */}
          {reportSubTab === 'transcripts' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                    Multi-Semester Student Academic Transcript
                  </h3>
                  <p className="text-xs text-slate-500">
                    Comprehensive 6-semester academic record, internal evaluation marks, and mentor assessments.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500">Select Student:</span>
                  <select
                    value={transcriptStudentId}
                    onChange={(e) => setTranscriptStudentId(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full font-semibold text-slate-900 focus:outline-none"
                  >
                    {students.slice(0, 10).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (Roll: {s.studentId}) - Sem {s.semester}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Transcript Preview Card */}
              <div className="p-6 rounded-3xl border border-slate-200 bg-white space-y-6">
                <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="text-2xl font-bold text-slate-900 font-sans">{selectedTranscriptStudent.name}</h4>
                    <p className="text-xs text-slate-500">
                      Roll: {selectedTranscriptStudent.studentId} • Course: BCA • Current Semester: {selectedTranscriptStudent.semester}
                    </p>
                    <p className="text-xs text-slate-500">
                      Assigned Faculty Mentor: <strong className="text-slate-800">{selectedTranscriptStudent.assignedFaculty}</strong>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-slate-900 font-mono">CGPA: {selectedTranscriptStudent.cgpa}</span>
                    <span className="text-xs text-slate-500 block">Attendance: {selectedTranscriptStudent.attendanceRate}%</span>
                  </div>
                </div>

                {/* 6 Semester Progress Ledger */}
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Semester Performance History (Semesters 1 – 6)
                  </h5>
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                    {[1, 2, 3, 4, 5, 6].map((semNum) => {
                      const sgpa = selectedTranscriptStudent.sgpaHistory[semNum - 1] || 0;
                      return (
                        <div key={semNum} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase block">Sem {semNum}</span>
                          <span className="text-sm font-bold text-slate-900 font-mono">
                            {sgpa > 0 ? `${sgpa} SGPA` : 'In Progress'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Subject Internal Assessment Marks */}
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Current Semester Subject Internal Evaluations
                  </h5>
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px]">
                        <th className="pb-1.5">Code</th>
                        <th className="pb-1.5">Course Name</th>
                        <th className="pb-1.5">Internal Marks</th>
                        <th className="pb-1.5">Attendance</th>
                        <th className="pb-1.5 text-right">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedTranscriptStudent.subjectGrades.length > 0 ? (
                        selectedTranscriptStudent.subjectGrades.map((g) => (
                          <tr key={g.subjectCode}>
                            <td className="py-2 font-mono">{g.subjectCode}</td>
                            <td className="py-2 font-semibold text-slate-900">{g.subjectName}</td>
                            <td className="py-2">{g.internalObtained} / {g.internalMax}</td>
                            <td className="py-2">{g.attendancePercent}%</td>
                            <td className="py-2 text-right font-bold">{g.grade}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-3 text-slate-400 text-center">
                            Evaluation marks for enrolled semester currently in draft status.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB: AUDIT TRAIL */}
          {reportSubTab === 'audit' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Governance &amp; Audit Trail
              </h3>
              <p className="text-xs text-slate-500">
                Complete verifiable history of institutional mutations.
              </p>
              <div className="space-y-2">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-slate-900">{log.action}</div>
                      <div className="text-[10px] text-slate-400">By {log.actorName} ({log.actorRole}) • {log.createdAt}</div>
                    </div>
                    {log.afterJson && (
                      <span className="text-[10px] font-mono text-slate-600 bg-white px-2 py-1 rounded border border-slate-200 max-w-xs truncate">
                        {log.afterJson}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
