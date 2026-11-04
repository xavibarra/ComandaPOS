import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";

export function useAdminTables() {
  return useQuery({
    queryKey: ["adminTables"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mesas")
        .select("*")
        .eq("es_barra", false)
        .order("nombre");
      if (error) throw error;
      return data;
    },
  });
}
