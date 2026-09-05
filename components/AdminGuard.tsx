"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

const ADMIN_EMAILS = [
  "r3macwan@uwaterloo.ca",
];

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const email = session?.user.email;

      if (email && ADMIN_EMAILS.includes(email)) {
        setOk(true);
      } else {
        await supabase.auth.signOut();
        router.replace("/admin/login");
      }
    };

    checkSession();
  }, [router]);

  return ok ? <>{children}</> : <div className="card">Checking admin session…</div>;
}