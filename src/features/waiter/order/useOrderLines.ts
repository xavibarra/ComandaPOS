import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";

export function useOrderLines(orderId: string) {
  return useQuery({
    queryKey: ["orderLines", orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comanda_lineas")
        .select("*, platos(nombre, precio, imprime_a_cocina, categorias(orden))")
        .eq("comanda_id", orderId);
      if (error) throw error;
      return data;
    },
  });
}
