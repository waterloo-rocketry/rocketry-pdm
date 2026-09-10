"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  Job,
  NewJobInput,
  Person,
  ProjectFolder,
} from "./types";

import {
  getProjectFolders,
  createProjectFolder,
  moveJobToFolder,
  deleteProjectFolder,
} from "./folderRepository";

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
  folders: ProjectFolder[];
  ready: boolean;

  createJob: (
    input: NewJobInput
  ) => Promise<Job>;

  resubmitJob: (
    id: string,
    files: {
      filename: string;
      file: File;
    }[],
    comment: string
  ) => Promise<Job>;

  reviewJob: (
    id: string,
    admin: Person,
    decision: AdminDecision,
    comment: string,
    markups?: {
      filename: string;
      file: File;
    }[],
    machinist?: string
  ) => Promise<Job>;

  markComplete: (
    id: string,
    admin: Person
  ) => Promise<Job>;

  createFolder: (
    name: string
  ) => Promise<ProjectFolder>;

  moveJob: (
    jobId: string,
    folderId: string | null
  ) => Promise<void>;

  deleteFolder: (
    folderId: string
  ) => Promise<void>;
}

const JobStoreContext =
  createContext<JobStoreValue | null>(null);

export function JobStoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [folders, setFolders] =
    useState<ProjectFolder[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [supabaseJobs, projectFolders] =
          await Promise.all([
            getJobsFromSupabase(),
            getProjectFolders(),
          ]);

        setJobs(supabaseJobs);
        setFolders(projectFolders);
      } catch (error) {
        console.error(
          "Failed to load PDM data from Supabase:",
          error
        );

        setJobs([]);
        setFolders([]);
      } finally {
        setReady(true);
      }
    }

    loadData();
  }, []);

  const createJob = async (
    input: NewJobInput
  ): Promise<Job> => {
    const stockOptions =
      await getActiveStockOptions();

    const matchingStock = stockOptions.find(
      (option) => option.name === input.stock
    );

    if (!matchingStock) {
      throw new Error(
        "Selected stock option was not found."
      );
    }

    const job = await createJobInSupabase(
      input,
      matchingStock.id
    );

    setJobs((current) => [job, ...current]);

    return job;
  };

  const resubmitJob = async (
    id: string,
    files: {
      filename: string;
      file: File;
    }[],
    comment: string
  ): Promise<Job> => {
    const currentJob = jobs.find(
      (job) => job.id === id
    );

    if (
      !currentJob ||
      currentJob.status !== "Work in Progress"
    ) {
      throw new Error(
        "Job is not available for resubmission."
      );
    }

    const updatedJob =
      await resubmitJobInSupabase(
        id,
        files,
        comment.trim()
      );

    setJobs((current) =>
      current.map((job) =>
        job.id === id ? updatedJob : job
      )
    );

    return updatedJob;
  };

  const reviewJob = async (
    id: string,
    admin: Person,
    decision: AdminDecision,
    comment: string,
    markups?: {
      filename: string;
      file: File;
    }[],
    machinist?: string
  ): Promise<Job> => {
    const currentJob = jobs.find(
      (job) => job.id === id
    );

    if (!currentJob) {
      throw new Error("Job was not found.");
    }

    if (
      currentJob.status !== "Awaiting Check" &&
      currentJob.status !== "Awaiting Approval"
    ) {
      throw new Error(
        "Job is not available for review."
      );
    }

    const updatedJob =
      await reviewJobInSupabase(
        id,
        admin,
        decision,
        comment.trim(),
        markups,
        machinist?.trim()
      );

    setJobs((current) =>
      current.map((job) =>
        job.id === id ? updatedJob : job
      )
    );

    return updatedJob;
  };

  const markComplete = async (
    id: string,
    admin: Person
  ): Promise<Job> => {
    const currentJob = jobs.find(
      (job) => job.id === id
    );

    if (
      !currentJob ||
      currentJob.status !==
        "Awaiting Manufacturing"
    ) {
      throw new Error(
        "Job is not available to be marked complete."
      );
    }

    const updatedJob =
      await markCompleteInSupabase(
        id,
        admin
      );

    setJobs((current) =>
      current.map((job) =>
        job.id === id ? updatedJob : job
      )
    );

    return updatedJob;
  };

  const createFolder = async (
    name: string
  ): Promise<ProjectFolder> => {
    const folder =
      await createProjectFolder(name);

    setFolders((current) => [
      ...current,
      folder,
    ]);

    return folder;
  };

  const moveJob = async (
    jobId: string,
    folderId: string | null
  ): Promise<void> => {
    await moveJobToFolder(
      jobId,
      folderId
    );

    setJobs((current) =>
      current.map((job) =>
        job.id === jobId
          ? {
              ...job,
              folderId:
                folderId ?? undefined,
            }
          : job
      )
    );
  };

  const deleteFolder = async (
    folderId: string
  ): Promise<void> => {
    await deleteProjectFolder(
      folderId
    );

    setFolders((current) =>
      current.filter(
        (folder) =>
          folder.id !== folderId
      )
    );

    setJobs((current) =>
      current.map((job) =>
        job.folderId === folderId
          ? {
              ...job,
              folderId: undefined,
            }
          : job
      )
    );
  };

  const value = useMemo(
    () => ({
      jobs,
      folders,
      ready,
      createJob,
      resubmitJob,
      reviewJob,
      markComplete,
      createFolder,
      moveJob,
      deleteFolder,
    }),
    [jobs, folders, ready]
  );

  return (
    <JobStoreContext.Provider
      value={value}
    >
      {children}
    </JobStoreContext.Provider>
  );
}

export const useJobs = () => {
  const context =
    useContext(JobStoreContext);

  if (!context) {
    throw new Error(
      "useJobs must be used inside JobStoreProvider"
    );
  }

  return context;
};