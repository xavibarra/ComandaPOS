import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";

export function useUpdateDish() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      dishId,
      changes,
    }: {
      dishId: string;
      changes: Partial<{
        nombre: string;
        precio: number;
        categoria_id: string;
        stock: number;
        imprime_a_cocina: boolean;
        activo: boolean;
      }>;
    }) => {
      const { error } = await supabase.from("platos").update(changes).eq("id", dishId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminDishes"] });
    },
  });
}
