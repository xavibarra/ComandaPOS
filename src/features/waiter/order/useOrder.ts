import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comandas")
        .select("*")
        .eq("id", orderId)
        .single();
      if (error) throw error;
      return data;
    },
  });
}
