import type { FileStorage } from "./types";
import { SupabaseFileStorage } from "./supabaseStorage";

let storageProvider: FileStorage = new SupabaseFileStorage();

export function setStorageProvider(provider: FileStorage) {
  storageProvider = provider;
}

export function getStorageProvider(): FileStorage {
  return storageProvider;
}