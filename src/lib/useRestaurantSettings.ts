import { useQuery } from "@tanstack/react-query";
import { supabase } from "./supabase";

export function useRestaurantSettings() {
  return useQuery({
    queryKey: ["restaurantSettings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("restaurant_settings")
        .select("id, nombre, admin_recovery_email")
        .single();
      if (error) throw error;
      return data;
    },
  });
}
