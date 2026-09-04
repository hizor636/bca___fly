import React, { useState } from 'react';
import { useDemoStore } from '../context/DemoContext';
import { UserRole } from '../types';
import {
  ShieldAlert,
  GraduationCap,
  UserCheck,
  HeartHandshake,
  ChevronDown,
  RotateCcw,
  Sparkles,
  Check,
  Eye,
  FileText
} from 'lucide-react';

interface DemoRoleBarProps {
  onOpenAudit: () => void;
  onOpenReports: () => void;
}

export const DemoRoleBar: React.FC<DemoRoleBarProps> = ({ onOpenAudit, onOpenReports }) => {
  const {
    currentRole,
    currentUser,
    activeFaculty,
    facultyList,
    switchRole,
    students,
    resetDemoData
  } = useDemoStore();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const shortageStudent = students?.find((s) => s.attendanceRate < 75) || students?.[2];
  const honorStudent = students?.find((s) => s.attendanceRate >= 92) || students?.[0];

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <ShieldAlert className="w-3.5 h-3.5 text-slate-900" />;
      case 'faculty':
        return <UserCheck className="w-3.5 h-3.5 text-slate-900" />;
      case 'student':
        return <GraduationCap className="w-3.5 h-3.5 text-slate-900" />;
      case 'counselor':
        return <HeartHandshake className="w-3.5 h-3.5 text-slate-900" />;
    }
  };

  return (
    <aside
      aria-label="Demo role switcher and test harness"
      className="bg-slate-900 text-white text-xs px-3 sm:px-6 py-2 sticky top-0 z-40 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shadow-sm"
    >
      {/* Left: Role Indicator & Quick Switcher */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 font-semibold text-[11px] text-slate-200">
          <Sparkles className="w-3 h-3 text-slate-300" />
          <span>Demo Mode (Pure Free)</span>
        </div>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1 bg-white text-slate-900 rounded-full font-medium hover:bg-slate-100 transition-colors shadow-xs cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              {getRoleIcon(currentRole)}
              <span className="capitalize font-bold">{currentRole}:</span>
              <span className="font-normal truncate max-w-[140px] sm:max-w-[200px]">
                {currentUser.name}
              </span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-72 sm:w-80 bg-white text-slate-900 rounded-2xl p-2.5 shadow-2xl border border-slate-200 z-50 animate-in fade-in zoom-in-95">
              <div className="px-2 py-1.5 border-b border-slate-100 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Select User Persona to Test Access Scoping
                </span>
              </div>

              {/* Admin */}
              <div className="mb-1">
                <button
                  onClick={() => {
                    switchRole('admin');
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${currentRole === 'admin' ? 'bg-slate-100 font-semibold' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-slate-900" />
                    <div>
                      <div className="font-semibold text-slate-900">Admin (Academic Dean)</div>
                      <div className="text-[10px] text-slate-400">Working days, SMS templates, 6-Sem reports, audit</div>
                    </div>
                  </div>
                  {currentRole === 'admin' && <Check className="w-3.5 h-3.5 text-slate-900" />}
                </button>
              </div>

              {/* Faculty Members (To test scoped student access) */}
              <div className="border-t border-slate-100 pt-1.5 mb-1">
                <span className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Faculty (Scoped Access)
                </span>
                {facultyList.map((fac) => {
                  const isSelected = currentRole === 'faculty' && activeFaculty.id === fac.id;
                  return (
                    <button
                      key={fac.id}
                      onClick={() => {
                        switchRole('faculty', fac.id);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left p-1.5 px-2 rounded-xl text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${isSelected ? 'bg-slate-100 font-semibold' : ''}`}
                    >
                      <div>
                        <div className="text-slate-900">{fac.name}</div>
                        <div className="text-[10px] text-slate-400">{fac.assignedStudentsCount} assigned students only</div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-slate-900" />}
                    </button>
                  );
                })}
              </div>

              {/* Students */}
              <div className="border-t border-slate-100 pt-1.5 mb-1">
                <span className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Students (Portal &amp; SMS Inbox)
                </span>
                <button
                  onClick={() => {
                    switchRole('student', honorStudent.id);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left p-1.5 px-2 rounded-xl text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${currentRole === 'student' && currentUser.id === honorStudent.id ? 'bg-slate-100 font-semibold' : ''}`}
                >
                  <div>
                    <div className="text-slate-900">{honorStudent.name} (Honor Roll - {honorStudent.attendanceRate}%)</div>
                    <div className="text-[10px] text-slate-400">Sem {honorStudent.semester} • Mentor: {honorStudent.assignedFaculty}</div>
                  </div>
                  {currentRole === 'student' && currentUser.id === honorStudent.id && <Check className="w-3.5 h-3.5 text-slate-900" />}
                </button>
                <button
                  onClick={() => {
                    switchRole('student', shortageStudent.id);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left p-1.5 px-2 rounded-xl text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${currentRole === 'student' && currentUser.id === shortageStudent.id ? 'bg-slate-100 font-semibold' : ''}`}
                >
                  <div>
                    <div className="text-slate-900">{shortageStudent.name} (Shortage - {shortageStudent.attendanceRate}%)</div>
                    <div className="text-[10px] text-slate-400">Sem {shortageStudent.semester} • Condonation: {shortageStudent.condonationStatus || 'Pending'}</div>
                  </div>
                  {currentRole === 'student' && currentUser.id === shortageStudent.id && <Check className="w-3.5 h-3.5 text-slate-900" />}
                </button>
              </div>

              {/* Counselor */}
              <div className="border-t border-slate-100 pt-1.5">
                <span className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Counselor (Confidential)
                </span>
                <button
                  onClick={() => {
                    switchRole('counselor');
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${currentRole === 'counselor' ? 'bg-slate-100 font-semibold' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <HeartHandshake className="w-4 h-4 text-slate-900" />
                    <div>
                      <div className="font-semibold text-slate-900">Dr. Priya Sharma</div>
                      <div className="text-[10px] text-slate-400">Confidential clinical notes &amp; referrals</div>
                    </div>
                  </div>
                  {currentRole === 'counselor' && <Check className="w-3.5 h-3.5 text-slate-900" />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Quick Validation Tools */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenReports}
          className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors flex items-center gap-1.5 text-[11px] cursor-pointer"
        >
          <FileText className="w-3 h-3" />
          <span className="hidden sm:inline">6-Sem Reports</span>
        </button>

        <button
          onClick={onOpenAudit}
          className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors flex items-center gap-1.5 text-[11px] cursor-pointer"
        >
          <Eye className="w-3 h-3" />
          <span className="hidden sm:inline">Audit Trail</span>
        </button>

        <button
          onClick={() => setShowResetConfirm(true)}
          title="Reset demo data to initial seeds"
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white text-slate-900 rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <h4 className="font-bold text-base mb-1">Reset Demo State?</h4>
            <p className="text-xs text-slate-500 mb-4">
              This will restore all 800 users, initial attendance sessions, simulated SMS logs, and counseling notes back to default seeds.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2 text-xs font-medium rounded-full bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetDemoData();
                  setShowResetConfirm(false);
                }}
                className="flex-1 py-2 text-xs font-medium rounded-full bg-slate-900 text-white hover:bg-slate-800 cursor-pointer"
              >
                Reset Seeds
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
