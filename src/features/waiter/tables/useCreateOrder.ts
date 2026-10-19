import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";
import { useSessionStore } from "../../auth/sessionStore";

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const session = useSessionStore((state) => state.session);

  return useMutation({
    mutationFn: async ({ tableIds, guests }: { tableIds: string[]; guests: number }) => {
      if (session?.type !== "waiter") {
        throw new Error("No hay camarero con sesión iniciada");
      }

      const { data, error } = await supabase.rpc("crear_comanda", {
        camarero_id_input: session.id,
        mesa_ids: tableIds,
        comensales_input: guests,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
  });
}
