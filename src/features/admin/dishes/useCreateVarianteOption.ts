import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";

export function useCreateVarianteOption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      groupId,
      nombre,
      precio,
      orden,
    }: {
      groupId: string;
      dishId: string;
      nombre: string;
      precio: number;
      orden: number;
    }) => {
      const { error } = await supabase
        .from("plato_variante_opciones")
        .insert({ grupo_id: groupId, nombre, precio, orden });
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["dishVarianteGroups", variables.dishId] });
      queryClient.invalidateQueries({ queryKey: ["dishes"] });
    },
  });
}
