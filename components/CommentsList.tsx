import { CommentEntry } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function CommentsList({ comments }: { comments: CommentEntry[] }) {
  if (!comments.length) return <div className="empty">No feedback has been added yet.</div>;
  return <div className="history-list">{comments.map((entry) => (
    <div className="comment" key={entry.id}>
      <div className="comment-head"><strong>{entry.author}</strong><span className="comment-role">{entry.role} · {formatDate(entry.createdAt)}</span></div>
      <p>{entry.comment}</p>
    </div>
  ))}</div>;
}
