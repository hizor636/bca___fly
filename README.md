# BcaFly — Academic Governance & Mentoring Platform

BcaFly is a modern institutional academic management platform designed for the Department of Computer Applications (BCA). It enforces a **Single Source of Truth** relational database architecture with strict role-based access control across Administration, Faculty, Student, Guardian, and Counseling portals.

---

## 🏛️ Platform Architecture Components

For full details on the system architecture, data flows, and security boundaries, see the [Platform Architecture Specification](docs/PLATFORM_ARCHITECTURE.md).

- **PostgreSQL / Relational Backend — Source of Truth:** Central authoritative database maintaining departments, courses (Sem 1–6), faculty allocations, student enrollments, attendance ledgers, marks, mentoring notes, and immutable audit logs.
- **Active Sync:** Automatically cascades administrator-approved master data across Faculty Workspaces, Student Portals, Guardian Portals, and Public Sites without requiring manual database queries or redeployments.
- **Live DB:** Production-ready database engine with transactional safety, automated auditing, and soft-delete/archive preservation for academic history.
- **CSV Batch Import:** Controlled batch onboarding tool with column validation, duplicate detection, interactive row-level error reporting, and transactional commit.
- **Public Site:** Sanitized, read-only institutional portal for department overviews, course catalogs, public faculty directories, and announcements without exposing student private records.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` or `.env.local` file in the root directory:
```env
PORT=5000
VITE_API_URL=http://localhost:5000/api
```

### 3. Run Locally

Start the backend API server:
```bash
npm run server
```

In a separate terminal, start the frontend development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Verification

Run TypeScript compilation check:
```bash
npx tsc --noEmit
```

Build production bundle:
```bash
npm run build
```

Run 8-Step Institution Setup API verification:
```bash
npx tsx scratch/verify_admin_first.ts
```

---

## 🔒 Security & RBAC Model

| Role | Operational Scope |
|---|---|
| **Institutional Admin** | Full master data management (Departments, Semesters 1–6, Courses, Faculty, Students, Enrollments, Allocations, CSV Import, Audit Logs). |
| **Faculty** | Scoped strictly to assigned courses, batches, and mentee cohorts. Roll-call attendance, CIA grading, and mentoring notes. |
| **Student** | Self-scoped view of active semester enrollment, CIA score ledgers, attendance rates, and mentor contact. |
| **Guardian** | Scoped strictly to linked student profile, attendance summaries, and official carrier SMS logs. |
| **Counselor** | Protected counseling cell for student referrals and confidential notes. |
