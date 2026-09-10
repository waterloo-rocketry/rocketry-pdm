"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { JobsTable } from "@/components/JobsTable";
import { Loading } from "@/components/Loading";
import { useJobs } from "@/lib/jobStore";

export default function FolderPage() {
  const params = useParams();

  const folderId = String(
    params.id ?? params.ID ?? ""
  );

  const {
    jobs,
    folders,
    ready,
  } = useJobs();

  const folder = folders.find(
    (folder) => folder.id === folderId
  );

  const folderJobs = useMemo(
    () =>
      jobs.filter(
        (job) => job.folderId === folderId
      ),
    [jobs, folderId]
  );

  if (!ready) {
    return (
      <main>
        <Loading />
      </main>
    );
  }

  if (!folder) {
    return (
      <main className="stack">
        <Link href="/jobs" className="job-link">
          ← Back to Existing Jobs
        </Link>

        <div className="card">
          Folder not found.
        </div>
      </main>
    );
  }

  return (
    <main className="stack">
      <div>
        <Link href="/jobs" className="job-link">
          ← Existing Jobs
        </Link>
      </div>

      <div className="page-heading">
        <div>
          <h1>📁 {folder.name}</h1>

          <p>
            {folderJobs.length} job
            {folderJobs.length === 1 ? "" : "s"} in this folder.
          </p>
        </div>
      </div>

      <div className="card stack">
        {folderJobs.length === 0 ? (
          <p>This folder is empty.</p>
        ) : (
          <JobsTable jobs={folderJobs} />
        )}
      </div>
    </main>
  );
}