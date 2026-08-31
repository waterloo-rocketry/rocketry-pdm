import { DocumentVersion } from "@/lib/types";

export function PdfViewer({ version }: { version?: DocumentVersion }) {
  if (!version) return <div className="pdf-placeholder">No PDF version available.</div>;
  return (
    <div className="pdf-panel">
      {version.dataUrl ? <iframe title={version.filename} src={version.dataUrl} /> : (
        <div className="pdf-placeholder"><div><strong>{version.filename}</strong><br /><br />This seeded demo record has file metadata only. PDFs you upload during Phase 1 can be previewed here while they fit within browser localStorage limits.</div></div>
      )}
    </div>
  );
}
