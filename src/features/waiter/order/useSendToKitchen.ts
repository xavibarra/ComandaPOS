import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";

export function useSendToKitchen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId }: { orderId: string }) => {
      const { error } = await supabase
        .from("comanda_lineas")
        .update({ enviado_a_cocina: true, enviado_at: new Date().toISOString() })
        .eq("comanda_id", orderId)
        .eq("enviado_a_cocina", false);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orderLines", variables.orderId] });
    },
  });
}
