import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  UserRole,
  User,
  Student,
  FacultyMember,
  StudentAssignment,
  AttendanceSettings,
  WorkingDay,
  SmsTemplate,
  SmsMessage,
  CounselingReferral,
  CounselingNote,
  AuditLog,
  SemesterInfo,
  ClassSection,
  MentoringNote,
  Course,
  FacultyCourseAssignment,
  StudentCourseEnrollment,
  CourseAttendanceRecord,
  CourseMarks,
  TimetableSlot,
  AttendanceCorrectionRequest,
  StudentDocument,
  TenantInfo,
  SecurityIncident,
  Department,
  AcademicYear,
  Batch,
  DepartmentNotice,
  AssessmentScheme,
  SmsSettings,
  SmsType,
  SmsStatus
} from '../types';
import {
  DEFAULT_SMS_SETTINGS,
  MASTER_SMS_TEMPLATES,
  SEEDED_SMS_HISTORY,
  executeSmsDispatch,
  renderTemplate
} from '../services/sms/smsService';
import {
  DEPARTMENTS as INITIAL_DEPARTMENTS,
  ACADEMIC_YEARS as INITIAL_ACADEMIC_YEARS,
  BATCHES as INITIAL_BATCHES,
  SEMESTERS as DEFAULT_SEMESTERS,
  CLASSES,
  INITIAL_FACULTY,
  INITIAL_ADMINS,
  INITIAL_SUPER_ADMINS,
  INITIAL_PARENTS,
  INITIAL_COUNSELORS,
  INITIAL_STUDENTS,
  INITIAL_ASSIGNMENTS,
  INITIAL_WORKING_DAYS,
  INITIAL_ATTENDANCE_SETTINGS,
  INITIAL_SMS_TEMPLATES,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTICES,
  INITIAL_TIMETABLES,
  INITIAL_TENANTS,
  INITIAL_COURSES,
  INITIAL_FACULTY_COURSE_ASSIGNMENTS,
  INITIAL_STUDENT_COURSE_ENROLLMENTS,
  INITIAL_COURSE_MARKS,
  INITIAL_COURSE_ATTENDANCE
} from '../data/mockStore';
import { api } from '../services/api';

export const DEFAULT_ROOT_ADMIN: User = INITIAL_ADMINS[0] || {
  id: 'admin-1',
  username: 'admin',
  password: 'admin123',
  name: 'Dr. V. Swaminathan (HOD)',
  email: 'admin@bcafly.edu',
  role: 'admin',
  phone: '+91 98765 00001',
  departmentId: 'dept-bca',
  isActive: true,
  createdAt: '2026-08-01',
  designation: 'Head of Department & Administrator'
};

export const DEFAULT_SUPER_ADMIN: User = INITIAL_SUPER_ADMINS[0] || {
  id: 'super-admin-1',
  username: 'superadmin',
  password: 'superadmin123',
  name: 'Platform Director Sarah Vance',
  email: 'superadmin@bcafly.edu',
  role: 'super_admin',
  phone: '+1 (555) 001-9999',
  departmentId: 'PLATFORM',
  isActive: true,
  createdAt: '2026-08-01',
  designation: 'Global Platform Architect'
};

export const DEFAULT_FALLBACK_FACULTY: FacultyMember = INITIAL_FACULTY[0] || {
  id: 'faculty-1',
  name: 'Dr. Sarah Jenkins',
  designation: 'Associate Professor & Group A Mentor',
  department: 'Department of Computer Applications',
  email: 'sarah.jenkins@bcafly.edu',
  phone: '+1 (555) 234-5678',
  office: 'Block B, Room 402',
  assignedStudentsCount: 5,
  specialization: 'Web Architecture & Cloud Systems',
  courses: ['BCA-501 Web Application Architecture', 'BCA-502 Cloud & Distributed Systems']
};

export const DEFAULT_FALLBACK_STUDENT: Student = INITIAL_STUDENTS[0] || {
  id: 'student-1',
  studentId: 'BCA-2026-001',
  name: 'Alexander Wright',
  initials: 'AW',
  avatarBg: 'bg-indigo-100',
  avatarText: 'text-indigo-700',
  course: 'Bachelor of Computer Applications',
  semester: 5,
  section: 'A',
  email: 'alexander.wright@student.bcafly.edu',
  phone: '+1 (555) 301-8841',
  attendanceRate: 88.5,
  mentoringStatus: 'Regular',
  cgpa: 3.82,
  sgpaHistory: [3.75, 3.8, 3.9, 3.85, 3.82],
  assignedFaculty: 'Dr. Sarah Jenkins',
  assignedFacultyId: 'faculty-1',
  weeklyAttendance: [90, 85, 92, 88, 85, 90],
  totalClassesHeld: 140,
  totalClassesAttended: 124,
  condonationEligible: true,
  mentoringNotes: [],
  subjectGrades: []
};

export const DEFAULT_FALLBACK_COUNSELOR: User = INITIAL_COUNSELORS[0] || {
  id: 'counselor-1',
  username: 'counselor1',
  password: 'counselor123',
  name: 'Dr. Priya Sharma',
  email: 'priya.counselor@bcafly.edu',
  role: 'counselor',
  phone: '+1 (555) 880-3322',
  departmentId: 'dept-bca',
  isActive: true,
  createdAt: '2026-08-01',
  designation: 'Student Wellness Counselor'
};

export const DEFAULT_FALLBACK_PARENT: User = INITIAL_PARENTS[0] || {
  id: 'parent-1',
  username: 'parent1',
  password: 'parent123',
  name: 'Robert Wright',
  email: 'robert.wright@parent.bcafly.edu',
  role: 'parent',
  phone: '+1 (555) 301-9900',
  departmentId: 'dept-bca',
  isActive: true,
  createdAt: '2026-08-01',
  designation: 'Parent / Guardian (Ward: Alexander Wright)',
  studentId: 'BCA-2026-001'
};

export interface SixSemesterRecord {
  student: Student;
  semesters: {
    semester: number;
    name: string;
    status: 'completed' | 'active' | 'future';
    sgpa?: number;
    courses: {
      course: Course;
      attendancePercent: number;
      cia1: number | null;
      cia2: number | null;
      cia3: number | null;
      internal: number | null;
      grade: string;
      status: 'Finalized' | 'Pending' | 'At Risk' | 'Regular' | 'Not Started';
    }[];
  }[];
}

interface DemoContextType {
  currentRole: UserRole;
  currentUser: User;
  activeFaculty: FacultyMember;
  activeStudent: Student;
  activeCounselor: User;
  activeParent: User;
  activeSuperAdmin: User;

  // Master Data Single Source of Truth
  departments: Department[];
  academicYears: AcademicYear[];
  semesters: SemesterInfo[];
  batches: Batch[];
  courses: Course[];
  facultyList: FacultyMember[];
  students: Student[];
  facultyCourseAssignments: FacultyCourseAssignment[];
  studentCourseEnrollments: StudentCourseEnrollment[];
  assignments: StudentAssignment[];
  courseMarks: CourseMarks[];
  courseAttendance: CourseAttendanceRecord[];
  auditLogs: AuditLog[];

  // Supporting modules
  classes: ClassSection[];
  workingDays: WorkingDay[];
  attendanceSettings: AttendanceSettings;
  smsSettings: SmsSettings;
  smsTemplates: SmsTemplate[];
  smsMessages: SmsMessage[];
  counselingReferrals: CounselingReferral[];
  counselingNotes: CounselingNote[];
  timetables: TimetableSlot[];
  correctionRequests: AttendanceCorrectionRequest[];
  documents: StudentDocument[];
  tenants: TenantInfo[];
  securityIncidents: SecurityIncident[];
  notices: DepartmentNotice[];
  assessmentSchemes: AssessmentScheme[];

  counselorList: User[];
  adminList: User[];
  superAdminList: User[];
  parentList: User[];

  isAuthenticated: boolean;
  accessDeniedMessage: string | null;
  isLoading: boolean;

  // Session & Access Methods
  login: (email: string, password: string, roleHint?: UserRole) => { success: boolean; error?: string; role?: UserRole };
  logout: () => void;
  requestPasswordReset: (email: string) => { success: boolean; message: string };
  setAccessDeniedMessage: (msg: string | null) => void;
  switchRole: (role: UserRole, targetId?: string) => void;
  setActiveFaculty: (fac: FacultyMember) => void;
  setActiveStudent: (st: Student) => void;
  refreshData: () => Promise<void>;

  // Administration Master Data Operations (CRUD)
  addDepartment: (dept: { name: string; code: string; deptHeadId?: string }) => Promise<{ success: boolean; id?: string }>;
  updateDepartment: (id: string, updates: Partial<Department>) => Promise<void>;
  archiveDepartment: (id: string) => Promise<void>;
  deleteDepartment: (id: string) => Promise<void>;

  addAcademicYear: (ay: { name: string; startDate: string; endDate: string; attendanceRule?: number; isActive?: boolean }) => Promise<{ success: boolean; id?: string }>;
  updateAcademicYear: (id: string, updates: Partial<AcademicYear>) => Promise<void>;
  archiveAcademicYear: (id: string) => Promise<void>;
  activateAcademicYear: (id: string) => Promise<void>;

  configureSemester: (sem: Partial<SemesterInfo>) => Promise<{ success: boolean; id?: string }>;
  updateSemester: (id: string, updates: Partial<SemesterInfo>) => Promise<void>;

  addBatch: (batch: Partial<Batch>) => Promise<{ success: boolean; id?: string }>;
  updateBatch: (id: string, updates: Partial<Batch>) => Promise<void>;
  archiveBatch: (id: string) => Promise<void>;

  addCourse: (course: Partial<Course>) => Promise<Course | null>;
  updateCourse: (id: string, updates: Partial<Course>) => Promise<void>;
  archiveCourse: (id: string) => Promise<{ success: boolean; message: string }>;
  restoreCourse: (id: string) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;

  addFaculty: (faculty: Partial<FacultyMember>) => Promise<{ success: boolean; id?: string }>;
  updateFaculty: (id: string, updates: Partial<FacultyMember>) => Promise<void>;
  archiveFaculty: (id: string) => Promise<void>;
  deleteFaculty: (id: string) => Promise<void>;
  importFacultyCsv: (facultyList: Partial<FacultyMember>[]) => Promise<{ importedCount: number; errors: string[] }>;

  addStudent: (student: Partial<Student>) => Promise<{ success: boolean; id?: string; studentId?: string }>;
  updateStudent: (id: string, updates: Partial<Student>) => Promise<void>;
  archiveStudent: (id: string) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  importStudentsCsv: (studentList: Partial<Student>[]) => Promise<{ importedCount: number; errors: string[] }>;

  enrollStudentInCourse: (enrollment: Partial<StudentCourseEnrollment>) => Promise<void>;
  bulkEnrollStudents: (enrollments: Partial<StudentCourseEnrollment>[]) => Promise<void>;
  removeStudentEnrollment: (id: string) => Promise<void>;

  assignFacultyToCourse: (assignment: Partial<FacultyCourseAssignment>) => Promise<void>;
  removeFacultyCourseAssignment: (id: string) => Promise<void>;
  reassignStudent: (studentId: string, newFacultyId: string) => Promise<void>;

  // Scoped & Operational Methods
  getScopedStudentsForActiveFaculty: () => Student[];
  getAssignedCoursesForFaculty: (facultyId: string, semester?: number | 'all') => Course[];
  getEnrolledStudentsForCourse: (courseId: string, section?: string) => { student: Student; enrollment: StudentCourseEnrollment; attendancePercent: number; marks?: CourseMarks }[];
  getStudentSixSemesterRecord: (studentId: string) => SixSemesterRecord;
  getScopedDocumentsForStudent: (studentId: string) => StudentDocument[];
  getScopedTimetable: (semester: number, section?: string) => TimetableSlot[];

  saveCourseAttendance: (
    courseId: string,
    facultyId: string,
    date: string,
    sessionType: 'THEORY' | 'LAB' | 'TUTORIAL',
    records: { studentId: string; status: 'PRESENT' | 'ABSENT' | 'LATE' | 'ON_DUTY'; remarks?: string }[],
    finalize?: boolean
  ) => Promise<{ success: boolean; message: string }>;

  markAndFinalizeAttendance: (
    classId: string,
    records: { studentId: string; status: 'present' | 'absent' | 'late' }[]
  ) => { success: boolean; smsCount: number; message: string };

  saveCourseMarks: (
    courseId: string,
    assessmentType: 'cia1' | 'cia2' | 'cia3' | 'assignmentMarks' | 'practicalMarks' | 'finalExamMarks',
    marksEntries: { studentId: string; mark: number | null }[],
    finalize?: boolean
  ) => Promise<{ success: boolean; message: string }>;

  addMentoringSession: (studentId: string, note: Omit<MentoringNote, 'id' | 'facultyName' | 'facultyId'>) => Promise<void>;
  createCounselingReferral: (studentId: string, reasonCode: CounselingReferral['reasonCode'], remarks: string) => Promise<void>;
  addCounselingNote: (referralId: string, noteText: string, treatmentPlan: string, updatedMentorStatus?: CounselingReferral['mentorVisibleStatus']) => void;

  updateAttendanceSettings: (settings: Partial<AttendanceSettings>) => void;
  toggleWorkingDay: (dateStr: string) => void;
  updateCondonationStatus: (studentId: string, status: 'Pending' | 'Approved' | 'Debarred') => void;
  updateSmsTemplate: (id: string, body: string) => void;
  updateSmsSettings: (settings: Partial<SmsSettings>) => void;
  dispatchManualSms: (payload: { recipientPhone: string; studentId?: string; studentName?: string; body: string; messageType: SmsType; triggerReason?: string }) => Promise<{ success: boolean; messageId?: string; error?: string }>;
  retrySmsMessage: (id: string) => Promise<{ success: boolean; error?: string }>;
  resetDemoData: () => void;

  submitCorrectionRequest: (req: Omit<AttendanceCorrectionRequest, 'id' | 'createdAt' | 'status'>) => { success: boolean; message: string };
  reviewCorrectionRequest: (id: string, status: 'Approved' | 'Rejected', adminRemarks?: string) => { success: boolean; message: string };
  uploadDocument: (doc: Omit<StudentDocument, 'id' | 'uploadDate' | 'isVerified' | 'accessToken'>) => { success: boolean; message: string; document: StudentDocument };
  deleteDocument: (id: string) => { success: boolean; message: string };
  createTenant: (tenant: Omit<TenantInfo, 'id' | 'createdAt'>) => { success: boolean; message: string };
  toggleSecurityIncident: (id: string) => void;

  // Announcements & Circulars
  addNotice: (notice: Omit<DepartmentNotice, 'id'>) => Promise<{ success: boolean; id: string }>;
  deleteNotice: (id: string) => Promise<void>;

  // Assessment Scheme Configuration
  addAssessmentScheme: (scheme: Omit<AssessmentScheme, 'id'>) => Promise<{ success: boolean; id: string }>;
  updateAssessmentScheme: (id: string, updates: Partial<AssessmentScheme>) => Promise<void>;
  deleteAssessmentScheme: (id: string) => Promise<void>;
}

export const INITIAL_ASSESSMENT_SCHEMES: AssessmentScheme[] = [
  {
    id: 'as-cia1',
    name: 'CIA-1 Continuous Internal Assessment',
    type: 'CIA',
    maxMarks: 20,
    weightagePercent: 20,
    minPassingMarks: 8,
    applicableSemesters: 'All Semesters (1-6)',
    isActive: true,
    guidelines: 'Conduct within 45 days of semester commencement. Written examination covering Units 1 & 2.'
  },
  {
    id: 'as-cia2',
    name: 'CIA-2 Mid-Term Evaluation',
    type: 'CIA',
    maxMarks: 20,
    weightagePercent: 20,
    minPassingMarks: 8,
    applicableSemesters: 'All Semesters (1-6)',
    isActive: true,
    guidelines: 'Mandatory second round internal evaluation covering Units 3 & 4. Closed prior to week 12.'
  },
  {
    id: 'as-lab',
    name: 'Continuous Lab Practicals & Viva Voce',
    type: 'LAB',
    maxMarks: 10,
    weightagePercent: 10,
    minPassingMarks: 4,
    applicableSemesters: 'All Semesters (1-6)',
    isActive: true,
    guidelines: 'Continuous laboratory record evaluation, code execution rubric, and individual viva.'
  },
  {
    id: 'as-final',
    name: 'University End-Semester Final Examination',
    type: 'FINAL',
    maxMarks: 50,
    weightagePercent: 50,
    minPassingMarks: 20,
    applicableSemesters: 'All Semesters (1-6)',
    isActive: true,
    guidelines: 'Centralized proctored comprehensive terminal assessment covering all 5 syllabus modules.'
  }
];

const DemoContext = createContext<DemoContextType | null>(null);

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('bcafly_authenticated') === 'true';
  });
  const [currentRole, setCurrentRole] = useState<UserRole>('faculty');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [failedLoginAttempts, setFailedLoginAttempts] = useState<number>(0);
  const [accessDeniedMessage, setAccessDeniedMessage] = useState<string | null>(null);

  // Master Data State (Institutional Source of Truth)
  const [departments, setDepartments] = useState<Department[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [semesters, setSemesters] = useState<SemesterInfo[]>(DEFAULT_SEMESTERS);
  const [batches, setBatches] = useState<Batch[]>(INITIAL_BATCHES);
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [facultyList, setFacultyList] = useState<FacultyMember[]>(INITIAL_FACULTY);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [facultyCourseAssignments, setFacultyCourseAssignments] = useState<FacultyCourseAssignment[]>(INITIAL_FACULTY_COURSE_ASSIGNMENTS);
  const [studentCourseEnrollments, setStudentCourseEnrollments] = useState<StudentCourseEnrollment[]>(INITIAL_STUDENT_COURSE_ENROLLMENTS);
  const [assignments, setAssignments] = useState<StudentAssignment[]>(INITIAL_ASSIGNMENTS);
  const [courseMarks, setCourseMarks] = useState<CourseMarks[]>(INITIAL_COURSE_MARKS);
  const [courseAttendance, setCourseAttendance] = useState<CourseAttendanceRecord[]>(INITIAL_COURSE_ATTENDANCE);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  // User Accounts
  const [adminList] = useState<User[]>(INITIAL_ADMINS);
  const [superAdminList] = useState<User[]>(INITIAL_SUPER_ADMINS);
  const [counselorList] = useState<User[]>(INITIAL_COUNSELORS);
  const [parentList] = useState<User[]>(INITIAL_PARENTS);

  // Active Users per portal
  const [activeFaculty, setActiveFacultyState] = useState<FacultyMember>(INITIAL_FACULTY[0] || DEFAULT_FALLBACK_FACULTY);
  const [activeStudent, setActiveStudentState] = useState<Student>(INITIAL_STUDENTS[0] || DEFAULT_FALLBACK_STUDENT);
  const [activeCounselor, setActiveCounselorState] = useState<User>(INITIAL_COUNSELORS[0] || DEFAULT_FALLBACK_COUNSELOR);
  const [activeParent, setActiveParentState] = useState<User>(INITIAL_PARENTS[0] || DEFAULT_FALLBACK_PARENT);
  const [activeSuperAdmin, setActiveSuperAdminState] = useState<User>(INITIAL_SUPER_ADMINS[0] || DEFAULT_SUPER_ADMIN);

  // Supporting modules
  const [classes] = useState<ClassSection[]>(CLASSES);
  const [workingDays, setWorkingDays] = useState<WorkingDay[]>(INITIAL_WORKING_DAYS);
  const [attendanceSettings, setAttendanceSettings] = useState<AttendanceSettings>(INITIAL_ATTENDANCE_SETTINGS);
  const [smsSettings, setSmsSettings] = useState<SmsSettings>(DEFAULT_SMS_SETTINGS);
  const [smsTemplates, setSmsTemplates] = useState<SmsTemplate[]>(MASTER_SMS_TEMPLATES);
  const [smsMessages, setSmsMessages] = useState<SmsMessage[]>(SEEDED_SMS_HISTORY);
  const [counselingReferrals, setCounselingReferrals] = useState<CounselingReferral[]>([]);
  const [counselingNotes, setCounselingNotes] = useState<CounselingNote[]>([]);
  const [notices, setNotices] = useState<DepartmentNotice[]>(INITIAL_NOTICES);
  const [assessmentSchemes, setAssessmentSchemes] = useState<AssessmentScheme[]>(INITIAL_ASSESSMENT_SCHEMES);
  const [timetables] = useState<TimetableSlot[]>(INITIAL_TIMETABLES);
  const [correctionRequests, setCorrectionRequests] = useState<AttendanceCorrectionRequest[]>([]);
  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [tenants, setTenants] = useState<TenantInfo[]>(INITIAL_TENANTS);
  const [securityIncidents, setSecurityIncidents] = useState<SecurityIncident[]>([]);

  // Refresh all state directly from backend APIs (Single Source of Truth)
  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [
        deptsRes,
        ayRes,
        semsRes,
        batchesRes,
        coursesRes,
        facultyRes,
        studentsRes,
        allocRes,
        enrRes,
        marksRes,
        attRes,
        auditRes
      ] = await Promise.allSettled([
        api.getDepartments(),
        api.getAcademicYears(),
        api.getSemesters(),
        api.getBatches(),
        api.getCourses(),
        api.getFaculty(),
        api.getStudents(),
        api.getFacultyAssignments(),
        api.getEnrollments(),
        api.getCourseMarks(),
        api.getCourseAttendance(),
        api.getAuditLogs()
      ]);

      if (deptsRes.status === 'fulfilled' && Array.isArray(deptsRes.value)) setDepartments(deptsRes.value);
      if (ayRes.status === 'fulfilled' && Array.isArray(ayRes.value)) setAcademicYears(ayRes.value);
      if (semsRes.status === 'fulfilled' && Array.isArray(semsRes.value) && semsRes.value.length > 0) setSemesters(semsRes.value);
      if (batchesRes.status === 'fulfilled' && Array.isArray(batchesRes.value)) setBatches(batchesRes.value);
      if (coursesRes.status === 'fulfilled' && Array.isArray(coursesRes.value)) setCourses(coursesRes.value);
      if (facultyRes.status === 'fulfilled' && Array.isArray(facultyRes.value)) {
        setFacultyList(facultyRes.value);
        if (facultyRes.value.length > 0 && activeFaculty.id === 'fac-default') {
          setActiveFacultyState(facultyRes.value[0]);
        }
      }
      if (studentsRes.status === 'fulfilled' && Array.isArray(studentsRes.value)) {
        setStudents(studentsRes.value);
        if (studentsRes.value.length > 0 && activeStudent.id === 'student-default') {
          setActiveStudentState(studentsRes.value[0]);
        }
      }
      if (allocRes.status === 'fulfilled' && Array.isArray(allocRes.value)) setFacultyCourseAssignments(allocRes.value);
      if (enrRes.status === 'fulfilled' && Array.isArray(enrRes.value)) setStudentCourseEnrollments(enrRes.value);
      if (marksRes.status === 'fulfilled' && Array.isArray(marksRes.value)) setCourseMarks(marksRes.value);
      if (attRes.status === 'fulfilled' && Array.isArray(attRes.value)) setCourseAttendance(attRes.value);
      if (auditRes.status === 'fulfilled' && Array.isArray(auditRes.value)) setAuditLogs(auditRes.value);
    } catch (err) {
      console.error('Error refreshing institutional state:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeFaculty.id, activeStudent.id]);

  // Load from backend on mount
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Current logged in user object
  const getCurrentUser = (): User => {
    if (currentRole === 'super_admin') {
      return activeSuperAdmin || DEFAULT_SUPER_ADMIN;
    } else if (currentRole === 'parent') {
      return activeParent || DEFAULT_FALLBACK_PARENT;
    } else if (currentRole === 'admin') {
      return adminList[0] || DEFAULT_ROOT_ADMIN;
    } else if (currentRole === 'faculty') {
      const fac = activeFaculty || DEFAULT_FALLBACK_FACULTY;
      return {
        id: fac.id,
        name: fac.name,
        email: fac.email,
        role: 'faculty',
        phone: fac.phone || '+1 (555) 000-0002',
        departmentId: 'dept-bca',
        isActive: true,
        createdAt: '2026-08-01',
        designation: fac.designation
      };
    } else if (currentRole === 'student') {
      const st = activeStudent || DEFAULT_FALLBACK_STUDENT;
      return {
        id: st.id,
        name: st.name,
        email: st.email,
        role: 'student',
        phone: st.phone || '+1 (555) 000-0003',
        departmentId: 'dept-bca',
        isActive: true,
        createdAt: '2026-08-01',
        studentId: st.studentId,
        semester: st.semester
      };
    } else {
      return activeCounselor || DEFAULT_FALLBACK_COUNSELOR;
    }
  };

  const switchRole = (role: UserRole, targetId?: string) => {
    setCurrentRole(role);
    if (role === 'faculty' && targetId) {
      const fac = facultyList.find((f) => f.id === targetId) || DEFAULT_FALLBACK_FACULTY;
      setActiveFacultyState(fac);
    } else if (role === 'student' && targetId) {
      const st = students.find((s) => s.id === targetId) || DEFAULT_FALLBACK_STUDENT;
      setActiveStudentState(st);
    } else if (role === 'counselor' && targetId) {
      const c = counselorList.find((cn) => cn.id === targetId) || DEFAULT_FALLBACK_COUNSELOR;
      setActiveCounselorState(c);
    }
  };

  const login = (email: string, password: string, roleHint?: UserRole): { success: boolean; error?: string; role?: UserRole } => {
    if (failedLoginAttempts >= 5) {
      return { success: false, error: 'Too many failed login attempts. Rate limiting engaged.' };
    }

    const input = email.trim().toLowerCase();
    const pass = password.trim();

    let matchedRole: UserRole | null = null;
    let targetUser: User | null = null;

    if (input === 'superadmin' || input === 'superadmin@bcafly.edu' || (roleHint === 'super_admin' && !input.includes('@'))) {
      matchedRole = 'super_admin';
      targetUser = activeSuperAdmin || DEFAULT_SUPER_ADMIN;
    } else if (input === 'admin' || input === 'admin@bcafly.edu' || (roleHint === 'admin' && !input.includes('@'))) {
      matchedRole = 'admin';
      targetUser = adminList[0] || DEFAULT_ROOT_ADMIN;
    } else if (input === 'faculty1' || input === 'faculty1@bcafly.edu' || input === 'sarah.jenkins@bcafly.edu' || input.includes('sarah')) {
      matchedRole = 'faculty';
      const fac = facultyList.find((f) => f.id === 'fac-001' || f.email.toLowerCase().includes('sarah')) || facultyList[0] || DEFAULT_FALLBACK_FACULTY;
      targetUser = { id: fac.id, name: fac.name, email: fac.email, role: 'faculty', phone: fac.phone, departmentId: 'dept-bca', isActive: true, createdAt: '2026-08-01', designation: fac.designation };
      setActiveFacultyState(fac);
    } else if (input === 'faculty2' || input === 'faculty2@bcafly.edu' || input === 'rajesh.kumar@bcafly.edu' || input.includes('rajesh')) {
      matchedRole = 'faculty';
      const fac = facultyList.find((f) => f.id === 'fac-002' || f.email.toLowerCase().includes('rajesh')) || facultyList[1] || facultyList[0] || DEFAULT_FALLBACK_FACULTY;
      targetUser = { id: fac.id, name: fac.name, email: fac.email, role: 'faculty', phone: fac.phone, departmentId: 'dept-bca', isActive: true, createdAt: '2026-08-01', designation: fac.designation };
      setActiveFacultyState(fac);
    } else if (input.startsWith('student') || input.includes('@student.bcafly.edu') || roleHint === 'student') {
      matchedRole = 'student';
      let st: Student | undefined;
      const numMatch = input.match(/student(\d+)/);
      if (numMatch) {
        const idx = parseInt(numMatch[1], 10);
        st = students.find((s) => s.studentId === `BCA261${idx.toString().padStart(2, '0')}` || s.id === `stu-${idx.toString().padStart(3, '0')}`);
      }
      if (!st) {
        st = students.find((s) => s.email.toLowerCase() === input) || students[0] || DEFAULT_FALLBACK_STUDENT;
      }
      targetUser = { id: st.id, name: st.name, email: st.email, role: 'student', phone: st.phone, departmentId: 'dept-bca', isActive: true, createdAt: '2026-08-01', studentId: st.studentId, semester: st.semester };
      setActiveStudentState(st);
    } else if (input === 'parent1' || input.includes('parent') || roleHint === 'parent') {
      matchedRole = 'parent';
      targetUser = parentList[0] || DEFAULT_FALLBACK_PARENT;
    } else if (input === 'counselor1' || input.includes('counselor') || roleHint === 'counselor') {
      matchedRole = 'counselor';
      targetUser = activeCounselor || DEFAULT_FALLBACK_COUNSELOR;
    } else if (roleHint === 'faculty') {
      matchedRole = 'faculty';
      const fac = facultyList[0] || DEFAULT_FALLBACK_FACULTY;
      targetUser = { id: fac.id, name: fac.name, email: fac.email, role: 'faculty', phone: fac.phone, departmentId: 'dept-bca', isActive: true, createdAt: '2026-08-01', designation: fac.designation };
      setActiveFacultyState(fac);
    } else {
      matchedRole = roleHint || 'admin';
      targetUser = DEFAULT_ROOT_ADMIN;
    }

    const validPasswords = ['student123', 'bca2026!', 'bca2026', 'password', 'faculty123', 'admin123', 'superadmin', 'admin', 'faculty1', 'faculty2', 'student1', 'student6', 'parent1', 'counselor1', '••••••••••••'];
    const isPasswordValid = validPasswords.includes(pass) || pass.length >= 4;

    if (!matchedRole || !targetUser || !isPasswordValid) {
      setFailedLoginAttempts((prev) => prev + 1);
      return { success: false, error: 'Invalid credentials. Please verify your login details.' };
    }

    setFailedLoginAttempts(0);
    setCurrentRole(matchedRole);
    setIsAuthenticated(true);
    setAccessDeniedMessage(null);
    try {
      localStorage.setItem('bcafly_authenticated', 'true');
    } catch {
      // ignore
    }

    return { success: true, role: matchedRole };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setAccessDeniedMessage(null);
    try {
      localStorage.removeItem('bcafly_authenticated');
    } catch {
      // ignore
    }
  };

  const requestPasswordReset = (email: string) => {
    return { success: true, message: `Password reset instructions dispatched to ${email}.` };
  };

  const setActiveFaculty = (fac: FacultyMember) => {
    setActiveFacultyState(fac);
    if (currentRole !== 'faculty') setCurrentRole('faculty');
  };

  const setActiveStudent = (st: Student) => {
    setActiveStudentState(st);
    if (currentRole !== 'student') setCurrentRole('student');
  };

  // =========================================================================
  // 🏛️ ADMIN MASTER DATA MUTATIONS (Live DB Sync + Refresh)
  // =========================================================================

  const addDepartment = async (dept: { name: string; code: string; deptHeadId?: string }) => {
    const res = await api.createDepartment(dept);
    await refreshData();
    return { success: true, id: res.id };
  };

  const updateDepartment = async (id: string, updates: Partial<Department>) => {
    await api.updateDepartment(id, updates);
    await refreshData();
  };

  const archiveDepartment = async (id: string) => {
    await api.archiveDepartment(id);
    await refreshData();
  };

  const deleteDepartment = async (id: string) => {
    await api.deleteDepartment(id);
    await refreshData();
  };

  const addAcademicYear = async (ay: { name: string; startDate: string; endDate: string; attendanceRule?: number; isActive?: boolean }) => {
    const res = await api.createAcademicYear(ay);
    await refreshData();
    return { success: true, id: res.id };
  };

  const updateAcademicYear = async (id: string, updates: Partial<AcademicYear>) => {
    await api.updateAcademicYear(id, updates);
    await refreshData();
  };

  const archiveAcademicYear = async (id: string) => {
    await api.archiveAcademicYear(id);
    await refreshData();
  };

  const activateAcademicYear = async (id: string) => {
    await api.activateAcademicYear(id);
    await refreshData();
  };

  const configureSemester = async (sem: Partial<SemesterInfo>) => {
    const res = await api.configureSemester(sem);
    await refreshData();
    return { success: true, id: res.id };
  };

  const updateSemester = async (id: string, updates: Partial<SemesterInfo>) => {
    await api.updateSemester(id, updates);
    await refreshData();
  };

  const addBatch = async (batch: Partial<Batch>) => {
    const res = await api.createBatch(batch);
    await refreshData();
    return { success: true, id: res.id };
  };

  const updateBatch = async (id: string, updates: Partial<Batch>) => {
    await api.updateBatch(id, updates);
    await refreshData();
  };

  const archiveBatch = async (id: string) => {
    await api.archiveBatch(id);
    await refreshData();
  };

  const addCourse = async (course: Partial<Course>): Promise<Course | null> => {
    const res = await api.createCourse(course);
    await refreshData();
    return courses.find((c) => c.id === res.id) || null;
  };

  const updateCourse = async (id: string, updates: Partial<Course>) => {
    await api.updateCourse(id, updates);
    await refreshData();
  };

  const archiveCourse = async (id: string) => {
    await api.archiveCourse(id);
    await refreshData();
    return { success: true, message: 'Course archived successfully' };
  };

  const restoreCourse = async (id: string) => {
    await api.updateCourse(id, { isActive: true });
    await refreshData();
  };

  const deleteCourse = async (id: string) => {
    await api.deleteCourse(id);
    await refreshData();
  };

  const addFaculty = async (faculty: Partial<FacultyMember>) => {
    const res = await api.createFaculty(faculty);
    await refreshData();
    return { success: true, id: res.id };
  };

  const updateFaculty = async (id: string, updates: Partial<FacultyMember>) => {
    await api.updateFaculty(id, updates);
    await refreshData();
  };

  const archiveFaculty = async (id: string) => {
    await api.archiveFaculty(id);
    await refreshData();
  };

  const deleteFaculty = async (id: string) => {
    await api.deleteFaculty(id);
    await refreshData();
  };

  const importFacultyCsv = async (facultyList: Partial<FacultyMember>[]) => {
    const res = await api.importFacultyBatch(facultyList);
    await refreshData();
    return res;
  };

  const addStudent = async (student: Partial<Student>) => {
    const res = await api.createStudent(student);
    await refreshData();
    return { success: true, id: res.id, studentId: res.studentId };
  };

  const updateStudent = async (id: string, updates: Partial<Student>) => {
    await api.updateStudent(id, updates);
    await refreshData();
  };

  const archiveStudent = async (id: string) => {
    await api.archiveStudent(id);
    await refreshData();
  };

  const deleteStudent = async (id: string) => {
    await api.deleteStudent(id);
    await refreshData();
  };

  const importStudentsCsv = async (studentList: Partial<Student>[]) => {
    const res = await api.importStudentsBatch(studentList);
    await refreshData();
    return res;
  };

  const enrollStudentInCourse = async (enrollment: Partial<StudentCourseEnrollment>) => {
    await api.enrollStudent(enrollment);
    await refreshData();
  };

  const bulkEnrollStudents = async (enrollments: Partial<StudentCourseEnrollment>[]) => {
    await api.bulkEnrollStudents(enrollments);
    await refreshData();
  };

  const removeStudentEnrollment = async (id: string) => {
    await api.removeEnrollment(id);
    await refreshData();
  };

  const assignFacultyToCourse = async (assignment: Partial<FacultyCourseAssignment>) => {
    await api.assignFacultyCourse(assignment);
    await refreshData();
  };

  const removeFacultyCourseAssignment = async (id: string) => {
    await api.removeFacultyCourseAssignment(id);
    await refreshData();
  };

  const reassignStudent = async (studentId: string, newFacultyId: string) => {
    await api.reassignStudentMentor(studentId, newFacultyId);
    await refreshData();
  };

  // =========================================================================
  // 🎯 ROLE SCOPED HELPERS
  // =========================================================================

  const getScopedStudentsForActiveFaculty = (): Student[] => {
    if (currentRole === 'admin' || currentRole === 'super_admin') {
      return students;
    }
    if (!activeFaculty || !activeFaculty.id || activeFaculty.id === 'fac-default') {
      return students;
    }
    const myStudents = students.filter(
      (s) => s.assignedFacultyId === activeFaculty.id || (s.assignedFaculty && s.assignedFaculty.toLowerCase() === activeFaculty.name.toLowerCase())
    );
    return myStudents;
  };

  const getAssignedCoursesForFaculty = (facultyId: string, semester?: number | 'all'): Course[] => {
    const assignmentsForFac = facultyCourseAssignments.filter((fca) => fca.facultyId === facultyId && fca.isActive);
    const assignedCourseIds = new Set(assignmentsForFac.map((a) => a.courseId));
    let matchingCourses = courses.filter((c) => assignedCourseIds.has(c.id) || assignedCourseIds.has(c.courseCode));
    if (matchingCourses.length === 0) {
      matchingCourses = courses;
    }
    if (semester && semester !== 'all') {
      return matchingCourses.filter((c) => c.semester === semester);
    }
    return matchingCourses;
  };

  const getEnrolledStudentsForCourse = (courseId: string, section = 'A') => {
    const courseEnrollments = studentCourseEnrollments.filter(
      (sce) => (sce.courseId === courseId || sce.courseId === `c-${courseId}`) && (section ? sce.section === section : true)
    );
    const enrolledStudentIds = new Set(courseEnrollments.map((e) => e.studentId));
    const enrolledStudents = students.filter((s) => enrolledStudentIds.has(s.id) || enrolledStudentIds.has(s.studentId));

    return enrolledStudents.map((st) => {
      const enr = courseEnrollments.find((e) => e.studentId === st.id || e.studentId === st.studentId) || {
        id: `enr-${st.id}-${courseId}`,
        studentId: st.id,
        courseId,
        academicYear: '2026-27',
        section: st.section || 'A',
        enrollmentStatus: 'Enrolled' as const
      };
      const mark = courseMarks.find((m) => m.studentId === st.id && m.courseId === courseId);
      return {
        student: st,
        enrollment: enr,
        attendancePercent: st.attendanceRate,
        marks: mark
      };
    });
  };

  const getStudentSixSemesterRecord = (studentId: string): SixSemesterRecord => {
    const student = students.find((s) => s.id === studentId || s.studentId === studentId) || DEFAULT_FALLBACK_STUDENT;
    const allSemesters = [1, 2, 3, 4, 5, 6].map((semNum) => {
      const semCourses = courses.filter((c) => c.semester === semNum);
      const isCurrent = student.semester === semNum;
      const isCompleted = student.semester > semNum;
      return {
        semester: semNum,
        name: `Semester ${semNum}`,
        status: isCurrent ? ('active' as const) : isCompleted ? ('completed' as const) : ('future' as const),
        sgpa: isCompleted ? 8.2 : isCurrent ? student.cgpa : undefined,
        courses: semCourses.map((c) => {
          const mark = courseMarks.find((m) => m.studentId === student.id && m.courseId === c.id);
          return {
            course: c,
            attendancePercent: isCurrent ? student.attendanceRate : isCompleted ? 90 : 0,
            cia1: mark?.cia1 ?? null,
            cia2: mark?.cia2 ?? null,
            cia3: mark?.cia3 ?? null,
            internal: mark?.internalTotal ?? null,
            grade: mark?.finalGrade ?? (isCompleted ? 'A' : 'Pending'),
            status: isCompleted ? ('Finalized' as const) : isCurrent ? ('Regular' as const) : ('Not Started' as const)
          };
        })
      };
    });
    return { student, semesters: allSemesters };
  };

  const getScopedDocumentsForStudent = (studentId: string): StudentDocument[] => {
    return documents.filter((d) => d.studentId === studentId);
  };

  const getScopedTimetable = (semester: number, section = 'A'): TimetableSlot[] => {
    return timetables.filter((t) => t.semester === semester && (!section || t.section === section));
  };

  // =========================================================================
  // 📝 OPERATIONAL ATTENDANCE & MARKS
  // =========================================================================

  const saveCourseAttendance = async (
    courseId: string,
    facultyId: string,
    date: string,
    sessionType: 'THEORY' | 'LAB' | 'TUTORIAL',
    records: { studentId: string; status: 'PRESENT' | 'ABSENT' | 'LATE' | 'ON_DUTY'; remarks?: string }[],
    finalize = true
  ) => {
    await api.saveCourseAttendanceBatch({
      courseId,
      facultyId,
      date,
      sessionType,
      records,
      finalize,
      markedBy: activeFaculty.name
    });
    await refreshData();
    return { success: true, message: `Recorded attendance for ${records.length} students` };
  };

  const markAndFinalizeAttendance = (
    classId: string,
    records: { studentId: string; status: 'present' | 'absent' | 'late' }[]
  ) => {
    const dateStr = new Date().toISOString().split('T')[0];
    saveCourseAttendance(
      classId || 'course-default',
      activeFaculty.id,
      dateStr,
      'THEORY',
      records.map((r) => ({
        studentId: r.studentId,
        status: r.status.toUpperCase() as any
      })),
      true
    );
    const absents = records.filter((r) => r.status === 'absent');
    const user = getCurrentUser();

    // Automatically dispatch SMS alerts for absent students (Demo Safe via executeSmsDispatch)
    absents.forEach(async (rec) => {
      const student = students.find((s) => s.id === rec.studentId || s.studentId === rec.studentId);
      const recipientPhone = student?.parentPhone || student?.phone || '+1 (555) 301-9900';
      const studentName = student?.name || 'Student';
      const attendanceRate = student ? Math.max(0, Math.round(student.attendanceRate - 2.5)) : 68;

      const template = smsTemplates.find((t) => t.key === 'ATTENDANCE_ALERT') || smsTemplates[0];
      const renderedBody = template ? renderTemplate(template.body, {
        student_name: studentName,
        subject: 'Web Application Architecture',
        attendance_rate: attendanceRate,
        threshold: smsSettings.attendanceThresholdPct
      }) : `Dear Parent, ward ${studentName} is marked absent today. Current attendance: ${attendanceRate}%.`;

      const dispatchRes = await executeSmsDispatch(recipientPhone, renderedBody, smsSettings);

      const newMsg: SmsMessage = {
        id: `sms-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        studentId: student?.id || rec.studentId,
        studentName,
        recipientUserId: student?.id,
        recipientPhone,
        recipientType: 'Parent',
        messageType: 'ATTENDANCE',
        templateId: template?.id || 'tpl-attendance-alert',
        body: renderedBody,
        status: dispatchRes.success ? 'sent' : 'failed',
        sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        providerMessageId: dispatchRes.providerMessageId || `mock_err_${Date.now()}`,
        errorMessage: dispatchRes.error,
        triggerReason: 'attendance_below_threshold',
        triggeredByUserId: activeFaculty.id,
        createdAt: new Date().toISOString()
      };

      setSmsMessages((prev) => [newMsg, ...prev]);
    });

    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      actorUserId: user.id,
      actorName: user.name,
      actorRole: currentRole,
      action: 'SMS_DISPATCH_TRIGGERED',
      entityType: 'sms',
      entityId: `session-${Date.now()}`,
      ip: '127.0.0.1',
      createdAt: new Date().toISOString()
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    return {
      success: true,
      smsCount: absents.length,
      message: `Attendance finalized for ${records.length} students. ${absents.length} shortage SMS alerts dispatched via ${smsSettings.provider.toUpperCase()} provider.`
    };
  };

  const saveCourseMarks = async (
    courseId: string,
    assessmentType: 'cia1' | 'cia2' | 'cia3' | 'assignmentMarks' | 'practicalMarks' | 'finalExamMarks',
    marksEntries: { studentId: string; mark: number | null }[],
    finalize = true
  ) => {
    await api.saveCourseMarksBatch({
      courseId,
      assessmentType,
      marksEntries,
      finalize,
      updatedBy: activeFaculty.name
    });
    await refreshData();
    return { success: true, message: `Marks recorded for ${marksEntries.length} students` };
  };

  const addMentoringSession = async (studentId: string, note: Omit<MentoringNote, 'id' | 'facultyName' | 'facultyId'>) => {
    try {
      await fetch('/api/mentoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          date: note.date,
          topic: note.topic,
          notes: note.notes,
          actionItems: note.actionItems,
          status: note.status,
          facultyName: activeFaculty.name,
          facultyId: activeFaculty.id
        })
      });
      await refreshData();
    } catch (err) {
      console.error('Mentoring note error:', err);
    }
  };

  const createCounselingReferral = async (studentId: string, reasonCode: CounselingReferral['reasonCode'], remarks: string) => {
    const student = students.find((s) => s.id === studentId || s.studentId === studentId);
    try {
      await fetch('/api/counseling/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          studentName: student?.name || 'Student',
          semester: student?.semester || 1,
          referredByFacultyId: activeFaculty.id,
          referredByFacultyName: activeFaculty.name,
          reasonCode,
          facultyRemarks: remarks
        })
      });
      await refreshData();
    } catch (err) {
      console.error('Counseling referral error:', err);
    }
  };

  const addCounselingNote = (referralId: string, noteText: string, treatmentPlan: string, updatedMentorStatus?: CounselingReferral['mentorVisibleStatus']) => {
    const newNote: CounselingNote = {
      id: `cn-${Date.now()}`,
      referralId,
      noteText,
      treatmentPlan,
      createdByCounselorName: activeCounselor.name,
      createdByCounselorId: activeCounselor.id,
      createdAt: new Date().toISOString().split('T')[0],
      isConfidential: true
    };
    setCounselingNotes((prev) => [newNote, ...prev]);
    if (updatedMentorStatus) {
      setCounselingReferrals((prev) =>
        prev.map((r) => (r.id === referralId ? { ...r, mentorVisibleStatus: updatedMentorStatus, notesCount: (r.notesCount || 0) + 1 } : r))
      );
    }
  };

  const updateAttendanceSettings = (settings: Partial<AttendanceSettings>) => {
    setAttendanceSettings((prev) => ({ ...prev, ...settings }));
  };

  const toggleWorkingDay = (dateStr: string) => {
    setWorkingDays((prev) =>
      prev.map((wd) => (wd.date === dateStr ? { ...wd, isWorking: !wd.isWorking } : wd))
    );
  };

  const updateCondonationStatus = (studentId: string, status: 'Pending' | 'Approved' | 'Debarred') => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, condonationStatus: status } : s))
    );
  };

  const updateSmsTemplate = (id: string, body: string) => {
    setSmsTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, body } : t))
    );
  };

  const updateSmsSettings = (updates: Partial<SmsSettings>) => {
    setSmsSettings((prev) => ({ ...prev, ...updates }));
    const user = getCurrentUser();
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      actorUserId: user.id,
      actorName: user.name,
      actorRole: currentRole,
      action: 'SMS_SETTINGS_UPDATED',
      entityType: 'settings',
      entityId: 'sms-config',
      ip: '127.0.0.1',
      createdAt: new Date().toISOString()
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const dispatchManualSms = async (payload: {
    recipientPhone: string;
    studentId?: string;
    studentName?: string;
    body: string;
    messageType: SmsType;
    triggerReason?: string;
  }) => {
    const user = getCurrentUser();
    const dispatchRes = await executeSmsDispatch(payload.recipientPhone, payload.body, smsSettings);

    const newMsg: SmsMessage = {
      id: `sms-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      studentId: payload.studentId,
      studentName: payload.studentName || 'Recipient',
      recipientUserId: payload.studentId,
      recipientPhone: payload.recipientPhone,
      recipientType: 'Student',
      messageType: payload.messageType,
      body: payload.body,
      status: dispatchRes.success ? 'sent' : 'failed',
      sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      providerMessageId: dispatchRes.providerMessageId || `mock_err_${Date.now()}`,
      errorMessage: dispatchRes.error,
      triggerReason: payload.triggerReason || 'admin_manual',
      triggeredByUserId: user.id,
      createdAt: new Date().toISOString()
    };

    setSmsMessages((prev) => [newMsg, ...prev]);

    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      actorUserId: user.id,
      actorName: user.name,
      actorRole: currentRole,
      action: 'SMS_MANUAL_DISPATCH',
      entityType: 'sms',
      entityId: newMsg.id,
      ip: '127.0.0.1',
      createdAt: new Date().toISOString()
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    return { success: dispatchRes.success, messageId: newMsg.id, error: dispatchRes.error };
  };

  const retrySmsMessage = async (id: string) => {
    const msg = smsMessages.find((m) => m.id === id);
    if (!msg) return { success: false, error: 'Message not found' };

    const dispatchRes = await executeSmsDispatch(msg.recipientPhone, msg.body, smsSettings);
    setSmsMessages((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              status: dispatchRes.success ? 'sent' : 'failed',
              providerMessageId: dispatchRes.providerMessageId || m.providerMessageId,
              errorMessage: dispatchRes.error,
              retryCount: (m.retryCount || 0) + 1,
              sentAt: dispatchRes.success ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : m.sentAt
            }
          : m
      )
    );

    return { success: dispatchRes.success, error: dispatchRes.error };
  };

  const resetDemoData = () => {
    refreshData();
  };

  const submitCorrectionRequest = (req: Omit<AttendanceCorrectionRequest, 'id' | 'createdAt' | 'status'>) => {
    const newReq: AttendanceCorrectionRequest = {
      ...req,
      id: `req-${Date.now()}`,
      status: 'Pending',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setCorrectionRequests((prev) => [newReq, ...prev]);
    return { success: true, message: 'Attendance correction request submitted to Admin' };
  };

  const reviewCorrectionRequest = (id: string, status: 'Approved' | 'Rejected', adminRemarks?: string) => {
    setCorrectionRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status, adminRemarks, reviewedBy: 'Institutional Admin', reviewedAt: new Date().toISOString() } : r))
    );
    return { success: true, message: `Request marked as ${status}` };
  };

  const uploadDocument = (doc: Omit<StudentDocument, 'id' | 'uploadDate' | 'isVerified' | 'accessToken'>) => {
    const newDoc: StudentDocument = {
      ...doc,
      id: `doc-${Date.now()}`,
      uploadDate: new Date().toISOString().split('T')[0],
      isVerified: true,
      accessToken: `tok_${Math.random().toString(36).slice(2, 8)}`
    };
    setDocuments((prev) => [newDoc, ...prev]);
    return { success: true, message: 'Document uploaded securely', document: newDoc };
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    return { success: true, message: 'Document removed' };
  };

  const createTenant = (tenant: Omit<TenantInfo, 'id' | 'createdAt'>) => {
    const newTenant: TenantInfo = {
      ...tenant,
      id: `ten-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setTenants((prev) => [newTenant, ...prev]);
    return { success: true, message: 'Tenant institution configured' };
  };

  const toggleSecurityIncident = (id: string) => {
    setSecurityIncidents((prev) =>
      prev.map((i) => (i.id === id ? { ...i, resolved: !i.resolved } : i))
    );
  };

  const addNotice = async (notice: Omit<DepartmentNotice, 'id'>) => {
    const newNotice: DepartmentNotice = {
      ...notice,
      id: `not-${Date.now()}`
    };
    setNotices((prev) => [newNotice, ...prev]);
    const user = getCurrentUser();
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      actorUserId: user.id,
      actorName: user.name,
      actorRole: currentRole,
      action: 'NOTICE_PUBLISHED',
      entityType: 'settings',
      entityId: newNotice.id,
      ip: '127.0.0.1',
      createdAt: new Date().toISOString()
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    return { success: true, id: newNotice.id };
  };

  const deleteNotice = async (id: string) => {
    setNotices((prev) => prev.filter((n) => n.id !== id));
    const user = getCurrentUser();
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      actorUserId: user.id,
      actorName: user.name,
      actorRole: currentRole,
      action: 'NOTICE_DELETED',
      entityType: 'settings',
      entityId: id,
      ip: '127.0.0.1',
      createdAt: new Date().toISOString()
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const addAssessmentScheme = async (scheme: Omit<AssessmentScheme, 'id'>) => {
    const newScheme: AssessmentScheme = {
      ...scheme,
      id: `as-${Date.now()}`
    };
    setAssessmentSchemes((prev) => [...prev, newScheme]);
    const user = getCurrentUser();
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      actorUserId: user.id,
      actorName: user.name,
      actorRole: currentRole,
      action: 'ASSESSMENT_SCHEME_CREATED',
      entityType: 'settings',
      entityId: newScheme.id,
      ip: '127.0.0.1',
      createdAt: new Date().toISOString()
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    return { success: true, id: newScheme.id };
  };

  const updateAssessmentScheme = async (id: string, updates: Partial<AssessmentScheme>) => {
    setAssessmentSchemes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    const user = getCurrentUser();
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      actorUserId: user.id,
      actorName: user.name,
      actorRole: currentRole,
      action: 'ASSESSMENT_SCHEME_UPDATED',
      entityType: 'settings',
      entityId: id,
      ip: '127.0.0.1',
      createdAt: new Date().toISOString()
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const deleteAssessmentScheme = async (id: string) => {
    setAssessmentSchemes((prev) => prev.filter((s) => s.id !== id));
    const user = getCurrentUser();
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      actorUserId: user.id,
      actorName: user.name,
      actorRole: currentRole,
      action: 'ASSESSMENT_SCHEME_DELETED',
      entityType: 'settings',
      entityId: id,
      ip: '127.0.0.1',
      createdAt: new Date().toISOString()
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  return (
    <DemoContext.Provider
      value={{
        currentRole,
        currentUser: getCurrentUser(),
        activeFaculty,
        activeStudent,
        activeCounselor,
        activeParent,
        activeSuperAdmin,
        departments,
        academicYears,
        semesters,
        batches,
        courses,
        facultyList,
        students,
        facultyCourseAssignments,
        studentCourseEnrollments,
        assignments,
        courseMarks,
        courseAttendance,
        auditLogs,
        classes,
        workingDays,
        attendanceSettings,
        smsSettings,
        smsTemplates,
        smsMessages,
        counselingReferrals,
        counselingNotes,
        timetables,
        correctionRequests,
        documents,
        tenants,
        securityIncidents,
        notices,
        assessmentSchemes,
        counselorList,
        adminList,
        superAdminList,
        parentList,
        isAuthenticated,
        accessDeniedMessage,
        isLoading,
        login,
        logout,
        requestPasswordReset,
        setAccessDeniedMessage,
        switchRole,
        setActiveFaculty,
        setActiveStudent,
        refreshData,
        addDepartment,
        updateDepartment,
        archiveDepartment,
        deleteDepartment,
        addAcademicYear,
        updateAcademicYear,
        archiveAcademicYear,
        activateAcademicYear,
        configureSemester,
        updateSemester,
        addBatch,
        updateBatch,
        archiveBatch,
        addCourse,
        updateCourse,
        archiveCourse,
        restoreCourse,
        deleteCourse,
        addFaculty,
        updateFaculty,
        archiveFaculty,
        deleteFaculty,
        importFacultyCsv,
        addStudent,
        updateStudent,
        archiveStudent,
        deleteStudent,
        importStudentsCsv,
        enrollStudentInCourse,
        bulkEnrollStudents,
        removeStudentEnrollment,
        assignFacultyToCourse,
        removeFacultyCourseAssignment,
        reassignStudent,
        getScopedStudentsForActiveFaculty,
        getAssignedCoursesForFaculty,
        getEnrolledStudentsForCourse,
        getStudentSixSemesterRecord,
        getScopedDocumentsForStudent,
        getScopedTimetable,
        saveCourseAttendance,
        markAndFinalizeAttendance,
        saveCourseMarks,
        addMentoringSession,
        createCounselingReferral,
        addCounselingNote,
        updateAttendanceSettings,
        toggleWorkingDay,
        updateCondonationStatus,
        updateSmsTemplate,
        updateSmsSettings,
        dispatchManualSms,
        retrySmsMessage,
        resetDemoData,
        submitCorrectionRequest,
        reviewCorrectionRequest,
        uploadDocument,
        deleteDocument,
        createTenant,
        toggleSecurityIncident,
        addNotice,
        deleteNotice,
        addAssessmentScheme,
        updateAssessmentScheme,
        deleteAssessmentScheme
      }}
    >
      {children}
    </DemoContext.Provider>
  );
};

export const useDemoStore = () => {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemoStore must be used within a DemoProvider');
  }
  return context;
};

// Reusable Shared Hooks for Administration-First Data Pattern
export const useCurrentUser = () => {
  const { currentUser, currentRole, isAuthenticated } = useDemoStore();
  return { currentUser, currentRole, isAuthenticated };
};

export const useDepartments = () => {
  const { departments, addDepartment, updateDepartment, archiveDepartment, deleteDepartment, refreshData } = useDemoStore();
  return { departments, addDepartment, updateDepartment, archiveDepartment, deleteDepartment, refreshData };
};

export const useAcademicYears = () => {
  const { academicYears, addAcademicYear, updateAcademicYear, archiveAcademicYear, activateAcademicYear, refreshData } = useDemoStore();
  return { academicYears, addAcademicYear, updateAcademicYear, archiveAcademicYear, activateAcademicYear, refreshData };
};

export const useSemesters = () => {
  const { semesters, configureSemester, updateSemester, refreshData } = useDemoStore();
  return { semesters, configureSemester, updateSemester, refreshData };
};

export const useBatches = () => {
  const { batches, addBatch, updateBatch, archiveBatch, refreshData } = useDemoStore();
  return { batches, addBatch, updateBatch, archiveBatch, refreshData };
};

export const useCourses = () => {
  const { courses, addCourse, updateCourse, archiveCourse, restoreCourse, deleteCourse, refreshData } = useDemoStore();
  return { courses, addCourse, updateCourse, archiveCourse, restoreCourse, deleteCourse, refreshData };
};

export const useFaculty = () => {
  const { facultyList, addFaculty, updateFaculty, archiveFaculty, deleteFaculty, importFacultyCsv, refreshData } = useDemoStore();
  return { facultyList, addFaculty, updateFaculty, archiveFaculty, deleteFaculty, importFacultyCsv, refreshData };
};

export const useStudents = () => {
  const { students, addStudent, updateStudent, archiveStudent, deleteStudent, importStudentsCsv, reassignStudent, refreshData } = useDemoStore();
  return { students, addStudent, updateStudent, archiveStudent, deleteStudent, importStudentsCsv, reassignStudent, refreshData };
};

export const useEnrollments = () => {
  const { studentCourseEnrollments, enrollStudentInCourse, bulkEnrollStudents, removeStudentEnrollment, refreshData } = useDemoStore();
  return { studentCourseEnrollments, enrollStudentInCourse, bulkEnrollStudents, removeStudentEnrollment, refreshData };
};

export const useFacultyAssignments = () => {
  const { facultyCourseAssignments, assignFacultyToCourse, removeFacultyCourseAssignment, refreshData } = useDemoStore();
  return { facultyCourseAssignments, assignFacultyToCourse, removeFacultyCourseAssignment, refreshData };
};
