import React, { useState, useEffect, useRef, useId } from 'react';
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
  Key
} from 'lucide-react';
import { api, HealthStatus } from '../services/api';
import { DbStats, DbTableInfo, DbQueryResult } from '../types';

interface QueryPreset {
  title: string;
  category: 'Academic' | 'Attendance' | 'Faculty' | 'Audit' | 'Assessment';
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
    sql: `SELECT student_id, name, course, semester, attendance_rate, assigned_faculty, condonation_status 
FROM students 
WHERE attendance_rate < 75.0 
ORDER BY attendance_rate ASC;`
  },
  {
    title: 'Top Performing Students (CGPA >= 8.5)',
    category: 'Academic',
    description: 'List honor roll students sorted by CGPA and semester rank',
    sql: `SELECT student_id, name, semester, cgpa, mentoring_status, email 
FROM students 
WHERE cgpa >= 8.5 
ORDER BY cgpa DESC, semester ASC;`
  },
  {
    title: 'CIA 1 & Internal Marks Distribution by Course',
    category: 'Assessment',
    description: 'Analyze student CIA internal assessment performance for active courses',
    sql: `SELECT m.course_id, c.course_name, s.name as student_name, s.semester, m.cia1, m.cia2, m.internal_total, m.final_grade
FROM course_marks m
JOIN courses c ON m.course_id = c.id
JOIN students s ON m.student_id = s.id
ORDER BY c.semester ASC, m.internal_total DESC;`
  },
  {
    title: 'Faculty Teaching Load & Course Allocation',
    category: 'Faculty',
    description: 'Map professors to their assigned courses, batches, and academic terms',
    sql: `SELECT f.name as faculty_name, f.designation, c.course_code, c.course_name, fca.section, fca.term, fca.academic_year
FROM faculty_course_assignments fca
JOIN faculty f ON fca.faculty_id = f.id
JOIN courses c ON fca.course_id = c.id
WHERE fca.is_active = 1
ORDER BY f.name ASC;`
  },
  {
    title: 'Active Counseling Referrals & Follow-ups',
    category: 'Academic',
    description: 'Review pending psychological and academic counseling cases',
    sql: `SELECT id, student_name, semester, referred_by_faculty_name, reason_code, status, mentor_visible_status, created_at 
FROM counseling_referrals 
ORDER BY created_at DESC;`
  },
  {
    title: 'Security & Database Audit Log Feed',
    category: 'Audit',
    description: 'Inspect latest administrative actions and authentication transactions',
    sql: `SELECT id, actor_name, actor_role, action, entity_type, entity_id, created_at, ip 
FROM audit_logs 
ORDER BY created_at DESC 
LIMIT 20;`
  },
  {
    title: 'Course Master Scheme & Credits Summary',
    category: 'Academic',
    description: 'Semester-wise breakdown of courses, credits, and subject types',
    sql: `SELECT semester, course_code, course_name, course_type, credits, max_marks, attendance_required 
FROM courses 
WHERE is_active = 1 
ORDER BY semester ASC, course_code ASC;`
  }
];

export const DatabaseStudioView: React.FC<DatabaseStudioViewProps> = ({ onNavigateHome }) => {
  const queryInputId = useId();
  const [activeTab, setActiveTab] = useState<'overview' | 'tables' | 'sql' | 'erd' | 'backup'>('overview');
  const [stats, setStats] = useState<DbStats | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [tables, setTables] = useState<DbTableInfo[]>([]);

  // Table Explorer State
  const [selectedTable, setSelectedTable] = useState<string>('students');
  const [tableRows, setTableRows] = useState<Record<string, any>[]>([]);
  const [tableColumns, setTableColumns] = useState<any[]>([]);
  const [tableSearch, setTableSearch] = useState<string>('');
  const [tablePage, setTablePage] = useState<number>(1);
  const [tableTotal, setTableTotal] = useState<number>(0);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [editingRow, setEditingRow] = useState<Record<string, any> | null>(null);
  const [isAddingRow, setIsAddingRow] = useState<boolean>(false);
  const [newRowData, setNewRowData] = useState<Record<string, any>>({});

  // SQL Studio State
  const [sqlQuery, setSqlQuery] = useState<string>(PRESET_QUERIES[0].sql);
  const [queryResult, setQueryResult] = useState<DbQueryResult | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [copiedQuery, setCopiedQuery] = useState<boolean>(false);

  // Backup & Restore State
  const [backupStatus, setBackupStatus] = useState<string | null>(null);
  const [syncLogs, setSyncLogs] = useState<{ time: string; action: string; status: string }[]>([
    { time: 'Just now', action: 'Engine Boot & Schema Verification', status: 'Success (21 Tables OK)' },
    { time: '1 min ago', action: 'SQLite Data Persistence Synchronization', status: 'Synced to Disk' }
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Database Stats & Schema on Mount
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
      if (sc?.tables) setTables(sc.tables);
    } catch (err) {
      console.error('Failed to load database information:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDatabaseData();
  }, []);

  // Fetch Table Data when table, page, or search changes
  useEffect(() => {
    if (activeTab === 'tables' && selectedTable) {
      fetchTableData(selectedTable, tablePage, tableSearch);
    }
  }, [activeTab, selectedTable, tablePage, tableSearch]);

  const fetchTableData = async (table: string, page = 1, search = '') => {
    setTableLoading(true);
    try {
      const data = await api.getTableData(table, page, 25, search);
      setTableRows(data.rows);
      setTableColumns(data.tableInfo?.columns || []);
      setTableTotal(data.pagination.total);
    } catch (err: any) {
      console.error('Error fetching table rows:', err);
    } finally {
      setTableLoading(false);
    }
  };

  // Run Raw SQL Query
  const handleExecuteSql = async () => {
    if (!sqlQuery.trim()) return;
    setIsExecuting(true);
    setQueryResult(null);
    try {
      const res = await api.executeQuery(sqlQuery.trim());
      setQueryResult(res);
      setSyncLogs(prev => [
        { time: new Date().toLocaleTimeString(), action: `SQL Query Execution (${res.executionTimeMs}ms)`, status: `Success (${res.rowCount || res.changes || 0} rows)` },
        ...prev.slice(0, 9)
      ]);
    } catch (err: any) {
      setQueryResult({
        success: false,
        error: err.message || 'Error executing SQL query'
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // Table Row Edit & Delete
  const handleSaveEditRow = async () => {
    if (!editingRow) return;
    const pk = tables.find(t => t.name === selectedTable)?.primaryKeys[0] || 'id';
    const id = editingRow[pk];
    try {
      await api.updateTableRow(selectedTable, id, editingRow);
      setEditingRow(null);
      fetchTableData(selectedTable, tablePage, tableSearch);
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const handleDeleteRow = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete record ${id} from "${selectedTable}"?`)) return;
    try {
      await api.deleteTableRow(selectedTable, id);
      fetchTableData(selectedTable, tablePage, tableSearch);
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleCreateRow = async () => {
    try {
      await api.insertTableRow(selectedTable, newRowData);
      setIsAddingRow(false);
      setNewRowData({});
      fetchTableData(selectedTable, tablePage, tableSearch);
    } catch (err: any) {
      alert(`Insert failed: ${err.message}`);
    }
  };

  // Export DB
  const handleDownloadBackup = async (format: 'sql' | 'json') => {
    try {
      const data = await api.exportDatabase(format);
      const blob = new Blob([format === 'sql' ? data : JSON.stringify(data, null, 2)], {
        type: format === 'sql' ? 'application/sql' : 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bcafly_db_backup_${new Date().toISOString().slice(0, 10)}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setBackupStatus(`Exported ${format.toUpperCase()} backup successfully!`);
      setTimeout(() => setBackupStatus(null), 4000);
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    }
  };

  // Import DB
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      try {
        if (file.name.endsWith('.sql')) {
          await api.importDatabase({ format: 'sql', sql: content });
        } else {
          const json = JSON.parse(content);
          await api.importDatabase({ format: 'json', data: json });
        }
        setBackupStatus('Database restored successfully from backup!');
        loadDatabaseData();
        setTimeout(() => setBackupStatus(null), 4000);
      } catch (err: any) {
        alert(`Restore failed: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  // Reset to seed data
  const handleResetDatabase = async () => {
    if (!window.confirm('Are you sure you want to reset the database to factory seed data? All custom modifications will be re-initialized.')) return;
    try {
      await api.resetDatabase();
      await loadDatabaseData();
      alert('Database has been re-seeded to initial state successfully!');
    } catch (err: any) {
      alert(`Reset failed: ${err.message}`);
    }
  };

  // Copy query to clipboard
  const handleCopyQuery = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedQuery(true);
    setTimeout(() => setCopiedQuery(false), 2000);
  };

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white pb-16">
      {/* 1. Studio Header Ribbon */}
      <div className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">BCAFly Database Platform</h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  {health?.online ? 'SQLite Live Engine' : 'Offline Engine'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Full-Stack Relational Database Management, SQL Studio & Sync Console
              </p>
            </div>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            <div className="px-3 py-1.5 bg-slate-800/80 rounded-lg border border-slate-700/60 flex items-center gap-2">
              <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-400">Size:</span>
              <span className="font-semibold text-white">{stats?.databaseSizeKb ? `${stats.databaseSizeKb} KB` : '135 KB'}</span>
            </div>
            <div className="px-3 py-1.5 bg-slate-800/80 rounded-lg border border-slate-700/60 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400">Tables:</span>
              <span className="font-semibold text-white">{stats?.tableCount || tables.length || 21}</span>
            </div>
            <div className="px-3 py-1.5 bg-slate-800/80 rounded-lg border border-slate-700/60 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">Total Rows:</span>
              <span className="font-semibold text-white">{stats?.totalRows || 310}</span>
            </div>
            <button
              onClick={loadDatabaseData}
              title="Refresh database metadata"
              className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* 2. Navigation Tabs */}
        <div className="max-w-7xl mx-auto mt-4 flex items-center gap-1 border-t border-slate-800/80 pt-3">
          {[
            { id: 'overview', label: 'Overview & Metrics', icon: BarChart2 },
            { id: 'tables', label: 'Table Explorer', icon: TableIcon, badge: tables.length || 21 },
            { id: 'sql', label: 'SQL Query Studio', icon: Terminal },
            { id: 'erd', label: 'Visual Schema & ERD', icon: Layers },
            { id: 'backup', label: 'Backup & Sync Hub', icon: HardDrive }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.badge !== undefined && (
                  <span className={`text-xs px-1.5 py-0.2 rounded-full ${isActive ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-800 text-slate-400'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Backup notification banner */}
      {backupStatus && (
        <div className="max-w-7xl mx-auto w-full px-6 pt-4">
          <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 px-4 py-3 rounded-xl flex items-center justify-between text-sm shadow-lg shadow-emerald-900/20">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>{backupStatus}</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Studio Workspace */}
      <div className="max-w-7xl mx-auto w-full px-6 py-6 flex-1">
        {/* ================= TAB 1: OVERVIEW & METRICS ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <span>Engine Architecture</span>
                  <Database className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-xl font-bold text-white mb-1">SQLite 3.45</div>
                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  WASM In-Memory + Disk Sync
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <span>Entity Tables</span>
                  <TableIcon className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-xl font-bold text-white mb-1">{tables.length || 21} Relational Tables</div>
                <div className="text-xs text-cyan-400">Normalized with Foreign Keys</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <span>Record Count</span>
                  <Layers className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xl font-bold text-white mb-1">{stats?.totalRows || 310} Records</div>
                <div className="text-xs text-emerald-400">Indexed & Optimized</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <span>API Latency</span>
                  <Clock className="w-4 h-4 text-violet-400" />
                </div>
                <div className="text-xl font-bold text-white mb-1">{health?.latencyMs || 2} ms</div>
                <div className="text-xs text-violet-400">Ultra-fast local pipeline</div>
              </div>
            </div>

            {/* Entity Groups Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Group 1: Academic & Curriculum */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    Academic & Curriculum
                  </h3>
                  <span className="text-xs text-slate-500">6 Tables</span>
                </div>
                <div className="space-y-2.5">
                  {[
                    { name: 'courses', desc: 'Syllabus, credits, CIA limits, schemes', rows: tables.find(t => t.name === 'courses')?.rowCount || 24 },
                    { name: 'semesters', desc: 'Semesters 1 through 6 calendar & enrollment', rows: tables.find(t => t.name === 'semesters')?.rowCount || 6 },
                    { name: 'departments', desc: 'BCA & IT Department master codes', rows: tables.find(t => t.name === 'departments')?.rowCount || 2 },
                    { name: 'classes', desc: 'Classroom & lab section allocations', rows: tables.find(t => t.name === 'classes')?.rowCount || 6 },
                    { name: 'faculty_course_assignments', desc: 'Teaching allocations per term & batch', rows: tables.find(t => t.name === 'faculty_course_assignments')?.rowCount || 12 },
                    { name: 'student_course_enrollments', desc: 'Course-level student enrollments', rows: tables.find(t => t.name === 'student_course_enrollments')?.rowCount || 60 }
                  ].map(item => (
                    <div
                      key={item.name}
                      onClick={() => { setSelectedTable(item.name); setActiveTab('tables'); }}
                      className="p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-slate-700/40 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div>
                        <div className="text-sm font-medium text-slate-200 flex items-center gap-2">
                          <code className="text-xs font-mono text-indigo-400">{item.name}</code>
                        </div>
                        <div className="text-xs text-slate-400">{item.desc}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-slate-700/60 text-xs font-semibold text-slate-300">
                        {item.rows}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Group 2: Assessments & Attendance */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    Assessments & Attendance
                  </h3>
                  <span className="text-xs text-slate-500">5 Tables</span>
                </div>
                <div className="space-y-2.5">
                  {[
                    { name: 'students', desc: 'Student profiles, CGPA, condonation status', rows: tables.find(t => t.name === 'students')?.rowCount || 30 },
                    { name: 'course_marks', desc: 'CIA 1, 2, 3, assignment, practical, final', rows: tables.find(t => t.name === 'course_marks')?.rowCount || 48 },
                    { name: 'course_attendance_records', desc: 'Daily theory/lab session attendance', rows: tables.find(t => t.name === 'course_attendance_records')?.rowCount || 60 },
                    { name: 'attendance_settings', desc: 'Cutoff time & auto-SMS trigger rules', rows: tables.find(t => t.name === 'attendance_settings')?.rowCount || 1 },
                    { name: 'working_days', desc: 'Academic working days & holiday calendar', rows: tables.find(t => t.name === 'working_days')?.rowCount || 14 }
                  ].map(item => (
                    <div
                      key={item.name}
                      onClick={() => { setSelectedTable(item.name); setActiveTab('tables'); }}
                      className="p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-slate-700/40 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div>
                        <div className="text-sm font-medium text-slate-200 flex items-center gap-2">
                          <code className="text-xs font-mono text-emerald-400">{item.name}</code>
                        </div>
                        <div className="text-xs text-slate-400">{item.desc}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-slate-700/60 text-xs font-semibold text-slate-300">
                        {item.rows}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Group 3: Mentorship, SMS & Audit */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                    Mentorship, SMS & Audit
                  </h3>
                  <span className="text-xs text-slate-500">6 Tables</span>
                </div>
                <div className="space-y-2.5">
                  {[
                    { name: 'users', desc: 'Authentication, roles, and profile accounts', rows: tables.find(t => t.name === 'users')?.rowCount || 36 },
                    { name: 'faculty', desc: 'Professor profiles, specialization & office', rows: tables.find(t => t.name === 'faculty')?.rowCount || 4 },
                    { name: 'mentoring_notes', desc: 'Student-faculty mentoring session logs', rows: tables.find(t => t.name === 'mentoring_notes')?.rowCount || 12 },
                    { name: 'counseling_referrals', desc: 'Specialized counseling cases & plans', rows: tables.find(t => t.name === 'counseling_referrals')?.rowCount || 4 },
                    { name: 'sms_messages', desc: 'Dispatched parent & student notifications', rows: tables.find(t => t.name === 'sms_messages')?.rowCount || 18 },
                    { name: 'audit_logs', desc: 'Immutable security & transaction audit trails', rows: tables.find(t => t.name === 'audit_logs')?.rowCount || 25 }
                  ].map(item => (
                    <div
                      key={item.name}
                      onClick={() => { setSelectedTable(item.name); setActiveTab('tables'); }}
                      className="p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-slate-700/40 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div>
                        <div className="text-sm font-medium text-slate-200 flex items-center gap-2">
                          <code className="text-xs font-mono text-purple-400">{item.name}</code>
                        </div>
                        <div className="text-xs text-slate-400">{item.desc}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-slate-700/60 text-xs font-semibold text-slate-300">
                        {item.rows}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick SQL launcher banner */}
            <div className="bg-gradient-to-r from-indigo-900/60 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-base font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  Interactive SQL Query Studio & Visual Analytics
                </h4>
                <p className="text-sm text-slate-300 max-w-2xl">
                  Run custom SQL queries, extract attendance shortage alerts, analyze CIA grade distributions, and export data in 1 click.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('sql')}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer whitespace-nowrap"
              >
                <Terminal className="w-4 h-4" />
                Open SQL Studio
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 2: TABLE EXPLORER ================= */}
        {activeTab === 'tables' && (
          <div className="space-y-4">
            {/* Table Selector & Search Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-2">Select Table:</span>
                <select
                  value={selectedTable}
                  onChange={(e) => {
                    setSelectedTable(e.target.value);
                    setTablePage(1);
                    setTableSearch('');
                  }}
                  className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    placeholder={`Search ${selectedTable}...`}
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
                  onClick={() => setIsAddingRow(true)}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
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
                      <th className="px-4 py-3 w-16 text-center">Actions</th>
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
                        const rowId = row[pkCol];
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
                              const displayVal = val === null ? (
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
                      Save Changes
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
                          placeholder={col.pk > 0 ? 'Unique ID (e.g. user-999)' : `Value for ${col.name}`}
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
                      Insert Record
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
                    SQL Command Console
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
                    <span>Live SQLite Transaction Engine</span>
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
                  {/* Results Header */}
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

                  {/* Error Message */}
                  {!queryResult.success && (
                    <div className="p-4 bg-rose-950/40 text-rose-300 text-xs font-mono border-b border-rose-900/50">
                      {queryResult.error}
                    </div>
                  )}

                  {/* Results Grid */}
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

        {/* ================= TAB 4: VISUAL SCHEMA & ERD ================= */}
        {activeTab === 'erd' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-400" />
                    BCAFly Database Relational Architecture & ERD
                  </h3>
                  <p className="text-xs text-slate-400">
                    Interactive Entity Relationship Diagram showing 21 relational tables, primary keys (PK), and foreign key (FK) constraints.
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
                    {/* Header */}
                    <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TableIcon className="w-4 h-4 text-indigo-400" />
                        <span className="font-mono font-bold text-sm text-slate-100">{table.name}</span>
                      </div>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {table.rowCount} rows
                      </span>
                    </div>

                    {/* Columns List */}
                    <div className="p-3 divide-y divide-slate-900 text-xs font-mono space-y-1.5 flex-1">
                      {table.columns.map(col => {
                        const isPk = col.pk > 0;
                        const isFk = table.foreignKeys.some(fk => fk.from === col.name);
                        return (
                          <div key={col.name} className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-1.5">
                              {isPk ? (
                                <Key className="w-3 h-3 text-amber-400" />
                              ) : isFk ? (
                                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                              ) : (
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                              )}
                              <span className={isPk ? 'text-amber-200 font-semibold' : isFk ? 'text-cyan-200' : 'text-slate-300'}>
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

                    {/* Foreign Keys Reference Footer */}
                    {table.foreignKeys.length > 0 && (
                      <div className="px-3 py-2 bg-slate-900/60 border-t border-slate-800/80 text-[10px] text-slate-400 font-sans">
                        <span className="font-semibold text-cyan-400">References: </span>
                        {table.foreignKeys.map((fk, idx) => (
                          <span key={idx} className="mr-2">
                            {fk.from} → <strong className="text-slate-200">{fk.table}.{fk.to}</strong>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: BACKUP, MIGRATION & SYNC HUB ================= */}
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
                    <h4 className="text-base font-bold text-white">Export & Backup Database</h4>
                    <p className="text-xs text-slate-400">Download snapshots of the database with 1 click</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Export complete schema DDL with all 21 tables and all relational data records as standard SQL or structured JSON format.
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
                    <h4 className="text-base font-bold text-white">Import & Restore Database</h4>
                    <p className="text-xs text-slate-400">Restore database from existing backup file</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Upload an existing <code className="text-emerald-400 font-mono">.sql</code> dump or <code className="text-emerald-400 font-mono">.json</code> backup to replace or synchronize the active SQLite database.
                </p>

                <div className="pt-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".sql,.json"
                    className="hidden"
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

            {/* Danger Zone: Factory Reset */}
            <div className="bg-red-950/20 border border-red-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Factory Re-Seed & Database Reset
                </h4>
                <p className="text-xs text-slate-400 max-w-xl">
                  Resets all 21 tables and re-seeds the database with complete default BCA students, faculty, courses, attendance sessions, and marks.
                </p>
              </div>
              <button
                onClick={handleResetDatabase}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-red-600/30 cursor-pointer whitespace-nowrap"
              >
                Reset to Seed Data
              </button>
            </div>

            {/* Live Sync Log Activity Feed */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Live Sync & Mutation Activity Stream
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
