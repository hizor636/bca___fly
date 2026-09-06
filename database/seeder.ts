import { dbManager } from './database.js';

export async function wipeDatabase(): Promise<{ clearedTables: string[]; executionTimeMs: number }> {
  console.log('[Database Seeder] Nuclear wipe requested: clearing all tables...');
  return await dbManager.wipeAllTables();
}

export async function cleanDatabase(): Promise<void> {
  console.log('[Database Seeder] Checking if database requires initial seeding...');
  try {
    const res = await dbManager.query('SELECT COUNT(*) as count FROM users');
    const count = parseInt(res.rows[0]?.count || '0', 10);
    if (count === 0) {
      console.log('[Database Seeder] Database is empty. Seeding multi-role accounts, 2 faculties, and 10 students...');
      await seedDatabase(true);
    } else {
      console.log(`[Database Seeder] Database already populated with ${count} users. Skipping auto-seed.`);
    }
  } catch (err) {
    console.error('[Database Seeder] Database check/seed notice:', err);
  }
}

export async function seedDatabase(force = false): Promise<void> {
  if (!force) {
    console.log('[Database Seeder] Skipping auto-seed (force flag not provided).');
    return;
  }

  console.log('[Database Seeder] Initializing pristine database with multi-role accounts...');
  await dbManager.wipeAllTables();

  // 1. Tenants
  await dbManager.run(
    `INSERT INTO tenants (id, name, code, domain, plan, status, student_quota, admin_email)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT DO NOTHING`,
    [
      'tenant-1',
      'Apex Institute of Computer Applications',
      'APEX-BCA',
      'apex.bcafly.edu',
      'Enterprise Academic',
      'ACTIVE',
      2500,
      'admin@bcafly.edu'
    ]
  );

  // 2. Core Departments
  await dbManager.run(
    'INSERT INTO departments (id, name, code, is_active) VALUES ($1, $2, $3, 1) ON CONFLICT DO NOTHING',
    ['dept-bca', 'Department of Computer Applications', 'BCA']
  );

  // 2b. Academic Years & Batches
  await dbManager.run(
    'INSERT INTO academic_years (id, name, start_date, end_date, attendance_rule, is_active) VALUES ($1, $2, $3, $4, $5, 1) ON CONFLICT DO NOTHING',
    ['ay-2026-27', 'Academic Year 2026-2027', '2026-08-01', '2027-05-31', 75.0]
  );

  await dbManager.run(
    'INSERT INTO batches (id, name, department_id, academic_year, section, shift, start_year, end_year, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1) ON CONFLICT DO NOTHING',
    ['batch-2024-27-a', 'BCA Batch 2024-2027 (Group A)', 'dept-bca', '2026-2027', 'A', 'Day', 2024, 2027]
  );
  await dbManager.run(
    'INSERT INTO batches (id, name, department_id, academic_year, section, shift, start_year, end_year, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1) ON CONFLICT DO NOTHING',
    ['batch-2024-27-b', 'BCA Batch 2024-2027 (Group B)', 'dept-bca', '2026-2027', 'B', 'Day', 2024, 2027]
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
    await dbManager.run(
      'INSERT INTO semesters (id, number, name, year, start_date, end_date, is_current, total_enrolled) VALUES ($1, $2, $3, $4, $5, $6, $7, 10) ON CONFLICT DO NOTHING',
      [sem.id, sem.number, sem.name, sem.year, sem.startDate, sem.endDate, sem.number === 5 ? 1 : 0]
    );
  }

  // =========================================================================
  // 4. MULTI-ROLE PLATFORM USER ACCOUNTS (WITH USERNAMES & PASSWORDS)
  // =========================================================================

  // 4.1 Super Admin (Platform Oversight)
  await dbManager.run(
    `INSERT INTO users (id, username, password, name, email, role, phone, department_id, is_active, created_at, avatar_bg, avatar_text, designation)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1, $9, 'bg-slate-900', 'text-white', $10) ON CONFLICT DO NOTHING`,
    [
      'super-admin-1',
      'superadmin',
      'superadmin123',
      'Platform Director Sarah Vance',
      'superadmin@bcafly.edu',
      'super_admin',
      '+1 (555) 001-9999',
      'PLATFORM',
      new Date().toISOString(),
      'Global Infrastructure Architect'
    ]
  );

  // 4.2 Department Admin (Institutional Head)
  await dbManager.run(
    `INSERT INTO users (id, username, password, name, email, role, phone, department_id, is_active, created_at, avatar_bg, avatar_text, designation)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1, $9, 'bg-purple-100', 'text-purple-700', $10) ON CONFLICT DO NOTHING`,
    [
      'admin-1',
      'admin',
      'admin123',
      'Dr. V. Swaminathan (HOD)',
      'admin@bcafly.edu',
      'admin',
      '+91 98765 00001',
      'dept-bca',
      new Date().toISOString(),
      'Head of Department & Academic Administrator'
    ]
  );

  // 4.3 Two Faculties (Divided into Group A & Group B Mentors)
  // Faculty 1: Dr. Sarah Jenkins (Group A)
  await dbManager.run(
    `INSERT INTO users (id, username, password, name, email, role, phone, department_id, is_active, created_at, avatar_bg, avatar_text, designation)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1, $9, 'bg-indigo-100', 'text-indigo-700', $10) ON CONFLICT DO NOTHING`,
    [
      'faculty-1',
      'faculty1',
      'faculty123',
      'Dr. Sarah Jenkins',
      'sarah.jenkins@bcafly.edu',
      'faculty',
      '+1 (555) 234-5678',
      'dept-bca',
      new Date().toISOString(),
      'Associate Professor & Group A Mentor'
    ]
  );

  await dbManager.run(
    `INSERT INTO faculty (id, name, designation, department, email, phone, office, assigned_students_count, specialization, courses, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 1) ON CONFLICT DO NOTHING`,
    [
      'faculty-1',
      'Dr. Sarah Jenkins',
      'Associate Professor & Group A Mentor',
      'Department of Computer Applications',
      'sarah.jenkins@bcafly.edu',
      '+1 (555) 234-5678',
      'Block B, Room 402',
      5,
      'Web Architecture & Cloud Systems',
      JSON.stringify(['BCA-501 Web Application Architecture', 'BCA-502 Cloud & Distributed Systems'])
    ]
  );

  // Faculty 2: Prof. Rajesh Kumar (Group B)
  await dbManager.run(
    `INSERT INTO users (id, username, password, name, email, role, phone, department_id, is_active, created_at, avatar_bg, avatar_text, designation)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1, $9, 'bg-emerald-100', 'text-emerald-700', $10) ON CONFLICT DO NOTHING`,
    [
      'faculty-2',
      'faculty2',
      'faculty123',
      'Prof. Rajesh Kumar',
      'rajesh.kumar@bcafly.edu',
      'faculty',
      '+1 (555) 234-8765',
      'dept-bca',
      new Date().toISOString(),
      'Assistant Professor & Group B Mentor'
    ]
  );

  await dbManager.run(
    `INSERT INTO faculty (id, name, designation, department, email, phone, office, assigned_students_count, specialization, courses, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 1) ON CONFLICT DO NOTHING`,
    [
      'faculty-2',
      'Prof. Rajesh Kumar',
      'Assistant Professor & Group B Mentor',
      'Department of Computer Applications',
      'rajesh.kumar@bcafly.edu',
      '+1 (555) 234-8765',
      'Block B, Room 405',
      5,
      'Artificial Intelligence & Information Security',
      JSON.stringify(['BCA-503 Artificial Intelligence & ML', 'BCA-504 Information Security & Cryptography'])
    ]
  );

  // 4.4 Parent Account (Robert Wright - Parent of Alexander Wright)
  await dbManager.run(
    `INSERT INTO users (id, username, password, name, email, role, phone, department_id, is_active, created_at, avatar_bg, avatar_text, designation, student_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1, $9, 'bg-amber-100', 'text-amber-700', 'Parent / Guardian', $10) ON CONFLICT DO NOTHING`,
    [
      'parent-1',
      'parent1',
      'parent123',
      'Robert Wright (Parent of Alexander)',
      'robert.wright@parent.bcafly.edu',
      'parent',
      '+1 (555) 301-9900',
      'dept-bca',
      new Date().toISOString(),
      'BCA-2026-001'
    ]
  );

  // 4.5 Counselor Account
  await dbManager.run(
    `INSERT INTO users (id, username, password, name, email, role, phone, department_id, is_active, created_at, avatar_bg, avatar_text, designation)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1, $9, 'bg-teal-100', 'text-teal-700', $10) ON CONFLICT DO NOTHING`,
    [
      'counselor-1',
      'counselor1',
      'counselor123',
      'Dr. Priya Sharma',
      'priya.counselor@bcafly.edu',
      'counselor',
      '+1 (555) 880-3322',
      'dept-bca',
      new Date().toISOString(),
      'Campus Student Wellness Counselor'
    ]
  );

  // =========================================================================
  // 5. TEN STUDENTS (5 in Group A under Sarah Jenkins, 5 in Group B under Rajesh Kumar)
  // =========================================================================
  const rawStudents = [
    // GROUP A (Mentored by Dr. Sarah Jenkins)
    {
      id: 'student-1',
      roll: 'BCA-2026-001',
      username: 'student1',
      name: 'Alexander Wright',
      initials: 'AW',
      email: 'alexander.wright@student.bcafly.edu',
      phone: '+1 (555) 301-8841',
      parentPhone: '+1 (555) 301-9900',
      section: 'A',
      groupName: 'Group A',
      attRate: 88.5,
      cgpa: 3.82,
      facultyId: 'faculty-1',
      facultyName: 'Dr. Sarah Jenkins',
      sgpa: [3.75, 3.8, 3.9, 3.85, 3.82],
      weeklyAtt: [90, 85, 92, 88, 85, 90],
      totalHeld: 140,
      totalAttended: 124,
      status: 'Regular',
      condonation: 'Eligible'
    },
    {
      id: 'student-2',
      roll: 'BCA-2026-002',
      username: 'student2',
      name: 'Elena Rostova',
      initials: 'ER',
      email: 'elena.rostova@student.bcafly.edu',
      phone: '+1 (555) 301-8842',
      parentPhone: '+1 (555) 301-9901',
      section: 'A',
      groupName: 'Group A',
      attRate: 92.0,
      cgpa: 3.95,
      facultyId: 'faculty-1',
      facultyName: 'Dr. Sarah Jenkins',
      sgpa: [3.9, 3.92, 3.95, 3.94, 3.95],
      weeklyAtt: [95, 92, 90, 95, 90, 92],
      totalHeld: 140,
      totalAttended: 129,
      status: 'Regular',
      condonation: 'Eligible'
    },
    {
      id: 'student-3',
      roll: 'BCA-2026-003',
      username: 'student3',
      name: 'Marcus Vance',
      initials: 'MV',
      email: 'marcus.vance@student.bcafly.edu',
      phone: '+1 (555) 301-8843',
      parentPhone: '+1 (555) 301-9902',
      section: 'A',
      groupName: 'Group A',
      attRate: 71.4,
      cgpa: 2.85,
      facultyId: 'faculty-1',
      facultyName: 'Dr. Sarah Jenkins',
      sgpa: [2.8, 2.9, 2.75, 2.82, 2.85],
      weeklyAtt: [70, 68, 75, 72, 70, 74],
      totalHeld: 140,
      totalAttended: 100,
      status: 'Critical Alert',
      condonation: 'Conditionally Eligible'
    },
    {
      id: 'student-4',
      roll: 'BCA-2026-004',
      username: 'student4',
      name: 'Chloe Bennett',
      initials: 'CB',
      email: 'chloe.bennett@student.bcafly.edu',
      phone: '+1 (555) 301-8844',
      parentPhone: '+1 (555) 301-9903',
      section: 'A',
      groupName: 'Group A',
      attRate: 84.0,
      cgpa: 3.40,
      facultyId: 'faculty-1',
      facultyName: 'Dr. Sarah Jenkins',
      sgpa: [3.3, 3.35, 3.4, 3.42, 3.4],
      weeklyAtt: [85, 82, 86, 84, 85, 82],
      totalHeld: 140,
      totalAttended: 118,
      status: 'Regular',
      condonation: 'Eligible'
    },
    {
      id: 'student-5',
      roll: 'BCA-2026-005',
      username: 'student5',
      name: 'Devon Miller',
      initials: 'DM',
      email: 'devon.miller@student.bcafly.edu',
      phone: '+1 (555) 301-8845',
      parentPhone: '+1 (555) 301-9904',
      section: 'A',
      groupName: 'Group A',
      attRate: 79.5,
      cgpa: 3.10,
      facultyId: 'faculty-1',
      facultyName: 'Dr. Sarah Jenkins',
      sgpa: [3.0, 3.1, 3.05, 3.15, 3.1],
      weeklyAtt: [80, 78, 82, 80, 79, 78],
      totalHeld: 140,
      totalAttended: 111,
      status: 'Monitor',
      condonation: 'Eligible'
    },

    // GROUP B (Mentored by Prof. Rajesh Kumar)
    {
      id: 'student-6',
      roll: 'BCA-2026-006',
      username: 'student6',
      name: 'Aarav Patel',
      initials: 'AP',
      email: 'aarav.patel@student.bcafly.edu',
      phone: '+1 (555) 301-8846',
      parentPhone: '+1 (555) 301-9905',
      section: 'B',
      groupName: 'Group B',
      attRate: 89.2,
      cgpa: 3.75,
      facultyId: 'faculty-2',
      facultyName: 'Prof. Rajesh Kumar',
      sgpa: [3.7, 3.72, 3.78, 3.75, 3.75],
      weeklyAtt: [90, 88, 92, 90, 88, 87],
      totalHeld: 140,
      totalAttended: 125,
      status: 'Regular',
      condonation: 'Eligible'
    },
    {
      id: 'student-7',
      roll: 'BCA-2026-007',
      username: 'student7',
      name: 'Sophie Zhang',
      initials: 'SZ',
      email: 'sophie.zhang@student.bcafly.edu',
      phone: '+1 (555) 301-8847',
      parentPhone: '+1 (555) 301-9906',
      section: 'B',
      groupName: 'Group B',
      attRate: 94.5,
      cgpa: 3.98,
      facultyId: 'faculty-2',
      facultyName: 'Prof. Rajesh Kumar',
      sgpa: [3.95, 3.98, 4.0, 3.97, 3.98],
      weeklyAtt: [96, 95, 94, 95, 94, 93],
      totalHeld: 140,
      totalAttended: 132,
      status: 'Regular',
      condonation: 'Eligible'
    },
    {
      id: 'student-8',
      roll: 'BCA-2026-008',
      username: 'student8',
      name: 'Liam O\'Connor',
      initials: 'LO',
      email: 'liam.oconnor@student.bcafly.edu',
      phone: '+1 (555) 301-8848',
      parentPhone: '+1 (555) 301-9907',
      section: 'B',
      groupName: 'Group B',
      attRate: 68.0,
      cgpa: 2.70,
      facultyId: 'faculty-2',
      facultyName: 'Prof. Rajesh Kumar',
      sgpa: [2.6, 2.7, 2.65, 2.75, 2.7],
      weeklyAtt: [65, 70, 68, 66, 70, 69],
      totalHeld: 140,
      totalAttended: 95,
      status: 'Severe Risk',
      condonation: 'Special Case Review'
    },
    {
      id: 'student-9',
      roll: 'BCA-2026-009',
      username: 'student9',
      name: 'Ananya Sharma',
      initials: 'AS',
      email: 'ananya.sharma@student.bcafly.edu',
      phone: '+1 (555) 301-8849',
      parentPhone: '+1 (555) 301-9908',
      section: 'B',
      groupName: 'Group B',
      attRate: 86.0,
      cgpa: 3.55,
      facultyId: 'faculty-2',
      facultyName: 'Prof. Rajesh Kumar',
      sgpa: [3.5, 3.52, 3.6, 3.55, 3.55],
      weeklyAtt: [86, 85, 88, 86, 85, 86],
      totalHeld: 140,
      totalAttended: 120,
      status: 'Regular',
      condonation: 'Eligible'
    },
    {
      id: 'student-10',
      roll: 'BCA-2026-010',
      username: 'student10',
      name: 'Lucas Garcia',
      initials: 'LG',
      email: 'lucas.garcia@student.bcafly.edu',
      phone: '+1 (555) 301-8850',
      parentPhone: '+1 (555) 301-9909',
      section: 'B',
      groupName: 'Group B',
      attRate: 81.5,
      cgpa: 3.25,
      facultyId: 'faculty-2',
      facultyName: 'Prof. Rajesh Kumar',
      sgpa: [3.2, 3.22, 3.28, 3.25, 3.25],
      weeklyAtt: [82, 80, 84, 82, 81, 80],
      totalHeld: 140,
      totalAttended: 114,
      status: 'Regular',
      condonation: 'Eligible'
    }
  ];

  for (const st of rawStudents) {
    // 5.1 Insert User Account
    await dbManager.run(
      `INSERT INTO users (id, username, password, name, email, role, phone, department_id, is_active, created_at, avatar_bg, avatar_text, designation, student_id, semester)
       VALUES ($1, $2, 'student123', $3, $4, 'student', $5, 'dept-bca', 1, $6, 'bg-emerald-100', 'text-emerald-700', 'Student', $7, 5) ON CONFLICT DO NOTHING`,
      [st.id, st.username, st.name, st.email, st.phone, new Date().toISOString(), st.roll]
    );

    // 5.2 Insert Student Profile
    await dbManager.run(
      `INSERT INTO students (
        id, student_id, name, initials, avatar_bg, avatar_text, course, semester, section, email, phone, parent_phone,
        attendance_rate, mentoring_status, cgpa, sgpa_history, assigned_faculty, assigned_faculty_id, weekly_attendance,
        total_classes_held, total_classes_attended, condonation_eligible, condonation_status, is_active
       ) VALUES ($1, $2, $3, $4, 'bg-emerald-100', 'text-emerald-700', 'Bachelor of Computer Applications', 5, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, 1, $18, 1) ON CONFLICT DO NOTHING`,
      [
        st.id,
        st.roll,
        st.name,
        st.initials,
        st.section,
        st.email,
        st.phone,
        st.parentPhone,
        st.attRate,
        st.status,
        st.cgpa,
        JSON.stringify(st.sgpa),
        st.facultyName,
        st.facultyId,
        JSON.stringify(st.weeklyAtt),
        st.totalHeld,
        st.totalAttended,
        st.condonation
      ]
    );

    // 5.3 Insert Student Faculty Mentorship Assignment
    await dbManager.run(
      `INSERT INTO student_assignments (id, student_id, faculty_id, semester_id, reason, start_date, is_active)
       VALUES ($1, $2, $3, 'sem-5', 'Cohort Mentor Allocation', '2026-08-01', 1) ON CONFLICT DO NOTHING`,
      [`assign-${st.id}`, st.id, st.facultyId]
    );
  }

  // =========================================================================
  // 6. COURSES & ALLOCATIONS
  // =========================================================================
  const courses = [
    { id: 'crs-501', code: 'BCA-501', name: 'Web Application Architecture', credits: 4, sem: 5, type: 'Theory + Lab', facultyId: 'faculty-1' },
    { id: 'crs-502', code: 'BCA-502', name: 'Cloud & Distributed Systems', credits: 4, sem: 5, type: 'Theory', facultyId: 'faculty-1' },
    { id: 'crs-503', code: 'BCA-503', name: 'Artificial Intelligence & Machine Learning', credits: 4, sem: 5, type: 'Theory + Lab', facultyId: 'faculty-2' },
    { id: 'crs-504', code: 'BCA-504', name: 'Information Security & Cryptography', credits: 3, sem: 5, type: 'Theory', facultyId: 'faculty-2' },
    { id: 'crs-505', code: 'BCA-505', name: 'Full-Stack Capstone Project Lab', credits: 2, sem: 5, type: 'Lab', facultyId: 'faculty-1' }
  ];

  for (const c of courses) {
    await dbManager.run(
      `INSERT INTO courses (id, course_code, course_name, semester, department_id, academic_scheme, credits, course_type, max_marks, is_active)
       VALUES ($1, $2, $3, $4, 'dept-bca', 'BCA-2024-REG', $5, $6, 100, 1) ON CONFLICT DO NOTHING`,
      [c.id, c.code, c.name, c.sem, c.credits, c.type]
    );

    // Faculty Course Allocation (Group A & Group B sections)
    await dbManager.run(
      `INSERT INTO faculty_course_assignments (id, faculty_id, course_id, section, batch, academic_year, term, is_active)
       VALUES ($1, $2, $3, 'A', '2024-27', '2026-27', 'Odd', 1) ON CONFLICT DO NOTHING`,
      [`fca-${c.id}-a`, c.facultyId, c.id]
    );
    await dbManager.run(
      `INSERT INTO faculty_course_assignments (id, faculty_id, course_id, section, batch, academic_year, term, is_active)
       VALUES ($1, $2, $3, 'B', '2024-27', '2026-27', 'Odd', 1) ON CONFLICT DO NOTHING`,
      [`fca-${c.id}-b`, c.facultyId, c.id]
    );

    // Enroll all 10 students into each course
    for (const st of rawStudents) {
      await dbManager.run(
        `INSERT INTO student_course_enrollments (id, student_id, course_id, academic_year, section, enrollment_status)
         VALUES ($1, $2, $3, '2026-27', $4, 'Enrolled') ON CONFLICT DO NOTHING`,
        [`sce-${c.id}-${st.id}`, st.id, c.id, st.section]
      );

      // Seed Course Marks
      const cia1 = Number((16 + Math.random() * 4).toFixed(1));
      const cia2 = Number((15 + Math.random() * 5).toFixed(1));
      const cia3 = Number((16 + Math.random() * 4).toFixed(1));
      const assign = Number((8 + Math.random() * 2).toFixed(1));
      const practical = Number((16 + Math.random() * 4).toFixed(1));
      const total = Number(((cia1 + cia2) / 2 + assign + practical).toFixed(1));

      await dbManager.run(
        `INSERT INTO course_marks (id, student_id, course_id, semester, academic_year, cia1, cia2, cia3, assignment_marks, practical_marks, internal_total, final_grade, updated_by, status)
         VALUES ($1, $2, $3, 5, '2026-27', $4, $5, $6, $7, $8, $9, 'A', $10, 'Finalized') ON CONFLICT DO NOTHING`,
        [`cm-${c.id}-${st.id}`, st.id, c.id, cia1, cia2, cia3, assign, practical, total, c.facultyId]
      );

      // Course attendance record
      await dbManager.run(
        `INSERT INTO course_attendance_records (id, student_id, course_id, faculty_id, date, session_type, status, marked_by)
         VALUES ($1, $2, $3, $4, '2026-09-04', 'THEORY', 'PRESENT', $5) ON CONFLICT DO NOTHING`,
        [`att-${c.id}-${st.id}`, st.id, c.id, c.facultyId, c.facultyId]
      );
    }
  }

  // 7. Timetable Slots
  const scheduleSlots = [
    { id: 'tt-1', sem: 5, sec: 'A', day: 'Monday', start: '09:00 AM', end: '10:30 AM', crsId: 'crs-501', code: 'BCA-501', name: 'Web Application Architecture', facId: 'faculty-1', facName: 'Dr. Sarah Jenkins', room: 'Lab 3 (Ground Floor)' },
    { id: 'tt-2', sem: 5, sec: 'A', day: 'Monday', start: '11:00 AM', end: '12:30 PM', crsId: 'crs-502', code: 'BCA-502', name: 'Cloud & Distributed Systems', facId: 'faculty-1', facName: 'Dr. Sarah Jenkins', room: 'Room 402' },
    { id: 'tt-3', sem: 5, sec: 'B', day: 'Tuesday', start: '09:00 AM', end: '10:30 AM', crsId: 'crs-503', code: 'BCA-503', name: 'Artificial Intelligence & Machine Learning', facId: 'faculty-2', facName: 'Prof. Rajesh Kumar', room: 'Lab 2' },
    { id: 'tt-4', sem: 5, sec: 'B', day: 'Wednesday', start: '10:00 AM', end: '11:30 AM', crsId: 'crs-504', code: 'BCA-504', name: 'Information Security & Cryptography', facId: 'faculty-2', facName: 'Prof. Rajesh Kumar', room: 'Room 305' },
    { id: 'tt-5', sem: 5, sec: 'A', day: 'Thursday', start: '02:00 PM', end: '05:00 PM', crsId: 'crs-505', code: 'BCA-505', name: 'Full-Stack Capstone Project Lab', facId: 'faculty-1', facName: 'Dr. Sarah Jenkins', room: 'Advanced Software Lab' }
  ];

  for (const s of scheduleSlots) {
    await dbManager.run(
      `INSERT INTO timetables (id, semester, section, day_of_week, start_time, end_time, course_id, course_code, subject_name, faculty_id, faculty_name, room_no)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) ON CONFLICT DO NOTHING`,
      [s.id, s.sem, s.sec, s.day, s.start, s.end, s.crsId, s.code, s.name, s.facId, s.facName, s.room]
    );
  }

  // 8. Mentoring Notes
  await dbManager.run(
    `INSERT INTO mentoring_notes (id, student_id, date, faculty_name, faculty_id, topic, notes, action_items, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT DO NOTHING`,
    [
      'mn-1',
      'student-1',
      '2026-08-28',
      'Dr. Sarah Jenkins',
      'faculty-1',
      'Semester 5 Honors Project & Career Roadmap',
      'Alexander discussed his plan for a full-stack cloud microservices capstone. Encouraged to take leading role in Group A.',
      'Prepare system architecture document by next week.',
      'Resolved'
    ]
  );
  await dbManager.run(
    `INSERT INTO mentoring_notes (id, student_id, date, faculty_name, faculty_id, topic, notes, action_items, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT DO NOTHING`,
    [
      'mn-2',
      'student-8',
      '2026-08-30',
      'Prof. Rajesh Kumar',
      'faculty-2',
      'Attendance Deficit & Remedial Intervention',
      'Liam attendance fell to 68%. Identified transit complications. Provided makeup tutorial sessions.',
      'Attend Saturday remedial lab session.',
      'In Progress'
    ]
  );

  // 9. Attendance Correction Request
  await dbManager.run(
    `INSERT INTO attendance_correction_requests (id, student_id, student_name, roll_number, course_id, course_name, date, request_type, reason, attachment_url, status, admin_remarks, reviewed_by, reviewed_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) ON CONFLICT DO NOTHING`,
    [
      'req-1',
      'student-1',
      'Alexander Wright',
      'BCA-2026-001',
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

  // 10. Audit Log
  await dbManager.run(
    `INSERT INTO audit_logs (id, actor_user_id, actor_name, actor_role, action, entity_type, entity_id, before_json, after_json, ip, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) ON CONFLICT DO NOTHING`,
    [
      'aud-init-1',
      'admin-1',
      'Dr. V. Swaminathan (HOD)',
      'admin',
      'INITIALIZE_MASTER_DATA',
      'institution',
      'dept-bca',
      null,
      JSON.stringify({ seededStudents: 10, seededFaculties: 2, groups: ['Group A', 'Group B'] }),
      '127.0.0.1',
      new Date().toISOString()
    ]
  );

  console.log('✅ [Database Seeder] 10 Students, 2 Faculties (2 Groups) & Multi-Role credentials seeded successfully.');
}

// Allow running directly: tsx database/seeder.ts
if (process.argv[1]?.includes('seeder')) {
  (async () => {
    await dbManager.init();
    await seedDatabase(true);
    console.log('Seeding complete.');
    process.exit(0);
  })();
}
