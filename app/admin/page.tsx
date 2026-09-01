"use client";

import Link from "next/link";

import { AdminGuard } from "@/components/AdminGuard";

import { useJobs } from "@/lib/jobStore";

export default function AdminPage() {
  const { jobs } = useJobs();

  const jack = jobs.filter(
    (j) =>
      (j.status === "Awaiting Check" && j.checker === "Jack") ||
      (j.status === "Awaiting Approval" && j.approver === "Jack")
  ).length;

  const raag = jobs.filter(
    (j) =>
      (j.status === "Awaiting Check" && j.checker === "Raag") ||
      (j.status === "Awaiting Approval" && j.approver === "Raag")
  ).length;

  const mfg = jobs.filter(
    (j) => j.status === "Awaiting Manufacturing"
  ).length;

  const done = jobs.filter(
    (j) => j.status === "Complete"
  ).length;

  return (
    <main>
      <AdminGuard>
        <div className="page-heading">
          <div>
            <h1>Admin Dashboard</h1>
            <p>
              Route work between checking, approval,
              manufacturing, and completion.
            </p>
          </div>
        </div>

        <div className="admin-grid">
          <Link className="admin-tile" href="/admin/jack">
            <h2>Jack Inbox</h2>
            <p>{jack} job(s) currently need Jack&apos;s action.</p>
          </Link>

          <Link className="admin-tile" href="/admin/raag">
            <h2>Raag Inbox</h2>
            <p>{raag} job(s) currently need Raag&apos;s action.</p>
          </Link>

          <Link className="admin-tile" href="/admin/manufacturing">
            <h2>Manufacturing</h2>
            <p>
              {mfg} approved job(s) are awaiting manufacturing.
            </p>
          </Link>

          <Link className="admin-tile" href="/admin/completed">
            <h2>Completed Jobs</h2>
            <p>{done} completed job(s) are archived here.</p>
          </Link>
        </div>
      </AdminGuard>
    </main>
  );
}