import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";

export function useDishes() {
  return useQuery({
    queryKey: ["dishes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platos")
        .select(
          "*, categorias(id, nombre, orden, extras(id, nombre, precio, orden)), extras(id, nombre, precio, orden), plato_variante_grupos(id, nombre, obligatorio, orden, plato_variante_opciones(id, nombre, precio, orden))",
        );
      if (error) throw error;
      return data;
    },
  });
}
