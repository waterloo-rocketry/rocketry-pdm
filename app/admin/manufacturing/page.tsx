"use client";
import { AdminGuard } from "@/components/AdminGuard";
import { JobsTable } from "@/components/JobsTable";
import { useJobs } from "@/lib/jobStore";
export default function ManufacturingPage() { const { jobs } = useJobs(); return <main><AdminGuard><div className="page-heading"><div><h1>Manufacturing</h1><p>Approved jobs awaiting manual completion.</p></div></div><JobsTable jobs={jobs.filter(j => j.status === "Awaiting Manufacturing")} admin /></AdminGuard></main>; }
