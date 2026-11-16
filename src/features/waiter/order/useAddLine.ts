import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";

export function useAddLine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      dish,
      modifiers,
    }: {
      orderId: string;
      dish: { id: string; precio: number };
      modifiers?: { nombre: string; precio: number }[];
    }) => {
      const { error } = await supabase.rpc("agregar_linea", {
        comanda_id_input: orderId,
        plato_id_input: dish.id,
        precio_input: dish.precio,
        modificadores_input: modifiers && modifiers.length > 0 ? modifiers : null,
      });
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orderLines", variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ["barTables"] });
    },
  });
}
