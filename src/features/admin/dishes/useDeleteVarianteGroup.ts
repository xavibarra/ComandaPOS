import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";

export function useDeleteVarianteGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId }: { groupId: string; dishId: string }) => {
      const { error } = await supabase.from("plato_variante_grupos").delete().eq("id", groupId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["dishVarianteGroups", variables.dishId] });
      queryClient.invalidateQueries({ queryKey: ["dishes"] });
    },
  });
}
