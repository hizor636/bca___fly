import {
  Student,
  FacultyMember,
  Course,
  CourseMarks,
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

  public async resetDatabase(): Promise<void> {
    const res = await fetch(`${API_BASE}/db/reset`, { method: 'POST' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Reset failed');
    }
  }

  // --- Academic Data Endpoints ---
  public async getStudents(): Promise<Student[]> {
    const res = await fetch(`${API_BASE}/students`);
    if (!res.ok) throw new Error('Failed to fetch students');
    const json = await res.json();
    return json.data;
  }

  public async getFaculty(): Promise<FacultyMember[]> {
    const res = await fetch(`${API_BASE}/faculty`);
    if (!res.ok) throw new Error('Failed to fetch faculty');
    const json = await res.json();
    return json.data;
  }

  public async getCourses(): Promise<Course[]> {
    const res = await fetch(`${API_BASE}/courses`);
    if (!res.ok) throw new Error('Failed to fetch courses');
    const json = await res.json();
    return json.data;
  }

  public async getCourseMarks(): Promise<CourseMarks[]> {
    const res = await fetch(`${API_BASE}/marks`);
    if (!res.ok) throw new Error('Failed to fetch marks');
    const json = await res.json();
    return json.data;
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

  public async reassignStudentMentor(studentId: string, newFacultyId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/students/${studentId}/reassign`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newFacultyId })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to reassign mentor');
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
}

export const api = new ApiService();

