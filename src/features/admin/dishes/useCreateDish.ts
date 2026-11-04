import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";

export function useCreateDish() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dish: {
      nombre: string;
      precio: number;
      categoria_id: string;
      stock: number;
      imprime_a_cocina: boolean;
    }) => {
      const { error } = await supabase.from("platos").insert(dish);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminDishes"] });
    },
  });
}
