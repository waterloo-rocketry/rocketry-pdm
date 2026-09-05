import { supabase } from "@/lib/supabase/client";

import type {
  FileStorage,
  StoredFile,
  UploadFileInput,
} from "./types";

const BUCKET = "job-pdfs";

export class SupabaseFileStorage implements FileStorage {
  async upload(input: UploadFileInput): Promise<StoredFile> {
    const safeFilename = input.filename.replace(/[^a-zA-Z0-9._-]/g, "_");

    const path = `${input.jobId}/${Date.now()}-${safeFilename}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, input.file, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (error) {
      throw error;
    }

    return {
      provider: "supabase",
      path,
    };
  }

  async getFileUrl(path: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, 60 * 60);

    if (error) {
      throw error;
    }

    return data.signedUrl;
  }

  async delete(path: string): Promise<void> {
    const { error } = await supabase.storage
      .from(BUCKET)
      .remove([path]);

    if (error) {
      throw error;
    }
  }
}