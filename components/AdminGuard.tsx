"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (window.sessionStorage.getItem("pdm-admin-auth") === "true") setOk(true);
    else router.replace("/admin/login");
  }, [router]);
  return ok ? <>{children}</> : <div className="card">Checking admin session…</div>;
}
