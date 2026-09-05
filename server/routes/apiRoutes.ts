import { Router, Request, Response } from 'express';
import { dbManager } from '../db/database.js';

export const apiRouter = Router();

// --- Health Check ---
apiRouter.get('/health', (req: Request, res: Response) => {
  try {
    const stats = dbManager.getStats();
    res.json({
      status: 'online',
      timestamp: new Date().toISOString(),
      database: {
        engine: stats.engine,
        tableCount: stats.tableCount,
        totalRows: stats.totalRows,
        sizeKb: stats.databaseSizeKb
      }
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// --- Auth Endpoints ---
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password, roleHint } = req.body;
  try {
    let sql = 'SELECT * FROM users WHERE email = ? AND is_active = 1';
    let params: any[] = [email];
    if (roleHint) {
      sql += ' AND role = ?';
      params.push(roleHint);
    }
    const userRes = dbManager.query(sql, params);
    if (userRes.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid credentials or inactive account' });
    }

    const user = userRes.rows[0];

    // Log login audit
    dbManager.run(
      'INSERT INTO audit_logs (id, actor_user_id, actor_name, actor_role, action, entity_type, entity_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [`audit-${Date.now()}`, user.id, user.name, user.role, 'LOGIN_SUCCESS', 'auth', user.id, new Date().toISOString()]
    );

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        departmentId: user.department_id,
        isActive: Boolean(user.is_active),
        avatarBg: user.avatar_bg,
        avatarText: user.avatar_text,
        designation: user.designation,
        studentId: user.student_id,
        semester: user.semester
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Departments & Semesters ---
apiRouter.get('/departments', (req: Request, res: Response) => {
  try {
    const resDepts = dbManager.query('SELECT * FROM departments');
    res.json({ success: true, data: resDepts.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/semesters', (req: Request, res: Response) => {
  try {
    const resSems = dbManager.query('SELECT * FROM semesters ORDER BY number ASC');
    const semesters = resSems.rows.map(s => ({
      id: s.id,
      number: s.number,
      name: s.name,
      year: s.year,
      typicalStatus: s.typical_status,
      startDate: s.start_date,
      endDate: s.end_date,
      isCurrent: Boolean(s.is_current),
      totalEnrolled: s.total_enrolled
    }));
    res.json({ success: true, data: semesters });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Faculty & Mentors ---
apiRouter.get('/faculty', (req: Request, res: Response) => {
  try {
    const resFac = dbManager.query('SELECT * FROM faculty ORDER BY name ASC');
    const faculty = resFac.rows.map(f => ({
      id: f.id,
      name: f.name,
      designation: f.designation,
      department: f.department,
      email: f.email,
      phone: f.phone,
      office: f.office,
      assignedStudentsCount: f.assigned_students_count,
      specialization: f.specialization,
      courses: f.courses ? JSON.parse(f.courses) : []
    }));
    res.json({ success: true, data: faculty });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Students ---
apiRouter.get('/students', (req: Request, res: Response) => {
  const semester = req.query.semester ? parseInt(req.query.semester as string, 10) : null;
  const facultyId = req.query.facultyId as string;
  try {
    let sql = 'SELECT * FROM students WHERE 1=1';
    const params: any[] = [];

    if (semester) {
      sql += ' AND semester = ?';
      params.push(semester);
    }
    if (facultyId) {
      sql += ' AND assigned_faculty_id = ?';
      params.push(facultyId);
    }
    sql += ' ORDER BY name ASC';

    const stRes = dbManager.query(sql, params);
    const students = stRes.rows.map(s => {
      // Fetch mentoring notes for this student
      const notesRes = dbManager.query('SELECT * FROM mentoring_notes WHERE student_id = ? ORDER BY date DESC', [s.id]);
      const mentoringNotes = notesRes.rows.map(n => ({
        id: n.id,
        date: n.date,
        facultyName: n.faculty_name,
        facultyId: n.faculty_id,
        topic: n.topic,
        notes: n.notes,
        actionItems: n.action_items,
        status: n.status
      }));

      return {
        id: s.id,
        studentId: s.student_id,
        name: s.name,
        initials: s.initials,
        avatarBg: s.avatar_bg,
        avatarText: s.avatar_text,
        course: s.course,
        semester: s.semester,
        section: s.section,
        email: s.email,
        phone: s.phone,
        parentPhone: s.parent_phone,
        attendanceRate: s.attendance_rate,
        mentoringStatus: s.mentoring_status,
        cgpa: s.cgpa,
        sgpaHistory: s.sgpa_history ? JSON.parse(s.sgpa_history) : [],
        assignedFaculty: s.assigned_faculty,
        assignedFacultyId: s.assigned_faculty_id,
        lastMentoringDate: s.last_mentoring_date,
        mentoringNotes,
        weeklyAttendance: s.weekly_attendance ? JSON.parse(s.weekly_attendance) : [],
        totalClassesHeld: s.total_classes_held,
        totalClassesAttended: s.total_classes_attended,
        condonationEligible: Boolean(s.condonation_eligible),
        condonationStatus: s.condonation_status
      };
    });

    res.json({ success: true, data: students });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.put('/students/:id/reassign', (req: Request, res: Response) => {
  const { id } = req.params;
  const { newFacultyId } = req.body;
  try {
    const facRes = dbManager.query('SELECT * FROM faculty WHERE id = ?', [newFacultyId]);
    if (facRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Faculty not found' });
    }
    const faculty = facRes.rows[0];

    dbManager.run(
      'UPDATE students SET assigned_faculty = ?, assigned_faculty_id = ? WHERE id = ?',
      [faculty.name, faculty.id, id]
    );

    // Audit log
    dbManager.run(
      'INSERT INTO audit_logs (id, actor_user_id, actor_name, actor_role, action, entity_type, entity_id, after_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [`audit-${Date.now()}`, 'admin-1', 'Admin', 'admin', 'REASSIGN_MENTOR', 'student', id, JSON.stringify({ assignedFaculty: faculty.name, assignedFacultyId: faculty.id }), new Date().toISOString()]
    );

    res.json({ success: true, message: 'Student mentor reassigned successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Mentoring Sessions ---
apiRouter.post('/mentoring', (req: Request, res: Response) => {
  const { studentId, date, topic, notes, actionItems, status, facultyName, facultyId } = req.body;
  try {
    const noteId = `note-${Date.now()}`;
    dbManager.run(
      'INSERT INTO mentoring_notes (id, student_id, date, faculty_name, faculty_id, topic, notes, action_items, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [noteId, studentId, date, facultyName || 'Faculty', facultyId || 'fac-1', topic, notes, actionItems, status || 'Resolved']
    );

    // Update last mentoring date on student
    dbManager.run('UPDATE students SET last_mentoring_date = ? WHERE id = ?', [date, studentId]);

    res.json({ success: true, id: noteId, message: 'Mentoring note recorded' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Courses Master ---
apiRouter.get('/courses', (req: Request, res: Response) => {
  const semester = req.query.semester ? parseInt(req.query.semester as string, 10) : null;
  try {
    let sql = 'SELECT * FROM courses WHERE is_active = 1';
    const params: any[] = [];
    if (semester) {
      sql += ' AND semester = ?';
      params.push(semester);
    }
    sql += ' ORDER BY semester ASC, course_code ASC';

    const coursesRes = dbManager.query(sql, params);
    const courses = coursesRes.rows.map(c => ({
      id: c.id,
      courseCode: c.course_code,
      courseName: c.course_name,
      shortName: c.short_name,
      semester: c.semester,
      departmentId: c.department_id,
      academicScheme: c.academic_scheme,
      credits: c.credits,
      courseType: c.course_type,
      maxMarks: c.max_marks,
      cia1MaxMarks: c.cia1_max_marks,
      cia2MaxMarks: c.cia2_max_marks,
      cia3MaxMarks: c.cia3_max_marks,
      attendanceRequired: c.attendance_required,
      isActive: Boolean(c.is_active),
      createdAt: c.created_at,
      updatedAt: c.updated_at
    }));

    res.json({ success: true, data: courses });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/courses', (req: Request, res: Response) => {
  const c = req.body;
  try {
    const id = c.id || `c-${c.courseCode.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    const now = new Date().toISOString();
    dbManager.run(
      `INSERT INTO courses (
        id, course_code, course_name, short_name, semester, department_id, academic_scheme,
        credits, course_type, max_marks, cia1_max_marks, cia2_max_marks, cia3_max_marks,
        attendance_required, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, c.courseCode, c.courseName, c.shortName || '', c.semester, c.departmentId || 'dept-bca', c.academicScheme || 'BCA-2024-REG',
        c.credits || 4, c.courseType || 'Theory', c.maxMarks || 100, c.cia1MaxMarks || 25, c.cia2MaxMarks || 25, c.cia3MaxMarks || 25,
        c.attendanceRequired || 75.0, 1, now, now
      ]
    );

    res.json({ success: true, id, message: 'Course created successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Faculty Course Allocations & Student Enrollments ---
apiRouter.get('/courses/allocations', (req: Request, res: Response) => {
  try {
    const resAlloc = dbManager.query('SELECT * FROM faculty_course_assignments WHERE is_active = 1');
    const allocations = resAlloc.rows.map(a => ({
      id: a.id,
      facultyId: a.faculty_id,
      courseId: a.course_id,
      section: a.section,
      batch: a.batch,
      academicYear: a.academic_year,
      term: a.term,
      isActive: Boolean(a.is_active)
    }));
    res.json({ success: true, data: allocations });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/courses/enrollments', (req: Request, res: Response) => {
  const courseId = req.query.courseId as string;
  try {
    let sql = 'SELECT * FROM student_course_enrollments WHERE enrollment_status = "Enrolled"';
    const params: any[] = [];
    if (courseId) {
      sql += ' AND course_id = ?';
      params.push(courseId);
    }
    const resEnr = dbManager.query(sql, params);
    const enrollments = resEnr.rows.map(e => ({
      id: e.id,
      studentId: e.student_id,
      courseId: e.course_id,
      academicYear: e.academic_year,
      section: e.section,
      enrollmentStatus: e.enrollment_status
    }));
    res.json({ success: true, data: enrollments });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Course Marks ---
apiRouter.get('/marks', (req: Request, res: Response) => {
  const courseId = req.query.courseId as string;
  const studentId = req.query.studentId as string;
  try {
    let sql = 'SELECT * FROM course_marks WHERE 1=1';
    const params: any[] = [];
    if (courseId) {
      sql += ' AND course_id = ?';
      params.push(courseId);
    }
    if (studentId) {
      sql += ' AND student_id = ?';
      params.push(studentId);
    }
    const marksRes = dbManager.query(sql, params);
    const marks = marksRes.rows.map(m => ({
      id: m.id,
      studentId: m.student_id,
      courseId: m.course_id,
      semester: m.semester,
      academicYear: m.academic_year,
      cia1: m.cia1,
      cia2: m.cia2,
      cia3: m.cia3,
      assignmentMarks: m.assignment_marks,
      practicalMarks: m.practical_marks,
      internalTotal: m.internal_total,
      finalExamMarks: m.final_exam_marks,
      finalGrade: m.final_grade,
      updatedBy: m.updated_by,
      updatedAt: m.updated_at,
      status: m.status
    }));
    res.json({ success: true, data: marks });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/marks/batch', (req: Request, res: Response) => {
  const { courseId, assessmentType, marksEntries, finalize, updatedBy } = req.body;
  if (!courseId || !assessmentType || !Array.isArray(marksEntries)) {
    return res.status(400).json({ success: false, error: 'Invalid batch marks payload' });
  }

  try {
    const now = new Date().toISOString();
    for (const entry of marksEntries) {
      const { studentId, mark } = entry;
      // Check existing
      const existing = dbManager.query('SELECT * FROM course_marks WHERE student_id = ? AND course_id = ?', [studentId, courseId]);

      if (existing.rows.length > 0) {
        const colMap: Record<string, string> = {
          cia1: 'cia1',
          cia2: 'cia2',
          cia3: 'cia3',
          assignmentMarks: 'assignment_marks',
          practicalMarks: 'practical_marks',
          finalExamMarks: 'final_exam_marks'
        };
        const dbCol = colMap[assessmentType] || 'cia1';
        dbManager.run(
          `UPDATE course_marks SET "${dbCol}" = ?, updated_by = ?, updated_at = ?, status = ? WHERE student_id = ? AND course_id = ?`,
          [mark, updatedBy || 'Faculty', now, finalize ? 'Finalized' : 'Saved', studentId, courseId]
        );
      } else {
        const id = `mark-${studentId}-${courseId}`;
        dbManager.run(
          `INSERT INTO course_marks (
            id, student_id, course_id, semester, academic_year, "${assessmentType}", updated_by, updated_at, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, studentId, courseId, 5, '2026-27', mark, updatedBy || 'Faculty', now, finalize ? 'Finalized' : 'Saved']
        );
      }
    }

    res.json({ success: true, message: `Successfully updated ${marksEntries.length} marks entries for ${assessmentType}` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Course Attendance ---
apiRouter.get('/attendance/course-records', (req: Request, res: Response) => {
  const courseId = req.query.courseId as string;
  const date = req.query.date as string;
  try {
    let sql = 'SELECT * FROM course_attendance_records WHERE 1=1';
    const params: any[] = [];
    if (courseId) {
      sql += ' AND course_id = ?';
      params.push(courseId);
    }
    if (date) {
      sql += ' AND date = ?';
      params.push(date);
    }
    const attRes = dbManager.query(sql, params);
    const records = attRes.rows.map(a => ({
      id: a.id,
      studentId: a.student_id,
      courseId: a.course_id,
      facultyId: a.faculty_id,
      date: a.date,
      sessionType: a.session_type,
      status: a.status,
      markedAt: a.marked_at,
      markedBy: a.marked_by,
      finalized: Boolean(a.finalized),
      remarks: a.remarks
    }));
    res.json({ success: true, data: records });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/attendance/course-records/batch', (req: Request, res: Response) => {
  const { courseId, facultyId, date, sessionType, records, finalize, markedBy } = req.body;
  if (!courseId || !date || !Array.isArray(records)) {
    return res.status(400).json({ success: false, error: 'Invalid attendance batch payload' });
  }

  try {
    const now = new Date().toISOString();
    for (const rec of records) {
      const id = `att-${rec.studentId}-${courseId}-${date}`;
      dbManager.run(
        `INSERT OR REPLACE INTO course_attendance_records (
          id, student_id, course_id, faculty_id, date, session_type, status, marked_at, marked_by, finalized, remarks
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, rec.studentId, courseId, facultyId || 'fac-1', date, sessionType || 'THEORY',
          rec.status || 'PRESENT', now, markedBy || 'Faculty', finalize ? 1 : 0, rec.remarks || ''
        ]
      );
    }

    res.json({ success: true, message: `Recorded attendance for ${records.length} students` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Counseling Referrals & Notes ---
apiRouter.get('/counseling/referrals', (req: Request, res: Response) => {
  try {
    const refRes = dbManager.query('SELECT * FROM counseling_referrals ORDER BY created_at DESC');
    const referrals = refRes.rows.map(r => ({
      id: r.id,
      studentId: r.student_id,
      studentName: r.student_name,
      semester: r.semester,
      referredByFacultyId: r.referred_by_faculty_id,
      referredByFacultyName: r.referred_by_faculty_name,
      counselorId: r.counselor_id,
      counselorName: r.counselor_name,
      reasonCode: r.reason_code,
      facultyRemarks: r.faculty_remarks,
      status: r.status,
      mentorVisibleStatus: r.mentor_visible_status,
      createdAt: r.created_at,
      closedAt: r.closed_at,
      notesCount: r.notes_count
    }));
    res.json({ success: true, data: referrals });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/counseling/referrals', (req: Request, res: Response) => {
  const { studentId, studentName, semester, referredByFacultyId, referredByFacultyName, reasonCode, facultyRemarks } = req.body;
  try {
    const id = `ref-${Date.now()}`;
    const now = new Date().toISOString();
    dbManager.run(
      `INSERT INTO counseling_referrals (
        id, student_id, student_name, semester, referred_by_faculty_id, referred_by_faculty_name,
        counselor_id, counselor_name, reason_code, faculty_remarks, status, mentor_visible_status,
        created_at, notes_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, studentId, studentName || 'Student', semester || 5, referredByFacultyId || 'fac-1',
        referredByFacultyName || 'Faculty', 'counselor-1', 'Dr. Priya Sharma', reasonCode,
        facultyRemarks, 'pending', 'Under Review', now, 0
      ]
    );

    res.json({ success: true, id, message: 'Counseling referral created' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- SMS & Communications ---
apiRouter.get('/sms/messages', (req: Request, res: Response) => {
  try {
    const smsRes = dbManager.query('SELECT * FROM sms_messages ORDER BY sent_at DESC LIMIT 100');
    const messages = smsRes.rows.map(m => ({
      id: m.id,
      studentId: m.student_id,
      studentName: m.student_name,
      recipientPhone: m.recipient_phone,
      recipientType: m.recipient_type,
      templateId: m.template_id,
      body: m.body,
      channel: m.channel,
      status: m.status,
      sentAt: m.sent_at,
      providerMessageId: m.provider_message_id,
      idempotencyKey: m.idempotency_key,
      isWorkingDay: Boolean(m.is_working_day)
    }));
    res.json({ success: true, data: messages });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/sms/templates', (req: Request, res: Response) => {
  try {
    const tmplRes = dbManager.query('SELECT * FROM sms_templates WHERE is_active = 1');
    const templates = tmplRes.rows.map(t => ({
      id: t.id,
      name: t.name,
      body: t.body,
      variables: t.variables ? JSON.parse(t.variables) : [],
      isActive: Boolean(t.is_active)
    }));
    res.json({ success: true, data: templates });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Audit Trail Logs ---
apiRouter.get('/audit-logs', (req: Request, res: Response) => {
  try {
    const logsRes = dbManager.query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 150');
    const logs = logsRes.rows.map(l => ({
      id: l.id,
      actorUserId: l.actor_user_id,
      actorName: l.actor_name,
      actorRole: l.actor_role,
      action: l.action,
      entityType: l.entity_type,
      entityId: l.entity_id,
      beforeJson: l.before_json,
      afterJson: l.after_json,
      ip: l.ip,
      createdAt: l.created_at
    }));
    res.json({ success: true, data: logs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Department Notices ---
apiRouter.get('/notices', (req: Request, res: Response) => {
  try {
    const nRes = dbManager.query('SELECT * FROM notices ORDER BY date DESC');
    const notices = nRes.rows.map(n => ({
      id: n.id,
      title: n.title,
      subtitle: n.subtitle,
      date: n.date,
      isNew: Boolean(n.is_new),
      priority: n.priority,
      body: n.body,
      actionLabel: n.action_label,
      deadline: n.deadline
    }));
    res.json({ success: true, data: notices });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Python AI & Data Analytics Forwarding ---
const PYTHON_AI_URL = process.env.PYTHON_AI_URL || 'http://localhost:5001';

apiRouter.get('/analytics/status', async (req: Request, res: Response) => {
  try {
    const pRes = await fetch(`${PYTHON_AI_URL}/health`, { signal: AbortSignal.timeout(2000) });
    if (pRes.ok) {
      const data = await pRes.json();
      return res.json({ success: true, online: true, ...data });
    }
    res.json({ success: true, online: false, message: 'Python service returned non-200' });
  } catch (err: any) {
    res.json({ success: true, online: false, message: 'Python analytics service offline (Run npm run server:ai)' });
  }
});

apiRouter.post('/analytics/attendance/forecast', async (req: Request, res: Response) => {
  try {
    const pRes = await fetch(`${PYTHON_AI_URL}/analytics/attendance/forecast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      signal: AbortSignal.timeout(3000)
    });
    if (pRes.ok) {
      const data = await pRes.json();
      return res.json(data);
    }
  } catch {
    // Fallback calculation in JS if Python is offline
  }

  // Pure TypeScript/JS Fallback Forecaster
  const studentId = req.body?.studentId;
  const sRes = dbManager.query('SELECT * FROM students WHERE id = ? OR student_id = ?', [studentId, studentId]);
  if (sRes.rows.length === 0) return res.status(404).json({ error: 'Student not found' });
  
  const student = sRes.rows[0];
  const rate = Number(student.attendance_rate || 75.0);
  const totalPlanned = req.body?.totalPlannedClasses || 60;
  const held = 30;
  const attended = Math.round((rate / 100) * held);
  const remaining = totalPlanned - held;
  const minNeeded = Math.max(0, Math.ceil(0.75 * totalPlanned - attended));
  const maxPossible = Number((((attended + remaining) / totalPlanned) * 100).toFixed(2));
  
  res.json({
    success: true,
    studentId: student.student_id,
    name: student.name,
    semester: student.semester,
    currentAttendancePercent: rate,
    classesHeld: held,
    classesAttended: attended,
    classesRemaining: remaining,
    minClassesNeededFor75: minNeeded,
    maxPossibleAttendance: maxPossible,
    riskLevel: rate >= 85 ? 'Low / Safe' : rate >= 75 ? 'Moderate / Watch' : maxPossible >= 75 ? 'High / Shortage Recoverable' : 'Critical / Unrecoverable',
    statusColor: rate >= 85 ? 'emerald' : rate >= 75 ? 'amber' : maxPossible >= 75 ? 'orange' : 'rose',
    canReachCutoff: maxPossible >= 75,
    source: 'fallback-js'
  });
});

apiRouter.get('/analytics/risk-matrix', async (req: Request, res: Response) => {
  try {
    const pRes = await fetch(`${PYTHON_AI_URL}/analytics/risk-matrix`, { signal: AbortSignal.timeout(3000) });
    if (pRes.ok) {
      const data = await pRes.json();
      return res.json(data);
    }
  } catch {}

  // Fallback
  const stRes = dbManager.query('SELECT id, student_id, name, semester, attendance_rate, cgpa, assigned_faculty FROM students');
  const riskMatrix = stRes.rows.map(s => {
    const att = Number(s.attendance_rate || 0);
    const cgpa = Number(s.cgpa || 0);
    const score = Number((att < 75 ? (75 - att) * 1.5 : 0) + (cgpa < 7 ? (7 - cgpa) * 5 : 0)).toFixed(1);
    return {
      id: s.id,
      studentId: s.student_id,
      name: s.name,
      semester: s.semester,
      assignedFaculty: s.assigned_faculty,
      attendanceRate: att,
      cgpa: cgpa,
      avgInternalMarks: 22,
      riskScore: Number(score),
      riskTier: Number(score) >= 30 ? 'Academic Concern' : 'Normal Progress'
    };
  }).sort((a, b) => b.riskScore - a.riskScore);

  res.json({
    success: true,
    totalEvaluated: riskMatrix.length,
    highRiskCount: riskMatrix.filter(r => r.riskScore >= 30).length,
    riskMatrix,
    source: 'fallback-js'
  });
});

apiRouter.get('/analytics/cohort-stats', async (req: Request, res: Response) => {
  try {
    const pRes = await fetch(`${PYTHON_AI_URL}/analytics/cohort-stats`, { signal: AbortSignal.timeout(3000) });
    if (pRes.ok) {
      const data = await pRes.json();
      return res.json(data);
    }
  } catch {}

  res.json({
    success: true,
    generatedAt: new Date().toISOString(),
    cohortStats: {},
    source: 'fallback-js'
  });
});

apiRouter.post('/analytics/ai-mentoring-prompt', async (req: Request, res: Response) => {
  try {
    const pRes = await fetch(`${PYTHON_AI_URL}/analytics/ai-mentoring-prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      signal: AbortSignal.timeout(3000)
    });
    if (pRes.ok) {
      const data = await pRes.json();
      return res.json(data);
    }
  } catch {}

  const name = req.body?.name || 'Student';
  const att = Number(req.body?.attendanceRate || 75);
  res.json({
    success: true,
    studentName: name,
    primaryConcern: att < 75 ? 'Attendance Shortage Risk' : 'Regular Progress',
    suggestedAction: att < 75 ? 'Conduct 1-on-1 mentoring review and advise student of 75% cutoff rule.' : 'Review ongoing semester coursework.',
    recommendedSmsDraft: `BCAFly Alert: Dear Parent, attendance for ${name} is ${att}%. Please ensure regular class attendance.`,
    source: 'fallback-js'
  });
});

