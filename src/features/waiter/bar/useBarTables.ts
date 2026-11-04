import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";

export type PreviewLine = { nombre: string; cantidad: number };

export function useBarTables() {
  return useQuery({
    queryKey: ["barTables"],
    queryFn: async () => {
      const { data, error } = await supabase.from("mesas").select("*").eq("es_barra", true);
      if (error) throw error;

      const sorted = [...data].sort((a, b) => Number(a.nombre) - Number(b.nombre));
      const firstFreeId = sorted.find((tab) => tab.estado === "libre")?.id;
      const visible = sorted.filter((tab) => tab.estado !== "libre" || tab.id === firstFreeId);

      const occupiedIds = visible.filter((tab) => tab.estado !== "libre").map((tab) => tab.id);
      const previewByMesa = new Map<string, { orderId: string; lines: PreviewLine[] }>();

      if (occupiedIds.length > 0) {
        const { data: linesData, error: linesError } = await supabase
          .from("comanda_mesas")
          .select("mesa_id, comanda_id, comandas(estado, comanda_lineas(cantidad, platos(nombre)))")
          .in("mesa_id", occupiedIds);
        if (linesError) throw linesError;

        for (const row of linesData as unknown as {
          mesa_id: string;
          comanda_id: string;
          comandas: {
            estado: string;
            comanda_lineas: { cantidad: number; platos: { nombre: string } }[];
          } | null;
        }[]) {
          if (row.comandas?.estado === "abierta") {
            previewByMesa.set(row.mesa_id, {
              orderId: row.comanda_id,
              lines: row.comandas.comanda_lineas.map((l) => ({
                nombre: l.platos.nombre,
                cantidad: l.cantidad,
              })),
            });
          }
        }
      }

      return visible.map((tab) => ({
        ...tab,
        orderId: previewByMesa.get(tab.id)?.orderId ?? null,
        previewLines: previewByMesa.get(tab.id)?.lines ?? [],
      }));
    },
  });
}
