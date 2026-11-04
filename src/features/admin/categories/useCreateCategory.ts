import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ nombre, orden }: { nombre: string; orden: number }) => {
      const { error } = await supabase
        .from("categorias")
        .insert({ nombre, orden, orden_barra: orden });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categoriesForBar"] });
    },
  });
}
