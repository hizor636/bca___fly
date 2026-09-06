import React, { useState } from 'react';
import { FacultyMember } from '../types';
import { Mail, MapPin, Users, Check, Search } from 'lucide-react';

interface FacultiesViewProps {
  faculties: FacultyMember[];
  activeFaculty: FacultyMember;
  onSelectFaculty: (faculty: FacultyMember) => void;
  onNavigateHome: () => void;
}

export const FacultiesView: React.FC<FacultiesViewProps> = ({
  faculties,
  activeFaculty,
  onSelectFaculty,
  onNavigateHome,
}) => {
  const [search, setSearch] = useState('');

  const filtered = faculties.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.specialization.toLowerCase().includes(search.toLowerCase()) ||
      f.courses.some((c) => c.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
            <button onClick={onNavigateHome} className="hover:text-slate-700 transition-colors cursor-pointer">
              Home
            </button>
            <span>/</span>
            <span className="text-slate-900 font-medium">Department Directory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            BCA Academic Faculties
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Department of Computer Applications • Faculty Mentors and Course Coordinators.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search faculty or specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 text-xs sm:text-sm rounded-full border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Faculty Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-slate-50 rounded-3xl border border-slate-100 space-y-2">
            <Users className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No records yet</p>
            <p className="text-xs text-slate-400">Faculty members can be added and assigned in the Admin Portal.</p>
          </div>
        ) : (
          filtered.map((f) => {
            const isActive = f.id === activeFaculty?.id;
            const initials = f.name
              ? f.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
              : 'FA';

            return (
              <div
                key={f.id}
                className={`bg-white rounded-2xl p-6 border transition-all shadow-sm flex flex-col justify-between ${
                  isActive
                    ? 'border-slate-900 ring-1 ring-slate-900/10'
                    : 'border-slate-100 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-900 font-bold text-base flex items-center justify-center flex-shrink-0">
                        {initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-base">{f.name}</h3>
                          {isActive && (
                            <span className="bg-slate-900 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <Check className="w-3 h-3" /> Current User
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{f.designation}</p>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{f.office || 'Faculty Office'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-900 font-medium">{f.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{f.assignedStudentsCount || 0} Assigned Student Mentees</span>
                    </div>
                  </div>

                  {/* Courses */}
                  <div className="mt-4">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Teaching Allocations
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(f.courses || []).length === 0 ? (
                        <span className="text-[11px] text-slate-400 italic">No courses currently assigned</span>
                      ) : (
                        (f.courses || []).map((c) => (
                          <span
                            key={c}
                            className="bg-slate-50 border border-slate-100 text-slate-700 text-[11px] font-medium px-3 py-1 rounded-full"
                          >
                            {c}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Action */}
                <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Spec: {f.specialization || 'BCA Core'}</span>
                  <button
                    onClick={() => onSelectFaculty(f)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-slate-100 text-slate-400 cursor-default'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    {isActive ? 'Active Workspace' : 'Switch to this Faculty'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
