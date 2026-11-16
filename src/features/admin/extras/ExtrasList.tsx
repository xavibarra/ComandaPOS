import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useCreateExtra } from "./useCreateExtra";
import { useDeleteExtra } from "./useDeleteExtra";
import { useExtras } from "./useExtras";

const preventEnterSubmit = (e: React.KeyboardEvent) => {
  // Este componente vive dentro de formularios (alta de plat / categoria) —
  // sin esto, Intro aquí dispararía el submit de ESE formulario.
  if (e.key === "Enter") e.preventDefault();
};

// Reutilizable: pasa categoriaId para gestionar los extras de una categoria
// entera, o platoId para los de un plat concret. Nunca los dos a la vez.
function ExtrasList({ categoriaId, platoId }: { categoriaId?: string; platoId?: string }) {
  const { data: extras } = useExtras({ categoriaId, platoId });
  const createExtra = useCreateExtra();
  const deleteExtra = useDeleteExtra();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const addExtra = () => {
    if (!name || !price) return;
    createExtra.mutate(
      { categoriaId, platoId, nombre: name, precio: Number(price), orden: extras?.length ?? 0 },
      {
        onSuccess: () => {
          setName("");
          setPrice("");
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-2">
      {extras?.map((extra) => (
        <div key={extra.id} className="flex items-center justify-between text-sm">
          <span>{extra.nombre}</span>
          <span className="flex items-center gap-2">
            <span className="text-stone-500">+{extra.precio.toFixed(2)} €</span>
            <button
              type="button"
              onClick={() => deleteExtra.mutate({ extraId: extra.id, categoriaId, platoId })}
              className="text-stone-400 cursor-pointer"
            >
              <Trash2 size={14} />
            </button>
          </span>
        </div>
      ))}
      <div className="flex gap-2">
        <input
          className="border border-stone-300 rounded-lg px-2 py-1.5 text-sm flex-1"
          placeholder="Nom (p. ex. Formatge)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={preventEnterSubmit}
        />
        <input
          className="border border-stone-300 rounded-lg px-2 py-1.5 text-sm w-20"
          placeholder="Preu"
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          onKeyDown={preventEnterSubmit}
        />
        <button
          type="button"
          onClick={addExtra}
          className="bg-accent text-white rounded-lg px-3 text-sm cursor-pointer"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default ExtrasList;
