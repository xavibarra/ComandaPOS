import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";

export function useToggleWaiterActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ waiterId, active }: { waiterId: string; active: boolean }) => {
      const { error } = await supabase
        .from("camareros")
        .update({ activo: active })
        .eq("id", waiterId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminWaiters"] });
    },
  });
}
