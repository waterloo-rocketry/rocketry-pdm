"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { seedJobs } from "./mockData";

import { Job, NewJobInput, Person } from "./types";

import { uid } from "./utils";

import {
  createJobInSupabase,
  getJobsFromSupabase,
  resubmitJobInSupabase,
  reviewJobInSupabase,
  markCompleteInSupabase,
} from "./jobRepository";

import { getActiveStockOptions } from "./stockRepository";

type AdminDecision = "send-back" | "send-approval" | "approve";

interface JobStoreValue {
  jobs: Job[];
  ready: boolean;

  createJob: (input: NewJobInput) => Promise<Job>;

  resubmitJob: (
    id: string,
    filename: string,
    dataUrl: string | undefined,
    comment: string
  ) => Promise<Job>;

  reviewJob: (
    id: string,
    admin: Person,
    decision: AdminDecision,
    comment: string,
    markup?: { filename: string; dataUrl?: string }
  ) => Promise<Job>;

  markComplete: (id: string, admin: Person) => Promise<Job>;

 
}

const JobStoreContext = createContext<JobStoreValue | null>(null);

export function JobStoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function loadJobs() {
      try {
        const supabaseJobs = await getJobsFromSupabase();

        if (supabaseJobs.length > 0) {
          setJobs(supabaseJobs);
        } else {
          setJobs(seedJobs);
        }
      } catch (error) {
        console.error("Failed to load jobs from Supabase:", error);
        setJobs(seedJobs);
      } finally {
        setReady(true);
      }
    }

    loadJobs();
  }, []);

  const createJob = async (input: NewJobInput): Promise<Job> => {
    const stockOption = await getActiveStockOptions();

    const matchingStock = stockOption.find(
      (option) => option.name === input.stock
    );

    if (!matchingStock) {
      throw new Error("Selected stock option was not found.");
    }

    const job = await createJobInSupabase(input, matchingStock.id);

    setJobs((current) => [job, ...current]);

    return job;
  };

  const resubmitJob = async (
    id: string,
    filename: string,
    dataUrl: string | undefined,
    comment: string
  ): Promise<Job> => {
    const currentJob = jobs.find((job) => job.id === id);

    if (!currentJob || currentJob.status !== "Work in Progress") {
      throw new Error("Job is not available for resubmission.");
    }

    const updatedJob = await resubmitJobInSupabase(
      id,
      filename,
      comment.trim()
    );

    setJobs((current) =>
      current.map((job) => (job.id === id ? updatedJob : job))
    );

    return updatedJob;
  };

  const reviewJob = async (
    id: string,
    admin: Person,
    decision: AdminDecision,
    comment: string,
    markup?: { filename: string; dataUrl?: string }
  ): Promise<Job> => {
    const currentJob = jobs.find((job) => job.id === id);

    if (!currentJob) {
      throw new Error("Job was not found.");
    }

    if (
      currentJob.status !== "Awaiting Check" &&
      currentJob.status !== "Awaiting Approval"
    ) {
      throw new Error("Job is not available for review.");
    }

    const updatedJob = await reviewJobInSupabase(
      id,
      admin,
      decision,
      comment.trim(),
      markup
        ? {
            filename: markup.filename,
          }
        : undefined
    );

    setJobs((current) =>
      current.map((job) => (job.id === id ? updatedJob : job))
    );

    return updatedJob;
  };

  const markComplete = async (
    id: string,
    admin: Person
  ): Promise<Job> => {
    const currentJob = jobs.find((job) => job.id === id);
  
    if (!currentJob || currentJob.status !== "Awaiting Manufacturing") {
      throw new Error("Job is not available to be marked complete.");
    }
  
    const updatedJob = await markCompleteInSupabase(id, admin);
  
    setJobs((current) =>
      current.map((job) => (job.id === id ? updatedJob : job))
    );
  
    return updatedJob;
  };

  

  const value = useMemo(
    () => ({
      jobs,
      ready,
      createJob,
      resubmitJob,
      reviewJob,
      markComplete,
    }),
    [jobs, ready]
  );

  return (
    <JobStoreContext.Provider value={value}>
      {children}
    </JobStoreContext.Provider>
  );
}

export const useJobs = () => {
  const context = useContext(JobStoreContext);

  if (!context) {
    throw new Error("useJobs must be used inside JobStoreProvider");
  }

  return context;
};