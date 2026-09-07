# Security Policy — BcaFly

## Purpose

BcaFly is an education platform for students, faculty, counselors, HODs, and administrators.

This policy defines how we protect student data, faculty workspaces, attendance information, mentoring/counseling records, documents, and administrator functions while the project is hosted in Git and deployed through Vercel.

> **Core rule:** UI restrictions alone are never security. Every protected operation must be authorized on the server when backend/API functionality is introduced.

---

## Security Priorities

BcaFly must protect:

- Student personal and academic information
- Attendance records and shortage reports
- Faculty-to-student assignments
- Counseling and mentoring records
- Uploaded documents and report exports
- Admin and HOD management actions
- Authentication sessions, passwords, tokens, and secrets
- Audit logs for sensitive actions

---

## Current Deployment Scope

| Component | Current approach | Security requirement |
|---|---|---|
| Frontend | Next.js / Vite React deployed on Vercel | Do not expose secrets in browser code |
| Repository | GitHub/Git | No passwords, tokens, API keys, or database URLs committed |
| Demo mode | Mock/demo data | Use fictional data only; never real student data |
| Future backend/API | Server-side API or backend | Enforce authentication, role checks, assignment checks, validation, and audit logging |

---

## Data Classification

### Public Data

Information that may be visible without login:

- Landing-page content
- Platform features
- Support/contact information
- Public announcements approved by administrators

### Internal Data

Information visible only to authenticated users with the correct role:

- Faculty dashboard summaries
- Class and semester metadata
- Internal platform settings
- Non-sensitive operational reports

### Confidential Data

Information requiring strict access control:

- Student profiles, attendance, marks, and academic history
- Faculty assignments
- Counseling and mentoring notes
- Parent contact details
- Uploaded documents
- Audit logs
- Admin-only reports
- Password hashes, session tokens, API keys, database credentials, and environment variables

---

## Roles and Access Control

BcaFly uses role-based access control (RBAC) and assignment-based access control.

| Role | Permitted access |
|---|---|
| Student | Only their own profile, attendance, approved documents, and permitted academic information |
| Faculty | Only students explicitly assigned to that faculty member |
| Counselor | Only students and counseling cases explicitly assigned to the counselor |
| HOD | Department-level data only, limited to their assigned department |
| Admin | User management, roles, assignments, configuration, reports, and audits |
| Super Admin | Restricted platform administration; use only when necessary |

### Mandatory Authorization Rules

- A user must be authenticated before accessing any dashboard, record, document, or report.
- Every protected route must verify the authenticated user on the server.
- Every student-data request must verify both role and scope.
- Faculty members must not access students merely by changing a URL, ID, query parameter, browser storage value, or API request.
- A faculty member may access a student only when an active assignment exists between that faculty member and that student.
- HOD access must be restricted to the HOD’s own department.
- Removed, inactive, suspended, or transferred users must lose access immediately.
- Admin-only actions must never rely only on hidden buttons or frontend route guards.

### Example Authorization Rule

```ts
// Pseudocode: enforce this on the server/API, never only in the UI.

if (currentUser.role === "FACULTY") {
  const hasAssignment = await hasActiveFacultyStudentAssignment(
    currentUser.id,
    requestedStudentId
  );

  if (!hasAssignment) {
    return denyAccess(403, "You are not assigned to this student.");
  }
}
```

---

## Authentication Requirements

When authentication is enabled:

- Store passwords only as strong password hashes, never plaintext.
- Use Argon2id where available; bcrypt is an acceptable fallback.
- Require a minimum password length of 12 characters.
- Do not reveal whether an email/username exists during login or password-reset flows.
- Rate-limit login, signup, password reset, and OTP endpoints.
- Lock or temporarily delay repeated failed login attempts.
- Use secure, HTTP-only, same-site cookies for browser sessions.
- Use `Secure` cookies in production.
- Rotate session identifiers after login and password changes.
- Expire inactive sessions and provide logout from all devices when possible.
- Require stronger authentication for admin and super-admin accounts, preferably MFA when production accounts are created.
- Never store authentication tokens in `localStorage` if secure HTTP-only cookies can be used instead.

---

## Route Protection

Frontend middleware may improve user experience, but it is not the final security control.

Protected routes should include:

```text
/admin/*
/faculty/*
/student/*
/counselor/*
/hod/*
/workspace/*
/reports/*
/documents/*
/settings/*
```

Requirements:

- Redirect unauthenticated visitors to `/login`.
- Redirect authenticated users without permission to `/unauthorized`.
- Verify authorization again in server components, API routes, server actions, or backend endpoints.
- Do not trust role values received from forms, URLs, cookies that are not cryptographically protected, local storage, or client-side state.
- Return `401 Unauthorized` for missing/invalid authentication.
- Return `403 Forbidden` for authenticated users without access.

---

## Secure Smart Workspaces

Faculty Smart Workspaces must be scoped to active assignments.

- Show only assigned students by default.
- Search results must be filtered server-side by faculty assignment.
- Student detail pages must verify assignment before returning any data.
- Document downloads must verify the requester has access to the related student/document.
- Assignment changes must take effect immediately.
- Do not provide an “all students” endpoint to faculty accounts.
- Record denied-access attempts in the audit log after backend functionality is added.

---

## Secrets and Environment Variables

Never commit secrets to Git, even in a private repository. GitHub secret scanning can detect many hardcoded credential types across repository history and branches.

### Never Commit

- `.env`
- `.env.local`
- `.env.production`
- API keys
- Database credentials
- JWT secrets
- Session secrets
- SMTP credentials
- SMS/WhatsApp credentials
- OAuth client secrets
- Vercel tokens
- GitHub personal access tokens
- Private keys
- Service-account JSON files
- Real student exports or production database dumps

### Required `.gitignore` Entries

```gitignore
# Environment files
.env
.env.*
!.env.example

# Keys and certificates
*.pem
*.key
*.p12
*.pfx
*.crt

# Local databases and backups
*.sqlite
*.sqlite3
*.db
*.sql.gz
*.dump
backups/

# Logs
*.log
logs/

# Next.js / Vite build outputs
.next/
out/
dist/
build/

# Dependencies
node_modules/

# OS/editor files
.DS_Store
.vscode/
.idea/
```

### Safe `.env.example`

Commit only placeholders:

```env
# Public values only when genuinely safe for browser exposure
NEXT_PUBLIC_APP_NAME=BcaFly

# Server-only values: placeholders only
SESSION_SECRET=replace_with_a_long_random_secret
JWT_SECRET=replace_with_a_long_random_secret

# Optional services
SMS_API_KEY=replace_me
WHATSAPP_TOKEN=replace_me
```

### Vercel Rules

- Add secrets in **Vercel Project Settings → Environment Variables**.
- Use separate values for Development, Preview, and Production.
- Mark production secrets as **Sensitive** where available.
- Never prefix secrets with `NEXT_PUBLIC_`.
- Treat every `NEXT_PUBLIC_*` variable as visible to users in the browser bundle.
- Rotate a secret immediately if it is exposed, even if the repository is private.
- Redeploy after rotating environment variables where required.

---

## Git and Pull Request Security

Before pushing code:

- Check `git status` for unintended files.
- Check `git diff --cached` before committing.
- Confirm no `.env`, backup, export, token, or credential file is staged.
- Use meaningful commits; avoid committing generated production data.
- Keep dependencies up to date.
- Review pull requests before merging into `main`.

Recommended checks:

```bash
# Check staged files before a commit
git status
git diff --cached

# Search tracked files for likely secrets
git grep -nEi "password|secret|api[_-]?key|token|database_url|private_key" || true

# Install dependencies from lockfile
npm ci

# Run checks
npm run lint
npm run build
```

Enable GitHub secret scanning and push protection when available.

---

## Dependency Security

- Use a lockfile (`package-lock.json`, `pnpm-lock.yaml`, `bun.lock`, or `yarn.lock`).
- Prefer well-maintained packages with clear ownership and active updates.
- Remove unused dependencies.
- Review new packages before installing them.
- Avoid copying unknown scripts from the internet into build pipelines.
- Run dependency checks regularly.

Suggested commands:

```bash
npm audit
npm outdated
npm run lint
npm run build
```

Do not use `npm audit fix --force` blindly; review major-version changes first.

---

## Input Validation

All input must be validated on the server, even if client-side validation exists.

Validate:

- Names, email addresses, phone numbers, IDs, dates, semester values
- Attendance status and dates
- Search parameters, filters, pagination, and sorting fields
- Uploaded filenames, file types, size, and ownership metadata
- Admin settings and role changes
- Report-generation parameters

Security rules:

- Use allow-lists for roles, attendance values, file types, and sort fields.
- Use parameterized SQL queries or a trusted ORM; never concatenate user input into SQL.
- Escape or safely render user-provided text to prevent XSS.
- Reject unexpected fields instead of silently accepting them.
- Enforce server-side limits for text length, requests, page size, and file size.

---

## File Upload Security

When document uploads are implemented:

- Allow only required formats, such as PDF, JPG, PNG, and approved office documents.
- Validate the real file type, not only the filename extension.
- Limit file size.
- Rename files using generated IDs; do not use user-supplied filenames as storage paths.
- Store files outside the public web root.
- Use private storage by default.
- Require authorization before previewing or downloading files.
- Scan uploads for malware when infrastructure supports it.
- Do not allow executable files, scripts, archives, or HTML uploads unless explicitly required and securely handled.
- Keep upload metadata: uploader, owner/student ID, upload time, file hash, and access scope.

---

## Database Security

When a database is added:

- Use a dedicated production database and separate development database.
- Never expose database instances directly to the public internet unless absolutely necessary.
- Use a non-superuser database account for the application.
- Give each service only the permissions it needs.
- Use TLS for database connections when supported.
- Use parameterized queries or ORM query builders.
- Create database backups and test restoration.
- Encrypt backup storage where possible.
- Do not store raw passwords, access tokens, or OTP values.
- Store only hashed passwords and hashed/rotated reset tokens.
- Keep counseling notes and sensitive student data in restricted tables/queries.

---

## API Security

When APIs are added:

- Authenticate every non-public endpoint.
- Authorize every request using server-side role and scope checks.
- Validate request bodies, query parameters, route parameters, and headers.
- Apply rate limits to login, signup, reset-password, search, reports, and upload endpoints.
- Use pagination for list endpoints.
- Prevent mass assignment; explicitly choose fields that may be updated.
- Return minimal data required for each role.
- Do not expose stack traces, SQL errors, secrets, or internal identifiers in production responses.
- Set secure CORS rules; allow only trusted frontend origins.
- Use CSRF protection for cookie-based state-changing requests.
- Add security headers, including Content Security Policy, `X-Content-Type-Options`, `Referrer-Policy`, and clickjacking protection.

---

## Audit Logging

Log sensitive actions without logging passwords, tokens, or full confidential content.

Audit events should include:

- Login success and failure
- Logout and session invalidation
- Role creation or change
- Faculty/student assignment creation, update, and removal
- Attendance creation, update, deletion, and bulk edits
- Counseling/mentoring record access or changes
- Document upload, download, delete, and access denial
- Report export
- Admin configuration changes
- Unauthorized access attempts

Suggested fields:

```text
audit_id
timestamp
actor_user_id
actor_role
action
resource_type
resource_id
outcome
ip_address
user_agent
request_id
metadata
```

---

## Production Privacy Rules

- Use fictional/demo data in public previews, screenshots, recordings, and Git commits.
- Never place real student data in test fixtures.
- Never share screenshots containing passwords, tokens, personal details, attendance records, or counseling notes.
- Limit production access to authorized project members.
- Remove access immediately when a contributor leaves the project.
- Export reports only for authorized roles and only when necessary.

---

## Incident Response

If a secret, account, deployment, database, or student record may have been exposed:

1. Remove public access if needed.
2. Revoke and rotate exposed tokens, passwords, API keys, database credentials, and session secrets.
3. Remove the leaked value from current code and Git history if necessary.
4. Redeploy the application with new secrets.
5. Review Vercel, GitHub, database, and application audit logs.
6. Identify affected users and data.
7. Notify the project owner/administrator immediately.
8. Document the incident, impact, remediation, and prevention steps.
9. Add a regression check to prevent the same issue from happening again.

> Removing a secret from a file is not enough if it was committed. Rotate it immediately because Git history, forks, clones, logs, and build outputs may retain it.

---

## Vulnerability Reporting

Do not publicly disclose a security issue before it has been reviewed.

Report vulnerabilities privately to the project owner with:

- A clear description of the issue
- Affected page, feature, route, or component
- Steps to reproduce
- Expected and actual behavior
- Screenshots or proof of concept with sensitive data removed
- Potential impact
- Suggested mitigation, if known

The project owner should acknowledge the report, investigate it, apply a fix, test the fix, deploy it, and document the resolution.

---

## Pre-Deploy Checklist

Before deploying to Vercel:

- [ ] No `.env` or credential files are committed
- [ ] `.env.example` contains placeholders only
- [ ] No real student data exists in the repository or demo deployment
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] Authentication and authorization checks are tested
- [ ] Faculty access is restricted to assigned students
- [ ] Admin routes are blocked for non-admin users
- [ ] Direct URL access is tested for every protected page
- [ ] Sensitive environment variables are configured in Vercel
- [ ] No secret uses the `NEXT_PUBLIC_` prefix
- [ ] Security headers and CORS rules are configured
- [ ] Error messages do not expose implementation details
- [ ] Audit logging is enabled for sensitive actions
- [ ] Backups and recovery steps are documented before production data is used

---

## Security Principle

BcaFly follows least privilege:

> Every user receives the minimum access needed for their current role and active assignment, and access is verified by the server for every sensitive request.
