import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/Header";
import { useCategories } from "../../waiter/order/useCategories";
import { useCategoriesForBar } from "../../waiter/order/useCategoriesForBar";
import { useCreateCategory } from "./useCreateCategory";
import { useDeleteCategory } from "./useDeleteCategory";
import { useReorderCategory } from "./useReorderCategory";

type Category = { id: string; nombre: string; orden: number; orden_barra: number };

function CategoriesAdminPage() {
  const { data: tableCategories } = useCategories();
  const { data: barCategories } = useCategoriesForBar();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  const reorderCategory = useReorderCategory();
  const navigate = useNavigate();

  const [newName, setNewName] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const move = (
    list: Category[] | undefined,
    index: number,
    direction: -1 | 1,
    field: "orden" | "orden_barra",
  ) => {
    if (!list) return;
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const current = list[index];
    const target = list[targetIndex];
    reorderCategory.mutate({
      field,
      categoryId: current.id,
      newValue: target[field],
      swapWithId: target.id,
      swapWithValue: current[field],
    });
  };

  return (
    <div>
      <Header title="Categories" onBack={() => navigate("/admin/dishes")} />
      <div className="p-4 max-w-md mx-auto flex flex-col gap-8">
        <section className="flex flex-col gap-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const nextOrder = (tableCategories?.at(-1)?.orden ?? 0) + 1;
              createCategory.mutate(
                { nombre: newName, orden: nextOrder },
                { onSuccess: () => setNewName("") },
              );
            }}
            className="flex gap-2"
          >
            <input
              className="border border-stone-300 rounded-lg px-3 py-2 flex-1"
              placeholder="Nova categoria"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-accent text-white rounded-lg px-4 font-medium cursor-pointer"
            >
              Afegeix
            </button>
          </form>
          {deleteError && <p className="text-sm text-red-600">{deleteError}</p>}
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-bold text-stone-500 text-sm uppercase">Ordre a les taules</h2>
          {tableCategories?.map((category, index) => (
            <CategoryRow
              key={category.id}
              name={category.nombre}
              upDisabled={index === 0}
              downDisabled={index === tableCategories.length - 1}
              onUp={() => move(tableCategories, index, -1, "orden")}
              onDown={() => move(tableCategories, index, 1, "orden")}
              onDelete={() => {
                setDeleteError(null);
                deleteCategory.mutate(category.id, {
                  onError: () =>
                    setDeleteError(
                      "No es pot esborrar: encara hi ha plats amb aquesta categoria.",
                    ),
                });
              }}
            />
          ))}
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-bold text-stone-500 text-sm uppercase">Ordre a la barra</h2>
          <p className="text-xs text-stone-400">
            Només canvia l'ordre a la pantalla de Barra — a les taules es manté l'ordre de dalt.
          </p>
          {barCategories?.map((category, index) => (
            <CategoryRow
              key={category.id}
              name={category.nombre}
              upDisabled={index === 0}
              downDisabled={index === barCategories.length - 1}
              onUp={() => move(barCategories, index, -1, "orden_barra")}
              onDown={() => move(barCategories, index, 1, "orden_barra")}
            />
          ))}
        </section>
      </div>
    </div>
  );
}

function CategoryRow({
  name,
  upDisabled,
  downDisabled,
  onUp,
  onDown,
  onDelete,
}: {
  name: string;
  upDisabled: boolean;
  downDisabled: boolean;
  onUp: () => void;
  onDown: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="bg-white rounded-xl p-3 border border-stone-200 flex items-center justify-between gap-3">
      <span className="font-medium">{name}</span>
      <div className="flex items-center gap-1">
        <button
          className="p-1 text-stone-400 disabled:opacity-30 cursor-pointer"
          disabled={upDisabled}
          onClick={onUp}
        >
          <ChevronUp size={18} />
        </button>
        <button
          className="p-1 text-stone-400 disabled:opacity-30 cursor-pointer"
          disabled={downDisabled}
          onClick={onDown}
        >
          <ChevronDown size={18} />
        </button>
        {onDelete && (
          <button className="text-sm text-red-500 ml-2 cursor-pointer" onClick={onDelete}>
            Esborrar
          </button>
        )}
      </div>
    </div>
  );
}

export default CategoriesAdminPage;
