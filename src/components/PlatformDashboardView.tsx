import React, { useState } from 'react';
import { useDemoStore } from '../context/DemoContext';
import { BcaFlyLogo } from './BcaFlyLogo';
import { TenantInfo } from '../types';
import {
  ShieldAlert,
  Server,
  Building,
  Users,
  Activity,
  Plus,
  Lock,
  RefreshCw,
  Database,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  Sliders,
  Layers,
  HardDrive
} from 'lucide-react';

interface PlatformDashboardViewProps {
  onLogout?: () => void;
  onNavigatePublic?: () => void;
}

export const PlatformDashboardView: React.FC<PlatformDashboardViewProps> = ({
  onLogout,
  onNavigatePublic
}) => {
  const {
    tenants,
    createTenant,
    securityIncidents,
    toggleSecurityIncident,
    auditLogs,
    logout,
    resetDemoData
  } = useDemoStore();

  const [activeTab, setActiveTab] = useState<'tenants' | 'telemetry' | 'security' | 'departments' | 'retention'>('tenants');

  // New Tenant Modal State
  const [showAddTenantModal, setShowAddTenantModal] = useState(false);
  const [tenantName, setTenantName] = useState('');
  const [tenantCode, setTenantCode] = useState('');
  const [tenantDomain, setTenantDomain] = useState('');
  const [tenantPlan, setTenantPlan] = useState('Enterprise Multi-Role Academic');
  const [tenantQuota, setTenantQuota] = useState(2500);
  const [adminEmail, setAdminEmail] = useState('');

  // Department provisioning list
  const [departments, setDepartments] = useState<Array<{ id: string; name: string; code: string; head: string; students: number; faculty: number; status: string }>>([]);

  const [showDeptModal, setShowDeptModal] = useState(false);
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptHead, setDeptHead] = useState('');

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantName.trim() || !tenantCode.trim() || !adminEmail.trim()) return;

    createTenant({
      name: tenantName.trim(),
      code: tenantCode.trim().toUpperCase(),
      domain: tenantDomain.trim(),
      plan: tenantPlan,
      status: 'ACTIVE',
      studentQuota: Number(tenantQuota),
      adminEmail: adminEmail.trim()
    });

    setTenantName('');
    setTenantCode('');
    setTenantDomain('');
    setAdminEmail('');
    setShowAddTenantModal(false);
  };

  const handleCreateDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim() || !deptCode.trim()) return;

    setDepartments((prev) => [
      ...prev,
      {
        id: `dept-${Date.now()}`,
        name: deptName.trim(),
        code: deptCode.trim().toUpperCase(),
        head: deptHead.trim() || 'Appointed In-Charge',
        students: 0,
        faculty: 1,
        status: 'ACTIVE'
      }
    ]);

    setDeptName('');
    setDeptCode('');
    setDeptHead('');
    setShowDeptModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-in fade-in duration-150">
      {/* Super Admin Platform Top Bar */}
      <div className="bg-slate-950 text-white p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-rose-500/20 text-rose-400 p-2.5 rounded-2xl border border-rose-500/30">
            <BcaFlyLogo />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-rose-500/20 text-rose-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-rose-500/40">
                Platform Super Admin
              </span>
              <span className="text-xs text-slate-400">Multi-Tenant Infrastructure Hub</span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Zero-Trust Scope Enforcement • Global Cluster Telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
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

      {/* Platform Telemetry Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Onboarded Tenants</span>
          <div className="text-2xl font-bold text-slate-900 font-mono">{tenants.length} Institutions</div>
          <span className="text-[11px] text-emerald-700 font-medium">100% Active SLA</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Database Engine</span>
          <div className="text-2xl font-bold text-slate-900 font-mono">SQLite / sql.js</div>
          <span className="text-[11px] text-slate-500">26 Tables • Indexed Scopes</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Audit Events</span>
          <div className="text-2xl font-bold text-slate-900 font-mono">{auditLogs.length} Events</div>
          <span className="text-[11px] text-emerald-700 font-medium">Tamper-Evident Ledger</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Security Telemetry</span>
          <div className="text-2xl font-bold text-slate-900 font-mono">{securityIncidents.length} Telemetry Logs</div>
          <span className="text-[11px] text-emerald-700 font-medium">All Rate Limiters Normal</span>
        </div>
      </div>

      {/* Platform Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('tenants')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'tenants'
              ? 'bg-slate-950 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Tenant &amp; Institutions</span>
        </button>
        <button
          onClick={() => setActiveTab('departments')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'departments'
              ? 'bg-slate-950 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Department Provisioning</span>
        </button>
        <button
          onClick={() => setActiveTab('telemetry')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'telemetry'
              ? 'bg-slate-950 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>System Health &amp; Telemetry</span>
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'security'
              ? 'bg-slate-950 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Security Incidents</span>
        </button>
        <button
          onClick={() => setActiveTab('retention')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'retention'
              ? 'bg-slate-950 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100'
          }`}
        >
          <HardDrive className="w-3.5 h-3.5" />
          <span>Data Retention &amp; Backup</span>
        </button>
      </div>

      {/* Tab: Tenants */}
      {activeTab === 'tenants' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Onboarded Academic Institutions</h3>
              <p className="text-xs text-slate-500">
                Independent tenant databases isolated by university domain and cryptographic scope.
              </p>
            </div>
            <button
              onClick={() => setShowAddTenantModal(true)}
              className="bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-full transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Provision New Tenant</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tenants.map((t) => (
              <div key={t.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-bold">
                      {t.code}
                    </span>
                    <h4 className="font-bold text-slate-900 text-base mt-1">{t.name}</h4>
                    <p className="text-xs text-slate-500">{t.domain || 'apex.bcafly.edu'}</p>
                  </div>
                  <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border border-emerald-200">
                    {t.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200/60">
                  <div>
                    <span className="text-slate-400 block text-[10px]">License Tier</span>
                    <span className="font-semibold text-slate-800">{t.plan}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Student Quota</span>
                    <span className="font-semibold text-slate-800">{t.studentQuota} Max Seats</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px]">Administrator Contact</span>
                    <span className="font-mono text-slate-700 text-[11px]">{t.adminEmail}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Departments */}
      {activeTab === 'departments' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Department Provisioning Hub</h3>
              <p className="text-xs text-slate-500">
                Configure academic departments, assign HOD administrators, and allocate student batches.
              </p>
            </div>
            <button
              onClick={() => setShowDeptModal(true)}
              className="bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-full transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Department</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Code</th>
                  <th className="py-3 px-3">Department Name</th>
                  <th className="py-3 px-3">Head of Department</th>
                  <th className="py-3 px-3 text-center">Enrolled Students</th>
                  <th className="py-3 px-3 text-center">Faculty Allocated</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-medium text-xs">
                      No records yet. Provision academic departments using the button above.
                    </td>
                  </tr>
                ) : (
                  departments.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-3 font-mono font-bold text-slate-800">{d.code}</td>
                      <td className="py-3 px-3 font-semibold text-slate-900">{d.name}</td>
                      <td className="py-3 px-3 text-slate-600">{d.head}</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-800">{d.students}</td>
                      <td className="py-3 px-3 text-center font-mono text-slate-700">{d.faculty}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${d.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: System Telemetry */}
      {activeTab === 'telemetry' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
          <h3 className="text-lg font-bold text-slate-900">System Telemetry &amp; Node Health</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">API Response Latency</span>
                <span className="text-emerald-700 font-mono font-bold">12.4 ms</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: '15%' }} />
              </div>
              <span className="text-[10px] text-slate-400 block">P99 Latency &lt; 45ms</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Memory Allocation</span>
                <span className="text-slate-900 font-mono font-bold">142 MB / 512 MB</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-slate-900 h-full" style={{ width: '28%' }} />
              </div>
              <span className="text-[10px] text-slate-400 block">V8 Heap Healthy</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Database Engine</span>
                <span className="text-emerald-700 font-mono font-bold">OPTIMAL</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: '100%' }} />
              </div>
              <span className="text-[10px] text-slate-400 block">Zero unindexed query locks</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Security Incidents */}
      {activeTab === 'security' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Security Telemetry &amp; Incident Log</h3>
              <p className="text-xs text-slate-500">
                Automated rate limiting, bot protection, and step-up MFA enforcement audit logs.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {securityIncidents.map((inc) => (
              <div
                key={inc.id}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{inc.eventType}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${inc.severity === 'LOW' ? 'bg-slate-200 text-slate-700' : 'bg-rose-100 text-rose-800'}`}>
                      {inc.severity}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{inc.createdAt}</span>
                  </div>
                  <p className="text-slate-600">{inc.description}</p>
                  <div className="text-[11px] font-mono text-slate-500">
                    Source IP: {inc.ipAddress} • Subject: {inc.userEmail || 'System'}
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => toggleSecurityIncident(inc.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                      inc.resolved
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {inc.resolved ? '✓ Resolved' : 'Mark Resolved'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Data Retention & Backup */}
      {activeTab === 'retention' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Data Retention &amp; Recovery Controls</h3>
            <p className="text-xs text-slate-500">
              Manage database snapshots, compliance archiving, and demo storage reset procedures.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Download Full Cluster Snapshot</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generate an encrypted SQLite / JSON snapshot of all 26 schema tables including audit trails and marks ledgers.
              </p>
              <button
                onClick={() => alert('Snapshot downloaded successfully (simulated).')}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-xs font-semibold transition-colors cursor-pointer"
              >
                Export Encrypted Snapshot
              </button>
            </div>

            <div className="p-5 bg-rose-50 rounded-2xl border border-rose-200 space-y-3">
              <h4 className="font-bold text-rose-950 text-sm">Reset Demo Cluster Storage</h4>
              <p className="text-xs text-rose-800 leading-relaxed">
                Clear all browser local storage and restore pristine multi-role seed data across all departments.
              </p>
              <button
                onClick={() => {
                  if (confirm('Reset all demo state to fresh initial records?')) {
                    resetDemoData();
                    window.location.reload();
                  }
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-semibold transition-colors cursor-pointer"
              >
                Reset Demo Storage
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Tenant */}
      {showAddTenantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white max-w-md w-full rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Provision New Institution Tenant</h3>
              <button
                onClick={() => setShowAddTenantModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Institution Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Cambridge College of BCA"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., CCBCA"
                    value={tenantCode}
                    onChange={(e) => setTenantCode(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Domain</label>
                  <input
                    type="text"
                    placeholder="ccbca.edu"
                    value={tenantDomain}
                    onChange={(e) => setTenantDomain(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Administrator Email</label>
                <input
                  type="email"
                  required
                  placeholder="admin@ccbca.edu"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Student Quota</label>
                <input
                  type="number"
                  min="100"
                  max="10000"
                  value={tenantQuota}
                  onChange={(e) => setTenantQuota(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTenantModal(false)}
                  className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer shadow-xs"
                >
                  Provision Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Department */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white max-w-md w-full rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Provision New Department</h3>
              <button
                onClick={() => setShowDeptModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDept} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Department of Software Engineering"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Department Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., SE"
                    value={deptCode}
                    onChange={(e) => setDeptCode(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Head of Dept (HOD)</label>
                  <input
                    type="text"
                    placeholder="Prof. John Doe"
                    value={deptHead}
                    onChange={(e) => setDeptHead(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeptModal(false)}
                  className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer shadow-xs"
                >
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
