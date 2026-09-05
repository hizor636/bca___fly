import React, { useState } from 'react';
import { useDemoStore } from '../context/DemoContext';
import { Student, MentoringNote, CounselingReferral } from '../types';
import {
  X,
  Award,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Send,
  HeartHandshake,
  Lock,
  GraduationCap
} from 'lucide-react';

interface StudentDetailModalProps {
  student: Student;
  onClose: () => void;
  onUpdateStudent?: (updatedStudent: Student) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  onClose,
  onUpdateStudent,
}) => {
  const {
    counselingReferrals,
    createCounselingReferral,
    addMentoringSession,
    activeFaculty,
    getStudentSixSemesterRecord
  } = useDemoStore();

  const [activeTab, setActiveTab] = useState<'attendance' | 'six-semester' | 'mentoring' | 'grades' | 'counseling'>('six-semester');
  const [selectedSemFilter, setSelectedSemFilter] = useState<number | 'all'>('all');
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteTopic, setNoteTopic] = useState('');
  const [noteText, setNoteText] = useState('');
  const [noteActions, setNoteActions] = useState('');
  const [noteStatus, setNoteStatus] = useState<MentoringNote['status']>('Follow-up Required');
  const [alertSent, setAlertSent] = useState(false);

  // Counseling referral form state
  const [referReason, setReferReason] = useState<CounselingReferral['reasonCode']>('attendance_deficit');
  const [referRemarks, setReferRemarks] = useState('');
  const [referralFeedback, setReferralFeedback] = useState(false);

  const existingReferral = counselingReferrals?.find((r) => r.studentId === student.id);

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTopic || !noteText) return;

    addMentoringSession(student.id, {
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      topic: noteTopic,
      notes: noteText,
      actionItems: noteActions,
      status: noteStatus,
    });

    setNoteTopic('');
    setNoteText('');
    setNoteActions('');
    setShowAddNote(false);
  };

  const handleCreateReferral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!referRemarks.trim()) return;

    createCounselingReferral(student.id, referReason, referRemarks);
    setReferRemarks('');
    setReferralFeedback(true);
    setTimeout(() => setReferralFeedback(false), 3000);
  };

  const handleSendAttendanceAlert = () => {
    setAlertSent(true);
    setTimeout(() => setAlertSent(false), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="student-detail-modal"
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95"
      >
        {/* Header Bar */}
        <div className="bg-white px-6 py-5 border-b border-slate-100 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-900 text-base font-bold flex items-center justify-center">
              {student.initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900">{student.name}</h3>
                <span
                  className={`text-xs px-3 py-0.5 rounded-full font-medium ${
                    student.attendanceRate >= 75
                      ? 'bg-slate-900 text-white'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {student.attendanceRate}% Attendance
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                {student.course} • Semester {student.semester} • Roll: {student.studentId}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Metrics Ribbon */}
        <div className="grid grid-cols-4 border-b border-slate-100 bg-white text-center py-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Cumulative CGPA</span>
            <span className="font-bold text-slate-900 text-sm font-mono">{student.cgpa.toFixed(2)}</span>
          </div>
          <div className="border-l border-slate-100">
            <span className="text-slate-400 block text-[11px]">Status</span>
            <span className="font-semibold text-slate-900 text-xs">{student.mentoringStatus}</span>
          </div>
          <div className="border-l border-slate-100">
            <span className="text-slate-400 block text-[11px]">Assigned Mentor</span>
            <span className="font-medium text-slate-700 truncate block px-2 text-xs">
              {student.assignedFaculty}
            </span>
          </div>
          <div className="border-l border-slate-100">
            <span className="text-slate-400 block text-[11px]">Last Mentoring</span>
            <span className="font-medium text-slate-700 text-xs">
              {student.lastMentoringDate || 'None yet'}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 px-6 gap-6 text-sm font-medium overflow-x-auto">
          <button
            onClick={() => setActiveTab('six-semester')}
            className={`py-3 relative cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'six-semester'
                ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-slate-700" />
            <span>6-Semester Academic Record</span>
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`py-3 relative cursor-pointer whitespace-nowrap ${
              activeTab === 'attendance'
                ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Attendance &amp; Health
          </button>
          <button
            onClick={() => setActiveTab('mentoring')}
            className={`py-3 relative cursor-pointer whitespace-nowrap ${
              activeTab === 'mentoring'
                ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Mentoring Notes ({student.mentoringNotes.length})
          </button>
          <button
            onClick={() => setActiveTab('grades')}
            className={`py-3 relative cursor-pointer whitespace-nowrap ${
              activeTab === 'grades'
                ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Internal Grades
          </button>
          <button
            onClick={() => setActiveTab('counseling')}
            className={`py-3 relative cursor-pointer whitespace-nowrap ${
              activeTab === 'counseling'
                ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Counseling Referral {existingReferral ? '(Active)' : ''}
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-700 text-sm space-y-5">
          {/* TAB 1: Attendance */}
          {activeTab === 'attendance' && (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">6-Day Attendance Breakdown</h4>
                    <p className="text-xs text-slate-400">Weekly progression monitored by faculty</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-slate-900">{student.attendanceRate}%</span>
                    <span className="text-xs text-slate-400 block">
                      {student.totalClassesAttended} / {student.totalClassesHeld} Classes
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-6 gap-2 pt-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => {
                    const val = student.weeklyAttendance[idx] || student.attendanceRate;
                    return (
                      <div key={day} className="flex flex-col items-center bg-white p-2.5 rounded-xl border border-slate-100">
                        <span className="text-[11px] font-semibold text-slate-400">{day}</span>
                        <div className="w-full bg-slate-100 h-16 rounded-md my-1.5 flex flex-col justify-end p-0.5">
                          <div
                            className={`w-full rounded-xs transition-all ${
                              val >= 75 ? 'bg-slate-900' : 'bg-rose-500'
                            }`}
                            style={{ height: `${val}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-900">{val}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Attendance action notice */}
              <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-slate-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-slate-900 text-xs">University Attendance Threshold (75%)</h5>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {student.attendanceRate < 75
                        ? `Attendance is in deficit (${student.attendanceRate}%). Condonation Status: ${student.condonationStatus || 'Pending Review'}.`
                        : 'Attendance meets academic council threshold.'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleSendAttendanceAlert}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-full flex-shrink-0 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>{alertSent ? 'Notice Sent!' : 'Send Parent SMS'}</span>
                </button>
              </div>

              {/* Contact Information */}
              <div className="border border-slate-100 rounded-2xl p-4 bg-white">
                <h5 className="font-semibold text-xs text-slate-400 uppercase tracking-wider mb-2.5">
                  Direct Student Contact
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-900">{student.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-900">{student.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: 6-SEMESTER ACADEMIC RECORD */}
          {activeTab === 'six-semester' && (() => {
            const sixSemRecord = getStudentSixSemesterRecord(student.id);
            const displayedSemesters = selectedSemFilter === 'all'
              ? sixSemRecord.semesters
              : sixSemRecord.semesters.filter((s) => s.semester === selectedSemFilter);

            return (
              <div className="space-y-6">
                {/* Academic Profile Banner */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white">
                          {student.studentId}
                        </span>
                        <span className="text-xs font-semibold text-slate-700">
                          {student.course} • Current Semester {student.semester}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mt-1">
                        Comprehensive 6-Semester Academic Transcript
                      </h4>
                      <p className="text-xs text-slate-500">
                        Official university syllabus record tracking course-wise attendance, CIA internal marks, and SGPA progression across Sem 1 to Sem 6.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Cumulative CGPA</span>
                        <span className="text-xl font-bold text-slate-900 font-mono">{student.cgpa.toFixed(2)}</span>
                      </div>
                      <div className="text-right pl-3 border-l border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Overall Attendance</span>
                        <span className={`text-xl font-bold ${student.attendanceRate < 75 ? 'text-rose-600' : 'text-emerald-700'}`}>
                          {student.attendanceRate}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* SGPA Progression Tiles */}
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-2 border-t border-slate-200/60">
                    {sixSemRecord.semesters.map((sr) => (
                      <button
                        key={sr.semester}
                        onClick={() => setSelectedSemFilter(selectedSemFilter === sr.semester ? 'all' : sr.semester)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          selectedSemFilter === sr.semester
                            ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                            : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200'
                        }`}
                      >
                        <span className="text-[10px] font-bold uppercase block opacity-70">Sem {sr.semester}</span>
                        <span className="text-sm font-bold font-mono block mt-0.5">
                          {sr.sgpa ? sr.sgpa.toFixed(2) : '—'}
                        </span>
                        <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-full inline-block mt-1 ${
                          sr.status === 'completed'
                            ? (selectedSemFilter === sr.semester ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800')
                            : sr.status === 'active'
                            ? (selectedSemFilter === sr.semester ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-800')
                            : (selectedSemFilter === sr.semester ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-500')
                        }`}>
                          {sr.status === 'completed' ? 'Completed' : sr.status === 'active' ? 'Active' : 'Upcoming'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filter Controls */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">Filter Semester:</span>
                    <select
                      value={selectedSemFilter}
                      onChange={(e) => setSelectedSemFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                      className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-900 focus:outline-none cursor-pointer"
                    >
                      <option value="all">All Six Semesters (Sem 1 - Sem 6)</option>
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <option key={num} value={num}>Semester {num}</option>
                      ))}
                    </select>
                  </div>

                  <span className="text-xs text-slate-400">
                    Showing {displayedSemesters.length} semester record(s)
                  </span>
                </div>

                {/* Semester-by-Semester Course Lists */}
                <div className="space-y-4">
                  {displayedSemesters.map((sr) => {
                    const semTotalCredits = sr.courses.reduce((sum, c) => sum + c.course.credits, 0);
                    const semAvgAtt = sr.courses.length
                      ? Math.round(sr.courses.reduce((sum, c) => sum + c.attendancePercent, 0) / sr.courses.length)
                      : 0;

                    return (
                      <div key={sr.semester} className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                        <div className="bg-slate-100/80 px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs sm:text-sm text-slate-900">
                              Semester {sr.semester} • {sr.name}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              sr.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : sr.status === 'active'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}>
                              {sr.status === 'completed' ? 'Completed' : sr.status === 'active' ? 'Active Term' : 'Upcoming'}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
                            <span>Credits: <strong className="text-slate-900">{semTotalCredits}</strong></span>
                            <span>Term Attendance: <strong className={semAvgAtt < 75 ? 'text-rose-600' : 'text-slate-900'}>{semAvgAtt}%</strong></span>
                            <span>SGPA: <strong className="text-slate-900 font-mono">{sr.sgpa ? sr.sgpa.toFixed(2) : 'TBD'}</strong></span>
                          </div>
                        </div>

                        {/* Course Table */}
                        <table className="w-full text-left border-collapse text-xs">
                          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                            <tr>
                              <th className="py-2.5 pl-4">Course Code</th>
                              <th className="py-2.5">Course Name</th>
                              <th className="py-2.5">Type</th>
                              <th className="py-2.5">Credits</th>
                              <th className="py-2.5">Attendance</th>
                              <th className="py-2.5">CIA 1</th>
                              <th className="py-2.5">CIA 2</th>
                              <th className="py-2.5">Internal Total</th>
                              <th className="py-2.5 pr-4 text-right">Grade / Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {sr.courses.map((crs) => (
                              <tr key={crs.course.courseCode} className="hover:bg-slate-50/70">
                                <td className="py-2.5 pl-4 font-mono font-bold text-slate-900">{crs.course.courseCode}</td>
                                <td className="py-2.5 text-slate-800 font-medium">{crs.course.courseName}</td>
                                <td className="py-2.5">
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-600">
                                    {crs.course.courseType}
                                  </span>
                                </td>
                                <td className="py-2.5 text-slate-600">{crs.course.credits}</td>
                                <td className="py-2.5">
                                  <span className={`font-semibold ${crs.attendancePercent < 75 ? 'text-rose-600' : 'text-slate-800'}`}>
                                    {crs.attendancePercent}%
                                  </span>
                                </td>
                                <td className="py-2.5 font-mono text-slate-700">{crs.cia1 !== null ? `${crs.cia1} / 25` : '—'}</td>
                                <td className="py-2.5 font-mono text-slate-700">{crs.cia2 !== null ? `${crs.cia2} / 25` : '—'}</td>
                                <td className="py-2.5 font-mono font-bold text-slate-900">{crs.internal !== null ? `${crs.internal} / 50` : '—'}</td>
                                <td className="py-2.5 pr-4 text-right">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    crs.grade === 'A+' ? 'bg-emerald-100 text-emerald-800' :
                                    crs.grade === 'A' ? 'bg-blue-100 text-blue-800' :
                                    crs.grade === 'B+' ? 'bg-indigo-100 text-indigo-800' :
                                    crs.grade === 'At Risk' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-800'
                                  }`}>
                                    {crs.grade} ({crs.status})
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* TAB 2: Mentoring Notes */}
          {activeTab === 'mentoring' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-slate-900 text-sm">Faculty Mentoring Record</h4>
                <button
                  onClick={() => setShowAddNote(!showAddNote)}
                  className="text-xs px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-full flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Mentoring Session</span>
                </button>
              </div>

              {/* Form to log new mentoring note */}
              {showAddNote && (
                <form onSubmit={handleSaveNote} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                  <h5 className="font-bold text-xs text-slate-900">New Mentoring Discussion Entry</h5>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Session Topic</label>
                    <input
                      type="text"
                      placeholder="e.g. Mid-term exam preparation, lab backlog, career advice"
                      value={noteTopic}
                      onChange={(e) => setNoteTopic(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Faculty Observations</label>
                    <textarea
                      rows={3}
                      placeholder="Key challenges discussed, student response, faculty counsel..."
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Action Items Assigned</label>
                    <input
                      type="text"
                      placeholder="e.g. Submit assignment 2 by Friday, meet TA for tutorial"
                      value={noteActions}
                      onChange={(e) => setNoteActions(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500 font-medium">Status:</span>
                      <select
                        value={noteStatus}
                        onChange={(e) => setNoteStatus(e.target.value as any)}
                        className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white"
                      >
                        <option value="Follow-up Required">Follow-up Required</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Open">Open</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddNote(false)}
                        className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-full cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 text-xs bg-slate-900 text-white font-medium rounded-full hover:bg-slate-800 cursor-pointer"
                      >
                        Save Entry
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Mentoring Notes History List */}
              {student.mentoringNotes.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">No mentoring notes recorded for this student yet.</p>
                  <button
                    onClick={() => setShowAddNote(true)}
                    className="mt-2 text-xs text-slate-900 font-semibold hover:underline cursor-pointer"
                  >
                    + Record first mentoring session
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {student.mentoringNotes.map((note) => (
                    <div key={note.id} className="p-4 rounded-xl border border-slate-100 bg-white hover:border-slate-300 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h5 className="font-semibold text-slate-900 text-xs sm:text-sm">{note.topic}</h5>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {note.date} • Recorded by {note.facultyName}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {note.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">{note.notes}</p>
                      {note.actionItems && (
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-800 bg-slate-50 px-3 py-1.5 rounded-lg">
                          <CheckCircle2 className="w-3.5 h-3.5 text-slate-700 flex-shrink-0" />
                          <span className="text-[11px] font-medium">Action: {note.actionItems}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Internal Grades */}
          {activeTab === 'grades' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Continuous Internal Assessment (CIA)</h4>
                  <p className="text-xs text-slate-400">Mid-semester 30-mark scale entries</p>
                </div>
                <span className="text-xs font-medium px-3 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200/60">
                  Passing Mark: 15/30
                </span>
              </div>

              {student.subjectGrades.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Award className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Grade records will appear once submitted in the Academic Tracking portal.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {student.subjectGrades.map((sub) => (
                    <div key={sub.subjectCode} className="p-3.5 bg-white border border-slate-100 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-slate-900 uppercase">{sub.subjectCode}</span>
                        <h5 className="text-xs sm:text-sm font-semibold text-slate-900">{sub.subjectName}</h5>
                        <span className="text-[11px] text-slate-400">Class Attendance: {sub.attendancePercent}%</span>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-bold text-slate-900 font-mono">
                          {sub.internalObtained} <span className="text-xs text-slate-400 font-normal">/ {sub.internalMax}</span>
                        </span>
                        <div className="flex items-center justify-end gap-1.5 mt-0.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-800 rounded-full">
                            Grade {sub.grade}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">{sub.status}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Counseling Referral */}
          {activeTab === 'counseling' && (
            <div className="space-y-4">
              {existingReferral ? (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900 text-sm">Active Counseling Referral</span>
                      <span className="px-3 py-1 bg-slate-900 text-white font-bold rounded-full text-xs">
                        {existingReferral.mentorVisibleStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-slate-600">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Reason Code:</span>
                        <strong className="text-slate-800 uppercase">{existingReferral.reasonCode.replace('_', ' ')}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Referred On:</span>
                        <strong className="text-slate-800">{existingReferral.createdAt}</strong>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-slate-400 block text-[10px] uppercase mb-1">Your Referral Remarks:</span>
                      <p className="text-slate-700 italic">"{existingReferral.facultyRemarks}"</p>
                    </div>
                  </div>

                  {/* Confidentiality notice */}
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
                    <Lock className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-semibold">Counselor Privacy Protected</strong>
                      <span>
                        Clinical session observations and psychotherapeutic notes entered by Dr. Priya Sharma are confidential and withheld from faculty records. The mentor is notified of progression status only.
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreateReferral} className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">Refer Student to Counseling Cell</h4>
                    <p className="text-xs text-slate-500">
                      If {student.name} is experiencing severe academic stress, chronic absenteeism, or personal challenges, submit a confidential referral to Dr. Priya Sharma.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Reason for Referral
                    </label>
                    <select
                      value={referReason}
                      onChange={(e) => setReferReason(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    >
                      <option value="attendance_deficit">Chronic Attendance Deficit (&lt;75%)</option>
                      <option value="academic_stress">Academic Stress / Examination Anxiety</option>
                      <option value="personal_concern">Personal / Family Concerns</option>
                      <option value="career_anxiety">Career &amp; Placement Anxiety</option>
                      <option value="behavioural">Classroom Disengagement / Behavioral</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Faculty Remarks &amp; Context
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Detail specific observations, missed classes, or conversation highlights..."
                      value={referRemarks}
                      onChange={(e) => setReferRemarks(e.target.value)}
                      required
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-full transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <HeartHandshake className="w-3.5 h-3.5" />
                      <span>Submit Counseling Referral</span>
                    </button>
                  </div>

                  {referralFeedback && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 rounded-2xl text-xs flex items-center gap-2 border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Referral submitted to Counselor Dr. Priya Sharma and logged to audit trail.</span>
                    </div>
                  )}
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-400">Academic Year 2026–2027 • BCA Department</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white font-medium rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
