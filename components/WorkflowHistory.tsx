import { WorkflowEvent } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function WorkflowHistory({ events }: { events: WorkflowEvent[] }) {
  return <div className="history-list">{events.map((item) => (
    <div className="history-item" key={item.id}><strong>{item.event}</strong><div className="history-meta">{item.actor} · {formatDate(item.createdAt)}</div></div>
  ))}</div>;
}
