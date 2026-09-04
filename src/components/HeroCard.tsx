import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Student } from '../types';

interface HeroCardProps {
  onViewAllStudents: () => void;
  onSelectStudent: (student: Student) => void;
  onOpenNotice: () => void;
  alexStudent?: Student;
  jessicaStudent?: Student;
}

export const HeroCard: React.FC<HeroCardProps> = ({
  onViewAllStudents,
  onSelectStudent,
  onOpenNotice,
  alexStudent,
  jessicaStudent,
}) => {
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // 6 weekly trend columns matching clean minimalism aesthetic
  const trendBars = [
    { day: 'Mon', percent: 84, color: 'bg-slate-300', height: 'h-6' },
    { day: 'Tue', percent: 87, color: 'bg-slate-300', height: 'h-7' },
    { day: 'Wed', percent: 91, color: 'bg-slate-400', height: 'h-8' },
    { day: 'Thu', percent: 88, color: 'bg-slate-400', height: 'h-7' },
    { day: 'Fri', percent: 94, color: 'bg-slate-600', height: 'h-9' },
    { day: 'Sat', percent: 97, color: 'bg-slate-900', height: 'h-10' },
  ];

  return (
    <div
      id="hero-floating-card"
      className="relative w-full max-w-[430px] bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm transition-all"
    >
      {/* 1. Department Update Banner */}
      <div
        id="hero-dept-update-banner"
        onClick={onOpenNotice}
        className="bg-slate-50 hover:bg-slate-100/80 rounded-xl p-3.5 flex items-center justify-between cursor-pointer transition-colors border border-slate-100 group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center flex-shrink-0">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
              Department Update
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-500 leading-tight">
              Mid-semester grade submissions open
            </p>
          </div>
        </div>

        <span className="bg-slate-200 text-slate-700 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex-shrink-0">
          New
        </span>
      </div>

      {/* 2. Assigned Students Header & List */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2.5 px-0.5">
          <span className="text-xs font-semibold text-slate-500">
            Assigned Students (42)
          </span>
          <button
            id="hero-view-all-students-btn"
            onClick={onViewAllStudents}
            className="text-xs font-semibold text-slate-900 hover:text-slate-600 cursor-pointer transition-colors"
          >
            View all
          </button>
        </div>

        {/* Student 1: Alex Smith */}
        <div
          id="hero-student-alex"
          onClick={() => alexStudent && onSelectStudent(alexStudent)}
          className="bg-white hover:bg-slate-50 rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all border border-slate-100"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
              AS
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-tight">
                Alex Smith
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                BCA - Semester 5 • ID: 2024089
              </p>
            </div>
          </div>
          <span className="bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-0.5 rounded-full flex-shrink-0">
            94% Attendance
          </span>
        </div>

        {/* Student 2: Jessica Davis */}
        <div
          id="hero-student-jessica"
          onClick={() => jessicaStudent && onSelectStudent(jessicaStudent)}
          className="bg-white hover:bg-slate-50 rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all border border-slate-100 mt-2"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
              JD
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-tight">
                Jessica Davis
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                BCA - Semester 3 • ID: 2024112
              </p>
            </div>
          </div>
          <span className="bg-slate-100 text-slate-700 text-xs font-medium px-3 py-0.5 rounded-full flex-shrink-0">
            Mentoring
          </span>
        </div>
      </div>

      {/* 3. Weekly Attendance Trend */}
      <div className="bg-slate-50 rounded-xl p-3.5 mt-3 border border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-900">
            Weekly Attendance Trend
          </span>
          <span className="text-xs font-normal text-slate-400">
            +4.2% vs last week
          </span>
        </div>

        {/* 6 bar chart columns */}
        <div className="grid grid-cols-6 gap-2 items-end h-12 pt-2 relative">
          {trendBars.map((bar, idx) => (
            <div
              key={bar.day}
              className="relative flex flex-col items-center justify-end h-full group cursor-pointer"
              onMouseEnter={() => setHoveredBarIndex(idx)}
              onMouseLeave={() => setHoveredBarIndex(null)}
            >
              {hoveredBarIndex === idx && (
                <div className="absolute -top-7 bg-slate-900 text-white text-[10px] font-medium py-0.5 px-1.5 rounded shadow whitespace-nowrap z-10">
                  {bar.day}: {bar.percent}%
                </div>
              )}
              <div
                className={`w-full ${bar.color} ${bar.height} rounded-sm transition-all group-hover:opacity-85`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
