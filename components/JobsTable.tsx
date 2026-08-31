import Link from "next/link";
import { Job } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";

export function JobsTable({ jobs, admin = false }: { jobs: Job[]; admin?: boolean }) {
  if (!jobs.length) return <div className="card empty">No jobs match this view.</div>;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Job Title</th><th>Status</th><th>Stock</th><th>Checker</th><th>Approver</th><th>Desired Date</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id}>
              <td><Link className="job-link" href={admin ? `/admin/jobs/${job.id}` : `/jobs/${job.id}`}>{job.title}</Link><div className="help">{job.id}</div></td>
              <td><StatusBadge status={job.status} /></td>
              <td>{job.stock}</td>
              <td>{job.checker}</td>
              <td>{job.approver}</td>
              <td>{formatDate(job.desiredCompletionDate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
