import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/Header";
import { tableStateStyles } from "../../../lib/tableStates";
import Modal from "../../waiter/Modal";
import { useAdminTables } from "./useAdminTables";
import { useCreateTable } from "./useCreateTable";

function TablesAdminPage() {
  const { data: tables } = useAdminTables();
  const createTable = useCreateTable();
  const navigate = useNavigate();

  const [formOpen, setFormOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [tamano, setTamano] = useState("2");
  const [forma, setForma] = useState<"redonda" | "rectangular">("rectangular");

  return (
    <div>
      <Header title="Taules" onBack={() => navigate("/admin")} />
      <div className="p-4 max-w-md mx-auto flex flex-col gap-3">
        <button
          onClick={() => setFormOpen(true)}
          className="bg-accent text-white rounded-xl py-3 font-medium cursor-pointer"
        >
          + Afegeix una taula
        </button>

        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          {tables?.map((table) => {
            const style = tableStateStyles[table.estado];
            return (
              <div
                key={table.id}
                className="flex items-center justify-between px-4 py-3 border-b border-stone-100 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${style?.dot ?? "bg-stone-300"}`} />
                  <span className="font-medium">Taula {table.nombre}</span>
                </div>
                <span className="text-sm text-stone-500">
                  {table.tamano} pax · {table.forma === "redonda" ? "Rodona" : "Rectangular"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {formOpen && (
        <Modal
          onClose={() => {
            setFormOpen(false);
            setNombre("");
          }}
        >
          <h2 className="text-center text-xl font-bold mb-4">Nova taula</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createTable.mutate(
                { nombre, tamano: Number(tamano), forma },
                {
                  onSuccess: () => {
                    setFormOpen(false);
                    setNombre("");
                  },
                },
              );
            }}
            className="flex flex-col gap-3"
          >
            <input
              className="border border-stone-300 rounded-lg px-3 py-2"
              placeholder="Nom o número"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
            <select
              className="border border-stone-300 rounded-lg px-3 py-2"
              value={tamano}
              onChange={(e) => setTamano(e.target.value)}
            >
              <option value="2">2 persones</option>
              <option value="4">4 persones</option>
              <option value="6">6 persones</option>
            </select>
            <select
              className="border border-stone-300 rounded-lg px-3 py-2"
              value={forma}
              onChange={(e) => setForma(e.target.value as "redonda" | "rectangular")}
            >
              <option value="rectangular">Rectangular</option>
              <option value="redonda">Rodona</option>
            </select>
            <button
              type="submit"
              className="bg-accent text-white rounded-xl py-2 font-medium mt-2 cursor-pointer"
            >
              Crear
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default TablesAdminPage;
