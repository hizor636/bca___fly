import { Course, FacultyCourseAssignment, StudentCourseEnrollment, CourseAttendanceRecord, CourseMarks } from '../types';

export const INITIAL_COURSES: Course[] = [
  {
    id: 'crs-501',
    courseCode: 'BCA-501',
    courseName: 'Web Application Architecture',
    shortName: 'Web Arch',
    semester: 5,
    departmentId: 'dept-bca',
    academicScheme: 'BCA-2024-REG',
    credits: 4,
    courseType: 'Theory + Lab',
    maxMarks: 100,
    cia1MaxMarks: 20,
    cia2MaxMarks: 20,
    cia3MaxMarks: 20,
    attendanceRequired: 75,
    isActive: true,
    createdAt: '2026-08-01',
    updatedAt: '2026-08-01'
  },
  {
    id: 'crs-502',
    courseCode: 'BCA-502',
    courseName: 'Cloud & Distributed Systems',
    shortName: 'Cloud Sys',
    semester: 5,
    departmentId: 'dept-bca',
    academicScheme: 'BCA-2024-REG',
    credits: 4,
    courseType: 'Theory',
    maxMarks: 100,
    cia1MaxMarks: 20,
    cia2MaxMarks: 20,
    cia3MaxMarks: 20,
    attendanceRequired: 75,
    isActive: true,
    createdAt: '2026-08-01',
    updatedAt: '2026-08-01'
  },
  {
    id: 'crs-503',
    courseCode: 'BCA-503',
    courseName: 'Artificial Intelligence & Machine Learning',
    shortName: 'AI & ML',
    semester: 5,
    departmentId: 'dept-bca',
    academicScheme: 'BCA-2024-REG',
    credits: 4,
    courseType: 'Theory + Lab',
    maxMarks: 100,
    cia1MaxMarks: 20,
    cia2MaxMarks: 20,
    cia3MaxMarks: 20,
    attendanceRequired: 75,
    isActive: true,
    createdAt: '2026-08-01',
    updatedAt: '2026-08-01'
  },
  {
    id: 'crs-504',
    courseCode: 'BCA-504',
    courseName: 'Information Security & Cryptography',
    shortName: 'InfoSec',
    semester: 5,
    departmentId: 'dept-bca',
    academicScheme: 'BCA-2024-REG',
    credits: 3,
    courseType: 'Theory',
    maxMarks: 100,
    cia1MaxMarks: 20,
    cia2MaxMarks: 20,
    cia3MaxMarks: 20,
    attendanceRequired: 75,
    isActive: true,
    createdAt: '2026-08-01',
    updatedAt: '2026-08-01'
  },
  {
    id: 'crs-505',
    courseCode: 'BCA-505',
    courseName: 'Full-Stack Capstone Project Lab',
    shortName: 'Capstone Lab',
    semester: 5,
    departmentId: 'dept-bca',
    academicScheme: 'BCA-2024-REG',
    credits: 2,
    courseType: 'Lab',
    maxMarks: 100,
    cia1MaxMarks: 20,
    cia2MaxMarks: 20,
    cia3MaxMarks: 20,
    attendanceRequired: 75,
    isActive: true,
    createdAt: '2026-08-01',
    updatedAt: '2026-08-01'
  }
];

export const INITIAL_FACULTY_COURSE_ASSIGNMENTS: FacultyCourseAssignment[] = [
  { id: 'fca-1', facultyId: 'faculty-1', courseId: 'crs-501', section: 'A', batch: '2024-27', academicYear: '2026-27', term: 'Odd', isActive: true },
  { id: 'fca-2', facultyId: 'faculty-1', courseId: 'crs-501', section: 'B', batch: '2024-27', academicYear: '2026-27', term: 'Odd', isActive: true },
  { id: 'fca-3', facultyId: 'faculty-1', courseId: 'crs-502', section: 'A', batch: '2024-27', academicYear: '2026-27', term: 'Odd', isActive: true },
  { id: 'fca-4', facultyId: 'faculty-2', courseId: 'crs-503', section: 'B', batch: '2024-27', academicYear: '2026-27', term: 'Odd', isActive: true },
  { id: 'fca-5', facultyId: 'faculty-2', courseId: 'crs-504', section: 'B', batch: '2024-27', academicYear: '2026-27', term: 'Odd', isActive: true }
];

const studentIds = [
  { id: 'student-1', sec: 'A' },
  { id: 'student-2', sec: 'A' },
  { id: 'student-3', sec: 'A' },
  { id: 'student-4', sec: 'A' },
  { id: 'student-5', sec: 'A' },
  { id: 'student-6', sec: 'B' },
  { id: 'student-7', sec: 'B' },
  { id: 'student-8', sec: 'B' },
  { id: 'student-9', sec: 'B' },
  { id: 'student-10', sec: 'B' }
];

export const INITIAL_STUDENT_COURSE_ENROLLMENTS: StudentCourseEnrollment[] = [];
export const INITIAL_COURSE_MARKS: CourseMarks[] = [];
export const INITIAL_COURSE_ATTENDANCE: CourseAttendanceRecord[] = [];

for (const st of studentIds) {
  for (const crs of INITIAL_COURSES) {
    INITIAL_STUDENT_COURSE_ENROLLMENTS.push({
      id: `sce-${crs.id}-${st.id}`,
      studentId: st.id,
      courseId: crs.id,
      academicYear: '2026-27',
      section: st.sec,
      enrollmentStatus: 'Enrolled'
    });

    const isGroupA = st.sec === 'A';
    INITIAL_COURSE_MARKS.push({
      id: `cm-${crs.id}-${st.id}`,
      studentId: st.id,
      courseId: crs.id,
      semester: 5,
      academicYear: '2026-27',
      cia1: isGroupA ? 18.5 : 17.5,
      cia2: isGroupA ? 19.0 : 18.0,
      cia3: 18.0,
      assignmentMarks: 9.5,
      practicalMarks: 19.0,
      internalTotal: isGroupA ? 47.5 : 45.0,
      finalExamMarks: isGroupA ? 42.0 : 40.0,
      finalGrade: isGroupA ? 'A+' : 'A',
      updatedBy: isGroupA ? 'faculty-1' : 'faculty-2',
      updatedAt: '2026-09-01',
      status: 'Finalized'
    });

    INITIAL_COURSE_ATTENDANCE.push({
      id: `att-${crs.id}-${st.id}`,
      studentId: st.id,
      courseId: crs.id,
      facultyId: isGroupA ? 'faculty-1' : 'faculty-2',
      date: '2026-09-04',
      sessionType: 'THEORY',
      status: 'PRESENT',
      markedAt: '2026-09-04 10:30',
      markedBy: isGroupA ? 'Dr. Sarah Jenkins' : 'Prof. Rajesh Kumar',
      finalized: true
    });
  }
}
