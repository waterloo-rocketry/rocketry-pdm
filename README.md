# Engineering PDM — Phase 1

Frontend-only Next.js mock implementation of the drawing checking / approval / manufacturing workflow.

## Requirements
- Node.js 18.17+ (Node 20 LTS recommended)
- npm

## Run
```bash
npm install
npm run dev
```
Open http://localhost:3000

## Mock Admin Login
Password: `pdm-admin`

This is intentionally local/mock authentication only. It must be replaced in the backend/auth phase.

## Phase 1 persistence
Jobs and uploaded PDF data are stored in the browser's `localStorage`. This is useful only for a frontend prototype. Browser storage is small, so large PDFs may exceed the quota. Seeded sample jobs contain filename metadata but no real PDF bytes.

## Routes
- `/` Home
- `/new-job` New Job
- `/jobs` Existing Jobs
- `/jobs/[id]` Individual Job
- `/admin/login` Admin Login
- `/admin` Admin Dashboard
- `/admin/jack` Jack Inbox
- `/admin/raag` Raag Inbox
- `/admin/manufacturing` Manufacturing
- `/admin/completed` Completed Jobs
- `/admin/jobs/[id]` Admin Job Review

## Workflow implemented
1. New Job -> Awaiting Check
2. Checker -> Work in Progress OR Awaiting Approval
3. WIP revision -> Awaiting Check, same checker retained
4. Approver -> Work in Progress OR Awaiting Manufacturing
5. Awaiting Manufacturing -> Complete by Jack or Raag
6. Comments append chronologically
7. PDF versions append and never overwrite
8. Workflow events append chronologically
