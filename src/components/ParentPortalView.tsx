import React, { useState } from 'react';
import { useDemoStore } from '../context/DemoContext';
import { Student } from '../types';
import { BcaFlyLogo } from './BcaFlyLogo';
import {
  AlertTriangle,
  Mail,
  Phone,
  Building,
  CheckCircle2,
  Calendar,
  Clock,
  BookOpen,
  Award,
  Bell,
  LogOut,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

interface ParentPortalViewProps {
  onNavigateHome?: () => void;
  onLogout?: () => void;
  onNavigatePublic?: () => void;
}

export const ParentPortalView: React.FC<ParentPortalViewProps> = ({
  onLogout,
  onNavigatePublic
}) => {
  const { currentUser, students, facultyList, smsMessages, timetables, courses, logout } = useDemoStore();
  const [activeTab, setActiveTab] = useState<'attendance' | 'marks' | 'schedule' | 'notices'>('attendance');

  const fallbackStudent: Student = {
    id: currentUser?.studentId || 'std-ward',
    studentId: currentUser?.studentId || 'N/A',
    name: 'Ward Account',
    email: 'ward@bcafly.edu',
    phone: 'N/A',
    parentPhone: 'N/A',
    course: 'BCA',
    semester: 1,
    section: 'A',
    assignedFaculty: 'Not Assigned',
    assignedFacultyId: '',
    attendanceRate: 0,
    cgpa: 0.0,
    sgpaHistory: [0, 0, 0, 0, 0, 0],
    initials: 'WD',
    mentoringStatus: 'Regular',
    mentoringNotes: [],
    totalClassesAttended: 0,
    totalClassesHeld: 0,
    weeklyAttendance: [0, 0, 0, 0, 0, 0],
    subjectGrades: []
  };

  // Match student linked to parent (default to first student or fallback)
  const student = students.find((s) => s.id === currentUser?.studentId || s.studentId === currentUser?.studentId) || students[0] || fallbackStudent;
  const assignedMentor = facultyList.find((f) => f.id === student.assignedFacultyId || f.name === student.assignedFaculty) || facultyList[0] || null;

  // SMS alerts dispatched to parent's phone or ward
  const parentSms = smsMessages.filter(
    (m) => m.studentId === student.id || m.recipientPhone === student.parentPhone
  );

  const isShortage = student.attendanceRate < 75;
  const studentCourses = courses.filter((c) => c.semester === student.semester);
  const studentTimetable = timetables.filter((t) => t.semester === student.semester);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-in fade-in duration-150">
      {/* Institutional Top Bar */}
      <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-2xl">
            <BcaFlyLogo />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-amber-500/30">
                Parent / Guardian Portal
              </span>
              <span className="text-xs text-slate-400">Authenticated Guardian Account</span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Ward: <strong className="text-white font-semibold">{student.name}</strong> (Roll No: {student.studentId})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              logout();
              if (onLogout) onLogout();
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/60 hover:bg-rose-900 border border-rose-800/40 px-3.5 py-1.5 rounded-full transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Ward Status Overview Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center font-bold text-xl">
            {student.initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Student Status</span>
              <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                Semester {student.semester} - Section {student.section}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-0.5">
              {student.name}
            </h1>
            <p className="text-xs text-slate-500">
              Department of Computer Applications • Batch 2024–2027
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Attendance Rate</span>
            <div className={`text-2xl font-bold ${isShortage ? 'text-rose-600' : 'text-emerald-700'}`}>
              {student.attendanceRate}%
            </div>
            <span className="text-[10px] text-slate-500">
              {student.totalClassesAttended} / {student.totalClassesHeld} Lectures
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Academic Standing</span>
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {student.cgpa}
            </div>
            <span className="text-[10px] text-slate-500">{student.mentoringStatus}</span>
          </div>
        </div>
      </div>

      {/* Shortage Warning If Applicable */}
      {isShortage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-900">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm">Action Required: Attendance Shortage ({student.attendanceRate}%)</h4>
            <p className="text-rose-800 leading-relaxed">
              University regulations require a minimum 75% attendance to qualify for End-Semester examinations.
              Condonation Status: <strong>{student.condonationStatus || 'Pending Medical Certificate'}</strong>. Please connect with the appointed faculty mentor.
            </p>
          </div>
        </div>
      )}

      {/* Nav Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'attendance'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100'
          }`}
        >
          Attendance Breakdown
        </button>
        <button
          onClick={() => setActiveTab('marks')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'marks'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100'
          }`}
        >
          Internal Marks &amp; CIA
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'schedule'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100'
          }`}
        >
          Weekly Timetable
        </button>
        <button
          onClick={() => setActiveTab('notices')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'notices'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100'
          }`}
        >
          Dispatched SMS &amp; Notices
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'attendance' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900">Enrolled Subjects Attendance</h3>
              <div className="space-y-3">
                {studentCourses.length === 0 ? (
                  <div className="py-6 text-center bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-400">
                    No active course enrollments found for Semester {student.semester}.
                  </div>
                ) : (
                  studentCourses.map((c) => (
                    <div key={c.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono text-[10px] text-slate-400 block">{c.courseCode}</span>
                        <span className="font-bold text-slate-900 text-sm">{c.courseName}</span>
                        <span className="text-slate-500 block text-[11px]">{c.courseType} • {c.credits} Credits</span>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-bold text-slate-900 block">{student.attendanceRate}%</span>
                        <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                          Regular
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900">Assigned Faculty Mentor</h3>
              {assignedMentor ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-900 flex items-center justify-center font-bold text-base">
                      {assignedMentor.name?.slice(0, 2).toUpperCase() || 'FA'}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{assignedMentor.name}</h4>
                      <p className="text-[11px] text-slate-400">{assignedMentor.designation}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span>{assignedMentor.office || 'Faculty Department'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{assignedMentor.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{assignedMentor.phone || '—'}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-6 text-center bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-400">
                  No records yet. No mentor assigned yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'marks' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">Continuous Internal Assessment (CIA) Results</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Subject Code</th>
                  <th className="py-3 px-3">Subject Name</th>
                  <th className="py-3 px-3 text-center">CIA 1 (20)</th>
                  <th className="py-3 px-3 text-center">CIA 2 (20)</th>
                  <th className="py-3 px-3 text-center">Assignments (10)</th>
                  <th className="py-3 px-3 text-center">Internal Total (50)</th>
                  <th className="py-3 px-3 text-center">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentCourses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 font-medium text-xs">
                      No records yet. Enrolled course internal marks will appear here.
                    </td>
                  </tr>
                ) : (
                  studentCourses.map((c) => {
                    const gradeInfo = student.subjectGrades?.find(
                      (g) => g.subjectCode === c.courseCode || g.subjectName === c.courseName
                    );
                    const obtained = gradeInfo?.internalObtained ?? 0;
                    const max = gradeInfo?.internalMax ?? 50;
                    const cia1 = gradeInfo ? Math.round((obtained / max) * 20) : 0;
                    const cia2 = gradeInfo ? Math.round((obtained / max) * 20) : 0;
                    const assign = gradeInfo ? Math.round((obtained / max) * 10) : 0;
                    const total = gradeInfo ? obtained : 0;
                    const grade = gradeInfo?.grade || '—';

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-3 font-mono font-semibold text-slate-700">{c.courseCode}</td>
                        <td className="py-3 px-3 font-medium text-slate-900">{c.courseName}</td>
                        <td className="py-3 px-3 text-center font-mono">{gradeInfo ? cia1 : '—'}</td>
                        <td className="py-3 px-3 text-center font-mono">{gradeInfo ? cia2 : '—'}</td>
                        <td className="py-3 px-3 text-center font-mono">{gradeInfo ? assign : '—'}</td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">{gradeInfo ? total : '—'}</td>
                        <td className="py-3 px-3 text-center">
                          <span className="bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded text-[10px]">
                            {grade}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">Weekly Lecture &amp; Lab Timetable</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {studentTimetable.length === 0 ? (
              <div className="col-span-full p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-400">
                No records yet. Timetable will appear when scheduled.
              </div>
            ) : (
              studentTimetable.map((slot) => (
                <div key={slot.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{slot.dayOfWeek}</span>
                    <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                      {slot.startTime} - {slot.endTime}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-800">{slot.subjectName}</div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                    <span>{slot.facultyName}</span>
                    <span>{slot.roomNo}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'notices' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">SMS Gateway Dispatch History</h3>
          <div className="space-y-3">
            {parentSms.length > 0 ? (
              parentSms.map((sms) => (
                <div key={sms.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">SMS Alert to {sms.recipientPhone}</span>
                    <span className="text-[10px] font-mono text-slate-400">{sms.sentAt}</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{sms.body}</p>
                  <div className="flex items-center gap-2 text-[10px] text-emerald-700 font-semibold font-mono pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>STATUS: DELIVERED TO CARRIER</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                No records yet. No shortage alerts or absence notices have been dispatched to your mobile number.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
