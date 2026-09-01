import { DocumentVersion } from "@/lib/types";

export function PdfViewer({ version }: { version?: DocumentVersion }) {
  if (!version) return <div className="pdf-placeholder">No PDF version available.</div>;
  return (
    <div className="pdf-panel">
      {version.dataUrl ? <iframe title={version.filename} src={version.dataUrl} /> : (
        <div className="pdf-placeholder"><div><strong>{version.filename}</strong><br /><br />This file record currently contains metadata only. PDF storage will be connected to university cloud storage in a later phase.</div></div>
      )}
    </div>
  );
}
