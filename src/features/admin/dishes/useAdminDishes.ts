import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";

export function useAdminDishes() {
  return useQuery({
    queryKey: ["adminDishes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platos")
        .select("*, categorias(id, nombre, orden)")
        .order("nombre");
      if (error) throw error;
      return data;
    },
  });
}
