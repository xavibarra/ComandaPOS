import { Badge } from "./Badge";

type Dish = { id: string; nombre: string; precio: number; stock: number };

export function DishCard({
  dish,
  onClick,
  sentQuantity,
  pendingQuantity,
}: {
  dish: Dish;
  onClick: () => void;
  sentQuantity: number;
  pendingQuantity: number;
}) {
  return (
    <div className="bg-white rounded-xl p-3 border border-stone-200 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-sm">{dish.nombre}</h3>
        <p className="text-stone-700 text-sm font-medium shrink-0">{dish.precio.toFixed(2)} €</p>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {sentQuantity && (
            <p className="text-xs text-stone-500">✓ {sentQuantity} enviat</p>
          )}
          {pendingQuantity && (
            <p className="text-xs text-accent font-medium">● {pendingQuantity} nou</p>
          )}
          {dish.stock <= 5 && (
            <Badge color={dish.stock === 0 ? "red" : "yellow"}>
              {dish.stock === 0
                ? "Esgotat"
                : dish.stock === 1
                  ? `Queden ${dish.stock} unitat`
                  : `Queden ${dish.stock} unitats`}
            </Badge>
          )}
        </div>
        <button
          className="bg-accent w-7 h-7 text-white rounded-full flex items-center justify-center shrink-0"
          onClick={onClick}
        >
          +
        </button>
      </div>
    </div>
  );
}

export default DishCard;
