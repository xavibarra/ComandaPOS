import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";

export function useDeleteVarianteOption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ optionId }: { optionId: string; dishId: string }) => {
      const { error } = await supabase.from("plato_variante_opciones").delete().eq("id", optionId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["dishVarianteGroups", variables.dishId] });
      queryClient.invalidateQueries({ queryKey: ["dishes"] });
    },
  });
}
