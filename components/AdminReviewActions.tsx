"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { Job } from "@/lib/types";
import { useJobs } from "@/lib/jobStore";
import { useAdminAccess } from "@/components/AdminGuard";

type ReviewDecision = "send-back" | "send-approval" | "approve";

export function AdminReviewActions({
  job,
  actingAdmin,
}: {
  job: Job;
  actingAdmin: string;
}) {
  const [comment, setComment] = useState("");
  const [machinist, setMachinist] = useState("");
  const [markups, setMarkups] = useState<File[]>([]);
  const [working, setWorking] = useState(false);

  const { reviewJob } = useJobs();
  const router = useRouter();
  const access = useAdminAccess();

  const isFullAdmin = access?.access === "full";
  const isCheckerAccount = access?.access === "checker";

  const isCheckerStage = job.status === "Awaiting Check";
  const isApprovalStage = job.status === "Awaiting Approval";

  const canCheck =
    isCheckerStage &&
    job.checker === actingAdmin &&
    (isFullAdmin || isCheckerAccount);

  const canApprove =
    isFullAdmin &&
    isApprovalStage &&
    job.approver === actingAdmin;

  const canReview = canCheck || canApprove;

  const perform = async (decision: ReviewDecision) => {
    if (working || !canReview) {
      return;
    }

    if (decision === "approve" && !canApprove) {
      return;
    }

    if (decision === "send-approval" && !canCheck) {
      return;
    }

    if (decision === "approve" && !machinist.trim()) {
      return;
    }

    setWorking(true);

    try {
      await reviewJob(
        job.id,
        actingAdmin,
        decision,
        comment,
        markups.length > 0
          ? markups.map((markup) => ({
              filename: markup.name,
              file: markup,
            }))
          : undefined,
        decision === "approve" ? machinist : undefined
      );

      router.push(
        isCheckerAccount
          ? "/admin/checkers"
          : actingAdmin === "Jack"
          ? "/admin/jack"
          : "/admin/raag"
      );
    } catch (error) {
      console.error("Failed to review job:", error);

      alert(
        "Failed to update the job. Check the console for details."
      );
    } finally {
      setWorking(false);
    }
  };

  if (!canReview) {
    return null;
  }

  return (
    <div className="card stack">
      <h2 className="section-title">
        {canCheck ? "Checker Action" : "Approver Action"}
      </h2>

      <div className="field">
        <label>Comment</label>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add review feedback. Comments are appended, never overwritten."
        />
      </div>

      <div className="field">
        <label>Marked-up PDFs (optional)</label>

        <input
          type="file"
          accept="application/pdf"
          multiple
          onChange={(e) =>
            setMarkups(Array.from(e.target.files ?? []))
          }
        />

        {markups.length > 0 && (
          <div className="help">
            {markups.length} PDF
            {markups.length === 1 ? "" : "s"} selected:

            <ul>
              {markups.map((markup) => (
                <li
                  key={`${markup.name}-${markup.lastModified}`}
                >
                  {markup.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {canCheck && (
        <div className="button-row">
          <button
            className="btn btn-danger"
            disabled={working}
            onClick={() => perform("send-back")}
          >
            Send Back to WIP
          </button>

          <button
            className="btn btn-primary"
            disabled={working}
            onClick={() => perform("send-approval")}
          >
            Send to Approval
          </button>
        </div>
      )}

      {canApprove && (
        <>
          <div className="field">
            <label>Machinist</label>

            <input
              type="text"
              value={machinist}
              onChange={(e) => setMachinist(e.target.value)}
              placeholder="Enter machinist name"
            />
          </div>

          <div className="button-row">
            <button
              className="btn btn-danger"
              disabled={working}
              onClick={() => perform("send-back")}
            >
              Send Back to WIP
            </button>

            <button
              className="btn btn-success"
              disabled={working || !machinist.trim()}
              onClick={() => perform("approve")}
            >
              Approve for Manufacturing
            </button>
          </div>
        </>
      )}
    </div>
  );
}