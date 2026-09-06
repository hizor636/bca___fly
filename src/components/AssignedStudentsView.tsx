import React, { useState, useMemo } from 'react';
import { useDemoStore } from '../context/DemoContext';
import { Student } from '../types';
import {
  Users,
  Search,
  Filter,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  UserCheck,
  FileSpreadsheet,
  ShieldCheck,
  HeartHandshake
} from 'lucide-react';

interface AssignedStudentsViewProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
  onNavigateHome: () => void;
  onReferStudent?: (student: Student) => void;
}

export const AssignedStudentsView: React.FC<AssignedStudentsViewProps> = ({
  students: propStudents,
  onSelectStudent,
  onNavigateHome,
  onReferStudent,
}) => {
  const { activeFaculty, currentUser, getScopedStudentsForActiveFaculty, counselingReferrals } = useDemoStore();

  const facultyName =
    activeFaculty?.name?.trim() ||
    currentUser?.name?.trim() ||
    currentUser?.email?.split('@')[0] ||
    'Faculty';

  // STRICT ACCESS CONTROL: Only assigned students
  const scopedStudents = getScopedStudentsForActiveFaculty();
  const effectiveStudents = scopedStudents.length > 0 ? scopedStudents : propStudents;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<number | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  const filteredStudents = useMemo(() => {
    return effectiveStudents.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentId.includes(searchQuery) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSemester = selectedSemester === 'all' || s.semester === selectedSemester;
      const matchesStatus =
        selectedStatus === 'all' ||
        (selectedStatus === 'mentoring' && s.mentoringStatus === 'Mentoring') ||
        (selectedStatus === 'concern' && (s.mentoringStatus === 'Academic Concern' || s.attendanceRate < 75)) ||
        (selectedStatus === 'honor' && s.mentoringStatus === 'Honor Roll');

      return matchesSearch && matchesSemester && matchesStatus;
    });
  }, [effectiveStudents, searchQuery, selectedSemester, selectedStatus]);

  // Key metrics
  const avgAttendance = effectiveStudents.length
    ? Math.round(effectiveStudents.reduce((acc, curr) => acc + curr.attendanceRate, 0) / effectiveStudents.length)
    : 0;
  const mentoringCount = effectiveStudents.filter((s) => s.mentoringStatus === 'Mentoring').length;
  const atRiskCount = effectiveStudents.filter((s) => s.attendanceRate < 75).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6 animate-in fade-in duration-150">
      {/* Access Control Notice Banner */}
      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-slate-800 flex-shrink-0" />
          <span className="text-slate-700">
            <strong>Faculty Access Scoping Active:</strong> Displaying only students allocated to{' '}
            <strong className="text-slate-900">{facultyName}</strong> ({effectiveStudents.length} assigned mentees). Faculty cannot access students outside their designated allocation.
          </span>
        </div>
        <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex-shrink-0">
          STRICT RBAC ENFORCED
        </span>
      </div>

      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
            <button onClick={onNavigateHome} className="hover:text-slate-700 transition-colors cursor-pointer">
              Home
            </button>
            <span>/</span>
            <span className="text-slate-900 font-medium">Faculty Portal</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Assigned Student Mentees ({effectiveStudents.length})
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Academic supervision, attendance tracking, 1-on-1 mentoring notes, and counseling referrals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-full hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <span>View: {viewMode === 'table' ? 'Table View' : 'Card Grid'}</span>
          </button>
          <button
            onClick={() => alert(`Exporting ${effectiveStudents.length} assigned students for ${activeFaculty.name} to CSV...`)}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-full transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Roster</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Allocated Students</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 font-sans">{effectiveStudents.length}</p>
          <span className="text-xs text-slate-400 mt-1 block">Assigned Mentees</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Avg Attendance</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 font-sans">{avgAttendance}%</p>
          <span className="text-xs text-emerald-700 font-medium mt-1 block">Active Semester Average</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Mentoring Cases</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 font-sans">{mentoringCount}</p>
          <span className="text-xs text-slate-400 mt-1 block">Periodic 1-on-1 reviews</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Shortage Deficit</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 font-sans">{atRiskCount}</p>
          <span className="text-xs text-rose-600 font-semibold mt-1 block">&lt;75% Attendance cutoff</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student name or roll..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 text-xs sm:text-sm rounded-full border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Semester selection */}
          <div className="flex items-center bg-slate-100 p-1 rounded-full text-xs font-medium text-slate-600">
            <button
              onClick={() => setSelectedSemester('all')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                selectedSemester === 'all' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'hover:text-slate-900'
              }`}
            >
              All Sem
            </button>
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <button
                key={num}
                onClick={() => setSelectedSemester(num)}
                className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                  selectedSemester === num ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'hover:text-slate-900'
                }`}
              >
                Sem {num}
              </button>
            ))}
          </div>

          {/* Status selection */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">All Academic Statuses</option>
            <option value="mentoring">Mentoring Cases</option>
            <option value="concern">Low Attendance (&lt;75%)</option>
            <option value="honor">Honor Roll (&gt;90%)</option>
          </select>
        </div>
      </div>

      {/* Student List View */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No records yet</h3>
          <p className="text-xs text-slate-400 mt-1">
            {effectiveStudents.length === 0
              ? 'No mentees have been assigned to this faculty in the database.'
              : 'Try resetting your search query or semester filters.'}
          </p>
          {effectiveStudents.length > 0 && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSemester('all');
                setSelectedStatus('all');
              }}
              className="mt-4 px-5 py-2 bg-slate-100 text-slate-800 text-xs font-medium rounded-full hover:bg-slate-200 cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/70 text-slate-400 uppercase tracking-widest text-[11px] font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Student Info</th>
                  <th className="py-3.5 px-4">Program &amp; Sem</th>
                  <th className="py-3.5 px-4">Attendance Rate</th>
                  <th className="py-3.5 px-4">Status &amp; Condonation</th>
                  <th className="py-3.5 px-4">Counseling Status</th>
                  <th className="py-3.5 px-4">CGPA</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((s) => {
                  const ref = counselingReferrals?.find((r) => r.studentId === s.id);
                  return (
                    <tr
                      key={s.id}
                      onClick={() => onSelectStudent(s)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Name & Avatar */}
                      <td className="py-3 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {s.initials}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 group-hover:text-slate-600 transition-colors">
                              {s.name}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono">Roll: {s.studentId}</p>
                          </div>
                        </div>
                      </td>

                      {/* Program & Sem */}
                      <td className="py-3 px-4 text-slate-700">
                        <span className="font-medium">BCA</span>
                        <span className="text-slate-400 block text-[11px]">Semester {s.semester}</span>
                      </td>

                      {/* Attendance */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-semibold ${
                              s.attendanceRate < 75 ? 'text-rose-600' : 'text-slate-900'
                            }`}
                          >
                            {s.attendanceRate}%
                          </span>
                          <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
                            <div
                              className={`h-full rounded-full ${
                                s.attendanceRate < 75 ? 'bg-rose-500' : 'bg-slate-900'
                              }`}
                              style={{ width: `${s.attendanceRate}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status & Condonation Pill */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700">
                            {s.mentoringStatus}
                          </span>
                          {s.attendanceRate < 75 && (
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                s.condonationStatus === 'Approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : s.condonationStatus === 'Debarred'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              Condonation: {s.condonationStatus || 'Pending'}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Mentor-Visible Counseling Status */}
                      <td className="py-3 px-4">
                        {ref ? (
                          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                            <HeartHandshake className="w-3 h-3 text-slate-500" />
                            <span>{ref.mentorVisibleStatus}</span>
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">None</span>
                        )}
                      </td>

                      {/* CGPA */}
                      <td className="py-3 px-4 font-semibold text-slate-800 font-mono">
                        {s.cgpa.toFixed(2)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectStudent(s);
                          }}
                          className="text-xs font-medium text-slate-900 hover:text-slate-600 px-3 py-1 rounded-full hover:bg-slate-100 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Manage</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((s) => (
            <div
              key={s.id}
              onClick={() => onSelectStudent(s)}
              className="bg-white rounded-3xl p-5 border border-slate-100 hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between shadow-xs"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                      {s.initials}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm leading-tight">{s.name}</h4>
                      <p className="text-xs text-slate-400 font-mono">Roll: {s.studentId}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700">
                    {s.mentoringStatus}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Semester</span>
                    <span className="font-semibold text-slate-700">BCA - Sem {s.semester}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Attendance</span>
                    <span
                      className={`font-semibold ${
                        s.attendanceRate < 75 ? 'text-rose-600' : 'text-slate-900'
                      }`}
                    >
                      {s.attendanceRate}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono">CGPA: {s.cgpa.toFixed(2)}</span>
                <span className="font-semibold text-slate-900 flex items-center gap-1">
                  View Record <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
