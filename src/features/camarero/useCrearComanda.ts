import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { useSesionStore } from "../auth/sesionStore";

export function useCrearComanda() {
  const queryClient = useQueryClient();
  const sesion = useSesionStore((state) => state.sesion);

  return useMutation({
    mutationFn: async ({ mesaIds, comensales }: { mesaIds: string[]; comensales: number }) => {
      if (sesion?.tipo !== "camarero") {
        throw new Error("No hay camarero con sesión iniciada");
      }

      const { data, error } = await supabase.rpc("crear_comanda", {
        camarero_id_input: sesion.id,
        mesa_ids: mesaIds,
        comensales_input: comensales,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mesas"] });
    },
  });
}
