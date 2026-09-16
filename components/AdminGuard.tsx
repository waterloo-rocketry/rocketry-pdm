"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export type AdminAccess = "full" | "checker";

type AdminAccessContextValue = {
  access: AdminAccess;
  email: string;
};

const AdminAccessContext =
  createContext<AdminAccessContextValue | null>(null);

const FULL_ADMIN_EMAILS = [
  "r3macwan@uwaterloo.ca",
];

const CHECKER_EMAIL =
  "checkerlogin@rocketry.local";

function getAdminAccess(
  email?: string
): AdminAccess | null {
  if (!email) return null;

  const normalized = email.trim().toLowerCase();

  if (FULL_ADMIN_EMAILS.includes(normalized)) {
    return "full";
  }

  if (normalized === CHECKER_EMAIL) {
    return "checker";
  }

  return null;
}

export function useAdminAccess() {
  return useContext(AdminAccessContext);
}

export function AdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [account, setAccount] =
    useState<AdminAccessContextValue | null>(null);

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!active) return;

      const email = user?.email;
      const access = error
        ? null
        : getAdminAccess(email);

      if (email && access) {
        setAccount({
          access,
          email,
        });

        return;
      }

      setAccount(null);

      router.replace("/admin/login");
    };

    void checkSession();

    return () => {
      active = false;
    };
  }, [router]);

  if (!account) {
    return (
      <div className="card">
        Checking admin session…
      </div>
    );
  }

  return (
    <AdminAccessContext.Provider value={account}>
      {children}
    </AdminAccessContext.Provider>
  );
}