import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";

export function usePlatos() {
  return useQuery({
    queryKey: ["platos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("platos").select("*");
      if (error) throw error;
      return data;
    },
  });
}
