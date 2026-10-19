import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";

export function useRemoveUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      lineId,
      currentQuantity,
    }: {
      lineId: string;
      currentQuantity: number;
      orderId: string;
    }) => {
      if (currentQuantity > 1) {
        const { error } = await supabase
          .from("comanda_lineas")
          .update({ cantidad: currentQuantity - 1 })
          .eq("id", lineId)
          .eq("enviado_a_cocina", false);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("comanda_lineas")
          .delete()
          .eq("id", lineId)
          .eq("enviado_a_cocina", false);
        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orderLines", variables.orderId] });
    },
  });
}
