# BcaFly — Academic Governance & Mentoring Platform

BcaFly is a modern institutional academic management platform designed for the Department of Computer Applications (BCA). It enforces a **Single Source of Truth** relational database architecture with strict role-based access control across Administration, Faculty, Student, Guardian, and Counseling portals.

---

## 🛠️ Technology Stack

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  BcaFly Platform Tech Stack Breakdown                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  [TypeScript: 98.5%]                                                        │
│  ├── Frontend: React 19 • Vite 6 • Tailwind CSS 4 • Lucide Icons            │
│  └── Backend: Node.js 22 • Express 5 • TSX                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  [Python: 1.3%]                                                             │
│  └── Analytics Microservice: Python 3.12 • Flask • Pandas • NumPy           │
├─────────────────────────────────────────────────────────────────────────────┤
│  [Other: 0.2%]                                                              │
│  └── DDL Relational Schemas • JSON Configuration • Automation Scripts       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Layer Details

| Technology Layer | Languages & Frameworks | Codebase Share | Purpose & Core Capabilities |
|---|---|---|---|
| **Frontend Application** | **TypeScript 5.8**, React 19, Vite 6, Tailwind CSS 4, Lucide Icons | **~65%** | Multi-portal interfaces (Admin, Faculty, Student, Guardian, Counselor), live reactive contexts (`DemoContext.tsx`), assignment-scoped views, clean zero-record states. |
| **Core Backend REST API** | **TypeScript 5.8**, Node.js 22, Express 5, TSX, In-Memory Store Layer | **~33.5%** | Authoritative Single Source of Truth engine (29 relational schemas), role-based middleware, transactional CSV batch importers, immutable audit logger. |
| **Analytics & AI Engine** | **Python 3.12**, Flask, Pandas, NumPy | **1.3%** | Attendance shortage trajectory forecaster, statistical CIA marks distribution, condonation eligibility calculator, academic risk classification (`server/python/analytics_service.py`). |
| **Infrastructure & DDL** | DDL Schemas, JSON, PowerShell / Bash | **0.2%** | Relational schemas, foreign key constraints, migration scripts, platform architecture specifications. |

---

## 🏛️ Platform Architecture Components

For detailed architecture specifications, data flows, and security boundaries, refer to the [Platform Architecture Specification](docs/PLATFORM_ARCHITECTURE.md).

- **In-Memory Store — Source of Truth:** Central authoritative data engine maintaining departments, courses (Sem 1–6), faculty allocations, student enrollments, attendance ledgers, marks, mentoring notes, and immutable audit logs.
- **Active Sync:** Automatically cascades administrator-approved master data across Faculty Workspaces, Student Portals, Guardian Portals, and Public Sites without requiring manual database queries or redeployments.
- **Live DB:** Production-ready database engine with transactional safety, automated auditing, and soft-delete/archive preservation for academic history.
- **CSV Batch Import:** Controlled batch onboarding tool with column validation, duplicate detection, interactive row-level error reporting, and transactional commit.
- **Public Site:** Sanitized, read-only institutional portal for department overviews, course catalogs, public faculty directories, and announcements without exposing student private records.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python 3.10+ (for optional Python analytics microservice)
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

**Option A — Run all services concurrently (Frontend + Backend + AI):**
```bash
npm run dev:all
```

**Option B — Run individually:**
- Start Core TypeScript Backend:
  ```bash
  npm run server
  ```
- Start Python Analytics Microservice (optional):
  ```bash
  npm run server:ai
  ```
- Start Vite Frontend:
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
