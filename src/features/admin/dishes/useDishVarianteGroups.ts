import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";

export function useDishVarianteGroups(dishId: string | null) {
  return useQuery({
    queryKey: ["dishVarianteGroups", dishId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plato_variante_grupos")
        .select("*, plato_variante_opciones(*)")
        .eq("plato_id", dishId)
        .order("orden");
      if (error) throw error;
      return data;
    },
    enabled: dishId !== null,
  });
}
