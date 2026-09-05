"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export function Header() {
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setIsAdmin(!!session);
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    router.push("/");
  };

  return (
    <header className="topbar">
      <Link href="/" className="brand">
      <img
  src="/Rocketry Logo.png"
  alt="Waterloo Rocketry"
  className="brand-logo"
/>
  <span>Waterloo Rocketry Manufacturing PDM</span>
</Link>

      <nav className="nav">
        <Link href="/new-job">New Job</Link>
        <Link href="/jobs">Existing Jobs</Link>

        {isAdmin ? (
          <>
            <Link href="/admin">Admin Dashboard</Link>
            <button className="btn" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <Link href="/admin/login">Admin Login</Link>
        )}
      </nav>
    </header>
  );
}