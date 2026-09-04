import React from 'react';
import { BcaFlyLogo } from './BcaFlyLogo';

interface FooterProps {
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPrivacy, onOpenTerms }) => {
  return (
    <footer className="w-full bg-white border-t border-slate-100">
      {/* Top Footer Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3">
          <BcaFlyLogo size="sm" />
          <span className="text-slate-200">|</span>
          <span className="text-xs sm:text-sm text-slate-400 font-medium">
            Faculty Academic Platform
          </span>
        </div>

        {/* Links */}
        <div className="flex items-center space-x-6 text-xs sm:text-sm text-slate-400 font-medium">
          <button
            onClick={onOpenPrivacy}
            className="hover:text-slate-700 transition-colors"
          >
            Privacy
          </button>
          <button
            onClick={onOpenTerms}
            className="hover:text-slate-700 transition-colors"
          >
            Terms
          </button>
          <span>© 2026 BcaFly</span>
        </div>
      </div>

      {/* Bottom Copyright Notice */}
      <div className="border-t border-slate-100 py-5 text-center text-xs text-slate-400">
        <p>© 2024 BcaFly Faculty Platform. All rights reserved.</p>
      </div>
    </footer>
  );
};
