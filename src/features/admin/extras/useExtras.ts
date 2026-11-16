import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";

export function useExtras({ categoriaId, platoId }: { categoriaId?: string; platoId?: string }) {
  const scopeKey = categoriaId ?? platoId ?? null;

  return useQuery({
    queryKey: ["extras", scopeKey],
    queryFn: async () => {
      let query = supabase.from("extras").select("*").order("orden");
      query = categoriaId ? query.eq("categoria_id", categoriaId) : query.eq("plato_id", platoId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: scopeKey !== null,
  });
}
