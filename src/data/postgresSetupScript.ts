// Full PostgreSQL Schema & Seeding Script for Local Setup
// Can be copied directly or downloaded via 1-click in Database Studio

export const POSTGRES_SETUP_SQL = `-- =========================================================================
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

-- 3. Users (Platform Authentication & Roles)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'faculty', 'student', 'parent', 'counselor')),
  phone TEXT,
  department_id TEXT REFERENCES departments(id) ON DELETE SET NULL,
  is_active INTEGER DEFAULT 1,
  designation TEXT,
  student_id TEXT,
  semester INTEGER,
  avatar_bg TEXT,
  avatar_text TEXT,
  archived_at TEXT,
  created_at TEXT DEFAULT (NOW()::TEXT)
);

-- 4. Faculty Profiles
CREATE TABLE IF NOT EXISTS faculty (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  designation TEXT NOT NULL,
  department TEXT NOT NULL DEFAULT 'Department of Computer Applications',
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  office TEXT,
  assigned_students_count INTEGER DEFAULT 0,
  specialization TEXT,
  courses TEXT, -- JSON array of course strings
  is_active INTEGER DEFAULT 1,
  archived_at TEXT,
  created_at TEXT DEFAULT (NOW()::TEXT)
);

-- 5. Students Profiles
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  initials TEXT NOT NULL,
  avatar_bg TEXT DEFAULT 'bg-indigo-100',
  avatar_text TEXT DEFAULT 'text-indigo-700',
  course TEXT NOT NULL DEFAULT 'Bachelor of Computer Applications',
  semester INTEGER NOT NULL DEFAULT 5,
  section TEXT NOT NULL DEFAULT 'A',
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  parent_phone TEXT,
  attendance_rate NUMERIC(5,2) DEFAULT 85.0,
  mentoring_status TEXT DEFAULT 'Regular',
  cgpa NUMERIC(4,2) DEFAULT 3.50,
  sgpa_history TEXT, -- JSON array of 6 semester SGPA
  assigned_faculty TEXT,
  assigned_faculty_id TEXT REFERENCES faculty(id) ON DELETE SET NULL,
  last_mentoring_date TEXT,
  weekly_attendance TEXT, -- JSON array of 6 day numbers
  total_classes_held INTEGER DEFAULT 140,
  total_classes_attended INTEGER DEFAULT 120,
  condonation_eligible INTEGER DEFAULT 1,
  condonation_status TEXT DEFAULT 'Eligible',
  is_active INTEGER DEFAULT 1,
  archived_at TEXT,
  created_at TEXT DEFAULT (NOW()::TEXT)
);

-- 6. Student Mentorship Assignments
CREATE TABLE IF NOT EXISTS student_assignments (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  faculty_id TEXT NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
  semester_id TEXT REFERENCES semesters(id) ON DELETE SET NULL,
  reason TEXT NOT NULL DEFAULT 'mentor',
  start_date TEXT NOT NULL,
  end_date TEXT,
  created_at TEXT DEFAULT (NOW()::TEXT)
);

-- 7. Courses Scheme
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  course_code TEXT NOT NULL UNIQUE,
  course_name TEXT NOT NULL,
  semester INTEGER NOT NULL,
  credits INTEGER NOT NULL DEFAULT 4,
  max_marks INTEGER NOT NULL DEFAULT 100,
  course_type TEXT NOT NULL DEFAULT 'CORE',
  attendance_required NUMERIC(5,2) DEFAULT 75.0,
  cia1_max INTEGER DEFAULT 25,
  cia2_max INTEGER DEFAULT 25,
  cia3_max INTEGER DEFAULT 25,
  end_sem_max INTEGER DEFAULT 50,
  assignment_max INTEGER DEFAULT 10,
  is_active INTEGER DEFAULT 1,
  archived_at TEXT,
  created_at TEXT DEFAULT (NOW()::TEXT)
);

-- 8. Faculty Course Assignments (Teaching Loads)
CREATE TABLE IF NOT EXISTS faculty_course_assignments (
  id TEXT PRIMARY KEY,
  faculty_id TEXT NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  academic_year TEXT NOT NULL,
  term TEXT NOT NULL DEFAULT 'ODD',
  section TEXT NOT NULL DEFAULT 'A',
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (NOW()::TEXT)
);

-- 9. Student Course Enrollments
CREATE TABLE IF NOT EXISTS student_course_enrollments (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  semester INTEGER NOT NULL,
  academic_year TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ENROLLED',
  created_at TEXT DEFAULT (NOW()::TEXT)
);

-- 10. Course Marks (Continuous Internal Assessment)
CREATE TABLE IF NOT EXISTS course_marks (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  cia1 NUMERIC(5,2),
  cia2 NUMERIC(5,2),
  cia3 NUMERIC(5,2),
  assignment1 NUMERIC(5,2),
  assignment2 NUMERIC(5,2),
  attendance_marks NUMERIC(5,2),
  internal_total NUMERIC(5,2),
  final_exam_marks NUMERIC(5,2),
  final_grade TEXT,
  status TEXT DEFAULT 'Saved',
  updated_by TEXT,
  updated_at TEXT DEFAULT (NOW()::TEXT)
);

-- 11. Course Attendance Records (Session Rosters)
CREATE TABLE IF NOT EXISTS course_attendance_records (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  faculty_id TEXT NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  session_type TEXT NOT NULL DEFAULT 'THEORY',
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'LATE', 'ON_DUTY')),
  finalized INTEGER DEFAULT 1,
  remarks TEXT,
  recorded_at TEXT DEFAULT (NOW()::TEXT)
);

-- 12. Working Days (Official Academic Calendar)
CREATE TABLE IF NOT EXISTS working_days (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL UNIQUE,
  day_of_week TEXT NOT NULL,
  is_working INTEGER NOT NULL DEFAULT 1,
  reason TEXT
);

-- 13. Audit Logs (Tamper-Evident Ledger)
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

-- =========================================================================
-- SEED DATA: 2 FACULTIES, 10 STUDENTS IN 2 GROUPS, AND PLATFORM ACCOUNTS
-- =========================================================================

-- Clear existing data
TRUNCATE TABLE users, faculty, students, student_assignments, courses, 
               faculty_course_assignments, student_course_enrollments, 
               course_marks, course_attendance_records, departments, academic_years, batches, semesters CASCADE;

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

-- Parent Account
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
  ('student-3', 'BCA-2026-003', 'Marcus Vance', 'MV', 'bg-amber-100', 'text-amber-700', 'Bachelor of Computer Applications', 5, 'A', 'marcus.vance@student.bcafly.edu', '+1 (555) 301-8843', '+1 (555) 301-9902', 71.4, 'Academic Concern', 2.85, '[2.8, 2.9, 2.75, 2.82, 2.85]', 'Dr. Sarah Jenkins', 'faculty-1', '[70, 68, 75, 72, 70, 74]', 140, 100, 1, 'Conditionally Eligible', 1),
  ('student-4', 'BCA-2026-004', 'Chloe Bennett', 'CB', 'bg-sky-100', 'text-sky-700', 'Bachelor of Computer Applications', 5, 'A', 'chloe.bennett@student.bcafly.edu', '+1 (555) 301-8844', '+1 (555) 301-9903', 84.0, 'Regular', 3.40, '[3.3, 3.35, 3.4, 3.42, 3.4]', 'Dr. Sarah Jenkins', 'faculty-1', '[85, 82, 86, 84, 85, 82]', 140, 118, 1, 'Eligible', 1),
  ('student-5', 'BCA-2026-005', 'Devon Miller', 'DM', 'bg-purple-100', 'text-purple-700', 'Bachelor of Computer Applications', 5, 'A', 'devon.miller@student.bcafly.edu', '+1 (555) 301-8845', '+1 (555) 301-9904', 79.5, 'Mentoring', 3.10, '[3.0, 3.1, 3.05, 3.15, 3.1]', 'Dr. Sarah Jenkins', 'faculty-1', '[80, 78, 82, 80, 79, 78]', 140, 111, 1, 'Eligible', 1);

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
  ('student-7', 'BCA-2026-007', 'Sophie Zhang', 'SZ', 'bg-indigo-100', 'text-indigo-700', 'Bachelor of Computer Applications', 5, 'B', 'sophie.zhang@student.bcafly.edu', '+1 (555) 301-8847', '+1 (555) 301-9906', 94.5, 'Honor Roll', 3.98, '[3.95, 3.98, 4.0, 3.97, 3.98]', 'Prof. Rajesh Kumar', 'faculty-2', '[96, 95, 94, 95, 94, 93]', 140, 132, 1, 'Eligible', 1),
  ('student-8', 'BCA-2026-008', 'Liam O''Connor', 'LO', 'bg-amber-100', 'text-amber-700', 'Bachelor of Computer Applications', 5, 'B', 'liam.oconnor@student.bcafly.edu', '+1 (555) 301-8848', '+1 (555) 301-9907', 68.0, 'Academic Concern', 2.70, '[2.6, 2.7, 2.65, 2.75, 2.7]', 'Prof. Rajesh Kumar', 'faculty-2', '[65, 70, 68, 66, 70, 69]', 140, 95, 1, 'Debarred', 1),
  ('student-9', 'BCA-2026-009', 'Ananya Sharma', 'AS', 'bg-emerald-100', 'text-emerald-700', 'Bachelor of Computer Applications', 5, 'B', 'ananya.sharma@student.bcafly.edu', '+1 (555) 301-8849', '+1 (555) 301-9908', 86.0, 'Regular', 3.55, '[3.5, 3.52, 3.6, 3.55, 3.55]', 'Prof. Rajesh Kumar', 'faculty-2', '[86, 85, 88, 86, 85, 86]', 140, 120, 1, 'Approved', 1),
  ('student-10', 'BCA-2026-010', 'Lucas Garcia', 'LG', 'bg-sky-100', 'text-sky-700', 'Bachelor of Computer Applications', 5, 'B', 'lucas.garcia@student.bcafly.edu', '+1 (555) 301-8850', '+1 (555) 301-9909', 81.5, 'Regular', 3.25, '[3.2, 3.22, 3.28, 3.25, 3.25]', 'Prof. Rajesh Kumar', 'faculty-2', '[82, 80, 84, 82, 81, 80]', 140, 114, 1, 'Approved', 1);

-- -------------------------------------------------------------------------
-- STUDENT-FACULTY ASSIGNMENTS
-- -------------------------------------------------------------------------
INSERT INTO student_assignments (id, student_id, faculty_id, semester_id, reason, start_date)
VALUES
  ('as-1', 'student-1', 'faculty-1', 'sem-5', 'mentor', '2026-08-01'),
  ('as-2', 'student-2', 'faculty-1', 'sem-5', 'mentor', '2026-08-01'),
  ('as-3', 'student-3', 'faculty-1', 'sem-5', 'mentor', '2026-08-01'),
  ('as-4', 'student-4', 'faculty-1', 'sem-5', 'mentor', '2026-08-01'),
  ('as-5', 'student-5', 'faculty-1', 'sem-5', 'mentor', '2026-08-01'),
  ('as-6', 'student-6', 'faculty-2', 'sem-5', 'mentor', '2026-08-01'),
  ('as-7', 'student-7', 'faculty-2', 'sem-5', 'mentor', '2026-08-01'),
  ('as-8', 'student-8', 'faculty-2', 'sem-5', 'mentor', '2026-08-01'),
  ('as-9', 'student-9', 'faculty-2', 'sem-5', 'mentor', '2026-08-01'),
  ('as-10', 'student-10', 'faculty-2', 'sem-5', 'mentor', '2026-08-01');

-- -------------------------------------------------------------------------
-- COURSES SCHEME (SEMESTER 5)
-- -------------------------------------------------------------------------
INSERT INTO courses (id, course_code, course_name, semester, credits, max_marks, course_type, attendance_required)
VALUES
  ('crs-501', 'BCA-501', 'Web Application Architecture', 5, 4, 100, 'CORE', 75.0),
  ('crs-502', 'BCA-502', 'Cloud & Distributed Systems', 5, 4, 100, 'CORE', 75.0),
  ('crs-503', 'BCA-503', 'Artificial Intelligence & Machine Learning', 5, 4, 100, 'ELECTIVE', 75.0),
  ('crs-504', 'BCA-504', 'Information Security & Cryptography', 5, 4, 100, 'CORE', 75.0),
  ('crs-505', 'BCA-505', 'Advanced Web Development Laboratory', 5, 2, 50, 'LAB', 80.0),
  ('crs-506', 'BCA-506', 'Mini Project & Technical Seminar', 5, 2, 50, 'PROJECT', 85.0);

-- Insert Working Days
INSERT INTO working_days (id, date, day_of_week, is_working)
VALUES
  ('wd-1', '2026-09-01', 'Tuesday', 1),
  ('wd-2', '2026-09-02', 'Wednesday', 1),
  ('wd-3', '2026-09-03', 'Thursday', 1),
  ('wd-4', '2026-09-04', 'Friday', 1);

-- Initial Audit Log
INSERT INTO audit_logs (id, actor_user_id, actor_name, actor_role, action, entity_type, entity_id, ip, created_at)
VALUES
  ('aud-1', 'admin-1', 'Dr. V. Swaminathan (HOD)', 'admin', 'SYSTEM_INITIALIZATION', 'governance', 'dept-bca', '127.0.0.1', '2026-09-01T08:00:00Z');
`;
