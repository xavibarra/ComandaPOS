import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";

export function useEnviarCocina() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ comandaId }: { comandaId: string }) => {
      const { error } = await supabase
        .from("comanda_lineas")
        .update({ enviado_a_cocina: true, enviado_at: new Date().toISOString() })
        .eq("comanda_id", comandaId)
        .eq("enviado_a_cocina", false);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["lineasComanda", variables.comandaId] });
    },
  });
}
