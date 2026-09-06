// BCAFly PostgreSQL Schema
// Production PostgreSQL Schema

export const SCHEMA_SQL = `
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
  start_year INTEGER DEFAULT 2026,
  end_year INTEGER DEFAULT 2029,
  is_active INTEGER DEFAULT 1,
  archived_at TEXT,
  archived_by TEXT,
  created_at TEXT DEFAULT (NOW()::TEXT)
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
  archived_at TEXT,
  archived_by TEXT,
  created_at TEXT DEFAULT (NOW()::TEXT),
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
  courses TEXT,
  is_active INTEGER DEFAULT 1,
  archived_at TEXT,
  archived_by TEXT
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
  is_active INTEGER DEFAULT 1,
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
  attendance_required NUMERIC(5,2) DEFAULT 75.0,
  is_active INTEGER DEFAULT 1,
  archived_at TEXT,
  archived_by TEXT,
  created_at TEXT DEFAULT (NOW()::TEXT),
  updated_at TEXT DEFAULT (NOW()::TEXT)
);

-- 8b. Student Semester Enrollments
CREATE TABLE IF NOT EXISTS student_semester_enrollments (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  semester_id TEXT NOT NULL,
  academic_year_id TEXT NOT NULL,
  batch_id TEXT,
  enrollment_status TEXT NOT NULL DEFAULT 'Enrolled',
  enrolled_at TEXT DEFAULT (NOW()::TEXT),
  is_active INTEGER DEFAULT 1,
  FOREIGN KEY (student_id) REFERENCES students(id)
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
  archived_at TEXT,
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
  marked_at TEXT DEFAULT (NOW()::TEXT),
  marked_by TEXT NOT NULL,
  finalized INTEGER DEFAULT 1,
  remarks TEXT,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- 12. Course Marks
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
  created_at TEXT DEFAULT (NOW()::TEXT),
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
  created_at TEXT DEFAULT (NOW()::TEXT),
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
  variables TEXT,
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
  sent_at TEXT DEFAULT (NOW()::TEXT),
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
  created_at TEXT DEFAULT (NOW()::TEXT)
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

-- 22. Multi-Tenant Institutions
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

-- 23. Weekly Timetable Schedules
CREATE TABLE IF NOT EXISTS timetables (
  id TEXT PRIMARY KEY,
  semester INTEGER NOT NULL,
  section TEXT NOT NULL DEFAULT 'A',
  day_of_week TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  course_id TEXT NOT NULL,
  course_code TEXT NOT NULL,
  subject_name TEXT NOT NULL,
  faculty_id TEXT NOT NULL,
  faculty_name TEXT NOT NULL,
  room_no TEXT NOT NULL,
  session_type TEXT NOT NULL DEFAULT 'THEORY',
  FOREIGN KEY (course_id) REFERENCES courses(id),
  FOREIGN KEY (faculty_id) REFERENCES faculty(id)
);

-- 24. Attendance & Leave Correction Requests
CREATE TABLE IF NOT EXISTS attendance_correction_requests (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  roll_number TEXT NOT NULL,
  course_id TEXT NOT NULL,
  course_name TEXT NOT NULL,
  date TEXT NOT NULL,
  request_type TEXT NOT NULL DEFAULT 'Medical Leave',
  reason TEXT NOT NULL,
  attachment_url TEXT,
  status TEXT NOT NULL DEFAULT 'Pending',
  admin_remarks TEXT,
  reviewed_by TEXT,
  reviewed_at TEXT,
  created_at TEXT DEFAULT (NOW()::TEXT),
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- 25. Private Student Documents
CREATE TABLE IF NOT EXISTS student_documents (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Academic',
  file_name TEXT NOT NULL,
  file_size_kb INTEGER DEFAULT 120,
  upload_date TEXT NOT NULL,
  is_verified INTEGER DEFAULT 1,
  access_token TEXT NOT NULL,
  mime_type TEXT DEFAULT 'application/pdf',
  FOREIGN KEY (student_id) REFERENCES students(id)
);

-- 26. Platform Security Incidents Telemetry
CREATE TABLE IF NOT EXISTS security_incidents (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'MEDIUM',
  description TEXT NOT NULL,
  ip_address TEXT DEFAULT '127.0.0.1',
  user_id TEXT,
  user_email TEXT,
  resolved INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (NOW()::TEXT)
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_students_semester ON students(semester);
CREATE INDEX IF NOT EXISTS idx_courses_semester ON courses(semester);
CREATE INDEX IF NOT EXISTS idx_course_att_student ON course_attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_course_att_course ON course_attendance_records(course_id);
CREATE INDEX IF NOT EXISTS idx_mentoring_student ON mentoring_notes(student_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_timetable_sem_sec ON timetables(semester, section);
CREATE INDEX IF NOT EXISTS idx_correction_student ON attendance_correction_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_correction_status ON attendance_correction_requests(status);
CREATE INDEX IF NOT EXISTS idx_documents_student ON student_documents(student_id);

-- Unique constraints (using DO NOTHING on conflict)
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_email ON users(email);
CREATE UNIQUE INDEX IF NOT EXISTS uq_students_id_code ON students(student_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_students_email ON students(email);
CREATE UNIQUE INDEX IF NOT EXISTS uq_faculty_email ON faculty(email);
CREATE UNIQUE INDEX IF NOT EXISTS uq_courses_code ON courses(course_code);
CREATE UNIQUE INDEX IF NOT EXISTS uq_course_marks_pair ON course_marks(student_id, course_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_student_enrollments_pair ON student_course_enrollments(student_id, course_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_student_assignments_student ON student_assignments(student_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_tenants_code ON tenants(code);
`;
