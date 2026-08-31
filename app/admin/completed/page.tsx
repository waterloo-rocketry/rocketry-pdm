"use client";
import { AdminGuard } from "@/components/AdminGuard";
import { JobsTable } from "@/components/JobsTable";
import { useJobs } from "@/lib/jobStore";
export default function CompletedPage() { const { jobs } = useJobs(); return <main><AdminGuard><div className="page-heading"><div><h1>Completed Jobs</h1><p>Read-only completed job history.</p></div></div><JobsTable jobs={jobs.filter(j => j.status === "Complete")} admin /></AdminGuard></main>; }
