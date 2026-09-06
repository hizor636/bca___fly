import {
  User,
  Department,
  AcademicYear,
  Batch,
  SemesterInfo,
  ClassSection,
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
  DepartmentNotice,
  TimetableSlot,
  AttendanceCorrectionRequest,
  StudentDocument,
  TenantInfo,
  SecurityIncident
} from '../types';

export const DEPARTMENTS: Department[] = [
  { id: 'dept-bca', name: 'Department of Computer Applications', code: 'BCA', deptHeadId: 'admin-1', isActive: true, createdAt: '2026-08-01' }
];

export const ACADEMIC_YEARS: AcademicYear[] = [
  { id: 'ay-2026-27', name: 'Academic Year 2026-2027', startDate: '2026-08-01', endDate: '2027-05-31', attendanceRule: 75.0, isActive: true, createdAt: '2026-08-01' }
];

export const BATCHES: Batch[] = [
  { id: 'batch-2024-27-a', name: 'BCA Batch 2024-2027 (Group A)', departmentId: 'dept-bca', academicYear: '2026-2027', section: 'A', shift: 'Day', startYear: 2024, endYear: 2027, isActive: true },
  { id: 'batch-2024-27-b', name: 'BCA Batch 2024-2027 (Group B)', departmentId: 'dept-bca', academicYear: '2026-2027', section: 'B', shift: 'Day', startYear: 2024, endYear: 2027, isActive: true }
];

export const SEMESTERS: SemesterInfo[] = [
  { id: 'sem-1', number: 1, name: 'Semester 1 (Autumn)', year: 1, startDate: '2026-08-01', endDate: '2026-12-15', credits: 24, minAttendance: 75, isCurrent: false, totalEnrolled: 10, isActive: true },
  { id: 'sem-2', number: 2, name: 'Semester 2 (Spring)', year: 1, startDate: '2027-01-05', endDate: '2027-05-20', credits: 24, minAttendance: 75, isCurrent: false, totalEnrolled: 10, isActive: true },
  { id: 'sem-3', number: 3, name: 'Semester 3 (Autumn)', year: 2, startDate: '2026-08-01', endDate: '2026-12-15', credits: 24, minAttendance: 75, isCurrent: false, totalEnrolled: 10, isActive: true },
  { id: 'sem-4', number: 4, name: 'Semester 4 (Spring)', year: 2, startDate: '2027-01-05', endDate: '2027-05-20', credits: 24, minAttendance: 75, isCurrent: false, totalEnrolled: 10, isActive: true },
  { id: 'sem-5', number: 5, name: 'Semester 5 (Autumn)', year: 3, startDate: '2026-08-01', endDate: '2026-12-15', credits: 24, minAttendance: 75, isCurrent: true, totalEnrolled: 10, isActive: true },
  { id: 'sem-6', number: 6, name: 'Semester 6 (Spring)', year: 3, startDate: '2027-01-05', endDate: '2027-05-20', credits: 24, minAttendance: 75, isCurrent: false, totalEnrolled: 10, isActive: true }
];

export const CLASSES: ClassSection[] = [
  { id: 'cls-1', semesterId: 'sem-5', section: 'A', year: '3rd Year', name: 'BCA 5th Sem - Group A', courseCode: 'BCA-501', subjectName: 'Web Application Architecture', assignedFacultyId: 'faculty-1', roomNo: 'Block B, Lab 3' },
  { id: 'cls-2', semesterId: 'sem-5', section: 'B', year: '3rd Year', name: 'BCA 5th Sem - Group B', courseCode: 'BCA-503', subjectName: 'Artificial Intelligence & ML', assignedFacultyId: 'faculty-2', roomNo: 'Block B, Lab 2' }
];

// 2 Faculties
export const INITIAL_FACULTY: FacultyMember[] = [
  {
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
  },
  {
    id: 'faculty-2',
    name: 'Prof. Rajesh Kumar',
    designation: 'Assistant Professor & Group B Mentor',
    department: 'Department of Computer Applications',
    email: 'rajesh.kumar@bcafly.edu',
    phone: '+1 (555) 234-8765',
    office: 'Block B, Room 405',
    assignedStudentsCount: 5,
    specialization: 'Artificial Intelligence & Information Security',
    courses: ['BCA-503 Artificial Intelligence & ML', 'BCA-504 Information Security & Cryptography']
  }
];

export const INITIAL_ADMINS: User[] = [
  {
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
    avatarBg: 'bg-purple-100',
    avatarText: 'text-purple-700',
    designation: 'Head of Department & Administrator'
  }
];

export const INITIAL_SUPER_ADMINS: User[] = [
  {
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
    avatarBg: 'bg-slate-900',
    avatarText: 'text-white',
    designation: 'Global Platform Architect'
  }
];

export const INITIAL_PARENTS: User[] = [
  {
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
    avatarBg: 'bg-amber-100',
    avatarText: 'text-amber-700',
    designation: 'Parent / Guardian (Ward: Alexander Wright)',
    studentId: 'BCA-2026-001'
  }
];

export const INITIAL_COUNSELORS: User[] = [
  {
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
    avatarBg: 'bg-teal-100',
    avatarText: 'text-teal-700',
    designation: 'Student Wellness Counselor'
  }
];

// 10 Students divided into 2 groups (Group A under Dr. Sarah Jenkins, Group B under Prof. Rajesh Kumar)
export const INITIAL_STUDENTS: Student[] = [
  // GROUP A (Mentored by Dr. Sarah Jenkins)
  {
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
    parentPhone: '+1 (555) 301-9900',
    attendanceRate: 88.5,
    mentoringStatus: 'Regular',
    cgpa: 3.82,
    sgpaHistory: [3.75, 3.8, 3.9, 3.85, 3.82],
    assignedFaculty: 'Dr. Sarah Jenkins',
    assignedFacultyId: 'faculty-1',
    lastMentoringDate: '2026-08-28',
    weeklyAttendance: [90, 85, 92, 88, 85, 90],
    totalClassesHeld: 140,
    totalClassesAttended: 124,
    condonationEligible: true,
    condonationStatus: 'Approved',
    mentoringNotes: [],
    subjectGrades: []
  },
  {
    id: 'student-2',
    studentId: 'BCA-2026-002',
    name: 'Elena Rostova',
    initials: 'ER',
    avatarBg: 'bg-emerald-100',
    avatarText: 'text-emerald-700',
    course: 'Bachelor of Computer Applications',
    semester: 5,
    section: 'A',
    email: 'elena.rostova@student.bcafly.edu',
    phone: '+1 (555) 301-8842',
    parentPhone: '+1 (555) 301-9901',
    attendanceRate: 92.0,
    mentoringStatus: 'Regular',
    cgpa: 3.95,
    sgpaHistory: [3.9, 3.92, 3.95, 3.94, 3.95],
    assignedFaculty: 'Dr. Sarah Jenkins',
    assignedFacultyId: 'faculty-1',
    lastMentoringDate: '2026-08-25',
    weeklyAttendance: [95, 92, 90, 95, 90, 92],
    totalClassesHeld: 140,
    totalClassesAttended: 129,
    condonationEligible: true,
    condonationStatus: 'Approved',
    mentoringNotes: [],
    subjectGrades: []
  },
  {
    id: 'student-3',
    studentId: 'BCA-2026-003',
    name: 'Marcus Vance',
    initials: 'MV',
    avatarBg: 'bg-amber-100',
    avatarText: 'text-amber-700',
    course: 'Bachelor of Computer Applications',
    semester: 5,
    section: 'A',
    email: 'marcus.vance@student.bcafly.edu',
    phone: '+1 (555) 301-8843',
    parentPhone: '+1 (555) 301-9902',
    attendanceRate: 71.4,
    mentoringStatus: 'Academic Concern',
    cgpa: 2.85,
    sgpaHistory: [2.8, 2.9, 2.75, 2.82, 2.85],
    assignedFaculty: 'Dr. Sarah Jenkins',
    assignedFacultyId: 'faculty-1',
    lastMentoringDate: '2026-08-20',
    weeklyAttendance: [70, 68, 75, 72, 70, 74],
    totalClassesHeld: 140,
    totalClassesAttended: 100,
    condonationEligible: true,
    condonationStatus: 'Approved',
    mentoringNotes: [],
    subjectGrades: []
  },
  {
    id: 'student-4',
    studentId: 'BCA-2026-004',
    name: 'Chloe Bennett',
    initials: 'CB',
    avatarBg: 'bg-sky-100',
    avatarText: 'text-sky-700',
    course: 'Bachelor of Computer Applications',
    semester: 5,
    section: 'A',
    email: 'chloe.bennett@student.bcafly.edu',
    phone: '+1 (555) 301-8844',
    parentPhone: '+1 (555) 301-9903',
    attendanceRate: 84.0,
    mentoringStatus: 'Regular',
    cgpa: 3.40,
    sgpaHistory: [3.3, 3.35, 3.4, 3.42, 3.4],
    assignedFaculty: 'Dr. Sarah Jenkins',
    assignedFacultyId: 'faculty-1',
    lastMentoringDate: '2026-08-22',
    weeklyAttendance: [85, 82, 86, 84, 85, 82],
    totalClassesHeld: 140,
    totalClassesAttended: 118,
    condonationEligible: true,
    condonationStatus: 'Approved',
    mentoringNotes: [],
    subjectGrades: []
  },
  {
    id: 'student-5',
    studentId: 'BCA-2026-005',
    name: 'Devon Miller',
    initials: 'DM',
    avatarBg: 'bg-purple-100',
    avatarText: 'text-purple-700',
    course: 'Bachelor of Computer Applications',
    semester: 5,
    section: 'A',
    email: 'devon.miller@student.bcafly.edu',
    phone: '+1 (555) 301-8845',
    parentPhone: '+1 (555) 301-9904',
    attendanceRate: 79.5,
    mentoringStatus: 'Regular',
    cgpa: 3.10,
    sgpaHistory: [3.0, 3.1, 3.05, 3.15, 3.1],
    assignedFaculty: 'Dr. Sarah Jenkins',
    assignedFacultyId: 'faculty-1',
    lastMentoringDate: '2026-08-26',
    weeklyAttendance: [80, 78, 82, 80, 79, 78],
    totalClassesHeld: 140,
    totalClassesAttended: 111,
    condonationEligible: true,
    condonationStatus: 'Approved',
    mentoringNotes: [],
    subjectGrades: []
  },

  // GROUP B (Mentored by Prof. Rajesh Kumar)
  {
    id: 'student-6',
    studentId: 'BCA-2026-006',
    name: 'Aarav Patel',
    initials: 'AP',
    avatarBg: 'bg-rose-100',
    avatarText: 'text-rose-700',
    course: 'Bachelor of Computer Applications',
    semester: 5,
    section: 'B',
    email: 'aarav.patel@student.bcafly.edu',
    phone: '+1 (555) 301-8846',
    parentPhone: '+1 (555) 301-9905',
    attendanceRate: 89.2,
    mentoringStatus: 'Regular',
    cgpa: 3.75,
    sgpaHistory: [3.7, 3.72, 3.78, 3.75, 3.75],
    assignedFaculty: 'Prof. Rajesh Kumar',
    assignedFacultyId: 'faculty-2',
    lastMentoringDate: '2026-08-27',
    weeklyAttendance: [90, 88, 92, 90, 88, 87],
    totalClassesHeld: 140,
    totalClassesAttended: 125,
    condonationEligible: true,
    condonationStatus: 'Approved',
    mentoringNotes: [],
    subjectGrades: []
  },
  {
    id: 'student-7',
    studentId: 'BCA-2026-007',
    name: 'Sophie Zhang',
    initials: 'SZ',
    avatarBg: 'bg-indigo-100',
    avatarText: 'text-indigo-700',
    course: 'Bachelor of Computer Applications',
    semester: 5,
    section: 'B',
    email: 'sophie.zhang@student.bcafly.edu',
    phone: '+1 (555) 301-8847',
    parentPhone: '+1 (555) 301-9906',
    attendanceRate: 94.5,
    mentoringStatus: 'Honor Roll',
    cgpa: 3.98,
    sgpaHistory: [3.95, 3.98, 4.0, 3.97, 3.98],
    assignedFaculty: 'Prof. Rajesh Kumar',
    assignedFacultyId: 'faculty-2',
    lastMentoringDate: '2026-08-29',
    weeklyAttendance: [96, 95, 94, 95, 94, 93],
    totalClassesHeld: 140,
    totalClassesAttended: 132,
    condonationEligible: true,
    condonationStatus: 'Approved',
    mentoringNotes: [],
    subjectGrades: []
  },
  {
    id: 'student-8',
    studentId: 'BCA-2026-008',
    name: 'Liam O\'Connor',
    initials: 'LO',
    avatarBg: 'bg-amber-100',
    avatarText: 'text-amber-700',
    course: 'Bachelor of Computer Applications',
    semester: 5,
    section: 'B',
    email: 'liam.oconnor@student.bcafly.edu',
    phone: '+1 (555) 301-8848',
    parentPhone: '+1 (555) 301-9907',
    attendanceRate: 68.0,
    mentoringStatus: 'Academic Concern',
    cgpa: 2.70,
    sgpaHistory: [2.6, 2.7, 2.65, 2.75, 2.7],
    assignedFaculty: 'Prof. Rajesh Kumar',
    assignedFacultyId: 'faculty-2',
    lastMentoringDate: '2026-08-30',
    weeklyAttendance: [65, 70, 68, 66, 70, 69],
    totalClassesHeld: 140,
    totalClassesAttended: 95,
    condonationEligible: false,
    condonationStatus: 'Pending',
    mentoringNotes: [],
    subjectGrades: []
  },
  {
    id: 'student-9',
    studentId: 'BCA-2026-009',
    name: 'Ananya Sharma',
    initials: 'AS',
    avatarBg: 'bg-emerald-100',
    avatarText: 'text-emerald-700',
    course: 'Bachelor of Computer Applications',
    semester: 5,
    section: 'B',
    email: 'ananya.sharma@student.bcafly.edu',
    phone: '+1 (555) 301-8849',
    parentPhone: '+1 (555) 301-9908',
    attendanceRate: 86.0,
    mentoringStatus: 'Regular',
    cgpa: 3.55,
    sgpaHistory: [3.5, 3.52, 3.6, 3.55, 3.55],
    assignedFaculty: 'Prof. Rajesh Kumar',
    assignedFacultyId: 'faculty-2',
    lastMentoringDate: '2026-08-24',
    weeklyAttendance: [86, 85, 88, 86, 85, 86],
    totalClassesHeld: 140,
    totalClassesAttended: 120,
    condonationEligible: true,
    condonationStatus: 'Approved',
    mentoringNotes: [],
    subjectGrades: []
  },
  {
    id: 'student-10',
    studentId: 'BCA-2026-010',
    name: 'Lucas Garcia',
    initials: 'LG',
    avatarBg: 'bg-sky-100',
    avatarText: 'text-sky-700',
    course: 'Bachelor of Computer Applications',
    semester: 5,
    section: 'B',
    email: 'lucas.garcia@student.bcafly.edu',
    phone: '+1 (555) 301-8850',
    parentPhone: '+1 (555) 301-9909',
    attendanceRate: 81.5,
    mentoringStatus: 'Regular',
    cgpa: 3.25,
    sgpaHistory: [3.2, 3.22, 3.28, 3.25, 3.25],
    assignedFaculty: 'Prof. Rajesh Kumar',
    assignedFacultyId: 'faculty-2',
    lastMentoringDate: '2026-08-25',
    weeklyAttendance: [82, 80, 84, 82, 81, 80],
    totalClassesHeld: 140,
    totalClassesAttended: 114,
    condonationEligible: true,
    condonationStatus: 'Approved',
    mentoringNotes: [],
    subjectGrades: []
  }
];

export const INITIAL_ASSIGNMENTS: StudentAssignment[] = [
  { id: 'as-1', studentId: 'student-1', facultyId: 'faculty-1', semesterId: 'sem-5', reason: 'mentor', startDate: '2026-08-01' },
  { id: 'as-2', studentId: 'student-2', facultyId: 'faculty-1', semesterId: 'sem-5', reason: 'mentor', startDate: '2026-08-01' },
  { id: 'as-3', studentId: 'student-3', facultyId: 'faculty-1', semesterId: 'sem-5', reason: 'mentor', startDate: '2026-08-01' },
  { id: 'as-4', studentId: 'student-4', facultyId: 'faculty-1', semesterId: 'sem-5', reason: 'mentor', startDate: '2026-08-01' },
  { id: 'as-5', studentId: 'student-5', facultyId: 'faculty-1', semesterId: 'sem-5', reason: 'mentor', startDate: '2026-08-01' },
  { id: 'as-6', studentId: 'student-6', facultyId: 'faculty-2', semesterId: 'sem-5', reason: 'mentor', startDate: '2026-08-01' },
  { id: 'as-7', studentId: 'student-7', facultyId: 'faculty-2', semesterId: 'sem-5', reason: 'mentor', startDate: '2026-08-01' },
  { id: 'as-8', studentId: 'student-8', facultyId: 'faculty-2', semesterId: 'sem-5', reason: 'mentor', startDate: '2026-08-01' },
  { id: 'as-9', studentId: 'student-9', facultyId: 'faculty-2', semesterId: 'sem-5', reason: 'mentor', startDate: '2026-08-01' },
  { id: 'as-10', studentId: 'student-10', facultyId: 'faculty-2', semesterId: 'sem-5', reason: 'mentor', startDate: '2026-08-01' }
];

export const INITIAL_WORKING_DAYS: WorkingDay[] = [
  { id: 'wd-1', date: '2026-09-01', dayOfWeek: 'Tuesday', isWorking: true },
  { id: 'wd-2', date: '2026-09-02', dayOfWeek: 'Wednesday', isWorking: true },
  { id: 'wd-3', date: '2026-09-03', dayOfWeek: 'Thursday', isWorking: true },
  { id: 'wd-4', date: '2026-09-04', dayOfWeek: 'Friday', isWorking: true }
];

export const INITIAL_ATTENDANCE_SETTINGS: AttendanceSettings = {
  dailyCutoffTime: '11:30',
  cutoffEnforced: true,
  autoSmsOnFinalize: true,
  smsWorkingDaysOnly: true
};

export const INITIAL_SMS_TEMPLATES: SmsTemplate[] = [
  { id: 'sms-1', name: 'Attendance Shortage Alert', body: 'Dear Parent, your ward {{student_name}} is absent today. Current attendance is {{attendance_rate}}%.', variables: ['student_name', 'attendance_rate'], isActive: true },
  { id: 'sms-2', name: 'CIA Exam Schedule Alert', body: 'Dear Student, CIA-2 examinations commence on September 22. Check portal for timetable.', variables: ['student_name'], isActive: true }
];

export const INITIAL_SMS_MESSAGES: SmsMessage[] = [];
export const INITIAL_COUNSELING_REFERRALS: CounselingReferral[] = [];
export const INITIAL_COUNSELING_NOTES: CounselingNote[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-1',
    actorUserId: 'admin-1',
    actorName: 'Dr. V. Swaminathan (HOD)',
    actorRole: 'admin',
    action: 'SYSTEM_INITIALIZATION',
    entityType: 'governance',
    entityId: 'dept-bca',
    ip: '127.0.0.1',
    createdAt: '2026-09-01T08:00:00Z'
  }
];

export const INITIAL_NOTICES: DepartmentNotice[] = [
  {
    id: 'not-1',
    title: 'CIA-2 Continuous Internal Assessment Schedule Published',
    subtitle: 'Mandatory assessment for Group A and Group B cohorts',
    date: '2026-09-04',
    isNew: true,
    priority: 'High',
    body: 'Continuous Internal Evaluation CIA-2 tests commence from September 22. All student attendance shortage condonations must be closed by September 15.',
    actionLabel: 'View Guidelines',
    deadline: '2026-09-15'
  }
];

export const INITIAL_TIMETABLES: TimetableSlot[] = [
  { id: 'tt-1', semester: 5, section: 'A', dayOfWeek: 'Monday', startTime: '09:00 AM', endTime: '10:30 AM', courseId: 'crs-501', courseCode: 'BCA-501', subjectName: 'Web Application Architecture', facultyId: 'faculty-1', facultyName: 'Dr. Sarah Jenkins', roomNo: 'Lab 3 (Ground Floor)' },
  { id: 'tt-2', semester: 5, section: 'A', dayOfWeek: 'Monday', startTime: '11:00 AM', endTime: '12:30 PM', courseId: 'crs-502', courseCode: 'BCA-502', subjectName: 'Cloud & Distributed Systems', facultyId: 'faculty-1', facultyName: 'Dr. Sarah Jenkins', roomNo: 'Room 402' },
  { id: 'tt-3', semester: 5, section: 'B', dayOfWeek: 'Tuesday', startTime: '09:00 AM', endTime: '10:30 AM', courseId: 'crs-503', courseCode: 'BCA-503', subjectName: 'Artificial Intelligence & Machine Learning', facultyId: 'faculty-2', facultyName: 'Prof. Rajesh Kumar', roomNo: 'Lab 2' },
  { id: 'tt-4', semester: 5, section: 'B', dayOfWeek: 'Wednesday', startTime: '10:00 AM', endTime: '11:30 AM', courseId: 'crs-504', courseCode: 'BCA-504', subjectName: 'Information Security & Cryptography', facultyId: 'faculty-2', facultyName: 'Prof. Rajesh Kumar', roomNo: 'Room 305' }
];

export const INITIAL_CORRECTION_REQUESTS: AttendanceCorrectionRequest[] = [];
export const INITIAL_DOCUMENTS: StudentDocument[] = [];

export const INITIAL_TENANTS: TenantInfo[] = [
  {
    id: 'tenant-1',
    name: 'Apex Institute of Computer Applications',
    code: 'APEX-BCA',
    domain: 'apex.bcafly.edu',
    plan: 'Enterprise Academic',
    status: 'ACTIVE',
    studentQuota: 2500,
    adminEmail: 'admin@bcafly.edu',
    createdAt: '2026-08-01'
  }
];

export const INITIAL_SECURITY_INCIDENTS: SecurityIncident[] = [];

export {
  INITIAL_COURSES,
  INITIAL_FACULTY_COURSE_ASSIGNMENTS,
  INITIAL_STUDENT_COURSE_ENROLLMENTS,
  INITIAL_COURSE_MARKS,
  INITIAL_COURSE_ATTENDANCE
} from './courseData';
