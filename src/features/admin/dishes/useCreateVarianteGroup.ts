import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";

export function useCreateVarianteGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      dishId,
      nombre,
      obligatorio,
      orden,
    }: {
      dishId: string;
      nombre: string;
      obligatorio: boolean;
      orden: number;
    }) => {
      const { error } = await supabase
        .from("plato_variante_grupos")
        .insert({ plato_id: dishId, nombre, obligatorio, orden });
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["dishVarianteGroups", variables.dishId] });
      queryClient.invalidateQueries({ queryKey: ["dishes"] });
    },
  });
}
