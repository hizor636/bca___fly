import React, { useState, useMemo } from 'react';
import { useDemoStore } from '../context/DemoContext';
import { Course, Student } from '../types';

export type AssessmentType = 'CIA_1' | 'CIA_2' | 'CIA_3' | 'ASSIGNMENT' | 'PRACTICAL' | 'FINAL_EXAM';
import {
  Users,
  CheckCircle2,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Send,
  Save,
  Search,
  Filter,
  Award,
  FileText
} from 'lucide-react';

interface CourseAcademicWorkspaceProps {
  onSelectStudent: (student: Student) => void;
  onOpenReports: () => void;
  onOpenAudit: () => void;
}

export const CourseAcademicWorkspace: React.FC<CourseAcademicWorkspaceProps> = ({
  onSelectStudent,
  onOpenReports,
  onOpenAudit,
}) => {
  const {
    activeFaculty,
    courses,
    facultyCourseAssignments,
    semesters,
    workingDays,
    saveCourseAttendance,
    saveCourseMarks,
    getEnrolledStudentsForCourse,
    getAssignedCoursesForFaculty,
    courseAttendance,
    courseMarks,
    students,
    createCounselingReferral,
    addMentoringSession,
  } = useDemoStore();

  // 1. SEMESTER SELECTION: All 6 BCA Semesters
  const [selectedSemester, setSelectedSemester] = useState<number | 'all'>('all');
  const [showAllDeptCourses, setShowAllDeptCourses] = useState(false);

  // Available courses for active faculty (or all department courses if toggled)
  const facultyAssignedCourses = useMemo(() => {
    if (showAllDeptCourses) {
      return selectedSemester === 'all'
        ? courses
        : courses.filter((c) => c.semester === selectedSemester);
    }
    const myCourses = getAssignedCoursesForFaculty(activeFaculty?.id || '', selectedSemester === 'all' ? undefined : selectedSemester);
    // If no course assigned for that semester, fall back to active courses in that semester so faculty is never blocked
    if (myCourses.length === 0) {
      return selectedSemester === 'all'
        ? courses
        : courses.filter((c) => c.semester === selectedSemester);
    }
    return myCourses;
  }, [courses, activeFaculty?.id, selectedSemester, showAllDeptCourses, getAssignedCoursesForFaculty]);

  // 2. COURSE SELECTION
  const [selectedCourseId, setSelectedCourseId] = useState<string>(() => {
    const initial = facultyAssignedCourses[0]?.id || courses[0]?.id || '';
    return initial;
  });

  // Ensure selected course is valid in current list
  const activeCourse = useMemo(() => {
    return courses.find((c) => c.id === selectedCourseId) || facultyAssignedCourses[0] || courses[0] || null;
  }, [courses, selectedCourseId, facultyAssignedCourses]);

  // Sub-tab inside Course view: 'roster' | 'attendance' | 'marks' | 'performance'
  const [courseSubTab, setCourseSubTab] = useState<'roster' | 'attendance' | 'marks' | 'performance'>('roster');

  // Enrolled Students for active course
  const enrolledData = useMemo(() => {
    if (!activeCourse) return [];
    return getEnrolledStudentsForCourse(activeCourse.id);
  }, [activeCourse, getEnrolledStudentsForCourse]);

  const enrolledStudents = useMemo(() => {
    return enrolledData.map((d) => ({
      ...d.student,
      attendanceRate: d.attendancePercent,
      courseMarks: d.marks,
      enrollment: d.enrollment
    }));
  }, [enrolledData]);

  // Search in enrolled students
  const [rosterSearch, setRosterSearch] = useState('');
  const filteredRoster = useMemo(() => {
    return enrolledStudents.filter(
      (s) =>
        s.name.toLowerCase().includes(rosterSearch.toLowerCase()) ||
        s.studentId.toLowerCase().includes(rosterSearch.toLowerCase()) ||
        s.email.toLowerCase().includes(rosterSearch.toLowerCase())
    );
  }, [enrolledStudents, rosterSearch]);

  // --- ATTENDANCE TAB STATE ---
  const todayDateStr = '2026-09-04';
  const [attendanceDate, setAttendanceDate] = useState<string>(todayDateStr);
  const [sessionType, setSessionType] = useState<'THEORY' | 'LAB' | 'TUTORIAL'>('THEORY');
  const [sessionTopic, setSessionTopic] = useState('');
  const [attendanceSheet, setAttendanceSheet] = useState<Record<string, { status: 'present' | 'absent' | 'late' | 'od'; remarks?: string }>>({});

  // Initialize sheet when course changes or enrolled students change
  React.useEffect(() => {
    const initial: Record<string, { status: 'present' | 'absent' | 'late' | 'od'; remarks?: string }> = {};
    enrolledStudents.forEach((st, idx) => {
      // realistic spread based on student attendance rate
      if (st.attendanceRate < 75) {
        initial[st.id] = { status: idx % 2 === 0 ? 'absent' : 'late' };
      } else {
        initial[st.id] = { status: 'present' };
      }
    });
    setAttendanceSheet(initial);
  }, [activeCourse?.id, enrolledStudents]);

  const todayCalendar = workingDays?.find((d) => d.date === attendanceDate) || {
    date: attendanceDate,
    isWorking: true,
    dayName: 'Friday',
    reason: 'Academic Working Day',
  };

  const attendanceHistory = useMemo(() => {
    if (!activeCourse) return [];
    return courseAttendance.filter((ca) => ca.courseId === activeCourse.id);
  }, [activeCourse, courseAttendance]);

  const [savingAttendance, setSavingAttendance] = useState(false);
  const [attendanceFeedback, setAttendanceFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleStatusToggle = (studentId: string, status: 'present' | 'absent' | 'late' | 'od') => {
    setAttendanceSheet((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
  };

  const handleMarkAll = (status: 'present' | 'absent') => {
    const next: Record<string, { status: 'present' | 'absent' | 'late' | 'od'; remarks?: string }> = {};
    enrolledStudents.forEach((st) => {
      next[st.id] = { status };
    });
    setAttendanceSheet(next);
  };

  const handleSaveAttendance = async (finalize: boolean) => {
    if (!activeCourse) return;
    if (!todayCalendar.isWorking && finalize) {
      setAttendanceFeedback({
        type: 'error',
        message: 'Cannot finalize attendance on a designated non-working day or holiday.',
      });
      return;
    }

    setSavingAttendance(true);
    setAttendanceFeedback(null);

    const records: { studentId: string; status: 'PRESENT' | 'ABSENT' | 'LATE' | 'ON_DUTY'; remarks?: string }[] = Object.entries(attendanceSheet).map(([studentId, data]) => ({
      studentId,
      status: data.status === 'present' ? 'PRESENT' : data.status === 'absent' ? 'ABSENT' : data.status === 'late' ? 'LATE' : 'ON_DUTY',
      remarks: data.remarks,
    }));

    const result = await saveCourseAttendance(
      activeCourse.id,
      activeFaculty.id,
      attendanceDate,
      sessionType,
      records,
      finalize
    );

    setSavingAttendance(false);
    if (result.success) {
      setAttendanceFeedback({
        type: 'success',
        message: finalize
          ? `Attendance finalized! SMS notifications dispatched to parents.`
          : 'Draft attendance saved successfully.',
      });
      setTimeout(() => setAttendanceFeedback(null), 4500);
    } else {
      setAttendanceFeedback({
        type: 'error',
        message: result.message || 'Failed to save attendance.',
      });
    }
  };

  // --- MARKS ENTRY TAB STATE ---
  const [assessmentType, setAssessmentType] = useState<AssessmentType>('CIA_1');
  const [marksSheet, setMarksSheet] = useState<Record<string, { marksObtained: number; isAbsent?: boolean }>>({});
  const [savingMarks, setSavingMarks] = useState(false);
  const [marksFeedback, setMarksFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const maxMarksForType = useMemo(() => {
    switch (assessmentType) {
      case 'CIA_1':
      case 'CIA_2':
      case 'CIA_3':
        return 25;
      case 'ASSIGNMENT':
        return 10;
      case 'PRACTICAL':
        return 15;
      case 'FINAL_EXAM':
        return 100;
      default:
        return 25;
    }
  }, [assessmentType]);

  // Load or seed marks
  React.useEffect(() => {
    const initial: Record<string, { marksObtained: number; isAbsent?: boolean }> = {};
    enrolledStudents.forEach((st, idx) => {
      if (assessmentType === 'CIA_1') {
        const ciaVal = (st as any)?.internalMarks?.cia1;
        initial[st.id] = {
          marksObtained: ciaVal !== undefined ? ciaVal : Math.min(maxMarksForType, Math.max(12, Math.round(st.cgpa * 2.5))),
        };
      } else if (assessmentType === 'CIA_2') {
        const ciaVal = (st as any)?.internalMarks?.cia2;
        initial[st.id] = {
          marksObtained: ciaVal !== undefined ? ciaVal : Math.min(maxMarksForType, Math.max(11, Math.round(st.cgpa * 2.4))),
        };
      } else {
        const ratio = maxMarksForType / 25;
        initial[st.id] = {
          marksObtained: Math.min(maxMarksForType, Math.max(Math.round(ratio * 12), Math.round(st.cgpa * 2.5 * ratio))),
        };
      }
    });
    setMarksSheet(initial);
  }, [activeCourse?.id, enrolledStudents, assessmentType, maxMarksForType]);

  const handleMarkChange = (studentId: string, valStr: string) => {
    const num = Number(valStr);
    const clamped = isNaN(num) ? 0 : Math.min(maxMarksForType, Math.max(0, num));
    setMarksSheet((prev) => ({
      ...prev,
      [studentId]: { marksObtained: clamped, isAbsent: false },
    }));
  };

  const handleSaveMarks = async (finalize: boolean) => {
    if (!activeCourse) return;
    setSavingMarks(true);
    setMarksFeedback(null);

    const assessmentKey: 'cia1' | 'cia2' | 'cia3' | 'assignmentMarks' | 'practicalMarks' | 'finalExamMarks' =
      assessmentType === 'CIA_1' ? 'cia1' :
      assessmentType === 'CIA_2' ? 'cia2' :
      assessmentType === 'CIA_3' ? 'cia3' :
      assessmentType === 'ASSIGNMENT' ? 'assignmentMarks' :
      assessmentType === 'PRACTICAL' ? 'practicalMarks' : 'finalExamMarks';

    const records = Object.entries(marksSheet).map(([studentId, data]) => ({
      studentId,
      mark: data.isAbsent ? 0 : data.marksObtained,
    }));

    const result = await saveCourseMarks(activeCourse.id, assessmentKey, records, finalize);

    setSavingMarks(false);
    if (result.success) {
      setMarksFeedback({
        type: 'success',
        message: finalize
          ? `${assessmentType} marks finalized and locked in course ledger.`
          : `Draft ${assessmentType} marks saved.`,
      });
      setTimeout(() => setMarksFeedback(null), 4000);
    } else {
      setMarksFeedback({
        type: 'error',
        message: result.message || 'Failed to save marks.',
      });
    }
  };

  // --- PERFORMANCE METRICS ---
  const courseMetrics = useMemo(() => {
    if (enrolledStudents.length === 0) {
      return { avgAtt: 0, avgCia1: 0, avgCia2: 0, atRiskCount: 0, passRate: 94 };
    }
    const totalAtt = enrolledStudents.reduce((acc, s) => acc + s.attendanceRate, 0);
    const avgAtt = Math.round(totalAtt / enrolledStudents.length);
    const atRisk = enrolledStudents.filter((s) => s.attendanceRate < 75);

    return {
      avgAtt,
      avgCia1: 21.4,
      avgCia2: 20.8,
      atRiskCount: atRisk.length,
      passRate: Math.max(85, Math.min(98, 100 - atRisk.length * 3)),
    };
  }, [enrolledStudents]);

  // Attendance tallies
  const presentCount = Object.values(attendanceSheet).filter((s) => s.status === 'present').length;
  const absentCount = Object.values(attendanceSheet).filter((s) => s.status === 'absent').length;
  const lateCount = Object.values(attendanceSheet).filter((s) => s.status === 'late').length;
  const odCount = Object.values(attendanceSheet).filter((s) => s.status === 'od').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* 1. SEMESTER SELECTION (All 6 BCA Semesters) */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Academic Workflow • Step 1
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">
                Sem 1 through Sem 6 Enabled
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">
              Select BCA Academic Semester
            </h3>
            <p className="text-xs text-slate-500">
              Choose an active semester to load curriculum courses, faculty allocations, and enrolled students.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAllDeptCourses(!showAllDeptCourses)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer border ${
                showAllDeptCourses
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {showAllDeptCourses ? 'Showing All Dept Courses' : 'Filter to My Allocations'}
            </button>
          </div>
        </div>

        {/* Semester Buttons Bar: Sem 1 to Sem 6 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          <button
            id="sem-btn-all"
            onClick={() => setSelectedSemester('all')}
            className={`px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all text-center cursor-pointer border ${
              selectedSemester === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-slate-50 hover:bg-white text-slate-700 border-slate-200/80 hover:border-slate-300'
            }`}
          >
            <span className="block font-bold text-xs">All Semesters</span>
            <span className="text-[10px] opacity-75">BCA 3-Year</span>
          </button>

          {[1, 2, 3, 4, 5, 6].map((semNum) => {
            const semInfo = semesters.find((s) => s.number === semNum);
            const isSelected = selectedSemester === semNum;
            const myCourseCount = courses.filter((c) => c.semester === semNum).length;

            return (
              <button
                key={semNum}
                id={`sem-btn-${semNum}`}
                onClick={() => setSelectedSemester(semNum)}
                className={`px-3 py-2.5 rounded-2xl text-xs transition-all text-left cursor-pointer border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 hover:bg-white text-slate-700 border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">Sem {semNum}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {myCourseCount}
                  </span>
                </div>
                <span className="text-[10px] opacity-75 block truncate">
                  {semNum <= 2 ? 'Year 1' : semNum <= 4 ? 'Year 2' : 'Year 3'} • {semNum % 2 === 1 ? 'Odd Term' : 'Even Term'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. COURSE / SUBJECT SELECTOR • Step 2 */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Academic Workflow • Step 2
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">
                {facultyAssignedCourses.length} Courses Available
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">
              Select Course / Subject
            </h3>
            <p className="text-xs text-slate-500">
              Pick your allocated subject to view the enrolled student list, record attendance sessions, or enter CIA marks.
            </p>
          </div>
        </div>

        {/* Course Cards Carousel / Grid */}
        {facultyAssignedCourses.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <p className="text-xs font-semibold text-slate-700">No courses available for this semester selection</p>
            <p className="text-[11px] text-slate-400">Add or allocate courses using the Database Studio or Admin Portal.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {facultyAssignedCourses.map((c) => {
              const isSelected = activeCourse?.id === c.id;
              const enrStudents = getEnrolledStudentsForCourse(c.id);

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCourseId(c.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900 ring-offset-2'
                      : 'bg-slate-50 hover:bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'
                      }`}>
                        {c.courseCode}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-white/10 text-slate-200' : 'bg-slate-100 text-slate-600'
                      }`}>
                        Sem {c.semester}
                      </span>
                    </div>

                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      isSelected ? 'text-slate-300' : 'text-slate-500'
                    }`}>
                      {c.credits} Credits
                    </span>
                  </div>

                  <h4 className="font-bold text-sm sm:text-base mt-2 leading-snug">
                    {c.courseName}
                  </h4>

                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-200/50 text-xs">
                    <span className={`flex items-center gap-1 font-medium ${
                      isSelected ? 'text-slate-300' : 'text-slate-500'
                    }`}>
                      <Users className="w-3.5 h-3.5" />
                      <span>{enrStudents.length} Students</span>
                    </span>

                    <span className={`text-[11px] font-semibold ${
                      isSelected ? 'text-emerald-300' : 'text-emerald-700'
                    }`}>
                      {c.courseType}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. ACTIVE COURSE WORKSPACE (Roster, Attendance, CIA Marks, Performance) */}
      {activeCourse ? (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-6">
          {/* Active Course Header & Meta */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-900 text-white">
                  {activeCourse.courseCode}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800">
                  Semester {activeCourse.semester} • {activeCourse.courseType}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-600 font-medium">
                  Section A • Regulation 2024 CBCS
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {activeCourse.courseName}
              </h2>
              <p className="text-xs text-slate-500 max-w-2xl">
                {(activeCourse as any).description || `${activeCourse.courseName} (${activeCourse.courseCode}) - Core BCA Semester ${activeCourse.semester} course with continuous internal assessment modules.`}
              </p>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Enrolled</span>
                <span className="text-lg font-bold text-slate-900">{enrolledStudents.length}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Avg Attn</span>
                <span className="text-lg font-bold text-emerald-700">{courseMetrics.avgAtt}%</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">At Risk</span>
                <span className={`text-lg font-bold ${courseMetrics.atRiskCount > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                  {courseMetrics.atRiskCount}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Pass Rate</span>
                <span className="text-lg font-bold text-slate-900">{courseMetrics.passRate}%</span>
              </div>
            </div>
          </div>

          {/* Sub-Tabs: 1. Enrolled Students, 2. Mark Attendance, 3. Enter CIA Marks, 4. Performance */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto scrollbar-none">
            <button
              id="course-tab-roster"
              onClick={() => setCourseSubTab('roster')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                courseSubTab === 'roster'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Enrolled Students ({enrolledStudents.length})</span>
            </button>

            <button
              id="course-tab-attendance"
              onClick={() => setCourseSubTab('attendance')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                courseSubTab === 'attendance'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark Course Attendance</span>
            </button>

            <button
              id="course-tab-marks"
              onClick={() => setCourseSubTab('marks')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                courseSubTab === 'marks'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Enter CIA Marks</span>
            </button>

            <button
              id="course-tab-performance"
              onClick={() => setCourseSubTab('performance')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                courseSubTab === 'performance'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Course Performance</span>
            </button>
          </div>

          {/* SUB-VIEW 1: ENROLLED STUDENTS ROSTER */}
          {courseSubTab === 'roster' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search enrolled students..."
                    value={rosterSearch}
                    onChange={(e) => setRosterSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Showing {filteredRoster.length} students</span>
                </div>
              </div>

              {/* Students Table */}
              <div className="border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 pl-4">Student</th>
                      <th className="py-3">Roll No</th>
                      <th className="py-3">Semester</th>
                      <th className="py-3">Attendance</th>
                      <th className="py-3">CIA-1 (25)</th>
                      <th className="py-3">CIA-2 (25)</th>
                      <th className="py-3 pr-4 text-right">Academic Record</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredRoster.map((st) => {
                      const cia1 = (st as any)?.courseMarks?.cia1 ?? (st as any)?.internalMarks?.cia1 ?? Math.min(25, Math.max(14, Math.round(st.cgpa * 2.5)));
                      const cia2 = (st as any)?.courseMarks?.cia2 ?? (st as any)?.internalMarks?.cia2 ?? Math.min(25, Math.max(13, Math.round(st.cgpa * 2.4)));

                      return (
                        <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 pl-4">
                            <div>
                              <span className="font-bold text-slate-900 text-xs">{st.name}</span>
                              <span className="text-[11px] text-slate-400 block">{st.email}</span>
                            </div>
                          </td>
                          <td className="py-3 font-mono text-slate-600">{st.studentId}</td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                              Sem {st.semester}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className={`font-semibold ${st.attendanceRate < 75 ? 'text-rose-600 font-bold' : 'text-slate-800'}`}>
                              {st.attendanceRate}%
                            </span>
                            {st.attendanceRate < 75 && (
                              <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-rose-100 text-rose-700">
                                Shortage
                              </span>
                            )}
                          </td>
                          <td className="py-3 font-mono font-semibold text-slate-900">{cia1}</td>
                          <td className="py-3 font-mono font-semibold text-slate-900">{cia2}</td>
                          <td className="py-3 pr-4 text-right">
                            <button
                              id={`open-record-${st.id}`}
                              onClick={() => onSelectStudent(st)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold text-xs transition-colors cursor-pointer"
                              title="Open complete student academic record"
                            >
                              <FileText className="w-3.5 h-3.5 text-slate-600" />
                              <span>Academic Record →</span>
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

          {/* SUB-VIEW 2: MARK COURSE ATTENDANCE */}
          {courseSubTab === 'attendance' && (
            <div className="space-y-5">
              {/* Session Controls Bar */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Date Picker */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                        Session Date
                      </label>
                      <input
                        type="date"
                        value={attendanceDate}
                        onChange={(e) => setAttendanceDate(e.target.value)}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none"
                      />
                    </div>

                    {/* Session Type */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                        Session Type
                      </label>
                      <select
                        value={sessionType}
                        onChange={(e) => setSessionType(e.target.value as any)}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none cursor-pointer"
                      >
                        <option value="THEORY">Theory Lecture (1 Hr)</option>
                        <option value="LAB">Lab Practical (2 Hrs)</option>
                        <option value="TUTORIAL">Tutorial / Seminar (1 Hr)</option>
                      </select>
                    </div>

                    {/* Topic Input */}
                    <div className="w-full sm:w-64">
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                        Curriculum Topic Covered
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Unit 3: Dynamic Memory Allocation"
                        value={sessionTopic}
                        onChange={(e) => setSessionTopic(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Calendar Working Day Badge */}
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                      todayCalendar.isWorking ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}>
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{todayCalendar.isWorking ? 'Working Day Validated' : 'Official Holiday'}</span>
                    </span>
                  </div>
                </div>

                {/* Status Tally and Bulk Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200/60">
                  <div className="flex items-center gap-4 text-xs font-medium">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-slate-600">Present:</span>
                      <strong className="text-slate-900">{presentCount}</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <span className="text-slate-600">Absent:</span>
                      <strong className="text-rose-600">{absentCount}</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="text-slate-600">Late:</span>
                      <strong className="text-amber-700">{lateCount}</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      <span className="text-slate-600">On Duty:</span>
                      <strong className="text-blue-700">{odCount}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleMarkAll('present')}
                      className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 rounded-full transition-colors cursor-pointer"
                    >
                      Mark All Present
                    </button>
                    <button
                      onClick={() => handleMarkAll('absent')}
                      className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 rounded-full transition-colors cursor-pointer"
                    >
                      Mark All Absent
                    </button>
                  </div>
                </div>
              </div>

              {/* Feedback Alert */}
              {attendanceFeedback && (
                <div className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                  attendanceFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {attendanceFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  )}
                  <span>{attendanceFeedback.message}</span>
                </div>
              )}

              {/* Attendance Sheet Table */}
              <div className="border border-slate-200/90 rounded-2xl overflow-hidden max-h-96 overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 bg-slate-100 z-10 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 pl-4">Enrolled Student</th>
                      <th className="py-2.5">Roll No</th>
                      <th className="py-2.5">Current Rate</th>
                      <th className="py-2.5 pr-4 text-right">Attendance Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {enrolledStudents.map((st) => {
                      const current = attendanceSheet[st.id]?.status || 'present';
                      return (
                        <tr key={st.id} className="hover:bg-slate-50/70">
                          <td className="py-2.5 pl-4">
                            <span className="font-bold text-slate-900">{st.name}</span>
                          </td>
                          <td className="py-2.5 font-mono text-slate-500">{st.studentId}</td>
                          <td className="py-2.5">
                            <span className={`font-semibold ${st.attendanceRate < 75 ? 'text-rose-600' : 'text-slate-700'}`}>
                              {st.attendanceRate}%
                            </span>
                          </td>
                          <td className="py-2.5 pr-4 text-right">
                            <div className="inline-flex rounded-full bg-slate-100 p-0.5 gap-0.5">
                              <button
                                onClick={() => handleStatusToggle(st.id, 'present')}
                                className={`px-2.5 py-0.5 rounded-full font-semibold text-[11px] transition-colors cursor-pointer ${
                                  current === 'present' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                P
                              </button>
                              <button
                                onClick={() => handleStatusToggle(st.id, 'absent')}
                                className={`px-2.5 py-0.5 rounded-full font-semibold text-[11px] transition-colors cursor-pointer ${
                                  current === 'absent' ? 'bg-rose-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                A
                              </button>
                              <button
                                onClick={() => handleStatusToggle(st.id, 'late')}
                                className={`px-2.5 py-0.5 rounded-full font-semibold text-[11px] transition-colors cursor-pointer ${
                                  current === 'late' ? 'bg-amber-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                L
                              </button>
                              <button
                                onClick={() => handleStatusToggle(st.id, 'od')}
                                className={`px-2.5 py-0.5 rounded-full font-semibold text-[11px] transition-colors cursor-pointer ${
                                  current === 'od' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                OD
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons: Save Draft & Finalize */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-500">
                  Finalizing will automatically log an official audit trail and trigger simulated SMS to parents for absentees.
                </span>

                <div className="flex items-center gap-2">
                  <button
                    disabled={savingAttendance}
                    onClick={() => handleSaveAttendance(false)}
                    className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-full transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Draft</span>
                  </button>

                  <button
                    disabled={savingAttendance || !todayCalendar.isWorking}
                    onClick={() => handleSaveAttendance(true)}
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-full transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{savingAttendance ? 'Processing...' : 'Finalize & Dispatch SMS'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SUB-VIEW 3: ENTER CIA MARKS */}
          {courseSubTab === 'marks' && (
            <div className="space-y-5">
              {/* Assessment Type Picker */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Continuous Internal Assessment Type
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      {(['CIA_1', 'CIA_2', 'CIA_3', 'ASSIGNMENT', 'PRACTICAL', 'FINAL_EXAM'] as AssessmentType[]).map((t) => (
                        <button
                          key={t}
                          onClick={() => setAssessmentType(t)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                            assessmentType === t
                              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {t.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Maximum Marks</span>
                    <span className="text-base font-bold text-slate-900 font-mono">{maxMarksForType} Marks</span>
                  </div>
                </div>
              </div>

              {/* Marks Feedback */}
              {marksFeedback && (
                <div className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                  marksFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{marksFeedback.message}</span>
                </div>
              )}

              {/* Marks Entry Grid */}
              <div className="border border-slate-200/90 rounded-2xl overflow-hidden max-h-96 overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 bg-slate-100 z-10 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 pl-4">Student</th>
                      <th className="py-2.5">Roll No</th>
                      <th className="py-2.5">Score (/ {maxMarksForType})</th>
                      <th className="py-2.5">Percentage</th>
                      <th className="py-2.5 pr-4 text-right">Projected Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {enrolledStudents.map((st) => {
                      const currentVal = marksSheet[st.id]?.marksObtained ?? 0;
                      const pct = Math.round((currentVal / maxMarksForType) * 100);
                      const grade = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : 'F';

                      return (
                        <tr key={st.id} className="hover:bg-slate-50/70">
                          <td className="py-2.5 pl-4 font-bold text-slate-900">{st.name}</td>
                          <td className="py-2.5 font-mono text-slate-500">{st.studentId}</td>
                          <td className="py-2.5">
                            <input
                              type="number"
                              min={0}
                              max={maxMarksForType}
                              value={currentVal}
                              onChange={(e) => handleMarkChange(st.id, e.target.value)}
                              className="w-20 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                            />
                          </td>
                          <td className="py-2.5 font-mono text-slate-600">{pct}%</td>
                          <td className="py-2.5 pr-4 text-right">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              grade === 'F' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-800'
                            }`}>
                              Grade {grade}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Marks Save Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-500">
                  Finalizing will commit scores to the academic registry and log faculty authentication signatures.
                </span>

                <div className="flex items-center gap-2">
                  <button
                    disabled={savingMarks}
                    onClick={() => handleSaveMarks(false)}
                    className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-full transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Draft Marks</span>
                  </button>

                  <button
                    disabled={savingMarks}
                    onClick={() => handleSaveMarks(true)}
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-full transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>{savingMarks ? 'Saving...' : 'Finalize Assessment'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SUB-VIEW 4: COURSE PERFORMANCE */}
          {courseSubTab === 'performance' && (
            <div className="space-y-6">
              {/* Analytics Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-xs font-bold uppercase text-slate-400 block">Class Average Attendance</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl sm:text-3xl font-bold text-slate-900">{courseMetrics.avgAtt}%</span>
                    <span className="text-xs font-semibold text-emerald-700">Healthy Threshold ≥75%</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-xs font-bold uppercase text-slate-400 block">CIA-1 Average Score</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl sm:text-3xl font-bold text-slate-900">21.4</span>
                    <span className="text-xs text-slate-500 font-mono">/ 25.0</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-xs font-bold uppercase text-slate-400 block">Projected Pass Rate</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl sm:text-3xl font-bold text-emerald-700">{courseMetrics.passRate}%</span>
                    <span className="text-xs text-slate-500">Based on CIA &amp; Attendance</span>
                  </div>
                </div>
              </div>

              {/* At-Risk Intervention List */}
              <div className="border border-slate-200/90 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Course Intervention &amp; Support List</h4>
                    <p className="text-xs text-slate-500">
                      Students requiring faculty mentoring or counseling referral in {activeCourse.courseCode}.
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                    {courseMetrics.atRiskCount} Students Flagged
                  </span>
                </div>

                {courseMetrics.atRiskCount === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-500">
                    No students currently at academic risk in this course.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {enrolledStudents
                      .filter((s) => s.attendanceRate < 75)
                      .map((st) => (
                        <div key={st.id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between gap-3 text-xs">
                          <div>
                            <span className="font-bold text-slate-900">{st.name}</span>
                            <span className="text-slate-400 font-mono ml-2">({st.studentId})</span>
                            <span className="text-rose-600 font-semibold block text-[11px] mt-0.5">
                              Shortage: {st.attendanceRate}% cumulative attendance
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onSelectStudent(st)}
                              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-semibold rounded-full text-xs transition-colors cursor-pointer"
                            >
                              Open Academic Record →
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center shadow-2xs space-y-2">
          <p className="text-sm font-semibold text-slate-800">No Course Selected</p>
          <p className="text-xs text-slate-400">Select an active subject from above to view students, record attendance, and enter CIA marks.</p>
        </div>
      )}
    </div>
  );
};
