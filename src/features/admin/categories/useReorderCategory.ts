import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";

export function useReorderCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      field,
      categoryId,
      newValue,
      swapWithId,
      swapWithValue,
    }: {
      field: "orden" | "orden_barra";
      categoryId: string;
      newValue: number;
      swapWithId: string;
      swapWithValue: number;
    }) => {
      const { error: errorA } = await supabase
        .from("categorias")
        .update({ [field]: newValue })
        .eq("id", categoryId);
      if (errorA) throw errorA;

      const { error: errorB } = await supabase
        .from("categorias")
        .update({ [field]: swapWithValue })
        .eq("id", swapWithId);
      if (errorB) throw errorB;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categoriesForBar"] });
    },
  });
}
