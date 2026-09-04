import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const BcaFlyLogo: React.FC<LogoProps> = ({ className = '', size = 'md', showText = true }) => {
  const iconSize = size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8';
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div className={`${iconSize} rounded-lg bg-slate-900 flex items-center justify-center text-white flex-shrink-0 relative overflow-hidden group`}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4 text-white"
        >
          {/* Stylized P / academic portal monogram */}
          <path d="M7 20V5h7a4.5 4.5 0 0 1 0 9H7" />
          <path d="M14 9.5l3.5-3.5" strokeWidth="2" stroke="white" opacity="0.9" />
        </svg>
      </div>

      {showText && (
        <span className={`${textSize} font-bold tracking-tighter text-slate-900 font-sans flex items-center`}>
          BcaFly
        </span>
      )}
    </div>
  );
};
