import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/Header";
import Modal from "../../waiter/Modal";
import { useAdminWaiters } from "./useAdminWaiters";
import { useCreateWaiter } from "./useCreateWaiter";
import { useToggleWaiterActive } from "./useToggleWaiterActive";
import { useUpdateWaiter } from "./useUpdateWaiter";
import { useUpdateWaiterPin } from "./useUpdateWaiterPin";

type WaiterForm = {
  nombre: string;
  telefono: string;
  email: string;
};

const emptyForm: WaiterForm = { nombre: "", telefono: "", email: "" };

function WaitersAdminPage() {
  const { data: waiters } = useAdminWaiters();
  const createWaiter = useCreateWaiter();
  const updateWaiter = useUpdateWaiter();
  const toggleActive = useToggleWaiterActive();
  const updatePin = useUpdateWaiterPin();
  const navigate = useNavigate();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<WaiterForm>(emptyForm);
  const [newPin, setNewPin] = useState("");

  const [pinChangeFor, setPinChangeFor] = useState<{ id: string; nombre: string } | null>(null);
  const [pinValue, setPinValue] = useState("");

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setNewPin("");
    setFormOpen(true);
  };

  const openEdit = (waiter: {
    id: string;
    nombre: string;
    telefono: string | null;
    email: string | null;
  }) => {
    setEditingId(waiter.id);
    setForm({
      nombre: waiter.nombre,
      telefono: waiter.telefono ?? "",
      email: waiter.email ?? "",
    });
    setFormOpen(true);
  };

  return (
    <div>
      <Header title="Cambrers" onBack={() => navigate("/admin")} />
      <div className="p-4 max-w-2xl mx-auto flex flex-col gap-3">
        <button
          onClick={openCreate}
          className="bg-accent text-white rounded-xl py-3 font-medium cursor-pointer"
        >
          + Afegeix un cambrer
        </button>

        {waiters?.map((waiter) => (
          <div
            key={waiter.id}
            className="bg-white rounded-xl p-4 border border-stone-200 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-bold shrink-0">
                {waiter.nombre.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium">{waiter.nombre}</p>
                <p className={`text-xs ${waiter.activo ? "text-green-600" : "text-stone-400"}`}>
                  {waiter.activo ? "Actiu" : "Desactivat"}
                </p>
                {(waiter.telefono || waiter.email) && (
                  <p className="text-xs text-stone-400">
                    {[waiter.telefono, waiter.email].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-3">
              <button className="text-sm text-stone-500 cursor-pointer" onClick={() => openEdit(waiter)}>
                Editar
              </button>
              <button
                className="text-sm text-stone-500 cursor-pointer"
                onClick={() => {
                  setPinChangeFor(waiter);
                  setPinValue("");
                }}
              >
                Canviar PIN
              </button>
              <button
                className="text-sm text-stone-500 cursor-pointer"
                onClick={() =>
                  toggleActive.mutate({ waiterId: waiter.id, active: !waiter.activo })
                }
              >
                {waiter.activo ? "Desactivar" : "Activar"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {formOpen && (
        <Modal onClose={() => setFormOpen(false)}>
          <h2 className="text-center text-xl font-bold mb-4">
            {editingId ? "Editar cambrer" : "Nou cambrer"}
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (editingId) {
                updateWaiter.mutate(
                  { waiterId: editingId, changes: form },
                  { onSuccess: () => setFormOpen(false) },
                );
              } else {
                createWaiter.mutate(
                  { ...form, pin: newPin },
                  { onSuccess: () => setFormOpen(false) },
                );
              }
            }}
            className="flex flex-col gap-3"
          >
            <input
              className="border border-stone-300 rounded-lg px-3 py-2"
              placeholder="Nom"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              required
            />
            {!editingId && (
              <input
                className="border border-stone-300 rounded-lg px-3 py-2"
                placeholder="PIN (4 xifres)"
                inputMode="numeric"
                maxLength={4}
                pattern="[0-9]{4}"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                required
              />
            )}
            <input
              className="border border-stone-300 rounded-lg px-3 py-2"
              placeholder="Telèfon (opcional)"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            />
            <input
              className="border border-stone-300 rounded-lg px-3 py-2"
              placeholder="Email (opcional)"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <button
              type="submit"
              className="bg-accent text-white rounded-xl py-2 font-medium mt-2 cursor-pointer"
            >
              {editingId ? "Guardar" : "Crear"}
            </button>
          </form>
        </Modal>
      )}

      {pinChangeFor && (
        <Modal onClose={() => setPinChangeFor(null)}>
          <h2 className="text-center text-xl font-bold mb-4">
            Nou PIN per a {pinChangeFor.nombre}
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updatePin.mutate(
                { waiterId: pinChangeFor.id, pin: pinValue },
                { onSuccess: () => setPinChangeFor(null) },
              );
            }}
            className="flex flex-col gap-3"
          >
            <input
              className="border border-stone-300 rounded-lg px-3 py-2"
              placeholder="Nou PIN (4 xifres)"
              inputMode="numeric"
              maxLength={4}
              pattern="[0-9]{4}"
              value={pinValue}
              onChange={(e) => setPinValue(e.target.value.replace(/\D/g, ""))}
              required
            />
            <button
              type="submit"
              className="bg-accent text-white rounded-xl py-2 font-medium mt-2 cursor-pointer"
            >
              Guardar
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default WaitersAdminPage;
