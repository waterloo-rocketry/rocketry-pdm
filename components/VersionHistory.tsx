"use client";

import { useEffect, useState } from "react";

import type { DocumentVersion } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { getStorageProvider } from "@/lib/storage";

export function VersionHistory({
  versions,
}: {
  versions: DocumentVersion[];
}) {
  const [urls, setUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadUrls() {
      const storage = getStorageProvider();
      const nextUrls: Record<string, string> = {};

      for (const version of versions) {
        if (
          version.storageProvider === "supabase" &&
          version.storagePath
        ) {
          nextUrls[version.id] = await storage.getFileUrl(
            version.storagePath
          );
        }
      }

      setUrls(nextUrls);
    }

    loadUrls();
  }, [versions]);

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Version</th>
            <th>Type</th>
            <th>Uploaded By</th>
            <th>Date</th>
            <th>Filename</th>
          </tr>
        </thead>

        <tbody>
          {versions.map((v) => (
            <tr key={v.id}>
              <td>V{v.version}</td>
              <td>{v.type}</td>
              <td>{v.uploadedBy}</td>
              <td>{formatDate(v.uploadedAt)}</td>
              <td>
                {urls[v.id] ? (
                  <a
                    className="job-link"
                    href={urls[v.id]}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {v.filename}
                  </a>
                ) : (
                  v.filename
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}