import Link from "next/link";
export default function HomePage() {
  return <main><section className="hero"><h1>Engineering PDM Workflow</h1><p>Submit drawings, track reviews, manage revisions, and follow jobs through checking, approval, manufacturing, and completion.</p></section><section className="home-actions"><Link href="/new-job" className="action-card"><h2>New Job</h2><p>Create a drawing submission and send it to the assigned checker.</p></Link><Link href="/jobs" className="action-card"><h2>Existing Jobs</h2><p>View every job, its current status, comments, document history, and workflow history.</p></Link></section></main>;
}
