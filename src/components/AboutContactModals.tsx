import React, { useState } from 'react';
import { X, ShieldCheck, Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { BcaFlyLogo } from './BcaFlyLogo';

interface AboutContactModalsProps {
  type: 'about' | 'contact' | 'privacy' | 'terms' | null;
  onClose: () => void;
}

export const AboutContactModals: React.FC<AboutContactModalsProps> = ({ type, onClose }) => {
  const [contactSent, setContactSent] = useState(false);
  const [contactMessage, setContactMessage] = useState('');

  if (!type) return null;

  const handleSendContact = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSent(true);
    setTimeout(() => {
      setContactSent(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="info-modal"
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-xl border border-slate-100 relative animate-in zoom-in-95 duration-200"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {type === 'about' && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <BcaFlyLogo size="md" />
              <div>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">About BcaFly</h3>
                <p className="text-xs text-slate-400">Academic Platform for Faculty Excellence</p>
              </div>
            </div>
            <div className="text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed">
              <p>
                <strong className="text-slate-900 font-semibold">BcaFly</strong> is designed specifically for Computer Applications faculty to streamline student mentorship, attendance recording, continuous internal evaluation, and institutional compliance.
              </p>
              <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs">
                  <ShieldCheck className="w-4 h-4 text-slate-900" />
                  <span>Institutional Compliance Ready</span>
                </div>
                <p className="text-xs text-slate-500">
                  Fully aligned with university accreditation criteria (NBA, NAAC, UGC) and semester grading guidelines.
                </p>
              </div>
              <p className="text-xs text-slate-400">
                Built with precision typography, privacy-first data handling, and direct role-based academic workflows.
              </p>
            </div>
          </div>
        )}

        {type === 'contact' && (
          <div>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">
              Faculty Support Desk
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Have questions about batch student allocation or grade submissions? Reach out to the academic IT cell.
            </p>

            {contactSent ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-slate-900 mx-auto" />
                <h4 className="font-bold text-slate-900 text-sm">Ticket Dispatched</h4>
                <p className="text-xs text-slate-500">The Department IT Support team will reply to your faculty inbox.</p>
              </div>
            ) : (
              <form onSubmit={handleSendContact} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Subject</label>
                  <input
                    type="text"
                    defaultValue="Grade Submission Assistance / Mentoring Sync"
                    required
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Message / Issue Details</label>
                  <textarea
                    rows={3}
                    placeholder="Describe your inquiry..."
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    required
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
                  />
                </div>
                <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                  <span className="text-slate-400">Direct: it.desk@bcafly.edu</span>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-slate-900 text-white font-medium rounded-full hover:bg-slate-800 flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Message</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {(type === 'privacy' || type === 'terms') && (
          <div>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-2 capitalize">
              {type} Policy
            </h3>
            <div className="text-xs text-slate-600 space-y-2.5 max-h-60 overflow-y-auto pr-2">
              <p>
                Student educational records, including internal exam marks, attendance ledgers, and faculty mentoring logs, are protected under institution privacy policies and applicable educational confidentiality laws.
              </p>
              <p>
                Faculty members may only access information for students specifically assigned to their mentorship cohorts or enrolled courses. Unauthorized dissemination of internal grades is strictly prohibited.
              </p>
              <p>
                All data transmission between the client browser and BcaFly is encrypted and audit logged for compliance inspection.
              </p>
            </div>
            <button
              onClick={onClose}
              className="mt-5 w-full py-2.5 bg-slate-900 text-white font-medium text-xs rounded-full hover:bg-slate-800 cursor-pointer transition-colors"
            >
              I Understand &amp; Agree
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
