import React, { useState } from 'react';
import { useDemoStore } from '../context/DemoContext';
import { DashboardRibbon } from './DashboardRibbon';
import { Student, DepartmentNotice } from '../types';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertTriangle,
  Send,
  Bell,
  Sparkles,
  Plus,
  Trash2,
  ShieldCheck,
  Check
} from 'lucide-react';

interface SmartWorkspaceViewProps {
  students: Student[];
  notices: DepartmentNotice[];
  onOpenNotice: () => void;
  onSelectStudent: (student: Student) => void;
  onNavigateHome: () => void;
  onOpenAudit?: () => void;
  onOpenReports?: () => void;
}

interface QuickTask {
  id: string;
  text: string;
  due: string;
  priority: 'urgent' | 'normal' | 'low';
  completed: boolean;
}

export const SmartWorkspaceView: React.FC<SmartWorkspaceViewProps> = ({
  students,
  notices,
  onOpenNotice,
  onSelectStudent,
  onNavigateHome,
  onOpenAudit,
  onOpenReports,
}) => {
  const {
    activeFaculty,
    workingDays,
    attendanceSettings,
    classes,
    markAndFinalizeAttendance
  } = useDemoStore();

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || 'cls-bca-501');
  const selectedClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const classSemNum = selectedClass ? (parseInt(selectedClass.semesterId.replace('sem-', ''), 10) || 5) : 5;

  // Scoped students for roll-call: filter by active faculty's assigned students enrolled in this class's semester
  const classStudents = students.filter(
    (s) => s.semester === classSemNum && (s.assignedFacultyId === activeFaculty.id || s.assignedFaculty === activeFaculty.name)
  ).slice(0, 12);

  // Fallback to top students if active faculty has fewer mentees in this specific class semester
  const displayStudents = classStudents.length > 0 ? classStudents : students.slice(0, 8);

  const [attendanceSheet, setAttendanceSheet] = useState<Record<string, 'present' | 'absent' | 'late'>>(() => {
    const init: Record<string, 'present' | 'absent' | 'late'> = {};
    displayStudents.forEach((s) => {
      init[s.id] = s.attendanceRate < 75 ? 'absent' : 'present';
    });
    return init;
  });

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [finalizeResult, setFinalizeResult] = useState<{ success: boolean; smsCount: number; message: string } | null>(null);

  // Todo tasks
  const [tasks, setTasks] = useState<QuickTask[]>([
    {
      id: 't-1',
      text: 'Submit Mid-Semester Internal Assessment scores for BCA Sem 5',
      due: 'Friday, 5:00 PM',
      priority: 'urgent',
      completed: false,
    },
    {
      id: 't-2',
      text: 'Conduct 1-on-1 mentoring review with assigned mentees regarding lab backlog',
      due: 'Tomorrow, 2:30 PM',
      priority: 'urgent',
      completed: false,
    },
    {
      id: 't-3',
      text: 'Verify Capstone project phase-1 architecture diagram',
      due: 'Oct 12',
      priority: 'normal',
      completed: true,
    }
  ]);

  const [newTaskInput, setNewTaskInput] = useState('');

  const todayStr = '2026-09-04';
  const todayEntry = workingDays?.find((wd) => wd.date === todayStr);
  const isWorking = todayEntry ? todayEntry.isWorking : true;

  const handleToggleTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    setTasks([
      {
        id: `t-${Date.now()}`,
        text: newTaskInput.trim(),
        due: 'Today',
        priority: 'normal',
        completed: false,
      },
      ...tasks,
    ]);
    setNewTaskInput('');
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const setStudentStatus = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendanceSheet((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAllPresent = () => {
    const updated: Record<string, 'present' | 'absent' | 'late'> = {};
    displayStudents.forEach((s) => {
      updated[s.id] = 'present';
    });
    setAttendanceSheet(updated);
  };

  const handleFinalizeAttendance = () => {
    const records = displayStudents.map((s) => ({
      studentId: s.id,
      status: attendanceSheet[s.id] || 'present'
    }));

    const res = markAndFinalizeAttendance(selectedClassId, records);
    setFinalizeResult(res);
    setShowConfirmModal(false);

    setTimeout(() => {
      setFinalizeResult(null);
    }, 6000);
  };

  const presentCount = Object.values(attendanceSheet).filter((st) => st === 'present').length;
  const absentCount = Object.values(attendanceSheet).filter((st) => st === 'absent').length;
  const lateCount = Object.values(attendanceSheet).filter((st) => st === 'late').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-in fade-in duration-150">
      {/* Dashboard Utility Ribbon with Demo Mode, Faculty, 6-Sem Reports, Audit Trail */}
      <DashboardRibbon
        onOpenAudit={onOpenAudit || (() => {})}
        onOpenReports={onOpenReports || (() => {})}
      />

      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
            <button onClick={onNavigateHome} className="hover:text-slate-700 transition-colors cursor-pointer">
              Home
            </button>
            <span>/</span>
            <span className="text-slate-900 font-medium">Faculty Workspace</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Smart Faculty Workspace
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Logged in as <strong className="text-slate-800">{activeFaculty.name}</strong> • Access strictly scoped to assigned students.
          </p>
        </div>

        {/* Working Day & Cutoff Live Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium">
            <span className={`w-2 h-2 rounded-full ${isWorking ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <span className="text-slate-700 font-semibold">{isWorking ? 'Working Day Active' : 'Holiday / Weekend'}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Cutoff: {attendanceSettings.dailyCutoffTime}</span>
          </div>
        </div>
      </div>

      {finalizeResult && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-xs text-emerald-900 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm">Attendance Finalized &amp; Logged</h4>
            <p className="text-emerald-800 leading-relaxed font-sans">{finalizeResult.message}</p>
          </div>
        </div>
      )}

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Roll-Call Logger & Schedule (7 Cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Quick Roll-Call Logger with Working-Day Rule */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-900" />
                  <h3 className="text-base font-bold text-slate-900">
                    Roll-Call &amp; Automated SMS Dispatch
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Finalization updates student attendance records and triggers simulated parent/student SMS.
                </p>
              </div>

              {/* Course Selector */}
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs font-semibold text-slate-900 focus:outline-none"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.courseCode} ({c.subjectName})
                  </option>
                ))}
              </select>
            </div>

            {/* Status counts & Bulk Action */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-3">
                <span className="text-slate-600">
                  Present: <strong className="text-emerald-700 font-bold">{presentCount}</strong>
                </span>
                <span className="text-slate-600">
                  Absent: <strong className="text-rose-600 font-bold">{absentCount}</strong>
                </span>
                <span className="text-slate-600">
                  Late: <strong className="text-amber-700 font-bold">{lateCount}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={markAllPresent}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-full transition-colors cursor-pointer"
                >
                  Mark All Present
                </button>
                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-full transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3 h-3" />
                  <span>Finalize Attendance</span>
                </button>
              </div>
            </div>

            {/* Students List in Session */}
            <div className="space-y-2">
              {displayStudents.map((st) => {
                const status = attendanceSheet[st.id] || 'present';
                return (
                  <div
                    key={st.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center">
                        {st.initials}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{st.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Roll: {st.studentId} • Current Rate: {st.attendanceRate}%
                        </div>
                      </div>
                    </div>

                    {/* Status Pill Toggle */}
                    <div className="flex items-center bg-white border border-slate-200 rounded-full p-0.5">
                      <button
                        onClick={() => setStudentStatus(st.id, 'present')}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                          status === 'present'
                            ? 'bg-emerald-600 text-white'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Present
                      </button>
                      <button
                        onClick={() => setStudentStatus(st.id, 'late')}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                          status === 'late'
                            ? 'bg-amber-500 text-white'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Late
                      </button>
                      <button
                        onClick={() => setStudentStatus(st.id, 'absent')}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                          status === 'absent'
                            ? 'bg-rose-600 text-white'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Absent
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Today's Academic Schedule */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-900" />
                <h3 className="text-base font-bold text-slate-900">Today's Academic Schedule</h3>
              </div>
              <span className="text-xs text-slate-400">3 Sessions Assigned</span>
            </div>

            <div className="space-y-2.5">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">10:00 AM • BCA-501 Enterprise Web Architecture</span>
                  <span className="text-slate-500 text-[11px]">Lecture Hall 3 • 42 Mentees Enrolled</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-800">
                  Active
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">02:00 PM • 1-on-1 Mentoring Consultation</span>
                  <span className="text-slate-500 text-[11px]">Faculty Office 304 • Marcus Thorne scheduled</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                  Upcoming
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Priorities, Notices, Tasks (5 Cols) */}
        <div className="lg:col-span-5 space-y-8">
          {/* Department Circulars */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-slate-900" />
                <h3 className="text-base font-bold text-slate-900">Department Circulars</h3>
              </div>
              <button
                onClick={onOpenNotice}
                className="text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
              >
                View Details →
              </button>
            </div>

            <div className="space-y-2.5">
              {notices.map((n) => (
                <div
                  key={n.id}
                  onClick={onOpenNotice}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-100 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{n.title}</span>
                    {n.isNew && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white px-2 py-0.5 rounded-full">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-[11px] line-clamp-2">{n.subtitle}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Action Tasks */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Faculty Priority Tasks</h3>

            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs gap-2"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <button
                      onClick={() => handleToggleTask(task.id)}
                      className={`w-4 h-4 rounded-md border flex items-center justify-center cursor-pointer transition-colors ${
                        task.completed
                          ? 'bg-slate-900 border-slate-900 text-white'
                          : 'border-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {task.completed && <Check className="w-3 h-3" />}
                    </button>
                    <span
                      className={`truncate ${
                        task.completed ? 'line-through text-slate-400' : 'text-slate-800 font-medium'
                      }`}
                    >
                      {task.text}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddTask} className="pt-2 flex gap-2">
              <input
                type="text"
                placeholder="Add urgent faculty action..."
                value={newTaskInput}
                onChange={(e) => setNewTaskInput(e.target.value)}
                className="flex-1 px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
              />
              <button
                type="submit"
                className="p-2 bg-slate-900 text-white rounded-full hover:bg-slate-800 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Attendance Finalization */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-900">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Finalize Class Attendance?</h3>
                <p className="text-xs text-slate-400">{selectedClass.courseCode} • {selectedClass.subjectName}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              You are recording <strong>{presentCount} present</strong>, <strong>{absentCount} absent</strong>, and <strong>{lateCount} late</strong> students.
            </p>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Working Day Status:</span>
                <span className="font-semibold text-slate-900">{isWorking ? 'Verified Working Day' : 'Non-working / Suppressed'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Automated SMS Trigger:</span>
                <span className="font-semibold text-slate-900">
                  {isWorking && attendanceSettings.autoSmsOnFinalize
                    ? `${absentCount * 2} SMS messages (Student & Parent)`
                    : 'Suppressed per calendar policy'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Audit Trail:</span>
                <span className="font-semibold text-emerald-700">SHA-256 Ledger Entry</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2 text-xs font-semibold rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleFinalizeAttendance}
                className="flex-1 py-2 text-xs font-semibold rounded-full bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
              >
                Confirm &amp; Finalize
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
