import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";

export function useOrderTables(orderId: string) {
  return useQuery({
    queryKey: ["orderTables", orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comanda_mesas")
        .select("mesas(nombre)")
        .eq("comanda_id", orderId);
      if (error) throw error;
      return data as unknown as { mesas: { nombre: string } }[];
    },
  });
}
