export type Person = "Jack" | "Raag";

export type JobStatus =
  | "Work in Progress"
  | "Awaiting Check"
  | "Awaiting Approval"
  | "Awaiting Manufacturing"
  | "Complete";

export type DocumentType =
  | "Original Submission"
  | "Checker Markup"
  | "User Revision"
  | "Approver Markup"
  | "Final Approved Drawing";

export type Role = "User" | "Checker" | "Approver" | "Admin" | "Manufacturing";

export interface DocumentVersion {
  id: string;
  version: number;
  type: DocumentType;
  uploadedBy: string;
  uploadedAt: string;
  filename: string;
  dataUrl?: string;
}

export interface CommentEntry {
  id: string;
  author: string;
  role: Role;
  createdAt: string;
  comment: string;
}

export interface WorkflowEvent {
  id: string;
  event: string;
  actor: string;
  createdAt: string;
}

export interface Job {
  id: string;
  title: string;
  status: JobStatus;
  stock: string;
  desiredCompletionDate: string;
  checker: Person;
  approver: Person;
  originalComments: string;
  createdAt: string;
  versions: DocumentVersion[];
  comments: CommentEntry[];
  workflow: WorkflowEvent[];
  completedAt?: string;
  completedBy?: Person;
}

export interface NewJobInput {
  title: string;
  stock: string;
  desiredCompletionDate: string;
  checker: Person;
  approver: Person;
  originalComments: string;
  pdf: {
    filename: string;
    dataUrl?: string;
  };
}
