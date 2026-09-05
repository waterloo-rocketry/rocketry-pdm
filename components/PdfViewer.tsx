"use client";

import { useEffect, useState } from "react";
import { getStorageProvider } from "@/lib/storage";
import type { DocumentVersion } from "@/lib/types";

export function PdfViewer({ version }: { version?: DocumentVersion }) {
  const [pdfUrl, setPdfUrl] = useState<string | undefined>();

  useEffect(() => {
    async function loadPdf() {
      if (!version) {
        setPdfUrl(undefined);
        return;
      }

      if (
        version.storageProvider === "supabase" &&
        version.storagePath
      ) {
        const storage = getStorageProvider();
        const url = await storage.getFileUrl(version.storagePath);
        setPdfUrl(url);
        return;
      }

      setPdfUrl(undefined);
    }

    loadPdf();
  }, [version]);

  if (!version) {
    return (
      <div className="pdf-placeholder">
        No PDF version available.
      </div>
    );
  }

  return (
    <div className="pdf-panel">
      {pdfUrl ? (
        <iframe title={version.filename} src={pdfUrl} />
      ) : (
        <div className="pdf-placeholder">
          <div>
            <strong>{version.filename}</strong>
            <br />
            <br />
            PDF file is not available.
          </div>
        </div>
      )}
    </div>
  );
}