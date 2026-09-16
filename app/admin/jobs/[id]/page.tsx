"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  AdminGuard,
  useAdminAccess,
} from "@/components/AdminGuard";

import { useJobs } from "@/lib/jobStore";
import { getActiveCheckers } from "@/lib/checkerRepository";

import { StatusBadge } from "@/components/StatusBadge";
import { JobDetails } from "@/components/JobDetails";
import { PdfViewer } from "@/components/PdfViewer";
import { CommentsList } from "@/components/CommentsList";
import { VersionHistory } from "@/components/VersionHistory";
import { WorkflowHistory } from "@/components/WorkflowHistory";
import { AdminReviewActions } from "@/components/AdminReviewActions";

import type { Person } from "@/lib/types";

const FULL_ADMINS: Person[] = ["Jack", "Raag"];

export default function AdminJobPage() {
  return (
    <main className="stack">
      <AdminGuard>
        <AdminJobContent />
      </AdminGuard>
    </main>
  );
}

function AdminJobContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const { jobs, ready, markComplete } = useJobs();
  const access = useAdminAccess();

  const isFullAdmin = access?.access === "full";
  const isCheckerAccount = access?.access === "checker";

  const [actingAdmin, setActingAdmin] = useState("");
  const [checkerNames, setCheckerNames] = useState<string[]>([]);
  const [loadingCheckers, setLoadingCheckers] = useState(true);
  const [checkerError, setCheckerError] = useState("");
  const [working, setWorking] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCheckers() {
      if (!isCheckerAccount) {
        setCheckerNames([]);
        setLoadingCheckers(false);
        return;
      }

      setLoadingCheckers(true);
      setCheckerError("");

      try {
        const checkers = await getActiveCheckers();

        if (cancelled) return;

        const names = checkers
          .map((checker) => checker.name)
          .filter(
            (name) =>
              name !== "Jack" &&
              name !== "Raag"
          );

        setCheckerNames(names);
      } catch (error) {
        console.error("Failed to load checkers:", error);

        if (!cancelled) {
          setCheckerError(
            "Unable to load checker names."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingCheckers(false);
        }
      }
    }

    loadCheckers();

    return () => {
      cancelled = true;
    };
  }, [isCheckerAccount]);

  const job = jobs.find((j) => j.id === params.id);

  const availableNames = isFullAdmin
    ? FULL_ADMINS
    : isCheckerAccount
    ? checkerNames
    : [];

  const selectedName = availableNames.includes(actingAdmin as Person)
    ? actingAdmin
    : "";

  if (!ready) {
    return (
      <div className="card">
        Loading job...
      </div>
    );
  }

  if (!job) {
    return (
      <div className="card">
        Job not found.
      </div>
    );
  }

  const latest = job.versions[job.versions.length - 1];

  const isCheckerStage = job.status === "Awaiting Check";
  const isApprovalStage = job.status === "Awaiting Approval";
  const isManufacturingStage =
    job.status === "Awaiting Manufacturing";

  const requiredAdmin = isCheckerStage
    ? job.checker
    : isApprovalStage
    ? job.approver
    : null;

  const canCheck =
    isCheckerStage &&
    selectedName === job.checker &&
    (isFullAdmin || isCheckerAccount);

  const canApprove =
    isFullAdmin &&
    isApprovalStage &&
    selectedName === job.approver;

  const canComplete =
    isFullAdmin &&
    isManufacturingStage &&
    (selectedName === "Jack" ||
      selectedName === "Raag");

  const complete = async () => {
    if (!canComplete || working) return;

    setWorking(true);

    try {
      await markComplete(
        job.id,
        selectedName as Person
      );

      router.push("/admin/completed");
    } catch (error) {
      console.error(
        "Failed to complete job:",
        error
      );

      alert(
        "Failed to complete the job. Check the console for details."
      );
    } finally {
      setWorking(false);
    }
  };

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>{job.title}</h1>
          <p>{job.id}</p>
        </div>

        <StatusBadge status={job.status} />
      </div>

      <div className="card stack">
        <div
          className="field"
          style={{ maxWidth: 280 }}
        >
          <label>
            {isCheckerAccount
              ? "Acting Checker"
              : "Acting Admin"}
          </label>

          <select
            value={selectedName}
            onChange={(e) =>
              setActingAdmin(e.target.value)
            }
            disabled={
              loadingCheckers &&
              isCheckerAccount
            }
          >
            <option value="">
              Select a name
            </option>

            {availableNames.map((name) => (
              <option
                key={name}
                value={name}
              >
                {name}
              </option>
            ))}
          </select>
        </div>

        {checkerError && (
          <div className="warning">
            {checkerError}
          </div>
        )}

        {requiredAdmin &&
          selectedName &&
          selectedName !== requiredAdmin && (
            <div className="warning">
              This stage is assigned to{" "}
              <strong>
                {requiredAdmin}
              </strong>
              . Only the assigned reviewer
              can perform this workflow action.
            </div>
          )}

        {requiredAdmin &&
          !selectedName && (
            <div className="notice">
              Select your name to view
              available workflow actions.
            </div>
          )}
      </div>

      <div className="card">
        <JobDetails job={job} />
      </div>

      <div className="grid-2">
        <div className="card">
          <h2 className="section-title">
            Submission Information
          </h2>

          <p>
            <strong>
              Original comments
            </strong>
          </p>

          <p>{job.originalComments}</p>
        </div>

        <div className="card">
          <h2 className="section-title">
            Current Drawing
          </h2>

          {latest && (
            <PdfViewer version={latest} />
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="section-title">
          All Comments
        </h2>

        <CommentsList
          comments={job.comments}
        />
      </div>

      {(canCheck || canApprove) && (
        <AdminReviewActions
          job={job}
          actingAdmin={selectedName}
        />
      )}

      {canComplete && (
        <div className="card stack">
          <h2 className="section-title">
            Manufacturing Action
          </h2>

          <p>
            Either Jack or Raag may mark
            this job as complete.
          </p>

          <div>
            <button
              className="btn btn-success"
              disabled={working}
              onClick={complete}
            >
              {working
                ? "Completing..."
                : "Mark as Complete"}
            </button>
          </div>
        </div>
      )}

      {job.status === "Complete" && (
        <div className="notice">
          <strong>
            Completed job:
          </strong>{" "}
          Normal workflow action buttons
          are disabled. This record remains
          available for history and
          document viewing.
        </div>
      )}

      {job.status === "Work in Progress" && (
        <div className="notice">
          This job is currently with the
          engineering user for revision.
          No admin action is required
          until it is resubmitted.
        </div>
      )}

      <div className="card">
        <h2 className="section-title">
          Document Version History
        </h2>

        <VersionHistory
          versions={job.versions}
        />
      </div>

      <div className="card">
        <h2 className="section-title">
          Workflow History
        </h2>

        <WorkflowHistory
          events={job.workflow}
        />
      </div>
    </>
  );
}