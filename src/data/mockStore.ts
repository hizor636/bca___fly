import {
  User,
  Department,
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

export const DEPARTMENTS: Department[] = [];

export const SEMESTERS: SemesterInfo[] = [];

export const CLASSES: ClassSection[] = [];

export const INITIAL_FACULTY: FacultyMember[] = [];

export const INITIAL_COUNSELORS: User[] = [];

export const INITIAL_ADMINS: User[] = [];

export const INITIAL_SUPER_ADMINS: User[] = [];

export const INITIAL_PARENTS: User[] = [];

export const INITIAL_STUDENTS: Student[] = [];

export const INITIAL_ASSIGNMENTS: StudentAssignment[] = [];

export const INITIAL_WORKING_DAYS: WorkingDay[] = [];

export const INITIAL_ATTENDANCE_SETTINGS: AttendanceSettings = {
  dailyCutoffTime: '11:30',
  cutoffEnforced: true,
  autoSmsOnFinalize: false,
  smsWorkingDaysOnly: true
};

export const INITIAL_SMS_TEMPLATES: SmsTemplate[] = [];

export const INITIAL_SMS_MESSAGES: SmsMessage[] = [];

export const INITIAL_COUNSELING_REFERRALS: CounselingReferral[] = [];

export const INITIAL_COUNSELING_NOTES: CounselingNote[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

export const INITIAL_NOTICES: DepartmentNotice[] = [];

export const INITIAL_TIMETABLES: TimetableSlot[] = [];

export const INITIAL_CORRECTION_REQUESTS: AttendanceCorrectionRequest[] = [];

export const INITIAL_DOCUMENTS: StudentDocument[] = [];

export const INITIAL_TENANTS: TenantInfo[] = [];

export const INITIAL_SECURITY_INCIDENTS: SecurityIncident[] = [];

export {
  INITIAL_COURSES,
  INITIAL_FACULTY_COURSE_ASSIGNMENTS,
  INITIAL_STUDENT_COURSE_ENROLLMENTS,
  INITIAL_COURSE_MARKS,
  INITIAL_COURSE_ATTENDANCE
} from './courseData';
