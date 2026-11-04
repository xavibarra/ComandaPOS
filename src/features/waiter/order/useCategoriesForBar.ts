import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";

export function useCategoriesForBar({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ["categoriesForBar"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categorias").select("*").order("orden_barra");
      if (error) throw error;
      return data;
    },
    enabled,
  });
}
