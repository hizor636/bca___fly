import React, { useState } from 'react';
import { useDemoStore } from '../context/DemoContext';
import { Student } from '../types';
import { getAssignedMentor, findStudentForLogin } from '../lib/demoAccess';
import { BcaFlyLogo } from './BcaFlyLogo';
import {
  AlertTriangle,
  Mail,
  Phone,
  Building,
  Target,
  MessageSquare,
  LogOut,
  Calendar,
  Clock,
  BookOpen,
  Award,
  FileText,
  Upload,
  Download,
  Plus,
  CheckCircle2,
  HelpCircle,
  Lock,
  Send,
  UserCheck,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

interface StudentPortalViewProps {
  onNavigateHome?: () => void;
  onLogout?: () => void;
  onNavigatePublic?: () => void;
}

export const StudentPortalView: React.FC<StudentPortalViewProps> = ({
  onLogout,
  onNavigatePublic
}) => {
  const {
    currentUser,
    students,
    facultyList,
    smsMessages,
    courses,
    timetables,
    documents,
    uploadDocument,
    correctionRequests,
    submitCorrectionRequest,
    createCounselingReferral,
    logout
  } = useDemoStore();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'attendance' | 'marks' | 'timetable' | 'courses' | 'documents' | 'requests' | 'notices' | 'support'
  >('overview');

  const fallbackStudent: Student = {
    id: currentUser?.id || 'std-guest',
    studentId: currentUser?.studentId || 'N/A',
    name: currentUser?.name || 'Student Account',
    email: currentUser?.email || 'student@bcafly.edu',
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
    initials: 'ST',
    mentoringStatus: 'Regular',
    mentoringNotes: [],
    totalClassesAttended: 0,
    totalClassesHeld: 0,
    weeklyAttendance: [0, 0, 0, 0, 0, 0],
    subjectGrades: []
  };

  // Match student with currentUser
  const student = findStudentForLogin(students, currentUser?.id, currentUser?.studentId) || (!currentUser?.studentId ? students[0] : null) || fallbackStudent;
  const assignedMentor = getAssignedMentor(student, facultyList);

  // Scoped data
  const myDocuments = documents.filter((d) => d.studentId === student.id);
  const myRequests = correctionRequests.filter((r) => r.studentId === student.id);
  const myTimetable = timetables.filter((t) => t.semester === student.semester);
  const myCourses = courses.filter((c) => c.semester === student.semester);
  const mySms = smsMessages.filter(
    (m) => m.studentId === student.id || m.recipientPhone === student.phone || m.recipientPhone === student.parentPhone
  );

  const isShortage = student.attendanceRate < 75;

  // New Request Form State
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [reqCourseId, setReqCourseId] = useState(myCourses[0]?.id || '');
  const [reqDate, setReqDate] = useState(new Date().toISOString().split('T')[0]);
  const [reqType, setReqType] = useState<'Medical Leave' | 'On-Duty Attendance' | 'System Discrepancy' | 'Emergency Leave'>('Medical Leave');
  const [reqReason, setReqReason] = useState('');
  const [reqAttachment, setReqAttachment] = useState('');
  const [requestSuccessMsg, setRequestSuccessMsg] = useState<string | null>(null);

  // New Document Upload State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState<'Transcript' | 'Certificate' | 'Medical' | 'Assignment' | 'Identity Proof'>('Medical');
  const [docFileName, setDocFileName] = useState('');
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);

  // Confidential Support Request State
  const [supportRemarks, setSupportRemarks] = useState('');
  const [supportCategory, setSupportCategory] = useState<'academic_stress' | 'attendance_deficit' | 'personal_concern'>('academic_stress');
  const [supportSubmitted, setSupportSubmitted] = useState(false);

  const handleSubmitCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqReason.trim()) return;

    const selectedCrs = myCourses.find((c) => c.id === reqCourseId) || myCourses[0];
    const courseName = selectedCrs?.courseName || 'General / Core Subject';

    submitCorrectionRequest({
      studentId: student.id,
      studentName: student.name,
      rollNumber: student.studentId,
      courseId: reqCourseId || 'general',
      courseName: courseName,
      date: reqDate,
      requestType: reqType,
      reason: reqReason.trim(),
      attachmentUrl: reqAttachment.trim() || 'https://documents.bcafly.edu/signed/student_upload.pdf'
    });

    setRequestSuccessMsg('Correction request submitted for Administrative review.');
    setReqReason('');
    setReqAttachment('');
    setTimeout(() => {
      setRequestSuccessMsg(null);
      setShowRequestModal(false);
    }, 1500);
  };

  const handleUploadDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docFileName.trim()) return;

    uploadDocument({
      studentId: student.id,
      title: docTitle.trim(),
      category: docCategory,
      fileName: docFileName.trim(),
      fileSizeKb: Math.floor(Math.random() * 300) + 100,
      mimeType: 'application/pdf'
    });

    setUploadSuccessMsg('Document securely added to your private vault.');
    setDocTitle('');
    setDocFileName('');
    setTimeout(() => {
      setUploadSuccessMsg(null);
      setShowUploadModal(false);
    }, 1500);
  };

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportRemarks.trim()) return;

    createCounselingReferral(student.id, supportCategory, supportRemarks.trim());
    setSupportSubmitted(true);
    setTimeout(() => {
      setSupportRemarks('');
      setSupportSubmitted(false);
    }, 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-in fade-in duration-150">
      {/* Student Portal Header */}
      <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-2xl">
            <BcaFlyLogo />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-emerald-500/30">
                Student Academic Portal
              </span>
              <span className="text-xs text-slate-400">Authenticated Student Account</span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Strict Academic Isolation • Private Academic Ledger
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

      {/* Student Profile Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xl">
            {student.initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">BCA Portal</span>
              <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                Semester {student.semester} - Section {student.section}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-0.5">
              {student.name}
            </h1>
            <p className="text-xs text-slate-500">
              Roll No: {student.studentId} • Batch 2024–2027 • Bachelor of Computer Applications
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

      {/* Shortage Alert */}
      {isShortage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-900">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm">Attendance Criteria Deficit ({student.attendanceRate}%)</h4>
            <p className="text-rose-800 leading-relaxed">
              Your overall attendance has fallen below the mandatory 75% threshold required for end-semester examinations.
              Condonation Status: <strong>{student.condonationStatus || 'Pending Medical Verification'}</strong>. Submit a correction request with medical proof or schedule a meeting with your mentor <strong>{assignedMentor?.name || 'your assigned faculty mentor'}</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'attendance'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100'
          }`}
        >
          My Attendance
        </button>
        <button
          onClick={() => setActiveTab('marks')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'marks'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100'
          }`}
        >
          Internal Marks &amp; CIA
        </button>
        <button
          onClick={() => setActiveTab('timetable')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'timetable'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100'
          }`}
        >
          Timetable
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'courses'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100'
          }`}
        >
          Enrolled Courses
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
            activeTab === 'documents'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100'
          }`}
        >
          <span>Documents</span>
          <span className="bg-slate-200 text-slate-800 text-[10px] px-1.5 py-0.2 rounded-full">
            {myDocuments.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
            activeTab === 'requests'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100'
          }`}
        >
          <span>Correction Requests</span>
          <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
            {myRequests.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('notices')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'notices'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100'
          }`}
        >
          Notices &amp; SMS
        </button>
        <button
          onClick={() => setActiveTab('support')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'support'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100'
          }`}
        >
          Support &amp; Counseling
        </button>
      </div>

      {/* 1. Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* 6-Day Attendance Heatmap */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Recent 6-Day Attendance Trend</h3>
                  <p className="text-xs text-slate-500">Daily participation across theory lectures and lab sessions.</p>
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

            {/* Quick Enrolled Courses */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Enrolled Courses (Semester {student.semester})</h3>
                <button
                  onClick={() => setActiveTab('courses')}
                  className="text-xs text-slate-500 hover:text-slate-900 font-semibold cursor-pointer"
                >
                  View All →
                </button>
              </div>

              <div className="space-y-3">
                {myCourses.length === 0 ? (
                  <div className="py-6 text-center bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-400">
                    No active course enrollments found for Semester {student.semester}.
                  </div>
                ) : (
                  myCourses.map((c) => (
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
            {/* Mentor Card */}
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
                  No records yet. No faculty mentor currently assigned.
                </div>
              )}

              <button
                onClick={() => setActiveTab('support')}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-full transition-all cursor-pointer"
              >
                Request 1-on-1 Meeting
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-3 text-xs">
              <h3 className="font-bold text-slate-900 text-sm">Self-Service Actions</h3>
              <button
                onClick={() => {
                  setActiveTab('requests');
                  setShowRequestModal(true);
                }}
                className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left font-semibold text-slate-800 flex items-center justify-between cursor-pointer transition-colors"
              >
                <span>Submit Attendance Correction</span>
                <Plus className="w-4 h-4 text-slate-400" />
              </button>
              <button
                onClick={() => {
                  setActiveTab('documents');
                  setShowUploadModal(true);
                }}
                className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left font-semibold text-slate-800 flex items-center justify-between cursor-pointer transition-colors"
              >
                <span>Upload Document / Certificate</span>
                <Upload className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Tab: My Attendance */}
      {activeTab === 'attendance' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Attendance Breakdown by Course</h3>
              <p className="text-xs text-slate-500">
                Mandatory minimum requirement: 75% per course to qualify for University examinations.
              </p>
            </div>
            <button
              onClick={() => {
                setActiveTab('requests');
                setShowRequestModal(true);
              }}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-full cursor-pointer transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Apply for Correction</span>
            </button>
          </div>

          <div className="space-y-4">
            {myCourses.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="font-semibold text-slate-800 text-xs block">No records yet</span>
                <p className="text-[11px] text-slate-400">Course attendance records will appear once enrolled in semester courses.</p>
              </div>
            ) : (
              myCourses.map((c) => (
                <div key={c.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-[10px] text-slate-400 block">{c.courseCode}</span>
                      <h4 className="font-bold text-slate-900 text-sm">{c.courseName}</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-slate-900">{student.attendanceRate}%</span>
                      <span className="text-[10px] text-slate-500 block">Required: 75%</span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${student.attendanceRate < 75 ? 'bg-rose-500' : 'bg-slate-900'}`}
                      style={{ width: `${student.attendanceRate}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Classes Attended: {student.totalClassesAttended} / {student.totalClassesHeld}</span>
                    <span className="font-semibold text-emerald-700">Status: Regular Attendance</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 3. Tab: Continuous Internal Assessment (CIA) */}
      {activeTab === 'marks' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Continuous Internal Assessment (CIA) &amp; Exam Marks</h3>
            <p className="text-xs text-slate-500">
              Internal evaluations conducted under University curriculum standards.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Subject Code</th>
                  <th className="py-3 px-3">Subject Title</th>
                  <th className="py-3 px-3 text-center">CIA 1 (20)</th>
                  <th className="py-3 px-3 text-center">CIA 2 (20)</th>
                  <th className="py-3 px-3 text-center">Assignments (10)</th>
                  <th className="py-3 px-3 text-center">Internal Total (50)</th>
                  <th className="py-3 px-3 text-center">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myCourses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 font-medium text-xs">
                      No records yet. Enrolled course internal marks will appear here.
                    </td>
                  </tr>
                ) : (
                  myCourses.map((c) => {
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

      {/* 4. Tab: Timetable */}
      {activeTab === 'timetable' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Weekly Class Timetable (Semester {student.semester})</h3>
            <p className="text-xs text-slate-500">Official scheduled theory lectures, practical labs, and studio sessions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {myTimetable.length === 0 ? (
              <div className="col-span-full p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="font-semibold text-slate-800 text-xs block">No records yet</span>
                <p className="text-[11px] text-slate-400">Timetable slots for Semester {student.semester} will appear once scheduled.</p>
              </div>
            ) : (
              myTimetable.map((slot) => (
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

      {/* 5. Tab: Enrolled Courses */}
      {activeTab === 'courses' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Enrolled Courses &amp; Scheme Catalog</h3>
            <p className="text-xs text-slate-500">Credit allocations and syllabus information for Semester {student.semester}.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myCourses.length === 0 ? (
              <div className="col-span-full p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="font-semibold text-slate-800 text-xs block">No records yet</span>
                <p className="text-[11px] text-slate-400">No courses currently enrolled for Semester {student.semester}.</p>
              </div>
            ) : (
              myCourses.map((c) => (
                <div key={c.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-3 text-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[10px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-bold">
                        {c.courseCode}
                      </span>
                      <h4 className="font-bold text-slate-900 text-base mt-1">{c.courseName}</h4>
                    </div>
                    <span className="bg-slate-900 text-white font-bold text-[10px] px-2 py-0.5 rounded">
                      {c.credits} Credits
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-slate-600 pt-2 border-t border-slate-200/60 text-[11px]">
                    <div>Scheme: {c.academicScheme}</div>
                    <div>Type: {c.courseType}</div>
                    <div>Max Marks: {c.maxMarks}</div>
                    <div>Min Attendance: {c.attendanceRequired}%</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 6. Tab: Documents */}
      {activeTab === 'documents' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Private Student Document Vault</h3>
              <p className="text-xs text-slate-500">
                Official certificates, grade transcripts, and medical condonation submissions.
              </p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-full cursor-pointer transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Document</span>
            </button>
          </div>

          <div className="space-y-3">
            {myDocuments.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="font-semibold text-slate-800 text-xs block">No records yet</span>
                <p className="text-[11px] text-slate-400">You have not uploaded any certificates, transcripts, or medical proofs yet.</p>
              </div>
            ) : (
              myDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-200 text-slate-700">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{doc.title}</h4>
                      <p className="text-[11px] text-slate-500">
                        {doc.category} • {doc.fileName} • {doc.fileSizeKb} KB • Uploaded {doc.uploadDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verified</span>
                    </span>
                    <button
                      onClick={() => alert(`Downloading secure document token: ${doc.accessToken}`)}
                      className="p-2 rounded-xl bg-white hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold cursor-pointer transition-colors"
                      title="Download Secure PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 7. Tab: Correction Requests */}
      {activeTab === 'requests' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Attendance &amp; Leave Correction Requests</h3>
              <p className="text-xs text-slate-500">
                Track status of medical leave, on-duty letters, and attendance grievance applications.
              </p>
            </div>
            <button
              onClick={() => setShowRequestModal(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-full cursor-pointer transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Correction Request</span>
            </button>
          </div>

          <div className="space-y-3">
            {myRequests.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="font-semibold text-slate-800 text-xs block">No requests in queue</span>
                <p className="text-[11px] text-slate-400">You have not submitted any attendance correction or leave exemption requests.</p>
              </div>
            ) : (
              myRequests.map((req) => (
                <div key={req.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{req.courseName}</span>
                      <span className="text-[10px] font-mono text-slate-400">Date: {req.date}</span>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        req.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : req.status === 'Rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  <p className="text-slate-700 leading-relaxed">{req.reason}</p>

                  {req.adminRemarks && (
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/70 text-[11px] text-slate-800 space-y-0.5">
                      <span className="font-bold text-slate-500 uppercase text-[10px]">Admin Review Notes:</span>
                      <p>{req.adminRemarks}</p>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        Reviewed by: {req.reviewedBy} at {req.reviewedAt}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 8. Tab: Notices & SMS Feed */}
      {activeTab === 'notices' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Simulated SMS &amp; Department Notices Feed</h3>
            <p className="text-xs text-slate-500">Official notifications dispatched to student and guardian contact numbers.</p>
          </div>

          <div className="space-y-3">
            {mySms.length > 0 ? (
              mySms.map((sms) => (
                <div key={sms.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">
                      To: {sms.recipientType} ({sms.recipientPhone})
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{sms.sentAt}</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed font-sans">{sms.body}</p>
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
      )}

      {/* 9. Tab: Support & Counseling Inquiry */}
      {activeTab === 'support' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Confidential Student Well-Being &amp; Academic Care</h3>
            <p className="text-xs text-slate-500">
              Submit a confidential support inquiry directly to the campus psychologist or request a 1-on-1 session with your mentor.
            </p>
          </div>

          {supportSubmitted ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-slate-900 text-base">Inquiry Submitted Confidentially</h4>
              <p className="text-xs text-slate-600">
                The student counselor has received your note in the secure vault. You will be contacted via private meeting slot.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSupportSubmit} className="space-y-4 text-xs max-w-xl">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Inquiry Category</label>
                <select
                  value={supportCategory}
                  onChange={(e: any) => setSupportCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                >
                  <option value="academic_stress">Academic Stress &amp; Exam Workload</option>
                  <option value="attendance_deficit">Attendance Shortage &amp; Medical Difficulties</option>
                  <option value="personal_wellbeing">Personal Well-Being &amp; Guidance</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Confidential Note</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your concern in confidence. Only the assigned counselor can access this record."
                  value={supportRemarks}
                  onChange={(e) => setSupportRemarks(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-full cursor-pointer transition-all shadow-xs"
              >
                Send Confidential Inquiry
              </button>
            </form>
          )}
        </div>
      )}

      {/* Modal: New Correction Request */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white max-w-md w-full rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Submit Attendance Correction</h3>
              <button onClick={() => setShowRequestModal(false)} className="text-slate-400 hover:text-slate-700 text-sm cursor-pointer">
                ✕
              </button>
            </div>

            {requestSuccessMsg ? (
              <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold text-center">
                {requestSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleSubmitCorrection} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Subject / Course</label>
                  <select
                    value={reqCourseId}
                    onChange={(e) => setReqCourseId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                  >
                    {myCourses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.courseCode} - {c.courseName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Date</label>
                    <input
                      type="date"
                      value={reqDate}
                      onChange={(e) => setReqDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Type</label>
                    <select
                      value={reqType}
                      onChange={(e: any) => setReqType(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                    >
                      <option value="Medical Leave">Medical Leave</option>
                      <option value="On-Duty Attendance">On-Duty Attendance</option>
                      <option value="System Discrepancy">System Discrepancy</option>
                      <option value="Emergency Leave">Emergency Leave</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Detailed Reason</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="State reason for absence or attendance discrepancy..."
                    value={reqReason}
                    onChange={(e) => setReqReason(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Proof Attachment URL</label>
                  <input
                    type="text"
                    placeholder="https://documents.bcafly.edu/signed/proof.pdf"
                    value={reqAttachment}
                    onChange={(e) => setReqAttachment(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer shadow-xs"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: Upload Document */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white max-w-md w-full rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Upload Document to Vault</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-700 text-sm cursor-pointer">
                ✕
              </button>
            </div>

            {uploadSuccessMsg ? (
              <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold text-center">
                {uploadSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleUploadDocument} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Document Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Medical Certificate Hospital Slip"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Category</label>
                    <select
                      value={docCategory}
                      onChange={(e: any) => setDocCategory(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                    >
                      <option value="Medical">Medical</option>
                      <option value="Certificate">Certificate</option>
                      <option value="Transcript">Transcript</option>
                      <option value="Assignment">Assignment</option>
                      <option value="Identity Proof">Identity Proof</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">File Name</label>
                    <input
                      type="text"
                      required
                      placeholder="medical_slip.pdf"
                      value={docFileName}
                      onChange={(e) => setDocFileName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer shadow-xs"
                  >
                    Upload Document
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
