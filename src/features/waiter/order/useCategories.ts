import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categorias").select("*").order("orden");
      if (error) throw error;
      return data;
    },
  });
}
