import React, { useState } from 'react';
import { useDemoStore } from '../context/DemoContext';
import { CounselingReferral } from '../types';
import {
  HeartHandshake,
  Lock,
  Plus,
  CheckCircle2,
  LogOut
} from 'lucide-react';

interface CounselorPortalViewProps {
  onNavigateHome?: () => void;
  onLogout?: () => void;
  onNavigatePublic?: () => void;
}

export const CounselorPortalView: React.FC<CounselorPortalViewProps> = ({
  onNavigateHome,
  onLogout,
  onNavigatePublic
}) => {
  const {
    counselingReferrals,
    counselingNotes,
    addCounselingNote,
    currentUser,
    switchRole,
    logout
  } = useDemoStore();

  const [selectedReferralId, setSelectedReferralId] = useState<string>(
    counselingReferrals[0]?.id || ''
  );

  // New Note State
  const [newNoteText, setNewNoteText] = useState('');
  const [newTreatmentPlan, setNewTreatmentPlan] = useState('');
  const [newMentorStatus, setNewMentorStatus] = useState<CounselingReferral['mentorVisibleStatus']>(
    'Action Plan Recommended'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const activeReferral = counselingReferrals.find((r) => r.id === selectedReferralId) || counselingReferrals[0];
  const activeReferralNotes = counselingNotes.filter((n) => n.referralId === activeReferral?.id);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !activeReferral) return;

    setIsSubmitting(true);
    addCounselingNote(activeReferral.id, newNoteText, newTreatmentPlan, newMentorStatus);
    setNewNoteText('');
    setNewTreatmentPlan('');
    setIsSubmitting(false);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-in fade-in duration-150">
      {/* Top Banner: Confidentiality Safeguards */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-white flex-shrink-0">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full">
                Protected Clinical Intake
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Lock className="w-3 h-3" />
                Confidentiality Level: Encrypted
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight mt-0.5">
              Counseling &amp; Student Wellness Center
            </h1>
            <p className="text-xs text-slate-400">
              Welcome, Dr. Priya Sharma. Clinical records and treatment plans are strictly restricted to the counseling cell. Faculty mentors receive sanitized status markers only.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onNavigatePublic && (
            <button
              onClick={onNavigatePublic}
              className="text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3.5 py-1.5 rounded-full transition-colors cursor-pointer"
            >
              Public Site
            </button>
          )}

          {/* Persona Switcher for Evaluators */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-full text-xs text-slate-300">
            <span className="text-[10px] uppercase font-bold text-slate-500 px-2">Role:</span>
            <button
              onClick={() => switchRole('faculty')}
              className="px-2 py-0.5 rounded-full hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
              title="Switch to Faculty Persona"
            >
              Faculty
            </button>
            <button
              onClick={() => switchRole('admin')}
              className="px-2 py-0.5 rounded-full hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
              title="Switch to Admin Persona"
            >
              Admin
            </button>
            <button
              onClick={() => switchRole('student')}
              className="px-2 py-0.5 rounded-full hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
              title="Switch to Student Persona"
            >
              Student
            </button>
          </div>

          <button
            onClick={() => {
              logout();
              if (onLogout) onLogout();
              else if (onNavigateHome) onNavigateHome();
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/60 hover:bg-rose-900 border border-rose-800/40 px-3.5 py-1.5 rounded-full transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Left Referrals List, Right Case Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Referrals Queue */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Referral Intake Queue</h3>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              {counselingReferrals.length} Cases
            </span>
          </div>

          <div className="space-y-2">
            {counselingReferrals.map((ref) => {
              const isSelected = activeReferral?.id === ref.id;
              return (
                <button
                  key={ref.id}
                  onClick={() => setSelectedReferralId(ref.id)}
                  className={`w-full text-left p-3.5 rounded-2xl transition-all cursor-pointer border text-xs ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{ref.studentName}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-slate-800 text-slate-200'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      Sem {ref.semester}
                    </span>
                  </div>

                  <div className="mt-1 space-y-1">
                    <div className={`text-[11px] ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      Referred by: {ref.referredByFacultyName}
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider ${
                          isSelected ? 'text-slate-300' : 'text-slate-600'
                        }`}
                      >
                        {ref.reasonCode.replace('_', ' ')}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          ref.status === 'pending'
                            ? isSelected ? 'bg-amber-800 text-amber-200' : 'bg-amber-100 text-amber-800'
                            : isSelected ? 'bg-emerald-800 text-emerald-200' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {ref.mentorVisibleStatus}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Case Management & Confidential Notes */}
        {activeReferral && (
          <div className="lg:col-span-2 space-y-6">
            {/* Case Overview Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Case Dossier #{activeReferral.id}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      Reason: {activeReferral.reasonCode.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">
                    {activeReferral.studentName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Referred by Faculty Mentor <strong>{activeReferral.referredByFacultyName}</strong> on {activeReferral.createdAt}
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Mentor-Visible Status
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {activeReferral.mentorVisibleStatus}
                  </span>
                </div>
              </div>

              {/* Faculty's Initial Remarks */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs space-y-1">
                <span className="font-bold text-slate-700 block">Faculty Referral Remarks:</span>
                <p className="text-slate-600 leading-relaxed font-sans italic">
                  "{activeReferral.facultyRemarks}"
                </p>
              </div>
            </div>

            {/* Confidential Counseling Session Notes */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-900" />
                  <h3 className="font-bold text-slate-900 text-base">
                    Confidential Clinical Notes ({activeReferralNotes.length})
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                  Strictly Invisible to Faculty &amp; Students
                </span>
              </div>

              <div className="space-y-3">
                {activeReferralNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2.5"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-900">
                        Intake Note by {note.createdByCounselorName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{note.createdAt}</span>
                    </div>

                    <p className="text-slate-700 leading-relaxed font-sans">{note.noteText}</p>

                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Treatment &amp; Coping Recommendations:
                      </span>
                      <p className="text-slate-800 font-medium">{note.treatmentPlan}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Session Note Form */}
              <form onSubmit={handleAddNote} className="pt-4 border-t border-slate-100 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Log New Confidential Counseling Session
                </h4>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Clinical Observations &amp; Session Notes (Protected)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Document student mental health assessment, stressors, and emotional indicators..."
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    required
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Action Plan &amp; Coping Strategies
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Breathing protocol, study timetable adjustments, weekly check-in"
                    value={newTreatmentPlan}
                    onChange={(e) => setNewTreatmentPlan(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-slate-700">
                      Update Status for Mentor:
                    </label>
                    <select
                      value={newMentorStatus}
                      onChange={(e) =>
                        setNewMentorStatus(
                          e.target.value as CounselingReferral['mentorVisibleStatus']
                        )
                      }
                      className="bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none"
                    >
                      <option value="Under Review">Under Review</option>
                      <option value="Session Scheduled">Session Scheduled</option>
                      <option value="Action Plan Recommended">Action Plan Recommended</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-full transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Save Note &amp; Update Mentor</span>
                  </button>
                </div>
              </form>

              {showSuccessToast && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-2xl text-xs flex items-center gap-2 border border-emerald-200 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Confidential note securely saved and audit-logged. Mentor status updated.</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
