import {
  User,
  UserStats,
  UserListParams,
  UserListResponse,
  Department,
  AcademicYear,
  SemesterInfo,
  Batch,
  Course,
  FacultyMember,
  Student,
  FacultyCourseAssignment,
  StudentCourseEnrollment,
  CourseMarks,
  CourseAttendanceRecord,
  AuditLog,
  DbStats,
  DbTableInfo,
  DbQueryResult,
  AttendanceForecastResult,
  RiskMatrixItem,
  CohortStatsResult,
  AiMentoringAdvice
} from '../types';

const API_BASE = '/api';

export interface HealthStatus {
  online: boolean;
  latencyMs: number;
  engine?: string;
  tableCount?: number;
  totalRows?: number;
  sizeKb?: number;
}

class ApiService {
  private isOnline = false;
  private latency = 0;

  public async checkHealth(): Promise<HealthStatus> {
    const start = performance.now();
    try {
      const res = await fetch(`${API_BASE}/health`, { method: 'GET', signal: AbortSignal.timeout(3000) });
      const latencyMs = Math.round(performance.now() - start);
      if (res.ok) {
        const data = await res.json();
        this.isOnline = true;
        this.latency = latencyMs;
        return {
          online: true,
          latencyMs,
          engine: data.database?.engine,
          tableCount: data.database?.tableCount,
          totalRows: data.database?.totalRows,
          sizeKb: data.database?.sizeKb
        };
      }
      this.isOnline = false;
      return { online: false, latencyMs };
    } catch {
      this.isOnline = false;
      return { online: false, latencyMs: 0 };
    }
  }

  public getStatus() {
    return { isOnline: this.isOnline, latency: this.latency };
  }

  // --- Auth ---
  public async login(email: string, password: string, roleHint?: string): Promise<{ success: boolean; user?: User; error?: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, roleHint })
    });
    return await res.json();
  }

  // =========================================================================
  // 🏛️ 1. DEPARTMENTS (Master Data)
  // =========================================================================
  public async getDepartments(): Promise<Department[]> {
    const res = await fetch(`${API_BASE}/departments`);
    if (!res.ok) throw new Error('Failed to fetch departments');
    const json = await res.json();
    return json.data || [];
  }

  public async createDepartment(dept: { name: string; code: string; deptHeadId?: string }): Promise<{ id: string }> {
    const res = await fetch(`${API_BASE}/admin/departments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dept)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create department');
    return json;
  }

  public async updateDepartment(id: string, updates: Partial<Department>): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/departments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update department');
  }

  public async archiveDepartment(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/departments/${id}/archive`, { method: 'POST' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to archive department');
  }

  public async deleteDepartment(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/departments/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to delete department');
  }

  // =========================================================================
  // 📅 2. ACADEMIC YEARS
  // =========================================================================
  public async getAcademicYears(): Promise<AcademicYear[]> {
    const res = await fetch(`${API_BASE}/academic-years`);
    if (!res.ok) throw new Error('Failed to fetch academic years');
    const json = await res.json();
    return json.data || [];
  }

  public async createAcademicYear(ay: { name: string; startDate: string; endDate: string; attendanceRule?: number; isActive?: boolean }): Promise<{ id: string }> {
    const res = await fetch(`${API_BASE}/admin/academic-years`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ay)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create academic year');
    return json;
  }

  public async updateAcademicYear(id: string, updates: Partial<AcademicYear>): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/academic-years/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update academic year');
  }

  public async archiveAcademicYear(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/academic-years/${id}/archive`, { method: 'POST' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to archive academic year');
  }

  public async activateAcademicYear(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/academic-years/${id}/activate`, { method: 'POST' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to activate academic year');
  }

  // =========================================================================
  // 📚 3. SEMESTERS
  // =========================================================================
  public async getSemesters(): Promise<SemesterInfo[]> {
    const res = await fetch(`${API_BASE}/semesters`);
    if (!res.ok) throw new Error('Failed to fetch semesters');
    const json = await res.json();
    return json.data || [];
  }

  public async configureSemester(sem: Partial<SemesterInfo>): Promise<{ id: string }> {
    const res = await fetch(`${API_BASE}/admin/semesters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sem)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to configure semester');
    return json;
  }

  public async updateSemester(id: string, updates: Partial<SemesterInfo>): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/semesters/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update semester');
  }

  // =========================================================================
  // 👥 4. BATCHES
  // =========================================================================
  public async getBatches(): Promise<Batch[]> {
    const res = await fetch(`${API_BASE}/batches`);
    if (!res.ok) throw new Error('Failed to fetch batches');
    const json = await res.json();
    return json.data || [];
  }

  public async createBatch(batch: Partial<Batch>): Promise<{ id: string }> {
    const res = await fetch(`${API_BASE}/admin/batches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batch)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create batch');
    return json;
  }

  public async updateBatch(id: string, updates: Partial<Batch>): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/batches/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update batch');
  }

  public async archiveBatch(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/batches/${id}/archive`, { method: 'POST' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to archive batch');
  }

  // =========================================================================
  // 📖 5. COURSES MASTER
  // =========================================================================
  public async getCourses(semester?: number): Promise<Course[]> {
    const url = semester ? `${API_BASE}/courses?semester=${semester}` : `${API_BASE}/courses`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch courses');
    const json = await res.json();
    return json.data || [];
  }

  public async createCourse(course: Partial<Course>): Promise<{ id: string }> {
    const res = await fetch(`${API_BASE}/admin/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(course)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create course');
    return json;
  }

  public async updateCourse(id: string, updates: Partial<Course>): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/courses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update course');
  }

  public async archiveCourse(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/courses/${id}/archive`, { method: 'POST' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to archive course');
  }

  public async deleteCourse(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/courses/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to delete course');
  }

  // =========================================================================
  // 👨‍🏫 6. FACULTY ACCOUNTS & PROFILES
  // =========================================================================
  public async getFaculty(): Promise<FacultyMember[]> {
    const res = await fetch(`${API_BASE}/faculty`);
    if (!res.ok) throw new Error('Failed to fetch faculty');
    const json = await res.json();
    return json.data || [];
  }

  public async createFaculty(faculty: Partial<FacultyMember>): Promise<{ id: string }> {
    const res = await fetch(`${API_BASE}/admin/faculty`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(faculty)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create faculty');
    return json;
  }

  public async updateFaculty(id: string, updates: Partial<FacultyMember>): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/faculty/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update faculty');
  }

  public async archiveFaculty(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/faculty/${id}/archive`, { method: 'POST' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to archive faculty');
  }

  public async deleteFaculty(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/faculty/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to delete faculty');
  }

  public async importFacultyBatch(facultyList: Partial<FacultyMember>[]): Promise<{ importedCount: number; errors: string[] }> {
    const res = await fetch(`${API_BASE}/admin/faculty/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ facultyList })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to import faculty');
    return json;
  }

  // =========================================================================
  // 🎓 7. STUDENT ACCOUNTS & PROFILES
  // =========================================================================
  public async getStudents(semester?: number, facultyId?: string): Promise<Student[]> {
    const params = new URLSearchParams();
    if (semester) params.append('semester', String(semester));
    if (facultyId) params.append('facultyId', facultyId);
    const res = await fetch(`${API_BASE}/students?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch students');
    const json = await res.json();
    return json.data || [];
  }

  public async createStudent(student: Partial<Student>): Promise<{ id: string; studentId: string }> {
    const res = await fetch(`${API_BASE}/admin/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create student');
    return json;
  }

  public async updateStudent(id: string, updates: Partial<Student>): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/students/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update student');
  }

  public async archiveStudent(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/students/${id}/archive`, { method: 'POST' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to archive student');
  }

  public async deleteStudent(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/students/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to delete student');
  }

  public async importStudentsBatch(studentList: Partial<Student>[]): Promise<{ importedCount: number; errors: string[] }> {
    const res = await fetch(`${API_BASE}/admin/students/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentList })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to import students');
    return json;
  }

  // =========================================================================
  // 📝 8. ENROLLMENTS & ALLOCATIONS
  // =========================================================================
  public async getEnrollments(courseId?: string, studentId?: string): Promise<StudentCourseEnrollment[]> {
    const params = new URLSearchParams();
    if (courseId) params.append('courseId', courseId);
    if (studentId) params.append('studentId', studentId);
    const res = await fetch(`${API_BASE}/admin/enrollments?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch enrollments');
    const json = await res.json();
    return json.data || [];
  }

  public async enrollStudent(enrollment: Partial<StudentCourseEnrollment>): Promise<{ id: string }> {
    const res = await fetch(`${API_BASE}/admin/enrollments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enrollment)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to enroll student');
    return json;
  }

  public async bulkEnrollStudents(enrollments: Partial<StudentCourseEnrollment>[]): Promise<{ count: number }> {
    const res = await fetch(`${API_BASE}/admin/enrollments/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enrollments })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to bulk enroll students');
    return json;
  }

  public async removeEnrollment(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/enrollments/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to remove enrollment');
  }

  public async getFacultyAssignments(facultyId?: string): Promise<FacultyCourseAssignment[]> {
    const url = facultyId ? `${API_BASE}/admin/faculty-assignments?facultyId=${facultyId}` : `${API_BASE}/admin/faculty-assignments`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch faculty assignments');
    const json = await res.json();
    return json.data || [];
  }

  public async assignFacultyCourse(assignment: Partial<FacultyCourseAssignment>): Promise<{ id: string }> {
    const res = await fetch(`${API_BASE}/admin/faculty-assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assignment)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to assign faculty to course');
    return json;
  }

  public async removeFacultyCourseAssignment(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/faculty-assignments/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to remove faculty course assignment');
  }

  public async reassignStudentMentor(studentId: string, newFacultyId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/mentor-assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, newFacultyId })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to reassign mentor');
  }

  // =========================================================================
  // 🔒 ROLE SCOPED APIS
  // =========================================================================
  public async getFacultyDashboard(facultyId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/faculty/dashboard?facultyId=${facultyId}`);
    if (!res.ok) throw new Error('Failed to fetch faculty dashboard');
    const json = await res.json();
    return json.data;
  }

  public async getStudentDashboard(studentId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/student/dashboard?studentId=${studentId}`);
    if (!res.ok) throw new Error('Failed to fetch student dashboard');
    const json = await res.json();
    return json.data;
  }

  public async getGuardianDashboard(studentId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/guardian/dashboard?studentId=${studentId}`);
    if (!res.ok) throw new Error('Failed to fetch guardian dashboard');
    const json = await res.json();
    return json.data;
  }

  // =========================================================================
  // 📝 ATTENDANCE & MARKS
  // =========================================================================
  public async getCourseAttendance(courseId?: string, date?: string): Promise<CourseAttendanceRecord[]> {
    const params = new URLSearchParams();
    if (courseId) params.append('courseId', courseId);
    if (date) params.append('date', date);
    const res = await fetch(`${API_BASE}/attendance/course-records?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch attendance');
    const json = await res.json();
    return json.data || [];
  }

  public async saveCourseAttendanceBatch(payload: {
    courseId: string;
    facultyId: string;
    date: string;
    sessionType: string;
    records: { studentId: string; status: string; remarks?: string }[];
    finalize?: boolean;
    markedBy?: string;
  }): Promise<void> {
    const res = await fetch(`${API_BASE}/attendance/course-records/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to save attendance');
    }
  }

  public async getCourseMarks(courseId?: string, studentId?: string): Promise<CourseMarks[]> {
    const params = new URLSearchParams();
    if (courseId) params.append('courseId', courseId);
    if (studentId) params.append('studentId', studentId);
    const res = await fetch(`${API_BASE}/marks?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch marks');
    const json = await res.json();
    return json.data || [];
  }

  public async saveCourseMarksBatch(payload: {
    courseId: string;
    assessmentType: string;
    marksEntries: { studentId: string; mark: number | null }[];
    finalize?: boolean;
    updatedBy?: string;
  }): Promise<void> {
    const res = await fetch(`${API_BASE}/marks/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to save marks');
    }
  }

  public async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch(`${API_BASE}/audit-logs`);
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    const json = await res.json();
    return json.data || [];
  }

  // --- User Management Endpoints (Scale: 800+ Users) ---
  public async getUserStats(): Promise<UserStats> {
    const res = await fetch(`${API_BASE}/users/stats`);
    if (!res.ok) throw new Error('Failed to fetch user stats');
    const json = await res.json();
    return json.data;
  }

  public async getUsers(params: UserListParams = {}): Promise<UserListResponse> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));
    if (params.search) query.append('q', params.search);
    if (params.role) query.append('role', params.role);
    if (params.semester) query.append('semester', String(params.semester));
    if (params.departmentId) query.append('departmentId', params.departmentId);
    if (params.isActive !== undefined) query.append('isActive', String(params.isActive));
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.sortDir) query.append('sortDir', params.sortDir);

    const res = await fetch(`${API_BASE}/users?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch users');
    const json = await res.json();
    return {
      users: json.data || [],
      pagination: json.pagination || { page: 1, limit: 50, total: 0, totalPages: 1 }
    };
  }

  public async getUserById(id: string): Promise<{ user: User; studentDetails?: any; facultyDetails?: any }> {
    const res = await fetch(`${API_BASE}/users/${id}`);
    if (!res.ok) throw new Error('Failed to fetch user details');
    const json = await res.json();
    return json.data;
  }

  public async createUser(user: Partial<User> & { createdBy?: string }): Promise<User> {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Failed to create user');
    }
    return json.data;
  }

  public async updateUser(id: string, updates: Partial<User> & { updatedBy?: string }): Promise<User> {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Failed to update user');
    }
    return json.data;
  }

  public async deleteUser(id: string, hard = false, deletedBy = 'Admin'): Promise<void> {
    const res = await fetch(`${API_BASE}/users/${id}?hard=${hard}&deletedBy=${encodeURIComponent(deletedBy)}`, {
      method: 'DELETE'
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Failed to delete user');
    }
  }

  public async batchImportUsers(users: Partial<User>[], importedBy = 'Admin'): Promise<{ importedCount: number; skippedCount: number; errors: string[] }> {
    const res = await fetch(`${API_BASE}/users/batch-import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ users, importedBy })
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Failed to import users');
    }
    return json.data;
  }

  // --- Database Studio Endpoints ---
  public async getDbStats(): Promise<DbStats> {
    const res = await fetch(`${API_BASE}/db/stats`);
    if (!res.ok) throw new Error('Failed to fetch DB stats');
    const json = await res.json();
    return json.data;
  }

  public async getDbSchema(): Promise<{ tables: DbTableInfo[] }> {
    const res = await fetch(`${API_BASE}/db/schema`);
    if (!res.ok) throw new Error('Failed to fetch DB schema');
    const json = await res.json();
    return json.data;
  }

  public async executeQuery(sql: string, params: any[] = []): Promise<DbQueryResult> {
    const res = await fetch(`${API_BASE}/db/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql, params })
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'SQL Execution failed');
    }
    return json;
  }

  public async getTableData(
    table: string,
    page = 1,
    limit = 50,
    search = '',
    sortBy = '',
    sortDir = 'ASC'
  ): Promise<{
    table: string;
    tableInfo: DbTableInfo;
    rows: Record<string, any>[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
    executionTimeMs: number;
  }> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      search,
      sortBy,
      sortDir
    });
    const res = await fetch(`${API_BASE}/db/tables/${table}?${params.toString()}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || `Failed to fetch table ${table}`);
    }
    const json = await res.json();
    return json.data;
  }

  public async insertTableRow(table: string, record: Record<string, any>): Promise<void> {
    const res = await fetch(`${API_BASE}/db/tables/${table}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Insert failed');
    }
  }

  public async updateTableRow(table: string, id: string, updates: Record<string, any>): Promise<void> {
    const res = await fetch(`${API_BASE}/db/tables/${table}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Update failed');
    }
  }

  public async deleteTableRow(table: string, id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/db/tables/${table}/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Delete failed');
    }
  }

  public async exportDatabase(format: 'sql' | 'json' = 'json'): Promise<any> {
    const res = await fetch(`${API_BASE}/db/export?format=${format}`);
    if (format === 'sql') {
      return await res.text();
    }
    return await res.json();
  }

  public async importDatabase(payload: { format: 'sql' | 'json'; sql?: string; data?: any }): Promise<void> {
    const res = await fetch(`${API_BASE}/db/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Import failed');
    }
  }

  public async cleanDatabase(): Promise<{ success: boolean; message: string; clearedTables?: string[] }> {
    const res = await fetch(`${API_BASE}/db/clean`, { method: 'POST' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Clean failed');
    }
    return await res.json();
  }

  public async resetDatabase(mode?: 'clean' | 'seed'): Promise<void> {
    const res = await fetch(`${API_BASE}/db/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: mode || 'clean' })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Reset failed');
    }
  }

  // --- Python AI & Data Analytics Services ---
  public async getAnalyticsStatus(): Promise<{ online: boolean; engine?: string; message?: string }> {
    try {
      const res = await fetch(`${API_BASE}/analytics/status`);
      if (!res.ok) return { online: false };
      return await res.json();
    } catch {
      return { online: false };
    }
  }

  public async getAttendanceForecast(studentId: string, totalPlannedClasses = 60): Promise<AttendanceForecastResult> {
    const res = await fetch(`${API_BASE}/analytics/attendance/forecast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, totalPlannedClasses })
    });
    if (!res.ok) throw new Error('Failed to compute attendance forecast');
    return await res.json();
  }

  public async getRiskMatrix(): Promise<{ totalEvaluated: number; highRiskCount: number; riskMatrix: RiskMatrixItem[] }> {
    const res = await fetch(`${API_BASE}/analytics/risk-matrix`);
    if (!res.ok) throw new Error('Failed to fetch risk matrix');
    return await res.json();
  }

  public async getCohortStats(): Promise<CohortStatsResult> {
    const res = await fetch(`${API_BASE}/analytics/cohort-stats`);
    if (!res.ok) throw new Error('Failed to fetch cohort stats');
    return await res.json();
  }

  public async getAiMentoringAdvice(student: { name: string; attendanceRate: number; cgpa: number; semester: number }): Promise<AiMentoringAdvice> {
    const res = await fetch(`${API_BASE}/analytics/ai-mentoring-prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student)
    });
    if (!res.ok) throw new Error('Failed to generate AI mentoring advice');
    return await res.json();
  }

  // --- API Gateway & Core Integration ---
  public async dispatchSmsAlert(payload: {
    studentName: string;
    recipientPhone: string;
    alertType?: string;
    message: string;
    studentId?: string;
  }): Promise<{ success: boolean; dispatchId: string; recipient: string; student: string; status: string; timestamp: string }> {
    const res = await fetch(`${API_BASE}/v1/sms/dispatch-alert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to dispatch SMS alert');
    }
    return await res.json();
  }

  public async getGatewayHealth(): Promise<{
    status: string;
    service: string;
    version: string;
    targets: { java_core: string; python_analytics: string };
    websocket: string;
    timestamp: number;
  }> {
    const res = await fetch('/health');
    if (!res.ok) throw new Error('Gateway unreachable');
    return await res.json();
  }

  public async initializeBcaDepartmentSetup(
    departmentCode = 'BCA',
    adminUser = 'SYSTEM_ADMIN'
  ): Promise<{ status: string; message: string; departmentCode: string }> {
    const res = await fetch(`${API_BASE}/v1/master/initialize-bca-setup?departmentCode=${encodeURIComponent(departmentCode)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-User': adminUser
      }
    });
    if (!res.ok) throw new Error('Failed to initialize BCA department setup');
    return await res.json();
  }

  public async importStudentsBatchCsv(
    file: File,
    departmentCode = 'BCA',
    adminUser = 'SYSTEM_ADMIN'
  ): Promise<{ totalRows: number; successfulImports: number; failedImports: number; errors: string[] }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('departmentCode', departmentCode);

    const res = await fetch(`${API_BASE}/v1/master/students/batch-csv`, {
      method: 'POST',
      headers: {
        'X-Admin-User': adminUser
      },
      body: formData
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Batch CSV import failed');
    }
    return await res.json();
  }

  public async importFacultyBatchCsv(
    file: File,
    departmentCode = 'BCA',
    adminUser = 'SYSTEM_ADMIN'
  ): Promise<{ totalRows: number; successfulImports: number; failedImports: number; errors: string[] }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('departmentCode', departmentCode);

    const res = await fetch(`${API_BASE}/v1/master/faculty/batch-csv`, {
      method: 'POST',
      headers: {
        'X-Admin-User': adminUser
      },
      body: formData
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Faculty batch CSV import failed');
    }
    return await res.json();
  }
}

export const api = new ApiService();
