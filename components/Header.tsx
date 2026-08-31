import Link from "next/link";

export function Header() {
  return (
    <header className="topbar">
      <Link href="/" className="brand">Engineering PDM</Link>
      <nav className="nav">
        <Link href="/new-job">New Job</Link>
        <Link href="/jobs">Existing Jobs</Link>
        <Link href="/admin/login">Admin Login</Link>
      </nav>
    </header>
  );
}
