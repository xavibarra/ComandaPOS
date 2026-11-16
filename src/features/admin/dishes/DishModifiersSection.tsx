import { Trash2 } from "lucide-react";
import { useState } from "react";
import ExtrasList from "../extras/ExtrasList";
import { useCreateVarianteGroup } from "./useCreateVarianteGroup";
import { useCreateVarianteOption } from "./useCreateVarianteOption";
import { useDeleteVarianteGroup } from "./useDeleteVarianteGroup";
import { useDeleteVarianteOption } from "./useDeleteVarianteOption";
import { useDishVarianteGroups } from "./useDishVarianteGroups";

const preventEnterSubmit = (e: React.KeyboardEvent) => {
  if (e.key === "Enter") e.preventDefault();
};

function DishModifiersSection({ dishId }: { dishId: string }) {
  return (
    <div className="flex flex-col gap-6 border-t border-stone-200 pt-4 mt-1">
      <div className="flex flex-col gap-2">
        <h3 className="font-bold text-sm">Extres d&apos;aquest plat</h3>
        <p className="text-xs text-stone-500">
          Se sumen al preu del plat, i se&apos;n poden marcar més d&apos;un a la vegada. Si l&apos;extra
          val per a tots els plats d&apos;una categoria (p. ex. formatge en tots els entrepans), millor
          afegir-lo des de "Categories" en comptes de repetir-lo plat a plat.
        </p>
        <ExtrasList platoId={dishId} />
      </div>

      <VariantesSection dishId={dishId} />
    </div>
  );
}

function VariantesSection({ dishId }: { dishId: string }) {
  const { data: groups } = useDishVarianteGroups(dishId);
  const createGroup = useCreateVarianteGroup();
  const deleteGroup = useDeleteVarianteGroup();

  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupRequired, setNewGroupRequired] = useState(false);

  const addGroup = () => {
    if (!newGroupName) return;
    createGroup.mutate(
      { dishId, nombre: newGroupName, obligatorio: newGroupRequired, orden: groups?.length ?? 0 },
      {
        onSuccess: () => {
          setNewGroupName("");
          setNewGroupRequired(false);
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="font-bold text-sm">Variants</h3>
        <p className="text-xs text-stone-500">
          Elecció única que substitueix el preu del plat (p. ex. "Format": Copa / Ampolla, cada una
          amb el seu propi preu).
        </p>
      </div>

      {groups?.map((group) => (
        <VarianteGroupCard
          key={group.id}
          dishId={dishId}
          group={group}
          onDeleteGroup={() => deleteGroup.mutate({ groupId: group.id, dishId })}
        />
      ))}

      <div className="flex flex-col gap-2 bg-stone-50 rounded-lg p-3">
        <input
          className="border border-stone-300 rounded-lg px-3 py-2 text-sm"
          placeholder="Nom del grup (p. ex. Format)"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          onKeyDown={preventEnterSubmit}
        />
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={newGroupRequired}
            onChange={(e) => setNewGroupRequired(e.target.checked)}
          />
          Obligatori (cal triar-ne una per poder afegir el plat)
        </label>
        <button
          type="button"
          onClick={addGroup}
          className="bg-accent text-white rounded-lg py-2 text-sm font-medium cursor-pointer"
        >
          + Afegeix grup de variants
        </button>
      </div>
    </div>
  );
}

function VarianteGroupCard({
  dishId,
  group,
  onDeleteGroup,
}: {
  dishId: string;
  group: {
    id: string;
    nombre: string;
    obligatorio: boolean;
    plato_variante_opciones: { id: string; nombre: string; precio: number; orden: number }[];
  };
  onDeleteGroup: () => void;
}) {
  const createOption = useCreateVarianteOption();
  const deleteOption = useDeleteVarianteOption();
  const [optName, setOptName] = useState("");
  const [optPrice, setOptPrice] = useState("");

  const options = [...group.plato_variante_opciones].sort((a, b) => a.orden - b.orden);

  const addOption = () => {
    if (!optName || !optPrice) return;
    createOption.mutate(
      { groupId: group.id, dishId, nombre: optName, precio: Number(optPrice), orden: options.length },
      {
        onSuccess: () => {
          setOptName("");
          setOptPrice("");
        },
      },
    );
  };

  return (
    <div className="border border-stone-200 rounded-lg p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm">
          {group.nombre}{" "}
          {group.obligatorio && <span className="text-xs text-stone-400">(obligatori)</span>}
        </span>
        <button type="button" onClick={onDeleteGroup} className="text-red-500 cursor-pointer">
          <Trash2 size={16} />
        </button>
      </div>

      {options.map((option) => (
        <div key={option.id} className="flex items-center justify-between text-sm pl-2">
          <span>{option.nombre}</span>
          <span className="flex items-center gap-2">
            <span className="text-stone-500">{option.precio.toFixed(2)} €</span>
            <button
              type="button"
              onClick={() => deleteOption.mutate({ optionId: option.id, dishId })}
              className="text-stone-400 cursor-pointer"
            >
              <Trash2 size={14} />
            </button>
          </span>
        </div>
      ))}

      <div className="flex gap-2 mt-1">
        <input
          className="border border-stone-300 rounded-lg px-2 py-1.5 text-sm flex-1"
          placeholder="Nom de l'opció"
          value={optName}
          onChange={(e) => setOptName(e.target.value)}
          onKeyDown={preventEnterSubmit}
        />
        <input
          className="border border-stone-300 rounded-lg px-2 py-1.5 text-sm w-20"
          placeholder="Preu"
          type="number"
          step="0.01"
          min="0"
          value={optPrice}
          onChange={(e) => setOptPrice(e.target.value)}
          onKeyDown={preventEnterSubmit}
        />
        <button
          type="button"
          onClick={addOption}
          className="bg-accent text-white rounded-lg px-3 text-sm cursor-pointer"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default DishModifiersSection;
