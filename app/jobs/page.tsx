"use client";
import { JobsTable } from "@/components/JobsTable";
import { Loading } from "@/components/Loading";
import { useJobs } from "@/lib/jobStore";

export default function JobsPage() {
  const { jobs, ready } = useJobs();
  return <main><div className="page-heading"><div><h1>Existing Jobs</h1><p>All jobs currently stored in the Phase 1 browser mock.</p></div></div>{ready ? <JobsTable jobs={jobs} /> : <Loading />}</main>;
}
