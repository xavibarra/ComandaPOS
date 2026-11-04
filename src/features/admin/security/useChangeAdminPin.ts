import { useMutation } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";

export function useChangeAdminPin() {
  return useMutation({
    mutationFn: async ({ pin }: { pin: string }) => {
      const { error } = await supabase.rpc("cambiar_pin_admin", { pin_nuevo: pin });
      if (error) throw error;
    },
  });
}
