import { Router, Request, Response } from 'express';
import { dbManager } from '../../database/database.js';

export const userRoutes = Router();

// Helper to generate initials & avatar colors
function generateAvatarProps(name: string) {
  const parts = name.trim().split(/\s+/);
  const initials = parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();

  const colors = [
    { bg: 'bg-indigo-100', text: 'text-indigo-700' },
    { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    { bg: 'bg-amber-100', text: 'text-amber-700' },
    { bg: 'bg-sky-100', text: 'text-sky-700' },
    { bg: 'bg-rose-100', text: 'text-rose-700' },
    { bg: 'bg-purple-100', text: 'text-purple-700' }
  ];
  const colorIndex = Math.abs(name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % colors.length;
  return { initials, ...colors[colorIndex] };
}

// 1. Get User Metrics / Stats
userRoutes.get('/stats', async (req: Request, res: Response) => {
  try {
    const totalRes = await dbManager.query('SELECT COUNT(*) as count FROM users');
    const totalUsers = totalRes.rows[0]?.count || 0;

    const roleBreakdownRes = await dbManager.query('SELECT role, COUNT(*) as count FROM users GROUP BY role');
    const roles: Record<string, number> = {
      admin: 0,
      faculty: 0,
      student: 0,
      counselor: 0
    };
    roleBreakdownRes.rows.forEach(r => {
      roles[r.role] = r.count;
    });

    const activeRes = await dbManager.query('SELECT is_active, COUNT(*) as count FROM users GROUP BY is_active');
    let activeCount = 0;
    let inactiveCount = 0;
    activeRes.rows.forEach(r => {
      if (r.is_active === 1) activeCount = r.count;
      else inactiveCount = r.count;
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        activeCount,
        inactiveCount,
        roles
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. List Users with Pagination, Search, and Filters
userRoutes.get('/', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit as string) || 50));
    const search = ((req.query.q || req.query.search || '') as string).trim();
    const role = (req.query.role as string || '').trim();
    const semester = req.query.semester ? parseInt(req.query.semester as string) : undefined;
    const departmentId = (req.query.departmentId as string || '').trim();
    const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' || req.query.isActive === '1' : undefined;
    const sortBy = ['name', 'email', 'role', 'created_at', 'semester'].includes(req.query.sortBy as string)
      ? (req.query.sortBy as string)
      : 'created_at';
    const sortDir = (req.query.sortDir as string)?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const conditions: string[] = [];
    const params: any[] = [];

    if (search) {
      conditions.push('(name LIKE ? OR email LIKE ? OR phone LIKE ? OR student_id LIKE ? OR designation LIKE ?)');
      const wild = `%${search}%`;
      params.push(wild, wild, wild, wild, wild);
    }

    if (role && role !== 'all') {
      conditions.push('role = ?');
      params.push(role);
    }

    if (semester !== undefined && !isNaN(semester) && semester > 0) {
      conditions.push('semester = ?');
      params.push(semester);
    }

    if (departmentId && departmentId !== 'all') {
      conditions.push('department_id = ?');
      params.push(departmentId);
    }

    if (isActive !== undefined) {
      conditions.push('is_active = ?');
      params.push(isActive ? 1 : 0);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count total matching
    const countSql = `SELECT COUNT(*) as count FROM users ${whereClause}`;
    const countRes = await dbManager.query(countSql, params);
    const total = countRes.rows[0]?.count || 0;
    const totalPages = Math.ceil(total / limit) || 1;
    const offset = (page - 1) * limit;

    // Fetch paginated rows
    const dataSql = `
      SELECT id, name, email, role, phone, department_id, is_active, created_at, avatar_bg, avatar_text, designation, student_id, semester
      FROM users
      ${whereClause}
      ORDER BY ${sortBy} ${sortDir}
      LIMIT ? OFFSET ?
    `;
    const dataRes = await dbManager.query(dataSql, [...params, limit, offset]);

    const users = dataRes.rows.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone || '',
      departmentId: u.department_id || 'BCA',
      isActive: Boolean(u.is_active),
      createdAt: u.created_at,
      avatarBg: u.avatar_bg || 'bg-slate-100',
      avatarText: u.avatar_text || 'text-slate-700',
      designation: u.designation || '',
      studentId: u.student_id || '',
      semester: u.semester || undefined
    }));

    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Get Single User Details
userRoutes.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const userRes = await dbManager.query('SELECT * FROM users WHERE id = ?', [id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    const u = userRes.rows[0];

    // Check if student details exist
    let studentDetails = null;
    if (u.role === 'student' && u.student_id) {
      const sRes = await dbManager.query('SELECT * FROM students WHERE student_id = ? OR id = ?', [u.student_id, u.id]);
      if (sRes.rows.length > 0) {
        studentDetails = sRes.rows[0];
      }
    }

    // Check if faculty details exist
    let facultyDetails = null;
    if (u.role === 'faculty') {
      const fRes = await dbManager.query('SELECT * FROM faculty WHERE id = ? OR email = ?', [u.id, u.email]);
      if (fRes.rows.length > 0) {
        facultyDetails = fRes.rows[0];
      }
    }

    res.json({
      success: true,
      data: {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        phone: u.phone || '',
        departmentId: u.department_id || 'BCA',
        isActive: Boolean(u.is_active),
        createdAt: u.created_at,
        avatarBg: u.avatar_bg,
        avatarText: u.avatar_text,
        designation: u.designation,
        studentId: u.student_id,
        semester: u.semester,
        studentDetails,
        facultyDetails
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Create New User
userRoutes.post('/', async (req: Request, res: Response) => {
  const {
    name,
    email,
    role,
    phone,
    departmentId = 'BCA',
    designation,
    studentId,
    semester,
    isActive = true,
    createdBy = 'Admin'
  } = req.body;

  if (!name || !email || !role) {
    return res.status(400).json({ success: false, error: 'Name, email, and role are required.' });
  }

  try {
    // Check if email is already registered
    const existing = await dbManager.query('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, error: 'A user with this email address already exists.' });
    }

    const userId = `usr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const avatar = generateAvatarProps(name);
    const now = new Date().toISOString();

    // Insert user
    await dbManager.run(
      `INSERT INTO users (id, name, email, role, phone, department_id, is_active, created_at, avatar_bg, avatar_text, designation, student_id, semester)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        name.trim(),
        email.trim().toLowerCase(),
        role,
        phone || '',
        departmentId,
        isActive ? 1 : 0,
        now,
        avatar.bg,
        avatar.text,
        designation || '',
        studentId || (role === 'student' ? `BCA26${String(Math.floor(Math.random() * 900) + 100)}` : null),
        semester ? Number(semester) : (role === 'student' ? 1 : null)
      ]
    );

    // If role is student, also sync into students table
    if (role === 'student') {
      const finalStudentId = studentId || `BCA26${String(Math.floor(Math.random() * 900) + 100)}`;
      const existingStudent = await dbManager.query('SELECT id FROM students WHERE student_id = ? OR email = ?', [finalStudentId, email]);
      if (existingStudent.rows.length === 0) {
        await dbManager.run(
          `INSERT INTO students (id, student_id, name, initials, avatar_bg, avatar_text, course, semester, section, email, phone, parent_phone, attendance_rate, mentoring_status, cgpa, sgpa_history, assigned_faculty, assigned_faculty_id, weekly_attendance, total_classes_held, total_classes_attended)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            finalStudentId,
            name.trim(),
            avatar.initials,
            avatar.bg,
            avatar.text,
            'Bachelor of Computer Applications',
            semester ? Number(semester) : 1,
            'A',
            email.trim().toLowerCase(),
            phone || '+91 98765 43210',
            '+91 98765 00000',
            85.0,
            'Regular',
            8.0,
            JSON.stringify([8.0]),
            'Dr. Aris Thorne',
            'fac-001',
            JSON.stringify([85, 88, 82, 90, 84]),
            60,
            51
          ]
        );
      }
    }

    // If role is faculty, also sync into faculty table
    if (role === 'faculty') {
      const existingFac = await dbManager.query('SELECT id FROM faculty WHERE id = ? OR email = ?', [userId, email]);
      if (existingFac.rows.length === 0) {
        await dbManager.run(
          `INSERT INTO faculty (id, name, designation, department, email, phone, office, assigned_students_count, specialization, courses)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            name.trim(),
            designation || 'Assistant Professor',
            'Computer Applications',
            email.trim().toLowerCase(),
            phone || '',
            'Lab Block 2, Room 304',
            0,
            'Computer Science',
            JSON.stringify([])
          ]
        );
      }
    }

    // Audit log
    await dbManager.run(
      `INSERT INTO audit_logs (id, actor_user_id, actor_name, actor_role, action, entity_type, entity_id, after_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `audit-${Date.now()}`,
        'admin',
        createdBy,
        'admin',
        'USER_CREATED',
        'user',
        userId,
        JSON.stringify({ id: userId, name, email, role }),
        now
      ]
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: userId,
        name,
        email,
        role,
        phone,
        departmentId,
        isActive,
        createdAt: now,
        avatarBg: avatar.bg,
        avatarText: avatar.text,
        designation,
        studentId,
        semester
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Update User
userRoutes.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    name,
    email,
    role,
    phone,
    departmentId,
    designation,
    studentId,
    semester,
    isActive,
    updatedBy = 'Admin'
  } = req.body;

  try {
    const existingRes = await dbManager.query('SELECT * FROM users WHERE id = ?', [id]);
    if (existingRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    const current = existingRes.rows[0];

    // If changing email, ensure unique
    if (email && email.toLowerCase() !== current.email.toLowerCase()) {
      const emailCheck = await dbManager.query('SELECT id FROM users WHERE LOWER(email) = LOWER(?) AND id != ?', [email.trim(), id]);
      if (emailCheck.rows.length > 0) {
        return res.status(409).json({ success: false, error: 'Another user is already using this email address.' });
      }
    }

    const updatedName = name !== undefined ? name.trim() : current.name;
    const updatedEmail = email !== undefined ? email.trim().toLowerCase() : current.email;
    const updatedRole = role !== undefined ? role : current.role;
    const updatedPhone = phone !== undefined ? phone : current.phone;
    const updatedDept = departmentId !== undefined ? departmentId : current.department_id;
    const updatedDesignation = designation !== undefined ? designation : current.designation;
    const updatedStudentId = studentId !== undefined ? studentId : current.student_id;
    const updatedSemester = semester !== undefined ? Number(semester) : current.semester;
    const updatedIsActive = isActive !== undefined ? (isActive ? 1 : 0) : current.is_active;

    await dbManager.run(
      `UPDATE users
       SET name = ?, email = ?, role = ?, phone = ?, department_id = ?, designation = ?, student_id = ?, semester = ?, is_active = ?
       WHERE id = ?`,
      [
        updatedName,
        updatedEmail,
        updatedRole,
        updatedPhone,
        updatedDept,
        updatedDesignation,
        updatedStudentId,
        updatedSemester,
        updatedIsActive,
        id
      ]
    );

    // Sync student table if user is a student
    if (updatedRole === 'student') {
      await dbManager.run(
        `UPDATE students
         SET name = ?, email = ?, phone = ?, semester = coalesce(?, semester)
         WHERE id = ? OR student_id = ? OR email = ?`,
        [updatedName, updatedEmail, updatedPhone, updatedSemester, id, current.student_id, current.email]
      );
    }

    // Sync faculty table if user is faculty
    if (updatedRole === 'faculty') {
      await dbManager.run(
        `UPDATE faculty
         SET name = ?, email = ?, phone = ?, designation = coalesce(?, designation)
         WHERE id = ? OR email = ?`,
        [updatedName, updatedEmail, updatedPhone, updatedDesignation, id, current.email]
      );
    }

    // Audit log
    await dbManager.run(
      `INSERT INTO audit_logs (id, actor_user_id, actor_name, actor_role, action, entity_type, entity_id, before_json, after_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `audit-${Date.now()}`,
        'admin',
        updatedBy,
        'admin',
        'USER_UPDATED',
        'user',
        id,
        JSON.stringify(current),
        JSON.stringify({ id, name: updatedName, email: updatedEmail, role: updatedRole, isActive: updatedIsActive }),
        new Date().toISOString()
      ]
    );

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        id,
        name: updatedName,
        email: updatedEmail,
        role: updatedRole,
        phone: updatedPhone,
        departmentId: updatedDept,
        designation: updatedDesignation,
        studentId: updatedStudentId,
        semester: updatedSemester,
        isActive: Boolean(updatedIsActive)
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Delete User
userRoutes.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const hardDelete = req.query.hard === 'true';
  const deletedBy = (req.query.deletedBy as string) || 'Admin';

  try {
    const userRes = await dbManager.query('SELECT * FROM users WHERE id = ?', [id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    const user = userRes.rows[0];

    if (hardDelete) {
      // Hard delete
      await dbManager.run('DELETE FROM users WHERE id = ?', [id]);
      if (user.role === 'student') {
        await dbManager.run('DELETE FROM students WHERE id = ? OR student_id = ?', [id, user.student_id]);
      }
      if (user.role === 'faculty') {
        await dbManager.run('DELETE FROM faculty WHERE id = ?', [id]);
      }
    } else {
      // Soft deactivate
      await dbManager.run('UPDATE users SET is_active = 0 WHERE id = ?', [id]);
    }

    // Audit log
    await dbManager.run(
      `INSERT INTO audit_logs (id, actor_user_id, actor_name, actor_role, action, entity_type, entity_id, before_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `audit-${Date.now()}`,
        'admin',
        deletedBy,
        'admin',
        hardDelete ? 'USER_DELETED_HARD' : 'USER_DEACTIVATED',
        'user',
        id,
        JSON.stringify(user),
        new Date().toISOString()
      ]
    );

    res.json({
      success: true,
      message: hardDelete ? 'User permanently deleted' : 'User deactivated successfully'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Batch Import Users
userRoutes.post('/batch-import', async (req: Request, res: Response) => {
  const { users, importedBy = 'Admin' } = req.body;
  if (!Array.isArray(users) || users.length === 0) {
    return res.status(400).json({ success: false, error: 'Expected a non-empty array of users' });
  }

  try {
    let importedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (let idx = 0; idx < users.length; idx++) {
      const u: any = users[idx];
      if (!u.name || !u.email || !u.role) {
        skippedCount++;
        errors.push(`Row ${idx + 1}: Missing name, email, or role`);
        continue;
      }

      const existing = await dbManager.query('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [u.email.trim()]);
      if (existing.rows.length > 0) {
        skippedCount++;
        continue;
      }

      const userId = u.id || `usr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const avatar = generateAvatarProps(u.name);
      const now = new Date().toISOString();

      await dbManager.run(
        `INSERT INTO users (id, name, email, role, phone, department_id, is_active, created_at, avatar_bg, avatar_text, designation, student_id, semester)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          u.name.trim(),
          u.email.trim().toLowerCase(),
          u.role,
          u.phone || '',
          u.departmentId || 'BCA',
          u.isActive !== false ? 1 : 0,
          now,
          avatar.bg,
          avatar.text,
          u.designation || '',
          u.studentId || (u.role === 'student' ? `BCA26${String(Math.floor(Math.random() * 900) + 100)}` : null),
          u.semester ? Number(u.semester) : (u.role === 'student' ? 1 : null)
        ]
      );
      importedCount++;
    }

    await dbManager.run(
      `INSERT INTO audit_logs (id, actor_user_id, actor_name, actor_role, action, entity_type, entity_id, after_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `audit-${Date.now()}`,
        'admin',
        importedBy,
        'admin',
        'USERS_BATCH_IMPORTED',
        'user',
        'batch',
        JSON.stringify({ importedCount, skippedCount }),
        new Date().toISOString()
      ]
    );

    res.json({
      success: true,
      message: `Batch import complete: ${importedCount} users added, ${skippedCount} skipped.`,
      data: { importedCount, skippedCount, errors }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
