import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";

export function useTables() {
  return useQuery({
    queryKey: ["tables"],
    queryFn: async () => {
      const { data, error } = await supabase.from("mesas").select("*");
      if (error) throw error;
      return data;
    },
  });
}
