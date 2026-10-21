import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
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

  return (
    <div>
      <h1>Camarero</h1>
      <button
        onClick={() => {
          setSelectionMode(!selectionMode);
        }}
      >
        {selectionMode ? "Desactivar Modo Selección" : "Activar Modo Selección"}
      </button>
      {selectionMode && <p>Modo selección activado</p>}
      {selectionMode && selectedTables.length > 0 && (
        <button
          onClick={() => {
            setTablesToOpen(selectedTables);
          }}
        >
          Confirmar selección de mesas ({selectedTables.length})
        </button>
      )}

      <ul>
        {tables?.map((table) => (
          <li
            key={table.id}
            onClick={async () => {
              if (selectionMode) {
                if (selectedTables.includes(table.id)) {
                  setSelectedTables(selectedTables.filter((id) => id !== table.id));
                } else {
                  setSelectedTables([...selectedTables, table.id]);
                }
              } else {
                if (table.estado === "libre") {
                  setTablesToOpen([table.id]);
                } else {
                  const { data: orderId } = await supabase.rpc("buscar_comanda_abierta", {
                    mesa_id_input: table.id,
                  });
                  navigate(`/order/${orderId}`);
                }
              }
            }}
          >
            <h2
              style={{
                backgroundColor: selectedTables.includes(table.id) ? "lightblue" : "white",
              }}
            >
              Mesa {table.nombre}
            </h2>
            <p>Estado: {table.estado}</p>
          </li>
        ))}
      </ul>
      {tablesToOpen && (
        <Modal onClose={() => setTablesToOpen(null)}>
          <h2 className="text-center text-2xl font-bold">
            {tablesToOpen.map((id) => tables?.find((table) => table.id === id)?.nombre).join(" + ")}
          </h2>
          <p className="text-center font-light">¿Cuantos comensales?</p>
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
              Abrir comanda
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default WaiterPage;
