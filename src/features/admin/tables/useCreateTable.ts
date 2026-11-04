import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";

export function useCreateTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      nombre,
      tamano,
      forma,
    }: {
      nombre: string;
      tamano: number;
      forma: "redonda" | "rectangular";
    }) => {
      const { error } = await supabase.from("mesas").insert({ nombre, tamano, forma });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminTables"] });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
  });
}
