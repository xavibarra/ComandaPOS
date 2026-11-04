import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";

export function useCreateWaiter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      nombre,
      pin,
      telefono,
      email,
    }: {
      nombre: string;
      pin: string;
      telefono?: string;
      email?: string;
    }) => {
      const { error } = await supabase.rpc("crear_camarero", {
        nombre_input: nombre,
        pin,
        telefono_input: telefono || null,
        email_input: email || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminWaiters"] });
    },
  });
}
