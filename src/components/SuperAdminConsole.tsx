import React, { useState, useMemo } from 'react';
import { useDemoStore } from '../context/DemoContext';
import { BcaFlyLogo } from './BcaFlyLogo';
import { TenantInfo, Department, AcademicYear } from '../types';
import {
  ShieldCheck,
  Building2,
  Users,
  KeyRound,
  Activity,
  Settings as SettingsIcon,
  GraduationCap,
  Plus,
  Power,
  Check,
  Database,
  Bell,
  LogOut,
  Home,
  ChevronRight,
  Server,
  Layers,
  Search,
  Filter,
  Clock,
  Lock,
  UserPlus,
  AlertTriangle,
  CheckCircle2,
  Building,
  RefreshCw,
  Sliders
} from 'lucide-react';

interface SuperAdminConsoleProps {
  onLogout?: () => void;
  onNavigatePublic?: () => void;
}

type TabKey =
  | 'overview'
  | 'tenants'
  | 'academic'
  | 'admins'
  | 'users'
  | 'permissions'
  | 'telemetry'
  | 'settings';

interface AdminAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'ACTIVE' | 'DEACTIVATED';
  permissions: string[];
}

const PERMISSION_KEYS = [
  'MANAGE_DEPARTMENTS',
  'MANAGE_COURSES',
  'MANAGE_USERS',
  'MANAGE_ATTENDANCE_RULES',
  'MANAGE_SMS_GATEWAY',
  'VIEW_AUDIT_LOG',
];

export const SuperAdminConsole: React.FC<SuperAdminConsoleProps> = ({
  onLogout,
  onNavigatePublic,
}) => {
  const {
    currentUser,
    logout,
    tenants,
    createTenant,
    departments,
    addDepartment,
    academicYears,
    addAcademicYear,
    activateAcademicYear,
    adminList,
    facultyList,
    students,
    auditLogs,
    securityIncidents,
    toggleSecurityIncident,
    attendanceSettings,
    updateAttendanceSettings,
    smsSettings,
    updateSmsSettings,
    courses,
  } = useDemoStore();

  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  // Local state for permissions matrix and custom provisioned admins
  const [admins, setAdmins] = useState<AdminAccount[]>(() => {
    return [
      {
        id: 'a-1',
        name: adminList[0]?.name || 'Dr. V. Swaminathan (HOD)',
        email: adminList[0]?.email || 'admin@bcafly.edu',
        role: 'Institutional Administrator',
        status: 'ACTIVE',
        permissions: ['MANAGE_DEPARTMENTS', 'MANAGE_COURSES', 'MANAGE_USERS', 'MANAGE_ATTENDANCE_RULES', 'MANAGE_SMS_GATEWAY', 'VIEW_AUDIT_LOG'],
      },
      {
        id: 'a-2',
        name: 'Dean Academic Affairs Dr. R. Raman',
        email: 'dean.academics@bcafly.edu',
        role: 'Academic Dean',
        status: 'ACTIVE',
        permissions: ['MANAGE_DEPARTMENTS', 'MANAGE_COURSES', 'VIEW_AUDIT_LOG'],
      },
    ];
  });

  // Global settings state
  const [globalConfig, setGlobalConfig] = useState({
    attendanceCutoffTime: attendanceSettings?.dailyCutoffTime || '11:30',
    smsOnAbsenceFinalization: smsSettings?.automatedAbsenceSms ?? true,
    notificationChannel: 'SMS + Email',
    academicYearLocked: false,
    zeroTrustIpRestriction: true,
  });

  // Modal / Form States
  const [showAddTenantModal, setShowAddTenantModal] = useState(false);
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantCode, setNewTenantCode] = useState('');
  const [newTenantDomain, setNewTenantDomain] = useState('');
  const [newTenantPlan, setNewTenantPlan] = useState('Enterprise Multi-Role Academic');
  const [newTenantQuota, setNewTenantQuota] = useState(2500);
  const [newTenantAdminEmail, setNewTenantAdminEmail] = useState('');

  // Department creation state
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptCode, setNewDeptCode] = useState('');
  const [deptFeedback, setDeptFeedback] = useState<string | null>(null);

  // Academic year creation state
  const [newYearLabel, setNewYearLabel] = useState('');
  const [yearSetActive, setYearSetActive] = useState(true);
  const [yearFeedback, setYearFeedback] = useState<string | null>(null);

  // Admin creation state
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [adminFeedback, setAdminFeedback] = useState<string | null>(null);

  // User search/filter
  const [userRoleFilter, setUserRoleFilter] = useState<'ALL' | 'STUDENT' | 'FACULTY' | 'ADMIN'>('ALL');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'STUDENT' | 'FACULTY'>('STUDENT');
  const [userFeedback, setUserFeedback] = useState<string | null>(null);

  // Combined user list for directory
  const [extraUsers, setExtraUsers] = useState<Array<{ id: string; name: string; email: string; role: 'STUDENT' | 'FACULTY' | 'ADMIN'; status: 'ACTIVE' | 'SUSPENDED' }>>([]);

  const allDirectoryUsers = useMemo(() => {
    const list: Array<{ id: string; name: string; email: string; role: 'STUDENT' | 'FACULTY' | 'ADMIN'; status: 'ACTIVE' | 'SUSPENDED' }> = [];
    
    // Admins
    admins.forEach((a) => {
      list.push({
        id: a.id,
        name: a.name,
        email: a.email,
        role: 'ADMIN',
        status: a.status === 'ACTIVE' ? 'ACTIVE' : 'SUSPENDED',
      });
    });

    // Faculty
    facultyList.forEach((f) => {
      list.push({
        id: f.id,
        name: f.name,
        email: f.email,
        role: 'FACULTY',
        status: 'ACTIVE',
      });
    });

    // Students
    students.forEach((s) => {
      list.push({
        id: s.id,
        name: s.name,
        email: s.email,
        role: 'STUDENT',
        status: 'ACTIVE',
      });
    });

    // Plus extra users provisioned in session
    extraUsers.forEach((u) => {
      list.push(u);
    });

    return list;
  }, [admins, facultyList, students, extraUsers]);

  const filteredDirectoryUsers = useMemo(() => {
    return allDirectoryUsers.filter((u) => {
      const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
      const matchesSearch =
        userSearchQuery === '' ||
        u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearchQuery.toLowerCase());
      return matchesRole && matchesSearch;
    });
  }, [allDirectoryUsers, userRoleFilter, userSearchQuery]);

  // Handlers
  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantName.trim() || !newTenantCode.trim() || !newTenantAdminEmail.trim()) return;

    createTenant({
      name: newTenantName.trim(),
      code: newTenantCode.trim().toUpperCase(),
      domain: newTenantDomain.trim() || `${newTenantCode.toLowerCase()}.bcafly.edu`,
      plan: newTenantPlan,
      status: 'ACTIVE',
      studentQuota: Number(newTenantQuota),
      adminEmail: newTenantAdminEmail.trim(),
    });

    setNewTenantName('');
    setNewTenantCode('');
    setNewTenantDomain('');
    setNewTenantAdminEmail('');
    setShowAddTenantModal(false);
  };

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim() || !newDeptCode.trim()) return;

    await addDepartment({
      name: newDeptName.trim(),
      code: newDeptCode.trim().toUpperCase(),
    });

    setDeptFeedback(`Department "${newDeptName.trim()}" successfully provisioned.`);
    setNewDeptName('');
    setNewDeptCode('');
    setTimeout(() => setDeptFeedback(null), 3000);
  };

  const handleAddAcademicYear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYearLabel.trim()) return;

    await addAcademicYear({
      name: newYearLabel.trim(),
      startDate: '2026-08-01',
      endDate: '2027-05-31',
      attendanceRule: 75.0,
      isActive: yearSetActive,
    });

    setYearFeedback(`Academic Year "${newYearLabel.trim()}" registered.`);
    setNewYearLabel('');
    setTimeout(() => setYearFeedback(null), 3000);
  };

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminName.trim() || !newAdminEmail.trim()) return;

    const newAdmin: AdminAccount = {
      id: `a-${Date.now()}`,
      name: newAdminName.trim(),
      email: newAdminEmail.trim(),
      role: 'Institutional Administrator',
      status: 'ACTIVE',
      permissions: ['MANAGE_DEPARTMENTS', 'MANAGE_COURSES', 'MANAGE_USERS', 'VIEW_AUDIT_LOG'],
    };

    setAdmins((prev) => [...prev, newAdmin]);
    setAdminFeedback(`Admin "${newAdminName.trim()}" successfully provisioned.`);
    setNewAdminName('');
    setNewAdminEmail('');
    setTimeout(() => setAdminFeedback(null), 3000);
  };

  const handleToggleAdminStatus = (id: string) => {
    setAdmins((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: a.status === 'ACTIVE' ? 'DEACTIVATED' : 'ACTIVE' }
          : a
      )
    );
  };

  const handleTogglePermission = (adminId: string, permissionKey: string) => {
    setAdmins((prev) =>
      prev.map((a) => {
        if (a.id !== adminId) return a;
        const exists = a.permissions.includes(permissionKey);
        return {
          ...a,
          permissions: exists
            ? a.permissions.filter((p) => p !== permissionKey)
            : [...a.permissions, permissionKey],
        };
      })
    );
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    setExtraUsers((prev) => [
      ...prev,
      {
        id: `usr-${Date.now()}`,
        name: newUserName.trim(),
        email: newUserEmail.trim(),
        role: newUserRole,
        status: 'ACTIVE',
      },
    ]);

    setUserFeedback(`Account created for ${newUserName.trim()} (${newUserRole}).`);
    setNewUserName('');
    setNewUserEmail('');
    setTimeout(() => setUserFeedback(null), 3000);
  };

  const handleToggleUserStatus = (id: string) => {
    setExtraUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' }
          : u
      )
    );
  };

  const activeAcademicYear = academicYears.find((y) => y.isActive) || academicYears[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-150">
      {/* ═══════════════ SIGNATURE BcaFly HERO HEADER ═══════════════ */}
      <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md border border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="bg-white/10 p-2.5 rounded-2xl">
            <BcaFlyLogo />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-rose-500/20 text-rose-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-rose-500/40">
                Platform Super Admin
              </span>
              <span className="text-xs text-slate-400">Root Authority Console</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white mt-0.5">
              Multi-Tenant Governance &amp; Policy Controller
            </h1>
            <p className="text-xs text-slate-400">
              Zero-Trust Architecture • Central Cluster Telemetry • Single Source of Truth
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onNavigatePublic && (
            <button
              onClick={onNavigatePublic}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 border border-white/10 px-3.5 py-1.5 rounded-full transition-colors cursor-pointer"
              title="Return to public portal"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Public Site</span>
            </button>
          )}
          <button
            onClick={() => {
              logout();
              if (onLogout) onLogout();
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/60 hover:bg-rose-900 border border-rose-800/40 px-3.5 py-1.5 rounded-full transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* ═══════════════ TOP METRICS TELEMETRY RIBBON ═══════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Onboarded Tenants</span>
          <div className="text-2xl font-bold text-slate-900 font-mono">{tenants.length} Institutions</div>
          <span className="text-[11px] text-emerald-700 font-medium">100% Operational SLA</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Institutional Admins</span>
          <div className="text-2xl font-bold text-slate-900 font-mono">{admins.length} Active</div>
          <span className="text-[11px] text-slate-500">Governance Authorities</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Global Directory</span>
          <div className="text-2xl font-bold text-slate-900 font-mono">{allDirectoryUsers.length} Users</div>
          <span className="text-[11px] text-emerald-700 font-medium">{students.length} Students · {facultyList.length} Faculty</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Audit Logs</span>
          <div className="text-2xl font-bold text-slate-900 font-mono">{auditLogs.length} Events</div>
          <span className="text-[11px] text-emerald-700 font-medium">Tamper-Evident Ledger</span>
        </div>
      </div>

      {/* ═══════════════ PILL NAVIGATION TABS ═══════════════ */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1 text-xs font-semibold overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'overview'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Overview &amp; Propagation</span>
        </button>

        <button
          onClick={() => setActiveTab('tenants')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'tenants'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Tenants &amp; Institutions</span>
        </button>

        <button
          onClick={() => setActiveTab('academic')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'academic'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Academic Structure</span>
        </button>

        <button
          onClick={() => setActiveTab('admins')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'admins'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Admin Management</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'users'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Global User Directory</span>
        </button>

        <button
          onClick={() => setActiveTab('permissions')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'permissions'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Permissions Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('telemetry')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'telemetry'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Telemetry &amp; Audit</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'settings'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70'
          }`}
        >
          <SettingsIcon className="w-3.5 h-3.5" />
          <span>Global Settings</span>
        </button>
      </div>

      {/* ═══════════════ TAB 1: OVERVIEW & PROPAGATION ═══════════════ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Live Downstream Propagation Preview */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-lg font-bold text-slate-900">Live Downstream Propagation</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Super Admin governs the master state. This demonstrates what downstream portals (Admin Control, Faculty Portal, and Student Portal) read from this exact store in real-time.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                <span className="text-[10px] font-bold tracking-wider text-purple-700 uppercase block">
                  Admin Portal Reads
                </span>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  <li className="flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    <span>Departments: <strong>{departments.map((d) => d.code).join(', ') || 'BCA'}</strong></span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    <span>Active Year: <strong>{activeAcademicYear?.name || '2026-2027'}</strong></span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    <span>Daily Cutoff: <strong>{globalConfig.attendanceCutoffTime}</strong></span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    <span>Courses Master: <strong>{courses.length} courses</strong></span>
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                <span className="text-[10px] font-bold tracking-wider text-blue-700 uppercase block">
                  Faculty Portal Reads
                </span>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  <li className="flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    <span>Faculty Profiles: <strong>{facultyList.length} instructors</strong></span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    <span>Attendance Threshold: <strong>{activeAcademicYear?.attendanceRule || 75}%</strong></span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    <span>SMS on Absence: <strong>{globalConfig.smsOnAbsenceFinalization ? 'Automated' : 'Manual'}</strong></span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    <span>Semester Batches: <strong>6 Semesters Active</strong></span>
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                <span className="text-[10px] font-bold tracking-wider text-emerald-700 uppercase block">
                  Student Portal Reads
                </span>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  <li className="flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    <span>Enrolled Cohorts: <strong>{students.length} students</strong></span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    <span>Academic Year: <strong>{activeAcademicYear?.name || '2026-2027'}</strong></span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    <span>Correction Gateway: <strong>Operational</strong></span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    <span>Channel: <strong>{globalConfig.notificationChannel}</strong></span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Recent Global Operations */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Recent Global Actions</h2>
                <p className="text-xs text-slate-500 mt-0.5">Real state modifications recorded on the immutable ledger.</p>
              </div>
              <span className="text-xs text-slate-400 font-mono">{auditLogs.length} events logged</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th className="py-2.5">Action</th>
                    <th className="py-2.5">Actor</th>
                    <th className="py-2.5">Entity</th>
                    <th className="py-2.5 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.slice(0, 6).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 font-medium text-slate-900">{log.action}</td>
                      <td className="py-3 text-slate-600">{log.actorName} ({log.actorRole})</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                          {log.entityType}
                        </span>
                      </td>
                      <td className="py-3 text-right text-slate-400 font-mono text-[11px]">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ TAB 2: TENANTS & INSTITUTIONS ═══════════════ */}
      {activeTab === 'tenants' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Provisioned Institutions &amp; Campuses</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Multi-tenant isolation ensures strict cryptographic and database separation across university branches.
                </p>
              </div>

              <button
                onClick={() => setShowAddTenantModal(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Onboard New Institution</span>
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tenants.map((t) => (
                <div key={t.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 hover:border-slate-300 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full uppercase bg-slate-200 text-slate-700">
                        {t.code}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-1.5">{t.name}</h3>
                      <p className="text-xs text-slate-500 font-mono">{t.domain || `${t.code.toLowerCase()}.bcafly.edu`}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${t.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                      {t.status}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
                    <span>Quota: <strong>{t.studentQuota.toLocaleString()} students</strong></span>
                    <span>Admin: <strong className="text-slate-900">{t.adminEmail}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ TAB 3: ACADEMIC STRUCTURE ═══════════════ */}
      {activeTab === 'academic' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Departments Master */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Academic Departments</h2>
                <span className="text-xs text-slate-400 font-mono">{departments.length} registered</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Master departments selectable in Course Master and User Directory.</p>
            </div>

            {deptFeedback && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-medium">
                {deptFeedback}
              </div>
            )}

            <form onSubmit={handleAddDepartment} className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
              <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block">Add Department</span>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <input
                    type="text"
                    value={newDeptName}
                    onChange={(e) => setNewDeptName(e.target.value)}
                    placeholder="e.g. Computer Applications"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={newDeptCode}
                    onChange={(e) => setNewDeptCode(e.target.value)}
                    placeholder="BCA"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 uppercase"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Department</span>
              </button>
            </form>

            <ul className="divide-y divide-slate-100 text-xs">
              {departments.map((d) => (
                <li key={d.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-900">{d.name}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">ID: {d.id}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-slate-100 text-slate-700">
                    {d.code}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Academic Years Master */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Academic Years</h2>
                <span className="text-xs text-slate-400 font-mono">{academicYears.length} cycles</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Setting an active year here governs downstream attendance and semesters.</p>
            </div>

            {yearFeedback && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-medium">
                {yearFeedback}
              </div>
            )}

            <form onSubmit={handleAddAcademicYear} className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
              <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block">Add Academic Year</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newYearLabel}
                  onChange={(e) => setNewYearLabel(e.target.value)}
                  placeholder="e.g. 2026-2027"
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={yearSetActive}
                    onChange={(e) => setYearSetActive(e.target.checked)}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-3.5 h-3.5"
                  />
                  <span>Set Active</span>
                </label>
              </div>
              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Academic Year</span>
              </button>
            </form>

            <ul className="divide-y divide-slate-100 text-xs">
              {academicYears.map((ay) => (
                <li key={ay.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-900">{ay.name}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {ay.startDate} ~ {ay.endDate}
                    </span>
                  </div>
                  {ay.isActive ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      ACTIVE YEAR
                    </span>
                  ) : (
                    <button
                      onClick={() => activateAcademicYear(ay.id)}
                      className="text-[11px] text-slate-500 hover:text-slate-900 underline cursor-pointer"
                    >
                      Make Active
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ═══════════════ TAB 4: ADMIN MANAGEMENT ═══════════════ */}
      {activeTab === 'admins' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Institutional Administrators</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Govern every institutional administrator account. Deactivating an admin instantly revokes their portal session.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">{admins.length} total administrators</span>
          </div>

          {adminFeedback && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-medium">
              {adminFeedback}
            </div>
          )}

          {/* Provision Admin Form */}
          <form onSubmit={handleAddAdmin} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
            <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block">
              Provision New Institutional Admin
            </span>
            <div className="grid sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={newAdminName}
                onChange={(e) => setNewAdminName(e.target.value)}
                placeholder="Full Name (e.g. Dr. Jane Doe)"
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
              <input
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="Official Email (jane.doe@bcafly.edu)"
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Provision Admin</span>
              </button>
            </div>
          </form>

          {/* Admins Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="py-2.5">Administrator</th>
                  <th className="py-2.5">Email</th>
                  <th className="py-2.5">Role</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5">Permissions Granted</th>
                  <th className="py-2.5 text-right">Access Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {admins.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 font-semibold text-slate-900">{a.name}</td>
                    <td className="py-3 text-slate-600 font-mono text-[11px]">{a.email}</td>
                    <td className="py-3 text-slate-500">{a.role}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${a.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500">
                      {a.permissions.length} of {PERMISSION_KEYS.length} keys active
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleToggleAdminStatus(a.id)}
                        className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors cursor-pointer ${
                          a.status === 'ACTIVE'
                            ? 'text-rose-600 hover:bg-rose-50 border border-rose-200'
                            : 'text-emerald-600 hover:bg-emerald-50 border border-emerald-200'
                        }`}
                      >
                        {a.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════════ TAB 5: GLOBAL USERS DIRECTORY ═══════════════ */}
      {activeTab === 'users' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Global User Directory</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Universal identity registry across Students, Faculty, and Administrators.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">{filteredDirectoryUsers.length} matched users</span>
          </div>

          {userFeedback && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-medium">
              {userFeedback}
            </div>
          )}

          {/* User Provisioning Form */}
          <form onSubmit={handleAddUser} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
            <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block">
              Provision Platform User
            </span>
            <div className="grid sm:grid-cols-4 gap-3">
              <input
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="Full Name"
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
              <input
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="Email Address"
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
              <select
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value as 'STUDENT' | 'FACULTY')}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer"
              >
                <option value="STUDENT">Student</option>
                <option value="FACULTY">Faculty Member</option>
              </select>
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Account</span>
              </button>
            </div>
          </form>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer"
              >
                <option value="ALL">All Roles ({allDirectoryUsers.length})</option>
                <option value="STUDENT">Students ({students.length})</option>
                <option value="FACULTY">Faculty ({facultyList.length})</option>
                <option value="ADMIN">Admins ({admins.length})</option>
              </select>
            </div>
          </div>

          {/* User Directory Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="py-2.5">User</th>
                  <th className="py-2.5">Role</th>
                  <th className="py-2.5">Email</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDirectoryUsers.slice(0, 15).map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 font-semibold text-slate-900">{u.name}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                        u.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-800'
                          : u.role === 'FACULTY'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 text-slate-600 font-mono text-[11px]">{u.email}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${u.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleToggleUserStatus(u.id)}
                          className="text-xs text-slate-500 hover:text-slate-900 underline cursor-pointer"
                        >
                          {u.status === 'ACTIVE' ? 'Suspend' : 'Reinstate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════════ TAB 6: PERMISSIONS MATRIX ═══════════════ */}
      {activeTab === 'permissions' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Granular Access &amp; Permission Matrix</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Super Admin grants explicit authorization vectors. Changes take immediate effect across Admin Control modules.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="py-3">Administrator</th>
                  {PERMISSION_KEYS.map((k) => (
                    <th key={k} className="py-3 px-2 text-center">
                      <span className="block max-w-[90px] mx-auto truncate" title={k}>
                        {k.replace('MANAGE_', '').replace('_', ' ')}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {admins.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 font-semibold text-slate-900">{a.name}</td>
                    {PERMISSION_KEYS.map((k) => {
                      const isGranted = a.permissions.includes(k);
                      return (
                        <td key={k} className="py-3.5 text-center">
                          <button
                            onClick={() => handleTogglePermission(a.id, k)}
                            className={`w-7 h-7 rounded-lg border flex items-center justify-center mx-auto transition-all cursor-pointer ${
                              isGranted
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                                : 'bg-slate-50 border-slate-200 text-slate-300 hover:border-slate-400'
                            }`}
                            title={`Toggle ${k} for ${a.name}`}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════════ TAB 7: TELEMETRY & AUDIT ═══════════════ */}
      {activeTab === 'telemetry' && (
        <div className="space-y-6">
          {/* Cluster Telemetry */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Zero-Trust Cluster Status</span>
              <div className="text-xl font-bold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Healthy · Enforcing Isolation</span>
              </div>
              <p className="text-[11px] text-slate-500">Cross-tenant queries cryptographically isolated</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Security Telemetry Incidents</span>
              <div className="text-xl font-bold text-slate-900">{securityIncidents.length} Active Incidents</div>
              <p className="text-[11px] text-emerald-700 font-medium">All firewalls responding normally</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Memory &amp; Cache Store</span>
              <div className="text-xl font-bold text-slate-900 font-mono">React 19 + Context</div>
              <p className="text-[11px] text-slate-500">State synchronization delay: 0ms</p>
            </div>
          </div>

          {/* Complete Live Audit Trail */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Complete Live Audit Trail</h2>
                <p className="text-xs text-slate-500 mt-0.5">Live derived log from state mutations across the application.</p>
              </div>
              <span className="text-xs text-slate-400 font-mono">{auditLogs.length} events logged</span>
            </div>

            <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th className="py-2.5">Action</th>
                    <th className="py-2.5">Actor</th>
                    <th className="py-2.5">Target Entity</th>
                    <th className="py-2.5">Network Node</th>
                    <th className="py-2.5 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 font-semibold text-slate-900">{log.action}</td>
                      <td className="py-3 text-slate-600">{log.actorName}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                          {log.entityType}
                        </span>
                      </td>
                      <td className="py-3 text-slate-400 font-mono text-[11px]">{log.ip || '127.0.0.1'}</td>
                      <td className="py-3 text-right text-slate-500 font-mono text-[11px]">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ TAB 8: GLOBAL SETTINGS ═══════════════ */}
      {activeTab === 'settings' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Global Governance Settings</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              These institutional parameters are consumed live by Admin Control, Attendance Rules, and SMS Gateway modules.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Daily Attendance Cutoff Time</label>
              <input
                type="time"
                value={globalConfig.attendanceCutoffTime}
                onChange={(e) => {
                  setGlobalConfig((prev) => ({ ...prev, attendanceCutoffTime: e.target.value }));
                  updateAttendanceSettings({ dailyCutoffTime: e.target.value });
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
              <p className="text-[11px] text-slate-400">Faculty marking after this cutoff requires administrative unlocking.</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Primary Dispatch Channel</label>
              <select
                value={globalConfig.notificationChannel}
                onChange={(e) => setGlobalConfig((prev) => ({ ...prev, notificationChannel: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer"
              >
                <option>SMS + Email</option>
                <option>SMS only</option>
                <option>Email only</option>
              </select>
              <p className="text-[11px] text-slate-400">Defines the default delivery pipeline for guardian notifications.</p>
            </div>

            <div className="sm:col-span-2 pt-2 space-y-3">
              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={globalConfig.smsOnAbsenceFinalization}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setGlobalConfig((prev) => ({ ...prev, smsOnAbsenceFinalization: checked }));
                    updateSmsSettings({ automatedAbsenceSms: checked });
                  }}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-4 h-4"
                />
                <Bell className="w-4 h-4 text-amber-500" />
                <span>Automatically dispatch SMS to parents upon absence finalization</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={globalConfig.academicYearLocked}
                  onChange={(e) => setGlobalConfig((prev) => ({ ...prev, academicYearLocked: e.target.checked }))}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-4 h-4"
                />
                <Lock className="w-4 h-4 text-rose-500" />
                <span>Lock active academic year structure from Admin-level modifications</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={globalConfig.zeroTrustIpRestriction}
                  onChange={(e) => setGlobalConfig((prev) => ({ ...prev, zeroTrustIpRestriction: e.target.checked }))}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-4 h-4"
                />
                <ShieldCheck className="w-4 h-4 text-blue-500" />
                <span>Enforce zero-trust IP rate-limiting on authentication gateways</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ ONBOARD TENANT MODAL ═══════════════ */}
      {showAddTenantModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-100 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Onboard New Institution</h3>
              <button
                onClick={() => setShowAddTenantModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Institution Name</label>
                <input
                  type="text"
                  required
                  value={newTenantName}
                  onChange={(e) => setNewTenantName(e.target.value)}
                  placeholder="e.g. BCA Engineering Campus"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Tenant Code</label>
                  <input
                    type="text"
                    required
                    value={newTenantCode}
                    onChange={(e) => setNewTenantCode(e.target.value)}
                    placeholder="ENG-02"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Student Quota</label>
                  <input
                    type="number"
                    value={newTenantQuota}
                    onChange={(e) => setNewTenantQuota(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Domain</label>
                <input
                  type="text"
                  value={newTenantDomain}
                  onChange={(e) => setNewTenantDomain(e.target.value)}
                  placeholder="eng.bcafly.edu"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Primary Admin Email</label>
                <input
                  type="email"
                  required
                  value={newTenantAdminEmail}
                  onChange={(e) => setNewTenantAdminEmail(e.target.value)}
                  placeholder="admin.eng@bcafly.edu"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTenantModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
                >
                  Onboard Institution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
