import { useState } from "react";
import Modal from "../Modal";

export type ExtraOption = { id: string; nombre: string; precio: number; orden: number };
export type VarianteOption = { id: string; nombre: string; precio: number; orden: number };
export type VarianteGroup = {
  id: string;
  nombre: string;
  obligatorio: boolean;
  orden: number;
  plato_variante_opciones: VarianteOption[];
};
export type CustomizableDish = {
  id: string;
  nombre: string;
  precio: number;
  extras?: ExtraOption[];
  categorias?: { extras?: ExtraOption[] } | null;
  plato_variante_grupos?: VarianteGroup[];
};

function DishModifiersModal({
  dish,
  onClose,
  onAdd,
}: {
  dish: CustomizableDish;
  onClose: () => void;
  onAdd: (unitPrice: number, modifiers: { nombre: string; precio: number }[]) => void;
}) {
  const extras = [...(dish.extras ?? []), ...(dish.categorias?.extras ?? [])].sort(
    (a, b) => a.orden - b.orden,
  );
  const groups = [...(dish.plato_variante_grupos ?? [])].sort((a, b) => a.orden - b.orden);

  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [customExtras, setCustomExtras] = useState<{ nombre: string; precio: number }[]>([]);
  const [customName, setCustomName] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [error, setError] = useState<string | null>(null);

  const toggleExtra = (extraId: string) => {
    setSelectedExtras((current) =>
      current.includes(extraId) ? current.filter((id) => id !== extraId) : [...current, extraId],
    );
  };

  const addCustomExtra = () => {
    if (!customName || !customPrice) return;
    setCustomExtras((current) => [...current, { nombre: customName, precio: Number(customPrice) }]);
    setCustomName("");
    setCustomPrice("");
  };

  const removeCustomExtra = (index: number) => {
    setCustomExtras((current) => current.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    for (const group of groups) {
      if (group.obligatorio && !selectedVariants[group.id]) {
        setError(`Cal triar una opció a "${group.nombre}"`);
        return;
      }
    }

    let unitPrice = dish.precio;
    const modifiers: { nombre: string; precio: number }[] = [];

    for (const group of groups) {
      const optionId = selectedVariants[group.id];
      if (!optionId) continue;
      const option = group.plato_variante_opciones.find((o) => o.id === optionId);
      if (!option) continue;
      unitPrice = option.precio;
      modifiers.push({ nombre: option.nombre, precio: option.precio });
    }

    for (const extraId of selectedExtras) {
      const extra = extras.find((e) => e.id === extraId);
      if (!extra) continue;
      unitPrice += extra.precio;
      modifiers.push({ nombre: extra.nombre, precio: extra.precio });
    }

    for (const custom of customExtras) {
      unitPrice += custom.precio;
      modifiers.push(custom);
    }

    onAdd(unitPrice, modifiers);
  };

  return (
    <Modal onClose={onClose}>
      <h2 className="text-center text-xl font-bold mb-1">{dish.nombre}</h2>
      <p className="text-center text-sm text-stone-500 mb-4">Personalitza el plat</p>
      <div className="flex flex-col gap-4">
        {groups.map((group) => (
          <div key={group.id}>
            <p className="font-medium text-sm mb-2">
              {group.nombre}
              {group.obligatorio && <span className="text-red-500"> *</span>}
            </p>
            <div className="flex flex-col gap-1">
              {[...group.plato_variante_opciones]
                .sort((a, b) => a.orden - b.orden)
                .map((option) => (
                  <label
                    key={option.id}
                    className="flex items-center justify-between gap-2 border border-stone-200 rounded-lg px-3 py-2 cursor-pointer has-checked:border-accent has-checked:bg-accent/5"
                  >
                    <span className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name={group.id}
                        checked={selectedVariants[group.id] === option.id}
                        onChange={() => {
                          setSelectedVariants((current) => ({ ...current, [group.id]: option.id }));
                          setError(null);
                        }}
                      />
                      {option.nombre}
                    </span>
                    <span className="text-sm text-stone-500 shrink-0">
                      {option.precio.toFixed(2)} €
                    </span>
                  </label>
                ))}
            </div>
          </div>
        ))}

        {(extras.length > 0 || customExtras.length > 0) && (
          <div>
            <p className="font-medium text-sm mb-2">Extres</p>
            <div className="flex flex-col gap-1">
              {extras.map((extra) => (
                <label
                  key={extra.id}
                  className="flex items-center justify-between gap-2 border border-stone-200 rounded-lg px-3 py-2 cursor-pointer has-checked:border-accent has-checked:bg-accent/5"
                >
                  <span className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedExtras.includes(extra.id)}
                      onChange={() => toggleExtra(extra.id)}
                    />
                    {extra.nombre}
                  </span>
                  <span className="text-sm text-stone-500 shrink-0">+{extra.precio.toFixed(2)} €</span>
                </label>
              ))}
              {customExtras.map((custom, index) => (
                <div
                  key={`custom-${index}`}
                  className="flex items-center justify-between gap-2 border border-accent/30 bg-accent/5 rounded-lg px-3 py-2"
                >
                  <span className="text-sm">{custom.nombre}</span>
                  <span className="flex items-center gap-2 text-sm text-stone-500 shrink-0">
                    +{custom.precio.toFixed(2)} €
                    <button
                      type="button"
                      onClick={() => removeCustomExtra(index)}
                      className="text-stone-400 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <p className="text-xs text-stone-400">Afegeix un extra al moment (nom i preu lliures)</p>
          <div className="flex gap-2">
            <input
              className="border border-stone-300 rounded-lg px-2 py-1.5 text-sm flex-1"
              placeholder="Nom"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
            />
            <input
              className="border border-stone-300 rounded-lg px-2 py-1.5 text-sm w-20"
              placeholder="Preu"
              type="number"
              step="0.01"
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
            />
            <button
              type="button"
              onClick={addCustomExtra}
              className="bg-stone-200 text-stone-700 rounded-lg px-3 text-sm cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          onClick={handleAdd}
          className="bg-accent text-white rounded-xl py-2 font-medium cursor-pointer"
        >
          Afegeix
        </button>
      </div>
    </Modal>
  );
}

export default DishModifiersModal;
