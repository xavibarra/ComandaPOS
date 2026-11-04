import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Badge from "../../../components/Badge";
import Header from "../../../components/Header";
import Modal from "../../waiter/Modal";
import { useCategories } from "../../waiter/order/useCategories";
import { useAdminDishes } from "./useAdminDishes";
import { useCreateDish } from "./useCreateDish";
import { useUpdateDish } from "./useUpdateDish";

type DishForm = {
  nombre: string;
  precio: string;
  categoria_id: string;
  stock: string;
  imprime_a_cocina: boolean;
};

const emptyForm: DishForm = {
  nombre: "",
  precio: "",
  categoria_id: "",
  stock: "0",
  imprime_a_cocina: true,
};

function DishesAdminPage() {
  const { data: dishes } = useAdminDishes();
  const { data: categories } = useCategories();
  const createDish = useCreateDish();
  const updateDish = useUpdateDish();
  const navigate = useNavigate();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<DishForm>(emptyForm);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (dish: {
    id: string;
    nombre: string;
    precio: number;
    categoria_id: string;
    stock: number;
    imprime_a_cocina: boolean;
  }) => {
    setEditingId(dish.id);
    setForm({
      nombre: dish.nombre,
      precio: String(dish.precio),
      categoria_id: dish.categoria_id,
      stock: String(dish.stock),
      imprime_a_cocina: dish.imprime_a_cocina,
    });
    setFormOpen(true);
  };

  const dishesByCategory = categories?.map((category) => ({
    category,
    dishes: dishes?.filter((dish) => dish.categoria_id === category.id) ?? [],
  }));

  const outOfStockCount = dishes?.filter((dish) => dish.activo && dish.stock === 0).length ?? 0;
  const lowStockCount =
    dishes?.filter((dish) => dish.activo && dish.stock > 0 && dish.stock <= 5).length ?? 0;

  return (
    <div>
      <Header
        title="Plats"
        onBack={() => navigate("/admin")}
        rightContent={
          <button
            onClick={() => navigate("/admin/categories")}
            className="bg-white text-accent px-3 py-2 rounded-lg text-sm font-medium cursor-pointer"
          >
            Categories
          </button>
        }
      />
      <div className="p-4 max-w-2xl mx-auto flex flex-col gap-4">
        {(outOfStockCount > 0 || lowStockCount > 0) && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 text-sm">
            {outOfStockCount > 0 && (
              <p>
                {outOfStockCount} plat{outOfStockCount > 1 ? "s" : ""} esgotat
                {outOfStockCount > 1 ? "s" : ""}.
              </p>
            )}
            {lowStockCount > 0 && (
              <p>
                {lowStockCount} plat{lowStockCount > 1 ? "s" : ""} amb estoc baix.
              </p>
            )}
          </div>
        )}
        <button
          onClick={openCreate}
          className="bg-accent text-white rounded-xl py-3 font-medium cursor-pointer"
        >
          + Afegeix un plat
        </button>

        {dishesByCategory?.map(({ category, dishes: categoryDishes }) => (
          <div key={category.id}>
            <h2 className="font-bold text-stone-500 text-sm uppercase mb-2">{category.nombre}</h2>
            <div className="flex flex-col gap-2">
              {categoryDishes.map((dish) => (
                <div
                  key={dish.id}
                  className="bg-white rounded-xl p-4 border border-stone-200 flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="font-medium">{dish.nombre}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-sm text-stone-500">{dish.precio.toFixed(2)} €</span>
                      <Badge
                        color={dish.stock === 0 ? "red" : dish.stock <= 5 ? "yellow" : "green"}
                      >
                        Estoc: {dish.stock}
                      </Badge>
                      {!dish.imprime_a_cocina && <Badge color="yellow">No imprimeix</Badge>}
                      {!dish.activo && <Badge color="red">Desactivat</Badge>}
                    </div>
                  </div>
                  <div className="flex gap-3 shrink-0">
                    <button
                      className="text-sm text-stone-500 cursor-pointer"
                      onClick={() => openEdit(dish)}
                    >
                      Editar
                    </button>
                    <button
                      className="text-sm text-stone-500 cursor-pointer"
                      onClick={() =>
                        updateDish.mutate({
                          dishId: dish.id,
                          changes: { activo: !dish.activo },
                        })
                      }
                    >
                      {dish.activo ? "Desactivar" : "Activar"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {formOpen && (
        <Modal onClose={() => setFormOpen(false)}>
          <h2 className="text-center text-xl font-bold mb-4">
            {editingId ? "Editar plat" : "Nou plat"}
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const changes = {
                nombre: form.nombre,
                precio: Number(form.precio),
                categoria_id: form.categoria_id,
                stock: Number(form.stock),
                imprime_a_cocina: form.imprime_a_cocina,
              };
              if (editingId) {
                updateDish.mutate(
                  { dishId: editingId, changes },
                  { onSuccess: () => setFormOpen(false) },
                );
              } else {
                createDish.mutate(changes, { onSuccess: () => setFormOpen(false) });
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
            <input
              className="border border-stone-300 rounded-lg px-3 py-2"
              placeholder="Preu"
              type="number"
              step="0.01"
              min="0"
              value={form.precio}
              onChange={(e) => setForm({ ...form, precio: e.target.value })}
              required
            />
            <select
              className="border border-stone-300 rounded-lg px-3 py-2"
              value={form.categoria_id}
              onChange={(e) => setForm({ ...form, categoria_id: e.target.value })}
              required
            >
              <option value="" disabled>
                Categoria
              </option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.nombre}
                </option>
              ))}
            </select>
            <input
              className="border border-stone-300 rounded-lg px-3 py-2"
              placeholder="Estoc inicial"
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              required
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.imprime_a_cocina}
                onChange={(e) => setForm({ ...form, imprime_a_cocina: e.target.checked })}
              />
              Imprimeix tiquet a cuina
            </label>
            <button
              type="submit"
              className="bg-accent text-white rounded-xl py-2 font-medium mt-2 cursor-pointer"
            >
              {editingId ? "Guardar" : "Crear"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default DishesAdminPage;
