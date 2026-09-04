import React from 'react';
import { DepartmentNotice } from '../types';
import { Bell, X, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';

interface DepartmentUpdateModalProps {
  notice: DepartmentNotice;
  onClose: () => void;
  onOpenTracking: () => void;
}

export const DepartmentUpdateModal: React.FC<DepartmentUpdateModalProps> = ({
  notice,
  onClose,
  onOpenTracking,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="dept-update-modal"
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-xl border border-slate-100 relative animate-in zoom-in-95 duration-200"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-900 flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900">Official Notice</span>
              <span className="bg-slate-200 text-slate-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                New Circular
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 leading-tight mt-0.5">
              {notice.title}
            </h3>
          </div>
        </div>

        <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-4 mb-4">
          <p className="text-sm font-semibold text-slate-900 mb-1">{notice.subtitle}</p>
          <p className="text-xs text-slate-500 leading-relaxed">{notice.body}</p>

          <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Deadline: <strong className="text-slate-900">{notice.deadline || 'End of Week'}</strong>
            </span>
            <span className="text-slate-700 bg-slate-200/70 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
              Portal Active
            </span>
          </div>
        </div>

        <div className="space-y-2 mb-6 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-slate-900 flex-shrink-0" />
            <span>Verify minimum 75% student attendance requirement before grading.</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-slate-900 flex-shrink-0" />
            <span>Include internal marks for both theory and practical labs.</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-slate-900 flex-shrink-0" />
            <span>Submit before official cut-off date to enable student grade cards.</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-medium rounded-full transition-colors cursor-pointer"
          >
            Acknowledge Later
          </button>
          <button
            onClick={() => {
              onClose();
              onOpenTracking();
            }}
            className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-medium rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Open Grade Sheet</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
