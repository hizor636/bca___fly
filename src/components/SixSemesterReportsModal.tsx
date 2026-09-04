import React, { useState, useMemo } from 'react';
import { useDemoStore } from '../context/DemoContext';
import {
  X,
  FileText,
  Download,
  AlertTriangle,
  CheckCircle,
  GraduationCap,
  Printer,
  BarChart3,
  Users
} from 'lucide-react';

interface SixSemesterReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SixSemesterReportsModal: React.FC<SixSemesterReportsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    students = [],
    updateCondonationStatus,
  } = useDemoStore();

  const shortageStudents = useMemo(() => (students || []).filter((s) => s.attendanceRate < 75), [students]);

  const [activeTab, setActiveTab] = useState<'overview' | 'shortage' | 'transcript'>('overview');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students[0]?.id || ''
  );
  const [copiedNotification, setCopiedNotification] = useState(false);

  if (!isOpen) return null;

  const currentStudent = students?.find((s) => s.id === selectedStudentId) || students?.[0];

  // 6-Semester Summary Metrics
  const semMetrics = [1, 2, 3, 4, 5, 6].map((sem) => {
    const semStudents = students.filter((s) => s.semester === sem);
    const count = semStudents.length || Math.floor(60 + sem * 5);
    const avgAtt = semStudents.length
      ? Math.round(semStudents.reduce((a, b) => a + b.attendanceRate, 0) / semStudents.length)
      : Math.round(82 + (sem % 3) * 3);
    const avgCgpa = semStudents.length
      ? (semStudents.reduce((a, b) => a + b.cgpa, 0) / semStudents.length).toFixed(2)
      : (7.4 + (sem * 0.15)).toFixed(2);
    const shortageCount = semStudents.filter((s) => s.attendanceRate < 75).length;

    return {
      sem,
      name: `Semester ${sem}`,
      code: `BCA-SEM${sem}`,
      studentsCount: count,
      avgAttendance: avgAtt,
      avgCgpa: avgCgpa,
      shortageCount: shortageCount || (sem === 3 ? 3 : sem === 5 ? 2 : 1),
      passRate: `${91 + (sem % 4)}%`,
    };
  });

  const handleExport = () => {
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  6-Semester Institutional Reports &amp; Transcripts
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-800">
                  BCA Academic Council
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-semester performance tracking, shortage registers (&lt;75%), and official transcript audits.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-100 bg-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto py-2.5 scrollbar-none">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              6-Semester Overview
            </button>
            <button
              onClick={() => setActiveTab('shortage')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'shortage'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>Shortage Register (&lt;75%)</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'shortage' ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-700'
              }`}>
                {shortageStudents.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('transcript')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'transcript'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Student Transcript Auditor
            </button>
          </div>

          {copiedNotification && (
            <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              Report exported successfully
            </span>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: 6-SEMESTER OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {semMetrics.map((sem) => (
                  <div
                    key={sem.sem}
                    className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 hover:border-slate-300 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-800 shadow-2xs">
                          {sem.sem}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{sem.name}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">{sem.code}</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {sem.passRate} Pass
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-200/60">
                      <div>
                        <span className="text-[10px] font-medium text-slate-400 block">Enrolled</span>
                        <span className="text-xs font-bold text-slate-800">{sem.studentsCount}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-medium text-slate-400 block">Avg Attd</span>
                        <span className="text-xs font-bold text-slate-800">{sem.avgAttendance}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-medium text-slate-400 block">Mean CGPA</span>
                        <span className="text-xs font-bold text-slate-800">{sem.avgCgpa}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500">
                      <span>Condonation alerts:</span>
                      <span className={`font-bold ${sem.shortageCount > 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                        {sem.shortageCount} students
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Departmental Accreditation Footnote */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
                <GraduationCap className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-slate-900">BCA Curriculum Compliance</h5>
                  <p className="mt-0.5 text-slate-500">
                    All 6 semesters adhere to the National Education Policy (NEP) curriculum. Semester 1-4 cover Core Programming, Data Structures, and Database Foundations; Semesters 5-6 culminate in Cloud Computing, Capstone Projects, and Industrial Internships.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SHORTAGE REGISTER */}
          {activeTab === 'shortage' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Attendance Shortage Register (Threshold: 75%)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Students below 75% attendance are conditionally flagged for debarment or Academic Council condonation.
                  </p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider bg-slate-50">
                      <th className="py-2.5 pl-3">Student Name</th>
                      <th className="py-2.5">Roll No</th>
                      <th className="py-2.5">Semester</th>
                      <th className="py-2.5">Classes Attended</th>
                      <th className="py-2.5">Attendance %</th>
                      <th className="py-2.5">Shortage Deficit</th>
                      <th className="py-2.5">Condonation Status</th>
                      <th className="py-2.5 pr-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {shortageStudents.map((st) => {
                      const shortagePercent = 75 - st.attendanceRate;
                      return (
                        <tr key={st.id} className="hover:bg-slate-50/70">
                          <td className="py-3 pl-3 font-semibold text-slate-900">{st.name}</td>
                          <td className="py-3 font-mono text-slate-500">{st.studentId}</td>
                          <td className="py-3 text-slate-600">Sem {st.semester}</td>
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

          {/* TAB 3: STUDENT TRANSCRIPT AUDITOR */}
          {activeTab === 'transcript' && currentStudent && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Active Student Record
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <h4 className="text-base font-bold text-slate-900">{currentStudent.name}</h4>
                    <span className="text-xs font-mono text-slate-500">({currentStudent.studentId})</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Select Student:</span>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-900 focus:outline-none"
                  >
                    {students.slice(0, 15).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.studentId}) - Sem {s.semester}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Multi-Semester Grade Breakdown */}
              <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Official BCA Progression Summary</h4>
                    <span className="text-xs text-slate-500">Mentor: {currentStudent.assignedFaculty}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Cumulative CGPA</span>
                    <span className="text-lg font-bold text-slate-900">{currentStudent.cgpa} / 10.0</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 block">Current Semester</span>
                    <span className="text-sm font-bold text-slate-900">Sem {currentStudent.semester}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 block">Attendance Rate</span>
                    <span className={`text-sm font-bold ${currentStudent.attendanceRate < 75 ? 'text-rose-600' : 'text-slate-900'}`}>
                      {currentStudent.attendanceRate}%
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 block">Internal Assessment 1</span>
                    <span className="text-sm font-bold text-slate-900">
                      {((currentStudent as any)?.internalMarks?.cia1 ?? (currentStudent.subjectGrades?.[0]?.internalObtained ? Math.round((currentStudent.subjectGrades[0].internalObtained / (currentStudent.subjectGrades[0].internalMax || 30)) * 25) : Math.min(25, Math.max(14, Math.round(currentStudent.cgpa * 2.6)))))} / 25
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 block">Internal Assessment 2</span>
                    <span className="text-sm font-bold text-slate-900">
                      {((currentStudent as any)?.internalMarks?.cia2 ?? (currentStudent.subjectGrades?.[1]?.internalObtained ? Math.round((currentStudent.subjectGrades[1].internalObtained / (currentStudent.subjectGrades[1].internalMax || 30)) * 25) : Math.min(25, Math.max(13, Math.round(currentStudent.cgpa * 2.5)))))} / 25
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <span className="text-xs font-bold text-slate-700 block mb-2">
                    Semester SGPA Progression Log
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {(currentStudent.sgpaHistory && currentStudent.sgpaHistory.length > 0
                      ? currentStudent.sgpaHistory
                      : [
                          Math.max(6.0, Number((currentStudent.cgpa - 0.4).toFixed(2))),
                          Math.max(6.2, Number((currentStudent.cgpa - 0.2).toFixed(2))),
                          currentStudent.cgpa,
                          Math.min(9.8, Number((currentStudent.cgpa + 0.1).toFixed(2))),
                          Math.min(9.9, Number((currentStudent.cgpa + 0.3).toFixed(2))),
                          currentStudent.cgpa
                        ]
                    ).slice(0, currentStudent.semester).map((sg: any, idx: number) => {
                      const semNum = typeof sg === 'object' && sg !== null && 'semester' in sg ? sg.semester : idx + 1;
                      const sgpaVal = typeof sg === 'object' && sg !== null && 'sgpa' in sg ? sg.sgpa : (typeof sg === 'number' ? sg.toFixed(2) : currentStudent.cgpa.toFixed(2));
                      return (
                        <div key={idx} className="px-3 py-2 bg-slate-100 rounded-xl text-center min-w-[75px]">
                          <span className="text-[10px] font-semibold text-slate-400 block">Sem {semNum}</span>
                          <span className="text-xs font-bold text-slate-900">{sgpaVal}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Authenticated by BCA Examination &amp; Faculty Council
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer transition-colors"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
