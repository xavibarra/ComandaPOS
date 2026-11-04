import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";

export function useUpdateRecoveryEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ settingsId, email }: { settingsId: string; email: string }) => {
      const { error } = await supabase
        .from("restaurant_settings")
        .update({ admin_recovery_email: email })
        .eq("id", settingsId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurantSettings"] });
    },
  });
}
