import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";

export function useUpdateWaiter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      waiterId,
      changes,
    }: {
      waiterId: string;
      changes: { nombre: string; telefono: string; email: string };
    }) => {
      const { error } = await supabase
        .from("camareros")
        .update({
          nombre: changes.nombre,
          telefono: changes.telefono || null,
          email: changes.email || null,
        })
        .eq("id", waiterId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminWaiters"] });
    },
  });
}
