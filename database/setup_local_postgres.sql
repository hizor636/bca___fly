-- =========================================================================
-- BCAFly — Local PostgreSQL Setup & Seeder Script
-- 100% Free & Open-Source Database Initializer
-- Execution: psql -U postgres -d bcafly -f setup_local_postgres.sql
-- =========================================================================

-- 1. Departments
CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  dept_head_id TEXT,
  is_active INTEGER DEFAULT 1,
  archived_at TEXT,
  archived_by TEXT,
  created_at TEXT DEFAULT (NOW()::TEXT)
);

-- 1b. Academic Years
CREATE TABLE IF NOT EXISTS academic_years (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  attendance_rule NUMERIC(5,2) DEFAULT 75.0,
  is_active INTEGER DEFAULT 1,
  archived_at TEXT,
  archived_by TEXT,
  created_at TEXT DEFAULT (NOW()::TEXT)
);

-- 2. Semesters
CREATE TABLE IF NOT EXISTS semesters (
  id TEXT PRIMARY KEY,
  number INTEGER NOT NULL,
  name TEXT NOT NULL,
  year INTEGER NOT NULL,
  typical_status TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  credits INTEGER DEFAULT 24,
  min_attendance NUMERIC(5,2) DEFAULT 75.0,
  is_current INTEGER DEFAULT 0,
  total_enrolled INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  archived_at TEXT
);

-- 2b. Batches
CREATE TABLE IF NOT EXISTS batches (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  department_id TEXT NOT NULL DEFAULT 'BCA',
  academic_year TEXT NOT NULL DEFAULT '2026-2027',
  section TEXT NOT NULL DEFAULT 'A',
  shift TEXT DEFAULT 'Day',
  start_year INTEGER DEFAULT 2024,
  end_year INTEGER DEFAULT 2027,
  is_active INTEGER DEFAULT 1,
  archived_at TEXT,
  archived_by TEXT,
  created_at TEXT DEFAULT (NOW()::TEXT)
);

-- 3. Users (With Username and Password for each platform role)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE,
  password TEXT DEFAULT 'password123',
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL,
  phone TEXT,
  department_id TEXT,
  is_active INTEGER DEFAULT 1,
  archived_at TEXT,
  archived_by TEXT,
  created_at TEXT DEFAULT (NOW()::TEXT),
  avatar_bg TEXT,
  avatar_text TEXT,
  designation TEXT,
  student_id TEXT,
  semester INTEGER
);

-- 4. Faculty Profiles
CREATE TABLE IF NOT EXISTS faculty (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  designation TEXT NOT NULL,
  department TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  office TEXT,
  assigned_students_count INTEGER DEFAULT 0,
  specialization TEXT,
  courses TEXT,
  is_active INTEGER DEFAULT 1,
  archived_at TEXT,
  archived_by TEXT
);

-- 5. Students Profiles
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  initials TEXT NOT NULL,
  avatar_bg TEXT,
  avatar_text TEXT,
  course TEXT NOT NULL,
  semester INTEGER NOT NULL,
  section TEXT DEFAULT 'A',
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  parent_phone TEXT,
  attendance_rate NUMERIC(5,2) DEFAULT 0,
  mentoring_status TEXT DEFAULT 'Regular',
  cgpa NUMERIC(5,2) DEFAULT 0,
  sgpa_history TEXT,
  assigned_faculty TEXT NOT NULL,
  assigned_faculty_id TEXT,
  last_mentoring_date TEXT,
  weekly_attendance TEXT,
  total_classes_held INTEGER DEFAULT 0,
  total_classes_attended INTEGER DEFAULT 0,
  condonation_eligible INTEGER DEFAULT 0,
  condonation_status TEXT DEFAULT 'Pending',
  is_active INTEGER DEFAULT 1,
  archived_at TEXT,
  archived_by TEXT
);

-- 6. Student Faculty Assignments (Mentorship)
CREATE TABLE IF NOT EXISTS student_assignments (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  faculty_id TEXT NOT NULL,
  semester_id TEXT NOT NULL,
  class_id TEXT,
  reason TEXT DEFAULT 'mentor',
  start_date TEXT NOT NULL,
  end_date TEXT,
  is_active INTEGER DEFAULT 1
);

-- 7. Courses Master
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  course_code TEXT NOT NULL UNIQUE,
  course_name TEXT NOT NULL,
  short_name TEXT,
  semester INTEGER NOT NULL,
  department_id TEXT NOT NULL,
  academic_scheme TEXT NOT NULL,
  credits INTEGER NOT NULL DEFAULT 4,
  course_type TEXT NOT NULL DEFAULT 'Theory',
  max_marks INTEGER NOT NULL DEFAULT 100,
  cia1_max_marks INTEGER DEFAULT 20,
  cia2_max_marks INTEGER DEFAULT 20,
  cia3_max_marks INTEGER DEFAULT 20,
  attendance_required NUMERIC(5,2) DEFAULT 75.0,
  is_active INTEGER DEFAULT 1,
  archived_at TEXT,
  archived_by TEXT,
  created_at TEXT DEFAULT (NOW()::TEXT),
  updated_at TEXT DEFAULT (NOW()::TEXT)
);

-- 8. Faculty Course Assignments (Teaching Allocation)
CREATE TABLE IF NOT EXISTS faculty_course_assignments (
  id TEXT PRIMARY KEY,
  faculty_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  section TEXT NOT NULL DEFAULT 'A',
  batch TEXT NOT NULL DEFAULT '2024-27',
  academic_year TEXT NOT NULL DEFAULT '2026-27',
  term TEXT NOT NULL DEFAULT 'Odd',
  is_active INTEGER DEFAULT 1,
  archived_at TEXT
);

-- 9. Student Course Enrollments
CREATE TABLE IF NOT EXISTS student_course_enrollments (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  academic_year TEXT NOT NULL DEFAULT '2026-27',
  section TEXT NOT NULL DEFAULT 'A',
  enrollment_status TEXT NOT NULL DEFAULT 'Enrolled'
);

-- 10. Course Attendance Records
CREATE TABLE IF NOT EXISTS course_attendance_records (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  faculty_id TEXT NOT NULL,
  date TEXT NOT NULL,
  session_type TEXT NOT NULL DEFAULT 'THEORY',
  status TEXT NOT NULL DEFAULT 'PRESENT',
  marked_at TEXT DEFAULT (NOW()::TEXT),
  marked_by TEXT NOT NULL,
  finalized INTEGER DEFAULT 1,
  remarks TEXT
);

-- 11. Course Marks
CREATE TABLE IF NOT EXISTS course_marks (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  semester INTEGER NOT NULL,
  academic_year TEXT NOT NULL DEFAULT '2026-27',
  cia1 NUMERIC(5,2),
  cia2 NUMERIC(5,2),
  cia3 NUMERIC(5,2),
  assignment_marks NUMERIC(5,2),
  practical_marks NUMERIC(5,2),
  internal_total NUMERIC(5,2),
  final_exam_marks NUMERIC(5,2),
  final_grade TEXT,
  updated_by TEXT NOT NULL,
  updated_at TEXT DEFAULT (NOW()::TEXT),
  status TEXT DEFAULT 'Finalized'
);

-- 12. Mentoring Notes
CREATE TABLE IF NOT EXISTS mentoring_notes (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  date TEXT NOT NULL,
  faculty_name TEXT NOT NULL,
  faculty_id TEXT,
  topic TEXT NOT NULL,
  notes TEXT NOT NULL,
  action_items TEXT,
  status TEXT NOT NULL DEFAULT 'Resolved'
);

-- 13. Audit Trail Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  actor_user_id TEXT NOT NULL,
  actor_name TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  before_json TEXT,
  after_json TEXT,
  ip TEXT DEFAULT '127.0.0.1',
  created_at TEXT DEFAULT (NOW()::TEXT)
);

-- 14. Tenants
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  domain TEXT,
  plan TEXT NOT NULL DEFAULT 'Enterprise Academic',
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  student_quota INTEGER NOT NULL DEFAULT 1000,
  admin_email TEXT NOT NULL,
  created_at TEXT DEFAULT (NOW()::TEXT)
);

-- Performance & Unique Indexes
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_email ON users(email);
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_username ON users(username);
CREATE UNIQUE INDEX IF NOT EXISTS uq_students_id_code ON students(student_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_students_email ON students(email);
CREATE UNIQUE INDEX IF NOT EXISTS uq_faculty_email ON faculty(email);
CREATE UNIQUE INDEX IF NOT EXISTS uq_courses_code ON courses(course_code);

-- =========================================================================
-- SEED DATA: 2 FACULTIES, 10 STUDENTS IN 2 GROUPS, AND PLATFORM ACCOUNTS
-- =========================================================================

-- Clear existing data
TRUNCATE TABLE users, faculty, students, student_assignments, courses, 
               faculty_course_assignments, student_course_enrollments, 
               course_marks, course_attendance_records, mentoring_notes, 
               departments, academic_years, batches, semesters, tenants CASCADE;

-- Insert Department
INSERT INTO departments (id, name, code, is_active)
VALUES ('dept-bca', 'Department of Computer Applications', 'BCA', 1);

-- Insert Academic Year & Batches
INSERT INTO academic_years (id, name, start_date, end_date, attendance_rule, is_active)
VALUES ('ay-2026-27', 'Academic Year 2026-2027', '2026-08-01', '2027-05-31', 75.0, 1);

INSERT INTO batches (id, name, department_id, academic_year, section, shift, start_year, end_year, is_active)
VALUES 
  ('batch-2024-27-a', 'BCA Batch 2024-2027 (Group A)', 'dept-bca', '2026-2027', 'A', 'Day', 2024, 2027, 1),
  ('batch-2024-27-b', 'BCA Batch 2024-2027 (Group B)', 'dept-bca', '2026-2027', 'B', 'Day', 2024, 2027, 1);

-- Insert Semesters 1 to 6
INSERT INTO semesters (id, number, name, year, start_date, end_date, is_current, total_enrolled)
VALUES
  ('sem-1', 1, 'Semester 1 (Autumn)', 1, '2026-08-01', '2026-12-15', 0, 10),
  ('sem-2', 2, 'Semester 2 (Spring)', 1, '2027-01-05', '2027-05-20', 0, 10),
  ('sem-3', 3, 'Semester 3 (Autumn)', 2, '2026-08-01', '2026-12-15', 0, 10),
  ('sem-4', 4, 'Semester 4 (Spring)', 2, '2027-01-05', '2027-05-20', 0, 10),
  ('sem-5', 5, 'Semester 5 (Autumn)', 3, '2026-08-01', '2026-12-15', 1, 10),
  ('sem-6', 6, 'Semester 6 (Spring)', 3, '2027-01-05', '2027-05-20', 0, 10);

-- -------------------------------------------------------------------------
-- PLATFORM CREDENTIALS (USERS TABLE)
-- -------------------------------------------------------------------------
-- Super Admin
INSERT INTO users (id, username, password, name, email, role, phone, department_id, is_active, designation)
VALUES ('super-admin-1', 'superadmin', 'superadmin123', 'Platform Director Sarah Vance', 'superadmin@bcafly.edu', 'super_admin', '+1 (555) 001-9999', 'dept-bca', 1, 'Platform Oversight');

-- Department Administrator
INSERT INTO users (id, username, password, name, email, role, phone, department_id, is_active, designation)
VALUES ('admin-1', 'admin', 'admin123', 'Dr. V. Swaminathan (HOD)', 'admin@bcafly.edu', 'admin', '+91 98765 00001', 'dept-bca', 1, 'Head of Department & Administrator');

-- Faculty 1 (Group A Mentor)
INSERT INTO users (id, username, password, name, email, role, phone, department_id, is_active, designation)
VALUES ('faculty-1', 'faculty1', 'faculty123', 'Dr. Sarah Jenkins', 'sarah.jenkins@bcafly.edu', 'faculty', '+1 (555) 234-5678', 'dept-bca', 1, 'Associate Professor & Group A Mentor');

-- Faculty 2 (Group B Mentor)
INSERT INTO users (id, username, password, name, email, role, phone, department_id, is_active, designation)
VALUES ('faculty-2', 'faculty2', 'faculty123', 'Prof. Rajesh Kumar', 'rajesh.kumar@bcafly.edu', 'faculty', '+1 (555) 234-8765', 'dept-bca', 1, 'Assistant Professor & Group B Mentor');

-- Parent Account (Linked to Alexander Wright)
INSERT INTO users (id, username, password, name, email, role, phone, department_id, is_active, designation, student_id)
VALUES ('parent-1', 'parent1', 'parent123', 'Robert Wright', 'robert.wright@parent.bcafly.edu', 'parent', '+1 (555) 301-9900', 'dept-bca', 1, 'Parent / Guardian', 'BCA-2026-001');

-- Counselor Account
INSERT INTO users (id, username, password, name, email, role, phone, department_id, is_active, designation)
VALUES ('counselor-1', 'counselor1', 'counselor123', 'Dr. Priya Sharma', 'priya.counselor@bcafly.edu', 'counselor', '+1 (555) 880-3322', 'dept-bca', 1, 'Student Wellness Counselor');

-- -------------------------------------------------------------------------
-- FACULTY PROFILES (2 FACULTIES)
-- -------------------------------------------------------------------------
INSERT INTO faculty (id, name, designation, department, email, phone, office, assigned_students_count, specialization, courses, is_active)
VALUES
  ('faculty-1', 'Dr. Sarah Jenkins', 'Associate Professor & Group A Mentor', 'Department of Computer Applications', 'sarah.jenkins@bcafly.edu', '+1 (555) 234-5678', 'Block B, Room 402', 5, 'Web Architecture & Cloud Systems', '["BCA-501 Web Application Architecture", "BCA-502 Cloud & Distributed Systems"]', 1),
  ('faculty-2', 'Prof. Rajesh Kumar', 'Assistant Professor & Group B Mentor', 'Department of Computer Applications', 'rajesh.kumar@bcafly.edu', '+1 (555) 234-8765', 'Block B, Room 405', 5, 'Artificial Intelligence & Security', '["BCA-503 Artificial Intelligence & ML", "BCA-504 Information Security & Cryptography"]', 1);

-- -------------------------------------------------------------------------
-- 10 STUDENTS DIVIDED INTO 2 GROUPS (GROUP A & GROUP B)
-- -------------------------------------------------------------------------
-- GROUP A (Mentored by Dr. Sarah Jenkins)
INSERT INTO users (id, username, password, name, email, role, phone, department_id, is_active, designation, student_id, semester)
VALUES
  ('student-1', 'student1', 'student123', 'Alexander Wright', 'alexander.wright@student.bcafly.edu', 'student', '+1 (555) 301-8841', 'dept-bca', 1, 'Student', 'BCA-2026-001', 5),
  ('student-2', 'student2', 'student123', 'Elena Rostova', 'elena.rostova@student.bcafly.edu', 'student', '+1 (555) 301-8842', 'dept-bca', 1, 'Student', 'BCA-2026-002', 5),
  ('student-3', 'student3', 'student123', 'Marcus Vance', 'marcus.vance@student.bcafly.edu', 'student', '+1 (555) 301-8843', 'dept-bca', 1, 'Student', 'BCA-2026-003', 5),
  ('student-4', 'student4', 'student123', 'Chloe Bennett', 'chloe.bennett@student.bcafly.edu', 'student', '+1 (555) 301-8844', 'dept-bca', 1, 'Student', 'BCA-2026-004', 5),
  ('student-5', 'student5', 'student123', 'Devon Miller', 'devon.miller@student.bcafly.edu', 'student', '+1 (555) 301-8845', 'dept-bca', 1, 'Student', 'BCA-2026-005', 5);

INSERT INTO students (id, student_id, name, initials, avatar_bg, avatar_text, course, semester, section, email, phone, parent_phone, attendance_rate, mentoring_status, cgpa, sgpa_history, assigned_faculty, assigned_faculty_id, weekly_attendance, total_classes_held, total_classes_attended, condonation_eligible, condonation_status, is_active)
VALUES
  ('student-1', 'BCA-2026-001', 'Alexander Wright', 'AW', 'bg-indigo-100', 'text-indigo-700', 'Bachelor of Computer Applications', 5, 'A', 'alexander.wright@student.bcafly.edu', '+1 (555) 301-8841', '+1 (555) 301-9900', 88.5, 'Regular', 3.82, '[3.75, 3.8, 3.9, 3.85, 3.82]', 'Dr. Sarah Jenkins', 'faculty-1', '[90, 85, 92, 88, 85, 90]', 140, 124, 1, 'Eligible', 1),
  ('student-2', 'BCA-2026-002', 'Elena Rostova', 'ER', 'bg-emerald-100', 'text-emerald-700', 'Bachelor of Computer Applications', 5, 'A', 'elena.rostova@student.bcafly.edu', '+1 (555) 301-8842', '+1 (555) 301-9901', 92.0, 'Regular', 3.95, '[3.9, 3.92, 3.95, 3.94, 3.95]', 'Dr. Sarah Jenkins', 'faculty-1', '[95, 92, 90, 95, 90, 92]', 140, 129, 1, 'Eligible', 1),
  ('student-3', 'BCA-2026-003', 'Marcus Vance', 'MV', 'bg-amber-100', 'text-amber-700', 'Bachelor of Computer Applications', 5, 'A', 'marcus.vance@student.bcafly.edu', '+1 (555) 301-8843', '+1 (555) 301-9902', 71.4, 'Critical Alert', 2.85, '[2.8, 2.9, 2.75, 2.82, 2.85]', 'Dr. Sarah Jenkins', 'faculty-1', '[70, 68, 75, 72, 70, 74]', 140, 100, 1, 'Conditionally Eligible', 1),
  ('student-4', 'BCA-2026-004', 'Chloe Bennett', 'CB', 'bg-sky-100', 'text-sky-700', 'Bachelor of Computer Applications', 5, 'A', 'chloe.bennett@student.bcafly.edu', '+1 (555) 301-8844', '+1 (555) 301-9903', 84.0, 'Regular', 3.40, '[3.3, 3.35, 3.4, 3.42, 3.4]', 'Dr. Sarah Jenkins', 'faculty-1', '[85, 82, 86, 84, 85, 82]', 140, 118, 1, 'Eligible', 1),
  ('student-5', 'BCA-2026-005', 'Devon Miller', 'DM', 'bg-purple-100', 'text-purple-700', 'Bachelor of Computer Applications', 5, 'A', 'devon.miller@student.bcafly.edu', '+1 (555) 301-8845', '+1 (555) 301-9904', 79.5, 'Monitor', 3.10, '[3.0, 3.1, 3.05, 3.15, 3.1]', 'Dr. Sarah Jenkins', 'faculty-1', '[80, 78, 82, 80, 79, 78]', 140, 111, 1, 'Eligible', 1);

-- GROUP B (Mentored by Prof. Rajesh Kumar)
INSERT INTO users (id, username, password, name, email, role, phone, department_id, is_active, designation, student_id, semester)
VALUES
  ('student-6', 'student6', 'student123', 'Aarav Patel', 'aarav.patel@student.bcafly.edu', 'student', '+1 (555) 301-8846', 'dept-bca', 1, 'Student', 'BCA-2026-006', 5),
  ('student-7', 'student7', 'student123', 'Sophie Zhang', 'sophie.zhang@student.bcafly.edu', 'student', '+1 (555) 301-8847', 'dept-bca', 1, 'Student', 'BCA-2026-007', 5),
  ('student-8', 'student8', 'student123', 'Liam O''Connor', 'liam.oconnor@student.bcafly.edu', 'student', '+1 (555) 301-8848', 'dept-bca', 1, 'Student', 'BCA-2026-008', 5),
  ('student-9', 'student9', 'student123', 'Ananya Sharma', 'ananya.sharma@student.bcafly.edu', 'student', '+1 (555) 301-8849', 'dept-bca', 1, 'Student', 'BCA-2026-009', 5),
  ('student-10', 'student10', 'student123', 'Lucas Garcia', 'lucas.garcia@student.bcafly.edu', 'student', '+1 (555) 301-8850', 'dept-bca', 1, 'Student', 'BCA-2026-010', 5);

INSERT INTO students (id, student_id, name, initials, avatar_bg, avatar_text, course, semester, section, email, phone, parent_phone, attendance_rate, mentoring_status, cgpa, sgpa_history, assigned_faculty, assigned_faculty_id, weekly_attendance, total_classes_held, total_classes_attended, condonation_eligible, condonation_status, is_active)
VALUES
  ('student-6', 'BCA-2026-006', 'Aarav Patel', 'AP', 'bg-rose-100', 'text-rose-700', 'Bachelor of Computer Applications', 5, 'B', 'aarav.patel@student.bcafly.edu', '+1 (555) 301-8846', '+1 (555) 301-9905', 89.2, 'Regular', 3.75, '[3.7, 3.72, 3.78, 3.75, 3.75]', 'Prof. Rajesh Kumar', 'faculty-2', '[90, 88, 92, 90, 88, 87]', 140, 125, 1, 'Eligible', 1),
  ('student-7', 'BCA-2026-007', 'Sophie Zhang', 'SZ', 'bg-indigo-100', 'text-indigo-700', 'Bachelor of Computer Applications', 5, 'B', 'sophie.zhang@student.bcafly.edu', '+1 (555) 301-8847', '+1 (555) 301-9906', 94.5, 'Regular', 3.98, '[3.95, 3.98, 4.0, 3.97, 3.98]', 'Prof. Rajesh Kumar', 'faculty-2', '[96, 95, 94, 95, 94, 93]', 140, 132, 1, 'Eligible', 1),
  ('student-8', 'BCA-2026-008', 'Liam O''Connor', 'LO', 'bg-amber-100', 'text-amber-700', 'Bachelor of Computer Applications', 5, 'B', 'liam.oconnor@student.bcafly.edu', '+1 (555) 301-8848', '+1 (555) 301-9907', 68.0, 'Severe Risk', 2.70, '[2.6, 2.7, 2.65, 2.75, 2.7]', 'Prof. Rajesh Kumar', 'faculty-2', '[65, 70, 68, 66, 70, 69]', 140, 95, 1, 'Special Case Review', 1),
  ('student-9', 'BCA-2026-009', 'Ananya Sharma', 'AS', 'bg-emerald-100', 'text-emerald-700', 'Bachelor of Computer Applications', 5, 'B', 'ananya.sharma@student.bcafly.edu', '+1 (555) 301-8849', '+1 (555) 301-9908', 86.0, 'Regular', 3.55, '[3.5, 3.52, 3.6, 3.55, 3.55]', 'Prof. Rajesh Kumar', 'faculty-2', '[86, 85, 88, 86, 85, 86]', 140, 120, 1, 'Eligible', 1),
  ('student-10', 'BCA-2026-010', 'Lucas Garcia', 'LG', 'bg-sky-100', 'text-sky-700', 'Bachelor of Computer Applications', 5, 'B', 'lucas.garcia@student.bcafly.edu', '+1 (555) 301-8850', '+1 (555) 301-9909', 81.5, 'Regular', 3.25, '[3.2, 3.22, 3.28, 3.25, 3.25]', 'Prof. Rajesh Kumar', 'faculty-2', '[82, 80, 84, 82, 81, 80]', 140, 114, 1, 'Eligible', 1);

-- -------------------------------------------------------------------------
-- MENTORSHIP ASSIGNMENTS
-- -------------------------------------------------------------------------
INSERT INTO student_assignments (id, student_id, faculty_id, semester_id, reason, start_date, is_active)
VALUES
  ('assign-st1', 'student-1', 'faculty-1', 'sem-5', 'Group A Cohort Mentor', '2026-08-01', 1),
  ('assign-st2', 'student-2', 'faculty-1', 'sem-5', 'Group A Cohort Mentor', '2026-08-01', 1),
  ('assign-st3', 'student-3', 'faculty-1', 'sem-5', 'Group A Cohort Mentor', '2026-08-01', 1),
  ('assign-st4', 'student-4', 'faculty-1', 'sem-5', 'Group A Cohort Mentor', '2026-08-01', 1),
  ('assign-st5', 'student-5', 'faculty-1', 'sem-5', 'Group A Cohort Mentor', '2026-08-01', 1),
  ('assign-st6', 'student-6', 'faculty-2', 'sem-5', 'Group B Cohort Mentor', '2026-08-01', 1),
  ('assign-st7', 'student-7', 'faculty-2', 'sem-5', 'Group B Cohort Mentor', '2026-08-01', 1),
  ('assign-st8', 'student-8', 'faculty-2', 'sem-5', 'Group B Cohort Mentor', '2026-08-01', 1),
  ('assign-st9', 'student-9', 'faculty-2', 'sem-5', 'Group B Cohort Mentor', '2026-08-01', 1),
  ('assign-st10', 'student-10', 'faculty-2', 'sem-5', 'Group B Cohort Mentor', '2026-08-01', 1);

-- -------------------------------------------------------------------------
-- COURSES & ALLOCATIONS
-- -------------------------------------------------------------------------
INSERT INTO courses (id, course_code, course_name, semester, department_id, academic_scheme, credits, course_type, max_marks, is_active)
VALUES
  ('crs-501', 'BCA-501', 'Web Application Architecture', 5, 'dept-bca', 'BCA-2024-REG', 4, 'Theory + Lab', 100, 1),
  ('crs-502', 'BCA-502', 'Cloud & Distributed Systems', 5, 'dept-bca', 'BCA-2024-REG', 4, 'Theory', 100, 1),
  ('crs-503', 'BCA-503', 'Artificial Intelligence & Machine Learning', 5, 'dept-bca', 'BCA-2024-REG', 4, 'Theory + Lab', 100, 1),
  ('crs-504', 'BCA-504', 'Information Security & Cryptography', 5, 'dept-bca', 'BCA-2024-REG', 3, 'Theory', 100, 1),
  ('crs-505', 'BCA-505', 'Full-Stack Capstone Project Lab', 5, 'dept-bca', 'BCA-2024-REG', 2, 'Lab', 100, 1);

INSERT INTO faculty_course_assignments (id, faculty_id, course_id, section, batch, academic_year, term, is_active)
VALUES
  ('fca-crs-501-a', 'faculty-1', 'crs-501', 'A', '2024-27', '2026-27', 'Odd', 1),
  ('fca-crs-501-b', 'faculty-1', 'crs-501', 'B', '2024-27', '2026-27', 'Odd', 1),
  ('fca-crs-502-a', 'faculty-1', 'crs-502', 'A', '2024-27', '2026-27', 'Odd', 1),
  ('fca-crs-503-b', 'faculty-2', 'crs-503', 'B', '2024-27', '2026-27', 'Odd', 1),
  ('fca-crs-504-b', 'faculty-2', 'crs-504', 'B', '2024-27', '2026-27', 'Odd', 1);

-- Confirmation Message
SELECT 'BcaFly Database initialization complete! 10 students, 2 faculties (2 groups) and all multi-role credentials seeded successfully.' AS status;
