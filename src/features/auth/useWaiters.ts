import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";

export function useWaiters() {
  return useQuery({
    queryKey: ["waiters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("camareros")
        .select("id, nombre")
        .eq("activo", true)
        .order("nombre");
      if (error) throw error;
      return data;
    },
  });
}
