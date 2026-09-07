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
      {
        id: 'admin-root',
        name: 'System Administrator',
        email: 'admin@bcafly.edu',
        role: 'admin',
        phone: '+1 (555) 000-0000',
        department_id: 'dept-bca',
        is_active: 1,
        created_at: '2026-08-01',
        designation: 'Institutional Administrator'
      },
      {
        id: 'fac-001',
        name: 'Dr. Aris Thorne',
        email: 'aris.thorne@bcafly.edu',
        role: 'faculty',
        phone: '+91 98765 43210',
        department_id: 'dept-bca',
        is_active: 1,
        created_at: '2026-08-01',
        designation: 'Associate Professor'
      }
    ],
    departments: [
      { id: 'dept-bca', name: 'Computer Applications', code: 'BCA', dept_head_id: 'fac-001', is_active: 1 }
    ],
    academic_years: [
      { id: 'ay-2025-2026', title: '2025 - 2026', code: 'AY25-26', start_date: '2025-06-01', end_date: '2026-05-31', is_active: 1 }
    ],
    semesters: [
      { id: 'sem-1', academic_year_id: 'ay-2025-2026', number: 1, name: 'Semester 1', start_date: '2025-06-01', end_date: '2025-11-30', is_current: 1 }
    ],
    batches: [
      { id: 'batch-2025-a', name: 'BCA 2025-2028 Section A', code: 'BCA25A', department_id: 'dept-bca', start_year: 2025, end_year: 2028, section: 'A', is_active: 1 }
    ],
    courses: [],
    faculty: [
      {
        id: 'fac-001',
        name: 'Dr. Aris Thorne',
        designation: 'Associate Professor',
        department: 'Computer Applications',
        email: 'aris.thorne@bcafly.edu',
        phone: '+91 98765 43210',
        office: 'Lab Block 2, Room 304',
        assigned_students_count: 12,
        specialization: 'Computer Science',
        courses: '[]'
      }
    ],
    students: [],
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
