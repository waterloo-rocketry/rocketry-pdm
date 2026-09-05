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
  
      await resubmitJob(job.id, file, file.name, comment);
  
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
