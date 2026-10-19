import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";

export function useDishes() {
  return useQuery({
    queryKey: ["dishes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platos")
        .select("*, categorias(id, nombre, orden)");
      if (error) throw error;
      return data;
    },
  });
}
