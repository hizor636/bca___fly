import { dbManager } from './database.js';
import {
  DEPARTMENTS,
  SEMESTERS,
  CLASSES,
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
  INITIAL_STUDENTS,
  INITIAL_NOTICES
} from '../../src/data/mockStore.js';
import {
  INITIAL_COURSES,
  INITIAL_FACULTY_COURSE_ASSIGNMENTS,
  INITIAL_STUDENT_COURSE_ENROLLMENTS,
  INITIAL_COURSE_MARKS,
  INITIAL_COURSE_ATTENDANCE
} from '../../src/data/courseData.js';

export function seedDatabase(force = false): void {
  const usersCount = dbManager.query('SELECT COUNT(*) as count FROM users').rows[0]?.count || 0;
  if (usersCount > 0 && !force) {
    console.log(`[Database Seeder] Database already contains ${usersCount} users. Skipping seeding.`);
    return;
  }

  console.log('[Database Seeder] Starting database seeding...');

  if (force) {
    const tables = dbManager.getTableNames();
    for (const tbl of tables) {
      dbManager.run(`DELETE FROM "${tbl}"`);
    }
  }

  // 1. Departments
  for (const dept of DEPARTMENTS) {
    dbManager.run(
      'INSERT OR REPLACE INTO departments (id, name, code) VALUES (?, ?, ?)',
      [dept.id, dept.name, dept.code]
    );
  }

  // 2. Semesters
  for (const sem of SEMESTERS) {
    dbManager.run(
      'INSERT OR REPLACE INTO semesters (id, number, name, year, typical_status, start_date, end_date, is_current, total_enrolled) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [sem.id, sem.number, sem.name, sem.year || 1, sem.typicalStatus || '', sem.startDate, sem.endDate, sem.isCurrent ? 1 : 0, sem.totalEnrolled]
    );
  }

  // 3. Classes
  for (const cls of CLASSES) {
    dbManager.run(
      'INSERT OR REPLACE INTO classes (id, semester_id, section, year, name, course_code, subject_name, assigned_faculty_id, room_no) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [cls.id, cls.semesterId, cls.section, cls.year, cls.name, cls.courseCode, cls.subjectName, cls.assignedFacultyId, cls.roomNo]
    );
  }

  // 4. Users (Faculty + Admins + Counselors + Students)
  for (const fac of INITIAL_FACULTY) {
    dbManager.run(
      'INSERT OR REPLACE INTO users (id, name, email, role, phone, department_id, is_active, avatar_bg, avatar_text, designation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [fac.id, fac.name, fac.email, 'faculty', fac.phone || '', 'dept-bca', 1, '#4f46e5', fac.name.charAt(0), fac.designation]
    );
  }

  for (const admin of INITIAL_ADMINS) {
    dbManager.run(
      'INSERT OR REPLACE INTO users (id, name, email, role, phone, department_id, is_active, avatar_bg, avatar_text, designation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [admin.id, admin.name, admin.email, admin.role, admin.phone, admin.departmentId, admin.isActive ? 1 : 0, admin.avatarBg, admin.avatarText, admin.designation]
    );
  }

  for (const coun of INITIAL_COUNSELORS) {
    dbManager.run(
      'INSERT OR REPLACE INTO users (id, name, email, role, phone, department_id, is_active, avatar_bg, avatar_text, designation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [coun.id, coun.name, coun.email, coun.role, coun.phone, coun.departmentId, coun.isActive ? 1 : 0, coun.avatarBg, coun.avatarText, coun.designation]
    );
  }

  // 5. Faculty profiles
  for (const fac of INITIAL_FACULTY) {
    dbManager.run(
      'INSERT OR REPLACE INTO faculty (id, name, designation, department, email, phone, office, assigned_students_count, specialization, courses) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [fac.id, fac.name, fac.designation, fac.department, fac.email, fac.phone || '', fac.office, fac.assignedStudentsCount, fac.specialization, JSON.stringify(fac.courses)]
    );
  }

  // 6. Students
  for (const st of INITIAL_STUDENTS) {
    dbManager.run(
      `INSERT OR REPLACE INTO students (
        id, student_id, name, initials, avatar_bg, avatar_text, course, semester, section,
        email, phone, parent_phone, attendance_rate, mentoring_status, cgpa, sgpa_history,
        assigned_faculty, assigned_faculty_id, last_mentoring_date, weekly_attendance,
        total_classes_held, total_classes_attended, condonation_eligible, condonation_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        st.id,
        st.studentId,
        st.name,
        st.initials,
        st.avatarBg || '#0284c7',
        st.avatarText || st.initials,
        st.course,
        st.semester,
        st.section || 'A',
        st.email,
        st.phone,
        st.parentPhone || '',
        st.attendanceRate,
        st.mentoringStatus,
        st.cgpa,
        JSON.stringify(st.sgpaHistory || []),
        st.assignedFaculty,
        st.assignedFacultyId || 'fac-1',
        st.lastMentoringDate || '',
        JSON.stringify(st.weeklyAttendance || []),
        st.totalClassesHeld || 100,
        st.totalClassesAttended || 85,
        st.condonationEligible ? 1 : 0,
        st.condonationStatus || 'Pending'
      ]
    );

    // Also add student user record
    dbManager.run(
      'INSERT OR REPLACE INTO users (id, name, email, role, phone, department_id, is_active, avatar_bg, avatar_text, designation, student_id, semester) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [st.id, st.name, st.email, 'student', st.phone, 'dept-bca', 1, st.avatarBg, st.avatarText, 'BCA Undergraduate', st.studentId, st.semester]
    );

    // Mentoring notes for student
    if (st.mentoringNotes && st.mentoringNotes.length > 0) {
      for (const note of st.mentoringNotes) {
        dbManager.run(
          'INSERT OR REPLACE INTO mentoring_notes (id, student_id, date, faculty_name, faculty_id, topic, notes, action_items, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [note.id, st.id, note.date, note.facultyName, note.facultyId || 'fac-1', note.topic, note.notes, note.actionItems, note.status]
        );
      }
    }
  }

  // 7. Student Assignments
  for (const asgn of INITIAL_ASSIGNMENTS) {
    dbManager.run(
      'INSERT OR REPLACE INTO student_assignments (id, student_id, faculty_id, semester_id, class_id, reason, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [asgn.id, asgn.studentId, asgn.facultyId, asgn.semesterId, asgn.classId || '', asgn.reason, asgn.startDate, asgn.endDate || '']
    );
  }

  // 8. Courses
  for (const c of INITIAL_COURSES) {
    dbManager.run(
      `INSERT OR REPLACE INTO courses (
        id, course_code, course_name, short_name, semester, department_id, academic_scheme,
        credits, course_type, max_marks, cia1_max_marks, cia2_max_marks, cia3_max_marks,
        attendance_required, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        c.id, c.courseCode, c.courseName, c.shortName || '', c.semester, c.departmentId, c.academicScheme,
        c.credits, c.courseType, c.maxMarks, c.cia1MaxMarks || 25, c.cia2MaxMarks || 25, c.cia3MaxMarks || 25,
        c.attendanceRequired || 75.0, c.isActive ? 1 : 0, c.createdAt, c.updatedAt
      ]
    );
  }

  // 9. Faculty Course Assignments
  for (const fca of INITIAL_FACULTY_COURSE_ASSIGNMENTS) {
    dbManager.run(
      'INSERT OR REPLACE INTO faculty_course_assignments (id, faculty_id, course_id, section, batch, academic_year, term, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [fca.id, fca.facultyId, fca.courseId, fca.section, fca.batch, fca.academicYear, fca.term, fca.isActive ? 1 : 0]
    );
  }

  // 10. Student Course Enrollments
  for (const sce of INITIAL_STUDENT_COURSE_ENROLLMENTS) {
    dbManager.run(
      'INSERT OR REPLACE INTO student_course_enrollments (id, student_id, course_id, academic_year, section, enrollment_status) VALUES (?, ?, ?, ?, ?, ?)',
      [sce.id, sce.studentId, sce.courseId, sce.academicYear, sce.section, sce.enrollmentStatus]
    );
  }

  // 11. Course Attendance Records
  for (const att of INITIAL_COURSE_ATTENDANCE) {
    dbManager.run(
      'INSERT OR REPLACE INTO course_attendance_records (id, student_id, course_id, faculty_id, date, session_type, status, marked_at, marked_by, finalized, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [att.id, att.studentId, att.courseId, att.facultyId, att.date, att.sessionType, att.status, att.markedAt, att.markedBy, att.finalized ? 1 : 0, att.remarks || '']
    );
  }

  // 12. Course Marks
  for (const m of INITIAL_COURSE_MARKS) {
    dbManager.run(
      `INSERT OR REPLACE INTO course_marks (
        id, student_id, course_id, semester, academic_year, cia1, cia2, cia3,
        assignment_marks, practical_marks, internal_total, final_exam_marks, final_grade,
        updated_by, updated_at, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        m.id, m.studentId, m.courseId, m.semester, m.academicYear, m.cia1, m.cia2, m.cia3,
        m.assignmentMarks, m.practicalMarks, m.internalTotal, m.finalExamMarks, m.finalGrade,
        m.updatedBy, m.updatedAt, m.status || 'Finalized'
      ]
    );
  }

  // 13. Counseling Referrals & Notes
  for (const ref of INITIAL_COUNSELING_REFERRALS) {
    dbManager.run(
      `INSERT OR REPLACE INTO counseling_referrals (
        id, student_id, student_name, semester, referred_by_faculty_id, referred_by_faculty_name,
        counselor_id, counselor_name, reason_code, faculty_remarks, status, mentor_visible_status,
        created_at, closed_at, notes_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ref.id, ref.studentId, ref.studentName, ref.semester, ref.referredByFacultyId, ref.referredByFacultyName,
        ref.counselorId, ref.counselorName, ref.reasonCode, ref.facultyRemarks, ref.status, ref.mentorVisibleStatus,
        ref.createdAt, ref.closedAt || null, ref.notesCount || 0
      ]
    );
  }

  for (const cn of INITIAL_COUNSELING_NOTES) {
    dbManager.run(
      'INSERT OR REPLACE INTO counseling_notes (id, referral_id, note_text, treatment_plan, created_by_counselor_id, created_by_counselor_name, created_at, is_confidential) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [cn.id, cn.referralId, cn.noteText, cn.treatmentPlan, cn.createdByCounselorId, cn.createdByCounselorName, cn.createdAt, cn.isConfidential ? 1 : 0]
    );
  }

  // 14. Attendance Settings & Working Days
  dbManager.run(
    'INSERT OR REPLACE INTO attendance_settings (id, daily_cutoff_time, cutoff_enforced, auto_sms_on_finalize, sms_working_days_only) VALUES (?, ?, ?, ?, ?)',
    ['primary', INITIAL_ATTENDANCE_SETTINGS.dailyCutoffTime, INITIAL_ATTENDANCE_SETTINGS.cutoffEnforced ? 1 : 0, INITIAL_ATTENDANCE_SETTINGS.autoSmsOnFinalize ? 1 : 0, INITIAL_ATTENDANCE_SETTINGS.smsWorkingDaysOnly ? 1 : 0]
  );

  for (const wd of INITIAL_WORKING_DAYS) {
    dbManager.run(
      'INSERT OR REPLACE INTO working_days (id, date, day_of_week, is_working, reason) VALUES (?, ?, ?, ?, ?)',
      [wd.id, wd.date, wd.dayOfWeek, wd.isWorking ? 1 : 0, wd.reason || '']
    );
  }

  // 15. SMS Templates & Messages
  for (const tmpl of INITIAL_SMS_TEMPLATES) {
    dbManager.run(
      'INSERT OR REPLACE INTO sms_templates (id, name, body, variables, is_active) VALUES (?, ?, ?, ?, ?)',
      [tmpl.id, tmpl.name, tmpl.body, JSON.stringify(tmpl.variables), tmpl.isActive ? 1 : 0]
    );
  }

  for (const msg of INITIAL_SMS_MESSAGES) {
    dbManager.run(
      'INSERT OR REPLACE INTO sms_messages (id, student_id, student_name, recipient_phone, recipient_type, template_id, body, channel, status, sent_at, provider_message_id, idempotency_key, is_working_day) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [msg.id, msg.studentId, msg.studentName, msg.recipientPhone, msg.recipientType, msg.templateId, msg.body, msg.channel, msg.status, msg.sentAt, msg.providerMessageId, msg.idempotencyKey, msg.isWorkingDay ? 1 : 0]
    );
  }

  // 16. Audit Logs
  for (const log of INITIAL_AUDIT_LOGS) {
    dbManager.run(
      'INSERT OR REPLACE INTO audit_logs (id, actor_user_id, actor_name, actor_role, action, entity_type, entity_id, before_json, after_json, ip, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [log.id, log.actorUserId, log.actorName, log.actorRole, log.action, log.entityType, log.entityId, log.beforeJson || null, log.afterJson || null, log.ip, log.createdAt]
    );
  }

  // 17. Notices
  for (const notice of INITIAL_NOTICES) {
    dbManager.run(
      'INSERT OR REPLACE INTO notices (id, title, subtitle, date, is_new, priority, body, action_label, deadline) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [notice.id, notice.title, notice.subtitle, notice.date, notice.isNew ? 1 : 0, notice.priority, notice.body, notice.actionLabel || '', notice.deadline || '']
    );
  }

  dbManager.persist();
  console.log('[Database Seeder] Database seeded successfully with full BCAFly dataset!');
}
