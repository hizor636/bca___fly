export interface QueryResult {
  columns: string[];
  values: any[][];
  rows: Record<string, any>[];
  rowCount: number;
  executionTimeMs: number;
}

// In-Memory Storage
class MemoryDbManager {
  private tables: Record<string, Record<string, any>[]> = {
    users: [
      { id: 'super-admin-root', name: 'Platform Super Admin', email: 'superadmin@bcafly.edu', role: 'super_admin', phone: '+1 (555) 000-0001', department_id: 'PLATFORM', is_active: 1, created_at: '2026-08-01', designation: 'Global Super Admin' },
      { id: 'admin-root', name: 'Dept Admin (HOD)', email: 'admin@bcafly.edu', role: 'admin', phone: '+1 (555) 000-0000', department_id: 'dept-bca', is_active: 1, created_at: '2026-08-01', designation: 'Head of Department' },
      { id: 'fac-001', name: 'Dr. Sarah Jenkins', email: 'sarah.jenkins@bcafly.edu', role: 'faculty', phone: '+91 98765 43210', department_id: 'dept-bca', is_active: 1, created_at: '2026-08-01', designation: 'Associate Professor (Group A Mentor)' },
      { id: 'fac-002', name: 'Prof. Rajesh Kumar', email: 'rajesh.kumar@bcafly.edu', role: 'faculty', phone: '+91 98765 43211', department_id: 'dept-bca', is_active: 1, created_at: '2026-08-01', designation: 'Assistant Professor (Group B Mentor)' },
      { id: 'stu-001', name: 'Alexander Wright', email: 'alexander.wright@student.bcafly.edu', role: 'student', phone: '+91 98765 10001', department_id: 'dept-bca', is_active: 1, created_at: '2026-08-01', student_id: 'BCA26101', semester: 5 },
      { id: 'stu-006', name: 'Aarav Patel', email: 'aarav.patel@student.bcafly.edu', role: 'student', phone: '+91 98765 10006', department_id: 'dept-bca', is_active: 1, created_at: '2026-08-01', student_id: 'BCA26106', semester: 5 },
      { id: 'parent-001', name: 'Robert Wright', email: 'robert.wright@parent.bcafly.edu', role: 'parent', phone: '+91 98765 20001', department_id: 'dept-bca', is_active: 1, created_at: '2026-08-01', designation: 'Parent / Guardian' },
      { id: 'counselor-001', name: 'Dr. Priya Sharma', email: 'priya.counselor@bcafly.edu', role: 'counselor', phone: '+91 98765 30001', department_id: 'dept-bca', is_active: 1, created_at: '2026-08-01', designation: 'Student Counselor' }
    ],
    departments: [
      { id: 'dept-bca', name: 'Computer Applications', code: 'BCA', dept_head_id: 'fac-001', is_active: 1 }
    ],
    academic_years: [
      { id: 'ay-2025-2026', title: '2025 - 2026', code: 'AY25-26', start_date: '2025-06-01', end_date: '2026-05-31', is_active: 1 }
    ],
    semesters: [
      { id: 'sem-5', academic_year_id: 'ay-2025-2026', number: 5, name: 'Semester 5', start_date: '2026-06-01', end_date: '2026-11-30', is_current: 1 }
    ],
    batches: [
      { id: 'batch-2024-a', name: 'BCA 2024-2027 Group A', code: 'BCA24A', department_id: 'dept-bca', start_year: 2024, end_year: 2027, section: 'A', is_active: 1 },
      { id: 'batch-2024-b', name: 'BCA 2024-2027 Group B', code: 'BCA24B', department_id: 'dept-bca', start_year: 2024, end_year: 2027, section: 'B', is_active: 1 }
    ],
    courses: [],
    faculty: [
      {
        id: 'fac-001',
        name: 'Dr. Sarah Jenkins',
        designation: 'Associate Professor (Group A Mentor)',
        department: 'Computer Applications',
        email: 'sarah.jenkins@bcafly.edu',
        phone: '+91 98765 43210',
        office: 'Lab Block 2, Room 304',
        assigned_students_count: 5,
        specialization: 'Software Engineering & AI',
        courses: '[]'
      },
      {
        id: 'fac-002',
        name: 'Prof. Rajesh Kumar',
        designation: 'Assistant Professor (Group B Mentor)',
        department: 'Computer Applications',
        email: 'rajesh.kumar@bcafly.edu',
        phone: '+91 98765 43211',
        office: 'Lab Block 2, Room 308',
        assigned_students_count: 5,
        specialization: 'Cloud Computing & Networks',
        courses: '[]'
      }
    ],
    students: [
      // --- Group A (Assigned to Faculty 1: Dr. Sarah Jenkins) ---
      { id: 'stu-001', student_id: 'BCA26101', name: 'Alexander Wright', initials: 'AW', avatar_bg: 'bg-emerald-100', avatar_text: 'text-emerald-700', course: 'BCA', semester: 5, section: 'Group A', email: 'alexander.wright@student.bcafly.edu', phone: '+91 98765 10001', parent_phone: '+91 98765 20001', attendance_rate: 88.5, mentoring_status: 'Regular', cgpa: 8.9, assigned_faculty: 'Dr. Sarah Jenkins', assigned_faculty_id: 'fac-001', total_classes_held: 60, total_classes_attended: 53, is_active: 1 },
      { id: 'stu-002', student_id: 'BCA26102', name: 'Sophia Chen', initials: 'SC', avatar_bg: 'bg-amber-100', avatar_text: 'text-amber-700', course: 'BCA', semester: 5, section: 'Group A', email: 'sophia.chen@student.bcafly.edu', phone: '+91 98765 10002', parent_phone: '+91 98765 20002', attendance_rate: 71.4, mentoring_status: 'Shortage Warning', cgpa: 7.8, assigned_faculty: 'Dr. Sarah Jenkins', assigned_faculty_id: 'fac-001', total_classes_held: 60, total_classes_attended: 43, is_active: 1 },
      { id: 'stu-003', student_id: 'BCA26103', name: 'Marcus Vance', initials: 'MV', avatar_bg: 'bg-blue-100', avatar_text: 'text-blue-700', course: 'BCA', semester: 5, section: 'Group A', email: 'marcus.vance@student.bcafly.edu', phone: '+91 98765 10003', parent_phone: '+91 98765 20003', attendance_rate: 92.0, mentoring_status: 'Regular', cgpa: 9.1, assigned_faculty: 'Dr. Sarah Jenkins', assigned_faculty_id: 'fac-001', total_classes_held: 60, total_classes_attended: 55, is_active: 1 },
      { id: 'stu-004', student_id: 'BCA26104', name: 'Emily Watson', initials: 'EW', avatar_bg: 'bg-rose-100', avatar_text: 'text-rose-700', course: 'BCA', semester: 5, section: 'Group A', email: 'emily.watson@student.bcafly.edu', phone: '+91 98765 10004', parent_phone: '+91 98765 20004', attendance_rate: 68.0, mentoring_status: 'Shortage Warning', cgpa: 6.4, assigned_faculty: 'Dr. Sarah Jenkins', assigned_faculty_id: 'fac-001', total_classes_held: 60, total_classes_attended: 41, is_active: 1 },
      { id: 'stu-005', student_id: 'BCA26105', name: 'David Kim', initials: 'DK', avatar_bg: 'bg-purple-100', avatar_text: 'text-purple-700', course: 'BCA', semester: 5, section: 'Group A', email: 'david.kim@student.bcafly.edu', phone: '+91 98765 10005', parent_phone: '+91 98765 20005', attendance_rate: 81.0, mentoring_status: 'Regular', cgpa: 8.2, assigned_faculty: 'Dr. Sarah Jenkins', assigned_faculty_id: 'fac-001', total_classes_held: 60, total_classes_attended: 49, is_active: 1 },
      // --- Group B (Assigned to Faculty 2: Prof. Rajesh Kumar) ---
      { id: 'stu-006', student_id: 'BCA26106', name: 'Aarav Patel', initials: 'AP', avatar_bg: 'bg-emerald-100', avatar_text: 'text-emerald-700', course: 'BCA', semester: 5, section: 'Group B', email: 'aarav.patel@student.bcafly.edu', phone: '+91 98765 10006', parent_phone: '+91 98765 20006', attendance_rate: 84.0, mentoring_status: 'Regular', cgpa: 8.5, assigned_faculty: 'Prof. Rajesh Kumar', assigned_faculty_id: 'fac-002', total_classes_held: 60, total_classes_attended: 50, is_active: 1 },
      { id: 'stu-007', student_id: 'BCA26107', name: 'Isabella Torres', initials: 'IT', avatar_bg: 'bg-amber-100', avatar_text: 'text-amber-700', course: 'BCA', semester: 5, section: 'Group B', email: 'isabella.torres@student.bcafly.edu', phone: '+91 98765 10007', parent_phone: '+91 98765 20007', attendance_rate: 73.0, mentoring_status: 'Shortage Warning', cgpa: 7.5, assigned_faculty: 'Prof. Rajesh Kumar', assigned_faculty_id: 'fac-002', total_classes_held: 60, total_classes_attended: 44, is_active: 1 },
      { id: 'stu-008', student_id: 'BCA26108', name: 'James Wilson', initials: 'JW', avatar_bg: 'bg-blue-100', avatar_text: 'text-blue-700', course: 'BCA', semester: 5, section: 'Group B', email: 'james.wilson@student.bcafly.edu', phone: '+91 98765 10008', parent_phone: '+91 98765 20008', attendance_rate: 95.0, mentoring_status: 'Regular', cgpa: 9.4, assigned_faculty: 'Prof. Rajesh Kumar', assigned_faculty_id: 'fac-002', total_classes_held: 60, total_classes_attended: 57, is_active: 1 },
      { id: 'stu-009', student_id: 'BCA26109', name: 'Liam Becker', initials: 'LB', avatar_bg: 'bg-rose-100', avatar_text: 'text-rose-700', course: 'BCA', semester: 5, section: 'Group B', email: 'liam.becker@student.bcafly.edu', phone: '+91 98765 10009', parent_phone: '+91 98765 20009', attendance_rate: 64.5, mentoring_status: 'Shortage Warning', cgpa: 6.1, assigned_faculty: 'Prof. Rajesh Kumar', assigned_faculty_id: 'fac-002', total_classes_held: 60, total_classes_attended: 39, is_active: 1 },
      { id: 'stu-010', student_id: 'BCA26110', name: 'Olivia Taylor', initials: 'OT', avatar_bg: 'bg-purple-100', avatar_text: 'text-purple-700', course: 'BCA', semester: 5, section: 'Group B', email: 'olivia.taylor@student.bcafly.edu', phone: '+91 98765 10010', parent_phone: '+91 98765 20010', attendance_rate: 89.0, mentoring_status: 'Regular', cgpa: 8.7, assigned_faculty: 'Prof. Rajesh Kumar', assigned_faculty_id: 'fac-002', total_classes_held: 60, total_classes_attended: 53, is_active: 1 }
    ],
    faculty_course_assignments: [],
    student_course_enrollments: [],
    course_marks: [],
    course_attendance: [],
    audit_logs: []
  };

  public async init(): Promise<void> {
    console.log('[InMemoryStore] Storage initialized');
  }

  public persist(): void {
    // In-memory persist placeholder
  }

  public async getStats() {
    let totalRows = 0;
    const tableKeys = Object.keys(this.tables);
    tableKeys.forEach(t => {
      totalRows += this.tables[t].length;
    });

    return {
      tableCount: tableKeys.length,
      totalRows,
      engine: 'In-Memory State Engine',
      databaseSizeKb: 64
    };
  }

  public async query(sql: string, params: any[] = []): Promise<QueryResult> {
    const start = performance.now();
    const cleanSql = sql.trim().toUpperCase();

    // Table extraction helper
    const getTableName = (sqlStr: string): string => {
      const match = sqlStr.match(/(?:FROM|INTO|UPDATE)\s+([a-zA-Z0-9_]+)/i);
      return match ? match[1].toLowerCase() : '';
    };

    const tableName = getTableName(sql);
    let tableData = this.tables[tableName] || [];

    // Filter logic if WHERE is present
    if (sql.includes('WHERE') && params.length > 0) {
      // Basic filtering support for common lookups (id, email, role, etc.)
      tableData = tableData.filter(row => {
        if (sql.toLowerCase().includes('email =') || sql.toLowerCase().includes('lower(email) =')) {
          const emailVal = params.find(p => typeof p === 'string' && p.includes('@'));
          if (emailVal) return (row.email || '').toLowerCase() === emailVal.toLowerCase();
        }
        if (sql.toLowerCase().includes('id =')) {
          const idVal = params[0];
          if (idVal) return row.id === idVal || row.student_id === idVal;
        }
        if (sql.toLowerCase().includes('role =')) {
          const roleVal = params.find(p => ['admin', 'faculty', 'student', 'super_admin', 'counselor'].includes(p));
          if (roleVal) return row.role === roleVal;
        }
        return true;
      });
    }

    // Handle COUNT(*) queries
    if (cleanSql.includes('COUNT(*)')) {
      const rows = [{ count: tableData.length }];
      return {
        columns: ['count'],
        values: [[tableData.length]],
        rows,
        rowCount: 1,
        executionTimeMs: Number((performance.now() - start).toFixed(2))
      };
    }

    const columns = tableData.length > 0 ? Object.keys(tableData[0]) : [];
    const values = tableData.map(r => columns.map(c => r[c]));

    return {
      columns,
      values,
      rows: tableData,
      rowCount: tableData.length,
      executionTimeMs: Number((performance.now() - start).toFixed(2))
    };
  }

  public async run(sql: string, params: any[] = []): Promise<{ changes: number; lastInsertRowid: number; executionTimeMs: number }> {
    const start = performance.now();
    const match = sql.match(/(?:INSERT INTO|UPDATE|DELETE FROM)\s+([a-zA-Z0-9_]+)/i);
    const tableName = match ? match[1].toLowerCase() : '';

    if (!this.tables[tableName]) {
      this.tables[tableName] = [];
    }

    if (sql.toUpperCase().includes('INSERT INTO')) {
      // Simple row insertion
      const newRow: Record<string, any> = {};
      const colsMatch = sql.match(/\(([^)]+)\)\s*VALUES/i);
      if (colsMatch) {
        const cols = colsMatch[1].split(',').map(c => c.trim().replace(/"/g, ''));
        cols.forEach((col, idx) => {
          newRow[col] = params[idx] !== undefined ? params[idx] : null;
        });
      } else {
        newRow.id = `rec-${Date.now()}`;
      }
      this.tables[tableName].push(newRow);
    } else if (sql.toUpperCase().includes('DELETE FROM')) {
      if (params.length > 0) {
        this.tables[tableName] = this.tables[tableName].filter(r => r.id !== params[0]);
      } else {
        this.tables[tableName] = [];
      }
    }

    return {
      changes: 1,
      lastInsertRowid: Date.now(),
      executionTimeMs: Number((performance.now() - start).toFixed(2))
    };
  }
}

export const dbManager = new MemoryDbManager();
