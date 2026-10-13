import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";

export function useLineasComandas(comandaId: string) {
  return useQuery({
    queryKey: ["lineasComanda", comandaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comanda_lineas")
        .select("*, platos(nombre, precio)")
        .eq("comanda_id", comandaId);
      if (error) throw error;
      return data;
    },
  });
}
