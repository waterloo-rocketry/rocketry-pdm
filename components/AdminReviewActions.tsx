"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { Job, Person } from "@/lib/types";
import { useJobs } from "@/lib/jobStore";

export function AdminReviewActions({
  job,
  actingAdmin,
}: {
  job: Job;
  actingAdmin: Person;
}) {
  const [comment, setComment] = useState("");
  const [machinist, setMachinist] = useState("");
  const [markups, setMarkups] = useState<File[]>([]);
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
        markups.length > 0
          ? markups.map((markup) => ({
              filename: markup.name,
              file: markup,
            }))
          : undefined,
        decision === "approve" ? machinist : undefined
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