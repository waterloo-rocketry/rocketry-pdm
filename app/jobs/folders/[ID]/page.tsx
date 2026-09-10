"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { JobsTable } from "@/components/JobsTable";
import { Loading } from "@/components/Loading";
import { useJobs } from "@/lib/jobStore";

export default function FolderPage() {
  const params = useParams<{ id: string }>();

  const {
    jobs,
    folders,
    ready,
    moveJob,
  } = useJobs();

  const folder = folders.find(
    (folder) => folder.id === params.id
  );

  const folderJobs = useMemo(
    () =>
      jobs.filter(
        (job) => job.folderId === params.id
      ),
    [jobs, params.id]
  );

  const handleMoveJob = async (
    jobId: string,
    folderId: string
  ) => {
    try {
      await moveJob(
        jobId,
        folderId === "" ? null : folderId
      );
    } catch (error) {
      console.error("Failed to move job:", error);
      alert("Failed to move job.");
    }
  };

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
          <>
            <JobsTable jobs={folderJobs} />

            <div className="stack">
              {folderJobs.map((job) => (
                <div
                  key={job.id}
                  className="button-row"
                >
                  <strong>{job.title}</strong>

                  <select
                    value={job.folderId ?? ""}
                    onChange={(e) =>
                      handleMoveJob(
                        job.id,
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      No Folder
                    </option>

                    {folders.map((folderOption) => (
                      <option
                        key={folderOption.id}
                        value={folderOption.id}
                      >
                        {folderOption.name}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}