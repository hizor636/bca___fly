import { dbManager } from './database.js';

export function wipeDatabase(): { clearedTables: string[]; executionTimeMs: number } {
  console.log('[Database Seeder] Nuclear wipe requested: clearing all tables...');
  return dbManager.wipeAllTables();
}

export function cleanDatabase(): void {
  console.log('[Database Seeder] Ensuring database is clean with zero demo data...');
  // Database schema is already created by dbManager.init()
}

export function seedDatabase(force = false): void {
  if (!force) {
    console.log('[Database Seeder] Skipping auto-seed (clean platform mode enabled).');
    return;
  }

  console.log('[Database Seeder] Initializing pristine database with multi-role accounts...');
  dbManager.wipeAllTables();

  // 1. Tenants
  dbManager.run(
    `INSERT OR IGNORE INTO tenants (id, name, code, domain, plan, status, student_quota, admin_email)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'tenant-1',
      'Apex University - Department of Computer Applications',
      'APEX-BCA',
      'apex.edu',
      'Enterprise Academic',
      'ACTIVE',
      2500,
      'superadmin@bcafly.edu'
    ]
  );

  // 2. Core Departments
  dbManager.run(
    'INSERT OR IGNORE INTO departments (id, name, code) VALUES (?, ?, ?)',
    ['dept-bca', 'Department of Computer Applications', 'BCA']
  );
  dbManager.run(
    'INSERT OR IGNORE INTO departments (id, name, code) VALUES (?, ?, ?)',
    ['dept-mca', 'Department of Master in Computer Applications', 'MCA']
  );

  // 3. Semesters Structure (1 to 6)
  const semesters = [
    { id: 'sem-1', number: 1, name: 'Semester 1 (Autumn)', year: 1, startDate: '2026-08-01', endDate: '2026-12-15' },
    { id: 'sem-2', number: 2, name: 'Semester 2 (Spring)', year: 1, startDate: '2027-01-05', endDate: '2027-05-20' },
    { id: 'sem-3', number: 3, name: 'Semester 3 (Autumn)', year: 2, startDate: '2026-08-01', endDate: '2026-12-15' },
    { id: 'sem-4', number: 4, name: 'Semester 4 (Spring)', year: 2, startDate: '2027-01-05', endDate: '2027-05-20' },
    { id: 'sem-5', number: 5, name: 'Semester 5 (Autumn)', year: 3, startDate: '2026-08-01', endDate: '2026-12-15' },
    { id: 'sem-6', number: 6, name: 'Semester 6 (Spring)', year: 3, startDate: '2027-01-05', endDate: '2027-05-20' }
  ];

  for (const sem of semesters) {
    dbManager.run(
      'INSERT OR IGNORE INTO semesters (id, number, name, year, start_date, end_date, is_current, total_enrolled) VALUES (?, ?, ?, ?, ?, ?, ?, 42)',
      [sem.id, sem.number, sem.name, sem.year, sem.startDate, sem.endDate, sem.number === 5 ? 1 : 0]
    );
  }

  // 4. Multi-Role User Accounts
  // 4.1 Super Admin
  dbManager.run(
    `INSERT OR IGNORE INTO users (id, name, email, role, phone, department_id, is_active, created_at, avatar_bg, avatar_text, designation)
     VALUES (?, ?, ?, ?, ?, ?, 1, ?, 'bg-slate-900', 'text-white', ?)`,
    [
      'super-admin-1',
      'Platform Director Sarah Vance',
      'superadmin@bcafly.edu',
      'super_admin',
      '+1 (555) 001-9999',
      'PLATFORM',
      new Date().toISOString(),
      'Global Infrastructure Architect'
    ]
  );

  // 4.2 Department Admin
  dbManager.run(
    `INSERT OR IGNORE INTO users (id, name, email, role, phone, department_id, is_active, created_at, avatar_bg, avatar_text, designation)
     VALUES (?, ?, ?, ?, ?, ?, 1, ?, 'bg-purple-100', 'text-purple-700', ?)`,
    [
      'admin-1',
      'Dr. V. Swaminathan (HOD)',
      'admin@bcafly.edu',
      'admin',
      '+91 98765 00001',
      'BCA',
      new Date().toISOString(),
      'Head of Department & Academic Administrator'
    ]
  );

  // 4.3 Faculty Members
  dbManager.run(
    `INSERT OR IGNORE INTO users (id, name, email, role, phone, department_id, is_active, created_at, avatar_bg, avatar_text, designation)
     VALUES (?, ?, ?, ?, ?, ?, 1, ?, 'bg-indigo-100', 'text-indigo-700', ?)`,
    [
      'faculty-1',
      'Prof. Sarah Jenkins',
      'sarah.jenkins@bcafly.edu',
      'faculty',
      '+1 (555) 234-5678',
      'BCA',
      new Date().toISOString(),
      'Associate Professor & Mentor'
    ]
  );
  dbManager.run(
    `INSERT OR IGNORE INTO faculty (id, name, designation, department, email, phone, office, assigned_students_count, specialization, courses)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'faculty-1',
      'Prof. Sarah Jenkins',
      'Associate Professor & Mentor',
      'Computer Applications',
      'sarah.jenkins@bcafly.edu',
      '+1 (555) 234-5678',
      'Block B, Room 402',
      42,
      'Data Structures & Algorithms',
      JSON.stringify(['BCA-301 Data Structures', 'BCA-501 Web Technologies'])
    ]
  );

  // 4.4 Students
  dbManager.run(
    `INSERT OR IGNORE INTO users (id, name, email, role, phone, department_id, is_active, created_at, avatar_bg, avatar_text, designation, student_id, semester)
     VALUES (?, ?, ?, ?, ?, ?, 1, ?, 'bg-emerald-100', 'text-emerald-700', 'Student', ?, 5)`,
    [
      'student-1',
      'Alexander Wright',
      'alexander.wright@student.bcafly.edu',
      'student',
      '+1 (555) 301-8841',
      'BCA',
      new Date().toISOString(),
      'BCA2024001'
    ]
  );
  dbManager.run(
    `INSERT OR IGNORE INTO students (id, student_id, name, initials, avatar_bg, avatar_text, course, semester, section, email, phone, parent_phone, attendance_rate, mentoring_status, cgpa, sgpa_history, assigned_faculty, assigned_faculty_id, weekly_attendance, total_classes_held, total_classes_attended, condonation_eligible, condonation_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'student-1',
      'BCA2024001',
      'Alexander Wright',
      'AW',
      'bg-indigo-100',
      'text-indigo-700',
      'Bachelor of Computer Applications',
      5,
      'A',
      'alexander.wright@student.bcafly.edu',
      '+1 (555) 301-8841',
      '+1 (555) 301-9900',
      88.5,
      'Regular',
      3.82,
      JSON.stringify([3.75, 3.8, 3.9, 3.85, 3.82]),
      'Prof. Sarah Jenkins',
      'faculty-1',
      JSON.stringify([90, 85, 92, 88, 85, 90]),
      140,
      124,
      1,
      'Eligible'
    ]
  );

  // 4.5 Parent Account
  dbManager.run(
    `INSERT OR IGNORE INTO users (id, name, email, role, phone, department_id, is_active, created_at, avatar_bg, avatar_text, designation, student_id)
     VALUES (?, ?, ?, ?, ?, ?, 1, ?, 'bg-amber-100', 'text-amber-700', 'Parent / Guardian', ?)`,
    [
      'parent-1',
      'Robert Wright (Parent of Alexander)',
      'robert.wright@parent.bcafly.edu',
      'parent',
      '+1 (555) 301-9900',
      'BCA',
      new Date().toISOString(),
      'BCA2024001'
    ]
  );

  // 4.6 Counselor Account
  dbManager.run(
    `INSERT OR IGNORE INTO users (id, name, email, role, phone, department_id, is_active, created_at, avatar_bg, avatar_text, designation)
     VALUES (?, ?, ?, ?, ?, ?, 1, ?, 'bg-teal-100', 'text-teal-700', ?)`,
    [
      'counselor-1',
      'Dr. Elena Rostova',
      'counselor@bcafly.edu',
      'counselor',
      '+1 (555) 880-3322',
      'BCA',
      new Date().toISOString(),
      'Campus Wellness Psychologist'
    ]
  );

  // 5. Courses Master
  const initialCourses = [
    { id: 'crs-501', code: 'BCA-501', name: 'Web Application Architecture', credits: 4, sem: 5, type: 'Theory + Lab' },
    { id: 'crs-502', code: 'BCA-502', name: 'Cloud & Distributed Systems', credits: 4, sem: 5, type: 'Theory' },
    { id: 'crs-503', code: 'BCA-503', name: 'Artificial Intelligence & Machine Learning', credits: 4, sem: 5, type: 'Theory + Lab' },
    { id: 'crs-504', code: 'BCA-504', name: 'Information Security & Cryptography', credits: 3, sem: 5, type: 'Theory' },
    { id: 'crs-505', code: 'BCA-505', name: 'Full-Stack Capstone Lab', credits: 2, sem: 5, type: 'Lab' }
  ];

  for (const c of initialCourses) {
    dbManager.run(
      `INSERT OR IGNORE INTO courses (id, course_code, course_name, semester, department_id, academic_scheme, credits, course_type, max_marks, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [c.id, c.code, c.name, c.sem, 'dept-bca', 'BCA-2024-REG', c.credits, c.type, 100]
    );

    // Faculty Allocation
    dbManager.run(
      `INSERT OR IGNORE INTO faculty_course_assignments (id, faculty_id, course_id, section, batch, academic_year, term, is_active)
       VALUES (?, ?, ?, 'A', '2024-27', '2026-27', 'Odd', 1)`,
      [`fca-${c.id}`, 'faculty-1', c.id]
    );

    // Student Enrollment
    dbManager.run(
      `INSERT OR IGNORE INTO student_course_enrollments (id, student_id, course_id, academic_year, section, enrollment_status)
       VALUES (?, ?, ?, '2026-27', 'A', 'Enrolled')`,
      [`sce-${c.id}-st1`, 'student-1', c.id]
    );

    // Initial CIA Marks
    dbManager.run(
      `INSERT OR IGNORE INTO course_marks (id, student_id, course_id, semester, academic_year, cia1, cia2, cia3, assignment_marks, practical_marks, internal_total, final_grade, updated_by, status)
       VALUES (?, ?, ?, 5, '2026-27', 18.5, 19.0, 18.0, 9.5, 19.0, 47.0, 'A+', 'faculty-1', 'Finalized')`,
      [`cm-${c.id}-st1`, 'student-1', c.id]
    );
  }

  // 6. Timetable Schedules
  const scheduleSlots = [
    { id: 'tt-1', sem: 5, day: 'Monday', start: '09:00 AM', end: '10:30 AM', crsId: 'crs-501', code: 'BCA-501', name: 'Web Application Architecture', room: 'Lab 3 (Ground Floor)' },
    { id: 'tt-2', sem: 5, day: 'Monday', start: '11:00 AM', end: '12:30 PM', crsId: 'crs-502', code: 'BCA-502', name: 'Cloud & Distributed Systems', room: 'Room 402' },
    { id: 'tt-3', sem: 5, day: 'Tuesday', start: '09:00 AM', end: '10:30 AM', crsId: 'crs-503', code: 'BCA-503', name: 'Artificial Intelligence & Machine Learning', room: 'Lab 2' },
    { id: 'tt-4', sem: 5, day: 'Wednesday', start: '10:00 AM', end: '11:30 AM', crsId: 'crs-504', code: 'BCA-504', name: 'Information Security & Cryptography', room: 'Room 305' },
    { id: 'tt-5', sem: 5, day: 'Thursday', start: '02:00 PM', end: '05:00 PM', crsId: 'crs-505', code: 'BCA-505', name: 'Full-Stack Capstone Lab', room: 'Advanced Software Lab' }
  ];

  for (const s of scheduleSlots) {
    dbManager.run(
      `INSERT OR IGNORE INTO timetables (id, semester, section, day_of_week, start_time, end_time, course_id, course_code, subject_name, faculty_id, faculty_name, room_no)
       VALUES (?, ?, 'A', ?, ?, ?, ?, ?, ?, 'faculty-1', 'Prof. Sarah Jenkins', ?)`,
      [s.id, s.sem, s.day, s.start, s.end, s.crsId, s.code, s.name, s.room]
    );
  }

  // 7. Attendance Correction Requests
  dbManager.run(
    `INSERT OR IGNORE INTO attendance_correction_requests (id, student_id, student_name, roll_number, course_id, course_name, date, request_type, reason, attachment_url, status, admin_remarks, reviewed_by, reviewed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'req-1',
      'student-1',
      'Alexander Wright',
      'BCA2024001',
      'crs-501',
      'Web Application Architecture',
      '2026-09-02',
      'Medical Leave',
      'Viral flu medical certificate submitted from University Health Center.',
      'https://documents.bcafly.edu/signed/med-cert-8841.pdf',
      'Approved',
      'Verified with Medical Officer. Attendance credited.',
      'Dr. V. Swaminathan (HOD)',
      new Date().toISOString()
    ]
  );

  // 8. Student Private Documents
  dbManager.run(
    `INSERT OR IGNORE INTO student_documents (id, student_id, title, category, file_name, file_size_kb, upload_date, is_verified, access_token)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`,
    [
      'doc-1',
      'student-1',
      'Official Semester 4 Marksheet & Grade Ledger',
      'Transcript',
      'transcript_sem4_alexander_wright.pdf',
      340,
      '2026-08-10',
      'tok_sec_9941a87b'
    ]
  );
  dbManager.run(
    `INSERT OR IGNORE INTO student_documents (id, student_id, title, category, file_name, file_size_kb, upload_date, is_verified, access_token)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`,
    [
      'doc-2',
      'student-1',
      'Bonafide Certificate & University Verification Proof',
      'Certificate',
      'bonafide_bca_2026_alexander.pdf',
      180,
      '2026-08-20',
      'tok_sec_1120f44e'
    ]
  );

  // 9. Default Attendance Settings
  dbManager.run(
    'INSERT OR IGNORE INTO attendance_settings (id, daily_cutoff_time, cutoff_enforced, auto_sms_on_finalize, sms_working_days_only) VALUES (?, ?, ?, ?, ?)',
    ['primary', '11:30', 1, 1, 1]
  );

  // 10. Default SMS Templates
  dbManager.run(
    'INSERT OR IGNORE INTO sms_templates (id, name, body, variables, is_active) VALUES (?, ?, ?, ?, ?)',
    ['sms-1', 'Attendance Shortage Alert', 'Dear Parent, your ward {{student_name}} is absent today. Attendance is {{attendance_rate}}%.', JSON.stringify(['student_name', 'attendance_rate']), 1]
  );

  // 11. Security Incidents Telemetry
  dbManager.run(
    `INSERT OR IGNORE INTO security_incidents (id, event_type, severity, description, ip_address, user_email, resolved)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      'sec-1',
      'BRUTE_FORCE_PREVENTION',
      'LOW',
      'Automated rate limiter throttled 5 rapid unauthorized requests from external subnet.',
      '192.168.1.104',
      'unknown@bot.net',
      1
    ]
  );

  // 12. Department Notices
  dbManager.run(
    `INSERT OR IGNORE INTO notices (id, title, subtitle, date, is_new, priority, body, action_label, deadline)
     VALUES (?, ?, ?, ?, 1, 'High', ?, 'View Guidelines', '2026-09-15')`,
    [
      'not-1',
      'CIA-2 Continuous Internal Assessment Schedule Published',
      'Mandatory assessment for Semester 1, 3, and 5 cohorts',
      '2026-09-04',
      'Continuous Internal Evaluation CIA-2 tests commence from September 22. All student attendance shortage condonations must be closed by September 15.'
    ]
  );

  dbManager.persist();
  console.log('[Database Seeder] Multi-role test database ready.');
}

