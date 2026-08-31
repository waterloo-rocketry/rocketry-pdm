import { DocumentVersion } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function VersionHistory({ versions }: { versions: DocumentVersion[] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>Version</th><th>Type</th><th>Uploaded By</th><th>Date</th><th>Filename</th></tr></thead>
        <tbody>{versions.map((v) => (
          <tr key={v.id}><td>V{v.version}</td><td>{v.type}</td><td>{v.uploadedBy}</td><td>{formatDate(v.uploadedAt)}</td><td>{v.dataUrl ? <a className="job-link" href={v.dataUrl} target="_blank" rel="noreferrer">{v.filename}</a> : v.filename}</td></tr>
        ))}</tbody>
      </table>
    </div>
  );
}
