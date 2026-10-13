import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";

export function useAgregarLinea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      comandaId,
      plato,
    }: {
      comandaId: string;
      plato: { id: string; precio: number };
    }) => {
      const { error } = await supabase.rpc("agregar_linea", {
        comanda_id_input: comandaId,
        plato_id_input: plato.id,
        precio_input: plato.precio,
      });
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["lineasComanda", variables.comandaId] });
    },
  });
}
