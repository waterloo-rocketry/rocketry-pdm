"use client";
import { AdminGuard } from "@/components/AdminGuard";
import { JobsTable } from "@/components/JobsTable";
import { useJobs } from "@/lib/jobStore";
export default function RaagInbox() { const { jobs } = useJobs(); const filtered = jobs.filter(j => (j.status === "Awaiting Check" && j.checker === "Raag") || (j.status === "Awaiting Approval" && j.approver === "Raag")); return <main><AdminGuard><div className="page-heading"><div><h1>Raag Inbox</h1><p>Jobs where Raag is the current checker or approver.</p></div></div><JobsTable jobs={filtered} admin /></AdminGuard></main>; }
