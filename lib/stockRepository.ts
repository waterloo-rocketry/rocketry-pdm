import { supabase } from "@/lib/supabase/client";

export interface StockOption {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

export async function getActiveStockOptions(): Promise<StockOption[]> {
  const { data, error } = await supabase
    .from("stock_options")
    .select("id, name, description, is_active")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    console.error("Failed to load stock options:", error);
    throw new Error("Failed to load stock options");
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    isActive: row.is_active,
  }));
}
