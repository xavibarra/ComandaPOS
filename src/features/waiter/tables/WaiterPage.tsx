import { LogOut, UtensilsCrossed } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/Header";
import StatusRow from "../../../components/StatusRow";
import { supabase } from "../../../lib/supabase";
import { tableStateStyles } from "../../../lib/tableStates";
import { useSessionStore } from "../../auth/sessionStore";
import Modal from "../Modal";
import { useCreateOrder } from "./useCreateOrder";
import { useTables } from "./useTables";

function WaiterPage() {
  const { data: tables } = useTables();
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [tablesToOpen, setTablesToOpen] = useState<string[] | null>(null);
  const [guests, setGuests] = useState<number>(1);
  const navigate = useNavigate();
  const createOrder = useCreateOrder();
  const endSession = useSessionStore((state) => state.endSession);

  const handleTableClick = async (table: { id: string; estado: string }) => {
    if (selectionMode) {
      if (table.estado !== "libre") return;
      setSelectedTables((current) =>
        current.includes(table.id)
          ? current.filter((id) => id !== table.id)
          : [...current, table.id],
      );
      return;
    }
    if (table.estado === "libre") {
      setTablesToOpen([table.id]);
      return;
    }
    const { data: orderId } = await supabase.rpc("buscar_comanda_abierta", {
      mesa_id_input: table.id,
    });
    navigate(`/order/${orderId}`);
  };

  return (
    <div>
      <Header
        title="Taules"
        icon={<UtensilsCrossed className="text-white" size={22} />}
        rightContent={
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/bar")}
              className="bg-white text-accent px-4 py-2.5 rounded-lg text-base font-bold cursor-pointer"
            >
              Barra
            </button>
            <button
              onClick={() => {
                setSelectionMode(!selectionMode);
                setSelectedTables([]);
              }}
              className="bg-white/20 text-white px-3 py-2 rounded-lg text-sm font-medium cursor-pointer"
            >
              {selectionMode ? "Cancel·lar" : "Unir taules"}
            </button>
            <button
              onClick={() => {
                endSession();
                navigate("/");
              }}
              title="Tancar sessió"
              className="bg-white/20 text-white p-2 rounded-lg cursor-pointer"
            >
              <LogOut size={18} />
            </button>
          </div>
        }
      />

      <div className="p-4 max-w-2xl mx-auto flex flex-col gap-3">
        {selectionMode && selectedTables.length > 0 && (
          <button
            onClick={() => setTablesToOpen(selectedTables)}
            className="w-full bg-accent text-white rounded-xl py-3 font-medium cursor-pointer"
          >
            Obrir comanda conjunta ({selectedTables.length})
          </button>
        )}

        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          {tables?.map((table) => {
            const style = tableStateStyles[table.estado];
            return (
              <StatusRow
                key={table.id}
                label={`Taula ${table.nombre}`}
                statusLabel={style?.label ?? table.estado}
                dotClassName={style?.dot ?? "bg-stone-300"}
                selected={selectedTables.includes(table.id)}
                disabled={selectionMode && table.estado !== "libre"}
                onClick={() => handleTableClick(table)}
              />
            );
          })}
        </div>
      </div>

      {tablesToOpen && (
        <Modal onClose={() => setTablesToOpen(null)}>
          <h2 className="text-center text-2xl font-bold">
            {tablesToOpen
              .map((id) => tables?.find((table) => table.id === id)?.nombre)
              .join(" + ")}
          </h2>
          <p className="text-center font-light">Quants comensals?</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createOrder.mutate(
                { tableIds: tablesToOpen!, guests },
                {
                  onSuccess: (orderId) => {
                    navigate(`/order/${orderId}`);
                  },
                },
              );
            }}
          >
            <div className="flex items-center justify-center gap-6 my-4">
              <button
                className="border border-stone-300 w-10 h-10 rounded-full text-xl font-bold flex items-center justify-center"
                type="button"
                onClick={() => setGuests(Math.max(1, guests - 1))}
              >
                -
              </button>
              <span>{guests}</span>
              <button
                className="bg-accent text-white text-xl w-10 h-10 rounded-full font-bold flex items-center justify-center"
                type="button"
                onClick={() => setGuests(guests + 1)}
              >
                +
              </button>
            </div>
            <button
              className="bg-accent text-white px-10 py-2 rounded-xl items-center justify-center mt-4 w-full"
              type="submit"
            >
              Obrir comanda
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default WaiterPage;
