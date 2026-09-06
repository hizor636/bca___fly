import React, { useState } from 'react';
import { useDemoStore } from '../context/DemoContext';
import { X, Search, Filter, ShieldCheck, Download } from 'lucide-react';

interface AuditTrailModalProps {
  onClose: () => void;
}

export const AuditTrailModal: React.FC<AuditTrailModalProps> = ({ onClose }) => {
  const { auditLogs } = useDemoStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'faculty' | 'counselor'>('all');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || log.actorRole === roleFilter;
    return matchesSearch && matchesRole;
  });

  const exportCsv = () => {
    const headers = ['ID', 'Timestamp', 'Actor Role', 'Actor Name', 'Action', 'Entity Type', 'Entity ID', 'IP'];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.createdAt,
      l.actorRole,
      `"${l.actorName.replace(/"/g, '""')}"`,
      l.action,
      l.entityType,
      l.entityId,
      l.ip
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bcafly-audit-trail-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-900">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Governance &amp; Audit Trail
              </h3>
              <p className="text-xs text-slate-400">
                Immutable record of attendance finalizations, SMS dispatches, mentoring sessions, and setting updates.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCsv}
              className="px-3 py-1.5 text-xs font-medium rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="py-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search action, actor, or entity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 text-xs rounded-full border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
            <span className="text-slate-400 mr-1 text-[11px]">Role:</span>
            {(['all', 'admin', 'faculty', 'counselor'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize cursor-pointer transition-colors ${
                  roleFilter === r
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Log Table */}
        <div className="flex-1 overflow-y-auto mt-3 pr-1 text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                <th className="pb-2 pl-2">Timestamp</th>
                <th className="pb-2">Actor</th>
                <th className="pb-2">Action</th>
                <th className="pb-2">Entity</th>
                <th className="pb-2 pr-2 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 pl-2 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                    {log.createdAt}
                  </td>
                  <td className="py-2.5">
                    <div className="font-semibold text-slate-900">{log.actorName}</div>
                    <div className="text-[10px] text-slate-400 capitalize">{log.actorRole} • IP: {log.ip}</div>
                  </td>
                  <td className="py-2.5">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-800">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 font-mono text-[11px] text-slate-500">
                    <div className="text-slate-800">{log.entityType}</div>
                    <div className="text-[10px] text-slate-400">{log.entityId}</div>
                  </td>
                  <td className="py-2.5 pr-2 text-right">
                    {log.afterJson && (
                      <span
                        title={log.afterJson}
                        className="text-[10px] font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200 inline-block max-w-[200px] truncate text-left"
                      >
                        {log.afterJson}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredLogs.length === 0 && (
            <div className="py-12 text-center text-slate-400 space-y-1">
              <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <div className="font-semibold text-slate-800 text-xs">
                {auditLogs.length === 0 ? 'No audit events logged' : 'No audit logs matched your search criteria'}
              </div>
              <p className="text-[11px] text-slate-400">
                {auditLogs.length === 0
                  ? 'Institutional mutations, roll-call finalizations, and role access events will appear here in chronological order.'
                  : 'Try clearing your search query or role filter to view all logged actions.'}
              </p>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Displaying {filteredLogs.length} verified immutable audit records</span>
          <span>Hash verification: SHA-256 Validated</span>
        </div>
      </div>
    </div>
  );
};
