"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { seedJobs } from "./mockData";
import { Job, NewJobInput, Person } from "./types";
import { uid } from "./utils";

const STORAGE_KEY = "pdm-phase1-jobs";

type AdminDecision = "send-back" | "send-approval" | "approve";

interface JobStoreValue {
  jobs: Job[];
  ready: boolean;
  createJob: (input: NewJobInput) => Job;
  resubmitJob: (id: string, filename: string, dataUrl: string | undefined, comment: string) => void;
  reviewJob: (
    id: string,
    admin: Person,
    decision: AdminDecision,
    comment: string,
    markup?: { filename: string; dataUrl?: string }
  ) => void;
  markComplete: (id: string, admin: Person) => void;
  resetDemo: () => void;
}

const JobStoreContext = createContext<JobStoreValue | null>(null);

export function JobStoreProvider({ children }: { children: React.ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setJobs(JSON.parse(stored));
      } catch {
        setJobs(seedJobs);
      }
    } else {
      setJobs(seedJobs);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  }, [jobs, ready]);

  const createJob = (input: NewJobInput) => {
    const stamp = new Date().toISOString();
    const nextNumber = 1000 + jobs.length + Math.floor(Math.random() * 8000);
    const job: Job = {
      id: `PDM-${nextNumber}`,
      title: input.title,
      status: "Awaiting Check",
      stock: input.stock,
      desiredCompletionDate: input.desiredCompletionDate,
      checker: input.checker,
      approver: input.approver,
      originalComments: input.originalComments,
      createdAt: stamp,
      versions: [
        {
          id: uid(),
          version: 1,
          type: "Original Submission",
          uploadedBy: "Engineering User",
          uploadedAt: stamp,
          filename: input.pdf.filename,
          dataUrl: input.pdf.dataUrl
        }
      ],
      comments: [],
      workflow: [
        { id: uid(), event: "Job created", actor: "Engineering User", createdAt: stamp },
        { id: uid(), event: "Submitted for check", actor: "Engineering User", createdAt: stamp }
      ]
    };
    setJobs((current) => [job, ...current]);
    return job;
  };

  const resubmitJob = (id: string, filename: string, dataUrl: string | undefined, comment: string) => {
    setJobs((current) =>
      current.map((job) => {
        if (job.id !== id || job.status !== "Work in Progress") return job;
        const stamp = new Date().toISOString();
        const comments = comment.trim()
          ? [...job.comments, { id: uid(), author: "Engineering User", role: "User" as const, createdAt: stamp, comment: comment.trim() }]
          : job.comments;
        return {
          ...job,
          status: "Awaiting Check",
          versions: [
            ...job.versions,
            {
              id: uid(),
              version: job.versions.length + 1,
              type: "User Revision",
              uploadedBy: "Engineering User",
              uploadedAt: stamp,
              filename,
              dataUrl
            }
          ],
          comments,
          workflow: [
            ...job.workflow,
            { id: uid(), event: "Revised drawing uploaded", actor: "Engineering User", createdAt: stamp },
            { id: uid(), event: "Resubmitted for check", actor: "Engineering User", createdAt: stamp }
          ]
        };
      })
    );
  };

  const reviewJob: JobStoreValue["reviewJob"] = (id, admin, decision, comment, markup) => {
    setJobs((current) =>
      current.map((job) => {
        if (job.id !== id) return job;
        const stamp = new Date().toISOString();
        const isCheckerStage = job.status === "Awaiting Check";
        const isApprovalStage = job.status === "Awaiting Approval";
        if (!isCheckerStage && !isApprovalStage) return job;

        let status = job.status;
        let event = "";
        if (decision === "send-back") {
          status = "Work in Progress";
          event = isCheckerStage ? "Sent back to WIP" : "Approver rejected";
        } else if (decision === "send-approval" && isCheckerStage) {
          status = "Awaiting Approval";
          event = "Checker passed";
        } else if (decision === "approve" && isApprovalStage) {
          status = "Awaiting Manufacturing";
          event = "Approved for manufacturing";
        } else {
          return job;
        }

        const role = isCheckerStage ? "Checker" : "Approver";
        const comments = comment.trim()
          ? [...job.comments, { id: uid(), author: admin, role, createdAt: stamp, comment: comment.trim() }]
          : job.comments;

        const versions = markup
          ? [
              ...job.versions,
              {
                id: uid(),
                version: job.versions.length + 1,
                type: isCheckerStage ? ("Checker Markup" as const) : ("Approver Markup" as const),
                uploadedBy: admin,
                uploadedAt: stamp,
                filename: markup.filename,
                dataUrl: markup.dataUrl
              }
            ]
          : decision === "approve"
          ? [
              ...job.versions,
              {
                ...job.versions[job.versions.length - 1],
                id: uid(),
                version: job.versions.length + 1,
                type: "Final Approved Drawing" as const,
                uploadedBy: admin,
                uploadedAt: stamp
              }
            ]
          : job.versions;

        return {
          ...job,
          status,
          comments,
          versions,
          workflow: [...job.workflow, { id: uid(), event, actor: admin, createdAt: stamp }]
        };
      })
    );
  };

  const markComplete = (id: string, admin: Person) => {
    setJobs((current) =>
      current.map((job) => {
        if (job.id !== id || job.status !== "Awaiting Manufacturing") return job;
        const stamp = new Date().toISOString();
        return {
          ...job,
          status: "Complete",
          completedAt: stamp,
          completedBy: admin,
          workflow: [...job.workflow, { id: uid(), event: "Marked complete", actor: admin, createdAt: stamp }]
        };
      })
    );
  };

  const resetDemo = () => setJobs(seedJobs);

  const value = useMemo(
    () => ({ jobs, ready, createJob, resubmitJob, reviewJob, markComplete, resetDemo }),
    [jobs, ready]
  );

  return <JobStoreContext.Provider value={value}>{children}</JobStoreContext.Provider>;
}

export const useJobs = () => {
  const context = useContext(JobStoreContext);
  if (!context) throw new Error("useJobs must be used inside JobStoreProvider");
  return context;
};
