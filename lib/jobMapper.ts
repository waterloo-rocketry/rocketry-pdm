import type {
    CommentEntry,
    DocumentType,
    DocumentVersion,
    Job,
    JobStatus,
    Role,
    WorkflowEvent,
  } from "@/lib/types";
  
  function mapJobStatus(status: string): JobStatus {
    const statusMap: Record<string, JobStatus> = {
      work_in_progress: "Work in Progress",
      awaiting_check: "Awaiting Check",
      awaiting_approval: "Awaiting Approval",
      awaiting_manufacturing: "Awaiting Manufacturing",
      complete: "Complete",
    };
  
    return statusMap[status] ?? "Work in Progress";
  }
  
  function mapDocumentType(type: string): DocumentType {
    const typeMap: Record<string, DocumentType> = {
      original_submission: "Original Submission",
      checker_markup: "Checker Markup",
      user_revision: "User Revision",
      approver_markup: "Approver Markup",
      final_approved: "Final Approved Drawing",
    };
  
    return typeMap[type] ?? "Original Submission";
  }
  
  function mapRole(role: string): Role {
    const roleMap: Record<string, Role> = {
      user: "User",
      checker: "Checker",
      approver: "Approver",
      admin: "Admin",
      manufacturing: "Manufacturing",
    };
  
    return roleMap[role] ?? "User";
  }
  
  export function mapSupabaseJob(row: any): Job {
    const versions: DocumentVersion[] = (row.job_documents ?? [])
  .map((document: any) => ({
    id: document.id,
    version: document.version_number,
    type: mapDocumentType(document.document_type),
    uploadedBy: document.uploaded_by,
    uploadedAt: document.uploaded_at,
    filename: document.original_filename,
storageProvider: document.storage_provider ?? undefined,
storagePath: document.storage_path ?? undefined,
  }))
  .sort((a: DocumentVersion, b: DocumentVersion) => a.version - b.version);
  
  const comments: CommentEntry[] = (row.job_comments ?? [])
  .map((comment: any) => ({
    id: comment.id,
    author: comment.author,
    role: mapRole(comment.author_role),
    createdAt: comment.created_at,
    comment: comment.comment,
  }))
  .sort(
    (a: CommentEntry, b: CommentEntry) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  
  const workflow: WorkflowEvent[] = (row.job_history ?? [])
  .map((event: any) => ({
    id: event.id,
    event: event.action,
    actor: event.performed_by,
    createdAt: event.created_at,
  }))
  .sort(
    (a: WorkflowEvent, b: WorkflowEvent) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  
    const originalComment =
      comments.find((comment) => comment.role === "User")?.comment ?? "";
  
     return {
      id: String(row.job_number),
      title: row.title,
      status: mapJobStatus(row.status),
      stock: row.stock_options?.name ?? "Unknown",
      stockOrdering: row.stock_ordering ?? undefined,
      folderId: row.folder_id ?? undefined,
      desiredCompletionDate: row.desired_completion_date,
      checker: row.checker,
      approver: row.approver,
      machinist: row.machinist ?? undefined,
      originalComments: originalComment,
      createdAt: row.created_at,
      versions,
      comments,
      workflow,
      completedAt: row.completed_at ?? undefined,
      completedBy: row.completed_by ?? undefined,
    };
  }