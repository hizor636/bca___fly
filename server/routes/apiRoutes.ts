import { Router, Request, Response } from 'express';
import { dbManager } from '../store.js';

export const apiRouter = Router();

// Helper to record audit logs
async function logAudit(
  actorUserId = 'admin-root',
  actorName = 'Institutional Admin',
  actorRole = 'admin',
  action = 'ADMIN_ACTION',
  entityType = 'system',
  entityId = 'entity-1',
  beforeJson: string | null = null,
  afterJson: string | null = null,
  ip = '127.0.0.1'
) {
  try {
    const id = `aud-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    await dbManager.run(
      `INSERT INTO audit_logs (id, actor_user_id, actor_name, actor_role, action, entity_type, entity_id, before_json, after_json, ip, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, actorUserId, actorName, actorRole, action, entityType, entityId, beforeJson, afterJson, ip, new Date().toISOString()]
    );
  } catch (e) {
    console.error('Failed to write audit log:', e);
  }
}

// --- Health Check ---
apiRouter.get('/health', async (req: Request, res: Response) => {
  try {
    const stats = await dbManager.getStats();
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
apiRouter.post('/auth/login', async (req: Request, res: Response) => {
  const { email, username, identifier: rawId, password, roleHint } = req.body;
  const loginIdentifier = ((rawId || username || email || '') as string).trim().toLowerCase();

  try {
    let sql = 'SELECT * FROM users WHERE (LOWER(email) = LOWER(?) OR LOWER(username) = LOWER(?)) AND is_active = 1';
    let params: any[] = [loginIdentifier, loginIdentifier];
    if (roleHint) {
      sql += ' AND role = ?';
      params.push(roleHint);
    }
    const userRes = await dbManager.query(sql, params);
    if (userRes.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid username/email or inactive account' });
    }

    const user = userRes.rows[0];

    // Verify password if user has password set in database
    if (user.password && password && user.password !== password) {
      return res.status(401).json({ success: false, error: 'Invalid password. Please check your credentials.' });
    }

    await logAudit(user.id, user.name, user.role, 'LOGIN_SUCCESS', 'auth', user.id);

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

// =========================================================================
// 🏛️ 1. INSTITUTIONAL MASTER DATA: DEPARTMENTS (Step 1)
// =========================================================================

const getDepartmentsHandler = async (req: Request, res: Response) => {
  try {
    const resDepts = await dbManager.query('SELECT * FROM departments ORDER BY name ASC');
    const departments = resDepts.rows.map(d => ({
      id: d.id,
      name: d.name,
      code: d.code,
      deptHeadId: d.dept_head_id,
      isActive: Boolean(d.is_active ?? 1),
      archivedAt: d.archived_at,
      createdAt: d.created_at
    }));
    res.json({ success: true, data: departments });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const createDepartmentHandler = async (req: Request, res: Response) => {
  const { name, code, deptHeadId } = req.body;
  if (!name || !code) {
    return res.status(400).json({ success: false, error: 'Department name and code are required' });
  }
  try {
    const id = req.body.id || `dept-${code.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    const now = new Date().toISOString();

    const existing = await dbManager.query('SELECT id FROM departments WHERE LOWER(code) = LOWER(?)', [code.trim()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, error: `Department code ${code} already exists.` });
    }

    await dbManager.run(
      'INSERT INTO departments (id, name, code, dept_head_id, is_active, created_at) VALUES (?, ?, ?, ?, 1, ?)',
      [id, name.trim(), code.trim().toUpperCase(), deptHeadId || null, now]
    );

    await logAudit('admin-root', 'Institutional Admin', 'admin', 'admin.department.created', 'department', id, null, JSON.stringify({ name, code }));
    dbManager.persist();
    res.status(201).json({ success: true, message: 'Department created successfully', id });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const updateDepartmentHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, code, deptHeadId, isActive } = req.body;
  try {
    const existing = await dbManager.query('SELECT * FROM departments WHERE id = ?', [id]);
    if (existing.rows.length === 0) return res.status(404).json({ success: false, error: 'Department not found' });

    await dbManager.run(
      `UPDATE departments
       SET name = coalesce(?, name),
           code = coalesce(?, code),
           dept_head_id = coalesce(?, dept_head_id),
           is_active = coalesce(?, is_active)
       WHERE id = ?`,
      [name ? name.trim() : null, code ? code.trim().toUpperCase() : null, deptHeadId || null, isActive !== undefined ? (isActive ? 1 : 0) : null, id]
    );

    await logAudit('admin-root', 'Institutional Admin', 'admin', 'admin.department.updated', 'department', id, JSON.stringify(existing.rows[0]), JSON.stringify(req.body));
    dbManager.persist();
    res.json({ success: true, message: 'Department updated successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const deleteDepartmentHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const courses = await dbManager.query('SELECT id FROM courses WHERE department_id = ?', [id]);
    if (courses.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'Cannot delete department with active courses. Archive it instead.' });
    }
    await dbManager.run('DELETE FROM departments WHERE id = ?', [id]);
    await logAudit('admin-root', 'Institutional Admin', 'admin', 'admin.department.deleted', 'department', id);
    dbManager.persist();
    res.json({ success: true, message: 'Department permanently deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

apiRouter.get('/departments', getDepartmentsHandler);
apiRouter.get('/admin/departments', getDepartmentsHandler);
apiRouter.post('/departments', createDepartmentHandler);
apiRouter.post('/admin/departments', createDepartmentHandler);
apiRouter.patch('/departments/:id', updateDepartmentHandler);
apiRouter.patch('/admin/departments/:id', updateDepartmentHandler);
apiRouter.delete('/departments/:id', deleteDepartmentHandler);
apiRouter.delete('/admin/departments/:id', deleteDepartmentHandler);

apiRouter.post('/admin/departments/:id/archive', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const now = new Date().toISOString();
    await dbManager.run('UPDATE departments SET is_active = 0, archived_at = ?, archived_by = ? WHERE id = ?', [now, 'admin-root', id]);
    await logAudit('admin-root', 'Institutional Admin', 'admin', 'admin.department.archived', 'department', id);
    dbManager.persist();
    res.json({ success: true, message: 'Department archived' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =========================================================================
// 📅 2. ACADEMIC YEARS & CALENDAR RULES (Step 2)
// =========================================================================

const getAcademicYearsHandler = async (req: Request, res: Response) => {
  try {
    const resYears = await dbManager.query('SELECT * FROM academic_years ORDER BY start_date DESC');
    const years = resYears.rows.map(y => ({
      id: y.id,
      name: y.name,
      startDate: y.start_date,
      endDate: y.end_date,
      attendanceRule: y.attendance_rule,
      isActive: Boolean(y.is_active),
      archivedAt: y.archived_at,
      createdAt: y.created_at
    }));
    res.json({ success: true, data: years });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const createAcademicYearHandler = async (req: Request, res: Response) => {
  const { name, startDate, endDate, attendanceRule = 75.0, isActive = true } = req.body;
  if (!name || !startDate || !endDate) {
    return res.status(400).json({ success: false, error: 'Academic year name, start date, and end date are required' });
  }
  try {
    const id = req.body.id || `ay-${name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;
    const now = new Date().toISOString();

    if (isActive) {
      await dbManager.run('UPDATE academic_years SET is_active = 0');
    }

    await dbManager.run(
      `INSERT INTO academic_years (id, name, start_date, end_date, attendance_rule, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, name.trim(), startDate, endDate, Number(attendanceRule), isActive ? 1 : 0, now]
    );

    await logAudit('admin-root', 'Institutional Admin', 'admin', 'admin.academic_year.created', 'academic_year', id, null, JSON.stringify(req.body));
    dbManager.persist();
    res.status(201).json({ success: true, message: 'Academic year created successfully', id });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

apiRouter.get('/academic-years', getAcademicYearsHandler);
apiRouter.get('/admin/academic-years', getAcademicYearsHandler);
apiRouter.post('/academic-years', createAcademicYearHandler);
apiRouter.post('/admin/academic-years', createAcademicYearHandler);

apiRouter.patch('/admin/academic-years/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, startDate, endDate, attendanceRule, isActive } = req.body;
  try {
    const existing = await dbManager.query('SELECT * FROM academic_years WHERE id = ?', [id]);
    if (existing.rows.length === 0) return res.status(404).json({ success: false, error: 'Academic year not found' });

    if (isActive) {
      await dbManager.run('UPDATE academic_years SET is_active = 0 WHERE id != ?', [id]);
    }

    await dbManager.run(
      `UPDATE academic_years
       SET name = coalesce(?, name),
           start_date = coalesce(?, start_date),
           end_date = coalesce(?, end_date),
           attendance_rule = coalesce(?, attendance_rule),
           is_active = coalesce(?, is_active)
       WHERE id = ?`,
      [name ? name.trim() : null, startDate || null, endDate || null, attendanceRule !== undefined ? Number(attendanceRule) : null, isActive !== undefined ? (isActive ? 1 : 0) : null, id]
    );

    await logAudit('admin-root', 'Institutional Admin', 'admin', 'admin.academic_year.updated', 'academic_year', id, JSON.stringify(existing.rows[0]), JSON.stringify(req.body));
    dbManager.persist();
    res.json({ success: true, message: 'Academic year updated' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/admin/academic-years/:id/archive', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const now = new Date().toISOString();
    await dbManager.run('UPDATE academic_years SET is_active = 0, archived_at = ?, archived_by = ? WHERE id = ?', [now, 'admin-root', id]);
    await logAudit('admin-root', 'Institutional Admin', 'admin', 'admin.academic_year.archived', 'academic_year', id);
    dbManager.persist();
    res.json({ success: true, message: 'Academic year archived' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/admin/academic-years/:id/activate', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await dbManager.run('UPDATE academic_years SET is_active = 0');
    await dbManager.run('UPDATE academic_years SET is_active = 1 WHERE id = ?', [id]);
    await logAudit('admin-root', 'Institutional Admin', 'admin', 'admin.academic_year.activated', 'academic_year', id);
    dbManager.persist();
    res.json({ success: true, message: 'Academic year set to active' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =========================================================================
// 📚 3. SEMESTERS FRAMEWORK: Sem 1 to Sem 6 (Step 3)
// =========================================================================

const getSemestersHandler = async (req: Request, res: Response) => {
  try {
    const resSems = await dbManager.query('SELECT * FROM semesters ORDER BY number ASC');
    const semesters = resSems.rows.map(s => ({
      id: s.id,
      number: s.number,
      name: s.name,
      year: s.year,
      typicalStatus: s.typical_status,
      startDate: s.start_date,
      endDate: s.end_date,
      credits: s.credits ?? 24,
      minAttendance: s.min_attendance ?? 75.0,
      isCurrent: Boolean(s.is_current),
      totalEnrolled: s.total_enrolled,
      isActive: Boolean(s.is_active ?? 1)
    }));
    res.json({ success: true, data: semesters });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const createSemesterHandler = async (req: Request, res: Response) => {
  const { number, name, year, startDate, endDate, credits = 24, minAttendance = 75.0, isCurrent = false } = req.body;
  if (!number || !name) {
    return res.status(400).json({ success: false, error: 'Semester number and name are required' });
  }
  try {
    const id = req.body.id || `sem-${number}`;
    if (isCurrent) {
      await dbManager.run('UPDATE semesters SET is_current = 0');
    }
    await dbManager.run(
      `INSERT OR REPLACE INTO semesters (id, number, name, year, typical_status, start_date, end_date, credits, min_attendance, is_current, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [id, Number(number), name.trim(), Number(year || Math.ceil(number / 2)), 'Active', startDate || '2026-06-01', endDate || '2026-11-30', Number(credits), Number(minAttendance), isCurrent ? 1 : 0]
    );

    await logAudit('admin-root', 'Institutional Admin', 'admin', 'admin.semester.configured', 'semester', id, null, JSON.stringify(req.body));
    dbManager.persist();
    res.status(201).json({ success: true, message: 'Semester configured successfully', id });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const updateSemesterHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, credits, minAttendance, startDate, endDate, isCurrent } = req.body;
  try {
    if (isCurrent) {
      await dbManager.run('UPDATE semesters SET is_current = 0');
    }
    await dbManager.run(
      `UPDATE semesters
       SET name = coalesce(?, name),
           credits = coalesce(?, credits),
           min_attendance = coalesce(?, min_attendance),
           start_date = coalesce(?, start_date),
           end_date = coalesce(?, end_date),
           is_current = coalesce(?, is_current)
       WHERE id = ?`,
      [name || null, credits !== undefined ? Number(credits) : null, minAttendance !== undefined ? Number(minAttendance) : null, startDate || null, endDate || null, isCurrent !== undefined ? (isCurrent ? 1 : 0) : null, id]
    );

    await logAudit('admin-root', 'Institutional Admin', 'admin', 'admin.semester.updated', 'semester', id);
    dbManager.persist();
    res.json({ success: true, message: 'Semester updated' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

apiRouter.get('/semesters', getSemestersHandler);
apiRouter.get('/admin/semesters', getSemestersHandler);
apiRouter.post('/semesters', createSemesterHandler);
apiRouter.post('/admin/semesters', createSemesterHandler);
apiRouter.patch('/semesters/:id', updateSemesterHandler);
apiRouter.patch('/admin/semesters/:id', updateSemesterHandler);

// =========================================================================
// 👥 4. BATCHES MANAGEMENT
// =========================================================================

const getBatchesHandler = async (req: Request, res: Response) => {
  try {
    const resBatches = await dbManager.query('SELECT * FROM batches ORDER BY start_year DESC, section ASC');
    const batches = resBatches.rows.map(b => ({
      id: b.id,
      name: b.name,
      departmentId: b.department_id,
      academicYear: b.academic_year,
      section: b.section,
      shift: b.shift,
      startYear: b.start_year,
      endYear: b.end_year,
      isActive: Boolean(b.is_active),
      archivedAt: b.archived_at
    }));
    res.json({ success: true, data: batches });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const createBatchHandler = async (req: Request, res: Response) => {
  const { name, departmentId = 'BCA', academicYear = '2026-2027', section = 'A', shift = 'Day', startYear = 2026, endYear = 2029 } = req.body;
  if (!name) return res.status(400).json({ success: false, error: 'Batch name is required' });
  try {
    const id = req.body.id || `batch-${Date.now()}`;
    await dbManager.run(
      `INSERT INTO batches (id, name, department_id, academic_year, section, shift, start_year, end_year, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [id, name.trim(), departmentId, academicYear, section, shift, Number(startYear), Number(endYear)]
    );

    await logAudit('admin-root', 'Institutional Admin', 'admin', 'admin.batch.created', 'batch', id, null, JSON.stringify(req.body));
    dbManager.persist();
    res.status(201).json({ success: true, message: 'Batch created', id });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

apiRouter.get('/batches', getBatchesHandler);
apiRouter.get('/admin/batches', getBatchesHandler);
apiRouter.post('/batches', createBatchHandler);
apiRouter.post('/admin/batches', createBatchHandler);

apiRouter.patch('/admin/batches/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, section, shift, isActive } = req.body;
  try {
    await dbManager.run(
      `UPDATE batches
       SET name = coalesce(?, name),
           section = coalesce(?, section),
           shift = coalesce(?, shift),
           is_active = coalesce(?, is_active)
       WHERE id = ?`,
      [name || null, section || null, shift || null, isActive !== undefined ? (isActive ? 1 : 0) : null, id]
    );
    await logAudit('admin-root', 'Institutional Admin', 'admin', 'admin.batch.updated', 'batch', id);
    dbManager.persist();
    res.json({ success: true, message: 'Batch updated' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/admin/batches/:id/archive', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const now = new Date().toISOString();
    await dbManager.run('UPDATE batches SET is_active = 0, archived_at = ?, archived_by = ? WHERE id = ?', [now, 'admin-root', id]);
    await logAudit('admin-root', 'Institutional Admin', 'admin', 'admin.batch.archived', 'batch', id);
    dbManager.persist();
    res.json({ success: true, message: 'Batch archived' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =========================================================================
// 📖 5. COURSE MASTER DATA (Step 4)
// =========================================================================

const getCoursesHandler = async (req: Request, res: Response) => {
  const semester = req.query.semester ? parseInt(req.query.semester as string, 10) : null;
  const includeArchived = req.query.includeArchived === 'true';
  try {
    let sql = 'SELECT * FROM courses WHERE 1=1';
    const params: any[] = [];
    if (!includeArchived) {
      sql += ' AND is_active = 1';
    }
    if (semester) {
      sql += ' AND semester = ?';
      params.push(semester);
    }
    sql += ' ORDER BY semester ASC, course_code ASC';

    const coursesRes = await dbManager.query(sql, params);
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
      archivedAt: c.archived_at,
      createdAt: c.created_at,
      updatedAt: c.updated_at
    }));

    res.json({ success: true, data: courses });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const createCourseHandler = async (req: Request, res: Response) => {
  const c = req.body;
  if (!c.courseCode || !c.courseName || !c.semester) {
    return res.status(400).json({ success: false, error: 'Course code, name, and semester are required' });
  }
  try {
    const id = c.id || `c-${c.courseCode.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    const now = new Date().toISOString();

    const existing = await dbManager.query('SELECT id FROM courses WHERE LOWER(course_code) = LOWER(?)', [c.courseCode.trim()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, error: `Course with code ${c.courseCode} already exists.` });
    }

    await dbManager.run(
      `INSERT INTO courses (
        id, course_code, course_name, short_name, semester, department_id, academic_scheme,
        credits, course_type, max_marks, cia1_max_marks, cia2_max_marks, cia3_max_marks,
        attendance_required, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      [
        id, c.courseCode.trim().toUpperCase(), c.courseName.trim(), c.shortName || '', Number(c.semester),
        c.departmentId || 'BCA', c.academicScheme || 'BCA-2024-REG', Number(c.credits || 4),
        c.courseType || 'Theory', Number(c.maxMarks || 100), Number(c.cia1MaxMarks || 20),
        Number(c.cia2MaxMarks || 20), Number(c.cia3MaxMarks || 20), Number(c.attendanceRequired || 75.0),
        now, now
      ]
    );

    await logAudit('admin-root', 'Institutional Admin', 'admin', 'admin.course.created', 'course', id, null, JSON.stringify(c));
    dbManager.persist();
    res.status(201).json({ success: true, id, message: 'Course created successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const updateCourseHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  const c = req.body;
  try {
    const existing = await dbManager.query('SELECT * FROM courses WHERE id = ?', [id]);
    if (existing.rows.length === 0) return res.status(404).json({ success: false, error: 'Course not found' });
    const now = new Date().toISOString();

    await dbManager.run(
      `UPDATE courses
       SET course_code = coalesce(?, course_code),
           course_name = coalesce(?, course_name),
           short_name = coalesce(?, short_name),
           semester = coalesce(?, semester),
           credits = coalesce(?, credits),
           course_type = coalesce(?, course_type),
           max_marks = coalesce(?, max_marks),
           cia1_max_marks = coalesce(?, cia1_max_marks),
           cia2_max_marks = coalesce(?, cia2_max_marks),
           cia3_max_marks = coalesce(?, cia3_max_marks),
           attendance_required = coalesce(?, attendance_required),
           is_active = coalesce(?, is_active),
           updated_at = ?
       WHERE id = ?`,
      [
        c.courseCode ? c.courseCode.trim().toUpperCase() : null,
        c.courseName ? c.courseName.trim() : null,
        c.shortName !== undefined ? c.shortName : null,
        c.semester ? Number(c.semester) : null,
        c.credits ? Number(c.credits) : null,
        c.courseType || null,
        c.maxMarks ? Number(c.maxMarks) : null,
        c.cia1MaxMarks ? Number(c.cia1MaxMarks) : null,
        c.cia2MaxMarks ? Number(c.cia2MaxMarks) : null,
        c.cia3MaxMarks ? Number(c.cia3MaxMarks) : null,
        c.attendanceRequired ? Number(c.attendanceRequired) : null,
        c.isActive !== undefined ? (c.isActive ? 1 : 0) : null,
        now,
        id
      ]
    );

    await logAudit('admin-root', 'Institutional Admin', 'admin', 'admin.course.updated', 'course', id, JSON.stringify(existing.rows[0]), JSON.stringify(c));
    dbManager.persist();
    res.json({ success: true, message: 'Course updated successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const deleteCourseHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const attRes = await dbManager.query('SELECT COUNT(*) as count FROM course_attendance_records WHERE course_id = ?', [id]);
    const marksRes = await dbManager.query('SELECT COUNT(*) as count FROM course_marks WHERE course_id = ?', [id]);
    const enrRes = await dbManager.query('SELECT COUNT(*) as count FROM student_course_enrollments WHERE course_id = ?', [id]);

    if ((attRes.rows[0]?.count || 0) > 0 || (marksRes.rows[0]?.count || 0) > 0 || (enrRes.rows[0]?.count || 0) > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot permanently delete course with active attendance records, marks, or enrollments. Use Archive instead to preserve academic history.'
      });
    }

    await dbManager.run('DELETE FROM courses WHERE id = ?', [id]);
    await logAudit('admin-root', 'Institutional Admin', 'admin', 'admin.course.deleted', 'course', id);
    dbManager.persist();
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

apiRouter.get('/courses', getCoursesHandler);
apiRouter.get('/admin/courses', getCoursesHandler);
apiRouter.post('/courses', createCourseHandler);
apiRouter.post('/admin/courses', createCourseHandler);
apiRouter.put('/courses/:id', updateCourseHandler);
apiRouter.patch('/admin/courses/:id', updateCourseHandler);
apiRouter.delete('/courses/:id', deleteCourseHandler);
apiRouter.delete('/admin/courses/:id', deleteCourseHandler);

apiRouter.post('/admin/courses/:id/archive', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const now = new Date().toISOString();
    await dbManager.run('UPDATE courses SET is_active = 0, archived_at = ?, archived_by = ? WHERE id = ?', [now, 'admin-root', id]);
    await logAudit('admin-root', 'Institutional Admin', 'admin', 'admin.course.archived', 'course', id);
    dbManager.persist();
    res.json({ success: true, message: 'Course archived successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =========================================================================
// 👨‍🏫 6. FACULTY ACCOUNTS & PROFILES (Step 5)
// =========================================================================

const getFacultyHandler = async (req: Request, res: Response) => {
  try {
    const resFac = await dbManager.query('SELECT * FROM faculty WHERE is_active = 1 ORDER BY name ASC');
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
      courses: f.courses ? JSON.parse(f.courses) : [],
      isActive: Boolean(f.is_active ?? 1)
    }));
    res.json({ success: true, data: faculty });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const createFacultyHandler = async (req: Request, res: Response) => {
  const { name, designation, department, email, phone, office, specialization, courses = [] } = req.body;
  if (!name || !email) {
    return res.status(400).json({ success: false, error: 'Name and email are required' });
  }
  try {
    const facId = req.body.id || `fac-${Date.now()}`;
    const cleanEmail = email.trim().toLowerCase();

    const existing = await dbManager.query('SELECT id FROM faculty WHERE LOWER(email) = LOWER(?)', [cleanEmail]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, error: `Faculty account with email ${email} already exists.` });
    }

    await dbManager.run(
      `INSERT INTO faculty (id, name, designation, department, email, phone, office, assigned_students_count, specialization, courses, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        facId,
        name.trim(),
        designation || 'Assistant Professor',
        department || 'Computer Applications',
        cleanEmail,
        phone || '+91 98765 00000',
        office || 'Lab Block 2, Room 304',
        0,
        specialization || 'Computer Applications',
        JSON.stringify(courses)
      ]
    );

    const existingUser = await dbManager.query('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [cleanEmail]);
    if (existingUser.rows.length === 0) {
      await dbManager.run(
        `INSERT INTO users (id, name, email, role, phone, department_id, designation, is_active, created_at, avatar_bg, avatar_text)
         VALUES (?, ?, ?, 'faculty', ?, ?, ?, 1, ?, 'bg-indigo-100', 'text-indigo-700')`,
        [facId, name.trim(), cleanEmail, phone || '', department || 'BCA', designation || 'Assistant Professor', new Date().toISOString()]
      );
    }

    await logAudit('admin-root', 'Institutional Admin', 'admin', 'admin.faculty.created', 'faculty', facId, null, JSON.stringify(req.body));
    dbManager.persist();
    res.status(201).json({ success: true, message: 'Faculty created successfully', id: facId });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const updateFacultyHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, designation, department, email, phone, office, specialization, courses, isActive } = req.body;
  try {
    const existing = await dbManager.query('SELECT * FROM faculty WHERE id = ?', [id]);
    if (existing.rows.length === 0) return res.status(404).json({ success: false, error: 'Faculty not found' });
    const current = existing.rows[0];

    await dbManager.run(
      `UPDATE faculty
       SET name = coalesce(?, name),
           designation = coalesce(?, designation),
           department = coalesce(?, department),
           email = coalesce(?, email),
           phone = coalesce(?, phone),
           office = coalesce(?, office),
           specialization = coalesce(?, specialization),
           courses = coalesce(?, courses),
           is_active = coalesce(?, is_active)
       WHERE id = ?`,
      [
        name ? name.trim() : null,
        designation || null,
        department || null,
        email ? email.trim().toLowerCase() : null,
        phone || null,
        office || null,
        specialization || null,
        courses ? JSON.stringify(courses) : null,
        isActive !== undefined ? (isActive ? 1 : 0) : null,
        id
      ]
    );

    await dbManager.run(
      `UPDATE users
       SET name = coalesce(?, name),
           email = coalesce(?, email),
           phone = coalesce(?, phone),
           designation = coalesce(?, designation),
           is_active = coalesce(?, is_active)
       WHERE id = ? OR email = ?`,
      [name || null, email ? email.trim().toLowerCase() : null, phone || null, designation || null, isActive !== undefined ? (isActive ? 1 : 0) : null, id, current.email]
    );

    await logAudit('admin-root', 'Institutional Admin', 'admin', 'admin.faculty.updated', 'faculty', id, JSON.stringify(current), JSON.stringify(req.body));
    dbManager.persist();
    res.json({ success: true, message: 'Faculty updated successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const deleteFacultyHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const assignments = await dbManager.query('SELECT id FROM faculty_course_assignments WHERE faculty_id = ?', [id]);
    const mentees = await dbManager.query('SELECT id FROM students WHERE assigned_faculty_id = ?', [id]);

    if (assignments.rows.length > 0 || mentees.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot permanently delete faculty with assigned courses or mentees. Reassign their duties first or Archive the account.'
      });
    }

    await dbManager.run('DELETE FROM faculty WHERE id = ?', [id]);
    await dbManager.run('DELETE FROM users WHERE id = ?', [id]);
    await logAudit('admin-root', 'Institutional Admin', 'admin', 'admin.faculty.deleted', 'faculty', id);
    dbManager.persist();
    res.json({ success: true, message: 'Faculty removed successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

apiRouter.get('/faculty', getFacultyHandler);
apiRouter.get('/admin/faculty', getFacultyHandler);
apiRouter.post('/faculty', createFacultyHandler);
apiRouter.post('/admin/faculty', createFacultyHandler);
apiRouter.put('/faculty/:id', updateFacultyHandler);
apiRouter.patch('/admin/faculty/:id', updateFacultyHandler);
apiRouter.delete('/faculty/:id', deleteFacultyHandler);
apiRouter.delete('/admin/faculty/:id', deleteFacultyHandler);

apiRouter.post('/admin/faculty/:id/archive', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const now = new Date().toISOString();
    await dbManager.run('UPDATE faculty SET is_active = 0, archived_at = ?, archived_by = ? WHERE id = ?', [now, 'admin-root', id]);
    await dbManager.run('UPDATE users SET is_active = 0 WHERE id = ?', [id]);
    await logAudit('admin-root', 'Institutional Admin', 'admin', 'admin.faculty.archived', 'faculty', id);
    dbManager.persist();
    res.json({ success: true, message: 'Faculty archived successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// CSV Batch Import for Faculty
apiRouter.post('/admin/faculty/import', async (req: Request, res: Response) => {
  const { facultyList } = req.body;
  if (!Array.isArray(facultyList) || facultyList.length === 0) {
    return res.status(400).json({ success: false, error: 'Provide a non-empty array of faculty records.' });
  }

  const errors: string[] = [];
  let importedCount = 0;

  try {
    for (let i = 0; i < facultyList.length; i++) {
      const f = facultyList[i];
      if (!f.name || !f.email) {
        errors.push(`Row ${i + 1}: Missing name or official email.`);
        continue;
      }
      const cleanEmail = f.email.trim().toLowerCase();
      const existing = await dbManager.query('SELECT id FROM faculty WHERE LOWER(email) = LOWER(?)', [cleanEmail]);
      if (existing.rows.length > 0) {
        errors.push(`Row ${i + 1}: Email ${f.email} already exists.`);
        continue;
      }

      const id = f.id || `fac-${Date.now()}-${i}`;
      await dbManager.run(
        `INSERT INTO faculty (id, name, designation, department, email, phone, office, specialization, courses, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          id, f.name.trim(), f.designation || 'Assistant Professor', f.department || 'BCA',
          cleanEmail, f.phone || '', f.office || 'Lab Block 2', f.specialization || 'Computer Applications',
          JSON.stringify(f.courses || [])
        ]
      );

      await dbManager.run(
        `INSERT OR IGNORE INTO users (id, name, email, role, phone, department_id, designation, is_active, created_at, avatar_bg, avatar_text)
         VALUES (?, ?, ?, 'faculty', ?, ?, ?, 1, ?, 'bg-indigo-100', 'text-indigo-700')`,
        [id, f.name.trim(), cleanEmail, f.phone || '', f.department || 'BCA', f.designation || 'Assistant Professor', new Date().toISOString()]
      );

      importedCount++;
    }

    await logAudit('admin-root', 'Institutional Admin', 'admin', 'admin.faculty.import', 'faculty', 'bulk-import', null, JSON.stringify({ importedCount, errorCount: errors.length }));
    dbManager.persist();
    res.json({ success: true, importedCount, errorCount: errors.length, errors, message: `Successfully imported ${importedCount} faculty accounts.` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =========================================================================
// 🎓 7. STUDENT ACCOUNTS & PROFILES (Step 6)
// =========================================================================

const getStudentsHandler = async (req: Request, res: Response) => {
  const semester = req.query.semester ? parseInt(req.query.semester as string, 10) : null;
  const facultyId = req.query.facultyId as string;
  const includeArchived = req.query.includeArchived === 'true';

  try {
    let sql = 'SELECT * FROM students WHERE 1=1';
    const params: any[] = [];

    if (!includeArchived) {
      sql += ' AND is_active = 1';
    }
    if (semester) {
      sql += ' AND semester = ?';
      params.push(semester);
    }
    if (facultyId) {
      sql += ' AND assigned_faculty_id = ?';
      params.push(facultyId);
    }
    sql += ' ORDER BY name ASC';

    const stRes = await dbManager.query(sql, params);
    const students = await Promise.all(stRes.rows.map(async s => {
      const notesRes = await dbManager.query('SELECT * FROM mentoring_notes WHERE student_id = ? ORDER BY date DESC', [s.id]);
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
        avatarBg: s.avatar_bg || 'bg-emerald-100',
        avatarText: s.avatar_text || 'text-emerald-700',
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
        condonationStatus: s.condonation_status,
        isActive: Boolean(s.is_active ?? 1),
        archivedAt: s.archived_at
      };
    }));

    res.json({ success: true, data: students });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const createStudentHandler = async (req: Request, res: Response) => {
  const {
    name,
    studentId,
    email,
    phone,
    parentPhone,
    semester = 1,
    section = 'A',
    course = 'Bachelor of Computer Applications',
    assignedFaculty = 'Not Assigned',
    assignedFacultyId = '',
    attendanceRate = 0,
    cgpa = 0.0
  } = req.body;

  if (!name || !email) {
    return res.status(400).json({ success: false, error: 'Name and email are required' });
  }

  try {
    const id = req.body.id || `stu-${Date.now()}`;
    const cleanEmail = email.trim().toLowerCase();
    const finalStudentId = (studentId || `BCA26${String(Math.floor(Math.random() * 900) + 100)}`).trim();

    const existing = await dbManager.query('SELECT id FROM students WHERE LOWER(email) = LOWER(?) OR student_id = ?', [cleanEmail, finalStudentId]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'Student with this email or University Roll Number already exists.' });
    }

    const initials = name.trim().split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() || 'ST';

    await dbManager.run(
      `INSERT INTO students (
        id, student_id, name, initials, avatar_bg, avatar_text, course, semester, section,
        email, phone, parent_phone, attendance_rate, mentoring_status, cgpa, sgpa_history,
        assigned_faculty, assigned_faculty_id, weekly_attendance, total_classes_held, total_classes_attended, is_active
      ) VALUES (?, ?, ?, ?, 'bg-emerald-100', 'text-emerald-700', ?, ?, ?, ?, ?, ?, ?, 'Regular', ?, ?, ?, ?, ?, 0, 0, 1)`,
      [
        id,
        finalStudentId,
        name.trim(),
        initials,
        course,
        Number(semester),
        section,
        cleanEmail,
        phone || '+91 98765 00000',
        parentPhone || '+91 98765 11111',
        Number(attendanceRate),
        Number(cgpa),
        JSON.stringify([Number(cgpa)]),
        assignedFaculty,
        assignedFacultyId,
        JSON.stringify([0, 0, 0, 0, 0, 0])
      ]
    );

    const existingUser = await dbManager.query('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [cleanEmail]);
    if (existingUser.rows.length === 0) {
      await dbManager.run(
        `INSERT INTO users (id, name, email, role, phone, department_id, student_id, semester, is_active, created_at, avatar_bg, avatar_text)
         VALUES (?, ?, ?, 'student', ?, 'BCA', ?, ?, 1, ?, 'bg-emerald-100', 'text-emerald-700')`,
        [id, name.trim(), cleanEmail, phone || '', finalStudentId, Number(semester), new Date().toISOString()]
      );
    }

    await logAudit('admin-root', 'Institutional Admin', 'admin', 'admin.student.created', 'student', id, null, JSON.stringify(req.body));
    dbManager.persist();
    res.status(201).json({ success: true, message: 'Student created successfully', id, studentId: finalStudentId });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const deleteStudentHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const attCount = await dbManager.query('SELECT COUNT(*) as count FROM course_attendance_records WHERE student_id = ?', [id]);
    const marksCount = await dbManager.query('SELECT COUNT(*) as count FROM course_marks WHERE student_id = ?', [id]);

    if ((attCount.rows[0]?.count || 0) > 0 || (marksCount.rows[0]?.count || 0) > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete student with historical attendance or assessment marks. Archive the profile instead.'
      });
    }

    const s = await dbManager.query('SELECT student_id, email FROM students WHERE id = ?', [id]);
    if (s.rows.length > 0) {
      const stu = s.rows[0];
      await dbManager.run('DELETE FROM students WHERE id = ?', [id]);
      await dbManager.run('DELETE FROM users WHERE id = ? OR student_id = ? OR email = ?', [id, stu.student_id, stu.email]);
    }

    await logAudit('admin-root', 'Institutional Admin', 'admin', 'admin.student.deleted', 'student', id);
    dbManager.persist();
    res.json({ success: true, message: 'Student removed successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

apiRouter.get('/students', getStudentsHandler);
apiRouter.get('/admin/students', getStudentsHandler);
apiRouter.post('/students', createStudentHandler);
apiRouter.post('/admin/students', createStudentHandler);
apiRouter.delete('/students/:id', deleteStudentHandler);
apiRouter.delete('/admin/students/:id', deleteStudentHandler);

apiRouter.patch('/admin/students/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, phone, parentPhone, semester, section, attendanceRate, cgpa, mentoringStatus, assignedFaculty, assignedFacultyId, isActive } = req.body;
  try {
    const existing = await dbManager.query('SELECT * FROM students WHERE id = ?', [id]);
    if (existing.rows.length === 0) return res.status(404).json({ success: false, error: 'Student not found' });
    const current = existing.rows[0];

    await dbManager.run(
      `UPDATE students
       SET name = coalesce(?, name),
           email = coalesce(?, email),
           phone = coalesce(?, phone),
           parent_phone = coalesce(?, parent_phone),
           semester = coalesce(?, semester),
           section = coalesce(?, section),
           attendance_rate = coalesce(?, attendance_rate),
           cgpa = coalesce(?, cgpa),
           mentoring_status = coalesce(?, mentoring_status),
           assigned_faculty = coalesce(?, assigned_faculty),
           assigned_faculty_id = coalesce(?, assigned_faculty_id),
           is_active = coalesce(?, is_active)
       WHERE id = ?`,
      [
        name ? name.trim() : null,
        email ? email.trim().toLowerCase() : null,
        phone || null,
        parentPhone || null,
        semester ? Number(semester) : null,
        section || null,
        attendanceRate !== undefined ? Number(attendanceRate) : null,
        cgpa !== undefined ? Number(cgpa) : null,
        mentoringStatus || null,
        assignedFaculty || null,
        assignedFacultyId || null,
        isActive !== undefined ? (isActive ? 1 : 0) : null,
        id
      ]
    );

    await dbManager.run(
      `UPDATE users
       SET name = coalesce(?, name),
           email = coalesce(?, email),
           phone = coalesce(?, phone),
           semester = coalesce(?, semester),
           is_active = coalesce(?, is_active)
       WHERE id = ? OR student_id = ? OR email = ?`,
      [name || null, email || null, phone || null, semester ? Number(semester) : null, isActive !== undefined ? (isActive ? 1 : 0) : null, id, current.student_id, current.email]
    );

    await logAudit('admin-root', 'Institutional Admin', 'admin', 'admin.student.updated', 'student', id, JSON.stringify(current), JSON.stringify(req.body));
    dbManager.persist();
    res.json({ success: true, message: 'Student updated successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/admin/students/:id/archive', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const now = new Date().toISOString();
    await dbManager.run('UPDATE students SET is_active = 0, archived_at = ?, archived_by = ? WHERE id = ?', [now, 'admin-root', id]);
    await dbManager.run('UPDATE users SET is_active = 0 WHERE id = ?', [id]);
    await logAudit('admin-root', 'Institutional Admin', 'admin', 'admin.student.archived', 'student', id);
    dbManager.persist();
    res.json({ success: true, message: 'Student account archived' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/admin/students/import', async (req: Request, res: Response) => {
  const { studentList } = req.body;
  if (!Array.isArray(studentList) || studentList.length === 0) {
    return res.status(400).json({ success: false, error: 'Provide a non-empty array of student records.' });
  }

  const errors: string[] = [];
  let importedCount = 0;

  try {
    for (let i = 0; i < studentList.length; i++) {
      const s = studentList[i];
      if (!s.name || !s.email || !s.studentId) {
        errors.push(`Row ${i + 1}: Name, official email, and university roll number are required.`);
        continue;
      }
      const cleanEmail = s.email.trim().toLowerCase();
      const cleanRoll = s.studentId.trim();

      const existing = await dbManager.query('SELECT id FROM students WHERE LOWER(email) = LOWER(?) OR student_id = ?', [cleanEmail, cleanRoll]);
      if (existing.rows.length > 0) {
        errors.push(`Row ${i + 1}: Student with email ${cleanEmail} or roll number ${cleanRoll} already exists.`);
        continue;
      }

      const id = s.id || `stu-${Date.now()}-${i}`;
      const initials = s.name.trim().split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() || 'ST';

      await dbManager.run(
        `INSERT INTO students (
          id, student_id, name, initials, avatar_bg, avatar_text, course, semester, section,
          email, phone, parent_phone, attendance_rate, mentoring_status, cgpa, sgpa_history,
          assigned_faculty, assigned_faculty_id, weekly_attendance, total_classes_held, total_classes_attended, is_active
        ) VALUES (?, ?, ?, ?, 'bg-emerald-100', 'text-emerald-700', ?, ?, ?, ?, ?, ?, ?, 'Regular', ?, ?, ?, ?, ?, 0, 0, 1)`,
        [
          id,
          cleanRoll,
          s.name.trim(),
          initials,
          s.course || 'Bachelor of Computer Applications',
          Number(s.semester || 1),
          s.section || 'A',
          cleanEmail,
          s.phone || '+91 98765 00000',
          s.parentPhone || '+91 98765 11111',
          Number(s.attendanceRate || 0),
          Number(s.cgpa || 0),
          JSON.stringify([Number(s.cgpa || 0)]),
          s.assignedFaculty || 'Not Assigned',
          s.assignedFacultyId || '',
          JSON.stringify([0, 0, 0, 0, 0, 0])
        ]
      );

      await dbManager.run(
        `INSERT OR IGNORE INTO users (id, name, email, role, phone, department_id, student_id, semester, is_active, created_at, avatar_bg, avatar_text)
         VALUES (?, ?, ?, 'student', ?, 'BCA', ?, ?, 1, ?, 'bg-emerald-100', 'text-emerald-700')`,
        [id, s.name.trim(), cleanEmail, s.phone || '', cleanRoll, Number(s.semester || 1), new Date().toISOString()]
      );

      importedCount++;
    }

    await logAudit('admin-root', 'Institutional Admin', 'admin', 'admin.student.import', 'student', 'bulk-import', null, JSON.stringify({ importedCount, errorCount: errors.length }));
    dbManager.persist();
    res.json({ success: true, importedCount, errorCount: errors.length, errors, message: `Successfully imported ${importedCount} student accounts.` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =========================================================================
// 📝 8. STUDENT COURSE ENROLLMENTS & PROGRESSION (Step 7)
// =========================================================================

const getEnrollmentsHandler = async (req: Request, res: Response) => {
  const courseId = req.query.courseId as string;
  const studentId = req.query.studentId as string;
  try {
    let sql = "SELECT * FROM student_course_enrollments WHERE enrollment_status = 'Enrolled'";
    const params: any[] = [];
    if (courseId) {
      sql += ' AND course_id = ?';
      params.push(courseId);
    }
    if (studentId) {
      sql += ' AND student_id = ?';
      params.push(studentId);
    }
    const resEnr = await dbManager.query(sql, params);
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
};

const createEnrollmentHandler = async (req: Request, res: Response) => {
  const { studentId, courseId, academicYear = '2026-27', section = 'A', enrollmentStatus = 'Enrolled' } = req.body;
  if (!studentId || !courseId) {
    return res.status(400).json({ success: false, error: 'studentId and courseId are required' });
  }
  try {
    const id = req.body.id || `enr-${studentId}-${courseId}`;
    await dbManager.run(
      `INSERT OR REPLACE INTO student_course_enrollments (id, student_id, course_id, academic_year, section, enrollment_status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, studentId, courseId, academicYear, section, enrollmentStatus]
    );

    await logAudit('admin-root', 'Institutional Admin', 'admin', 'admin.enrollment.created', 'enrollment', id, null, JSON.stringify(req.body));
    dbManager.persist();
    res.status(201).json({ success: true, message: 'Student enrolled in course successfully', id });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const deleteEnrollmentHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await dbManager.run('DELETE FROM student_course_enrollments WHERE id = ?', [id]);
    await logAudit('admin-root', 'Institutional Admin', 'admin', 'admin.enrollment.deleted', 'enrollment', id);
    dbManager.persist();
    res.json({ success: true, message: 'Enrollment removed' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

apiRouter.get('/courses/enrollments', getEnrollmentsHandler);
apiRouter.get('/admin/enrollments', getEnrollmentsHandler);
apiRouter.post('/courses/enrollments', createEnrollmentHandler);
apiRouter.post('/admin/enrollments', createEnrollmentHandler);
apiRouter.delete('/courses/enrollments/:id', deleteEnrollmentHandler);
apiRouter.delete('/admin/enrollments/:id', deleteEnrollmentHandler);

apiRouter.post('/admin/enrollments/batch', async (req: Request, res: Response) => {
  const { enrollments } = req.body;
  if (!Array.isArray(enrollments) || enrollments.length === 0) {
    return res.status(400).json({ success: false, error: 'Provide a non-empty array of enrollment records.' });
  }
  try {
    let count = 0;
    for (const enr of enrollments) {
      const id = enr.id || `enr-${enr.studentId}-${enr.courseId}`;
      await dbManager.run(
        `INSERT OR REPLACE INTO student_course_enrollments (id, student_id, course_id, academic_year, section, enrollment_status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, enr.studentId, enr.courseId, enr.academicYear || '2026-27', enr.section || 'A', enr.enrollmentStatus || 'Enrolled']
      );
      count++;
    }

    await logAudit('admin-root', 'Institutional Admin', 'admin', 'admin.enrollment.batch', 'enrollment', 'bulk', null, JSON.stringify({ count }));
    dbManager.persist();
    res.json({ success: true, count, message: `Successfully processed ${count} enrollments.` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =========================================================================
// 🎯 9. FACULTY ALLOCATIONS & MENTOR ASSIGNMENTS (Step 8)
// =========================================================================

const getAllocationsHandler = async (req: Request, res: Response) => {
  const facultyId = req.query.facultyId as string;
  try {
    let sql = 'SELECT * FROM faculty_course_assignments WHERE is_active = 1';
    const params: any[] = [];
    if (facultyId) {
      sql += ' AND faculty_id = ?';
      params.push(facultyId);
    }
    const resAlloc = await dbManager.query(sql, params);
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
};

const createAllocationHandler = async (req: Request, res: Response) => {
  const { facultyId, courseId, section = 'A', batch = '2026-27', academicYear = '2026-27', term = 'Odd' } = req.body;
  if (!facultyId || !courseId) {
    return res.status(400).json({ success: false, error: 'facultyId and courseId are required' });
  }
  try {
    const id = req.body.id || `fca-${facultyId}-${courseId}-${section}`;
    await dbManager.run(
      `INSERT OR REPLACE INTO faculty_course_assignments (id, faculty_id, course_id, section, batch, academic_year, term, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [id, facultyId, courseId, section, batch, academicYear, term]
    );

    await logAudit('admin-root', 'Institutional Admin', 'admin', 'admin.faculty_assignment.created', 'faculty_assignment', id, null, JSON.stringify(req.body));
    dbManager.persist();
    res.status(201).json({ success: true, message: 'Faculty allocated to course successfully', id });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const deleteAllocationHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await dbManager.run('DELETE FROM faculty_course_assignments WHERE id = ?', [id]);
    await logAudit('admin-root', 'Institutional Admin', 'admin', 'admin.faculty_assignment.deleted', 'faculty_assignment', id);
    dbManager.persist();
    res.json({ success: true, message: 'Teaching assignment removed' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

apiRouter.get('/courses/allocations', getAllocationsHandler);
apiRouter.get('/admin/faculty-assignments', getAllocationsHandler);
apiRouter.post('/courses/allocations', createAllocationHandler);
apiRouter.post('/admin/faculty-assignments', createAllocationHandler);
apiRouter.delete('/courses/allocations/:id', deleteAllocationHandler);
apiRouter.delete('/admin/faculty-assignments/:id', deleteAllocationHandler);

apiRouter.get('/admin/mentor-assignments', async (req: Request, res: Response) => {
  try {
    const resM = await dbManager.query(
      `SELECT s.id as student_id, s.student_id as roll_no, s.name as student_name, s.semester, s.section,
              s.assigned_faculty, s.assigned_faculty_id, f.email as faculty_email
       FROM students s
       LEFT JOIN faculty f ON f.id = s.assigned_faculty_id
       WHERE s.is_active = 1
       ORDER BY s.semester ASC, s.name ASC`
    );
    res.json({ success: true, data: resM.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const reassignMentorHandler = async (req: Request, res: Response) => {
  const studentId = req.params.id || req.body.studentId;
  const { newFacultyId, facultyId } = req.body;
  const targetFacultyId = newFacultyId || facultyId;

  if (!studentId || !targetFacultyId) {
    return res.status(400).json({ success: false, error: 'studentId and target facultyId are required' });
  }

  try {
    const facRes = await dbManager.query('SELECT * FROM faculty WHERE id = ?', [targetFacultyId]);
    if (facRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Faculty member not found' });
    }
    const faculty = facRes.rows[0];

    await dbManager.run(
      'UPDATE students SET assigned_faculty = ?, assigned_faculty_id = ? WHERE id = ?',
      [faculty.name, faculty.id, studentId]
    );

    const assignId = `asgn-${studentId}-${faculty.id}`;
    await dbManager.run(
      `INSERT OR REPLACE INTO student_assignments (id, student_id, faculty_id, semester_id, reason, start_date, is_active)
       VALUES (?, ?, ?, 'sem-current', 'mentor', ?, 1)`,
      [assignId, studentId, faculty.id, new Date().toISOString().split('T')[0]]
    );

    await logAudit('admin-root', 'Institutional Admin', 'admin', 'admin.mentor_assignment.updated', 'student', studentId, null, JSON.stringify({ assignedFaculty: faculty.name, assignedFacultyId: faculty.id }));
    dbManager.persist();
    res.json({ success: true, message: `Assigned mentor ${faculty.name} to student successfully` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

apiRouter.post('/students/:id/reassign', reassignMentorHandler);
apiRouter.put('/students/:id/reassign', reassignMentorHandler);
apiRouter.post('/admin/mentor-assignments', reassignMentorHandler);

// =========================================================================
// 🔒 SCOPED READ APIS (Role-Enforced)
// =========================================================================

// --- 1. FACULTY READ APIS ---
apiRouter.get('/faculty/dashboard', async (req: Request, res: Response) => {
  const facultyId = (req.query.facultyId as string) || 'fac-001';
  try {
    const facRes = await dbManager.query('SELECT * FROM faculty WHERE id = ?', [facultyId]);
    const fac = facRes.rows[0];

    const coursesRes = await dbManager.query(
      `SELECT fca.*, c.course_name, c.course_code, c.semester, c.credits, c.course_type
       FROM faculty_course_assignments fca
       JOIN courses c ON c.id = fca.course_id
       WHERE fca.faculty_id = ? AND fca.is_active = 1`,
      [facultyId]
    );

    const menteesRes = await dbManager.query('SELECT COUNT(*) as count, AVG(attendance_rate) as avg_att FROM students WHERE assigned_faculty_id = ? AND is_active = 1', [facultyId]);
    const menteesCount = menteesRes.rows[0]?.count || 0;
    const avgAttendance = Math.round(menteesRes.rows[0]?.avg_att || 0);

    res.json({
      success: true,
      data: {
        faculty: fac || null,
        assignedCoursesCount: coursesRes.rows.length,
        assignedCourses: coursesRes.rows,
        menteesCount,
        avgMenteesAttendance: avgAttendance
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/faculty/my-courses', async (req: Request, res: Response) => {
  const facultyId = (req.query.facultyId as string) || 'fac-001';
  try {
    const aRes = await dbManager.query(
      `SELECT c.*, fca.section, fca.batch, fca.academic_year
       FROM faculty_course_assignments fca
       JOIN courses c ON c.id = fca.course_id
       WHERE fca.faculty_id = ? AND fca.is_active = 1`,
      [facultyId]
    );
    res.json({ success: true, data: aRes.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/faculty/my-mentees', async (req: Request, res: Response) => {
  const facultyId = req.query.facultyId as string;
  try {
    let sql = 'SELECT * FROM students WHERE is_active = 1';
    const params: any[] = [];
    if (facultyId) {
      sql += ' AND assigned_faculty_id = ?';
      params.push(facultyId);
    }
    sql += ' ORDER BY name ASC';
    const stRes = await dbManager.query(sql, params);
    res.json({ success: true, data: stRes.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- 2. STUDENT READ APIS ---
apiRouter.get('/student/dashboard', async (req: Request, res: Response) => {
  const studentId = req.query.studentId as string;
  try {
    const sRes = await dbManager.query('SELECT * FROM students WHERE id = ? OR student_id = ?', [studentId, studentId]);
    if (sRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Student record not found' });
    }
    const student = sRes.rows[0];

    const enrCourses = await dbManager.query(
      `SELECT c.* FROM student_course_enrollments sce
       JOIN courses c ON c.id = sce.course_id
       WHERE sce.student_id = ? AND sce.enrollment_status = 'Enrolled'`,
      [student.id]
    );

    let mentor = null;
    if (student.assigned_faculty_id) {
      const mRes = await dbManager.query('SELECT id, name, designation, email, phone, office FROM faculty WHERE id = ?', [student.assigned_faculty_id]);
      if (mRes.rows.length > 0) mentor = mRes.rows[0];
    }

    res.json({
      success: true,
      data: {
        profile: student,
        courses: enrCourses.rows,
        mentor,
        attendanceRate: student.attendance_rate,
        cgpa: student.cgpa
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- 3. GUARDIAN READ APIS ---
apiRouter.get('/guardian/dashboard', async (req: Request, res: Response) => {
  const studentId = req.query.studentId as string;
  try {
    const sRes = await dbManager.query('SELECT * FROM students WHERE id = ? OR student_id = ?', [studentId, studentId]);
    if (sRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Linked student record not found' });
    }
    const student = sRes.rows[0];

    const smsRes = await dbManager.query(
      'SELECT * FROM sms_messages WHERE student_id = ? OR recipient_phone = ? ORDER BY sent_at DESC LIMIT 10',
      [student.id, student.parent_phone]
    );

    res.json({
      success: true,
      data: {
        student: {
          id: student.id,
          studentId: student.student_id,
          name: student.name,
          course: student.course,
          semester: student.semester,
          section: student.section,
          attendanceRate: student.attendance_rate,
          cgpa: student.cgpa,
          assignedFaculty: student.assigned_faculty
        },
        notifications: smsRes.rows,
        shortageAlert: student.attendance_rate < 75
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =========================================================================
// 📝 COURSE ATTENDANCE & MARKS
// =========================================================================

apiRouter.get('/attendance/course-records', async (req: Request, res: Response) => {
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
    const attRes = await dbManager.query(sql, params);
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

apiRouter.post('/attendance/course-records/batch', async (req: Request, res: Response) => {
  const { courseId, facultyId, date, sessionType, records, finalize, markedBy } = req.body;
  if (!courseId || !date || !Array.isArray(records)) {
    return res.status(400).json({ success: false, error: 'Invalid attendance batch payload' });
  }

  try {
    const now = new Date().toISOString();
    for (const rec of records) {
      const id = `att-${rec.studentId}-${courseId}-${date}`;
      await dbManager.run(
        `INSERT OR REPLACE INTO course_attendance_records (
          id, student_id, course_id, faculty_id, date, session_type, status, marked_at, marked_by, finalized, remarks
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, rec.studentId, courseId, facultyId || 'fac-1', date, sessionType || 'THEORY',
          rec.status || 'PRESENT', now, markedBy || 'Faculty', finalize ? 1 : 0, rec.remarks || ''
        ]
      );
    }

    await logAudit(facultyId || 'faculty-1', markedBy || 'Faculty', 'faculty', 'attendance.finalized', 'attendance', courseId, null, JSON.stringify({ count: records.length, date }));
    dbManager.persist();
    res.json({ success: true, message: `Recorded attendance for ${records.length} students` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Marks Management
apiRouter.get('/marks', async (req: Request, res: Response) => {
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
    const marksRes = await dbManager.query(sql, params);
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

apiRouter.post('/marks/batch', async (req: Request, res: Response) => {
  const { courseId, assessmentType, marksEntries, finalize, updatedBy } = req.body;
  if (!courseId || !assessmentType || !Array.isArray(marksEntries)) {
    return res.status(400).json({ success: false, error: 'Invalid batch marks payload' });
  }

  try {
    const now = new Date().toISOString();
    for (const entry of marksEntries) {
      const { studentId, mark } = entry;
      const existing = await dbManager.query('SELECT * FROM course_marks WHERE student_id = ? AND course_id = ?', [studentId, courseId]);

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
        await dbManager.run(
          `UPDATE course_marks SET "${dbCol}" = ?, updated_by = ?, updated_at = ?, status = ? WHERE student_id = ? AND course_id = ?`,
          [mark, updatedBy || 'Faculty', now, finalize ? 'Finalized' : 'Saved', studentId, courseId]
        );
      } else {
        const id = `mark-${studentId}-${courseId}`;
        await dbManager.run(
          `INSERT INTO course_marks (
            id, student_id, course_id, semester, academic_year, "${assessmentType}", updated_by, updated_at, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, studentId, courseId, 5, '2026-27', mark, updatedBy || 'Faculty', now, finalize ? 'Finalized' : 'Saved']
        );
      }
    }

    dbManager.persist();
    res.json({ success: true, message: `Successfully updated ${marksEntries.length} marks entries for ${assessmentType}` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Mentoring Notes
apiRouter.post('/mentoring', async (req: Request, res: Response) => {
  const { studentId, date, topic, notes, actionItems, status, facultyName, facultyId } = req.body;
  try {
    const noteId = `note-${Date.now()}`;
    await dbManager.run(
      'INSERT INTO mentoring_notes (id, student_id, date, faculty_name, faculty_id, topic, notes, action_items, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [noteId, studentId, date, facultyName || 'Faculty', facultyId || 'fac-1', topic, notes, actionItems, status || 'Resolved']
    );

    await dbManager.run('UPDATE students SET last_mentoring_date = ? WHERE id = ?', [date, studentId]);

    dbManager.persist();
    res.json({ success: true, id: noteId, message: 'Mentoring note recorded' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Counseling Referrals
apiRouter.get('/counseling/referrals', async (req: Request, res: Response) => {
  try {
    const refRes = await dbManager.query('SELECT * FROM counseling_referrals ORDER BY created_at DESC');
    res.json({ success: true, data: refRes.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/counseling/referrals', async (req: Request, res: Response) => {
  const { studentId, studentName, semester, referredByFacultyId, referredByFacultyName, reasonCode, facultyRemarks } = req.body;
  try {
    const id = `ref-${Date.now()}`;
    const now = new Date().toISOString();
    await dbManager.run(
      `INSERT INTO counseling_referrals (
        id, student_id, student_name, semester, referred_by_faculty_id, referred_by_faculty_name,
        counselor_id, counselor_name, reason_code, faculty_remarks, status, mentor_visible_status,
        created_at, notes_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, studentId, studentName || 'Student', semester || 1, referredByFacultyId || 'fac-1',
        referredByFacultyName || 'Faculty', 'counselor-1', 'Student Counselor', reasonCode,
        facultyRemarks, 'pending', 'Under Review', now, 0
      ]
    );

    dbManager.persist();
    res.json({ success: true, id, message: 'Counseling referral created' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// SMS & Audit Logs
apiRouter.get('/sms/messages', async (req: Request, res: Response) => {
  try {
    const smsRes = await dbManager.query('SELECT * FROM sms_messages ORDER BY sent_at DESC LIMIT 100');
    res.json({ success: true, data: smsRes.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Gateway & Core SMS Alert Dispatch Queue (supports both /sms/dispatch-alert and /v1/sms/dispatch-alert)
const dispatchSmsHandler = async (req: Request, res: Response) => {
  const { studentName, recipientPhone, alertType, message, studentId } = req.body;
  if (!recipientPhone || !message) {
    return res.status(400).json({ success: false, error: 'recipientPhone and message are required' });
  }

  try {
    const dispatchId = `SMS_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const now = new Date().toISOString();

    await dbManager.run(
      `INSERT INTO sms_messages (id, recipient_phone, student_id, student_name, template_id, body, status, sent_at, failure_reason)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [dispatchId, recipientPhone, studentId || 'N/A', studentName || 'Student', alertType || 'ALERT', message, 'Delivered', now, null]
    );

    await logAudit(
      'gateway-sms',
      'SMS Dispatch Queue',
      'system',
      'sms.dispatched',
      'sms_message',
      dispatchId,
      null,
      JSON.stringify({ recipientPhone, studentName, alertType })
    );

    dbManager.persist();

    res.json({
      success: true,
      dispatchId,
      recipient: recipientPhone,
      student: studentName,
      alertType: alertType || 'ATTENDANCE_DEFICIT',
      status: 'DISPATCHED_TO_TELCO',
      timestamp: now
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

apiRouter.post('/sms/dispatch-alert', dispatchSmsHandler);
apiRouter.post('/v1/sms/dispatch-alert', dispatchSmsHandler);

// V1 Master Data Initializer
apiRouter.post(['/master/initialize-bca-setup', '/v1/master/initialize-bca-setup'], async (req: Request, res: Response) => {
  const departmentCode = (req.query.departmentCode as string) || (req.body.departmentCode as string) || 'BCA';
  const adminUser = (req.headers['x-admin-user'] as string) || 'SYSTEM_ADMIN';
  try {
    await logAudit(adminUser, adminUser, 'admin', 'master.bca_setup.initialized', 'curriculum', departmentCode);
    res.json({
      status: 'SUCCESS',
      message: 'Institutional BCA 6-semester structure and curriculum initialized.',
      departmentCode
    });
  } catch (err: any) {
    res.status(500).json({ status: 'ERROR', error: err.message });
  }
});

apiRouter.get('/audit-logs', async (req: Request, res: Response) => {
  try {
    const logsRes = await dbManager.query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 200');
    res.json({ success: true, data: logsRes.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/notices', async (req: Request, res: Response) => {
  try {
    const nRes = await dbManager.query('SELECT * FROM notices ORDER BY date DESC');
    res.json({ success: true, data: nRes.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
