import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";

export function useDeleteExtra() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ extraId }: { extraId: string; categoriaId?: string; platoId?: string }) => {
      const { error } = await supabase.from("extras").delete().eq("id", extraId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["extras", variables.categoriaId ?? variables.platoId] });
      queryClient.invalidateQueries({ queryKey: ["dishes"] });
    },
  });
}
