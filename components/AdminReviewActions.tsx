"use client";

import { useState } from "react";
import type { Job, Person } from "@/lib/types";
import { useJobs } from "@/lib/jobStore";
import { useRouter } from "next/navigation";

export function AdminReviewActions({
  job,
  actingAdmin,
}: {
  job: Job;
  actingAdmin: Person;
}) {
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
      await reviewJob(
        job.id,
        actingAdmin,
        decision,
        comment,
        markup
          ? {
              filename: markup.name,
              file: markup,
            }
          : undefined
      );

      router.push(
        actingAdmin === "Jack"
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

  return (
    <div className="card stack">
      <h2 className="section-title">Admin Action</h2>

      <div className="field">
        <label>Comment</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add checker/approver feedback. Comments are appended, never overwritten."
        />
      </div>

      <div className="field">
        <label>Marked-up PDF (optional)</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) =>
            setMarkup(e.target.files?.[0] ?? null)
          }
        />
      </div>

      {job.status === "Awaiting Check" && (
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

      {job.status === "Awaiting Approval" && (
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
            disabled={working}
            onClick={() => perform("approve")}
          >
            Approve for Manufacturing
          </button>
        </div>
      )}
    </div>
  );
}