import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";

export function useMesas() {
  return useQuery({
    queryKey: ["mesas"],
    queryFn: async () => {
      const { data, error } = await supabase.from("mesas").select("*");
      if (error) throw error;
      return data;
    },
  });
}
