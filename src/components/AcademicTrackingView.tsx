import React, { useState, useEffect } from 'react';
import { Student, CohortSemesterStats, Course } from '../types';
import { useDemoStore } from '../context/DemoContext';
import { api } from '../services/api';
import {
  CheckCircle2,
  Send,
  Save,
  BookOpen,
  Sparkles,
  BarChart2,
  TrendingUp,
  Activity
} from 'lucide-react';

interface AcademicTrackingViewProps {
  students: Student[];
  onNavigateHome: () => void;
}

export const AcademicTrackingView: React.FC<AcademicTrackingViewProps> = ({
  students,
  onNavigateHome,
}) => {
  const { courses } = useDemoStore();

  const [selectedCourseCode, setSelectedCourseCode] = useState<string>(() => courses[0]?.courseCode || '');
  const selectedCourse: Course | null = courses.find((c) => c.courseCode === selectedCourseCode) || courses[0] || null;
  const [cohortStats, setCohortStats] = useState<CohortSemesterStats | null>(null);
  const [aiOnline, setAiOnline] = useState(false);

  useEffect(() => {
    if (!selectedCourse) return;
    api.getCohortStats()
      .then((res) => {
        if (res.success && res.cohortStats) {
          const semKey = `Semester_${selectedCourse.semester}`;
          if (res.cohortStats[semKey]) {
            setCohortStats(res.cohortStats[semKey]);
          }
          setAiOnline(true);
        }
      })
      .catch(() => setAiOnline(false));
  }, [selectedCourse?.semester]);

  // Editable grades state
  const courseStudents = selectedCourse ? students.filter((s) => s.semester === selectedCourse.semester) : [];

  const [marksMap, setMarksMap] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    courseStudents.forEach((s) => {
      const existingGrade = s.subjectGrades?.find((g) => g.subjectCode === selectedCourse?.courseCode);
      initial[s.id] = existingGrade ? existingGrade.internalObtained : 0;
    });
    return initial;
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [submissionComplete, setSubmissionComplete] = useState(false);

  const handleMarkChange = (studentId: string, value: number) => {
    const clamped = Math.max(0, Math.min(30, isNaN(value) ? 0 : value));
    setMarksMap((prev) => ({ ...prev, [studentId]: clamped }));
    setSavedSuccess(false);
  };

  const calculateGrade = (mark: number) => {
    if (mark >= 27) return { grade: 'A+', color: 'text-emerald-700 bg-emerald-50' };
    if (mark >= 24) return { grade: 'A', color: 'text-blue-700 bg-blue-50' };
    if (mark >= 20) return { grade: 'B+', color: 'text-indigo-700 bg-indigo-50' };
    if (mark >= 15) return { grade: 'B', color: 'text-amber-700 bg-amber-50' };
    return { grade: 'F', color: 'text-rose-700 bg-rose-50' };
  };

  const handleSaveDraft = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSubmitGrades = () => {
    setSubmissionComplete(true);
    setTimeout(() => setSubmissionComplete(false), 4000);
  };

  const allMarks: number[] = Object.values(marksMap);
  const totalScore: number = allMarks.reduce<number>((sum, val) => sum + val, 0);
  const averageScore = (totalScore / (allMarks.length || 1)).toFixed(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
            <button onClick={onNavigateHome} className="hover:text-slate-700 transition-colors cursor-pointer">
              Home
            </button>
            <span>/</span>
            <span className="text-slate-900 font-medium">Academic Records</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Academic Tracking &amp; Grade Submission
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Monitor curriculum milestones, student submissions, and submit internal assessments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSaveDraft}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-full flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{savedSuccess ? 'Draft Saved!' : 'Save Draft'}</span>
          </button>
          <button
            onClick={handleSubmitGrades}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-full flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submissionComplete ? 'Grades Approved & Locked' : 'Submit to Council'}</span>
          </button>
        </div>
      </div>

      {/* Course Selection Tabs */}
      {courses.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center space-y-3 mb-8">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No records yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Course master data has not been registered yet. Add courses in the Admin Portal to track continuous internal assessments.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {courses.map((course) => {
              const isSelected = course.courseCode === selectedCourseCode;
              const enrolledInSem = students.filter((s) => s.semester === course.semester).length;
              return (
                <div
                  key={course.id || course.courseCode}
                  onClick={() => setSelectedCourseCode(course.courseCode)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white border-slate-100 hover:border-slate-300 text-slate-900 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                      {course.courseCode}
                    </span>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                        isSelected ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Sem {course.semester}
                    </span>
                  </div>
                  <h4 className={`font-semibold text-sm mt-2 line-clamp-1 ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {course.courseName}
                  </h4>
                  <div
                    className={`mt-3 pt-2 border-t flex items-center justify-between text-xs ${
                      isSelected ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-400'
                    }`}
                  >
                    <span>{enrolledInSem} Students</span>
                    <span className={isSelected ? 'text-slate-200 font-medium' : 'text-slate-700 font-medium'}>
                      {course.credits} Credits
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Course Details & Metrics Ribbon */}
          {selectedCourse && (
            <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-8 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-slate-900" />
                    <h3 className="font-bold text-slate-900 text-base">{selectedCourse.courseName}</h3>
                    <span className="text-xs bg-slate-100 text-slate-800 font-medium px-2.5 py-0.5 rounded-full">
                      {selectedCourse.courseCode}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Continuous Internal Assessment (CIA) Grade Sheet • Maximum Marks: {selectedCourse.maxMarks || 30} • Semester {selectedCourse.semester}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs flex-wrap">
                  {cohortStats && (
                    <div className="flex items-center gap-3 bg-indigo-50/80 border border-indigo-100 rounded-xl px-3 py-1.5">
                      <div className="flex items-center gap-1.5 text-indigo-700 font-semibold">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Python Analytics Engine</span>
                      </div>
                      <div className="text-slate-600 text-[11px]">
                        Mean: <strong className="text-slate-900">{cohortStats.attendance.mean}%</strong> | Med: <strong className="text-slate-900">{cohortStats.attendance.median}%</strong> | σ: <strong className="text-slate-900">{cohortStats.attendance.stdDev}</strong>
                      </div>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-400 block">Class Average</span>
                    <strong className="text-sm font-bold text-slate-900">{allMarks.length > 0 ? averageScore : '0.0'} / 30</strong>
                  </div>
                  <div className="border-l border-slate-100 pl-4">
                    <span className="text-slate-400 block">Passing Criteria</span>
                    <strong className="text-sm font-bold text-slate-900">≥ 15 / 30</strong>
                  </div>
                  <div className="border-l border-slate-100 pl-4">
                    <span className="text-slate-400 block">Submission Status</span>
                    <strong className="text-sm font-bold text-slate-900">
                      {submissionComplete ? 'Official Signed' : 'Open Draft'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Syllabus Scheme Tracker */}
              <div className="pt-4">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
                  <span>Course Scheme Allocation</span>
                  <span className="text-slate-900 font-medium">{selectedCourse.courseType || 'Core Theory'} • {selectedCourse.academicScheme || 'CBCS'}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600 text-center">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Credits</span>
                    <strong className="text-slate-900">{selectedCourse.credits} Credits</strong>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Max Marks</span>
                    <strong className="text-slate-900">{selectedCourse.maxMarks || 100} Total</strong>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Attendance Rule</span>
                    <strong className="text-slate-900">{selectedCourse.attendanceRequired || 75}% Required</strong>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Term</span>
                    <strong className="text-slate-900">Semester {selectedCourse.semester}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Grade Entry Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-xs sm:text-sm text-slate-900">
              Student Internal Assessment Marks (Out of 30)
            </h4>
            <p className="text-[11px] text-slate-400">
              Adjust numerical marks directly; letter grade automatically syncs with university curves.
            </p>
          </div>
          <span className="text-xs font-medium text-slate-400">
            Showing {courseStudents.length} enrolled students
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/70 text-slate-400 uppercase tracking-widest text-[11px] font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4 sm:px-6">Student Details</th>
                <th className="py-3 px-4">Attendance</th>
                <th className="py-3 px-4">Exam Eligibility</th>
                <th className="py-3 px-4 text-center">Internal Score (/30)</th>
                <th className="py-3 px-4 text-center">Predicted Grade</th>
                <th className="py-3 px-4 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!selectedCourse || courseStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <span className="font-semibold text-slate-700 text-xs">No records yet</span>
                      <p className="text-[11px] text-slate-400">
                        {selectedCourse
                          ? `No students currently enrolled in Semester ${selectedCourse.semester}.`
                          : 'Please configure courses and enroll students to manage internal evaluations.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                courseStudents.map((s) => {
                  const currentMark = marksMap[s.id] ?? 0;
                  const { grade } = calculateGrade(currentMark);
                  const isEligible = s.attendanceRate >= 75;

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center"
                          >
                            {s.initials}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{s.name}</p>
                            <p className="text-[11px] text-slate-400">ID: {s.studentId}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`font-semibold ${isEligible ? 'text-slate-900' : 'text-slate-400'}`}>
                          {s.attendanceRate}%
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {isEligible ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-700 font-medium bg-slate-100 px-2.5 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-slate-600" /> Eligible
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium bg-slate-100 px-2.5 py-0.5 rounded-full">
                            Short Attendance
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <input
                          type="number"
                          min={0}
                          max={30}
                          value={currentMark}
                          onChange={(e) => handleMarkChange(s.id, parseInt(e.target.value, 10))}
                          className="w-16 text-center font-bold text-xs sm:text-sm py-1 px-2 border border-slate-200 rounded-full focus:outline-none focus:ring-1 focus:ring-slate-900 bg-slate-50 focus:bg-white transition-all"
                        />
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                          Grade {grade}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <span className="text-[11px] text-slate-400">
                          {submissionComplete ? 'Locked' : 'Draft Ready'}
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
    </div>
  );
};
