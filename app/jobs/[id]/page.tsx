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

  const [files, setFiles] = useState<File[]>([]);
  const [comment, setComment] = useState("");
  const [working, setWorking] = useState(false);

  if (!ready) {
    return (
      <main>
        <Loading />
      </main>
    );
  }

  if (!job) {
    return (
      <main>
        <div className="card">Job not found.</div>
      </main>
    );
  }

  const latestVersionNumber = Math.max(
    ...job.versions.map((version) => version.version)
  );
  
  const currentPdfs = job.versions.filter(
    (version) => version.version === latestVersionNumber
  );

  

  const resubmit = async () => {
    if (files.length === 0) return;

    setWorking(true);

    try {
      await resubmitJob(
        job.id,
        files.map((file) => ({
          filename: file.name,
          file,
        })),
        comment
      );

      setFiles([]);
      setComment("");
    } catch (error) {
      console.error("Failed to resubmit job:", error);
      alert("Failed to resubmit job. Check the console for details.");
    } finally {
      setWorking(false);
    }
  };

  return (
    <main className="stack">
      <div className="page-heading">
        <div>
          <h1>{job.title}</h1>
          <p>{job.id}</p>
        </div>

        <StatusBadge status={job.status} />
      </div>

      <div className="card">
        <JobDetails job={job} />
      </div>

      <div className="card">
        <h2 className="section-title">Original User Comments</h2>
        <p>{job.originalComments}</p>
      </div>

      <div className="card stack">
  <h2 className="section-title">Current Drawings</h2>

  {currentPdfs.length === 0 ? (
    <p>No drawings found.</p>
  ) : (
    currentPdfs.map((version) => (
      <div key={version.id} className="stack">
        <strong>{version.filename}</strong>

        <PdfViewer version={version} />
      </div>
    ))
  )}
</div>

      <div className="card">
        <h2 className="section-title">Feedback / Comments</h2>

        <CommentsList comments={job.comments} />
      </div>

      {job.status === "Work in Progress" && (
        <div className="card stack">
          <h2 className="section-title">Revise and Resubmit</h2>

          <div className="warning">
            This job will return to <strong>{job.checker}</strong>, the same
            assigned checker.
          </div>

          <div className="field">
            <label>Upload Revised Drawing</label>

<input
  type="file"
  accept="application/pdf"
  multiple
  onChange={(e) =>
    setFiles(Array.from(e.target.files ?? []))
  }
/>
          </div>

          <div className="field">
            <label>Additional Comments</label>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describe what changed in this revision."
            />
          </div>

          <div>
            <button
              className="btn btn-primary"
              disabled={files.length === 0 || working}
              onClick={resubmit}
            >
              {working ? "Resubmitting…" : "Resubmit for Check"}
            </button>
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="section-title">
          PDF / Document Version History
        </h2>

        <VersionHistory versions={job.versions} />
      </div>

      <div className="card">
        <h2 className="section-title">Workflow History</h2>

        <WorkflowHistory events={job.workflow} />
      </div>
    </main>
  );
}