import { useMutation } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";

export function useUpdateWaiterPin() {
  return useMutation({
    mutationFn: async ({ waiterId, pin }: { waiterId: string; pin: string }) => {
      const { error } = await supabase.rpc("cambiar_pin_camarero", {
        camarero_id_input: waiterId,
        pin_nuevo: pin,
      });
      if (error) throw error;
    },
  });
}
