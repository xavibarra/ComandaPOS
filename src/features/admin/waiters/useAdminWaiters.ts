import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";

export function useAdminWaiters() {
  return useQuery({
    queryKey: ["adminWaiters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("camareros")
        .select("id, nombre, activo, telefono, email")
        .order("nombre");
      if (error) throw error;
      return data;
    },
  });
}
