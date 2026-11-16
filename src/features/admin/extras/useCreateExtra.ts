import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";

export function useCreateExtra() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      categoriaId,
      platoId,
      nombre,
      precio,
      orden,
    }: {
      categoriaId?: string;
      platoId?: string;
      nombre: string;
      precio: number;
      orden: number;
    }) => {
      const { error } = await supabase.from("extras").insert({
        categoria_id: categoriaId ?? null,
        plato_id: platoId ?? null,
        nombre,
        precio,
        orden,
      });
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["extras", variables.categoriaId ?? variables.platoId] });
      queryClient.invalidateQueries({ queryKey: ["dishes"] });
    },
  });
}
