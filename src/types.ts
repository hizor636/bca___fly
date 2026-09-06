export type UserRole = 'super_admin' | 'admin' | 'faculty' | 'student' | 'parent' | 'counselor';

export type ScreenType =
  | 'dashboard'
  | 'home'
  | 'explore'
  | 'sign-in'
  | 'students'
  | 'tracking'
  | 'workspace'
  | 'faculties'
  | 'admin'
  | 'admin-users'
  | 'admin-assignments'
  | 'admin-attendance'
  | 'admin-corrections'
  | 'admin-sms'
  | 'admin-reports'
  | 'admin-audit'
  | 'database-studio'
  | 'student-portal'
  | 'parent-portal'
  | 'counselor-portal'
  | 'platform'
  | 'platform-tenants'
  | 'platform-security'
  | 'about'
  | 'contact';

export interface UserStats {
  totalUsers: number;
  activeCount: number;
  inactiveCount: number;
  roles: {
    admin: number;
    faculty: number;
    student: number;
    counselor: number;
  };
}

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  semester?: number;
  departmentId?: string;
  isActive?: boolean;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
}

export interface UserListResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface User {
  id: string;
  username?: string;
  password?: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  departmentId: string;
  isActive: boolean;
  createdAt: string;
  avatarBg?: string;
  avatarText?: string;
  designation?: string;
  studentId?: string; // If student
  semester?: number;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  deptHeadId?: string;
  isActive?: boolean;
  archivedAt?: string;
  createdAt?: string;
}

export interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  attendanceRule: number;
  isActive: boolean;
  archivedAt?: string;
  createdAt?: string;
}

export interface Batch {
  id: string;
  name: string;
  departmentId: string;
  academicYear: string;
  section: string;
  shift?: string;
  startYear: number;
  endYear: number;
  isActive: boolean;
  archivedAt?: string;
}

export interface SemesterInfo {
  id: string;
  number: number; // 1 to 6
  name: string;
  year?: number; // 1, 2, or 3
  typicalStatus?: string;
  startDate: string;
  endDate: string;
  credits?: number;
  minAttendance?: number;
  isCurrent: boolean;
  totalEnrolled: number;
  isActive?: boolean;
}

export type CourseType = 'Theory' | 'Lab' | 'Theory + Lab' | 'Elective' | 'Project' | 'Internship';

export interface Course {
  id: string;
  courseCode: string;
  courseName: string;
  shortName?: string;
  semester: number; // 1 to 6
  departmentId: string;
  academicScheme: string; // e.g. 'BCA-2024-REG'
  credits: number;
  courseType: CourseType;
  maxMarks: number;
  cia1MaxMarks?: number;
  cia2MaxMarks?: number;
  cia3MaxMarks?: number;
  attendanceRequired: number; // normally 75
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FacultyCourseAssignment {
  id: string;
  facultyId: string;
  courseId: string;
  section: string;
  batch: string;
  academicYear: string;
  term: 'Odd' | 'Even';
  isActive: boolean;
}

export interface StudentCourseEnrollment {
  id: string;
  studentId: string;
  courseId: string;
  academicYear: string;
  section: string;
  enrollmentStatus: 'Enrolled' | 'Dropped' | 'Withdrawn';
}

export interface CourseAttendanceRecord {
  id: string;
  studentId: string;
  courseId: string;
  facultyId: string;
  date: string;
  sessionType: 'THEORY' | 'LAB' | 'TUTORIAL';
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'ON_DUTY';
  markedAt: string;
  markedBy: string;
  finalized: boolean;
  remarks?: string;
}

export interface CourseMarks {
  id: string;
  studentId: string;
  courseId: string;
  semester: number;
  academicYear: string;
  cia1: number | null;
  cia2: number | null;
  cia3: number | null;
  assignmentMarks: number | null;
  practicalMarks: number | null;
  internalTotal: number | null;
  finalExamMarks: number | null;
  finalGrade: string | null;
  updatedBy: string;
  updatedAt: string;
  status?: 'Saved' | 'Pending' | 'Finalized';
}

export interface ClassSection {
  id: string;
  semesterId: string;
  section: string;
  year: string;
  name: string;
  courseCode: string;
  subjectName: string;
  assignedFacultyId: string;
  roomNo: string;
}

export interface StudentAssignment {
  id: string;
  studentId: string;
  facultyId: string;
  semesterId: string;
  classId?: string;
  reason: 'mentor' | 'instructor' | 'dept';
  startDate: string;
  endDate?: string;
}

export interface Student {
  id: string;
  studentId: string;
  name: string;
  initials: string;
  avatarBg?: string;
  avatarText?: string;
  course: string;
  semester: number;
  section?: string;
  email: string;
  phone: string;
  parentPhone?: string;
  attendanceRate: number;
  mentoringStatus: 'Regular' | 'Mentoring' | 'Academic Concern' | 'Honor Roll';
  cgpa: number;
  sgpaHistory?: number[]; // 6 semesters
  assignedFaculty: string;
  assignedFacultyId?: string;
  lastMentoringDate?: string;
  mentoringNotes: MentoringNote[];
  subjectGrades: SubjectGrade[];
  weeklyAttendance: number[]; // 6 days
  totalClassesHeld?: number;
  totalClassesAttended?: number;
  condonationEligible?: boolean;
  condonationStatus?: 'Pending' | 'Approved' | 'Debarred';
}

export interface MentoringNote {
  id: string;
  date: string;
  facultyName: string;
  facultyId?: string;
  topic: string;
  notes: string;
  actionItems: string;
  status: 'Open' | 'Resolved' | 'Follow-up Required';
}

export interface SubjectGrade {
  subjectCode: string;
  subjectName: string;
  internalMax: number;
  internalObtained: number;
  attendancePercent: number;
  grade: string;
  status: 'Submitted' | 'Draft' | 'Pending Review';
}

export interface FacultyMember {
  id: string;
  name: string;
  designation: string;
  department: string;
  email: string;
  phone?: string;
  office: string;
  assignedStudentsCount: number;
  specialization: string;
  courses: string[];
}

export interface AttendanceSession {
  id: string;
  classId: string;
  className: string;
  date: string;
  facultyId: string;
  facultyName: string;
  status: 'draft' | 'finalized';
  finalizedAt?: string;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
}

export interface AttendanceRecord {
  id: string;
  attendanceId: string;
  studentId: string;
  status: 'present' | 'absent' | 'late';
  markedAt: string;
  remarks?: string;
}

export interface AttendanceSettings {
  dailyCutoffTime: string; // e.g. "11:30"
  cutoffEnforced: boolean;
  autoSmsOnFinalize: boolean;
  smsWorkingDaysOnly: boolean;
}

export interface WorkingDay {
  id: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: string;
  isWorking: boolean;
  reason?: string;
}

export interface SmsTemplate {
  id: string;
  name: string;
  body: string;
  variables: string[];
  isActive: boolean;
}

export interface SmsMessage {
  id: string;
  studentId: string;
  studentName: string;
  recipientPhone: string;
  recipientType: 'Student' | 'Parent';
  templateId: string;
  body: string;
  channel: string;
  status: 'queued' | 'sent' | 'failed';
  sentAt: string;
  providerMessageId: string;
  idempotencyKey: string;
  isWorkingDay: boolean;
}

export interface CounselingReferral {
  id: string;
  studentId: string;
  studentName: string;
  semester: number;
  referredByFacultyId: string;
  referredByFacultyName: string;
  counselorId: string;
  counselorName: string;
  reasonCode: 'academic_stress' | 'attendance_deficit' | 'personal_concern' | 'career_anxiety' | 'behavioural';
  facultyRemarks: string;
  status: 'pending' | 'in_progress' | 'closed';
  mentorVisibleStatus: 'Under Review' | 'Session Scheduled' | 'Action Plan Recommended' | 'Monitoring Progress' | 'Resolved';
  createdAt: string;
  closedAt?: string;
  notesCount: number;
}

export interface CounselingNote {
  id: string;
  referralId: string;
  noteText: string;
  treatmentPlan: string;
  createdByCounselorId: string;
  createdByCounselorName: string;
  createdAt: string;
  isConfidential: true;
}

export interface AuditLog {
  id: string;
  actorUserId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityType:
    | 'attendance'
    | 'sms'
    | 'mentoring'
    | 'counseling'
    | 'assignment'
    | 'settings'
    | 'user'
    | 'session'
    | 'auth'
    | 'course'
    | 'course_assignment'
    | 'course_enrollment'
    | 'marks'
    | 'correction_request'
    | 'student_document'
    | 'tenant'
    | 'governance';
  entityId: string;
  beforeJson?: string;
  afterJson?: string;
  ip: string;
  createdAt: string;
}

export interface DepartmentNotice {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  isNew: boolean;
  priority: 'High' | 'Normal' | 'Urgent';
  body: string;
  actionLabel?: string;
  deadline?: string;
}

export interface AttendanceBatchItem {
  studentId: string;
  name: string;
  rollNo: string;
  present: boolean;
  remarks?: string;
}

export interface DbColumnInfo {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: any;
  pk: number;
}

export interface DbForeignKeyInfo {
  id: number;
  seq: number;
  table: string;
  from: string;
  to: string;
  on_update: string;
  on_delete: string;
}

export interface DbTableInfo {
  name: string;
  rowCount: number;
  columns: DbColumnInfo[];
  primaryKeys: string[];
  foreignKeys: DbForeignKeyInfo[];
}

export interface DbStats {
  databaseSizeKb: number;
  tableCount: number;
  totalRows: number;
  dbFilePath: string;
  engine: string;
  tables: { name: string; rows: number }[];
}

export interface DbQueryResult {
  success: boolean;
  type?: string;
  columns?: string[];
  rows?: Record<string, any>[];
  rowCount?: number;
  executionTimeMs?: number;
  changes?: number;
  message?: string;
  error?: string;
}

export interface AttendanceForecastResult {
  success: boolean;
  studentId: string;
  name: string;
  semester: number;
  currentAttendancePercent: number;
  classesHeld: number;
  classesAttended: number;
  classesRemaining: number;
  minClassesNeededFor75: number;
  maxPossibleAttendance: number;
  riskLevel: string;
  statusColor: 'emerald' | 'amber' | 'orange' | 'rose';
  canReachCutoff: boolean;
  source?: string;
}

export interface RiskMatrixItem {
  id: string;
  studentId: string;
  name: string;
  semester: number;
  assignedFaculty: string;
  attendanceRate: number;
  cgpa: number;
  avgInternalMarks: number;
  riskScore: number;
  riskTier: 'Urgent Intervention' | 'Academic Concern' | 'Normal Progress';
}

export interface CohortSemesterStats {
  enrolledCount: number;
  attendance: {
    mean: number;
    median: number;
    stdDev: number;
    min: number;
    max: number;
    q25: number;
    q75: number;
    shortagePercent: number;
  };
  cgpa: {
    mean: number;
    median: number;
    stdDev: number;
    min: number;
    max: number;
  };
}

export interface CohortStatsResult {
  success: boolean;
  generatedAt?: string;
  cohortStats: Record<string, CohortSemesterStats>;
  source?: string;
}

export interface AiMentoringAdvice {
  success: boolean;
  studentName: string;
  primaryConcern: string;
  suggestedAction: string;
  recommendedSmsDraft: string;
  source?: string;
}

export interface TimetableSlot {
  id: string;
  semester: number;
  section: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string;
  endTime: string;
  courseId: string;
  courseCode: string;
  subjectName: string;
  facultyId: string;
  facultyName: string;
  roomNo: string;
  sessionType?: 'THEORY' | 'LAB' | 'TUTORIAL';
}

export interface AttendanceCorrectionRequest {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  courseId: string;
  courseName: string;
  date: string;
  requestType: 'Medical Leave' | 'On-Duty Attendance' | 'System Discrepancy' | 'Emergency Leave';
  reason: string;
  attachmentUrl?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  adminRemarks?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface StudentDocument {
  id: string;
  studentId: string;
  title: string;
  category: 'Transcript' | 'Certificate' | 'Medical' | 'Assignment' | 'Identity Proof';
  fileName: string;
  fileSizeKb: number;
  uploadDate: string;
  isVerified: boolean;
  accessToken: string;
  mimeType?: string;
}

export interface TenantInfo {
  id: string;
  name: string;
  code: string;
  domain?: string;
  plan: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'TRIAL';
  studentQuota: number;
  adminEmail: string;
  createdAt: string;
}

export interface SecurityIncident {
  id: string;
  eventType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  ipAddress: string;
  userId?: string;
  userEmail?: string;
  resolved: boolean;
  createdAt: string;
}



