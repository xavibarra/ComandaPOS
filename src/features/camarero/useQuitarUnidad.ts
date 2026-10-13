import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";

export function useQuitarUnidad() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      lineaId,
      cantidadActual,
    }: {
      lineaId: string;
      cantidadActual: number;
      comandaId: string;
    }) => {
      if (cantidadActual > 1) {
        const { error } = await supabase
          .from("comanda_lineas")
          .update({ cantidad: cantidadActual - 1 })
          .eq("id", lineaId)
          .eq("enviado_a_cocina", false);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("comanda_lineas")
          .delete()
          .eq("id", lineaId)
          .eq("enviado_a_cocina", false);
        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["lineasComanda", variables.comandaId] });
    },
  });
}
