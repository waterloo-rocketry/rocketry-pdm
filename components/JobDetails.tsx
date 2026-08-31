import { Job } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function JobDetails({ job }: { job: Job }) {
  return (
    <div className="details">
      <div className="detail"><span>Stock</span><strong>{job.stock}</strong></div>
      <div className="detail"><span>Desired Completion</span><strong>{formatDate(job.desiredCompletionDate)}</strong></div>
      <div className="detail"><span>Checker</span><strong>{job.checker}</strong></div>
      <div className="detail"><span>Approver</span><strong>{job.approver}</strong></div>
      <div className="detail"><span>Created</span><strong>{formatDate(job.createdAt)}</strong></div>
      <div className="detail"><span>Job ID</span><strong>{job.id}</strong></div>
      {job.completedAt && <div className="detail"><span>Completed</span><strong>{formatDate(job.completedAt)}</strong></div>}
      {job.completedBy && <div className="detail"><span>Completed By</span><strong>{job.completedBy}</strong></div>}
    </div>
  );
}
