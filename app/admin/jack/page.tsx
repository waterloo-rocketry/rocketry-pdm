"use client";
import { AdminGuard } from "@/components/AdminGuard";
import { JobsTable } from "@/components/JobsTable";
import { useJobs } from "@/lib/jobStore";
export default function JackInbox() { const { jobs } = useJobs(); const filtered = jobs.filter(j => (j.status === "Awaiting Check" && j.checker === "Jack") || (j.status === "Awaiting Approval" && j.approver === "Jack")); return <main><AdminGuard><div className="page-heading"><div><h1>Jack Inbox</h1><p>Jobs where Jack is the current checker or approver.</p></div></div><JobsTable jobs={filtered} admin /></AdminGuard></main>; }
