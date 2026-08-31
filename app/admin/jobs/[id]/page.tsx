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
