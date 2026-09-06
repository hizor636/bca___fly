import React, { useState } from 'react';
import { useDemoStore } from '../context/DemoContext';
import { UserRole } from '../types';
import {
  Sparkles,
  UserCheck,
  ChevronDown,
  FileText,
  Eye,
  RotateCcw,
  ShieldAlert,
  GraduationCap,
  HeartHandshake,
  Check
} from 'lucide-react';

interface DashboardRibbonProps {
  onOpenAudit: () => void;
  onOpenReports: () => void;
  className?: string;
}

export const DashboardRibbon: React.FC<DashboardRibbonProps> = ({
  onOpenAudit,
  onOpenReports,
  className = '',
}) => {
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
        return <ShieldAlert className="w-3.5 h-3.5 text-slate-800" />;
      case 'faculty':
        return <UserCheck className="w-3.5 h-3.5 text-slate-800" />;
      case 'student':
        return <GraduationCap className="w-3.5 h-3.5 text-slate-800" />;
      case 'counselor':
        return <HeartHandshake className="w-3.5 h-3.5 text-slate-800" />;
    }
  };

  return (
    <div
      id="dashboard-utility-ribbon"
      className={`bg-slate-50/90 border border-slate-200/90 rounded-2xl p-2.5 sm:px-4 sm:py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs ${className}`}
    >
      {/* Left: Demo Mode Badge & Faculty Selector */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* 1. Demo Mode (Pure Free) */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-2xs">
          <Sparkles className="w-3 h-3 text-slate-600" />
          <span>Demo Mode (Pure Free)</span>
        </div>

        {/* 2. faculty: Dr. Sarah Jenkins (Interactive Selector) */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-900 rounded-full text-xs font-medium transition-colors shadow-2xs cursor-pointer"
            title="Click to switch faculty or role persona"
          >
            <div className="flex items-center gap-1.5">
              {getRoleIcon(currentRole)}
              <span className="text-slate-500 font-normal">faculty:</span>
              <span className="font-semibold truncate max-w-[150px] sm:max-w-[200px]">
                {currentRole === 'faculty' ? (activeFaculty?.name || 'Faculty Member') : (currentUser?.name || 'User')}
              </span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                dropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-72 sm:w-80 bg-white text-slate-900 rounded-2xl p-2.5 shadow-2xl border border-slate-200 z-50 animate-in fade-in zoom-in-95">
              <div className="px-2 py-1.5 border-b border-slate-100 mb-1.5 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Select Faculty / Role Persona
                </span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                  Active Platform
                </span>
              </div>

              {/* Faculty Members */}
              <div className="mb-1">
                <span className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Faculty Allocation (Mentee Scoping)
                </span>
                {facultyList.length === 0 ? (
                  <div className="p-2 text-center text-xs text-slate-400">
                    No faculty profiles in database
                  </div>
                ) : (
                  facultyList.map((fac) => {
                    const isSelected = currentRole === 'faculty' && activeFaculty?.id === fac.id;
                    return (
                      <button
                        key={fac.id}
                        onClick={() => {
                          switchRole('faculty', fac.id);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left p-1.5 px-2 rounded-xl text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                          isSelected ? 'bg-slate-100 font-semibold' : ''
                        }`}
                      >
                        <div>
                          <div className="text-slate-900">{fac.name}</div>
                          <div className="text-[10px] text-slate-400">
                            {fac.assignedStudentsCount || 0} assigned students
                          </div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-slate-900" />}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Security Notice */}
              <div className="border-t border-slate-100 pt-2 px-2">
                <p className="text-[10px] text-slate-500 leading-tight">
                  <span className="font-semibold text-slate-700">Role Security:</span> To switch to Admin, Student, Parent, or Counselor workspaces, please use <strong className="text-slate-800">Switch Account</strong> via secure institutional authentication.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: 6-Sem Reports & Audit Trail Buttons */}
      <div className="flex items-center gap-2">
        {/* 3. 6-Sem Reports */}
        <button
          id="dashboard-ribbon-reports-btn"
          onClick={onOpenReports}
          className="px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          title="Open Departmental 6-Semester Reports & Transcripts"
        >
          <FileText className="w-3.5 h-3.5 text-slate-600" />
          <span>6-Sem Reports</span>
        </button>

        {/* 4. Audit Trail */}
        <button
          id="dashboard-ribbon-audit-btn"
          onClick={onOpenAudit}
          className="px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          title="Open SHA-256 Tamper-Evident Institutional Audit Trail"
        >
          <Eye className="w-3.5 h-3.5 text-slate-600" />
          <span>Audit Trail</span>
        </button>

        {/* Quick Reset State */}
        <button
          onClick={() => setShowResetConfirm(true)}
          title="Reset demo data seeds"
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white text-slate-900 rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <h4 className="font-bold text-base mb-1">Reset Platform State?</h4>
            <p className="text-xs text-slate-500 mb-4">
              This will clear temporary in-memory changes and synchronize with the clean relational database state.
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
                Reset &amp; Refresh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
