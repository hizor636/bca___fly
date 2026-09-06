# BcaFly Platform Architecture Specification

## 1. Executive Summary & Governance Principle

> **PostgreSQL stores the authoritative institutional record. CSV imports are controlled entry points, Active Sync distributes approved changes, Live DB powers authenticated operations, and the Public Site receives only safe, approved, read-only information.**

---

## 2. Core Architectural Components

```text
Administrators / Faculty
        │
        ▼
PostgreSQL Source of Truth (Authoritative 29-Table Relational Schema)
        │
        ├───► Live DB Operations
        │       ├── Faculty Workspace (Assignment-Scoped)
        │       ├── Student Portal (Self-Scoped)
        │       ├── Guardian Portal (Linked-Student Scoped)
        │       └── Counselor Vault (Confidential Scoped)
        │
        ├───► CSV Batch Import
        │       ├── Strict Field & DataType Validation
        │       ├── Duplicate Detection & Foreign Key Checks
        │       ├── Row-Level Error & Action Preview
        │       ├── Administrator Confirmation
        │       └── Immutable Audit Trail Logging
        │
        └───► Active Sync & Distribution
                ├── Public Site (Sanitized, Read-Only, Cached)
                ├── Portal Updates & Cache Revalidation
                ├── Notification & Carrier SMS Services
                └── Historical Analytics & 6-Semester Reports
```

---

## 3. Component Details & Security Rules

### 3.1 PostgreSQL — Source of Truth
PostgreSQL is the central, authoritative database for the platform. All institutional records are created, validated, and maintained here before being exposed to other modules or portals.

**Core Data Managed:**
- Departments, academic calendars, semesters 1–6, courses, and subjects
- Faculty, students, guardians, counselors, and user authentication accounts
- Faculty course allocations, mentor assignments, and batch-class mappings
- Attendance records, leave requests, CIA marks ledgers, and mentoring notes
- Carrier SMS templates, notification dispatches, audit trails, and system settings
- Documents, uploads, metadata, and access-control matrices

**Rules & Safeguards:**
- PostgreSQL remains the final authority when records conflict.
- Every write operation is validated and recorded in immutable audit logs (`audit_logs`).
- Public-facing applications never directly access unrestricted database tables.
- Sensitive fields (passwords, phone numbers, confidential counseling notes) use server-side RBAC.

---

### 3.2 Active Sync
Active Sync keeps approved institutional data consistent across the Faculty Workspace, Student Portal, Guardian Portal, and Public Site.

**Sync Responsibilities:**
- Publish approved course, department, calendar, faculty directory, and announcement data.
- Update student and guardian portals with real-time attendance, CIA marks, and circulars.
- Synchronize notification status, SMS delivery logs, and template updates.
- Invalidate and refresh frontend cache keys immediately upon administrative mutations.

**Sync Principles:**
- Syncs only the fields required by each destination (least privilege).
- Uses timestamps and versioning to detect changes and prevent overwrites.
- Captures failure logs and provides automatic retry mechanisms.
- Keeps private institutional data strictly excluded from public sync targets.

---

### 3.3 Live DB
Live DB represents the production database currently serving real users and official institutional operations.

**Operational Safeguards:**
- Active, verified, and production-ready records with zero mock data.
- Automated audit trails capturing actor, role, action, target entity, timestamp, and IP.
- Soft-delete and archive lifecycle (`is_active`, `archived_at`, `archived_by`) preserving historical reporting integrity.
- Encrypted database connections and secure environment variable management.

---

### 3.4 CSV Batch Import
CSV Batch Import allows administrators to upload large batches of institutional data safely.

**Supported Import Entities:**
- Student Admissions and Semester Enrollment Matrices
- Faculty Directories and Employment Records
- Department and Course Master Ledgers
- Course Allocation and Mentor Mapping Matrices
- Attendance History and CIA Marks Records

**Import Workflow:**
1. Download approved template.
2. Validate column names, mandatory fields, email/phone formats, and duplicate records.
3. Interactive preview detailing additions, updates, skipped rows, and errors.
4. Transactional database write upon explicit administrator confirmation.
5. Record immutable audit entry with filename, uploader, timestamp, and summary.
6. Trigger Active Sync to propagate changes across all authorized views.

---

### 3.5 Public Site
The Public Site is the outward-facing institutional portal for content accessible without authentication.

**Public Content:**
- Institution overview and department introductions
- Course catalog, curriculum summaries, and academic calendars
- Faculty directory with approved public credentials
- General circulars, announcements, and support contact channels

**Security Boundaries:**
- Strictly read-only, sanitized, and approved data.
- Zero exposure of student profiles, roll numbers, attendance rates, marks, internal mentoring notes, guardian contacts, or audit logs.
- Decoupled from private operational APIs to ensure high availability and security.

---

## 4. Compliance & Acceptance Criteria

| Criteria | Enforcement Mechanism | Status |
|---|---|---|
| **Single Source of Truth** | Relational SQLite / PostgreSQL backend (`schema.ts`) | **Enforced** |
| **Role-Based Isolation** | Scoped APIs (`/api/faculty/*`, `/api/student/*`, `/api/guardian/*`) | **Enforced** |
| **No Mock Data in Production** | Dynamic database queries + clean empty states | **Enforced** |
| **Controlled Batch Onboarding** | CSV Import modal with preview, validation & transactional rollback | **Enforced** |
| **Audit Governance** | Immutable `audit_logs` table tracking all mutations | **Enforced** |
| **Public Site Sanitization** | Static/approved endpoints without private student data | **Enforced** |
