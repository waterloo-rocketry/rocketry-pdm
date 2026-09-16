import { supabase } from "@/lib/supabase/client";

export type Checker = {
  id: string;
  name: string;
  active: boolean;
};

export async function getActiveCheckers(): Promise<Checker[]> {
  const { data, error } = await supabase
    .from("checkers")
    .select("id, name, active")
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}