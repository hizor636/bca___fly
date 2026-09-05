import React, { useState } from 'react';
import { useDemoStore } from '../context/DemoContext';
import { BcaFlyLogo } from './BcaFlyLogo';
import {
  AlertTriangle,
  Mail,
  Phone,
  Building,
  Target,
  MessageSquare,
  LogOut
} from 'lucide-react';

interface StudentPortalViewProps {
  onNavigateHome?: () => void;
  onLogout?: () => void;
  onNavigatePublic?: () => void;
}

export const StudentPortalView: React.FC<StudentPortalViewProps> = ({
  onNavigateHome,
  onLogout,
  onNavigatePublic
}) => {
  const { currentUser, students, smsMessages, facultyList, switchRole, logout } = useDemoStore();

  // Active student matching current user
  const student = students.find((s) => s.id === currentUser.id) || students[0];
  const assignedMentor = facultyList.find((f) => f.id === student.assignedFacultyId || f.name === student.assignedFaculty) || facultyList[0];

  // SMS messages sent to this student or their parent
  const mySms = smsMessages.filter(
    (m) => m.studentId === student.id || m.recipientPhone === student.phone || m.recipientPhone === student.parentPhone
  );

  const isShortage = student.attendanceRate < 75;

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
              <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Student Portal
              </span>
              <span className="text-xs text-slate-400">Authenticated Student Account</span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Strict Academic Isolation • Private Academic Ledger
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onNavigatePublic && (
            <button
              onClick={onNavigatePublic}
              className="text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3.5 py-1.5 rounded-full transition-colors cursor-pointer"
            >
              Public Site
            </button>
          )}

          {/* Persona Switcher for Evaluators */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-full text-xs text-slate-300">
            <span className="text-[10px] uppercase font-bold text-slate-500 px-2">Role:</span>
            <button
              onClick={() => switchRole('faculty')}
              className="px-2 py-0.5 rounded-full hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
              title="Switch to Faculty Persona"
            >
              Faculty
            </button>
            <button
              onClick={() => switchRole('admin')}
              className="px-2 py-0.5 rounded-full hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
              title="Switch to Admin Persona"
            >
              Admin
            </button>
            <button
              onClick={() => switchRole('counselor')}
              className="px-2 py-0.5 rounded-full hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
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
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/60 hover:bg-rose-900 border border-rose-800/40 px-3.5 py-1.5 rounded-full transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Student Welcome Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xl">
            {student.initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Student Portal</span>
              <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                Semester {student.semester}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-0.5">
              {student.name}
            </h1>
            <p className="text-xs text-slate-500">
              Roll No: {student.studentId} • Section {student.section} • Bachelor of Computer Applications
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Overall Attendance</span>
            <div className={`text-2xl font-bold ${isShortage ? 'text-rose-600' : 'text-slate-900'}`}>
              {student.attendanceRate}%
            </div>
            <span className="text-[10px] text-slate-500">
              {student.totalClassesAttended} / {student.totalClassesHeld} Classes
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Cumulative CGPA</span>
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {student.cgpa}
            </div>
            <span className="text-[10px] text-slate-500">{student.mentoringStatus}</span>
          </div>
        </div>
      </div>

      {/* Shortage Warning Banner if < 75% */}
      {isShortage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-900">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm">Attendance Warning: Criteria Deficit ({student.attendanceRate}%)</h4>
            <p className="text-rose-800 leading-relaxed">
              Your overall attendance has fallen below the mandatory 75% threshold required for end-semester university examinations.
              Condonation Status: <strong>{student.condonationStatus || 'Pending Medical Verification'}</strong>. Please schedule an immediate meeting with your mentor <strong>{assignedMentor.name}</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Main Grid: Attendance & Mentor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Attendance Breakdown & Recent SMS */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weekly Attendance Heatmap / Bar */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  Recent 6-Day Attendance Record
                </h3>
                <p className="text-xs text-slate-500">
                  Daily participation trend across practical labs and theory lectures.
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Verified by Faculty
              </span>
            </div>

            <div className="grid grid-cols-6 gap-2">
              {student.weeklyAttendance.map((rate, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <span className="text-[10px] font-semibold text-slate-400 block mb-1">Day {idx + 1}</span>
                  <div className={`text-base font-bold ${rate < 75 ? 'text-rose-600' : 'text-slate-900'}`}>
                    {rate}%
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full ${rate < 75 ? 'bg-rose-500' : 'bg-slate-900'}`}
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subject-Wise Attendance & Internal Grades */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Enrolled Courses &amp; Continuous Internal Evaluation
            </h3>
            <div className="space-y-3">
              {student.subjectGrades.length > 0 ? (
                student.subjectGrades.map((g) => (
                  <div
                    key={g.subjectCode}
                    className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono text-[10px] text-slate-400 block">{g.subjectCode}</span>
                      <span className="font-bold text-slate-900 text-sm">{g.subjectName}</span>
                      <span className="text-slate-500 block text-[11px]">
                        Internal Assessment: {g.internalObtained} / {g.internalMax} • Status: {g.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-900 block">{g.attendancePercent}% Att.</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-800">
                        Grade {g.grade}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-400 text-xs">
                  Continuous internal marks for semester {student.semester} are currently being finalized by course instructors.
                </div>
              )}
            </div>
          </div>

          {/* Simulated SMS Messages Received Inbox */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-900" />
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  Simulated SMS Notifications Feed
                </h3>
              </div>
              <span className="text-xs text-slate-400">Delivered via BcaFly Gateway</span>
            </div>

            <div className="space-y-2">
              {mySms.length > 0 ? (
                mySms.map((sms) => (
                  <div
                    key={sms.id}
                    className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">
                        To: {sms.recipientType} ({sms.recipientPhone})
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{sms.sentAt}</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed font-sans">{sms.body}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                      <span>Ref: {sms.idempotencyKey}</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-semibold">DELIVERED (SIMULATED)</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No absence or warning alerts dispatched to your registered phone numbers.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Mentor Info & Agreed Goals */}
        <div className="space-y-6">
          {/* Assigned Mentor Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Assigned Faculty Mentor
            </h3>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-900 flex items-center justify-center font-bold text-base">
                {assignedMentor.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{assignedMentor.name}</h4>
                <p className="text-[11px] text-slate-400">{assignedMentor.designation}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>{assignedMentor.office}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{assignedMentor.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{assignedMentor.phone || '+1 (555) 900-1122'}</span>
              </div>
            </div>

            <button
              onClick={() => alert(`Direct email drafted to ${assignedMentor.email}`)}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-full transition-all cursor-pointer"
            >
              Contact Mentor
            </button>
          </div>

          {/* Agreed Mentoring Goals & Notes */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-slate-900" />
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Mentoring Goals &amp; Action Items
              </h3>
            </div>

            {student.mentoringNotes.length > 0 ? (
              student.mentoringNotes.map((note) => (
                <div key={note.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{note.topic}</span>
                    <span className="text-[10px] text-slate-400">{note.date}</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">{note.notes}</p>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/70">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                      Action Items:
                    </span>
                    <span className="text-slate-800 font-medium text-[11px]">{note.actionItems}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                    <span>Mentor: {note.facultyName}</span>
                    <span className="font-semibold text-slate-700 bg-slate-200/70 px-2 py-0.5 rounded-full">
                      {note.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-slate-400 text-xs">
                No formal 1-on-1 mentoring notes logged for this session cycle.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
