import { supabase } from "@/lib/supabase/client";
import { getStorageProvider } from "@/lib/storage";
import { mapSupabaseJob } from "@/lib/jobMapper";

import type { Job, NewJobInput, Person } from "@/lib/types";

type AdminDecision = "send-back" | "send-approval" | "approve";

export async function getJobsFromSupabase(): Promise<Job[]> {
  const { data, error } = await supabase
    .from("jobs")
    .select(`
      *,
      stock_options (
        name
      ),
      job_documents (
        *
      ),
      job_comments (
        *
      ),
      job_history (
        *
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapSupabaseJob);
}

export async function createJobInSupabase(
  input: NewJobInput,
  stockId: string
): Promise<Job> {
  const { data: jobRow, error: jobError } = await supabase
    .from("jobs")
    .insert({
      title: input.title,
      stock_id: stockId,
      desired_completion_date: input.desiredCompletionDate,
      checker: input.checker,
      approver: input.approver,
      status: "awaiting_check",
    })
    .select(`
      *,
      stock_options (
        name
      )
    `)
    .single();

  if (jobError) {
    throw jobError;
  }

  const storage = getStorageProvider();

const storedFile = await storage.upload({
  file: input.pdf.file,
  jobId: jobRow.id,
  filename: input.pdf.filename,
});

const { error: documentError } = await supabase
  .from("job_documents")
  .insert({
    job_id: jobRow.id,
    version_number: 1,
    document_type: "original_submission",
    original_filename: input.pdf.filename,
    storage_provider: storedFile.provider,
    storage_path: storedFile.path,
    external_file_id: storedFile.externalFileId ?? null,
    uploaded_by: "Engineering User",
  });

if (documentError) {
  throw documentError;
}

  const { error: commentError } = await supabase
    .from("job_comments")
    .insert({
      job_id: jobRow.id,
      author: "Engineering User",
      author_role: "user",
      comment: input.originalComments,
    });

  if (commentError) {
    throw commentError;
  }

  const { error: historyError } = await supabase
  .from("job_history")
  .insert([
    {
      job_id: jobRow.id,
      previous_status: null,
      new_status: "work_in_progress",
      action: "Job created",
      performed_by: "Engineering User",
      performed_by_role: "user",
    },
    {
      job_id: jobRow.id,
      previous_status: "work_in_progress",
      new_status: "awaiting_check",
      action: "Submitted for check",
      performed_by: "Engineering User",
      performed_by_role: "user",
    },
  ]);

  if (historyError) {
    throw historyError;
  }

  return getFullJob(jobRow.id);
}

export async function resubmitJobInSupabase(
  jobId: string,
  file: File,
  filename: string,
  comment: string
): Promise<Job> {
  const { data: existingJob, error: jobLookupError } = await supabase
    .from("jobs")
    .select("id, status")
    .eq("job_number", jobId)
    .single();

  if (jobLookupError) {
    throw jobLookupError;
  }

  if (existingJob.status !== "work_in_progress") {
    throw new Error("Job is not in Work in Progress.");
  }

  const { data: latestDocument, error: documentLookupError } = await supabase
    .from("job_documents")
    .select("version_number")
    .eq("job_id", existingJob.id)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (documentLookupError) {
    throw documentLookupError;
  }

  const nextVersion = (latestDocument?.version_number ?? 0) + 1;

const storage = getStorageProvider();

const storedFile = await storage.upload({
  file,
  jobId: existingJob.id,
  filename,
});

const { error: documentError } = await supabase
  .from("job_documents")
  .insert({
    job_id: existingJob.id,
    version_number: nextVersion,
    document_type: "user_revision",
    original_filename: filename,
    storage_provider: storedFile.provider,
    storage_path: storedFile.path,
    external_file_id: storedFile.externalFileId ?? null,
    uploaded_by: "Engineering User",
  });

  if (documentError) {
    throw documentError;
  }

  if (comment.trim()) {
    const { error: commentError } = await supabase
      .from("job_comments")
      .insert({
        job_id: existingJob.id,
        author: "Engineering User",
        author_role: "user",
        comment: comment.trim(),
      });

    if (commentError) {
      throw commentError;
    }
  }

  const { error: updateError } = await supabase
    .from("jobs")
    .update({
      status: "awaiting_check",
      updated_at: new Date().toISOString(),
    })
    .eq("id", existingJob.id);

  if (updateError) {
    throw updateError;
  }

  const { error: historyError } = await supabase
    .from("job_history")
    .insert([
      {
        job_id: existingJob.id,
        previous_status: "work_in_progress",
        new_status: "work_in_progress",
        action: "Revised drawing uploaded",
        performed_by: "Engineering User",
        performed_by_role: "user",
      },
      {
        job_id: existingJob.id,
        previous_status: "work_in_progress",
        new_status: "awaiting_check",
        action: "Resubmitted for check",
        performed_by: "Engineering User",
        performed_by_role: "user",
      },
    ]);

  if (historyError) {
    throw historyError;
  }

  return getFullJob(existingJob.id);
}

export async function reviewJobInSupabase(
  jobId: string,
  admin: Person,
  decision: AdminDecision,
  comment: string,
  markup?: {
    filename: string;
    file: File;
  }
): Promise<Job> {
  const { data: existingJob, error: jobLookupError } = await supabase
    .from("jobs")
    .select("id, status")
    .eq("job_number", jobId)
    .single();

  if (jobLookupError) {
    throw jobLookupError;
  }

  const isCheckerStage = existingJob.status === "awaiting_check";
  const isApprovalStage = existingJob.status === "awaiting_approval";

  if (!isCheckerStage && !isApprovalStage) {
    throw new Error("Job is not available for review.");
  }

  let newStatus: string;
  let action: string;
  let role: "checker" | "approver";

  if (decision === "send-back") {
    newStatus = "work_in_progress";
    action = isCheckerStage ? "Sent back to WIP" : "Approver rejected";
    role = isCheckerStage ? "checker" : "approver";
  } else if (decision === "send-approval" && isCheckerStage) {
    newStatus = "awaiting_approval";
    action = "Checker passed";
    role = "checker";
  } else if (decision === "approve" && isApprovalStage) {
    newStatus = "awaiting_manufacturing";
    action = "Approved for manufacturing";
    role = "approver";
  } else {
    throw new Error("Invalid review decision for current job status.");
  }

  if (comment.trim()) {
    const { error: commentError } = await supabase
      .from("job_comments")
      .insert({
        job_id: existingJob.id,
        author: admin,
        author_role: role,
        comment: comment.trim(),
      });

    if (commentError) {
      throw commentError;
    }
  }

  if (markup) {
    const { data: latestDocument, error: documentLookupError } = await supabase
      .from("job_documents")
      .select("version_number")
      .eq("job_id", existingJob.id)
      .order("version_number", { ascending: false })
      .limit(1)
      .maybeSingle();
  
    if (documentLookupError) {
      throw documentLookupError;
    }
  
    const nextVersion = (latestDocument?.version_number ?? 0) + 1;
  
    const storage = getStorageProvider();
  
    const storedFile = await storage.upload({
      file: markup.file,
      jobId: existingJob.id,
      filename: markup.filename,
    });
  
    const { error: markupError } = await supabase
      .from("job_documents")
      .insert({
        job_id: existingJob.id,
        version_number: nextVersion,
        document_type: isCheckerStage
          ? "checker_markup"
          : "approver_markup",
        original_filename: markup.filename,
        storage_provider: storedFile.provider,
        storage_path: storedFile.path,
        external_file_id: storedFile.externalFileId ?? null,
        uploaded_by: admin,
      });
  
    if (markupError) {
      throw markupError;
    }
  }

  if (decision === "approve" && isApprovalStage) {
    const { data: latestDocument, error: documentLookupError } = await supabase
      .from("job_documents")
      .select("*")
      .eq("job_id", existingJob.id)
      .order("version_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (documentLookupError) {
      throw documentLookupError;
    }

    if (latestDocument) {
      const { error: finalDocumentError } = await supabase
        .from("job_documents")
        .insert({
          job_id: existingJob.id,
          version_number: latestDocument.version_number + 1,
          document_type: "final_approved",
          original_filename: latestDocument.original_filename,
          storage_provider: latestDocument.storage_provider,
          external_file_id: latestDocument.external_file_id,
          storage_path: latestDocument.storage_path,
          uploaded_by: admin,
          metadata: latestDocument.metadata,
        });

      if (finalDocumentError) {
        throw finalDocumentError;
      }
    }
  }

  const { error: updateError } = await supabase
    .from("jobs")
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", existingJob.id);

  if (updateError) {
    throw updateError;
  }

  const { error: historyError } = await supabase
    .from("job_history")
    .insert({
      job_id: existingJob.id,
      previous_status: existingJob.status,
      new_status: newStatus,
      action,
      performed_by: admin,
      performed_by_role: role,
    });

  if (historyError) {
    throw historyError;
  }

  return getFullJob(existingJob.id);
}

export async function markCompleteInSupabase(
    jobId: string,
    admin: Person
  ): Promise<Job> {
    const { data: existingJob, error: jobLookupError } = await supabase
      .from("jobs")
      .select("id, status")
      .eq("job_number", jobId)
      .single();
  
    if (jobLookupError) {
      throw jobLookupError;
    }
  
    if (existingJob.status !== "awaiting_manufacturing") {
      throw new Error("Job is not awaiting manufacturing.");
    }
  
    const completedAt = new Date().toISOString();
  
    const { error: updateError } = await supabase
      .from("jobs")
      .update({
        status: "complete",
        completed_at: completedAt,
        completed_by: admin,
        updated_at: completedAt,
      })
      .eq("id", existingJob.id);
  
    if (updateError) {
      throw updateError;
    }
  
    const { error: historyError } = await supabase
      .from("job_history")
      .insert({
        job_id: existingJob.id,
        previous_status: "awaiting_manufacturing",
        new_status: "complete",
        action: "Marked complete",
        performed_by: admin,
        performed_by_role: "manufacturing",
      });
  
    if (historyError) {
      throw historyError;
    }
  
    return getFullJob(existingJob.id);
  }

async function getFullJob(databaseId: string): Promise<Job> {
  const { data: fullJob, error: fullJobError } = await supabase
    .from("jobs")
    .select(`
      *,
      stock_options (
        name
      ),
      job_documents (
        *
      ),
      job_comments (
        *
      ),
      job_history (
        *
      )
    `)
    .eq("id", databaseId)
    .single();

  if (fullJobError) {
    throw fullJobError;
  }

  return mapSupabaseJob(fullJob);
}