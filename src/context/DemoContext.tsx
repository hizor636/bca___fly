import React, { createContext, useContext, useState, useEffect } from 'react';
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
  CourseMarks
} from '../types';
import {
  INITIAL_STUDENTS,
  INITIAL_FACULTY,
  INITIAL_COUNSELORS,
  INITIAL_ADMINS,
  INITIAL_ASSIGNMENTS,
  INITIAL_WORKING_DAYS,
  INITIAL_ATTENDANCE_SETTINGS,
  INITIAL_SMS_TEMPLATES,
  INITIAL_SMS_MESSAGES,
  INITIAL_COUNSELING_REFERRALS,
  INITIAL_COUNSELING_NOTES,
  INITIAL_AUDIT_LOGS,
  SEMESTERS,
  CLASSES,
  INITIAL_COURSES,
  INITIAL_FACULTY_COURSE_ASSIGNMENTS,
  INITIAL_STUDENT_COURSE_ENROLLMENTS,
  INITIAL_COURSE_MARKS,
  INITIAL_COURSE_ATTENDANCE
} from '../data/mockStore';

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
  students: Student[];
  facultyList: FacultyMember[];
  counselorList: User[];
  adminList: User[];
  assignments: StudentAssignment[];
  workingDays: WorkingDay[];
  attendanceSettings: AttendanceSettings;
  smsTemplates: SmsTemplate[];
  smsMessages: SmsMessage[];
  counselingReferrals: CounselingReferral[];
  counselingNotes: CounselingNote[];
  auditLogs: AuditLog[];
  semesters: SemesterInfo[];
  classes: ClassSection[];
  isAuthenticated: boolean;
  accessDeniedMessage: string | null;

  // Course Master & Semester Allocation State
  courses: Course[];
  facultyCourseAssignments: FacultyCourseAssignment[];
  studentCourseEnrollments: StudentCourseEnrollment[];
  courseAttendance: CourseAttendanceRecord[];
  courseMarks: CourseMarks[];

  // Actions
  login: (email: string, password: string, roleHint?: UserRole) => { success: boolean; error?: string; role?: UserRole };
  logout: () => void;
  requestPasswordReset: (email: string) => { success: boolean; message: string };
  setAccessDeniedMessage: (msg: string | null) => void;
  switchRole: (role: UserRole, targetId?: string) => void;
  setActiveFaculty: (fac: FacultyMember) => void;
  setActiveStudent: (st: Student) => void;
  getScopedStudentsForActiveFaculty: () => Student[];
  markAndFinalizeAttendance: (
    classId: string,
    records: { studentId: string; status: 'present' | 'absent' | 'late' }[]
  ) => { success: boolean; smsCount: number; message: string };
  addMentoringSession: (studentId: string, note: Omit<MentoringNote, 'id' | 'facultyName' | 'facultyId'>) => void;
  createCounselingReferral: (studentId: string, reasonCode: CounselingReferral['reasonCode'], remarks: string) => void;
  addCounselingNote: (referralId: string, noteText: string, treatmentPlan: string, updatedMentorStatus?: CounselingReferral['mentorVisibleStatus']) => void;
  updateAttendanceSettings: (settings: Partial<AttendanceSettings>) => void;
  toggleWorkingDay: (dateStr: string) => void;
  updateCondonationStatus: (studentId: string, status: 'Pending' | 'Approved' | 'Debarred') => void;
  updateSmsTemplate: (id: string, body: string) => void;
  reassignStudent: (studentId: string, newFacultyId: string) => void;
  resetDemoData: () => void;

  // New Course-Centric Methods
  addCourse: (course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>) => Course;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  archiveCourse: (id: string) => { success: boolean; message: string };
  restoreCourse: (id: string) => void;
  assignFacultyToCourse: (assignment: Omit<FacultyCourseAssignment, 'id'>) => void;
  removeFacultyCourseAssignment: (id: string) => void;
  enrollStudentInCourse: (enrollment: Omit<StudentCourseEnrollment, 'id'>) => void;
  bulkEnrollStudents: (enrollments: Omit<StudentCourseEnrollment, 'id'>[]) => void;
  removeStudentEnrollment: (id: string) => void;
  saveCourseAttendance: (
    courseId: string,
    facultyId: string,
    date: string,
    sessionType: 'THEORY' | 'LAB' | 'TUTORIAL',
    records: { studentId: string; status: 'PRESENT' | 'ABSENT' | 'LATE' | 'ON_DUTY'; remarks?: string }[],
    finalize?: boolean
  ) => { success: boolean; message: string; duplicate?: boolean; smsCount?: number };
  saveCourseMarks: (
    courseId: string,
    assessmentType: 'cia1' | 'cia2' | 'cia3' | 'assignmentMarks' | 'practicalMarks' | 'finalExamMarks',
    marksEntries: { studentId: string; mark: number | null }[],
    finalize?: boolean
  ) => { success: boolean; message: string };
  getAssignedCoursesForFaculty: (facultyId: string, semester?: number | 'all') => Course[];
  getEnrolledStudentsForCourse: (
    courseId: string,
    section?: string
  ) => { student: Student; enrollment: StudentCourseEnrollment; attendancePercent: number; marks?: CourseMarks }[];
  getStudentSixSemesterRecord: (studentId: string) => SixSemesterRecord;
  importCourseAllocationsCsv: (csvText: string) => { success: boolean; count: number; message: string };
  importStudentEnrollmentsCsv: (csvText: string) => { success: boolean; count: number; message: string };
}

const DemoContext = createContext<DemoContextType | null>(null);

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('bcafly_authenticated') === 'true';
  });
  const [currentRole, setCurrentRole] = useState<UserRole>('faculty');
  const [activeFaculty, setActiveFacultyState] = useState<FacultyMember>(INITIAL_FACULTY[0]);
  const [activeStudent, setActiveStudentState] = useState<Student>(INITIAL_STUDENTS[0]);
  const [activeCounselor, setActiveCounselorState] = useState<User>(INITIAL_COUNSELORS[0]);
  const [failedLoginAttempts, setFailedLoginAttempts] = useState<number>(0);
  const [accessDeniedMessage, setAccessDeniedMessage] = useState<string | null>(null);

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('bcafly_demo_students');
    let loaded: Student[] = saved ? JSON.parse(saved) : INITIAL_STUDENTS;
    if (!loaded.some((s) => s.id === 's-christian')) {
      const cw = INITIAL_STUDENTS.find((s) => s.id === 's-christian');
      if (cw) loaded = [cw, ...loaded];
    }
    return loaded;
  });

  const [assignments, setAssignments] = useState<StudentAssignment[]>(() => {
    const saved = localStorage.getItem('bcafly_demo_assignments');
    return saved ? JSON.parse(saved) : INITIAL_ASSIGNMENTS;
  });

  const [workingDays, setWorkingDays] = useState<WorkingDay[]>(() => {
    const saved = localStorage.getItem('bcafly_demo_working_days');
    return saved ? JSON.parse(saved) : INITIAL_WORKING_DAYS;
  });

  const [attendanceSettings, setAttendanceSettings] = useState<AttendanceSettings>(() => {
    const saved = localStorage.getItem('bcafly_demo_att_settings');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE_SETTINGS;
  });

  const [smsTemplates, setSmsTemplates] = useState<SmsTemplate[]>(() => {
    const saved = localStorage.getItem('bcafly_demo_sms_templates');
    return saved ? JSON.parse(saved) : INITIAL_SMS_TEMPLATES;
  });

  const [smsMessages, setSmsMessages] = useState<SmsMessage[]>(() => {
    const saved = localStorage.getItem('bcafly_demo_sms_msgs');
    return saved ? JSON.parse(saved) : INITIAL_SMS_MESSAGES;
  });

  const [counselingReferrals, setCounselingReferrals] = useState<CounselingReferral[]>(() => {
    const saved = localStorage.getItem('bcafly_demo_counseling_refs');
    return saved ? JSON.parse(saved) : INITIAL_COUNSELING_REFERRALS;
  });

  const [counselingNotes, setCounselingNotes] = useState<CounselingNote[]>(() => {
    const saved = localStorage.getItem('bcafly_demo_counseling_notes');
    return saved ? JSON.parse(saved) : INITIAL_COUNSELING_NOTES;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('bcafly_demo_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('bcafly_demo_courses');
    return saved ? JSON.parse(saved) : INITIAL_COURSES;
  });

  const [facultyCourseAssignments, setFacultyCourseAssignments] = useState<FacultyCourseAssignment[]>(() => {
    const saved = localStorage.getItem('bcafly_demo_faculty_assignments');
    return saved ? JSON.parse(saved) : INITIAL_FACULTY_COURSE_ASSIGNMENTS;
  });

  const [studentCourseEnrollments, setStudentCourseEnrollments] = useState<StudentCourseEnrollment[]>(() => {
    const saved = localStorage.getItem('bcafly_demo_student_enrollments');
    if (saved) return JSON.parse(saved);
    const enrollments = [...INITIAL_STUDENT_COURSE_ENROLLMENTS];
    INITIAL_STUDENTS.forEach((st) => {
      const semCourses = INITIAL_COURSES.filter((c) => c.semester === st.semester);
      semCourses.forEach((c) => {
        if (!enrollments.some((e) => e.studentId === st.id && e.courseId === c.id)) {
          enrollments.push({
            id: `enr-${st.id}-${c.id}`,
            studentId: st.id,
            courseId: c.id,
            academicYear: '2026-2027',
            section: st.section || 'A',
            enrollmentStatus: 'Enrolled'
          });
        }
      });
    });
    return enrollments;
  });

  const [courseAttendance, setCourseAttendance] = useState<CourseAttendanceRecord[]>(() => {
    const saved = localStorage.getItem('bcafly_demo_course_attendance');
    return saved ? JSON.parse(saved) : INITIAL_COURSE_ATTENDANCE;
  });

  const [courseMarks, setCourseMarks] = useState<CourseMarks[]>(() => {
    const saved = localStorage.getItem('bcafly_demo_course_marks');
    return saved ? JSON.parse(saved) : INITIAL_COURSE_MARKS;
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bcafly_demo_students', JSON.stringify(students));
      localStorage.setItem('bcafly_demo_assignments', JSON.stringify(assignments));
      localStorage.setItem('bcafly_demo_working_days', JSON.stringify(workingDays));
      localStorage.setItem('bcafly_demo_att_settings', JSON.stringify(attendanceSettings));
      localStorage.setItem('bcafly_demo_sms_templates', JSON.stringify(smsTemplates));
      localStorage.setItem('bcafly_demo_sms_msgs', JSON.stringify(smsMessages));
      localStorage.setItem('bcafly_demo_counseling_refs', JSON.stringify(counselingReferrals));
      localStorage.setItem('bcafly_demo_counseling_notes', JSON.stringify(counselingNotes));
      localStorage.setItem('bcafly_demo_audit_logs', JSON.stringify(auditLogs));
      localStorage.setItem('bcafly_demo_courses', JSON.stringify(courses));
      localStorage.setItem('bcafly_demo_faculty_assignments', JSON.stringify(facultyCourseAssignments));
      localStorage.setItem('bcafly_demo_student_enrollments', JSON.stringify(studentCourseEnrollments));
      localStorage.setItem('bcafly_demo_course_attendance', JSON.stringify(courseAttendance));
      localStorage.setItem('bcafly_demo_course_marks', JSON.stringify(courseMarks));
    } catch {
      // ignore storage quota issues
    }
  }, [
    students,
    assignments,
    workingDays,
    attendanceSettings,
    smsTemplates,
    smsMessages,
    counselingReferrals,
    counselingNotes,
    auditLogs,
    courses,
    facultyCourseAssignments,
    studentCourseEnrollments,
    courseAttendance,
    courseMarks
  ]);

  const getCurrentUser = (): User => {
    if (currentRole === 'admin') {
      return INITIAL_ADMINS[0];
    } else if (currentRole === 'faculty') {
      return {
        id: activeFaculty.id,
        name: activeFaculty.name,
        email: activeFaculty.email,
        role: 'faculty',
        phone: activeFaculty.phone || '+1 (555) 900-1122',
        departmentId: 'dept-bca',
        isActive: true,
        createdAt: '2024-01-10',
        designation: activeFaculty.designation
      };
    } else if (currentRole === 'student') {
      return {
        id: activeStudent.id,
        name: activeStudent.name,
        email: activeStudent.email,
        role: 'student',
        phone: activeStudent.phone,
        departmentId: 'dept-bca',
        isActive: true,
        createdAt: '2024-08-01',
        studentId: activeStudent.studentId,
        semester: activeStudent.semester
      };
    } else {
      return activeCounselor;
    }
  };

  const switchRole = (role: UserRole, targetId?: string) => {
    setCurrentRole(role);
    let targetName: string = role;
    if (role === 'faculty' && targetId) {
      const fac = INITIAL_FACULTY.find((f) => f.id === targetId);
      if (fac) {
        setActiveFacultyState(fac);
        targetName = fac.name;
      }
    } else if (role === 'student' && targetId) {
      const st = students.find((s) => s.id === targetId);
      if (st) {
        setActiveStudentState(st);
        targetName = st.name;
      }
    } else if (role === 'counselor' && targetId) {
      const c = INITIAL_COUNSELORS.find((cn) => cn.id === targetId);
      if (c) {
        setActiveCounselorState(c);
        targetName = c.name;
      }
    }
    const roleAudit: AuditLog = {
      id: `aud-${Date.now()}`,
      actorUserId: 'system-governance',
      actorName: 'Academic Session Router',
      actorRole: role,
      action: 'role.permission.change',
      entityType: 'session',
      entityId: `role-${role}`,
      afterJson: JSON.stringify({ switchedToRole: role, target: targetName, timestamp: new Date().toISOString() }),
      ip: '10.0.0.12',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };
    setAuditLogs((prev) => [roleAudit, ...prev]);
  };

  const login = (email: string, password: string, roleHint?: UserRole): { success: boolean; error?: string; role?: UserRole } => {
    if (failedLoginAttempts >= 3) {
      const error = 'Too many failed login attempts. Rate limiting engaged for security. Please wait 15 minutes before trying again or contact campus IT Helpdesk.';
      return { success: false, error };
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Check for suspended account test
    if (trimmedEmail === 'suspended@bcafly.edu' || trimmedEmail.includes('suspended')) {
      const error = 'Access restricted: This account has been suspended by the Academic Registrar. Please contact the Campus IT Helpdesk.';
      return { success: false, error };
    }

    // Determine target role and user
    let matchedRole: UserRole | null = null;
    let targetUser: { id: string; name: string; email: string } | null = null;

    if (
      roleHint === 'admin' ||
      trimmedEmail.includes('dean') ||
      trimmedEmail.includes('admin') ||
      trimmedEmail === 'robert.vance@bcafly.edu' ||
      trimmedEmail === 'dean.academic@bcafly.edu'
    ) {
      matchedRole = 'admin';
      targetUser = INITIAL_ADMINS[0];
    } else if (
      roleHint === 'student' ||
      trimmedEmail.includes('student') ||
      trimmedEmail === 'alex.smith@student.bcafly.edu' ||
      trimmedEmail === 'alex@student.bcafly.edu'
    ) {
      matchedRole = 'student';
      targetUser = { id: students[0].id, name: students[0].name, email: students[0].email };
      setActiveStudentState(students[0]);
    } else if (
      roleHint === 'counselor' ||
      trimmedEmail.includes('counselor') ||
      trimmedEmail === 'priya.counselor@bcafly.edu' ||
      trimmedEmail === 'elena.rostova@bcafly.edu' ||
      trimmedEmail === 'daniel.roberts@bcafly.edu'
    ) {
      matchedRole = 'counselor';
      targetUser = INITIAL_COUNSELORS[0];
      setActiveCounselorState(INITIAL_COUNSELORS[0]);
    } else if (
      roleHint === 'faculty' ||
      trimmedEmail.includes('sarah.jenkins') ||
      trimmedEmail.includes('rajesh.sharma') ||
      trimmedEmail.includes('priya.nambiar') ||
      trimmedEmail.includes('david.vance') ||
      trimmedEmail.endsWith('@bcafly.edu')
    ) {
      matchedRole = 'faculty';
      const fac = INITIAL_FACULTY.find((f) => f.email.toLowerCase() === trimmedEmail) || INITIAL_FACULTY[0];
      targetUser = fac;
      setActiveFacultyState(fac);
    }

    // Password validation: accept demo password or standard passwords or if roleHint is selected
    const validPasswords = ['bca2026!', 'bca2026', 'password', 'faculty123', 'admin123', 'student123', 'counselor123', '••••••••••••'];
    const isPasswordValid = validPasswords.includes(password) || Boolean(roleHint) || password.length >= 6;

    if (!matchedRole || !targetUser || !isPasswordValid) {
      setFailedLoginAttempts((prev) => prev + 1);
      const newAudit: AuditLog = {
        id: `aud-${Date.now()}`,
        actorUserId: 'unauthenticated',
        actorName: trimmedEmail || 'Unknown Visitor',
        actorRole: 'faculty',
        action: 'auth.login.failure',
        entityType: 'auth',
        entityId: 'login-attempt',
        afterJson: JSON.stringify({ attemptedEmail: trimmedEmail, reason: 'Invalid credentials', timestamp: new Date().toISOString() }),
        ip: '10.0.0.12',
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
      };
      setAuditLogs((prev) => [newAudit, ...prev]);

      return {
        success: false,
        error: 'Invalid institutional email or password. Please verify your credentials or contact campus IT helpdesk.'
      };
    }

    // Successful login
    setFailedLoginAttempts(0);
    setCurrentRole(matchedRole);
    setIsAuthenticated(true);
    setAccessDeniedMessage(null);
    try {
      localStorage.setItem('bcafly_authenticated', 'true');
    } catch {
      // ignore
    }

    const loginAudit: AuditLog = {
      id: `aud-${Date.now()}`,
      actorUserId: targetUser.id,
      actorName: targetUser.name,
      actorRole: matchedRole,
      action: 'auth.login.success',
      entityType: 'session',
      entityId: `sess-${Date.now()}`,
      afterJson: JSON.stringify({ email: targetUser.email, role: matchedRole, status: 'Session established', ip: '10.0.0.12' }),
      ip: '10.0.0.12',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };
    setAuditLogs((prev) => [loginAudit, ...prev]);

    return { success: true, role: matchedRole };
  };

  const logout = () => {
    const curUser = getCurrentUser();
    const logoutAudit: AuditLog = {
      id: `aud-${Date.now()}`,
      actorUserId: curUser.id,
      actorName: curUser.name,
      actorRole: currentRole,
      action: 'auth.logout',
      entityType: 'session',
      entityId: `sess-${Date.now()}`,
      afterJson: JSON.stringify({ email: curUser.email, role: currentRole, status: 'Session terminated' }),
      ip: '10.0.0.12',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };
    setAuditLogs((prev) => [logoutAudit, ...prev]);
    setIsAuthenticated(false);
    setAccessDeniedMessage(null);
    try {
      localStorage.removeItem('bcafly_authenticated');
    } catch {
      // ignore
    }
  };

  const requestPasswordReset = (email: string) => {
    const resetAudit: AuditLog = {
      id: `aud-${Date.now()}`,
      actorUserId: 'system',
      actorName: 'Password Recovery Service',
      actorRole: 'admin',
      action: 'auth.password_reset_request',
      entityType: 'auth',
      entityId: email,
      afterJson: JSON.stringify({ email, status: 'Recovery email dispatched', tokenExpiry: '15m' }),
      ip: '10.0.0.12',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };
    setAuditLogs((prev) => [resetAudit, ...prev]);
    return { success: true, message: `Password reset instructions dispatched to ${email}. Check institutional inbox.` };
  };

  const setActiveFaculty = (fac: FacultyMember) => {
    setActiveFacultyState(fac);
    if (currentRole !== 'faculty') {
      setCurrentRole('faculty');
    }
  };

  const setActiveStudent = (st: Student) => {
    setActiveStudentState(st);
  };

  // STRICT ACCESS CONTROL: Return only students assigned to active faculty
  const getScopedStudentsForActiveFaculty = (): Student[] => {
    return students.filter(
      (s) => s.assignedFacultyId === activeFaculty.id || s.assignedFaculty === activeFaculty.name
    );
  };

  // Attendance + SMS Automation Logic
  const markAndFinalizeAttendance = (
    classId: string,
    records: { studentId: string; status: 'present' | 'absent' | 'late' }[]
  ) => {
    const todayStr = '2026-09-04';
    const currentCls = CLASSES.find((c) => c.id === classId) || CLASSES[0];
    const workingDayEntry = workingDays.find((wd) => wd.date === todayStr);
    const isTodayWorking = workingDayEntry ? workingDayEntry.isWorking : true;

    // Check working days rule
    let smsSentCount = 0;
    const newSmsList: SmsMessage[] = [];

    // Update students attendance stats
    setStudents((prev) =>
      prev.map((s) => {
        const rec = records.find((r) => r.studentId === s.id);
        if (!rec) return s;

        const isPresent = rec.status === 'present' || rec.status === 'late';
        const newHeld = s.totalClassesHeld + 1;
        const newAttended = s.totalClassesAttended + (isPresent ? 1 : 0);
        const newRate = Math.round((newAttended / newHeld) * 100);

        let newStatus: Student['mentoringStatus'] = s.mentoringStatus;
        if (newRate < 75) newStatus = 'Academic Concern';
        else if (newRate > 92 && newStatus !== 'Academic Concern') newStatus = 'Honor Roll';

        return {
          ...s,
          totalClassesHeld: newHeld,
          totalClassesAttended: newAttended,
          attendanceRate: newRate,
          mentoringStatus: newStatus,
          condonationEligible: newRate < 75 && newRate >= 65,
          condonationStatus: newRate < 75 ? (s.condonationStatus || 'Pending') : undefined
        };
      })
    );

    // Trigger Automated SMS if enabled and on working day
    if (attendanceSettings.autoSmsOnFinalize) {
      if (!isTodayWorking && attendanceSettings.smsWorkingDaysOnly) {
        // Suppress SMS because today is non-working
      } else {
        const absentees = records.filter((r) => r.status === 'absent');
        absentees.forEach((abs) => {
          const st = students.find((s) => s.id === abs.studentId);
          if (st) {
            // Parent SMS
            newSmsList.push({
              id: `sms-${Date.now()}-${st.id}-p`,
              studentId: st.id,
              studentName: st.name,
              recipientPhone: st.parentPhone,
              recipientType: 'Parent',
              templateId: 'tpl-1',
              body: `BcaFly Alert: Dear Parent/Guardian, ${st.name} (Roll: ${st.studentId}) was marked ABSENT today ${todayStr} in ${currentCls.courseCode} ${currentCls.subjectName}. University regulations mandate min 75% attendance.`,
              channel: 'SMS-Gateway-Demo',
              status: 'sent',
              sentAt: `${todayStr} 11:35:${Math.floor(Math.random() * 50) + 10}`,
              providerMessageId: `msg-prov-${Math.floor(Math.random() * 90000000) + 10000000}`,
              idempotencyKey: `idemp-${todayStr}-${st.id}-${currentCls.id}`,
              isWorkingDay: isTodayWorking
            });

            // Student SMS
            newSmsList.push({
              id: `sms-${Date.now()}-${st.id}-s`,
              studentId: st.id,
              studentName: st.name,
              recipientPhone: st.phone,
              recipientType: 'Student',
              templateId: 'tpl-1',
              body: `BcaFly Notification: You were marked ABSENT on ${todayStr} in ${currentCls.courseCode}. Ensure your attendance remains above 75%.`,
              channel: 'SMS-Gateway-Demo',
              status: 'sent',
              sentAt: `${todayStr} 11:35:${Math.floor(Math.random() * 50) + 10}`,
              providerMessageId: `msg-prov-${Math.floor(Math.random() * 90000000) + 10000000}`,
              idempotencyKey: `idemp-${todayStr}-${st.id}-${currentCls.id}-st`,
              isWorkingDay: isTodayWorking
            });

            smsSentCount += 2;
          }
        });

        if (newSmsList.length > 0) {
          setSmsMessages((prev) => [...newSmsList, ...prev]);
        }
      }
    }

    // Append to Audit Trail
    const presentCount = records.filter((r) => r.status === 'present').length;
    const absentCount = records.filter((r) => r.status === 'absent').length;
    const lateCount = records.filter((r) => r.status === 'late').length;

    const newAudit: AuditLog = {
      id: `audit-${Date.now()}`,
      actorUserId: activeFaculty.id,
      actorName: activeFaculty.name,
      actorRole: 'faculty',
      action: 'ATTENDANCE_FINALIZED',
      entityType: 'attendance',
      entityId: `att-${todayStr}-${classId}`,
      beforeJson: JSON.stringify({ status: 'draft', class: currentCls.courseCode }),
      afterJson: JSON.stringify({
        status: 'finalized',
        class: currentCls.courseCode,
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        sms_sent: smsSentCount,
        working_day: isTodayWorking
      }),
      ip: '192.168.1.104',
      createdAt: `${todayStr} 11:35:15`
    };

    setAuditLogs((prev) => [newAudit, ...prev]);

    return {
      success: true,
      smsCount: smsSentCount,
      message: isTodayWorking
        ? `Attendance finalized. ${absentCount} absentees recorded. ${smsSentCount} automated SMS alerts dispatched.`
        : `Attendance finalized. Today is a non-working day; SMS dispatch was suppressed per policy.`
    };
  };

  // Mentoring session
  const addMentoringSession = (
    studentId: string,
    note: Omit<MentoringNote, 'id' | 'facultyName' | 'facultyId'>
  ) => {
    const newNoteId = `mn-${Date.now()}`;
    const fullNote: MentoringNote = {
      ...note,
      id: newNoteId,
      facultyName: activeFaculty.name,
      facultyId: activeFaculty.id
    };

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        return {
          ...s,
          lastMentoringDate: fullNote.date,
          mentoringNotes: [fullNote, ...s.mentoringNotes]
        };
      })
    );

    // Audit log
    setAuditLogs((prev) => [
      {
        id: `audit-${Date.now()}`,
        actorUserId: activeFaculty.id,
        actorName: activeFaculty.name,
        actorRole: 'faculty',
        action: 'MENTORING_SESSION_LOGGED',
        entityType: 'mentoring',
        entityId: newNoteId,
        afterJson: JSON.stringify({ studentId, topic: note.topic, status: note.status }),
        ip: '192.168.1.104',
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
      },
      ...prev
    ]);
  };

  // Create Counseling Referral
  const createCounselingReferral = (
    studentId: string,
    reasonCode: CounselingReferral['reasonCode'],
    remarks: string
  ) => {
    const st = students.find((s) => s.id === studentId);
    if (!st) return;

    const newRefId = `ref-${Date.now()}`;
    const newRef: CounselingReferral = {
      id: newRefId,
      studentId: st.id,
      studentName: st.name,
      semester: st.semester,
      referredByFacultyId: activeFaculty.id,
      referredByFacultyName: activeFaculty.name,
      counselorId: INITIAL_COUNSELORS[0].id,
      counselorName: INITIAL_COUNSELORS[0].name,
      reasonCode,
      facultyRemarks: remarks,
      status: 'pending',
      mentorVisibleStatus: 'Under Review',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      notesCount: 0
    };

    setCounselingReferrals((prev) => [newRef, ...prev]);

    setAuditLogs((prev) => [
      {
        id: `audit-${Date.now()}`,
        actorUserId: activeFaculty.id,
        actorName: activeFaculty.name,
        actorRole: 'faculty',
        action: 'COUNSELING_REFERRAL_CREATED',
        entityType: 'counseling',
        entityId: newRefId,
        afterJson: JSON.stringify({ student: st.name, reasonCode }),
        ip: '192.168.1.104',
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
      },
      ...prev
    ]);
  };

  // Add Confidential Counseling Note (Restricted to Counselor)
  const addCounselingNote = (
    referralId: string,
    noteText: string,
    treatmentPlan: string,
    updatedMentorStatus?: CounselingReferral['mentorVisibleStatus']
  ) => {
    const newNote: CounselingNote = {
      id: `cnote-${Date.now()}`,
      referralId,
      noteText,
      treatmentPlan,
      createdByCounselorId: activeCounselor.id,
      createdByCounselorName: activeCounselor.name,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      isConfidential: true
    };

    setCounselingNotes((prev) => [newNote, ...prev]);

    setCounselingReferrals((prev) =>
      prev.map((r) => {
        if (r.id !== referralId) return r;
        return {
          ...r,
          status: 'in_progress',
          mentorVisibleStatus: updatedMentorStatus || r.mentorVisibleStatus,
          notesCount: r.notesCount + 1
        };
      })
    );

    setAuditLogs((prev) => [
      {
        id: `audit-${Date.now()}`,
        actorUserId: activeCounselor.id,
        actorName: activeCounselor.name,
        actorRole: 'counselor',
        action: 'COUNSELING_CONFIDENTIAL_SESSION_ADDED',
        entityType: 'counseling',
        entityId: referralId,
        afterJson: JSON.stringify({
          referralId,
          mentor_status_set: updatedMentorStatus || 'In Progress',
          confidential: true
        }),
        ip: '192.168.2.18',
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
      },
      ...prev
    ]);
  };

  // Update Attendance Settings (Admin)
  const updateAttendanceSettings = (settings: Partial<AttendanceSettings>) => {
    const before = { ...attendanceSettings };
    const after = { ...attendanceSettings, ...settings };
    setAttendanceSettings(after);

    setAuditLogs((prev) => [
      {
        id: `audit-${Date.now()}`,
        actorUserId: 'admin-1',
        actorName: 'Academic Dean Dr. V. Swaminathan',
        actorRole: 'admin',
        action: 'SETTINGS_UPDATED',
        entityType: 'settings',
        entityId: 'settings-att',
        beforeJson: JSON.stringify(before),
        afterJson: JSON.stringify(after),
        ip: '10.0.0.12',
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
      },
      ...prev
    ]);
  };

  // Toggle Working Day (Admin)
  const toggleWorkingDay = (dateStr: string) => {
    setWorkingDays((prev) =>
      prev.map((wd) => {
        if (wd.date !== dateStr) return wd;
        const newWorking = !wd.isWorking;
        return {
          ...wd,
          isWorking: newWorking,
          reason: newWorking ? undefined : 'Marked as Non-working / Off'
        };
      })
    );

    setAuditLogs((prev) => [
      {
        id: `audit-${Date.now()}`,
        actorUserId: 'admin-1',
        actorName: 'Academic Dean Dr. V. Swaminathan',
        actorRole: 'admin',
        action: 'WORKING_DAY_TOGGLED',
        entityType: 'settings',
        entityId: dateStr,
        afterJson: JSON.stringify({ date: dateStr }),
        ip: '10.0.0.12',
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
      },
      ...prev
    ]);
  };

  // Update Condonation Status (Admin / HOD)
  const updateCondonationStatus = (studentId: string, status: 'Pending' | 'Approved' | 'Debarred') => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        return { ...s, condonationStatus: status };
      })
    );

    setAuditLogs((prev) => [
      {
        id: `audit-${Date.now()}`,
        actorUserId: 'admin-1',
        actorName: 'Academic Dean Dr. V. Swaminathan',
        actorRole: 'admin',
        action: 'CONDONATION_STATUS_UPDATED',
        entityType: 'user',
        entityId: studentId,
        afterJson: JSON.stringify({ studentId, status }),
        ip: '10.0.0.12',
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
      },
      ...prev
    ]);
  };

  // Update SMS Template (Admin)
  const updateSmsTemplate = (id: string, body: string) => {
    setSmsTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, body } : t))
    );

    setAuditLogs((prev) => [
      {
        id: `audit-${Date.now()}`,
        actorUserId: 'admin-2',
        actorName: 'Registrar Office IT Cell',
        actorRole: 'admin',
        action: 'SMS_TEMPLATE_UPDATED',
        entityType: 'sms',
        entityId: id,
        afterJson: JSON.stringify({ templateId: id, body }),
        ip: '10.0.0.12',
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
      },
      ...prev
    ]);
  };

  // Reassign student (Admin)
  const reassignStudent = (studentId: string, newFacultyId: string) => {
    const targetFac = INITIAL_FACULTY.find((f) => f.id === newFacultyId);
    if (!targetFac) return;

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        return {
          ...s,
          assignedFaculty: targetFac.name,
          assignedFacultyId: targetFac.id
        };
      })
    );

    setAssignments((prev) =>
      prev.map((a) => {
        if (a.studentId !== studentId) return a;
        return { ...a, facultyId: newFacultyId };
      })
    );

    setAuditLogs((prev) => [
      {
        id: `audit-${Date.now()}`,
        actorUserId: 'admin-1',
        actorName: 'Academic Dean Dr. V. Swaminathan',
        actorRole: 'admin',
        action: 'STUDENT_REASSIGNED',
        entityType: 'assignment',
        entityId: studentId,
        afterJson: JSON.stringify({ studentId, newFaculty: targetFac.name }),
        ip: '10.0.0.12',
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
      },
      ...prev
    ]);
  };

  // Course Management Actions
  const addCourse = (courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Course => {
    const newId = `c-${courseData.courseCode.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString().slice(-4)}`;
    const now = new Date().toISOString().split('T')[0];
    const newCourse: Course = {
      ...courseData,
      id: newId,
      createdAt: now,
      updatedAt: now
    };
    setCourses((prev) => [...prev, newCourse]);

    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        actorUserId: 'admin-1',
        actorName: 'Academic Dean Dr. V. Swaminathan',
        actorRole: currentRole,
        action: 'COURSE_CREATED',
        entityType: 'course',
        entityId: newId,
        afterJson: JSON.stringify(newCourse),
        ip: '10.0.0.12',
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
      },
      ...prev
    ]);
    return newCourse;
  };

  const updateCourse = (id: string, updates: Partial<Course>) => {
    const now = new Date().toISOString().split('T')[0];
    let beforeData: Course | undefined;
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          beforeData = c;
          return { ...c, ...updates, updatedAt: now };
        }
        return c;
      })
    );

    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        actorUserId: 'admin-1',
        actorName: 'Academic Dean Dr. V. Swaminathan',
        actorRole: currentRole,
        action: 'COURSE_UPDATED',
        entityType: 'course',
        entityId: id,
        beforeJson: JSON.stringify(beforeData),
        afterJson: JSON.stringify(updates),
        ip: '10.0.0.12',
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
      },
      ...prev
    ]);
  };

  const archiveCourse = (id: string) => {
    const target = courses.find((c) => c.id === id);
    if (!target) return { success: false, message: 'Course not found' };

    const hasEnrollments = studentCourseEnrollments.some(
      (e) => e.courseId === id && e.enrollmentStatus === 'Enrolled'
    );
    if (hasEnrollments) {
      return {
        success: false,
        message: `Cannot archive course ${target.courseCode} with active student enrollments. Reallocate or drop students before archiving.`
      };
    }

    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: false, updatedAt: new Date().toISOString().split('T')[0] } : c))
    );

    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        actorUserId: 'admin-1',
        actorName: 'Academic Dean Dr. V. Swaminathan',
        actorRole: currentRole,
        action: 'COURSE_ARCHIVED',
        entityType: 'course',
        entityId: id,
        afterJson: JSON.stringify({ courseCode: target.courseCode, isActive: false }),
        ip: '10.0.0.12',
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
      },
      ...prev
    ]);
    return { success: true, message: `Course ${target.courseCode} archived successfully.` };
  };

  const restoreCourse = (id: string) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: true, updatedAt: new Date().toISOString().split('T')[0] } : c))
    );
    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        actorUserId: 'admin-1',
        actorName: 'Academic Dean Dr. V. Swaminathan',
        actorRole: currentRole,
        action: 'COURSE_RESTORED',
        entityType: 'course',
        entityId: id,
        afterJson: JSON.stringify({ id, isActive: true }),
        ip: '10.0.0.12',
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
      },
      ...prev
    ]);
  };

  const assignFacultyToCourse = (assignment: Omit<FacultyCourseAssignment, 'id'>) => {
    const newId = `fca-${Date.now()}`;
    const newAssignment: FacultyCourseAssignment = {
      ...assignment,
      id: newId
    };
    setFacultyCourseAssignments((prev) => [...prev, newAssignment]);

    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        actorUserId: 'admin-1',
        actorName: 'Academic Dean Dr. V. Swaminathan',
        actorRole: currentRole,
        action: 'FACULTY_COURSE_ASSIGNED',
        entityType: 'course_assignment',
        entityId: newId,
        afterJson: JSON.stringify(newAssignment),
        ip: '10.0.0.12',
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
      },
      ...prev
    ]);
  };

  const removeFacultyCourseAssignment = (id: string) => {
    const existing = facultyCourseAssignments.find((a) => a.id === id);
    setFacultyCourseAssignments((prev) => prev.filter((a) => a.id !== id));

    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        actorUserId: 'admin-1',
        actorName: 'Academic Dean Dr. V. Swaminathan',
        actorRole: currentRole,
        action: 'FACULTY_COURSE_UNASSIGNED',
        entityType: 'course_assignment',
        entityId: id,
        beforeJson: JSON.stringify(existing),
        ip: '10.0.0.12',
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
      },
      ...prev
    ]);
  };

  const enrollStudentInCourse = (enrollment: Omit<StudentCourseEnrollment, 'id'>) => {
    const newId = `enr-${Date.now()}`;
    const newEnrollment: StudentCourseEnrollment = {
      ...enrollment,
      id: newId
    };
    setStudentCourseEnrollments((prev) => [...prev, newEnrollment]);

    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        actorUserId: 'admin-1',
        actorName: 'Academic Dean Dr. V. Swaminathan',
        actorRole: currentRole,
        action: 'STUDENT_COURSE_ENROLLED',
        entityType: 'course_enrollment',
        entityId: newId,
        afterJson: JSON.stringify(newEnrollment),
        ip: '10.0.0.12',
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
      },
      ...prev
    ]);
  };

  const bulkEnrollStudents = (enrollmentsList: Omit<StudentCourseEnrollment, 'id'>[]) => {
    const generated: StudentCourseEnrollment[] = enrollmentsList.map((e, idx) => ({
      ...e,
      id: `enr-${Date.now()}-${idx}`
    }));
    setStudentCourseEnrollments((prev) => [...prev, ...generated]);

    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        actorUserId: 'admin-1',
        actorName: 'Academic Dean Dr. V. Swaminathan',
        actorRole: currentRole,
        action: 'BULK_STUDENT_COURSE_ENROLLED',
        entityType: 'course_enrollment',
        entityId: `bulk-${Date.now()}`,
        afterJson: JSON.stringify({ count: generated.length }),
        ip: '10.0.0.12',
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
      },
      ...prev
    ]);
  };

  const removeStudentEnrollment = (id: string) => {
    const target = studentCourseEnrollments.find((e) => e.id === id);
    setStudentCourseEnrollments((prev) => prev.filter((e) => e.id !== id));

    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        actorUserId: 'admin-1',
        actorName: 'Academic Dean Dr. V. Swaminathan',
        actorRole: currentRole,
        action: 'STUDENT_COURSE_UNENROLLED',
        entityType: 'course_enrollment',
        entityId: id,
        beforeJson: JSON.stringify(target),
        ip: '10.0.0.12',
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
      },
      ...prev
    ]);
  };

  const getAssignedCoursesForFaculty = (facultyId: string, semester?: number | 'all'): Course[] => {
    const assignedIds = facultyCourseAssignments
      .filter((a) => a.facultyId === facultyId && a.isActive)
      .map((a) => a.courseId);

    return courses.filter((c) => {
      if (!c.isActive) return false;
      const isAssigned = assignedIds.includes(c.id);
      if (!isAssigned) return false;
      if (semester && semester !== 'all') {
        return c.semester === Number(semester);
      }
      return true;
    });
  };

  const getEnrolledStudentsForCourse = (
    courseId: string,
    section?: string
  ): { student: Student; enrollment: StudentCourseEnrollment; attendancePercent: number; marks?: CourseMarks }[] => {
    const activeEnrollments = studentCourseEnrollments.filter((e) => {
      if (e.courseId !== courseId) return false;
      if (e.enrollmentStatus !== 'Enrolled') return false;
      if (section && section !== 'all' && e.section !== section) return false;
      return true;
    });

    const targetCourse = courses.find((c) => c.id === courseId);

    return activeEnrollments.map((enr) => {
      const student: Student =
        students.find((s) => s.id === enr.studentId) ||
        INITIAL_STUDENTS.find((s) => s.id === enr.studentId) || {
          id: enr.studentId,
          studentId: '2024999',
          name: 'Enrolled Student',
          initials: 'ES',
          course: 'BCA',
          semester: targetCourse?.semester || 1,
          section: enr.section,
          email: 'student@bcafly.edu',
          phone: '+1 (555) 000-0000',
          parentPhone: '+1 (555) 000-0001',
          attendanceRate: 85,
          cgpa: 8.0,
          mentoringStatus: 'Regular',
          assignedFaculty: activeFaculty.name,
          mentoringNotes: [],
          subjectGrades: [],
          weeklyAttendance: [85, 85, 85, 85, 85, 85]
        };

      const records = courseAttendance.filter(
        (ca) => ca.courseId === courseId && ca.studentId === enr.studentId
      );
      let calculatedAttendance = student.attendanceRate;
      if (records.length > 0) {
        const attended = records.filter(
          (r) => r.status === 'PRESENT' || r.status === 'ON_DUTY' || r.status === 'LATE'
        ).length;
        calculatedAttendance = Math.round((attended / records.length) * 100);
      } else if (student.id === 's-christian') {
        if (targetCourse?.courseCode === 'BCA101') calculatedAttendance = 85;
        else if (targetCourse?.courseCode === 'BCA102') calculatedAttendance = 82;
        else if (targetCourse?.courseCode === 'BCA103') calculatedAttendance = 74;
        else if (targetCourse?.courseCode === 'BCA104') calculatedAttendance = 88;
        else if (targetCourse?.courseCode === 'BCA105') calculatedAttendance = 90;
      }

      const marks = courseMarks.find(
        (m) => m.courseId === courseId && m.studentId === enr.studentId
      );

      return {
        student,
        enrollment: enr,
        attendancePercent: calculatedAttendance,
        marks
      };
    });
  };

  const saveCourseAttendance = (
    courseId: string,
    facultyId: string,
    date: string,
    sessionType: 'THEORY' | 'LAB' | 'TUTORIAL',
    records: { studentId: string; status: 'PRESENT' | 'ABSENT' | 'LATE' | 'ON_DUTY'; remarks?: string }[],
    finalize?: boolean
  ) => {
    const nowTime = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const targetCourse = courses.find((c) => c.id === courseId);
    const faculty = INITIAL_FACULTY.find((f) => f.id === facultyId) || activeFaculty;

    const existing = courseAttendance.filter(
      (ca) => ca.courseId === courseId && ca.date === date && ca.sessionType === sessionType
    );
    const isDuplicate = existing.length > 0;

    const updatedRecords: CourseAttendanceRecord[] = records.map((r, idx) => ({
      id: `ca-${courseId}-${date}-${r.studentId}-${idx}`,
      studentId: r.studentId,
      courseId,
      facultyId,
      date,
      sessionType,
      status: r.status,
      markedAt: nowTime,
      markedBy: faculty.name,
      finalized: !!finalize,
      remarks: r.remarks
    }));

    setCourseAttendance((prev) => {
      const filtered = prev.filter(
        (ca) => !(ca.courseId === courseId && ca.date === date && ca.sessionType === sessionType)
      );
      return [...updatedRecords, ...filtered];
    });

    const presentCount = records.filter((r) => r.status === 'PRESENT' || r.status === 'ON_DUTY').length;
    const absentCount = records.filter((r) => r.status === 'ABSENT').length;
    const lateCount = records.filter((r) => r.status === 'LATE').length;

    let smsCount = 0;
    if (finalize && attendanceSettings.autoSmsOnFinalize) {
      const absentees = records.filter((r) => r.status === 'ABSENT');
      const newSms: SmsMessage[] = [];
      absentees.forEach((abs) => {
        const st = students.find((s) => s.id === abs.studentId);
        if (st && st.parentPhone) {
          newSms.push({
            id: `sms-${Date.now()}-${st.id}`,
            studentId: st.id,
            studentName: st.name,
            recipientPhone: st.parentPhone,
            recipientType: 'Parent',
            templateId: 'tpl-1',
            body: `BcaFly Alert: Dear Parent/Guardian, ${st.name} was marked ABSENT today ${date} in ${targetCourse?.courseCode || 'Course'} (${sessionType}). Min 75% attendance mandatory.`,
            channel: 'SMS-Gateway',
            status: 'sent',
            sentAt: nowTime,
            providerMessageId: `msg-${Date.now()}`,
            idempotencyKey: `ca-sms-${date}-${st.id}-${courseId}`,
            isWorkingDay: true
          });
          smsCount++;
        }
      });
      if (newSms.length > 0) {
        setSmsMessages((prev) => [...newSms, ...prev]);
      }
    }

    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        actorUserId: facultyId,
        actorName: faculty.name,
        actorRole: 'faculty',
        action: finalize ? 'COURSE_ATTENDANCE_FINALIZED' : 'COURSE_ATTENDANCE_DRAFT_SAVED',
        entityType: 'attendance',
        entityId: `ca-${courseId}-${date}-${sessionType}`,
        afterJson: JSON.stringify({
          courseCode: targetCourse?.courseCode,
          date,
          sessionType,
          total: records.length,
          present: presentCount,
          absent: absentCount,
          late: lateCount,
          finalized: !!finalize,
          smsDispatched: smsCount
        }),
        ip: '192.168.1.104',
        createdAt: nowTime
      },
      ...prev
    ]);

    return {
      success: true,
      duplicate: isDuplicate,
      smsCount,
      message: `${targetCourse?.courseCode || 'Course'} attendance for ${date} (${sessionType}) ${finalize ? 'finalized' : 'saved as draft'}. ${presentCount} Present, ${absentCount} Absent.`
    };
  };

  const saveCourseMarks = (
    courseId: string,
    assessmentType: 'cia1' | 'cia2' | 'cia3' | 'assignmentMarks' | 'practicalMarks' | 'finalExamMarks',
    marksEntries: { studentId: string; mark: number | null }[],
    finalize?: boolean
  ) => {
    const now = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const targetCourse = courses.find((c) => c.id === courseId);
    const faculty = activeFaculty;

    setCourseMarks((prev) => {
      const updated = [...prev];
      marksEntries.forEach((entry) => {
        const existingIdx = updated.findIndex(
          (m) => m.courseId === courseId && m.studentId === entry.studentId
        );
        if (existingIdx >= 0) {
          const item = { ...updated[existingIdx] };
          item[assessmentType] = entry.mark;
          item.updatedBy = faculty.name;
          item.updatedAt = now;
          if (finalize) item.status = 'Finalized';
          else if (!item.status) item.status = 'Saved';

          const c1 = item.cia1 ?? 0;
          const c2 = item.cia2 ?? 0;
          const c3 = item.cia3 ?? 0;
          let bestCia = c1 + c2;
          if (item.cia3 !== null && item.cia3 !== undefined) {
            const arr = [c1, c2, c3].sort((a, b) => b - a);
            bestCia = arr[0] + arr[1];
          }
          const assign = item.assignmentMarks ?? 0;
          const prac = item.practicalMarks ?? 0;
          item.internalTotal = bestCia + assign + (targetCourse?.courseType?.includes('Lab') ? prac : 0);

          if (item.internalTotal >= 45) item.finalGrade = 'A+';
          else if (item.internalTotal >= 38) item.finalGrade = 'A';
          else if (item.internalTotal >= 30) item.finalGrade = 'B+';
          else if (item.internalTotal >= 25) item.finalGrade = 'B';
          else if (item.internalTotal >= 20) item.finalGrade = 'C';
          else item.finalGrade = 'Pending';

          updated[existingIdx] = item;
        } else {
          const c1 = assessmentType === 'cia1' ? entry.mark : null;
          const c2 = assessmentType === 'cia2' ? entry.mark : null;
          const c3 = assessmentType === 'cia3' ? entry.mark : null;
          const assign = assessmentType === 'assignmentMarks' ? entry.mark : null;
          const prac = assessmentType === 'practicalMarks' ? entry.mark : null;
          const finalExam = assessmentType === 'finalExamMarks' ? entry.mark : null;
          const internalTotal = (c1 ?? 0) + (c2 ?? 0) + (c3 ?? 0) + (assign ?? 0) + (prac ?? 0);

          updated.push({
            id: `cm-${courseId}-${entry.studentId}`,
            studentId: entry.studentId,
            courseId,
            semester: targetCourse?.semester || 1,
            academicYear: '2026-2027',
            cia1: c1,
            cia2: c2,
            cia3: c3,
            assignmentMarks: assign,
            practicalMarks: prac,
            internalTotal: internalTotal > 0 ? internalTotal : null,
            finalExamMarks: finalExam,
            finalGrade: internalTotal >= 30 ? 'Pending' : 'Pending',
            updatedBy: faculty.name,
            updatedAt: now,
            status: finalize ? 'Finalized' : 'Saved'
          });
        }
      });
      return updated;
    });

    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        actorUserId: faculty.id,
        actorName: faculty.name,
        actorRole: 'faculty',
        action: finalize ? 'COURSE_MARKS_FINALIZED' : 'COURSE_MARKS_UPDATED',
        entityType: 'marks',
        entityId: `marks-${courseId}-${assessmentType}`,
        afterJson: JSON.stringify({
          courseCode: targetCourse?.courseCode,
          assessmentType,
          entriesCount: marksEntries.length,
          finalized: !!finalize
        }),
        ip: '192.168.1.104',
        createdAt: nowTime
      },
      ...prev
    ]);

    return {
      success: true,
      message: `${assessmentType.toUpperCase()} marks for ${targetCourse?.courseCode || 'Course'} ${finalize ? 'finalized' : 'saved'}.`
    };
  };

  const getStudentSixSemesterRecord = (studentId: string): SixSemesterRecord => {
    const student =
      students.find((s) => s.id === studentId) ||
      INITIAL_STUDENTS.find((s) => s.id === studentId) ||
      students[0];

    const currentSem = student.semester || 1;

    const semestersRecord = [1, 2, 3, 4, 5, 6].map((sem) => {
      const semCourses = courses.filter((c) => c.semester === sem && c.isActive);
      let status: 'completed' | 'active' | 'future' = 'future';
      let sgpa: number | undefined = undefined;

      if (sem < currentSem) {
        status = 'completed';
        sgpa = (student.sgpaHistory && student.sgpaHistory[sem - 1]) || 8.0;
      } else if (sem === currentSem) {
        status = 'active';
        sgpa = student.cgpa || undefined;
      } else {
        status = 'future';
      }

      const coursesMapped = semCourses.map((c) => {
        const records = courseAttendance.filter(
          (ca) => ca.courseId === c.id && ca.studentId === student.id
        );
        let attRate = 0;
        if (status === 'completed') {
          attRate = 80 + ((c.credits * 3) % 15);
        } else if (status === 'active') {
          if (records.length > 0) {
            const att = records.filter(
              (r) => r.status === 'PRESENT' || r.status === 'ON_DUTY' || r.status === 'LATE'
            ).length;
            attRate = Math.round((att / records.length) * 100);
          } else {
            if (student.id === 's-christian') {
              if (c.courseCode === 'BCA101') attRate = 85;
              else if (c.courseCode === 'BCA102') attRate = 82;
              else if (c.courseCode === 'BCA103') attRate = 74;
              else if (c.courseCode === 'BCA104') attRate = 88;
              else if (c.courseCode === 'BCA105') attRate = 90;
              else attRate = student.attendanceRate;
            } else {
              attRate = student.attendanceRate;
            }
          }
        }

        const marks = courseMarks.find(
          (m) => m.courseId === c.id && m.studentId === student.id
        );

        let cia1: number | null = null;
        let cia2: number | null = null;
        let cia3: number | null = null;
        let internal: number | null = null;
        let grade = '—';
        let courseStatus: 'Finalized' | 'Pending' | 'At Risk' | 'Regular' | 'Not Started' = 'Not Started';

        if (status === 'completed') {
          cia1 = 20 + ((c.credits * 2) % 5);
          cia2 = 21 + ((c.credits * 2) % 4);
          cia3 = 22;
          internal = 42 + (c.credits % 6);
          grade = internal >= 45 ? 'A+' : 'A';
          courseStatus = 'Finalized';
        } else if (status === 'active') {
          if (marks) {
            cia1 = marks.cia1;
            cia2 = marks.cia2;
            cia3 = marks.cia3;
            internal = marks.internalTotal;
            grade = marks.finalGrade || (attRate < 75 ? 'At Risk' : 'Pending');
            courseStatus = attRate < 75 ? 'At Risk' : marks.status === 'Finalized' ? 'Finalized' : 'Pending';
          } else {
            if (student.id === 's-christian') {
              if (c.courseCode === 'BCA101') {
                cia1 = 17; cia2 = 16; cia3 = null; internal = 33; grade = 'Pending'; courseStatus = 'Pending';
              } else if (c.courseCode === 'BCA102') {
                cia1 = 19; cia2 = 18; cia3 = null; internal = 37; grade = 'Pending'; courseStatus = 'Pending';
              } else if (c.courseCode === 'BCA103') {
                cia1 = 15; cia2 = 14; cia3 = null; internal = 29; grade = 'At Risk'; courseStatus = 'At Risk';
              } else {
                cia1 = 20; cia2 = 21; cia3 = null; internal = 41; grade = 'Pending'; courseStatus = 'Pending';
              }
            } else {
              cia1 = 20;
              cia2 = 22;
              internal = 42;
              grade = attRate < 75 ? 'At Risk' : 'Regular';
              courseStatus = attRate < 75 ? 'At Risk' : 'Regular';
            }
          }
        }

        return {
          course: c,
          attendancePercent: attRate,
          cia1,
          cia2,
          cia3,
          internal,
          grade,
          status: courseStatus
        };
      });

      return {
        semester: sem,
        name: `Sem ${sem}`,
        status,
        sgpa,
        courses: coursesMapped
      };
    });

    return {
      student,
      semesters: semestersRecord
    };
  };

  const importCourseAllocationsCsv = (csvText: string) => {
    const lines = csvText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length <= 1) {
      return { success: false, count: 0, message: 'CSV file contains no data rows.' };
    }
    const newAssignments: FacultyCourseAssignment[] = [];
    let processed = 0;

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''));
      if (parts.length >= 3) {
        const [facIdentifier, courseCode, section, batch, acadYear, term] = parts;
        const fac = INITIAL_FACULTY.find(
          (f) => f.id === facIdentifier || f.email.toLowerCase() === facIdentifier.toLowerCase() || f.name.toLowerCase().includes(facIdentifier.toLowerCase())
        );
        const crs = courses.find((c) => c.courseCode.toLowerCase() === courseCode.toLowerCase());
        if (fac && crs) {
          newAssignments.push({
            id: `fca-csv-${Date.now()}-${i}`,
            facultyId: fac.id,
            courseId: crs.id,
            section: section || 'A',
            batch: batch || '2024-2027',
            academicYear: acadYear || '2026-2027',
            term: (term?.toLowerCase() === 'even' ? 'Even' : 'Odd') as 'Odd' | 'Even',
            isActive: true
          });
          processed++;
        }
      }
    }

    if (newAssignments.length > 0) {
      setFacultyCourseAssignments((prev) => [...prev, ...newAssignments]);
      setAuditLogs((prev) => [
        {
          id: `aud-${Date.now()}`,
          actorUserId: 'admin-1',
          actorName: 'Admin',
          actorRole: currentRole,
          action: 'FACULTY_COURSE_CSV_IMPORT',
          entityType: 'course_assignment',
          entityId: `csv-${Date.now()}`,
          afterJson: JSON.stringify({ importedCount: processed }),
          ip: '10.0.0.12',
          createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
        },
        ...prev
      ]);
      return { success: true, count: processed, message: `Successfully allocated ${processed} courses to faculty.` };
    }
    return { success: false, count: 0, message: 'No valid matching faculty or courses found in CSV.' };
  };

  const importStudentEnrollmentsCsv = (csvText: string) => {
    const lines = csvText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length <= 1) {
      return { success: false, count: 0, message: 'CSV file contains no data rows.' };
    }
    const newEnrollments: StudentCourseEnrollment[] = [];
    let processed = 0;

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''));
      if (parts.length >= 2) {
        const [studentIdentifier, courseCode, section, acadYear] = parts;
        const st = students.find(
          (s) => s.studentId === studentIdentifier || s.id === studentIdentifier || s.email.toLowerCase() === studentIdentifier.toLowerCase()
        );
        const crs = courses.find((c) => c.courseCode.toLowerCase() === courseCode.toLowerCase());
        if (st && crs) {
          newEnrollments.push({
            id: `enr-csv-${Date.now()}-${i}`,
            studentId: st.id,
            courseId: crs.id,
            section: section || st.section || 'A',
            academicYear: acadYear || '2026-2027',
            enrollmentStatus: 'Enrolled'
          });
          processed++;
        }
      }
    }

    if (newEnrollments.length > 0) {
      setStudentCourseEnrollments((prev) => [...prev, ...newEnrollments]);
      setAuditLogs((prev) => [
        {
          id: `aud-${Date.now()}`,
          actorUserId: 'admin-1',
          actorName: 'Admin',
          actorRole: currentRole,
          action: 'STUDENT_COURSE_CSV_IMPORT',
          entityType: 'course_enrollment',
          entityId: `csv-${Date.now()}`,
          afterJson: JSON.stringify({ importedCount: processed }),
          ip: '10.0.0.12',
          createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
        },
        ...prev
      ]);
      return { success: true, count: processed, message: `Successfully enrolled ${processed} students into courses.` };
    }
    return { success: false, count: 0, message: 'No valid matching students or courses found in CSV.' };
  };

  const resetDemoData = () => {
    localStorage.clear();
    setStudents(INITIAL_STUDENTS);
    setAssignments(INITIAL_ASSIGNMENTS);
    setWorkingDays(INITIAL_WORKING_DAYS);
    setAttendanceSettings(INITIAL_ATTENDANCE_SETTINGS);
    setSmsTemplates(INITIAL_SMS_TEMPLATES);
    setSmsMessages(INITIAL_SMS_MESSAGES);
    setCounselingReferrals(INITIAL_COUNSELING_REFERRALS);
    setCounselingNotes(INITIAL_COUNSELING_NOTES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setCourses(INITIAL_COURSES);
    setFacultyCourseAssignments(INITIAL_FACULTY_COURSE_ASSIGNMENTS);
    setStudentCourseEnrollments(INITIAL_STUDENT_COURSE_ENROLLMENTS);
    setCourseAttendance(INITIAL_COURSE_ATTENDANCE);
    setCourseMarks(INITIAL_COURSE_MARKS);
    setCurrentRole('faculty');
    setActiveFacultyState(INITIAL_FACULTY[0]);
    setActiveStudentState(INITIAL_STUDENTS[0]);
    setActiveCounselorState(INITIAL_COUNSELORS[0]);
  };

  return (
    <DemoContext.Provider
      value={{
        currentRole,
        currentUser: getCurrentUser(),
        activeFaculty,
        activeStudent,
        activeCounselor,
        students,
        facultyList: INITIAL_FACULTY,
        counselorList: INITIAL_COUNSELORS,
        adminList: INITIAL_ADMINS,
        assignments,
        workingDays,
        attendanceSettings,
        smsTemplates,
        smsMessages,
        counselingReferrals,
        counselingNotes,
        auditLogs,
        semesters: SEMESTERS,
        classes: CLASSES,
        isAuthenticated,
        accessDeniedMessage,
        courses,
        facultyCourseAssignments,
        studentCourseEnrollments,
        courseAttendance,
        courseMarks,
        login,
        logout,
        requestPasswordReset,
        setAccessDeniedMessage,
        switchRole,
        setActiveFaculty,
        setActiveStudent,
        getScopedStudentsForActiveFaculty,
        markAndFinalizeAttendance,
        addMentoringSession,
        createCounselingReferral,
        addCounselingNote,
        updateAttendanceSettings,
        toggleWorkingDay,
        updateCondonationStatus,
        updateSmsTemplate,
        reassignStudent,
        resetDemoData,
        addCourse,
        updateCourse,
        archiveCourse,
        restoreCourse,
        assignFacultyToCourse,
        removeFacultyCourseAssignment,
        enrollStudentInCourse,
        bulkEnrollStudents,
        removeStudentEnrollment,
        saveCourseAttendance,
        saveCourseMarks,
        getAssignedCoursesForFaculty,
        getEnrolledStudentsForCourse,
        getStudentSixSemesterRecord,
        importCourseAllocationsCsv,
        importStudentEnrollmentsCsv
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
