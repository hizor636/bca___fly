import { Student, DepartmentNotice, FacultyMember } from '../types';

export const INITIAL_NOTICES: DepartmentNotice[] = [
  {
    id: 'notice-1',
    title: 'Department Update',
    subtitle: 'Mid-semester grade submissions open',
    date: 'Today, 09:30 AM',
    isNew: true,
    priority: 'Urgent',
    deadline: 'Oct 15, 2026',
    actionLabel: 'Open Grade Sheet',
    body: 'The Academic Council has opened the portal for submitting Mid-Semester Internal Assessment grades for BCA Semesters 3 and 5. All mentor faculty must verify internal attendance cutoff criteria (75%) prior to final sign-off.'
  },
  {
    id: 'notice-2',
    title: 'Mentoring Cycle Q3',
    subtitle: '1-on-1 Academic Review meetings scheduled',
    date: 'Yesterday',
    isNew: false,
    priority: 'Normal',
    deadline: 'Oct 22, 2026',
    actionLabel: 'Schedule Sessions',
    body: 'Please conduct individual mentoring sessions for all allocated students with attendance below 80% or CGPA under 6.5. Log notes directly into BcaFly.'
  },
  {
    id: 'notice-3',
    title: 'Guest Lecture on Cloud Infrastructure',
    subtitle: 'BCA Sem 5 mandatory session on Friday',
    date: '3 days ago',
    isNew: false,
    priority: 'Normal',
    actionLabel: 'View Schedule',
    body: 'Senior Architect from CloudScale Tech will deliver a hands-on workshop in Lab 4 for BCA 5th Semester students.'
  }
];

export const INITIAL_FACULTY: FacultyMember[] = [
  {
    id: 'fac-1',
    name: 'Dr. Sarah Jenkins',
    designation: 'Associate Professor & BCA Coordinator',
    department: 'Computer Applications',
    email: 'sarah.jenkins@bcafly.edu',
    office: 'Academic Block B, Room 304',
    assignedStudentsCount: 42,
    specialization: 'Cloud Computing & Distributed Systems',
    courses: ['BCA-501 Enterprise Web Architecture', 'BCA-303 Data Structures']
  },
  {
    id: 'fac-2',
    name: 'Prof. Rajesh Sharma',
    designation: 'Head of Department',
    department: 'Computer Applications',
    email: 'rajesh.sharma@bcafly.edu',
    office: 'Admin Block, HOD Cabin 12',
    assignedStudentsCount: 38,
    specialization: 'Database Systems & Information Security',
    courses: ['BCA-502 Database Administration', 'BCA-401 Computer Networks']
  },
  {
    id: 'fac-3',
    name: 'Dr. Priya Nambiar',
    designation: 'Assistant Professor',
    department: 'Computer Applications',
    email: 'priya.nambiar@bcafly.edu',
    office: 'Academic Block B, Room 310',
    assignedStudentsCount: 40,
    specialization: 'Machine Learning & Python Analytics',
    courses: ['BCA-503 Python & AI Lab', 'BCA-201 Discrete Mathematics']
  },
  {
    id: 'fac-4',
    name: 'Prof. David Vance',
    designation: 'Senior Lecturer & Lab In-charge',
    department: 'Computer Applications',
    email: 'david.vance@bcafly.edu',
    office: 'Computing Center 2',
    assignedStudentsCount: 35,
    specialization: 'Object Oriented Programming & C++',
    courses: ['BCA-301 OOP with C++', 'BCA-102 Problem Solving with C']
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 's-1',
    studentId: '2024089',
    name: 'Alex Smith',
    initials: 'AS',
    avatarBg: 'bg-[#dbe4ff]',
    avatarText: 'text-[#004ac6]',
    course: 'BCA',
    semester: 5,
    email: 'alex.smith@student.bcafly.edu',
    phone: '+1 (555) 234-5678',
    attendanceRate: 94,
    mentoringStatus: 'Honor Roll',
    cgpa: 8.92,
    assignedFaculty: 'Dr. Sarah Jenkins',
    lastMentoringDate: 'Sep 28, 2026',
    weeklyAttendance: [95, 92, 94, 96, 90, 97],
    mentoringNotes: [
      {
        id: 'mn-1',
        date: 'Sep 28, 2026',
        facultyName: 'Dr. Sarah Jenkins',
        topic: 'Capstone Project Proposal & Industry Internship',
        notes: 'Alex presented an outstanding proposal for a microservices-based healthcare portal. Discussed internship applications with partner tech firms.',
        actionItems: 'Submit draft chapter 1 by Oct 12 and finalize tech stack selection.',
        status: 'Resolved'
      }
    ],
    subjectGrades: [
      { subjectCode: 'BCA-501', subjectName: 'Enterprise Web Architecture', internalMax: 30, internalObtained: 28, attendancePercent: 96, grade: 'A+', status: 'Submitted' },
      { subjectCode: 'BCA-502', subjectName: 'Database Administration', internalMax: 30, internalObtained: 27, attendancePercent: 94, grade: 'A', status: 'Submitted' },
      { subjectCode: 'BCA-503', subjectName: 'Python & AI Analytics', internalMax: 30, internalObtained: 29, attendancePercent: 92, grade: 'A+', status: 'Submitted' }
    ]
  },
  {
    id: 's-2',
    studentId: '2024112',
    name: 'Jessica Davis',
    initials: 'JD',
    avatarBg: 'bg-[#e2e8f0]',
    avatarText: 'text-slate-600',
    course: 'BCA',
    semester: 3,
    email: 'jessica.davis@student.bcafly.edu',
    phone: '+1 (555) 345-6789',
    attendanceRate: 78,
    mentoringStatus: 'Mentoring',
    cgpa: 7.15,
    assignedFaculty: 'Dr. Sarah Jenkins',
    lastMentoringDate: 'Oct 02, 2026',
    weeklyAttendance: [80, 75, 78, 82, 74, 79],
    mentoringNotes: [
      {
        id: 'mn-2',
        date: 'Oct 02, 2026',
        facultyName: 'Dr. Sarah Jenkins',
        topic: 'Data Structures Practical Lab Backlog',
        notes: 'Jessica fell ill during week 4 and missed two key pointer & linked list labs. Explained memory allocation concepts and scheduled catch-up lab.',
        actionItems: 'Complete lab assignment #4 and submit to Teaching Assistant by Monday.',
        status: 'Follow-up Required'
      }
    ],
    subjectGrades: [
      { subjectCode: 'BCA-301', subjectName: 'OOP with C++', internalMax: 30, internalObtained: 22, attendancePercent: 82, grade: 'B+', status: 'Draft' },
      { subjectCode: 'BCA-302', subjectName: 'Computer Architecture', internalMax: 30, internalObtained: 24, attendancePercent: 80, grade: 'A-', status: 'Draft' },
      { subjectCode: 'BCA-303', subjectName: 'Data Structures & Algorithms', internalMax: 30, internalObtained: 19, attendancePercent: 73, grade: 'B', status: 'Pending Review' }
    ]
  },
  {
    id: 's-3',
    studentId: '2024095',
    name: 'Rohan Mehta',
    initials: 'RM',
    avatarBg: 'bg-emerald-100',
    avatarText: 'text-emerald-700',
    course: 'BCA',
    semester: 5,
    email: 'rohan.mehta@student.bcafly.edu',
    phone: '+1 (555) 456-7890',
    attendanceRate: 91,
    mentoringStatus: 'Regular',
    cgpa: 8.45,
    assignedFaculty: 'Dr. Sarah Jenkins',
    lastMentoringDate: 'Sep 20, 2026',
    weeklyAttendance: [90, 92, 89, 91, 94, 90],
    mentoringNotes: [],
    subjectGrades: [
      { subjectCode: 'BCA-501', subjectName: 'Enterprise Web Architecture', internalMax: 30, internalObtained: 26, attendancePercent: 92, grade: 'A', status: 'Submitted' },
      { subjectCode: 'BCA-502', subjectName: 'Database Administration', internalMax: 30, internalObtained: 25, attendancePercent: 90, grade: 'A', status: 'Submitted' }
    ]
  },
  {
    id: 's-4',
    studentId: '2024103',
    name: 'Ananya Roy',
    initials: 'AR',
    avatarBg: 'bg-purple-100',
    avatarText: 'text-purple-700',
    course: 'BCA',
    semester: 3,
    email: 'ananya.roy@student.bcafly.edu',
    phone: '+1 (555) 567-8901',
    attendanceRate: 88,
    mentoringStatus: 'Regular',
    cgpa: 8.70,
    assignedFaculty: 'Dr. Sarah Jenkins',
    lastMentoringDate: 'Sep 15, 2026',
    weeklyAttendance: [88, 90, 85, 87, 90, 88],
    mentoringNotes: [],
    subjectGrades: [
      { subjectCode: 'BCA-301', subjectName: 'OOP with C++', internalMax: 30, internalObtained: 27, attendancePercent: 88, grade: 'A', status: 'Submitted' }
    ]
  },
  {
    id: 's-5',
    studentId: '2024138',
    name: 'Marcus Thorne',
    initials: 'MT',
    avatarBg: 'bg-amber-100',
    avatarText: 'text-amber-700',
    course: 'BCA',
    semester: 5,
    email: 'marcus.t@student.bcafly.edu',
    phone: '+1 (555) 678-9012',
    attendanceRate: 72,
    mentoringStatus: 'Academic Concern',
    cgpa: 6.20,
    assignedFaculty: 'Dr. Sarah Jenkins',
    lastMentoringDate: 'Oct 01, 2026',
    weeklyAttendance: [70, 72, 75, 71, 68, 76],
    mentoringNotes: [
      {
        id: 'mn-3',
        date: 'Oct 01, 2026',
        facultyName: 'Dr. Sarah Jenkins',
        topic: 'Low Attendance Notice & Remedial Classes',
        notes: 'Attendance has dropped to 72%, below the mandatory 75% examination threshold. Advised Marcus on compensatory remedial sessions and warned about exam eligibility.',
        actionItems: 'Attend Saturday revision sessions and maintain 100% attendance in the coming 3 weeks.',
        status: 'Open'
      }
    ],
    subjectGrades: [
      { subjectCode: 'BCA-501', subjectName: 'Enterprise Web Architecture', internalMax: 30, internalObtained: 17, attendancePercent: 71, grade: 'C+', status: 'Draft' }
    ]
  },
  {
    id: 's-6',
    studentId: '2024142',
    name: 'Priya Patel',
    initials: 'PP',
    avatarBg: 'bg-rose-100',
    avatarText: 'text-rose-700',
    course: 'BCA',
    semester: 5,
    email: 'priya.patel@student.bcafly.edu',
    phone: '+1 (555) 789-0123',
    attendanceRate: 96,
    mentoringStatus: 'Honor Roll',
    cgpa: 9.35,
    assignedFaculty: 'Dr. Sarah Jenkins',
    lastMentoringDate: 'Sep 25, 2026',
    weeklyAttendance: [96, 95, 97, 96, 98, 95],
    mentoringNotes: [],
    subjectGrades: [
      { subjectCode: 'BCA-501', subjectName: 'Enterprise Web Architecture', internalMax: 30, internalObtained: 30, attendancePercent: 96, grade: 'O', status: 'Submitted' }
    ]
  },
  {
    id: 's-7',
    studentId: '2024155',
    name: 'Daniel Kim',
    initials: 'DK',
    avatarBg: 'bg-sky-100',
    avatarText: 'text-sky-700',
    course: 'BCA',
    semester: 3,
    email: 'daniel.kim@student.bcafly.edu',
    phone: '+1 (555) 890-1234',
    attendanceRate: 85,
    mentoringStatus: 'Regular',
    cgpa: 7.80,
    assignedFaculty: 'Dr. Sarah Jenkins',
    weeklyAttendance: [85, 84, 86, 85, 88, 82],
    mentoringNotes: [],
    subjectGrades: []
  },
  {
    id: 's-8',
    studentId: '2024160',
    name: 'Emily Watson',
    initials: 'EW',
    avatarBg: 'bg-indigo-100',
    avatarText: 'text-indigo-700',
    course: 'BCA',
    semester: 5,
    email: 'emily.w@student.bcafly.edu',
    phone: '+1 (555) 901-2345',
    attendanceRate: 92,
    mentoringStatus: 'Regular',
    cgpa: 8.60,
    assignedFaculty: 'Dr. Sarah Jenkins',
    weeklyAttendance: [92, 91, 93, 90, 94, 92],
    mentoringNotes: [],
    subjectGrades: []
  },
  {
    id: 's-9',
    studentId: '2024177',
    name: 'Kavita Iyer',
    initials: 'KI',
    avatarBg: 'bg-teal-100',
    avatarText: 'text-teal-700',
    course: 'BCA',
    semester: 3,
    email: 'kavita.i@student.bcafly.edu',
    phone: '+1 (555) 012-3456',
    attendanceRate: 79,
    mentoringStatus: 'Mentoring',
    cgpa: 7.40,
    assignedFaculty: 'Dr. Sarah Jenkins',
    weeklyAttendance: [78, 80, 77, 81, 79, 80],
    mentoringNotes: [],
    subjectGrades: []
  },
  {
    id: 's-10',
    studentId: '2024183',
    name: 'Tariq Al-Mansoor',
    initials: 'TM',
    avatarBg: 'bg-blue-100',
    avatarText: 'text-blue-800',
    course: 'BCA',
    semester: 5,
    email: 'tariq.m@student.bcafly.edu',
    phone: '+1 (555) 123-7890',
    attendanceRate: 90,
    mentoringStatus: 'Regular',
    cgpa: 8.25,
    assignedFaculty: 'Dr. Sarah Jenkins',
    weeklyAttendance: [90, 89, 91, 90, 92, 88],
    mentoringNotes: [],
    subjectGrades: []
  }
];

// Generate additional allocated students to reach the exact 42 assigned count
for (let i = 11; i <= 42; i++) {
  const sem = i % 2 === 0 ? 5 : 3;
  const names = [
    'Jordan Lee', 'Zara Chen', 'Lucas Fernandez', 'Chloe Bennett', 'Arjun Verma',
    'Sofia Rossi', 'Mateo Silva', 'Nina Kowalski', 'Ethan Brooks', 'Hanna Becker',
    'Vikram Das', 'Grace O\'Connor', 'Oliver Scott', 'Maya Patel', 'Devon Bailey',
    'Amara Okafor', 'Felix Moreau', 'Aisha Khan', 'Leo Dubois', 'Sunita Rao',
    'Zachary Bell', 'Mira Jensen', 'Christian Wolf', 'Elena Popova', 'Gabriel Santos',
    'Siddharth Nair', 'Leila Haddad', 'Tobias Lind', 'Camila Gomez', 'Kenji Sato',
    'Aarav Gupta', 'Isabella Morales'
  ];
  const name = names[(i - 11) % names.length] + (i > 30 ? ` Jr.` : '');
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);
  const attendance = 73 + ((i * 7) % 25); // Range 73% to 98%
  let status: Student['mentoringStatus'] = 'Regular';
  if (attendance > 92) status = 'Honor Roll';
  else if (attendance < 75) status = 'Academic Concern';
  else if (i % 6 === 0) status = 'Mentoring';

  INITIAL_STUDENTS.push({
    id: `s-${i}`,
    studentId: `2024${(100 + i).toString().padStart(3, '0')}`,
    name,
    initials,
    avatarBg: i % 3 === 0 ? 'bg-slate-100' : (i % 3 === 1 ? 'bg-blue-50' : 'bg-indigo-50'),
    avatarText: i % 3 === 0 ? 'text-slate-700' : 'text-blue-700',
    course: 'BCA',
    semester: sem,
    email: `${name.toLowerCase().replace(/[^a-z]/g, '.')}@student.bcafly.edu`,
    phone: `+1 (555) ${100 + i}-${2000 + i}`,
    attendanceRate: attendance,
    mentoringStatus: status,
    cgpa: Number((6.8 + ((i * 13) % 30) / 10).toFixed(2)),
    assignedFaculty: 'Dr. Sarah Jenkins',
    weeklyAttendance: [attendance - 2, attendance + 1, attendance, attendance - 1, attendance + 3, attendance],
    mentoringNotes: [],
    subjectGrades: []
  });
}
