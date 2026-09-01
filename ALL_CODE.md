# Engineering PDM Phase 2 � Exact File Contents

## `README.md`

```md
# Engineering PDM — Phase 2

Next.js + TypeScript engineering PDM workflow with Supabase-backed job and stock data.

## Requirements
- Node.js 18.17+ (Node 20 LTS recommended)
- npm
- Supabase project

## Run
```bash
npm install
npm run dev
```

## `app/admin/completed/page.tsx`

```tsx
"use client";
import { AdminGuard } from "@/components/AdminGuard";
import { JobsTable } from "@/components/JobsTable";
import { useJobs } from "@/lib/jobStore";
export default function CompletedPage() { const { jobs } = useJobs(); return <main><AdminGuard><div className="page-heading"><div><h1>Completed Jobs</h1><p>Read-only completed job history.</p></div></div><JobsTable jobs={jobs.filter(j => j.status === "Complete")} admin /></AdminGuard></main>; }
```

## `app/admin/jack/page.tsx`

```tsx
"use client";
import { AdminGuard } from "@/components/AdminGuard";
import { JobsTable } from "@/components/JobsTable";
import { useJobs } from "@/lib/jobStore";
export default function JackInbox() { const { jobs } = useJobs(); const filtered = jobs.filter(j => (j.status === "Awaiting Check" && j.checker === "Jack") || (j.status === "Awaiting Approval" && j.approver === "Jack")); return <main><AdminGuard><div className="page-heading"><div><h1>Jack Inbox</h1><p>Jobs where Jack is the current checker or approver.</p></div></div><JobsTable jobs={filtered} admin /></AdminGuard></main>; }
```

## `app/admin/jobs/[id]/page.tsx`

```tsx
"use client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { AdminGuard } from "@/components/AdminGuard";
import { useJobs } from "@/lib/jobStore";
import { StatusBadge } from "@/components/StatusBadge";
import { JobDetails } from "@/components/JobDetails";
import { PdfViewer } from "@/components/PdfViewer";
import { CommentsList } from "@/components/CommentsList";
import { VersionHistory } from "@/components/VersionHistory";
import { WorkflowHistory } from "@/components/WorkflowHistory";
import { AdminReviewActions } from "@/components/AdminReviewActions";
import { Person } from "@/lib/types";

export default function AdminJobPage() {
  const params = useParams<{ id: string }>();
  const { jobs, markComplete } = useJobs();
  const job = jobs.find(j => j.id === params.id);
  const [actingAdmin, setActingAdmin] = useState<Person>("Jack");
  const router = useRouter();
  if (!job) return <main><AdminGuard><div className="card">Job not found.</div></AdminGuard></main>;
  const latest = job.versions[job.versions.length - 1];
  const requiredAdmin = job.status === "Awaiting Check" ? job.checker : job.status === "Awaiting Approval" ? job.approver : null;
  const complete = () => { markComplete(job.id, actingAdmin); router.push("/admin/completed"); };
  return <main className="stack"><AdminGuard>
    <div className="page-heading"><div><h1>{job.title}</h1><p>{job.id}</p></div><StatusBadge status={job.status} /></div>
    <div className="card stack"><div className="field" style={{maxWidth: 280}}><label>Acting Admin</label><select value={actingAdmin} onChange={(e) => setActingAdmin(e.target.value as Person)}><option>Jack</option><option>Raag</option></select></div>{requiredAdmin && actingAdmin !== requiredAdmin && <div className="warning">This stage is assigned to <strong>{requiredAdmin}</strong>. Switch Acting Admin to {requiredAdmin} to perform the workflow action.</div>}</div>
    <div className="card"><JobDetails job={job} /></div>
    <div className="grid-2"><div className="card"><h2 className="section-title">Submission Information</h2><p><strong>Original comments</strong></p><p>{job.originalComments}</p></div><div className="card"><h2 className="section-title">Current Drawing</h2><PdfViewer version={latest} /></div></div>
    <div className="card"><h2 className="section-title">All Comments</h2><CommentsList comments={job.comments} /></div>
    {(job.status === "Awaiting Check" || job.status === "Awaiting Approval") && actingAdmin === requiredAdmin && <AdminReviewActions job={job} actingAdmin={actingAdmin} />}
    {job.status === "Awaiting Manufacturing" && <div className="card stack"><h2 className="section-title">Manufacturing Action</h2><p>Either Jack or Raag may mark this job as complete.</p><div><button className="btn btn-success" onClick={complete}>Mark as Complete</button></div></div>}
    {job.status === "Complete" && <div className="notice"><strong>Completed job:</strong> normal workflow action buttons are disabled. This record remains available for history and document viewing.</div>}
    {job.status === "Work in Progress" && <div className="notice">This job is currently with the engineering user for revision. No admin action is required until it is resubmitted.</div>}
    <div className="card"><h2 className="section-title">Document Version History</h2><VersionHistory versions={job.versions} /></div>
    <div className="card"><h2 className="section-title">Workflow History</h2><WorkflowHistory events={job.workflow} /></div>
  </AdminGuard></main>;
}
```

## `app/admin/login/page.tsx`

```tsx
"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const MOCK_PASSWORD = "pdm-admin";
export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (password !== MOCK_PASSWORD) { setError("Incorrect mock password."); return; }
    window.sessionStorage.setItem("pdm-admin-auth", "true");
    router.push("/admin");
  };
  return <main><div className="card stack" style={{ maxWidth: 520, margin: "40px auto" }}><h1 style={{ margin: 0 }}>Admin Login</h1><div className="warning">
  <strong>Temporary admin login:</strong> use password <code>pdm-admin</code>. This will be replaced when real authentication is added.
</div><form className="stack" onSubmit={submit}><div className="field"><label>Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>{error && <div className="warning">{error}</div>}<button className="btn btn-primary">Login</button></form></div></main>;
}
```

## `app/admin/manufacturing/page.tsx`

```tsx
"use client";
import { AdminGuard } from "@/components/AdminGuard";
import { JobsTable } from "@/components/JobsTable";
import { useJobs } from "@/lib/jobStore";
export default function ManufacturingPage() { const { jobs } = useJobs(); return <main><AdminGuard><div className="page-heading"><div><h1>Manufacturing</h1><p>Approved jobs awaiting manual completion.</p></div></div><JobsTable jobs={jobs.filter(j => j.status === "Awaiting Manufacturing")} admin /></AdminGuard></main>; }
```

## `app/admin/page.tsx`

```tsx
"use client";

import Link from "next/link";

import { AdminGuard } from "@/components/AdminGuard";

import { useJobs } from "@/lib/jobStore";

export default function AdminPage() {
  const { jobs } = useJobs();

  const jack = jobs.filter(
    (j) =>
      (j.status === "Awaiting Check" && j.checker === "Jack") ||
      (j.status === "Awaiting Approval" && j.approver === "Jack")
  ).length;

  const raag = jobs.filter(
    (j) =>
      (j.status === "Awaiting Check" && j.checker === "Raag") ||
      (j.status === "Awaiting Approval" && j.approver === "Raag")
  ).length;

  const mfg = jobs.filter(
    (j) => j.status === "Awaiting Manufacturing"
  ).length;

  const done = jobs.filter(
    (j) => j.status === "Complete"
  ).length;

  return (
    <main>
      <AdminGuard>
        <div className="page-heading">
          <div>
            <h1>Admin Dashboard</h1>
            <p>
              Route work between checking, approval,
              manufacturing, and completion.
            </p>
          </div>
        </div>

        <div className="admin-grid">
          <Link className="admin-tile" href="/admin/jack">
            <h2>Jack Inbox</h2>
            <p>{jack} job(s) currently need Jack&apos;s action.</p>
          </Link>

          <Link className="admin-tile" href="/admin/raag">
            <h2>Raag Inbox</h2>
            <p>{raag} job(s) currently need Raag&apos;s action.</p>
          </Link>

          <Link className="admin-tile" href="/admin/manufacturing">
            <h2>Manufacturing</h2>
            <p>
              {mfg} approved job(s) are awaiting manufacturing.
            </p>
          </Link>

          <Link className="admin-tile" href="/admin/completed">
            <h2>Completed Jobs</h2>
            <p>{done} completed job(s) are archived here.</p>
          </Link>
        </div>
      </AdminGuard>
    </main>
  );
}
```

## `app/admin/raag/page.tsx`

```tsx
"use client";
import { AdminGuard } from "@/components/AdminGuard";
import { JobsTable } from "@/components/JobsTable";
import { useJobs } from "@/lib/jobStore";
export default function RaagInbox() { const { jobs } = useJobs(); const filtered = jobs.filter(j => (j.status === "Awaiting Check" && j.checker === "Raag") || (j.status === "Awaiting Approval" && j.approver === "Raag")); return <main><AdminGuard><div className="page-heading"><div><h1>Raag Inbox</h1><p>Jobs where Raag is the current checker or approver.</p></div></div><JobsTable jobs={filtered} admin /></AdminGuard></main>; }
```

## `app/globals.css`

```css
:root {
  --bg: #f4f6f8;
  --surface: #ffffff;
  --surface-soft: #f8fafc;
  --text: #17202a;
  --muted: #667085;
  --line: #dce2e8;
  --primary: #1f4f78;
  --primary-dark: #163b5b;
  --danger: #a52b2b;
  --success: #257a4a;
  --warning: #9b6913;
  --shadow: 0 8px 24px rgba(27, 39, 51, 0.08);
}

* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  background: var(--bg);
  color: var(--text);
  font-family: Arial, Helvetica, sans-serif;
}
a { color: inherit; text-decoration: none; }
button, input, select, textarea { font: inherit; }
button { cursor: pointer; }

.shell { min-height: 100vh; }
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: #101d2a;
  color: white;
  padding: 16px clamp(18px, 4vw, 54px);
  border-bottom: 3px solid #315a7d;
}
.brand { font-weight: 800; letter-spacing: .02em; }
.nav { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.nav a { padding: 9px 12px; border-radius: 7px; color: #e8eef4; }
.nav a:hover { background: rgba(255,255,255,.08); }

main { width: min(1180px, calc(100% - 32px)); margin: 0 auto; padding: 34px 0 56px; }
.page-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin-bottom: 22px; }
.page-heading h1 { margin: 0 0 5px; font-size: clamp(28px, 4vw, 40px); }
.page-heading p { margin: 0; color: var(--muted); }

.hero { padding: 74px 0 30px; text-align: center; }
.hero h1 { font-size: clamp(36px, 6vw, 62px); margin: 0 0 16px; }
.hero p { max-width: 760px; margin: 0 auto; color: var(--muted); font-size: 18px; line-height: 1.6; }
.home-actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 22px; max-width: 860px; margin: 42px auto; }
.action-card { background: var(--surface); border: 1px solid var(--line); border-radius: 14px; padding: 34px; box-shadow: var(--shadow); text-align: left; }
.action-card:hover { transform: translateY(-2px); transition: .18s ease; border-color: #aebdca; }
.action-card h2 { margin: 0 0 10px; }
.action-card p { margin: 0; color: var(--muted); line-height: 1.55; }

.card { background: var(--surface); border: 1px solid var(--line); border-radius: 12px; padding: 22px; box-shadow: 0 2px 10px rgba(27,39,51,.04); }
.grid-2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
.grid-3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
.stack { display: grid; gap: 18px; }
.section-title { margin: 0 0 14px; font-size: 20px; }

.field { display: grid; gap: 7px; }
.field label { font-weight: 700; font-size: 14px; }
.field input, .field select, .field textarea {
  width: 100%; border: 1px solid #cbd5df; border-radius: 8px; padding: 11px 12px; background: white; color: var(--text);
}
.field textarea { min-height: 150px; resize: vertical; }
.field input:focus, .field select:focus, .field textarea:focus { outline: 3px solid rgba(31,79,120,.13); border-color: var(--primary); }
.help { color: var(--muted); font-size: 13px; line-height: 1.4; }
.upload-box { min-height: 164px; border: 2px dashed #b7c3cf; border-radius: 10px; padding: 20px; display: grid; place-items: center; text-align: center; background: var(--surface-soft); }

.button-row { display: flex; gap: 10px; flex-wrap: wrap; }
.btn { border: 0; border-radius: 8px; padding: 11px 16px; font-weight: 800; background: #dfe5eb; color: #273444; }
.btn:hover { filter: brightness(.97); }
.btn-primary { background: var(--primary); color: white; }
.btn-primary:hover { background: var(--primary-dark); }
.btn-danger { background: var(--danger); color: white; }
.btn-success { background: var(--success); color: white; }
.btn:disabled { cursor: not-allowed; opacity: .42; filter: grayscale(.2); }
.btn-lg { padding: 14px 22px; font-size: 16px; }

.table-wrap { overflow-x: auto; border-radius: 12px; border: 1px solid var(--line); background: white; }
table { width: 100%; border-collapse: collapse; min-width: 820px; }
th { text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: .05em; color: #5e6a76; background: #f2f5f7; }
th, td { padding: 14px 16px; border-bottom: 1px solid #e6eaee; }
tbody tr:last-child td { border-bottom: 0; }
tbody tr:hover { background: #f8fafb; }
.job-link { font-weight: 800; color: var(--primary); }

.badge { display: inline-flex; align-items: center; white-space: nowrap; border-radius: 999px; padding: 5px 10px; font-size: 12px; font-weight: 800; }
.badge-wip { background: #edf0f2; color: #4c5964; }
.badge-check { background: #fff3c9; color: #7a5500; }
.badge-approval { background: #e8e6ff; color: #5448a8; }
.badge-manufacturing { background: #dcecff; color: #215f97; }
.badge-complete { background: #dcf4e7; color: #207148; }

.details { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.detail { background: var(--surface-soft); border: 1px solid #e3e8ed; padding: 14px; border-radius: 9px; }
.detail span { display: block; color: var(--muted); font-size: 12px; text-transform: uppercase; letter-spacing: .04em; margin-bottom: 5px; }
.detail strong { display: block; }

.history-list { display: grid; gap: 10px; }
.history-item { border-left: 3px solid #b8c7d4; padding: 3px 0 3px 14px; }
.history-item strong { display: block; }
.history-meta { color: var(--muted); font-size: 13px; margin-top: 3px; }
.comment { border: 1px solid var(--line); border-radius: 9px; padding: 14px; background: #fbfcfd; }
.comment-head { display: flex; gap: 8px; align-items: baseline; flex-wrap: wrap; margin-bottom: 7px; }
.comment-role { color: var(--muted); font-size: 12px; }
.comment p { margin: 0; line-height: 1.5; white-space: pre-wrap; }
.empty { color: var(--muted); padding: 22px; text-align: center; }

.pdf-panel iframe { width: 100%; height: 600px; border: 1px solid var(--line); border-radius: 8px; background: #eee; }
.pdf-placeholder { min-height: 220px; display: grid; place-items: center; text-align: center; background: #f2f4f6; border: 1px solid var(--line); border-radius: 8px; padding: 24px; color: var(--muted); }

.admin-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
.admin-tile { background: white; border: 1px solid var(--line); border-radius: 12px; padding: 28px; box-shadow: var(--shadow); }
.admin-tile h2 { margin-top: 0; }
.admin-tile p { color: var(--muted); }
.notice { padding: 13px 15px; border-radius: 8px; background: #edf6ff; border: 1px solid #c9e1f7; color: #234d70; }
.warning { padding: 13px 15px; border-radius: 8px; background: #fff6de; border: 1px solid #eed89b; color: #6f5617; }

@media (max-width: 800px) {
  .grid-2, .grid-3, .home-actions, .admin-grid, .details { grid-template-columns: 1fr; }
  .topbar { align-items: flex-start; }
  .page-heading { align-items: flex-start; flex-direction: column; }
}
```

## `app/jobs/[id]/page.tsx`

```tsx
"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useJobs } from "@/lib/jobStore";
import { Loading } from "@/components/Loading";
import { StatusBadge } from "@/components/StatusBadge";
import { JobDetails } from "@/components/JobDetails";
import { PdfViewer } from "@/components/PdfViewer";
import { CommentsList } from "@/components/CommentsList";
import { VersionHistory } from "@/components/VersionHistory";
import { WorkflowHistory } from "@/components/WorkflowHistory";
import { fileToDataUrl } from "@/lib/utils";

export default function JobPage() {
  const params = useParams<{ id: string }>();
  const { jobs, ready, resubmitJob } = useJobs();
  const job = jobs.find((j) => j.id === params.id);
  const [file, setFile] = useState<File | null>(null);
  const [comment, setComment] = useState("");
  const [working, setWorking] = useState(false);
  if (!ready) return <main><Loading /></main>;
  if (!job) return <main><div className="card">Job not found.</div></main>;
  const latest = job.versions[job.versions.length - 1];

  const resubmit = async () => {
    if (!file) return;
  
    setWorking(true);
  
    try {
      const dataUrl = await fileToDataUrl(file);
  
      await resubmitJob(job.id, file.name, dataUrl, comment);
  
      setFile(null);
      setComment("");
    } catch (error) {
      console.error("Failed to resubmit job:", error);
      alert("Failed to resubmit job. Check the console for details.");
    } finally {
      setWorking(false);
    }
  };

  return <main className="stack">
    <div className="page-heading"><div><h1>{job.title}</h1><p>{job.id}</p></div><StatusBadge status={job.status} /></div>
    <div className="card"><JobDetails job={job} /></div>
    <div className="grid-2"><div className="card"><h2 className="section-title">Original User Comments</h2><p>{job.originalComments}</p></div><div className="card"><h2 className="section-title">Current / Latest PDF</h2><PdfViewer version={latest} /></div></div>
    <div className="card"><h2 className="section-title">Feedback / Comments</h2><CommentsList comments={job.comments} /></div>
    {job.status === "Work in Progress" && <div className="card stack"><h2 className="section-title">Revise and Resubmit</h2><div className="warning">This job will return to <strong>{job.checker}</strong>, the same assigned checker.</div><div className="field"><label>Upload Revised Drawing</label><input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></div><div className="field"><label>Additional Comments</label><textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Describe what changed in this revision." /></div><div><button className="btn btn-primary" disabled={!file || working} onClick={resubmit}>Resubmit for Check</button></div></div>}
    <div className="card"><h2 className="section-title">PDF / Document Version History</h2><VersionHistory versions={job.versions} /></div>
    <div className="card"><h2 className="section-title">Workflow History</h2><WorkflowHistory events={job.workflow} /></div>
  </main>;
}
```

## `app/jobs/page.tsx`

```tsx
"use client";
import { JobsTable } from "@/components/JobsTable";
import { Loading } from "@/components/Loading";
import { useJobs } from "@/lib/jobStore";

export default function JobsPage() {
  const { jobs, ready } = useJobs();
  return <main><div className="page-heading"><div><h1>Existing Jobs</h1><p>All jobs currently stored in the PDM database.</p></div></div>{ready ? <JobsTable jobs={jobs} /> : <Loading />}</main>;
}
```

## `app/layout.tsx`

```tsx
import "./globals.css";
import { Header } from "@/components/Header";
import { JobStoreProvider } from "@/lib/jobStore";

export const metadata = {
  title: "Engineering PDM",
  description: "Engineering PDM workflow system",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><JobStoreProvider><div className="shell"><Header />{children}</div></JobStoreProvider></body></html>;
}
```

## `app/new-job/page.tsx`

```tsx
"use client";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useJobs } from "@/lib/jobStore";
import { fileToDataUrl } from "@/lib/utils";
import { Person } from "@/lib/types";
import {
  getActiveStockOptions,
  StockOption
} from "@/lib/stockRepository";

const opposite = (person: Person): Person => person === "Jack" ? "Raag" : "Jack";

export default function NewJobPage() {
  const router = useRouter();
  const { createJob } = useJobs();
  const [title, setTitle] = useState("");
  const [pdf, setPdf] = useState<File | null>(null);
  const [comments, setComments] = useState("");
  const [stock, setStock] = useState("");
  const [stockOptions, setStockOptions] = useState<StockOption[]>([]);
  const [date, setDate] = useState("");
  const [checker, setChecker] = useState<Person>("Jack");
  const [approver, setApprover] = useState<Person>("Raag");
  const [working, setWorking] = useState(false);

  useEffect(() => {
    const loadStockOptions = async () => {
      try {
        const options = await getActiveStockOptions();
        setStockOptions(options);
      } catch (error) {
        console.error("Unable to load stock options:", error);
      }
    };
  
    loadStockOptions();
  }, []);

  const complete = useMemo(() => Boolean(title.trim() && pdf && comments.trim() && stock && date && checker && approver && checker !== approver), [title, pdf, comments, stock, date, checker, approver]);

  const changeChecker = (value: Person) => { setChecker(value); setApprover(opposite(value)); };
  const changeApprover = (value: Person) => { setApprover(value); setChecker(opposite(value)); };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!complete || !pdf) return;
    setWorking(true);
    const dataUrl = await fileToDataUrl(pdf);
    await createJob({
      title: title.trim(),
      stock,
      desiredCompletionDate: date,
      checker,
      approver,
      originalComments: comments.trim(),
      pdf: {
        filename: pdf.name,
        dataUrl
      }
    });
    router.push("/jobs");
};
  
  return <main>
    <div className="page-heading"><div><h1>New Job</h1><p>Create a new drawing submission for checking.</p></div></div>
    <form className="stack" onSubmit={submit}>
      <div className="card stack">
        <div className="field"><label>Job Title</label><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Injector Plate Rev B" /></div>
        <div className="grid-2">
          <div className="field"><label>PDF Upload</label><div className="upload-box"><input type="file" accept="application/pdf" onChange={(e) => setPdf(e.target.files?.[0] ?? null)} /></div><div className="help">
  PDF file storage will be connected to university cloud storage in a later phase.
</div></div>
          <div className="field"><label>Comment/Crucial Information</label><textarea value={comments} onChange={(e) => setComments(e.target.value)} placeholder="Include anything the checker and approver must know." /></div>
        </div>
        <div className="grid-3">
          <div className="field">
  <label>Stock Selection</label>

  <select
    value={stock}
    onChange={(e) => setStock(e.target.value)}
  >
    <option value="">Select stock…</option>

    {stockOptions.map((option) => (
      <option key={option.id} value={option.name}>
        {option.name}
      </option>
    ))}
  </select>
</div>
          <div className="field"><label>Desired Completion Date</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div />
          <div className="field"><label>Checker</label><select value={checker} onChange={(e) => changeChecker(e.target.value as Person)}><option>Jack</option><option>Raag</option></select></div>
          <div className="field"><label>Approver</label><select value={approver} onChange={(e) => changeApprover(e.target.value as Person)}><option>Jack</option><option>Raag</option></select></div>
        </div>
        <div className="notice">Checker and Approver are automatically kept different.</div>
        <div><button className="btn btn-primary btn-lg" type="submit" disabled={!complete || working}>{working ? "Creating Job…" : "Submit for Check"}</button></div>
      </div>
    </form>
  </main>;
}
```

## `app/page.tsx`

```tsx
import Link from "next/link";
export default function HomePage() {
  return <main><section className="hero"><h1>Engineering PDM Workflow</h1><p>Submit drawings, track reviews, manage revisions, and follow jobs through checking, approval, manufacturing, and completion.</p></section><section className="home-actions"><Link href="/new-job" className="action-card"><h2>New Job</h2><p>Create a drawing submission and send it to the assigned checker.</p></Link><Link href="/jobs" className="action-card"><h2>Existing Jobs</h2><p>View every job, its current status, comments, document history, and workflow history.</p></Link></section></main>;
}
```

## `components/AdminGuard.tsx`

```tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (window.sessionStorage.getItem("pdm-admin-auth") === "true") setOk(true);
    else router.replace("/admin/login");
  }, [router]);
  return ok ? <>{children}</> : <div className="card">Checking admin session…</div>;
}
```

## `components/AdminReviewActions.tsx`

```tsx
"use client";
import { useState } from "react";
import { Job, Person } from "@/lib/types";
import { fileToDataUrl } from "@/lib/utils";
import { useJobs } from "@/lib/jobStore";
import { useRouter } from "next/navigation";

export function AdminReviewActions({ job, actingAdmin }: { job: Job; actingAdmin: Person }) {
  const [comment, setComment] = useState("");
  const [markup, setMarkup] = useState<File | null>(null);
  const [working, setWorking] = useState(false);
  const { reviewJob } = useJobs();
  const router = useRouter();

  const perform = async (
    decision: "send-back" | "send-approval" | "approve"
  ) => {
    setWorking(true);
  
    try {
      const dataUrl = markup ? await fileToDataUrl(markup) : undefined;
  
      await reviewJob(
        job.id,
        actingAdmin,
        decision,
        comment,
        markup ? { filename: markup.name, dataUrl } : undefined
      );
  
      router.push(actingAdmin === "Jack" ? "/admin/jack" : "/admin/raag");
    } catch (error) {
      console.error("Failed to review job:", error);
      alert("Failed to update the job. Check the console for details.");
    } finally {
      setWorking(false);
    }
  };
  
  return (
    <div className="card stack">
      <h2 className="section-title">Admin Action</h2>
      <div className="field"><label>Comment</label><textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add checker/approver feedback. Comments are appended, never overwritten." /></div>
      <div className="field"><label>Marked-up PDF (optional)</label><input type="file" accept="application/pdf" onChange={(e) => setMarkup(e.target.files?.[0] ?? null)} /></div>
      {job.status === "Awaiting Check" && <div className="button-row"><button className="btn btn-danger" disabled={working} onClick={() => perform("send-back")}>Send Back to WIP</button><button className="btn btn-primary" disabled={working} onClick={() => perform("send-approval")}>Send to Approval</button></div>}
      {job.status === "Awaiting Approval" && <div className="button-row"><button className="btn btn-danger" disabled={working} onClick={() => perform("send-back")}>Send Back to WIP</button><button className="btn btn-success" disabled={working} onClick={() => perform("approve")}>Approve for Manufacturing</button></div>}
    </div>
  );
}
```

## `components/CommentsList.tsx`

```tsx
import { CommentEntry } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function CommentsList({ comments }: { comments: CommentEntry[] }) {
  if (!comments.length) return <div className="empty">No feedback has been added yet.</div>;
  return <div className="history-list">{comments.map((entry) => (
    <div className="comment" key={entry.id}>
      <div className="comment-head"><strong>{entry.author}</strong><span className="comment-role">{entry.role} · {formatDate(entry.createdAt)}</span></div>
      <p>{entry.comment}</p>
    </div>
  ))}</div>;
}
```

## `components/Header.tsx`

```tsx
import Link from "next/link";

export function Header() {
  return (
    <header className="topbar">
      <Link href="/" className="brand">Engineering PDM</Link>
      <nav className="nav">
        <Link href="/new-job">New Job</Link>
        <Link href="/jobs">Existing Jobs</Link>
        <Link href="/admin/login">Admin Login</Link>
      </nav>
    </header>
  );
}
```

## `components/JobDetails.tsx`

```tsx
import { Job } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function JobDetails({ job }: { job: Job }) {
  return (
    <div className="details">
      <div className="detail"><span>Stock</span><strong>{job.stock}</strong></div>
      <div className="detail"><span>Desired Completion</span><strong>{formatDate(job.desiredCompletionDate)}</strong></div>
      <div className="detail"><span>Checker</span><strong>{job.checker}</strong></div>
      <div className="detail"><span>Approver</span><strong>{job.approver}</strong></div>
      <div className="detail"><span>Created</span><strong>{formatDate(job.createdAt)}</strong></div>
      <div className="detail"><span>Job ID</span><strong>{job.id}</strong></div>
      {job.completedAt && <div className="detail"><span>Completed</span><strong>{formatDate(job.completedAt)}</strong></div>}
      {job.completedBy && <div className="detail"><span>Completed By</span><strong>{job.completedBy}</strong></div>}
    </div>
  );
}
```

## `components/JobsTable.tsx`

```tsx
import Link from "next/link";
import { Job } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";

export function JobsTable({ jobs, admin = false }: { jobs: Job[]; admin?: boolean }) {
  if (!jobs.length) return <div className="card empty">No jobs match this view.</div>;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Job Title</th><th>Status</th><th>Stock</th><th>Checker</th><th>Approver</th><th>Desired Date</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id}>
              <td><Link className="job-link" href={admin ? `/admin/jobs/${job.id}` : `/jobs/${job.id}`}>{job.title}</Link><div className="help">{job.id}</div></td>
              <td><StatusBadge status={job.status} /></td>
              <td>{job.stock}</td>
              <td>{job.checker}</td>
              <td>{job.approver}</td>
              <td>{formatDate(job.desiredCompletionDate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## `components/Loading.tsx`

```tsx
export function Loading() { return <div className="card">Loading mock PDM data…</div>; }
```

## `components/PdfViewer.tsx`

```tsx
import { DocumentVersion } from "@/lib/types";

export function PdfViewer({ version }: { version?: DocumentVersion }) {
  if (!version) return <div className="pdf-placeholder">No PDF version available.</div>;
  return (
    <div className="pdf-panel">
      {version.dataUrl ? <iframe title={version.filename} src={version.dataUrl} /> : (
        <div className="pdf-placeholder"><div><strong>{version.filename}</strong><br /><br />This file record currently contains metadata only. PDF storage will be connected to university cloud storage in a later phase.</div></div>
      )}
    </div>
  );
}
```

## `components/StatusBadge.tsx`

```tsx
import { JobStatus } from "@/lib/types";

const classes: Record<JobStatus, string> = {
  "Work in Progress": "badge-wip",
  "Awaiting Check": "badge-check",
  "Awaiting Approval": "badge-approval",
  "Awaiting Manufacturing": "badge-manufacturing",
  Complete: "badge-complete"
};

export function StatusBadge({ status }: { status: JobStatus }) {
  return <span className={`badge ${classes[status]}`}>{status}</span>;
}
```

## `components/VersionHistory.tsx`

```tsx
import { DocumentVersion } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function VersionHistory({ versions }: { versions: DocumentVersion[] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>Version</th><th>Type</th><th>Uploaded By</th><th>Date</th><th>Filename</th></tr></thead>
        <tbody>{versions.map((v) => (
          <tr key={v.id}><td>V{v.version}</td><td>{v.type}</td><td>{v.uploadedBy}</td><td>{formatDate(v.uploadedAt)}</td><td>{v.dataUrl ? <a className="job-link" href={v.dataUrl} target="_blank" rel="noreferrer">{v.filename}</a> : v.filename}</td></tr>
        ))}</tbody>
      </table>
    </div>
  );
}
```

## `components/WorkflowHistory.tsx`

```tsx
import { WorkflowEvent } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function WorkflowHistory({ events }: { events: WorkflowEvent[] }) {
  return <div className="history-list">{events.map((item) => (
    <div className="history-item" key={item.id}><strong>{item.event}</strong><div className="history-meta">{item.actor} · {formatDate(item.createdAt)}</div></div>
  ))}</div>;
}
```

## `lib/jobMapper.ts`

```ts
import type {
    CommentEntry,
    DocumentType,
    DocumentVersion,
    Job,
    JobStatus,
    Role,
    WorkflowEvent,
  } from "@/lib/types";
  
  function mapJobStatus(status: string): JobStatus {
    const statusMap: Record<string, JobStatus> = {
      work_in_progress: "Work in Progress",
      awaiting_check: "Awaiting Check",
      awaiting_approval: "Awaiting Approval",
      awaiting_manufacturing: "Awaiting Manufacturing",
      complete: "Complete",
    };
  
    return statusMap[status] ?? "Work in Progress";
  }
  
  function mapDocumentType(type: string): DocumentType {
    const typeMap: Record<string, DocumentType> = {
      original_submission: "Original Submission",
      checker_markup: "Checker Markup",
      user_revision: "User Revision",
      approver_markup: "Approver Markup",
      final_approved: "Final Approved Drawing",
    };
  
    return typeMap[type] ?? "Original Submission";
  }
  
  function mapRole(role: string): Role {
    const roleMap: Record<string, Role> = {
      user: "User",
      checker: "Checker",
      approver: "Approver",
      admin: "Admin",
      manufacturing: "Manufacturing",
    };
  
    return roleMap[role] ?? "User";
  }
  
  export function mapSupabaseJob(row: any): Job {
    const versions: DocumentVersion[] = (row.job_documents ?? []).map(
      (document: any) => ({
        id: document.id,
        version: document.version_number,
        type: mapDocumentType(document.document_type),
        uploadedBy: document.uploaded_by,
        uploadedAt: document.uploaded_at,
        filename: document.original_filename,
      })
    );
  
    const comments: CommentEntry[] = (row.job_comments ?? []).map(
      (comment: any) => ({
        id: comment.id,
        author: comment.author,
        role: mapRole(comment.author_role),
        createdAt: comment.created_at,
        comment: comment.comment,
      })
    );
  
    const workflow: WorkflowEvent[] = (row.job_history ?? []).map(
      (event: any) => ({
        id: event.id,
        event: event.action,
        actor: event.performed_by,
        createdAt: event.created_at,
      })
    );
  
    const originalComment =
      comments.find((comment) => comment.role === "User")?.comment ?? "";
  
    return {
      id: String(row.job_number),
      title: row.title,
      status: mapJobStatus(row.status),
      stock: row.stock_options?.name ?? "Unknown",
      desiredCompletionDate: row.desired_completion_date,
      checker: row.checker,
      approver: row.approver,
      originalComments: originalComment,
      createdAt: row.created_at,
      versions,
      comments,
      workflow,
      completedAt: row.completed_at ?? undefined,
      completedBy: row.completed_by ?? undefined,
    };
  }
```

## `lib/jobRepository.ts`

```ts
import { supabase } from "@/lib/supabase/client";

import { mapSupabaseJob } from "@/lib/jobMapper";

import type { Job, NewJobInput, Person } from "@/lib/types";

type AdminDecision = "send-back" | "send-approval" | "approve";

export async function getJobsFromSupabase(): Promise<Job[]> {
  const { data, error } = await supabase
    .from("jobs")
    .select(`
      *,
      stock_options (
        name
      ),
      job_documents (
        *
      ),
      job_comments (
        *
      ),
      job_history (
        *
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapSupabaseJob);
}

export async function createJobInSupabase(
  input: NewJobInput,
  stockId: string
): Promise<Job> {
  const { data: jobRow, error: jobError } = await supabase
    .from("jobs")
    .insert({
      title: input.title,
      stock_id: stockId,
      desired_completion_date: input.desiredCompletionDate,
      checker: input.checker,
      approver: input.approver,
      status: "awaiting_check",
    })
    .select(`
      *,
      stock_options (
        name
      )
    `)
    .single();

  if (jobError) {
    throw jobError;
  }

  const { error: documentError } = await supabase
    .from("job_documents")
    .insert({
      job_id: jobRow.id,
      version_number: 1,
      document_type: "original_submission",
      original_filename: input.pdf.filename,
      storage_provider: "pending",
      uploaded_by: "Engineering User",
    });

  if (documentError) {
    throw documentError;
  }

  const { error: commentError } = await supabase
    .from("job_comments")
    .insert({
      job_id: jobRow.id,
      author: "Engineering User",
      author_role: "user",
      comment: input.originalComments,
    });

  if (commentError) {
    throw commentError;
  }

  const { error: historyError } = await supabase
    .from("job_history")
    .insert([
      {
        job_id: jobRow.id,
        previous_status: null,
        new_status: "awaiting_check",
        action: "Job created",
        performed_by: "Engineering User",
        performed_by_role: "user",
      },
      {
        job_id: jobRow.id,
        previous_status: null,
        new_status: "awaiting_check",
        action: "Submitted for check",
        performed_by: "Engineering User",
        performed_by_role: "user",
      },
    ]);

  if (historyError) {
    throw historyError;
  }

  return getFullJob(jobRow.id);
}

export async function resubmitJobInSupabase(
  jobId: string,
  filename: string,
  comment: string
): Promise<Job> {
  const { data: existingJob, error: jobLookupError } = await supabase
    .from("jobs")
    .select("id, status")
    .eq("job_number", jobId)
    .single();

  if (jobLookupError) {
    throw jobLookupError;
  }

  if (existingJob.status !== "work_in_progress") {
    throw new Error("Job is not in Work in Progress.");
  }

  const { data: latestDocument, error: documentLookupError } = await supabase
    .from("job_documents")
    .select("version_number")
    .eq("job_id", existingJob.id)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (documentLookupError) {
    throw documentLookupError;
  }

  const nextVersion = (latestDocument?.version_number ?? 0) + 1;

  const { error: documentError } = await supabase
    .from("job_documents")
    .insert({
      job_id: existingJob.id,
      version_number: nextVersion,
      document_type: "user_revision",
      original_filename: filename,
      storage_provider: "pending",
      uploaded_by: "Engineering User",
    });

  if (documentError) {
    throw documentError;
  }

  if (comment.trim()) {
    const { error: commentError } = await supabase
      .from("job_comments")
      .insert({
        job_id: existingJob.id,
        author: "Engineering User",
        author_role: "user",
        comment: comment.trim(),
      });

    if (commentError) {
      throw commentError;
    }
  }

  const { error: updateError } = await supabase
    .from("jobs")
    .update({
      status: "awaiting_check",
      updated_at: new Date().toISOString(),
    })
    .eq("id", existingJob.id);

  if (updateError) {
    throw updateError;
  }

  const { error: historyError } = await supabase
    .from("job_history")
    .insert([
      {
        job_id: existingJob.id,
        previous_status: "work_in_progress",
        new_status: "work_in_progress",
        action: "Revised drawing uploaded",
        performed_by: "Engineering User",
        performed_by_role: "user",
      },
      {
        job_id: existingJob.id,
        previous_status: "work_in_progress",
        new_status: "awaiting_check",
        action: "Resubmitted for check",
        performed_by: "Engineering User",
        performed_by_role: "user",
      },
    ]);

  if (historyError) {
    throw historyError;
  }

  return getFullJob(existingJob.id);
}

export async function reviewJobInSupabase(
  jobId: string,
  admin: Person,
  decision: AdminDecision,
  comment: string,
  markup?: { filename: string }
): Promise<Job> {
  const { data: existingJob, error: jobLookupError } = await supabase
    .from("jobs")
    .select("id, status")
    .eq("job_number", jobId)
    .single();

  if (jobLookupError) {
    throw jobLookupError;
  }

  const isCheckerStage = existingJob.status === "awaiting_check";
  const isApprovalStage = existingJob.status === "awaiting_approval";

  if (!isCheckerStage && !isApprovalStage) {
    throw new Error("Job is not available for review.");
  }

  let newStatus: string;
  let action: string;
  let role: "checker" | "approver";

  if (decision === "send-back") {
    newStatus = "work_in_progress";
    action = isCheckerStage ? "Sent back to WIP" : "Approver rejected";
    role = isCheckerStage ? "checker" : "approver";
  } else if (decision === "send-approval" && isCheckerStage) {
    newStatus = "awaiting_approval";
    action = "Checker passed";
    role = "checker";
  } else if (decision === "approve" && isApprovalStage) {
    newStatus = "awaiting_manufacturing";
    action = "Approved for manufacturing";
    role = "approver";
  } else {
    throw new Error("Invalid review decision for current job status.");
  }

  if (comment.trim()) {
    const { error: commentError } = await supabase
      .from("job_comments")
      .insert({
        job_id: existingJob.id,
        author: admin,
        author_role: role,
        comment: comment.trim(),
      });

    if (commentError) {
      throw commentError;
    }
  }

  if (markup) {
    const { data: latestDocument, error: documentLookupError } = await supabase
      .from("job_documents")
      .select("version_number")
      .eq("job_id", existingJob.id)
      .order("version_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (documentLookupError) {
      throw documentLookupError;
    }

    const nextVersion = (latestDocument?.version_number ?? 0) + 1;

    const { error: markupError } = await supabase
      .from("job_documents")
      .insert({
        job_id: existingJob.id,
        version_number: nextVersion,
        document_type: isCheckerStage
          ? "checker_markup"
          : "approver_markup",
        original_filename: markup.filename,
        storage_provider: "pending",
        uploaded_by: admin,
      });

    if (markupError) {
      throw markupError;
    }
  }

  if (decision === "approve" && isApprovalStage) {
    const { data: latestDocument, error: documentLookupError } = await supabase
      .from("job_documents")
      .select("*")
      .eq("job_id", existingJob.id)
      .order("version_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (documentLookupError) {
      throw documentLookupError;
    }

    if (latestDocument) {
      const { error: finalDocumentError } = await supabase
        .from("job_documents")
        .insert({
          job_id: existingJob.id,
          version_number: latestDocument.version_number + 1,
          document_type: "final_approved",
          original_filename: latestDocument.original_filename,
          storage_provider: latestDocument.storage_provider,
          external_file_id: latestDocument.external_file_id,
          storage_path: latestDocument.storage_path,
          uploaded_by: admin,
          metadata: latestDocument.metadata,
        });

      if (finalDocumentError) {
        throw finalDocumentError;
      }
    }
  }

  const { error: updateError } = await supabase
    .from("jobs")
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", existingJob.id);

  if (updateError) {
    throw updateError;
  }

  const { error: historyError } = await supabase
    .from("job_history")
    .insert({
      job_id: existingJob.id,
      previous_status: existingJob.status,
      new_status: newStatus,
      action,
      performed_by: admin,
      performed_by_role: role,
    });

  if (historyError) {
    throw historyError;
  }

  return getFullJob(existingJob.id);
}

export async function markCompleteInSupabase(
    jobId: string,
    admin: Person
  ): Promise<Job> {
    const { data: existingJob, error: jobLookupError } = await supabase
      .from("jobs")
      .select("id, status")
      .eq("job_number", jobId)
      .single();
  
    if (jobLookupError) {
      throw jobLookupError;
    }
  
    if (existingJob.status !== "awaiting_manufacturing") {
      throw new Error("Job is not awaiting manufacturing.");
    }
  
    const completedAt = new Date().toISOString();
  
    const { error: updateError } = await supabase
      .from("jobs")
      .update({
        status: "complete",
        completed_at: completedAt,
        completed_by: admin,
        updated_at: completedAt,
      })
      .eq("id", existingJob.id);
  
    if (updateError) {
      throw updateError;
    }
  
    const { error: historyError } = await supabase
      .from("job_history")
      .insert({
        job_id: existingJob.id,
        previous_status: "awaiting_manufacturing",
        new_status: "complete",
        action: "Marked complete",
        performed_by: admin,
        performed_by_role: "manufacturing",
      });
  
    if (historyError) {
      throw historyError;
    }
  
    return getFullJob(existingJob.id);
  }

async function getFullJob(databaseId: string): Promise<Job> {
  const { data: fullJob, error: fullJobError } = await supabase
    .from("jobs")
    .select(`
      *,
      stock_options (
        name
      ),
      job_documents (
        *
      ),
      job_comments (
        *
      ),
      job_history (
        *
      )
    `)
    .eq("id", databaseId)
    .single();

  if (fullJobError) {
    throw fullJobError;
  }

  return mapSupabaseJob(fullJob);
}
```

## `lib/jobStore.tsx`

```tsx
"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { seedJobs } from "./mockData";

import { Job, NewJobInput, Person } from "./types";

import { uid } from "./utils";

import {
  createJobInSupabase,
  getJobsFromSupabase,
  resubmitJobInSupabase,
  reviewJobInSupabase,
  markCompleteInSupabase,
} from "./jobRepository";

import { getActiveStockOptions } from "./stockRepository";

type AdminDecision = "send-back" | "send-approval" | "approve";

interface JobStoreValue {
  jobs: Job[];
  ready: boolean;

  createJob: (input: NewJobInput) => Promise<Job>;

  resubmitJob: (
    id: string,
    filename: string,
    dataUrl: string | undefined,
    comment: string
  ) => Promise<Job>;

  reviewJob: (
    id: string,
    admin: Person,
    decision: AdminDecision,
    comment: string,
    markup?: { filename: string; dataUrl?: string }
  ) => Promise<Job>;

  markComplete: (id: string, admin: Person) => Promise<Job>;

 
}

const JobStoreContext = createContext<JobStoreValue | null>(null);

export function JobStoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function loadJobs() {
      try {
        const supabaseJobs = await getJobsFromSupabase();

        if (supabaseJobs.length > 0) {
          setJobs(supabaseJobs);
        } else {
          setJobs(seedJobs);
        }
      } catch (error) {
        console.error("Failed to load jobs from Supabase:", error);
        setJobs(seedJobs);
      } finally {
        setReady(true);
      }
    }

    loadJobs();
  }, []);

  const createJob = async (input: NewJobInput): Promise<Job> => {
    const stockOption = await getActiveStockOptions();

    const matchingStock = stockOption.find(
      (option) => option.name === input.stock
    );

    if (!matchingStock) {
      throw new Error("Selected stock option was not found.");
    }

    const job = await createJobInSupabase(input, matchingStock.id);

    setJobs((current) => [job, ...current]);

    return job;
  };

  const resubmitJob = async (
    id: string,
    filename: string,
    dataUrl: string | undefined,
    comment: string
  ): Promise<Job> => {
    const currentJob = jobs.find((job) => job.id === id);

    if (!currentJob || currentJob.status !== "Work in Progress") {
      throw new Error("Job is not available for resubmission.");
    }

    const updatedJob = await resubmitJobInSupabase(
      id,
      filename,
      comment.trim()
    );

    setJobs((current) =>
      current.map((job) => (job.id === id ? updatedJob : job))
    );

    return updatedJob;
  };

  const reviewJob = async (
    id: string,
    admin: Person,
    decision: AdminDecision,
    comment: string,
    markup?: { filename: string; dataUrl?: string }
  ): Promise<Job> => {
    const currentJob = jobs.find((job) => job.id === id);

    if (!currentJob) {
      throw new Error("Job was not found.");
    }

    if (
      currentJob.status !== "Awaiting Check" &&
      currentJob.status !== "Awaiting Approval"
    ) {
      throw new Error("Job is not available for review.");
    }

    const updatedJob = await reviewJobInSupabase(
      id,
      admin,
      decision,
      comment.trim(),
      markup
        ? {
            filename: markup.filename,
          }
        : undefined
    );

    setJobs((current) =>
      current.map((job) => (job.id === id ? updatedJob : job))
    );

    return updatedJob;
  };

  const markComplete = async (
    id: string,
    admin: Person
  ): Promise<Job> => {
    const currentJob = jobs.find((job) => job.id === id);
  
    if (!currentJob || currentJob.status !== "Awaiting Manufacturing") {
      throw new Error("Job is not available to be marked complete.");
    }
  
    const updatedJob = await markCompleteInSupabase(id, admin);
  
    setJobs((current) =>
      current.map((job) => (job.id === id ? updatedJob : job))
    );
  
    return updatedJob;
  };

  

  const value = useMemo(
    () => ({
      jobs,
      ready,
      createJob,
      resubmitJob,
      reviewJob,
      markComplete,
    }),
    [jobs, ready]
  );

  return (
    <JobStoreContext.Provider value={value}>
      {children}
    </JobStoreContext.Provider>
  );
}

export const useJobs = () => {
  const context = useContext(JobStoreContext);

  if (!context) {
    throw new Error("useJobs must be used inside JobStoreProvider");
  }

  return context;
};
```

## `lib/mockData.ts`

```ts
import { Job } from "./types";

const now = new Date();
const iso = (daysAgo = 0) => {
  const d = new Date(now);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
};

export const seedJobs: Job[] = [
  {
    id: "PDM-1001",
    title: "Injector Plate Rev A",
    status: "Awaiting Check",
    stock: "6061-T6 Aluminum",
    desiredCompletionDate: "2026-09-18",
    checker: "Raag",
    approver: "Jack",
    originalComments: "Critical sealing face. Verify all hole callouts before release.",
    createdAt: iso(3),
    versions: [
      {
        id: "v-1001-1",
        version: 1,
        type: "Original Submission",
        uploadedBy: "Engineering User",
        uploadedAt: iso(3),
        filename: "injector_plate_revA.pdf"
      }
    ],
    comments: [],
    workflow: [
      { id: "w-1001-1", event: "Job created", actor: "Engineering User", createdAt: iso(3) },
      { id: "w-1001-2", event: "Submitted for check", actor: "Engineering User", createdAt: iso(3) }
    ]
  },
  {
    id: "PDM-1002",
    title: "Valve Body Rev C",
    status: "Work in Progress",
    stock: "316 Stainless Steel",
    desiredCompletionDate: "2026-09-25",
    checker: "Jack",
    approver: "Raag",
    originalComments: "Updated port geometry after fit check.",
    createdAt: iso(7),
    versions: [
      {
        id: "v-1002-1",
        version: 1,
        type: "Original Submission",
        uploadedBy: "Engineering User",
        uploadedAt: iso(7),
        filename: "valve_body_revB.pdf"
      },
      {
        id: "v-1002-2",
        version: 2,
        type: "Checker Markup",
        uploadedBy: "Jack",
        uploadedAt: iso(5),
        filename: "valve_body_revB_checker_markup.pdf"
      }
    ],
    comments: [
      {
        id: "c-1002-1",
        author: "Jack",
        role: "Checker",
        createdAt: iso(5),
        comment: "Please add the missing surface finish on the sealing bore and confirm the thread depth."
      }
    ],
    workflow: [
      { id: "w-1002-1", event: "Job created", actor: "Engineering User", createdAt: iso(7) },
      { id: "w-1002-2", event: "Submitted for check", actor: "Engineering User", createdAt: iso(7) },
      { id: "w-1002-3", event: "Sent back to WIP", actor: "Jack", createdAt: iso(5) }
    ]
  },
  {
    id: "PDM-1003",
    title: "Sensor Bracket Rev B",
    status: "Awaiting Manufacturing",
    stock: "7075-T6 Aluminum",
    desiredCompletionDate: "2026-09-10",
    checker: "Jack",
    approver: "Raag",
    originalComments: "Maintain datum A flatness; bracket interfaces with optical sensor mount.",
    createdAt: iso(10),
    versions: [
      {
        id: "v-1003-1",
        version: 1,
        type: "Original Submission",
        uploadedBy: "Engineering User",
        uploadedAt: iso(10),
        filename: "sensor_bracket_revB.pdf"
      },
      {
        id: "v-1003-2",
        version: 2,
        type: "Final Approved Drawing",
        uploadedBy: "Raag",
        uploadedAt: iso(2),
        filename: "sensor_bracket_revB_approved.pdf"
      }
    ],
    comments: [
      {
        id: "c-1003-1",
        author: "Jack",
        role: "Checker",
        createdAt: iso(4),
        comment: "Dimensions and tolerances checked. Ready for approval."
      },
      {
        id: "c-1003-2",
        author: "Raag",
        role: "Approver",
        createdAt: iso(2),
        comment: "Approved for manufacturing."
      }
    ],
    workflow: [
      { id: "w-1003-1", event: "Job created", actor: "Engineering User", createdAt: iso(10) },
      { id: "w-1003-2", event: "Submitted for check", actor: "Engineering User", createdAt: iso(10) },
      { id: "w-1003-3", event: "Checker passed", actor: "Jack", createdAt: iso(4) },
      { id: "w-1003-4", event: "Approved for manufacturing", actor: "Raag", createdAt: iso(2) }
    ]
  }
];
```

## `lib/stockRepository.ts`

```ts
import { supabase } from "@/lib/supabase/client";

export interface StockOption {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

export async function getActiveStockOptions(): Promise<StockOption[]> {
  const { data, error } = await supabase
    .from("stock_options")
    .select("id, name, description, is_active")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    console.error("Failed to load stock options:", error);
    throw new Error("Failed to load stock options");
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    isActive: row.is_active,
  }));
}
```

## `lib/supabase/client.ts`

```ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
);
```

## `lib/types.ts`

```ts
export type Person = "Jack" | "Raag";

export type JobStatus =
  | "Work in Progress"
  | "Awaiting Check"
  | "Awaiting Approval"
  | "Awaiting Manufacturing"
  | "Complete";

export type DocumentType =
  | "Original Submission"
  | "Checker Markup"
  | "User Revision"
  | "Approver Markup"
  | "Final Approved Drawing";

export type Role = "User" | "Checker" | "Approver" | "Admin" | "Manufacturing";

export interface DocumentVersion {
  id: string;
  version: number;
  type: DocumentType;
  uploadedBy: string;
  uploadedAt: string;
  filename: string;
  dataUrl?: string;
}

export interface CommentEntry {
  id: string;
  author: string;
  role: Role;
  createdAt: string;
  comment: string;
}

export interface WorkflowEvent {
  id: string;
  event: string;
  actor: string;
  createdAt: string;
}

export interface Job {
  id: string;
  title: string;
  status: JobStatus;
  stock: string;
  desiredCompletionDate: string;
  checker: Person;
  approver: Person;
  originalComments: string;
  createdAt: string;
  versions: DocumentVersion[];
  comments: CommentEntry[];
  workflow: WorkflowEvent[];
  completedAt?: string;
  completedBy?: Person;
}

export interface NewJobInput {
  title: string;
  stock: string;
  desiredCompletionDate: string;
  checker: Person;
  approver: Person;
  originalComments: string;
  pdf: {
    filename: string;
    dataUrl?: string;
  };
}
```

## `lib/utils.ts`

```ts
export const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const formatDate = (date?: string) => {
  if (!date) return "—";
  const parsed = date.includes("T") ? new Date(date) : new Date(`${date}T12:00:00`);
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: date.includes("T") ? "numeric" : undefined,
    minute: date.includes("T") ? "2-digit" : undefined
  }).format(parsed);
};

export const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
```

## `global.d.ts`

```ts
declare module "*.css";
```

## `next-env.d.ts`

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.
```

## `next.config.mjs`

```js
/** @type {import('next').NextConfig} */
const nextConfig = {};
export default nextConfig;
```

## `package.json`

```json
{
  "name": "pdm-phase1",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.112.4",
    "next": "14.2.5",
    "react": "18.3.1",
    "react-dom": "18.3.1"
  },
  "devDependencies": {
    "@types/node": "20.14.12",
    "@types/react": "18.3.3",
    "@types/react-dom": "18.3.0",
    "eslint": "8.57.0",
    "eslint-config-next": "14.2.5",
    "typescript": "5.5.4"
  }
}
```

## `tsconfig.json`

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

