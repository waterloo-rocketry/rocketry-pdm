import { JobStatus } from "@/lib/types";

const classes: Record<JobStatus, string> = {
  "Work in Progress": "badge-wip",
  "Awaiting Check": "badge-check",
  "Awaiting Approval": "badge-approval",
  "Awaiting Manufacturing": "badge-manufacturing",
  Complete: "badge-complete"
};

export function StatusBadge({ status }: { status: JobStatus }) {
  return <span className={`badge ${classes[status]}`}>{status}</span>;
}
