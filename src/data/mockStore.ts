import {
  User,
  Department,
  SemesterInfo,
  ClassSection,
  Student,
  FacultyMember,
  StudentAssignment,
  AttendanceSettings,
  WorkingDay,
  SmsTemplate,
  SmsMessage,
  CounselingReferral,
  CounselingNote,
  AuditLog,
  DepartmentNotice
} from '../types';

export const DEPARTMENTS: Department[] = [
  { id: 'dept-bca', name: 'Department of Computer Applications', code: 'BCA' },
  { id: 'dept-it', name: 'Department of Information Technology', code: 'IT' }
];

export const SEMESTERS: SemesterInfo[] = [
  { id: 'sem-1', number: 1, name: 'Sem 1', year: 1, typicalStatus: 'Active when first-year odd semester is running', startDate: '2026-08-01', endDate: '2026-12-15', isCurrent: true, totalEnrolled: 128 },
  { id: 'sem-2', number: 2, name: 'Sem 2', year: 1, typicalStatus: 'Active when first-year even semester is running', startDate: '2027-01-10', endDate: '2027-05-20', isCurrent: false, totalEnrolled: 128 },
  { id: 'sem-3', number: 3, name: 'Sem 3', year: 2, typicalStatus: 'Active when second-year odd semester is running', startDate: '2026-08-01', endDate: '2026-12-15', isCurrent: true, totalEnrolled: 140 },
  { id: 'sem-4', number: 4, name: 'Sem 4', year: 2, typicalStatus: 'Active when second-year even semester is running', startDate: '2027-01-10', endDate: '2027-05-20', isCurrent: false, totalEnrolled: 134 },
  { id: 'sem-5', number: 5, name: 'Sem 5', year: 3, typicalStatus: 'Active when third-year odd semester is running', startDate: '2026-08-01', endDate: '2026-12-15', isCurrent: true, totalEnrolled: 136 },
  { id: 'sem-6', number: 6, name: 'Sem 6', year: 3, typicalStatus: 'Active when third-year even semester is running', startDate: '2027-01-10', endDate: '2027-05-20', isCurrent: false, totalEnrolled: 130 }
];

export const CLASSES: ClassSection[] = [
  { id: 'cls-501', semesterId: 'sem-5', section: 'A', year: '2026-27', name: 'BCA 5th Sem - Section A', courseCode: 'BCA-501', subjectName: 'Enterprise Web Architecture', assignedFacultyId: 'fac-1', roomNo: 'Lab 3 / Block B' },
  { id: 'cls-502', semesterId: 'sem-5', section: 'A', year: '2026-27', name: 'BCA 5th Sem - Section A', courseCode: 'BCA-502', subjectName: 'Database Administration', assignedFacultyId: 'fac-2', roomNo: 'Room 204' },
  { id: 'cls-301', semesterId: 'sem-3', section: 'A', year: '2026-27', name: 'BCA 3rd Sem - Section A', courseCode: 'BCA-301', subjectName: 'OOP with C++', assignedFacultyId: 'fac-4', roomNo: 'Room 105' },
  { id: 'cls-303', semesterId: 'sem-3', section: 'B', year: '2026-27', name: 'BCA 3rd Sem - Section B', courseCode: 'BCA-303', subjectName: 'Data Structures & Algorithms', assignedFacultyId: 'fac-1', roomNo: 'Lab 1' },
  { id: 'cls-101', semesterId: 'sem-1', section: 'A', year: '2026-27', name: 'BCA 1st Sem - Section A', courseCode: 'BCA-101', subjectName: 'Computer Fundamentals', assignedFacultyId: 'fac-3', roomNo: 'Room 101' },
  { id: 'cls-601', semesterId: 'sem-6', section: 'A', year: '2026-27', name: 'BCA 6th Sem - Section A', courseCode: 'BCA-601', subjectName: 'AI & Machine Learning Capstone', assignedFacultyId: 'fac-3', roomNo: 'AI Lab' }
];

export const INITIAL_FACULTY: FacultyMember[] = [
  {
    id: 'fac-1',
    name: 'Dr. Sarah Jenkins',
    designation: 'Associate Professor & BCA Coordinator',
    department: 'Computer Applications',
    email: 'sarah.jenkins@bcafly.edu',
    phone: '+1 (555) 900-1122',
    office: 'Academic Block B, Room 304',
    assignedStudentsCount: 42,
    specialization: 'Cloud Computing & Distributed Systems',
    courses: ['BCA-501 Enterprise Web Architecture', 'BCA-303 Data Structures']
  },
  {
    id: 'fac-2',
    name: 'Prof. Rajesh Sharma',
    designation: 'Head of Department & Professor',
    department: 'Computer Applications',
    email: 'rajesh.sharma@bcafly.edu',
    phone: '+1 (555) 900-2233',
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
    phone: '+1 (555) 900-3344',
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
    phone: '+1 (555) 900-4455',
    office: 'Computing Center 2',
    assignedStudentsCount: 35,
    specialization: 'Object Oriented Programming & C++',
    courses: ['BCA-301 OOP with C++', 'BCA-102 Problem Solving with C']
  }
];

export const INITIAL_COUNSELORS: User[] = [
  {
    id: 'counselor-1',
    name: 'Dr. Priya Sharma',
    email: 'priya.counselor@bcafly.edu',
    role: 'counselor',
    phone: '+1 (555) 888-1001',
    departmentId: 'dept-bca',
    isActive: true,
    createdAt: '2025-01-15',
    designation: 'Head of Student Psychological & Academic Well-being'
  },
  {
    id: 'counselor-2',
    name: 'Daniel Roberts, M.S.',
    email: 'daniel.roberts@bcafly.edu',
    role: 'counselor',
    phone: '+1 (555) 888-1002',
    departmentId: 'dept-bca',
    isActive: true,
    createdAt: '2025-03-20',
    designation: 'Student Academic Counselor'
  }
];

export const INITIAL_ADMINS: User[] = [
  {
    id: 'admin-1',
    name: 'Academic Dean Dr. V. Swaminathan',
    email: 'dean.academic@bcafly.edu',
    role: 'admin',
    phone: '+1 (555) 777-0001',
    departmentId: 'dept-bca',
    isActive: true,
    createdAt: '2024-06-01',
    designation: 'Chief Academic Administrator & Controller of Examinations'
  },
  {
    id: 'admin-2',
    name: 'Registrar Office IT Cell',
    email: 'admin.office@bcafly.edu',
    role: 'admin',
    phone: '+1 (555) 777-0002',
    departmentId: 'dept-bca',
    isActive: true,
    createdAt: '2024-06-01',
    designation: 'System Administrator & SMS Gateway Manager'
  }
];

export const INITIAL_STUDENTS: Student[] = [
  // Prominently featured demo student from requirement: Christian Wolf (Roll 2024260, Batch 2024–2027, Sem 1)
  {
    id: 's-christian',
    studentId: '2024260',
    name: 'Christian Wolf',
    initials: 'CW',
    avatarBg: 'bg-slate-100',
    avatarText: 'text-slate-900',
    course: 'BCA',
    semester: 1,
    section: 'A',
    email: 'christian.wolf@student.bcafly.edu',
    phone: '+1 (555) 260-1001',
    parentPhone: '+1 (555) 987-2601',
    attendanceRate: 85,
    mentoringStatus: 'Regular',
    cgpa: 0,
    sgpaHistory: [],
    assignedFaculty: 'Dr. Sarah Jenkins',
    assignedFacultyId: 'fac-1',
    lastMentoringDate: 'Sep 24, 2026',
    weeklyAttendance: [84, 85, 86, 85, 84, 85],
    totalClassesHeld: 72,
    totalClassesAttended: 61,
    condonationEligible: false,
    mentoringNotes: [],
    subjectGrades: [
      { subjectCode: 'BCA101', subjectName: 'Fundamentals of Computers', internalMax: 30, internalObtained: 25, attendancePercent: 85, grade: 'Pending', status: 'Draft' },
      { subjectCode: 'BCA102', subjectName: 'Programming in C', internalMax: 30, internalObtained: 26, attendancePercent: 82, grade: 'Pending', status: 'Draft' },
      { subjectCode: 'BCA103', subjectName: 'Digital Electronics', internalMax: 30, internalObtained: 21, attendancePercent: 74, grade: 'At Risk', status: 'Draft' }
    ]
  },
  {
    id: 's-1',
    studentId: '2024089',
    name: 'Alex Smith',
    initials: 'AS',
    avatarBg: 'bg-slate-100',
    avatarText: 'text-slate-900',
    course: 'BCA',
    semester: 5,
    section: 'A',
    email: 'alex.smith@student.bcafly.edu',
    phone: '+1 (555) 234-5678',
    parentPhone: '+1 (555) 987-1001',
    attendanceRate: 94,
    mentoringStatus: 'Honor Roll',
    cgpa: 8.92,
    sgpaHistory: [8.8, 8.75, 8.9, 9.1, 8.92, 0],
    assignedFaculty: 'Dr. Sarah Jenkins',
    assignedFacultyId: 'fac-1',
    lastMentoringDate: 'Sep 28, 2026',
    weeklyAttendance: [95, 92, 94, 96, 90, 97],
    totalClassesHeld: 84,
    totalClassesAttended: 79,
    condonationEligible: false,
    mentoringNotes: [
      {
        id: 'mn-1',
        date: 'Sep 28, 2026',
        facultyName: 'Dr. Sarah Jenkins',
        facultyId: 'fac-1',
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
    avatarBg: 'bg-slate-100',
    avatarText: 'text-slate-700',
    course: 'BCA',
    semester: 3,
    section: 'A',
    email: 'jessica.davis@student.bcafly.edu',
    phone: '+1 (555) 345-6789',
    parentPhone: '+1 (555) 987-1002',
    attendanceRate: 78,
    mentoringStatus: 'Mentoring',
    cgpa: 7.15,
    sgpaHistory: [7.3, 7.1, 7.05, 0, 0, 0],
    assignedFaculty: 'Dr. Sarah Jenkins',
    assignedFacultyId: 'fac-1',
    lastMentoringDate: 'Oct 02, 2026',
    weeklyAttendance: [80, 75, 78, 82, 74, 79],
    totalClassesHeld: 80,
    totalClassesAttended: 62,
    condonationEligible: false,
    mentoringNotes: [
      {
        id: 'mn-2',
        date: 'Oct 02, 2026',
        facultyName: 'Dr. Sarah Jenkins',
        facultyId: 'fac-1',
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
    id: 's-5',
    studentId: '2024138',
    name: 'Marcus Thorne',
    initials: 'MT',
    avatarBg: 'bg-slate-200',
    avatarText: 'text-slate-900',
    course: 'BCA',
    semester: 5,
    section: 'A',
    email: 'marcus.t@student.bcafly.edu',
    phone: '+1 (555) 678-9012',
    parentPhone: '+1 (555) 987-1005',
    attendanceRate: 71,
    mentoringStatus: 'Academic Concern',
    cgpa: 6.20,
    sgpaHistory: [6.8, 6.4, 6.1, 6.0, 6.2, 0],
    assignedFaculty: 'Dr. Sarah Jenkins',
    assignedFacultyId: 'fac-1',
    lastMentoringDate: 'Oct 01, 2026',
    weeklyAttendance: [70, 72, 75, 71, 68, 76],
    totalClassesHeld: 84,
    totalClassesAttended: 60,
    condonationEligible: true,
    condonationStatus: 'Pending',
    mentoringNotes: [
      {
        id: 'mn-3',
        date: 'Oct 01, 2026',
        facultyName: 'Dr. Sarah Jenkins',
        facultyId: 'fac-1',
        topic: 'Low Attendance Notice & Counseling Recommendation',
        notes: 'Attendance has dropped to 71%, below the mandatory 75% threshold. Recommended for academic stress counseling referral.',
        actionItems: 'Attend counseling session and submit medical records for condonation approval.',
        status: 'Follow-up Required'
      }
    ],
    subjectGrades: [
      { subjectCode: 'BCA-501', subjectName: 'Enterprise Web Architecture', internalMax: 30, internalObtained: 17, attendancePercent: 70, grade: 'C+', status: 'Draft' }
    ]
  },
  {
    id: 's-6',
    studentId: '2024142',
    name: 'Priya Patel',
    initials: 'PP',
    avatarBg: 'bg-slate-100',
    avatarText: 'text-slate-900',
    course: 'BCA',
    semester: 5,
    section: 'A',
    email: 'priya.patel@student.bcafly.edu',
    phone: '+1 (555) 789-0123',
    parentPhone: '+1 (555) 987-1006',
    attendanceRate: 96,
    mentoringStatus: 'Honor Roll',
    cgpa: 9.35,
    sgpaHistory: [9.2, 9.4, 9.5, 9.3, 9.35, 0],
    assignedFaculty: 'Dr. Sarah Jenkins',
    assignedFacultyId: 'fac-1',
    lastMentoringDate: 'Sep 25, 2026',
    weeklyAttendance: [96, 95, 97, 96, 98, 95],
    totalClassesHeld: 84,
    totalClassesAttended: 81,
    condonationEligible: false,
    mentoringNotes: [],
    subjectGrades: []
  },
  // Student assigned to Prof. Rajesh Sharma to demonstrate scoped access:
  {
    id: 's-v1',
    studentId: '2024201',
    name: 'Kavita Rao',
    initials: 'KR',
    avatarBg: 'bg-slate-100',
    avatarText: 'text-slate-900',
    course: 'BCA',
    semester: 4,
    section: 'A',
    email: 'kavita.rao@student.bcafly.edu',
    phone: '+1 (555) 890-4455',
    parentPhone: '+1 (555) 987-2001',
    attendanceRate: 88,
    mentoringStatus: 'Regular',
    cgpa: 8.20,
    sgpaHistory: [8.1, 8.3, 8.2, 0, 0, 0],
    assignedFaculty: 'Prof. Rajesh Sharma',
    assignedFacultyId: 'fac-2',
    lastMentoringDate: 'Sep 20, 2026',
    weeklyAttendance: [88, 87, 89, 88, 90, 88],
    totalClassesHeld: 76,
    totalClassesAttended: 67,
    condonationEligible: false,
    mentoringNotes: [],
    subjectGrades: []
  },
  // Student assigned to Prof. David Vance to demonstrate scoped access:
  {
    id: 's-v2',
    studentId: '2024202',
    name: 'Devin Cole',
    initials: 'DC',
    avatarBg: 'bg-slate-100',
    avatarText: 'text-slate-900',
    course: 'BCA',
    semester: 3,
    section: 'A',
    email: 'devin.cole@student.bcafly.edu',
    phone: '+1 (555) 890-7788',
    parentPhone: '+1 (555) 987-3001',
    attendanceRate: 68,
    mentoringStatus: 'Academic Concern',
    cgpa: 6.40,
    sgpaHistory: [6.7, 6.2, 6.3, 0, 0, 0],
    assignedFaculty: 'Prof. David Vance',
    assignedFacultyId: 'fac-4',
    lastMentoringDate: 'Sep 18, 2026',
    weeklyAttendance: [66, 68, 70, 67, 69, 68],
    totalClassesHeld: 80,
    totalClassesAttended: 54,
    condonationEligible: true,
    condonationStatus: 'Debarred',
    mentoringNotes: [],
    subjectGrades: []
  }
];

// Seed additional students across Semesters 1 to 6 to accurately model the ~800 users ecosystem
const POOL_NAMES = [
  'Arjun Verma', 'Sofia Rossi', 'Mateo Silva', 'Nina Kowalski', 'Ethan Brooks',
  'Hanna Becker', 'Vikram Das', 'Grace O\'Connor', 'Oliver Scott', 'Maya Patel',
  'Devon Bailey', 'Amara Okafor', 'Felix Moreau', 'Aisha Khan', 'Leo Dubois',
  'Sunita Rao', 'Zachary Bell', 'Mira Jensen', 'Christian Wolf', 'Elena Popova',
  'Gabriel Santos', 'Siddharth Nair', 'Leila Haddad', 'Tobias Lind', 'Camila Gomez',
  'Kenji Sato', 'Aarav Gupta', 'Isabella Morales', 'Kiran Joshi', 'Chloe Bennett',
  'Lucas Fernandez', 'Rohan Mehta', 'Ananya Roy', 'Daniel Kim', 'Emily Watson'
];

for (let i = 7; i <= 60; i++) {
  const name = POOL_NAMES[(i - 7) % POOL_NAMES.length] + (i > 35 ? ` (${i})` : '');
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);
  const semNumber = ((i % 6) + 1);
  const facultyIdx = i % 4; // fac-1, fac-2, fac-3, fac-4
  const assignedFac = INITIAL_FACULTY[facultyIdx];
  const attendance = 68 + ((i * 7) % 31); // 68% to 99%
  let status: Student['mentoringStatus'] = 'Regular';
  if (attendance > 92) status = 'Honor Roll';
  else if (attendance < 75) status = 'Academic Concern';
  else if (i % 5 === 0) status = 'Mentoring';

  const classesHeld = 75 + (i % 15);
  const classesAttended = Math.round((classesHeld * attendance) / 100);

  INITIAL_STUDENTS.push({
    id: `s-gen-${i}`,
    studentId: `2024${(200 + i).toString().padStart(3, '0')}`,
    name,
    initials,
    avatarBg: 'bg-slate-100',
    avatarText: 'text-slate-800',
    course: 'BCA',
    semester: semNumber,
    section: i % 2 === 0 ? 'A' : 'B',
    email: `${name.toLowerCase().replace(/[^a-z]/g, '.')}@student.bcafly.edu`,
    phone: `+1 (555) 200-${3000 + i}`,
    parentPhone: `+1 (555) 987-${4000 + i}`,
    attendanceRate: attendance,
    mentoringStatus: status,
    cgpa: Number((6.5 + ((i * 11) % 33) / 10).toFixed(2)),
    sgpaHistory: [7.2, 7.5, 7.4, 7.6, 7.8, 8.0].slice(0, semNumber),
    assignedFaculty: assignedFac.name,
    assignedFacultyId: assignedFac.id,
    lastMentoringDate: 'Sep 22, 2026',
    weeklyAttendance: [attendance - 2, attendance + 1, attendance, attendance - 1, attendance + 2, attendance],
    totalClassesHeld: classesHeld,
    totalClassesAttended: classesAttended,
    condonationEligible: attendance < 75 && attendance >= 65,
    condonationStatus: attendance < 75 ? (attendance >= 68 ? 'Pending' : 'Debarred') : undefined,
    mentoringNotes: [],
    subjectGrades: []
  });
}

// Student Assignments
export const INITIAL_ASSIGNMENTS: StudentAssignment[] = INITIAL_STUDENTS.map((st) => ({
  id: `asg-${st.id}`,
  studentId: st.id,
  facultyId: st.assignedFacultyId,
  semesterId: `sem-${st.semester}`,
  classId: st.semester === 5 ? 'cls-501' : (st.semester === 3 ? 'cls-301' : undefined),
  reason: 'mentor',
  startDate: '2026-08-01'
}));

// Working Days Calendar (Simulating current month - September 2026)
export const INITIAL_WORKING_DAYS: WorkingDay[] = [
  { id: 'wd-1', date: '2026-09-01', dayOfWeek: 'Tuesday', isWorking: true },
  { id: 'wd-2', date: '2026-09-02', dayOfWeek: 'Wednesday', isWorking: true },
  { id: 'wd-3', date: '2026-09-03', dayOfWeek: 'Thursday', isWorking: true },
  { id: 'wd-4', date: '2026-09-04', dayOfWeek: 'Friday', isWorking: true, reason: 'Today (Demo Working Day)' },
  { id: 'wd-5', date: '2026-09-05', dayOfWeek: 'Saturday', isWorking: false, reason: 'Weekend' },
  { id: 'wd-6', date: '2026-09-06', dayOfWeek: 'Sunday', isWorking: false, reason: 'Weekend' },
  { id: 'wd-7', date: '2026-09-07', dayOfWeek: 'Monday', isWorking: false, reason: 'Labor Day (Gazetted Holiday)' },
  { id: 'wd-8', date: '2026-09-08', dayOfWeek: 'Tuesday', isWorking: true },
  { id: 'wd-9', date: '2026-09-09', dayOfWeek: 'Wednesday', isWorking: true },
  { id: 'wd-10', date: '2026-09-10', dayOfWeek: 'Thursday', isWorking: true },
  { id: 'wd-11', date: '2026-09-11', dayOfWeek: 'Friday', isWorking: true },
  { id: 'wd-12', date: '2026-09-12', dayOfWeek: 'Saturday', isWorking: false, reason: 'Weekend' },
  { id: 'wd-13', date: '2026-09-13', dayOfWeek: 'Sunday', isWorking: false, reason: 'Weekend' }
];

export const INITIAL_ATTENDANCE_SETTINGS: AttendanceSettings = {
  dailyCutoffTime: '11:30',
  cutoffEnforced: true,
  autoSmsOnFinalize: true,
  smsWorkingDaysOnly: true
};

export const INITIAL_SMS_TEMPLATES: SmsTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Daily Absence Notification',
    body: 'BcaFly Alert: Dear Parent/Guardian, {student_name} (Roll: {roll_no}) was marked ABSENT today {date} in {class_name}. University regulations mandate min 75% attendance.',
    variables: ['{student_name}', '{roll_no}', '{date}', '{class_name}'],
    isActive: true
  },
  {
    id: 'tpl-2',
    name: 'Low Attendance Debarment Warning',
    body: 'CRITICAL ALERT: {student_name}\'s aggregate attendance is {attendance_rate}%, which falls below the mandatory 75% threshold. Please meet mentor {faculty_name}.',
    variables: ['{student_name}', '{attendance_rate}', '{faculty_name}'],
    isActive: true
  },
  {
    id: 'tpl-3',
    name: 'Mentoring Session Notice',
    body: 'Reminder: 1-on-1 Mentorship session with {faculty_name} is scheduled on {session_date}. Venue: {venue}. Please bring your lab progress log.',
    variables: ['{faculty_name}', '{session_date}', '{venue}'],
    isActive: true
  }
];

export const INITIAL_SMS_MESSAGES: SmsMessage[] = [
  {
    id: 'sms-1',
    studentId: 's-5',
    studentName: 'Marcus Thorne',
    recipientPhone: '+1 (555) 987-1005',
    recipientType: 'Parent',
    templateId: 'tpl-1',
    body: 'BcaFly Alert: Dear Parent/Guardian, Marcus Thorne (Roll: 2024138) was marked ABSENT today 2026-09-04 in BCA-501 Enterprise Web. University regulations mandate min 75% attendance.',
    channel: 'SMS-Gateway-Demo',
    status: 'sent',
    sentAt: '2026-09-04 11:35:12',
    providerMessageId: 'msg-prov-90219412',
    idempotencyKey: 'idemp-20260904-s-5-cls501',
    isWorkingDay: true
  },
  {
    id: 'sms-2',
    studentId: 's-5',
    studentName: 'Marcus Thorne',
    recipientPhone: '+1 (555) 678-9012',
    recipientType: 'Student',
    templateId: 'tpl-2',
    body: 'CRITICAL ALERT: Marcus Thorne\'s aggregate attendance is 71%, which falls below the mandatory 75% threshold. Please meet mentor Dr. Sarah Jenkins.',
    channel: 'SMS-Gateway-Demo',
    status: 'sent',
    sentAt: '2026-09-03 14:10:04',
    providerMessageId: 'msg-prov-88192011',
    idempotencyKey: 'idemp-20260903-s-5-shortage',
    isWorkingDay: true
  }
];

export const INITIAL_COUNSELING_REFERRALS: CounselingReferral[] = [
  {
    id: 'ref-1',
    studentId: 's-5',
    studentName: 'Marcus Thorne',
    semester: 5,
    referredByFacultyId: 'fac-1',
    referredByFacultyName: 'Dr. Sarah Jenkins',
    counselorId: 'counselor-1',
    counselorName: 'Dr. Priya Sharma',
    reasonCode: 'attendance_deficit',
    facultyRemarks: 'Severe attendance drop (71%) over past 4 weeks with reported sleep cycle disruption and anxiety regarding Capstone lab viva.',
    status: 'in_progress',
    mentorVisibleStatus: 'Session Scheduled',
    createdAt: '2026-09-02 10:15 AM',
    notesCount: 2
  },
  {
    id: 'ref-2',
    studentId: 's-2',
    studentName: 'Jessica Davis',
    semester: 3,
    referredByFacultyId: 'fac-1',
    referredByFacultyName: 'Dr. Sarah Jenkins',
    counselorId: 'counselor-1',
    counselorName: 'Dr. Priya Sharma',
    reasonCode: 'academic_stress',
    facultyRemarks: 'Struggling with Data Structures pointer concepts and experiencing performance anxiety during timed lab assessments.',
    status: 'in_progress',
    mentorVisibleStatus: 'Action Plan Recommended',
    createdAt: '2026-09-03 03:40 PM',
    notesCount: 1
  }
];

// Strictly confidential to Counselor! Faculty CANNOT read this.
export const INITIAL_COUNSELING_NOTES: CounselingNote[] = [
  {
    id: 'cnote-1',
    referralId: 'ref-1',
    noteText: 'Conducted 45-min diagnostic intake. Student confirmed severe burnout from late-night remote gig work impacting morning attendance. Showing symptoms of moderate anxiety.',
    treatmentPlan: 'Advised sleep hygiene protocol, structured 3-week attendance pacing schedule, and scheduled follow-up session for Sep 10.',
    createdByCounselorId: 'counselor-1',
    createdByCounselorName: 'Dr. Priya Sharma',
    createdAt: '2026-09-03 11:30 AM',
    isConfidential: true
  },
  {
    id: 'cnote-2',
    referralId: 'ref-2',
    noteText: 'Jessica identified math test phobia triggered by high school failures. Practiced progressive relaxation and cognitive reframing for lab exams.',
    treatmentPlan: 'Pair with peer tutor in Lab 2; review test results in two weeks.',
    createdByCounselorId: 'counselor-1',
    createdByCounselorName: 'Dr. Priya Sharma',
    createdAt: '2026-09-04 09:15 AM',
    isConfidential: true
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-1',
    actorUserId: 'fac-1',
    actorName: 'Dr. Sarah Jenkins',
    actorRole: 'faculty',
    action: 'ATTENDANCE_FINALIZED',
    entityType: 'attendance',
    entityId: 'att-20260904-cls501',
    beforeJson: '{"status": "draft", "present": 38, "absent": 4}',
    afterJson: '{"status": "finalized", "present": 38, "absent": 4, "sms_triggered": 4}',
    ip: '192.168.1.45',
    createdAt: '2026-09-04 11:35:10'
  },
  {
    id: 'audit-2',
    actorUserId: 'fac-1',
    actorName: 'Dr. Sarah Jenkins',
    actorRole: 'faculty',
    action: 'COUNSELING_REFERRAL_CREATED',
    entityType: 'counseling',
    entityId: 'ref-1',
    afterJson: '{"student": "Marcus Thorne", "reason": "attendance_deficit"}',
    ip: '192.168.1.45',
    createdAt: '2026-09-02 10:15:22'
  },
  {
    id: 'audit-3',
    actorUserId: 'admin-1',
    actorName: 'Academic Dean Dr. V. Swaminathan',
    actorRole: 'admin',
    action: 'SETTINGS_CUTOFF_UPDATED',
    entityType: 'settings',
    entityId: 'settings-1',
    beforeJson: '{"dailyCutoffTime": "12:00"}',
    afterJson: '{"dailyCutoffTime": "11:30"}',
    ip: '10.0.0.12',
    createdAt: '2026-09-01 08:30:00'
  }
];

export const INITIAL_NOTICES: DepartmentNotice[] = [
  {
    id: 'notice-1',
    title: 'Department Circular: Attendance Cutoff & Condonation',
    subtitle: 'Strict 75% attendance rule for Term Examinations',
    date: 'Today, 09:30 AM',
    isNew: true,
    priority: 'Urgent',
    deadline: 'Oct 15, 2026',
    actionLabel: 'Open Shortage Register',
    body: 'The Academic Council has reaffirmed that all students falling below 75% mandatory attendance will be flagged on the Shortage Register. Medical condonation requires verified hospital records submitted by Friday.'
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
  }
];

export {
  INITIAL_COURSES,
  INITIAL_FACULTY_COURSE_ASSIGNMENTS,
  INITIAL_STUDENT_COURSE_ENROLLMENTS,
  INITIAL_COURSE_MARKS,
  INITIAL_COURSE_ATTENDANCE
} from './courseData';

