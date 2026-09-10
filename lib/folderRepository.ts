import { supabase } from "@/lib/supabase/client";

import type { ProjectFolder } from "@/lib/types";

export async function getProjectFolders(): Promise<ProjectFolder[]> {
  const { data, error } = await supabase
    .from("project_folders")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
  }));
}

export async function createProjectFolder(
  name: string
): Promise<ProjectFolder> {
  const { data, error } = await supabase
    .from("project_folders")
    .insert({
      name: name.trim(),
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    createdAt: data.created_at,
  };
}

export async function moveJobToFolder(
  jobId: string,
  folderId: string | null
): Promise<void> {
  const { error } = await supabase
    .from("jobs")
    .update({
      folder_id: folderId,
      updated_at: new Date().toISOString(),
    })
    .eq("job_number", jobId);

  if (error) {
    throw error;
  }
}

export async function deleteProjectFolder(
  folderId: string
): Promise<void> {
  const { error } = await supabase
    .from("project_folders")
    .delete()
    .eq("id", folderId);

  if (error) {
    throw error;
  }
}
