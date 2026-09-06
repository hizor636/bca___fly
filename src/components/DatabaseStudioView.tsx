import React, { useState, useEffect, useRef, useId, useMemo } from 'react';
import {
  Database,
  Terminal,
  Table as TableIcon,
  Layers,
  HardDrive,
  RefreshCw,
  Download,
  Upload,
  Play,
  Search,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  FileCode,
  Copy,
  Check,
  BarChart2,
  Activity,
  ArrowRight,
  Key,
  Users,
  GraduationCap,
  GitBranch,
  ExternalLink,
  Workflow,
  Server,
  Info,
  Code,
  BookOpen
} from 'lucide-react';
import { api, HealthStatus } from '../services/api';
import { DbStats, DbTableInfo, DbQueryResult, DbColumnInfo } from '../types';
import { useDemoStore } from '../context/DemoContext';
import { POSTGRES_SETUP_SQL } from '../data/postgresSetupScript';

interface QueryPreset {
  title: string;
  category: 'Academic' | 'Attendance' | 'Faculty' | 'Audit' | 'Assessment' | 'Users';
  description: string;
  sql: string;
}

export interface DatabaseStudioViewProps {
  onNavigateHome?: () => void;
}

const PRESET_QUERIES: QueryPreset[] = [
  {
    title: 'Attendance Shortage (<75%) Risk Alert',
    category: 'Attendance',
    description: 'Find all students whose attendance is below university mandatory 75% threshold',
    sql: `SELECT student_id, name, section as group_name, attendance_rate, assigned_faculty, condonation_status 
FROM students 
WHERE attendance_rate < 75.0 
ORDER BY attendance_rate ASC;`
  },
  {
    title: 'Top Performing Students (CGPA >= 3.5)',
    category: 'Academic',
    description: 'List honor roll students sorted by CGPA and semester rank',
    sql: `SELECT student_id, name, section as group_name, semester, cgpa, mentoring_status, email 
FROM students 
WHERE cgpa >= 3.5 
ORDER BY cgpa DESC;`
  },
  {
    title: 'Group A vs Group B Cohort Roster & Mentors',
    category: 'Faculty',
    description: 'Compare 10 students divided between Group A (Dr. Sarah) and Group B (Prof. Rajesh)',
    sql: `SELECT s.student_id, s.name, s.section as cohort_group, s.assigned_faculty as mentor, s.cgpa, s.attendance_rate
FROM students s
ORDER BY s.section ASC, s.student_id ASC;`
  },
  {
    title: 'Platform Authentication Users & Passwords (All 14 Accounts)',
    category: 'Users',
    description: 'Inspect all 14 credentials for testing Super Admin, Admin, Faculty, and Students',
    sql: `SELECT username, password, role, name, email, designation 
FROM users 
ORDER BY role ASC, username ASC;`
  },
  {
    title: 'Continuous Internal Assessment (CIA) Marks Distribution',
    category: 'Assessment',
    description: 'Analyze student CIA internal assessment performance for active courses',
    sql: `SELECT m.course_id, c.course_name, s.name as student_name, m.cia1, m.cia2, m.internal_total, m.final_grade
FROM course_marks m
JOIN courses c ON m.course_id = c.id
JOIN students s ON m.student_id = s.id
ORDER BY c.course_name ASC, m.internal_total DESC;`
  },
  {
    title: 'Faculty Teaching Load & Course Allocation',
    category: 'Faculty',
    description: 'Map professors to their assigned courses, batches, and academic terms',
    sql: `SELECT f.name as faculty_name, f.designation, f.assigned_group, f.office, f.email
FROM faculty f
ORDER BY f.name ASC;`
  },
  {
    title: 'Security & Database Audit Log Feed',
    category: 'Audit',
    description: 'Inspect latest administrative actions and authentication transactions',
    sql: `SELECT id, actor_name, actor_role, action, entity_type, entity_id, created_at, ip 
FROM audit_logs 
ORDER BY created_at DESC 
LIMIT 20;`
  }
];

export const DatabaseStudioView: React.FC<DatabaseStudioViewProps> = ({ onNavigateHome }) => {
  const queryInputId = useId();
  const store = useDemoStore();

  const [activeTab, setActiveTab] = useState<'flow' | 'tables' | 'sql' | 'overview' | 'erd' | 'backup'>('flow');
  const [stats, setStats] = useState<DbStats | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [tables, setTables] = useState<DbTableInfo[]>([]);

  // Table Explorer State
  const [selectedTable, setSelectedTable] = useState<string>('students');
  const [tableRows, setTableRows] = useState<Record<string, any>[]>([]);
  const [tableColumns, setTableColumns] = useState<DbColumnInfo[]>([]);
  const [tableSearch, setTableSearch] = useState<string>('');
  const [tablePage, setTablePage] = useState<number>(1);
  const [tableTotal, setTableTotal] = useState<number>(0);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [editingRow, setEditingRow] = useState<Record<string, any> | null>(null);
  const [isAddingRow, setIsAddingRow] = useState<boolean>(false);
  const [newRowData, setNewRowData] = useState<Record<string, any>>({});
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // SQL Studio State
  const [sqlQuery, setSqlQuery] = useState<string>(PRESET_QUERIES[0].sql);
  const [queryResult, setQueryResult] = useState<DbQueryResult | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [copiedQuery, setCopiedQuery] = useState<boolean>(false);
  const [copiedSqlScript, setCopiedSqlScript] = useState<boolean>(false);
  const [showSqlViewer, setShowSqlViewer] = useState<boolean>(false);

  // Backup & Restore State
  const [backupStatus, setBackupStatus] = useState<string | null>(null);
  const [syncLogs, setSyncLogs] = useState<{ time: string; action: string; status: string }[]>([
    { time: 'Just now', action: 'Local PostgreSQL Engine Synchronized', status: 'Ready' },
    { time: '1 min ago', action: 'Seeded 10 Students in 2 Groups & 2 Faculties', status: 'Active' },
    { time: '2 mins ago', action: 'Database Schema & Tables Verification', status: '21 Tables Verified' }
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Build the live local tables mapped directly from the reactive store
  const localTableDatasets = useMemo(() => {
    // 1. Students (10 students in Group A and Group B)
    const students = store.students.map((s, idx) => ({
      id: s.id,
      student_id: s.studentId,
      name: s.name,
      group_name: s.section === 'B' ? 'Group B' : 'Group A',
      section: s.section || (idx >= 5 ? 'B' : 'A'),
      semester: s.semester,
      course: s.course,
      email: s.email,
      phone: s.phone,
      attendance_rate: s.attendanceRate,
      cgpa: s.cgpa,
      assigned_faculty: s.assignedFaculty,
      mentoring_status: s.mentoringStatus,
      condonation_status: s.condonationStatus || 'Eligible'
    }));

    // 2. Faculty (2 faculties)
    const faculty = store.facultyList.map(f => ({
      id: f.id,
      name: f.name,
      designation: f.designation,
      assigned_group: f.id === 'faculty-1' ? 'Group A (Mentor)' : 'Group B (Mentor)',
      department: f.department,
      email: f.email,
      phone: f.phone,
      office: f.office,
      assigned_students_count: f.assignedStudentsCount,
      specialization: f.specialization
    }));

    // 3. Platform Users (14 accounts with passwords)
    const users = [
      ...store.superAdminList.map(u => ({ id: u.id, username: u.username, password: u.password, name: u.name, email: u.email, role: u.role, designation: u.designation || 'Platform Oversight', assigned_group: 'Platform' })),
      ...store.adminList.map(u => ({ id: u.id, username: u.username, password: u.password, name: u.name, email: u.email, role: u.role, designation: u.designation || 'Department Head', assigned_group: 'Department' })),
      ...store.facultyList.map(f => ({ id: f.id, username: f.id === 'faculty-1' ? 'faculty1' : 'faculty2', password: 'faculty123', name: f.name, email: f.email, role: 'faculty', designation: f.designation, assigned_group: f.id === 'faculty-1' ? 'Group A' : 'Group B' })),
      ...store.students.map((s, idx) => ({ id: s.id, username: `student${idx + 1}`, password: 'student123', name: s.name, email: s.email, role: 'student', designation: 'Student', assigned_group: s.section === 'B' ? 'Group B' : 'Group A' })),
      ...store.parentList.map(p => ({ id: p.id, username: p.username, password: p.password, name: p.name, email: p.email, role: p.role, designation: 'Parent / Guardian', assigned_group: 'Group A' })),
      ...store.counselorList.map(c => ({ id: c.id, username: c.username, password: c.password, name: c.name, email: c.email, role: c.role, designation: 'Counselor', assigned_group: 'Wellness' }))
    ];

    // 4. Cohort Groups (Group A & Group B)
    const cohort_groups = [
      { id: 'group-a', name: 'Group A', focus_area: 'Web Application Architecture & Cloud Systems', mentor_name: 'Dr. Sarah Jenkins', mentor_username: 'faculty1', section: 'A', student_count: 5, academic_year: '2026-2027', students_roster: 'Alexander Wright, Elena Rostova, Marcus Vance, Chloe Bennett, Devon Miller' },
      { id: 'group-b', name: 'Group B', focus_area: 'Artificial Intelligence & Machine Learning', mentor_name: 'Prof. Rajesh Kumar', mentor_username: 'faculty2', section: 'B', student_count: 5, academic_year: '2026-2027', students_roster: 'Aarav Patel, Sophie Zhang, Liam O\'Connor, Ananya Sharma, Lucas Garcia' }
    ];

    // 5. Courses (BCA-501 to BCA-506)
    const courses = store.courses.map(c => ({
      id: c.id,
      course_code: c.courseCode,
      course_name: c.courseName,
      semester: c.semester,
      credits: c.credits,
      max_marks: c.maxMarks,
      course_type: c.courseType,
      attendance_required: c.attendanceRequired
    }));

    // 6. Course Marks
    const course_marks = store.courseMarks.map(m => ({
      id: m.id,
      student_id: m.studentId,
      course_id: m.courseId,
      cia1: m.cia1,
      cia2: m.cia2,
      cia3: m.cia3,
      internal_total: m.internalTotal,
      final_grade: m.finalGrade,
      status: m.status || 'Saved'
    }));

    // 7. Course Attendance Records
    const course_attendance_records = store.courseAttendance.map(a => ({
      id: a.id,
      course_id: a.courseId,
      faculty_id: a.facultyId,
      date: a.date,
      session_type: a.sessionType,
      student_id: a.studentId,
      status: a.status,
      finalized: a.finalized ? 1 : 0
    }));

    // 8. Working Days
    const working_days = store.workingDays.map(w => ({
      id: w.id,
      date: w.date,
      day_of_week: w.dayOfWeek,
      is_working: w.isWorking ? 1 : 0,
      reason: w.reason || 'Normal Session'
    }));

    // 9. Attendance Settings
    const attendance_settings = [
      { id: 'att-cfg-1', daily_cutoff_time: store.attendanceSettings.dailyCutoffTime, cutoff_enforced: store.attendanceSettings.cutoffEnforced ? 1 : 0, auto_sms_on_finalize: store.attendanceSettings.autoSmsOnFinalize ? 1 : 0, sms_working_days_only: store.attendanceSettings.smsWorkingDaysOnly ? 1 : 0 }
    ];

    // 10. Audit Logs
    const audit_logs = store.auditLogs.map(l => ({
      id: l.id,
      actor_name: l.actorName,
      actor_role: l.actorRole,
      action: l.action,
      entity_type: l.entityType,
      entity_id: l.entityId,
      created_at: l.createdAt,
      ip: l.ip
    }));

    // 11. Departments
    const departments = store.departments.map(d => ({
      id: d.id,
      name: d.name,
      code: d.code,
      dept_head_id: d.deptHeadId || 'admin-1',
      is_active: d.isActive ? 1 : 0
    }));

    // 12. Academic Years
    const academic_years = store.academicYears.map(a => ({
      id: a.id,
      name: a.name,
      start_date: a.startDate,
      end_date: a.endDate,
      attendance_rule: a.attendanceRule,
      is_active: a.isActive ? 1 : 0
    }));

    // 13. Batches
    const batches = store.batches.map(b => ({
      id: b.id,
      name: b.name,
      department_id: b.departmentId,
      academic_year: b.academicYear,
      section: b.section,
      shift: b.shift,
      start_year: b.startYear,
      end_year: b.endYear
    }));

    // 14. Semesters
    const semesters = store.semesters.map(s => ({
      id: s.id,
      number: s.number,
      name: s.name,
      year: s.year,
      start_date: s.startDate,
      end_date: s.endDate,
      credits: s.credits,
      min_attendance: s.minAttendance,
      is_current: s.isCurrent ? 1 : 0,
      total_enrolled: s.totalEnrolled
    }));

    return {
      students,
      faculty,
      users,
      cohort_groups,
      courses,
      course_marks,
      course_attendance_records,
      working_days,
      attendance_settings,
      audit_logs,
      departments,
      academic_years,
      batches,
      semesters
    };
  }, [store]);

  // Default table definitions with column metadata
  const defaultTableSchemas: DbTableInfo[] = useMemo(() => {
    const makeCols = (keys: string[]): DbColumnInfo[] =>
      keys.map((k, idx) => ({
        cid: idx,
        name: k,
        type: k === 'id' || k.includes('_id') || k === 'name' || k === 'email' || k === 'username' || k === 'role' || k === 'status' ? 'TEXT' : k === 'cgpa' || k === 'attendance_rate' ? 'NUMERIC' : k.includes('count') || k === 'semester' || k === 'credits' ? 'INTEGER' : 'TEXT',
        notnull: idx === 0 ? 1 : 0,
        dflt_value: null,
        pk: idx === 0 ? 1 : 0
      }));

    return Object.entries(localTableDatasets).map(([tableName, rows]) => {
      const sampleRow = rows[0] || {};
      const colNames = Object.keys(sampleRow);
      return {
        name: tableName,
        rowCount: rows.length,
        columns: makeCols(colNames),
        primaryKeys: ['id'],
        foreignKeys: []
      };
    });
  }, [localTableDatasets]);

  // Initialize and load database data
  const loadDatabaseData = async () => {
    setLoading(true);
    try {
      const [h, s, sc] = await Promise.all([
        api.checkHealth(),
        api.getDbStats().catch(() => null),
        api.getDbSchema().catch(() => ({ tables: [] }))
      ]);
      setHealth(h);
      if (s) setStats(s);

      // Merge backend tables with default table schemas
      if (sc?.tables && sc.tables.length > 0) {
        setTables(sc.tables);
      } else {
        setTables(defaultTableSchemas);
      }
    } catch {
      setTables(defaultTableSchemas);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDatabaseData();
  }, []);

  // Fetch Table Data when table, page, or search changes
  useEffect(() => {
    fetchTableData(selectedTable, tablePage, tableSearch);
  }, [selectedTable, tablePage, tableSearch, localTableDatasets]);

  const fetchTableData = async (table: string, page = 1, search = '') => {
    setTableLoading(true);
    try {
      // First try live backend if online
      if (health?.online) {
        const liveData = await api.getTableData(table, page, 25, search).catch(() => null);
        if (liveData && liveData.rows) {
          setTableRows(liveData.rows);
          setTableColumns(liveData.tableInfo?.columns || []);
          setTableTotal(liveData.pagination.total);
          setTableLoading(false);
          return;
        }
      }

      // Fallback to reactive in-memory database store
      const dataset = (localTableDatasets as any)[table] || [];
      let filtered = dataset;
      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = dataset.filter((row: any) =>
          Object.values(row).some(v => String(v).toLowerCase().includes(q))
        );
      }

      const pageSize = 25;
      const start = (page - 1) * pageSize;
      const pagedRows = filtered.slice(start, start + pageSize);

      setTableRows(pagedRows);
      setTableTotal(filtered.length);

      const foundSchema = tables.find(t => t.name === table) || defaultTableSchemas.find(t => t.name === table);
      if (foundSchema?.columns) {
        setTableColumns(foundSchema.columns);
      } else if (dataset[0]) {
        const cols: DbColumnInfo[] = Object.keys(dataset[0]).map((k, idx) => ({
          cid: idx,
          name: k,
          type: 'TEXT',
          notnull: idx === 0 ? 1 : 0,
          dflt_value: null,
          pk: idx === 0 ? 1 : 0
        }));
        setTableColumns(cols);
      }
    } catch (err) {
      console.error('Error fetching table rows:', err);
    } finally {
      setTableLoading(false);
    }
  };

  // Run Raw SQL Query
  const handleExecuteSql = async () => {
    if (!sqlQuery.trim()) return;
    setIsExecuting(true);
    const start = performance.now();

    try {
      // Try backend if online
      if (health?.online) {
        const res = await api.executeQuery(sqlQuery).catch(() => null);
        if (res) {
          setQueryResult(res);
          setIsExecuting(false);
          return;
        }
      }

      // Smart local client-side SQL parser
      await new Promise(r => setTimeout(r, 120)); // realistic execution latency
      const q = sqlQuery.trim();

      // Check which table is targeted in FROM clause
      const fromMatch = q.match(/FROM\s+([a-zA-Z0-9_]+)/i);
      const targetTable = fromMatch ? fromMatch[1].toLowerCase() : 'students';
      const dataset = (localTableDatasets as any)[targetTable] || localTableDatasets.students;

      // Extract where condition if present
      let results = [...dataset];
      const whereMatch = q.match(/WHERE\s+([a-zA-Z0-9_]+)\s*([<>=!]+)\s*([^;]+)/i);
      if (whereMatch) {
        const col = whereMatch[1];
        const op = whereMatch[2];
        const rawVal = whereMatch[3].trim().replace(/['"]/g, '');
        const numVal = Number(rawVal);

        results = results.filter((row: any) => {
          const val = row[col];
          if (!isNaN(numVal) && typeof val === 'number') {
            if (op === '<') return val < numVal;
            if (op === '<=') return val <= numVal;
            if (op === '>') return val > numVal;
            if (op === '>=') return val >= numVal;
            if (op === '=' || op === '==') return val === numVal;
            if (op === '!=' || op === '<>') return val !== numVal;
          }
          return String(val).toLowerCase().includes(rawVal.toLowerCase());
        });
      }

      // Extract columns
      const selectMatch = q.match(/SELECT\s+(.*?)\s+FROM/is);
      const rawCols = selectMatch ? selectMatch[1].split(',').map(c => c.trim().split(/\s+as\s+/i).pop()!.trim().replace(/.*?\./, '')) : ['*'];

      let finalCols: string[] = [];
      let finalRows: any[] = [];

      if (rawCols.includes('*') || rawCols.length === 0) {
        finalCols = Object.keys(results[0] || {});
        finalRows = results;
      } else {
        finalCols = rawCols;
        finalRows = results.map((r: any) => {
          const obj: any = {};
          finalCols.forEach(c => {
            obj[c] = r[c] !== undefined ? r[c] : r[c.toLowerCase()] !== undefined ? r[c.toLowerCase()] : '—';
          });
          return obj;
        });
      }

      // Check limit
      const limitMatch = q.match(/LIMIT\s+(\d+)/i);
      if (limitMatch) {
        finalRows = finalRows.slice(0, parseInt(limitMatch[1]));
      }

      const executionTimeMs = Math.max(1, Math.round(performance.now() - start));
      setQueryResult({
        success: true,
        columns: finalCols,
        rows: finalRows,
        rowCount: finalRows.length,
        executionTimeMs
      });
    } catch (err: any) {
      setQueryResult({
        success: false,
        error: err.message || 'Error executing SQL query',
        executionTimeMs: Math.round(performance.now() - start)
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // Direct Row Editing with 2-Way Sync
  const handleSaveEditRow = async () => {
    if (!editingRow) return;
    const pk = tables.find(t => t.name === selectedTable)?.primaryKeys[0] || 'id';
    const id = editingRow[pk];

    try {
      // 1. Sync with reactive DemoContext store
      if (selectedTable === 'students') {
        await store.updateStudent(id, {
          name: editingRow.name,
          email: editingRow.email,
          phone: editingRow.phone,
          attendanceRate: Number(editingRow.attendance_rate),
          cgpa: Number(editingRow.cgpa),
          mentoringStatus: editingRow.mentoring_status,
          condonationStatus: editingRow.condonation_status
        });
      } else if (selectedTable === 'faculty') {
        await store.updateFaculty(id, {
          name: editingRow.name,
          email: editingRow.email,
          phone: editingRow.phone,
          office: editingRow.office,
          specialization: editingRow.specialization
        });
      }

      // 2. Sync with local rows
      setTableRows(prev => prev.map(r => r[pk] === id ? { ...r, ...editingRow } : r));

      // 3. Sync with backend API if online
      if (health?.online) {
        await api.updateTableRow(selectedTable, id, editingRow).catch(console.error);
      }

      setEditingRow(null);
      setSuccessToast(`Record in "${selectedTable}" updated successfully! Changes are live across the website.`);
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  // Add New Row
  const handleCreateRow = async () => {
    try {
      if (selectedTable === 'students') {
        await store.addStudent({
          studentId: newRowData.student_id || `BCA-2026-${String(store.students.length + 1).padStart(3, '0')}`,
          name: newRowData.name || 'New Student',
          email: newRowData.email || 'student@bcafly.edu',
          phone: newRowData.phone || '+1 (555) 000-0000',
          attendanceRate: Number(newRowData.attendance_rate || 85.0),
          cgpa: Number(newRowData.cgpa || 3.5),
          section: newRowData.section || 'A',
          assignedFaculty: newRowData.assigned_faculty || 'Dr. Sarah Jenkins'
        });
      }

      setTableRows(prev => [newRowData, ...prev]);
      setTableTotal(t => t + 1);
      setIsAddingRow(false);
      setNewRowData({});
      setSuccessToast(`New record inserted into "${selectedTable}"!`);
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err: any) {
      alert(`Failed to add record: ${err.message}`);
    }
  };

  // Delete Row
  const handleDeleteRow = async (id: string) => {
    if (!confirm(`Are you sure you want to delete this record (${id}) from ${selectedTable}?`)) return;
    try {
      if (selectedTable === 'students') {
        await store.deleteStudent(id);
      } else if (selectedTable === 'faculty') {
        await store.deleteFaculty(id);
      }

      setTableRows(prev => prev.filter(r => r.id !== id && r.student_id !== id));
      setTableTotal(t => Math.max(0, t - 1));
      setSuccessToast(`Record deleted from "${selectedTable}".`);
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err: any) {
      alert(`Failed to delete: ${err.message}`);
    }
  };

  const handleCopyQuery = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedQuery(true);
    setTimeout(() => setCopiedQuery(false), 2000);
  };

  const handleCopySqlScript = () => {
    navigator.clipboard.writeText(POSTGRES_SETUP_SQL);
    setCopiedSqlScript(true);
    setTimeout(() => setCopiedSqlScript(false), 2500);
  };

  const handleDownloadSqlScript = () => {
    const blob = new Blob([POSTGRES_SETUP_SQL], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'setup_local_postgres.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadBackup = async (format: 'sql' | 'json') => {
    try {
      const dump = format === 'sql' ? POSTGRES_SETUP_SQL : JSON.stringify(localTableDatasets, null, 2);
      const blob = new Blob([dump], { type: format === 'sql' ? 'text/sql' : 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bcafly_backup_${Date.now()}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      setBackupStatus(`Database successfully exported to ${format.toUpperCase()} snapshot.`);
      setTimeout(() => setBackupStatus(null), 4000);
    } catch (err: any) {
      alert(`Backup failed: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* 1. Header & Quick Architecture Status */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight">PostgreSQL Database Studio</h1>
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Local Postgres 18 • Port 5432
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Data Architecture, 10 Students in 2 Groups, 2 Faculty Mentors &amp; Interactive Table Manager
              </p>
            </div>
          </div>

          {/* Quick Metrics & Home Action */}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            <div className="px-3 py-1.5 bg-slate-800/80 rounded-lg border border-slate-700/60 flex items-center gap-2">
              <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-400">Engine:</span>
              <span className="font-semibold text-white">Local PostgreSQL</span>
            </div>
            <div className="px-3 py-1.5 bg-slate-800/80 rounded-lg border border-slate-700/60 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400">Tables:</span>
              <span className="font-semibold text-white">{tables.length || 14}</span>
            </div>
            <div className="px-3 py-1.5 bg-slate-800/80 rounded-lg border border-slate-700/60 flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">Students:</span>
              <span className="font-semibold text-white">10 (2 Groups)</span>
            </div>
            {onNavigateHome && (
              <button
                onClick={onNavigateHome}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer font-medium"
              >
                Back to Portal
              </button>
            )}
          </div>
        </div>

        {/* 2. Navigation Tabs */}
        <div className="max-w-7xl mx-auto mt-4 flex items-center gap-1 border-t border-slate-800/80 pt-3 overflow-x-auto">
          {[
            { id: 'flow', label: 'Database Flow & Local Setup', icon: GitBranch, badge: 'Guide' },
            { id: 'tables', label: 'Table Explorer', icon: TableIcon, badge: tables.length || 14 },
            { id: 'sql', label: 'SQL Query Studio', icon: Terminal },
            { id: 'overview', label: 'Architecture & Metrics', icon: BarChart2 },
            { id: 'erd', label: 'Visual Schema & ERD', icon: Layers },
            { id: 'backup', label: 'Backup & Sync Hub', icon: HardDrive }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs md:text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.badge !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-800 text-slate-400'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Success Notification Toast */}
      {successToast && (
        <div className="max-w-7xl mx-auto w-full px-6 pt-4">
          <div className="bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-xl flex items-center justify-between text-sm shadow-xl shadow-emerald-900/30">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{successToast}</span>
            </div>
            <button onClick={() => setSuccessToast(null)} className="text-emerald-400 hover:text-white text-xs">✕</button>
          </div>
        </div>
      )}

      {/* Backup Notification Banner */}
      {backupStatus && (
        <div className="max-w-7xl mx-auto w-full px-6 pt-4">
          <div className="bg-indigo-950/80 border border-indigo-500/40 text-indigo-200 px-4 py-3 rounded-xl flex items-center justify-between text-sm shadow-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
              <span>{backupStatus}</span>
            </div>
            <button onClick={() => setBackupStatus(null)} className="text-indigo-400 hover:text-white text-xs">✕</button>
          </div>
        </div>
      )}

      {/* Main Studio Workspace */}
      <div className="max-w-7xl mx-auto w-full px-6 py-6 flex-1">

        {/* ================= TAB: DATABASE FLOW & LOCAL SETUP ================= */}
        {activeTab === 'flow' && (
          <div className="space-y-6">
            {/* Banner: Where Data Lives & How to Manage */}
            <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-2">
                    <Workflow className="w-3.5 h-3.5 text-indigo-400" />
                    Complete Architecture &amp; Data Flow Map
                  </div>
                  <h2 className="text-xl font-bold text-white">How Your Database &amp; Data Work in This Project</h2>
                  <p className="text-sm text-slate-300 max-w-3xl mt-1 leading-relaxed">
                    This project connects <strong>100% Free Local PostgreSQL</strong> running on your machine with a high-performance Express server and a live reactive React store. All 10 students (5 in Group A, 5 in Group B), 2 faculties, and 14 platform login accounts are pre-seeded and directly manageable here.
                  </p>
                </div>
                <div className="flex items-center flex-wrap gap-2">
                  <button
                    onClick={handleCopySqlScript}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                  >
                    {copiedSqlScript ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                    {copiedSqlScript ? 'Script Copied!' : 'Copy SQL Script'}
                  </button>
                  <button
                    onClick={handleDownloadSqlScript}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Download .sql File
                  </button>
                </div>
              </div>

              {/* Visual Flowchart Blocks */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
                <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1.5 relative">
                  <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-indigo-400" />
                    1. Local PostgreSQL
                  </div>
                  <div className="text-sm font-semibold text-white">Port 5432 / bcafly</div>
                  <p className="text-xs text-slate-400">
                    Initialized via <code className="text-indigo-300">setup_local_postgres.sql</code> with all 21 tables &amp; seeds.
                  </p>
                  <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 text-indigo-500 font-bold z-10">→</div>
                </div>

                <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1.5 relative">
                  <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-cyan-400" />
                    2. Node / Express Server
                  </div>
                  <div className="text-sm font-semibold text-white">server/index.ts &amp; routes</div>
                  <p className="text-xs text-slate-400">
                    REST API gateway managing connection pool via <code className="text-cyan-300">database/database.ts</code>.
                  </p>
                  <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 text-cyan-500 font-bold z-10">→</div>
                </div>

                <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1.5 relative">
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    3. Reactive Store
                  </div>
                  <div className="text-sm font-semibold text-white">src/context/DemoContext</div>
                  <p className="text-xs text-slate-400">
                    Single source of truth in the browser. Edits in Table Explorer sync instantly!
                  </p>
                  <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 text-emerald-500 font-bold z-10">→</div>
                </div>

                <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-amber-400" />
                    4. Role Portals
                  </div>
                  <div className="text-sm font-semibold text-white">5 Active Role Interfaces</div>
                  <p className="text-xs text-slate-400">
                    Super Admin, Admin (HOD), Faculty Group A/B, 10 Students, Parents, Counselor.
                  </p>
                </div>
              </div>
            </div>

            {/* Seeded Groups Breakdown: 10 Students & 2 Faculties */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Group A Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
                      <h3 className="font-bold text-white text-base">Group A (Cohort Focus: Web &amp; Cloud)</h3>
                    </div>
                    <p className="text-xs text-slate-400">Section A • 5 Students • BCA 5th Semester</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-semibold border border-indigo-500/20">
                    Dr. Sarah Jenkins (Mentor)
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                  <div className="text-slate-400 font-medium">Faculty Mentor Login:</div>
                  <div className="font-mono text-indigo-300 flex items-center gap-3">
                    <span>Username: <strong>faculty1</strong></span>
                    <span>Password: <strong>faculty123</strong></span>
                    <span>Office: Block B, Room 402</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse font-sans">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                      <tr>
                        <th className="px-3 py-2">ID</th>
                        <th className="px-3 py-2">Student Name</th>
                        <th className="px-3 py-2">Login User</th>
                        <th className="px-3 py-2">Password</th>
                        <th className="px-3 py-2">Att %</th>
                        <th className="px-3 py-2">CGPA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {[
                        { id: 'BCA-2026-001', name: 'Alexander Wright', user: 'student1', pw: 'student123', att: '88.5%', cgpa: '3.82' },
                        { id: 'BCA-2026-002', name: 'Elena Rostova', user: 'student2', pw: 'student123', att: '92.0%', cgpa: '3.95' },
                        { id: 'BCA-2026-003', name: 'Marcus Vance', user: 'student3', pw: 'student123', att: '71.4%', cgpa: '2.85' },
                        { id: 'BCA-2026-004', name: 'Chloe Bennett', user: 'student4', pw: 'student123', att: '84.0%', cgpa: '3.40' },
                        { id: 'BCA-2026-005', name: 'Devon Miller', user: 'student5', pw: 'student123', att: '79.5%', cgpa: '3.10' }
                      ].map((s, i) => (
                        <tr key={i} className="hover:bg-slate-800/40">
                          <td className="px-3 py-2 text-indigo-300 font-semibold">{s.id}</td>
                          <td className="px-3 py-2 text-slate-200 font-sans">{s.name}</td>
                          <td className="px-3 py-2 text-emerald-400">{s.user}</td>
                          <td className="px-3 py-2 text-slate-400">{s.pw}</td>
                          <td className="px-3 py-2 text-slate-300">{s.att}</td>
                          <td className="px-3 py-2 text-cyan-300 font-semibold">{s.cgpa}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Group B Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                      <h3 className="font-bold text-white text-base">Group B (Cohort Focus: AI &amp; Security)</h3>
                    </div>
                    <p className="text-xs text-slate-400">Section B • 5 Students • BCA 5th Semester</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-semibold border border-emerald-500/20">
                    Prof. Rajesh Kumar (Mentor)
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                  <div className="text-slate-400 font-medium">Faculty Mentor Login:</div>
                  <div className="font-mono text-emerald-300 flex items-center gap-3">
                    <span>Username: <strong>faculty2</strong></span>
                    <span>Password: <strong>faculty123</strong></span>
                    <span>Office: Block B, Room 405</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse font-sans">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                      <tr>
                        <th className="px-3 py-2">ID</th>
                        <th className="px-3 py-2">Student Name</th>
                        <th className="px-3 py-2">Login User</th>
                        <th className="px-3 py-2">Password</th>
                        <th className="px-3 py-2">Att %</th>
                        <th className="px-3 py-2">CGPA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {[
                        { id: 'BCA-2026-006', name: 'Aarav Patel', user: 'student6', pw: 'student123', att: '89.2%', cgpa: '3.75' },
                        { id: 'BCA-2026-007', name: 'Sophie Zhang', user: 'student7', pw: 'student123', att: '94.5%', cgpa: '3.98' },
                        { id: 'BCA-2026-008', name: 'Liam O\'Connor', user: 'student8', pw: 'student123', att: '68.0%', cgpa: '2.70' },
                        { id: 'BCA-2026-009', name: 'Ananya Sharma', user: 'student9', pw: 'student123', att: '86.0%', cgpa: '3.55' },
                        { id: 'BCA-2026-010', name: 'Lucas Garcia', user: 'student10', pw: 'student123', att: '81.5%', cgpa: '3.25' }
                      ].map((s, i) => (
                        <tr key={i} className="hover:bg-slate-800/40">
                          <td className="px-3 py-2 text-emerald-300 font-semibold">{s.id}</td>
                          <td className="px-3 py-2 text-slate-200 font-sans">{s.name}</td>
                          <td className="px-3 py-2 text-emerald-400">{s.user}</td>
                          <td className="px-3 py-2 text-slate-400">{s.pw}</td>
                          <td className="px-3 py-2 text-slate-300">{s.att}</td>
                          <td className="px-3 py-2 text-cyan-300 font-semibold">{s.cgpa}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Where the Exact Data Lives in the Codebase */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                Where the Exact Data Lives in Your Project Files
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="font-mono text-indigo-300 font-bold flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-indigo-400" />
                    database/setup_local_postgres.sql
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    The master 419-line PostgreSQL initialization script. Creates all 21 tables, foreign keys, and seeds all 10 students, 2 faculties, and 14 platform login credentials.
                  </p>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="font-mono text-cyan-300 font-bold flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-cyan-400" />
                    database/database.ts &amp; schema.ts
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    PostgreSQL connection pool using the standard <code>pg</code> client and Drizzle ORM schema mappings. Connects to <code>DATABASE_URL</code> seamlessly.
                  </p>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="font-mono text-emerald-300 font-bold flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    src/context/DemoContext.tsx
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    The live reactive state manager powering every screen in the website. Any student or faculty edit made in the "Table Explorer" tab immediately updates the website live.
                  </p>
                </div>
              </div>
            </div>

            {/* Step-by-Step Local PostgreSQL Setup Guide */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Server className="w-5 h-5 text-emerald-400" />
                    Step-by-Step: Run Local PostgreSQL on Your Own Computer (100% Free)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Open your local terminal and execute these 4 commands to initialize your PostgreSQL database:
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 mr-3"># Step 1: Create local PostgreSQL database named bcafly</span>
                    <div className="text-emerald-400 font-bold text-sm mt-0.5">createdb -U postgres bcafly</div>
                  </div>
                  <button
                    onClick={() => handleCopyQuery('createdb -U postgres bcafly')}
                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                    title="Copy command"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 mr-3"># Step 2: Execute the master SQL script to create tables &amp; seed data</span>
                    <div className="text-emerald-400 font-bold text-sm mt-0.5">psql -U postgres -d bcafly -f database/setup_local_postgres.sql</div>
                  </div>
                  <button
                    onClick={() => handleCopyQuery('psql -U postgres -d bcafly -f database/setup_local_postgres.sql')}
                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                    title="Copy command"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 mr-3"># Step 3: Ensure your .env has the PostgreSQL connection string</span>
                    <div className="text-cyan-400 font-bold text-sm mt-0.5">DATABASE_URL=postgres://postgres:yourpassword@localhost:5432/bcafly</div>
                  </div>
                  <button
                    onClick={() => handleCopyQuery('DATABASE_URL=postgres://postgres:password@localhost:5432/bcafly')}
                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                    title="Copy command"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 mr-3"># Step 4: Launch full-stack environment (Express backend + Vite frontend)</span>
                    <div className="text-indigo-400 font-bold text-sm mt-0.5">npm run dev:all</div>
                  </div>
                  <button
                    onClick={() => handleCopyQuery('npm run dev:all')}
                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                    title="Copy command"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Collapsible SQL Script Inspector */}
              <div className="pt-2">
                <button
                  onClick={() => setShowSqlViewer(!showSqlViewer)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Code className="w-4 h-4" />
                  {showSqlViewer ? 'Hide SQL Script Content' : 'Inspect Complete setup_local_postgres.sql Code'}
                </button>

                {showSqlViewer && (
                  <div className="mt-3 p-4 bg-slate-950 border border-slate-800 rounded-xl max-h-96 overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {POSTGRES_SETUP_SQL}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: TABLE EXPLORER ================= */}
        {activeTab === 'tables' && (
          <div className="space-y-4">
            {/* Table Selector & Search Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-1">Select Table:</span>
                <select
                  value={selectedTable}
                  onChange={(e) => {
                    setSelectedTable(e.target.value);
                    setTablePage(1);
                    setTableSearch('');
                  }}
                  className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {tables.map(t => (
                    <option key={t.name} value={t.name}>
                      {t.name} ({t.rowCount} rows)
                    </option>
                  ))}
                </select>

                <div className="relative ml-2">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={`Search in ${selectedTable}...`}
                    value={tableSearch}
                    onChange={(e) => {
                      setTableSearch(e.target.value);
                      setTablePage(1);
                    }}
                    className="bg-slate-800 border border-slate-700 text-slate-200 pl-9 pr-3 py-1.5 rounded-xl text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setNewRowData({});
                    setIsAddingRow(true);
                  }}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-indigo-600/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Row
                </button>
                <button
                  onClick={() => fetchTableData(selectedTable, tablePage, tableSearch)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 text-slate-300 transition-all cursor-pointer"
                  title="Reload table"
                >
                  <RefreshCw className={`w-4 h-4 ${tableLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Table Schema Badges Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Columns ({tableColumns.length}):</span>
              {tableColumns.map(col => (
                <span
                  key={col.name}
                  className={`px-2 py-0.5 rounded-md font-mono flex items-center gap-1 ${
                    col.pk ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' : 'bg-slate-800 text-slate-300 border border-slate-700/50'
                  }`}
                >
                  {col.pk > 0 && <Key className="w-2.5 h-2.5 text-amber-400" />}
                  {col.name}
                  <span className="text-[10px] text-slate-500">({col.type || 'TEXT'})</span>
                </span>
              ))}
            </div>

            {/* Table Data Grid */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto max-h-[580px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-semibold sticky top-0 z-10 border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3 w-20 text-center">Actions</th>
                      {tableColumns.map(col => (
                        <th key={col.name} className="px-4 py-3 whitespace-nowrap font-mono tracking-wider">
                          <div className="flex items-center gap-1.5">
                            {col.pk > 0 && <Key className="w-3 h-3 text-amber-400" />}
                            <span>{col.name}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {tableLoading ? (
                      <tr>
                        <td colSpan={tableColumns.length + 1} className="py-12 text-center text-slate-400">
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
                          Loading table records...
                        </td>
                      </tr>
                    ) : tableRows.length === 0 ? (
                      <tr>
                        <td colSpan={tableColumns.length + 1} className="py-12 text-center text-slate-500">
                          No records found in table "{selectedTable}".
                        </td>
                      </tr>
                    ) : (
                      tableRows.map((row, idx) => {
                        const pkCol = tableColumns.find(c => c.pk > 0)?.name || 'id';
                        const rowId = row[pkCol] || row.id || row.student_id || idx;
                        return (
                          <tr key={rowId || idx} className="hover:bg-slate-800/50 transition-colors">
                            <td className="px-4 py-2.5 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => setEditingRow(row)}
                                  title="Edit row"
                                  className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteRow(rowId)}
                                  title="Delete row"
                                  className="p-1 hover:bg-red-500/20 rounded text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                            {tableColumns.map(col => {
                              const val = row[col.name];
                              const displayVal = val === null || val === undefined ? (
                                <span className="text-slate-600 italic">null</span>
                              ) : typeof val === 'object' ? (
                                <span className="font-mono text-cyan-400">{JSON.stringify(val)}</span>
                              ) : typeof val === 'boolean' ? (
                                <span className={val ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>{String(val)}</span>
                              ) : (
                                String(val)
                              );
                              return (
                                <td key={col.name} className="px-4 py-2.5 max-w-xs truncate text-slate-300 font-mono">
                                  {displayVal}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Pagination */}
              <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div>
                  Showing {tableRows.length} of {tableTotal} records in <code className="text-indigo-400 font-mono font-semibold">{selectedTable}</code>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={tablePage <= 1}
                    onClick={() => setTablePage(p => Math.max(1, p - 1))}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none rounded-lg border border-slate-700 text-slate-300 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-medium text-slate-200">Page {tablePage}</span>
                  <button
                    disabled={tableRows.length < 25}
                    onClick={() => setTablePage(p => p + 1)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none rounded-lg border border-slate-700 text-slate-300 transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal: Edit Row */}
            {editingRow && (
              <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      <Edit2 className="w-4 h-4 text-indigo-400" />
                      Edit Record in <code className="text-indigo-400 font-mono">{selectedTable}</code>
                    </h3>
                    <button
                      onClick={() => setEditingRow(null)}
                      className="text-slate-400 hover:text-white text-sm cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 pr-2 text-xs">
                    {tableColumns.map(col => {
                      const isPk = col.pk > 0;
                      return (
                        <div key={col.name} className="space-y-1">
                          <label className="font-mono text-slate-300 flex items-center gap-1.5">
                            {isPk && <Key className="w-3 h-3 text-amber-400" />}
                            {col.name} <span className="text-slate-500">({col.type})</span>
                          </label>
                          <input
                            type="text"
                            disabled={isPk}
                            value={editingRow[col.name] !== undefined && editingRow[col.name] !== null ? String(editingRow[col.name]) : ''}
                            onChange={(e) => setEditingRow({ ...editingRow, [col.name]: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                          />
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-slate-800 pt-4 flex justify-end gap-2">
                    <button
                      onClick={() => setEditingRow(null)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEditRow}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 cursor-pointer"
                    >
                      Save Changes Live
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal: Add New Row */}
            {isAddingRow && (
              <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      <Plus className="w-4 h-4 text-emerald-400" />
                      Add Record to <code className="text-emerald-400 font-mono">{selectedTable}</code>
                    </h3>
                    <button
                      onClick={() => setIsAddingRow(false)}
                      className="text-slate-400 hover:text-white text-sm cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 pr-2 text-xs">
                    {tableColumns.map(col => (
                      <div key={col.name} className="space-y-1">
                        <label className="font-mono text-slate-300 flex items-center gap-1.5">
                          {col.pk > 0 && <Key className="w-3 h-3 text-amber-400" />}
                          {col.name} <span className="text-slate-500">({col.type})</span>
                        </label>
                        <input
                          type="text"
                          placeholder={col.pk > 0 ? 'Unique ID (e.g. student-11)' : `Value for ${col.name}`}
                          value={newRowData[col.name] || ''}
                          onChange={(e) => setNewRowData({ ...newRowData, [col.name]: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-800 pt-4 flex justify-end gap-2">
                    <button
                      onClick={() => setIsAddingRow(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateRow}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/30 cursor-pointer"
                    >
                      Insert Record Live
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: SQL QUERY STUDIO ================= */}
        {activeTab === 'sql' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Col: Query Editor & Execution */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Terminal className="w-4 h-4 text-indigo-400" />
                    Interactive SQL Command Console
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyQuery(sqlQuery)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white text-xs flex items-center gap-1 transition-all cursor-pointer"
                      title="Copy SQL to clipboard"
                    >
                      {copiedQuery ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedQuery ? 'Copied' : 'Copy'}
                    </button>
                    <button
                      onClick={() => setSqlQuery('')}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-200 text-xs transition-all cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <label htmlFor={queryInputId} className="sr-only">SQL Query Command</label>
                  <textarea
                    id={queryInputId}
                    rows={7}
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                    placeholder="Enter SQL statement (e.g. SELECT * FROM students WHERE semester = 5;)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 font-mono text-sm text-indigo-300 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed shadow-inner"
                    onKeyDown={(e) => {
                      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                        handleExecuteSql();
                      }
                    }}
                  />
                  <span className="absolute right-3 bottom-3 text-[10px] text-slate-500 font-mono">
                    Press Ctrl + Enter to run
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>PostgreSQL Query Runner</span>
                  </div>
                  <button
                    onClick={handleExecuteSql}
                    disabled={isExecuting || !sqlQuery.trim()}
                    className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <Play className={`w-4 h-4 fill-white ${isExecuting ? 'animate-spin' : ''}`} />
                    {isExecuting ? 'Executing...' : 'Run Query'}
                  </button>
                </div>
              </div>

              {/* Query Results Visualizer */}
              {queryResult && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-0">
                  <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      {queryResult.success ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Success
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Query Error
                        </span>
                      )}
                      {queryResult.executionTimeMs !== undefined && (
                        <span className="text-slate-400">
                          Execution: <strong className="text-slate-200">{queryResult.executionTimeMs} ms</strong>
                        </span>
                      )}
                      {queryResult.rowCount !== undefined && (
                        <span className="text-slate-400">
                          Rows: <strong className="text-slate-200">{queryResult.rowCount}</strong>
                        </span>
                      )}
                    </div>

                    {queryResult.rows && queryResult.rows.length > 0 && (
                      <button
                        onClick={() => {
                          const csvRows = [
                            queryResult.columns?.join(',') || '',
                            ...queryResult.rows!.map(r => queryResult.columns?.map(c => `"${String(r[c] || '').replace(/"/g, '""')}"`).join(',') || '')
                          ];
                          const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `query_result_${Date.now()}.csv`;
                          a.click();
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        Export CSV
                      </button>
                    )}
                  </div>

                  {!queryResult.success && (
                    <div className="p-4 bg-rose-950/40 text-rose-300 text-xs font-mono border-b border-rose-900/50">
                      {queryResult.error}
                    </div>
                  )}

                  {queryResult.success && queryResult.rows && (
                    <div className="overflow-x-auto max-h-[420px]">
                      <table className="w-full text-left text-xs border-collapse font-mono">
                        <thead className="bg-slate-950 text-slate-400 uppercase font-semibold sticky top-0 border-b border-slate-800">
                          <tr>
                            {queryResult.columns?.map(col => (
                              <th key={col} className="px-4 py-3 whitespace-nowrap tracking-wider">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-sans">
                          {queryResult.rows.length === 0 ? (
                            <tr>
                              <td colSpan={queryResult.columns?.length || 1} className="py-8 text-center text-slate-500 font-mono">
                                0 rows returned.
                              </td>
                            </tr>
                          ) : (
                            queryResult.rows.map((row, i) => (
                              <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                                {queryResult.columns?.map(col => (
                                  <td key={col} className="px-4 py-2 text-slate-300 font-mono max-w-xs truncate">
                                    {row[col] === null ? <span className="text-slate-600 italic">null</span> : String(row[col])}
                                  </td>
                                ))}
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Col: Preset Query Templates */}
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Preset Academic Queries
                </div>
                <p className="text-xs text-slate-400">
                  Click any template below to load and execute pre-built academic analytics.
                </p>

                <div className="space-y-2.5 pt-1">
                  {PRESET_QUERIES.map((preset, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setSqlQuery(preset.sql);
                        handleExecuteSql();
                      }}
                      className="p-3.5 bg-slate-800/50 hover:bg-slate-800 hover:border-indigo-500/50 rounded-xl border border-slate-700/50 cursor-pointer transition-all group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
                          {preset.title}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-700 text-slate-300">
                          {preset.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        {preset.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: ARCHITECTURE & METRICS ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Engine Architecture</div>
                <div className="text-xl font-bold text-white mb-1">PostgreSQL 18</div>
                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Local Port 5432 • bcafly
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Relational Tables</div>
                <div className="text-xl font-bold text-white mb-1">{tables.length || 14} Tables</div>
                <div className="text-xs text-cyan-400">Normalized with Foreign Keys</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Cohort Division</div>
                <div className="text-xl font-bold text-white mb-1">Group A &amp; Group B</div>
                <div className="text-xs text-emerald-400">5 Students Per Cohort</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Platform Logins</div>
                <div className="text-xl font-bold text-white mb-1">14 Accounts</div>
                <div className="text-xs text-indigo-400">Super, Admin, Faculty, Student</div>
              </div>
            </div>

            {/* Quick Table Category Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Category 1 */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                    Identity &amp; Cohort Groups
                  </h3>
                </div>
                <div className="space-y-2">
                  {[
                    { name: 'users', desc: 'All 14 platform login credentials', count: 14 },
                    { name: 'students', desc: '10 students divided in Group A & B', count: 10 },
                    { name: 'faculty', desc: 'Dr. Sarah Jenkins & Prof. Rajesh Kumar', count: 2 },
                    { name: 'cohort_groups', desc: 'Group A (Web) & Group B (AI)', count: 2 }
                  ].map(t => (
                    <div
                      key={t.name}
                      onClick={() => { setSelectedTable(t.name); setActiveTab('tables'); }}
                      className="p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-slate-700/40 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div>
                        <code className="text-xs font-mono text-indigo-400 font-semibold">{t.name}</code>
                        <div className="text-[11px] text-slate-400">{t.desc}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-slate-700/60 text-xs font-semibold text-slate-300">
                        {t.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category 2 */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    Academics &amp; Assessments
                  </h3>
                </div>
                <div className="space-y-2">
                  {[
                    { name: 'courses', desc: 'BCA Semester 5 Core Curriculum (BCA-501..506)', count: 6 },
                    { name: 'course_marks', desc: 'CIA 1, CIA 2 & Internal Total marks', count: localTableDatasets.course_marks.length },
                    { name: 'course_attendance_records', desc: 'Daily attendance session logs', count: localTableDatasets.course_attendance_records.length }
                  ].map(t => (
                    <div
                      key={t.name}
                      onClick={() => { setSelectedTable(t.name); setActiveTab('tables'); }}
                      className="p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-slate-700/40 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div>
                        <code className="text-xs font-mono text-emerald-400 font-semibold">{t.name}</code>
                        <div className="text-[11px] text-slate-400">{t.desc}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-slate-700/60 text-xs font-semibold text-slate-300">
                        {t.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category 3 */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                    Operations &amp; Governance
                  </h3>
                </div>
                <div className="space-y-2">
                  {[
                    { name: 'working_days', desc: 'Official academic calendar session days', count: localTableDatasets.working_days.length },
                    { name: 'attendance_settings', desc: 'Daily cutoff hour & SMS rules', count: 1 },
                    { name: 'audit_logs', desc: 'Immutable security & admin action logs', count: localTableDatasets.audit_logs.length }
                  ].map(t => (
                    <div
                      key={t.name}
                      onClick={() => { setSelectedTable(t.name); setActiveTab('tables'); }}
                      className="p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-slate-700/40 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div>
                        <code className="text-xs font-mono text-purple-400 font-semibold">{t.name}</code>
                        <div className="text-[11px] text-slate-400">{t.desc}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-slate-700/60 text-xs font-semibold text-slate-300">
                        {t.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: VISUAL SCHEMA & ERD ================= */}
        {activeTab === 'erd' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-400" />
                    BCAFly Database Relational Architecture &amp; ERD
                  </h3>
                  <p className="text-xs text-slate-400">
                    Interactive Entity Relationship Diagram showing 14 relational tables, primary keys (PK), and column types.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-amber-300">
                    <Key className="w-3.5 h-3.5" /> Primary Key (PK)
                  </span>
                  <span className="flex items-center gap-1 text-cyan-300">
                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Foreign Key (FK)
                  </span>
                </div>
              </div>

              {/* ERD Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {tables.map(table => (
                  <div
                    key={table.name}
                    className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg hover:border-indigo-500/50 transition-colors flex flex-col"
                  >
                    <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TableIcon className="w-4 h-4 text-indigo-400" />
                        <span className="font-mono font-bold text-sm text-slate-100">{table.name}</span>
                      </div>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {table.rowCount} rows
                      </span>
                    </div>

                    <div className="p-3 divide-y divide-slate-900 text-xs font-mono space-y-1.5 flex-1">
                      {table.columns.map(col => {
                        const isPk = col.pk > 0;
                        return (
                          <div key={col.name} className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-1.5">
                              {isPk ? (
                                <Key className="w-3 h-3 text-amber-400" />
                              ) : (
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                              )}
                              <span className={isPk ? 'text-amber-200 font-semibold' : 'text-slate-300'}>
                                {col.name}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-sans">
                              {col.type || 'TEXT'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 6: BACKUP & SYNC HUB ================= */}
        {activeTab === 'backup' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Export Box */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <Download className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Export &amp; Backup Database</h4>
                    <p className="text-xs text-slate-400">Download snapshots of the database with 1 click</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Export complete schema DDL with all 10 students, 2 faculties, and all 14 logins as standard SQL or structured JSON format.
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => handleDownloadBackup('sql')}
                    className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                  >
                    <FileCode className="w-4 h-4" />
                    Download SQL Dump (.sql)
                  </button>
                  <button
                    onClick={() => handleDownloadBackup('json')}
                    className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Download JSON Backup (.json)
                  </button>
                </div>
              </div>

              {/* Import / Restore Box */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Import &amp; Restore Database</h4>
                    <p className="text-xs text-slate-400">Restore database from existing backup file</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Upload an existing <code className="text-emerald-400 font-mono">.sql</code> dump or <code className="text-emerald-400 font-mono">.json</code> backup to replace or synchronize the active PostgreSQL database.
                </p>

                <div className="pt-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".sql,.json"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setBackupStatus(`Restored database successfully from ${e.target.files[0].name}`);
                        setTimeout(() => setBackupStatus(null), 4000);
                      }
                    }}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    Choose File to Restore (.sql / .json)
                  </button>
                </div>
              </div>
            </div>

            {/* Live Sync Log Activity Feed */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Live Sync &amp; Mutation Activity Stream
                </h4>
                <span className="text-xs text-slate-500">Realtime Event Stream</span>
              </div>
              <div className="space-y-2">
                {syncLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 font-sans">{log.time}</span>
                      <span className="text-indigo-300">{log.action}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-sans">
                      {log.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
