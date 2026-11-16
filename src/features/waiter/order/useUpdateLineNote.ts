import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";

export function useUpdateLineNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ lineId, nota }: { lineId: string; nota: string; orderId: string }) => {
      const { error } = await supabase
        .from("comanda_lineas")
        .update({ nota: nota || null })
        .eq("id", lineId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orderLines", variables.orderId] });
    },
  });
}
