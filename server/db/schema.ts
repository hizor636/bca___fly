export const SCHEMA_SQL = `
-- 1. Departments
CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
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
  is_current INTEGER DEFAULT 0,
  total_enrolled INTEGER DEFAULT 0
);

-- 3. Classes / Sections
CREATE TABLE IF NOT EXISTS classes (
  id TEXT PRIMARY KEY,
  semester_id TEXT NOT NULL,
  section TEXT NOT NULL,
  year TEXT NOT NULL,
  name TEXT NOT NULL,
  course_code TEXT NOT NULL,
  subject_name TEXT NOT NULL,
  assigned_faculty_id TEXT NOT NULL,
  room_no TEXT NOT NULL,
  FOREIGN KEY (semester_id) REFERENCES semesters(id)
);

-- 4. Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL,
  phone TEXT,
  department_id TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  avatar_bg TEXT,
  avatar_text TEXT,
  designation TEXT,
  student_id TEXT,
  semester INTEGER
);

-- 5. Faculty Profiles
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
  courses TEXT -- JSON array of strings
);

-- 6. Students
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
  attendance_rate REAL DEFAULT 0,
  mentoring_status TEXT DEFAULT 'Regular',
  cgpa REAL DEFAULT 0,
  sgpa_history TEXT, -- JSON array of floats
  assigned_faculty TEXT NOT NULL,
  assigned_faculty_id TEXT,
  last_mentoring_date TEXT,
  weekly_attendance TEXT, -- JSON array of integers
  total_classes_held INTEGER DEFAULT 0,
  total_classes_attended INTEGER DEFAULT 0,
  condonation_eligible INTEGER DEFAULT 0,
  condonation_status TEXT DEFAULT 'Pending'
);

-- 7. Student Faculty Assignments (Mentorship)
CREATE TABLE IF NOT EXISTS student_assignments (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  faculty_id TEXT NOT NULL,
  semester_id TEXT NOT NULL,
  class_id TEXT,
  reason TEXT DEFAULT 'mentor',
  start_date TEXT NOT NULL,
  end_date TEXT,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (faculty_id) REFERENCES faculty(id)
);

-- 8. Courses Master
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
  attendance_required REAL DEFAULT 75.0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 9. Faculty Course Assignments (Teaching Allocation)
CREATE TABLE IF NOT EXISTS faculty_course_assignments (
  id TEXT PRIMARY KEY,
  faculty_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  section TEXT NOT NULL DEFAULT 'A',
  batch TEXT NOT NULL DEFAULT '2026-27',
  academic_year TEXT NOT NULL DEFAULT '2026-27',
  term TEXT NOT NULL DEFAULT 'Odd',
  is_active INTEGER DEFAULT 1,
  FOREIGN KEY (faculty_id) REFERENCES faculty(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- 10. Student Course Enrollments
CREATE TABLE IF NOT EXISTS student_course_enrollments (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  academic_year TEXT NOT NULL DEFAULT '2026-27',
  section TEXT NOT NULL DEFAULT 'A',
  enrollment_status TEXT NOT NULL DEFAULT 'Enrolled',
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- 11. Course Attendance Records
CREATE TABLE IF NOT EXISTS course_attendance_records (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  faculty_id TEXT NOT NULL,
  date TEXT NOT NULL,
  session_type TEXT NOT NULL DEFAULT 'THEORY',
  status TEXT NOT NULL DEFAULT 'PRESENT',
  marked_at TEXT DEFAULT CURRENT_TIMESTAMP,
  marked_by TEXT NOT NULL,
  finalized INTEGER DEFAULT 1,
  remarks TEXT,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- 12. Course Marks (Continuous Internal Assessments + Exam)
CREATE TABLE IF NOT EXISTS course_marks (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  semester INTEGER NOT NULL,
  academic_year TEXT NOT NULL DEFAULT '2026-27',
  cia1 REAL,
  cia2 REAL,
  cia3 REAL,
  assignment_marks REAL,
  practical_marks REAL,
  internal_total REAL,
  final_exam_marks REAL,
  final_grade TEXT,
  updated_by TEXT NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'Finalized',
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- 13. Mentoring Notes
CREATE TABLE IF NOT EXISTS mentoring_notes (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  date TEXT NOT NULL,
  faculty_name TEXT NOT NULL,
  faculty_id TEXT,
  topic TEXT NOT NULL,
  notes TEXT NOT NULL,
  action_items TEXT,
  status TEXT NOT NULL DEFAULT 'Resolved',
  FOREIGN KEY (student_id) REFERENCES students(id)
);

-- 14. Counseling Referrals
CREATE TABLE IF NOT EXISTS counseling_referrals (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  semester INTEGER NOT NULL,
  referred_by_faculty_id TEXT NOT NULL,
  referred_by_faculty_name TEXT NOT NULL,
  counselor_id TEXT NOT NULL,
  counselor_name TEXT NOT NULL,
  reason_code TEXT NOT NULL,
  faculty_remarks TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  mentor_visible_status TEXT NOT NULL DEFAULT 'Under Review',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  closed_at TEXT,
  notes_count INTEGER DEFAULT 0,
  FOREIGN KEY (student_id) REFERENCES students(id)
);

-- 15. Counseling Notes
CREATE TABLE IF NOT EXISTS counseling_notes (
  id TEXT PRIMARY KEY,
  referral_id TEXT NOT NULL,
  note_text TEXT NOT NULL,
  treatment_plan TEXT NOT NULL,
  created_by_counselor_id TEXT NOT NULL,
  created_by_counselor_name TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  is_confidential INTEGER DEFAULT 1,
  FOREIGN KEY (referral_id) REFERENCES counseling_referrals(id)
);

-- 16. Attendance Settings
CREATE TABLE IF NOT EXISTS attendance_settings (
  id TEXT PRIMARY KEY DEFAULT 'primary',
  daily_cutoff_time TEXT NOT NULL DEFAULT '11:30',
  cutoff_enforced INTEGER DEFAULT 1,
  auto_sms_on_finalize INTEGER DEFAULT 1,
  sms_working_days_only INTEGER DEFAULT 1
);

-- 17. Working Days Calendar
CREATE TABLE IF NOT EXISTS working_days (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL UNIQUE,
  day_of_week TEXT NOT NULL,
  is_working INTEGER NOT NULL DEFAULT 1,
  reason TEXT
);

-- 18. SMS Templates
CREATE TABLE IF NOT EXISTS sms_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  body TEXT NOT NULL,
  variables TEXT, -- JSON array of variable names
  is_active INTEGER DEFAULT 1
);

-- 19. SMS Message Dispatch Log
CREATE TABLE IF NOT EXISTS sms_messages (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  recipient_phone TEXT NOT NULL,
  recipient_type TEXT NOT NULL,
  template_id TEXT NOT NULL,
  body TEXT NOT NULL,
  channel TEXT DEFAULT 'SMS_GATEWAY',
  status TEXT DEFAULT 'sent',
  sent_at TEXT DEFAULT CURRENT_TIMESTAMP,
  provider_message_id TEXT,
  idempotency_key TEXT,
  is_working_day INTEGER DEFAULT 1
);

-- 20. Audit Trail Logs
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
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 21. Department Notices
CREATE TABLE IF NOT EXISTS notices (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  date TEXT NOT NULL,
  is_new INTEGER DEFAULT 1,
  priority TEXT NOT NULL DEFAULT 'Normal',
  body TEXT NOT NULL,
  action_label TEXT,
  deadline TEXT
);

-- Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_students_semester ON students(semester);
CREATE INDEX IF NOT EXISTS idx_courses_semester ON courses(semester);
CREATE INDEX IF NOT EXISTS idx_course_att_student ON course_attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_course_att_course ON course_attendance_records(course_id);
CREATE INDEX IF NOT EXISTS idx_course_marks_student ON course_marks(student_id);
CREATE INDEX IF NOT EXISTS idx_course_marks_course ON course_marks(course_id);
CREATE INDEX IF NOT EXISTS idx_mentoring_student ON mentoring_notes(student_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
`;
