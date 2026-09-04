import React, { useState } from 'react';
import { Student } from '../types';
import {
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  Send,
  Save,
  BookOpen,
  Calendar,
} from 'lucide-react';

interface AcademicTrackingViewProps {
  students: Student[];
  onNavigateHome: () => void;
}

interface CourseOption {
  code: string;
  name: string;
  semester: number;
  credits: number;
  syllabusProgress: number;
  totalEnrolled: number;
}

const COURSES: CourseOption[] = [
  {
    code: 'BCA-501',
    name: 'Enterprise Web Architecture',
    semester: 5,
    credits: 4,
    syllabusProgress: 68,
    totalEnrolled: 42,
  },
  {
    code: 'BCA-502',
    name: 'Database Administration & SQL',
    semester: 5,
    credits: 4,
    syllabusProgress: 75,
    totalEnrolled: 38,
  },
  {
    code: 'BCA-301',
    name: 'Object Oriented Programming in C++',
    semester: 3,
    credits: 4,
    syllabusProgress: 62,
    totalEnrolled: 40,
  },
  {
    code: 'BCA-303',
    name: 'Data Structures & Algorithms',
    semester: 3,
    credits: 4,
    syllabusProgress: 55,
    totalEnrolled: 40,
  },
];

export const AcademicTrackingView: React.FC<AcademicTrackingViewProps> = ({
  students,
  onNavigateHome,
}) => {
  const [selectedCourseCode, setSelectedCourseCode] = useState('BCA-501');
  const selectedCourse = COURSES.find((c) => c.code === selectedCourseCode) || COURSES[0];

  // Editable grades state
  const courseStudents = students.filter((s) => s.semester === selectedCourse.semester);

  const [marksMap, setMarksMap] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    courseStudents.forEach((s, idx) => {
      // Seed realistic marks 18 to 30
      initial[s.id] = s.name === 'Alex Smith' ? 28 : (20 + ((idx * 3) % 10));
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {COURSES.map((course) => {
          const isSelected = course.code === selectedCourseCode;
          return (
            <div
              key={course.code}
              onClick={() => setSelectedCourseCode(course.code)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white border-slate-100 hover:border-slate-300 text-slate-900 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                  {course.code}
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
                {course.name}
              </h4>
              <div
                className={`mt-3 pt-2 border-t flex items-center justify-between text-xs ${
                  isSelected ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-400'
                }`}
              >
                <span>{course.totalEnrolled} Students</span>
                <span className={isSelected ? 'text-slate-200 font-medium' : 'text-slate-700 font-medium'}>
                  {course.syllabusProgress}% syllabus
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Course Details & Metrics Ribbon */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-slate-900" />
              <h3 className="font-bold text-slate-900 text-base">{selectedCourse.name}</h3>
              <span className="text-xs bg-slate-100 text-slate-800 font-medium px-2.5 py-0.5 rounded-full">
                {selectedCourse.code}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Continuous Internal Assessment (CIA) Grade Sheet • Maximum Marks: 30
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <div>
              <span className="text-slate-400 block">Class Average</span>
              <strong className="text-sm font-bold text-slate-900">{averageScore} / 30</strong>
            </div>
            <div className="border-l border-slate-100 pl-4">
              <span className="text-slate-400 block">Passing Rate</span>
              <strong className="text-sm font-bold text-slate-900">95.2%</strong>
            </div>
            <div className="border-l border-slate-100 pl-4">
              <span className="text-slate-400 block">Submission Status</span>
              <strong className="text-sm font-bold text-slate-900">
                {submissionComplete ? 'Official Signed' : 'Open (Due Oct 15)'}
              </strong>
            </div>
          </div>
        </div>

        {/* Syllabus Milestone Tracker */}
        <div className="pt-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
            <span>Syllabus Completion Timeline</span>
            <span className="text-slate-900 font-medium">{selectedCourse.syllabusProgress}% covered</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-3">
            <div
              className="bg-slate-900 h-full rounded-full transition-all duration-500"
              style={{ width: `${selectedCourse.syllabusProgress}%` }}
            />
          </div>
          <div className="grid grid-cols-4 gap-2 text-[11px] text-slate-500 text-center">
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 font-medium text-slate-700">
              ✓ Unit 1: Foundations
            </div>
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 font-medium text-slate-700">
              ✓ Unit 2: Core Architecture
            </div>
            <div className="bg-slate-100 p-2 rounded-xl border border-slate-200 font-semibold text-slate-900">
              • Unit 3: In Progress (70%)
            </div>
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 font-normal text-slate-400">
              Unit 4: Final Frameworks
            </div>
          </div>
        </div>
      </div>

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
              {courseStudents.map((s) => {
                const currentMark = marksMap[s.id] ?? 24;
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
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
