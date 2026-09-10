"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { JobsTable } from "@/components/JobsTable";
import { Loading } from "@/components/Loading";
import { useJobs } from "@/lib/jobStore";
import { supabase } from "@/lib/supabase/client";

export default function JobsPage() {
  const {
    jobs,
    folders,
    ready,
    createFolder,
    moveJob,
    deleteFolder,
  } = useJobs();

  const [newFolderName, setNewFolderName] = useState("");
  const [working, setWorking] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setIsAdmin(Boolean(session));
    };

    checkAdmin();
  }, []);

  const unfiledJobs = useMemo(
    () => jobs.filter((job) => !job.folderId),
    [jobs]
  );

  const getFolderJobCount = (folderId: string) =>
    jobs.filter((job) => job.folderId === folderId).length;

  const handleCreateFolder = async () => {
    const name = newFolderName.trim();

    if (!name) return;

    setWorking(true);

    try {
      await createFolder(name);
      setNewFolderName("");
    } catch (error) {
      console.error("Failed to create folder:", error);
      alert("Failed to create folder.");
    } finally {
      setWorking(false);
    }
  };

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

  const handleDeleteFolder = async (
    folderId: string,
    folderName: string
  ) => {
    const confirmed = window.confirm(
      `Delete "${folderName}"? Jobs inside it will return to Existing Jobs.`
    );

    if (!confirmed) return;

    try {
      await deleteFolder(folderId);
    } catch (error) {
      console.error("Failed to delete folder:", error);
      alert("Failed to delete folder.");
    }
  };

  if (!ready) {
    return (
      <main>
        <Loading />
      </main>
    );
  }

  return (
    <main className="stack">
      <div className="page-heading">
        <div>
          <h1>Existing Jobs</h1>
          <p>
            Browse project folders or view jobs that have not
            been placed into a folder.
          </p>
        </div>
      </div>

      <div className="card stack">
        <h2 className="section-title">Project Folders</h2>

        <div className="button-row">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) =>
              setNewFolderName(e.target.value)
            }
            placeholder="New folder name"
          />

          <button
            className="btn btn-primary"
            disabled={!newFolderName.trim() || working}
            onClick={handleCreateFolder}
          >
            {working ? "Creating..." : "Create Folder"}
          </button>
        </div>

        {folders.length === 0 ? (
          <p>No project folders yet.</p>
        ) : (
          <div className="stack">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="folder-row"
              >
                <Link
                  href={`/jobs/folders/${folder.id}`}
                  className="folder-link"
                >
                  <span className="folder-icon">📁</span>

                  <div>
                    <strong>{folder.name}</strong>

                    <div className="help">
                      {getFolderJobCount(folder.id)} job
                      {getFolderJobCount(folder.id) === 1
                        ? ""
                        : "s"}
                    </div>
                  </div>
                </Link>

                {isAdmin && (
                  <button
                    className="btn btn-danger"
                    onClick={() =>
                      handleDeleteFolder(
                        folder.id,
                        folder.name
                      )
                    }
                  >
                    Delete Folder
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card stack">
        <h2 className="section-title">Unfiled Jobs</h2>

        {unfiledJobs.length === 0 ? (
          <p>All jobs are currently stored in project folders.</p>
        ) : (
          <>
            <JobsTable jobs={unfiledJobs} />

            <div className="stack">
              {unfiledJobs.map((job) => (
                <div
                  key={job.id}
                  className="button-row"
                >
                  <strong>{job.title}</strong>

                  <select
                    value=""
                    onChange={(e) =>
                      handleMoveJob(
                        job.id,
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Move to folder...
                    </option>

                    {folders.map((folder) => (
                      <option
                        key={folder.id}
                        value={folder.id}
                      >
                        {folder.name}
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