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

export type Role =
  | "User"
  | "Checker"
  | "Approver"
  | "Admin"
  | "Manufacturing";

export type StockOrdering =
  | "admins_order"
  | "self_order";

export type ProjectFolder = {
  id: string;
  name: string;
  createdAt: string;
};

export interface DocumentVersion {
  id: string;
  version: number;
  type: DocumentType;
  uploadedBy: string;
  uploadedAt: string;
  filename: string;
  storageProvider?: string;
  storagePath?: string;
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
  stockOrdering?: StockOrdering;
  folderId?: string;
  desiredCompletionDate: string;

  checker: string;
  approver: Person;

  originalComments: string;
  createdAt: string;
  versions: DocumentVersion[];
  comments: CommentEntry[];
  workflow: WorkflowEvent[];
  completedAt?: string;
  completedBy?: Person;
  machinist?: string;
}

export interface NewJobInput {
  title: string;
  stock: string;
  stockOrdering: StockOrdering;
  desiredCompletionDate: string;

  checker: string;
  approver: Person;

  originalComments: string;

  pdfs: {
    filename: string;
    file: File;
  }[];
}