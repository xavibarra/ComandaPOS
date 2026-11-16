import { Check, ChevronDown, Minus, Printer, StickyNote } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "../../../components/Badge";
import { DishCard } from "../../../components/DishCard";
import { Header } from "../../../components/Header";
import { printBillTicket, printKitchenTicket } from "../../../lib/qz";
import { useRestaurantSettings } from "../../../lib/useRestaurantSettings";
import DishModifiersModal, { type CustomizableDish } from "./DishModifiersModal";
import { useAddLine } from "./useAddLine";
import { useCancelEmptyOrder } from "./useCancelEmptyOrder";
import { useCategories } from "./useCategories";
import { useCategoriesForBar } from "./useCategoriesForBar";
import { useChargeOrder } from "./useChargeOrder";
import { useDishes } from "./useDishes";
import { useOrder } from "./useOrder";
import { useOrderLines } from "./useOrderLines";
import { useOrderTables } from "./useOrderTables";
import { useRemoveUnit } from "./useRemoveUnit";
import { useRequestBill } from "./useRequestBill";
import { useSendToKitchen } from "./useSendToKitchen";
import { useUpdateLineNote } from "./useUpdateLineNote";

function OrderPage({
  orderId: orderIdProp,
  onClose,
}: { orderId?: string; onClose?: () => void } = {}) {
  const params = useParams();
  const orderId = orderIdProp ?? params.orderId;
  const { data: dishes } = useDishes();
  const { data: orderTables } = useOrderTables(orderId!);
  const isBarOrder = orderTables?.some((t) => t.mesas.es_barra) ?? false;
  const { data: tableCategories } = useCategories();
  const { data: barCategories } = useCategoriesForBar({ enabled: isBarOrder });
  const categories = isBarOrder ? barCategories : tableCategories;
  const addLine = useAddLine();
  const { data: lines } = useOrderLines(orderId!);
  const [ticketOpen, setTicketOpen] = useState(false);
  const [modifierDish, setModifierDish] = useState<CustomizableDish | null>(null);
  const [editingNoteFor, setEditingNoteFor] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const updateLineNote = useUpdateLineNote();
  const removeUnit = useRemoveUnit();
  const sendToKitchen = useSendToKitchen();
  const { data: order } = useOrder(orderId!);
  const { data: restaurantSettings } = useRestaurantSettings();
  const requestBill = useRequestBill();
  const chargeOrder = useChargeOrder();
  const cancelEmptyOrder = useCancelEmptyOrder();
  const navigate = useNavigate();
  const total = lines?.reduce((a, b) => a + b.precio_unitario * b.cantidad, 0) ?? 0;
  const tableNames = orderTables?.map((m) => m.mesas.nombre);
  const sentLines = lines?.filter((l) => l.enviado_a_cocina) ?? [];
  const pendingLines = lines?.filter((l) => !l.enviado_a_cocina) ?? [];
  const pendingUnits = pendingLines.reduce((a, l) => a + l.cantidad, 0);

  const printBill = async () => {
    const linesForBill = lines?.map((l) => ({
      nombre: l.platos.nombre,
      cantidad: l.cantidad,
      precio: l.precio_unitario,
      modificadores: [
        ...(l.comanda_linea_modificadores?.map((m: { nombre: string }) => m.nombre) ?? []),
        ...(l.nota ? [`Nota: ${l.nota}`] : []),
      ],
    }));
    await printBillTicket({
      printerName: "Cocina",
      restaurantName: restaurantSettings?.nombre ?? "",
      number: order?.numero ?? 0,
      tables: tableNames ?? [],
      waiterName: order?.camareros?.nombre ?? "",
      guests: order?.comensales ?? 1,
      lines: linesForBill ?? [],
      total,
    });
  };

  const handleSendToKitchen = async () => {
    const linesToPrint = lines
      ?.filter((l) => !l.enviado_a_cocina && l.platos.imprime_a_cocina)
      .sort((a, b) => a.platos.categorias.orden - b.platos.categorias.orden)
      .map((l) => ({
        nombre: l.platos.nombre,
        cantidad: l.cantidad,
        modificadores: [
          ...(l.comanda_linea_modificadores?.map((m: { nombre: string }) => m.nombre) ?? []),
          ...(l.nota ? [`Nota: ${l.nota}`] : []),
        ],
      }));
    sendToKitchen.mutate({ orderId: orderId! });
    await printKitchenTicket("Cocina", order?.numero ?? 0, tableNames ?? [], linesToPrint ?? []);
  };

  const handleCharge = () => {
    chargeOrder.mutate(
      { orderId: orderId! },
      {
        onSuccess: () => {
          if (onClose) onClose();
          else navigate(isBarOrder ? "/bar" : "/waiter");
        },
      },
    );
  };

  return (
    <div className={`${onClose ? "h-full" : "h-dvh"} overflow-hidden flex flex-col`}>
      <Header
        title={`${tableNames?.join(" + ") ?? ""} · ${order?.comensales ?? 0} ${order?.comensales === 1 ? "comensal" : "comensales"}`}
        subtitle={`Camarero: ${order?.camareros?.nombre}`}
        onBack={async () => {
          if (order?.estado === "abierta" && (lines?.length ?? 0) === 0) {
            await cancelEmptyOrder.mutateAsync({ orderId: orderId! });
          }
          if (onClose) onClose();
          else navigate(-1);
        }}
        rightContent={
          <Badge
            color={
              order?.estado === "abierta" ? "green" : order?.estado === "cobrada" ? "yellow" : "red"
            }
          >
            {order?.estado}
          </Badge>
        }
      />
      <div className="min-h-0 grid grid-cols-1 lg:grid-cols-[1fr_320px] flex-1">
        <div className="p-6 pb-28 lg:pb-6 overflow-y-auto min-h-0 my-scroll">
          {categories?.map((category) => (
            <div className="mb-4" key={category.id}>
              <h2 className="uppercase mb-2 font-light text-lg">{category.nombre}</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {dishes
                  ?.filter((dish) => dish.categorias.id === category.id)
                  .map((dish) => {
                    const sentLine = lines?.find(
                      (l) => l.plato_id === dish.id && l.enviado_a_cocina,
                    );
                    const pendingLine = lines?.find(
                      (l) => l.plato_id === dish.id && !l.enviado_a_cocina,
                    );
                    const hasRequiredVariant =
                      dish.plato_variante_grupos?.some(
                        (g: { obligatorio: boolean }) => g.obligatorio,
                      ) ?? false;
                    return (
                      <DishCard
                        key={dish.id}
                        dish={dish}
                        sentQuantity={sentLine?.cantidad}
                        pendingQuantity={pendingLine?.cantidad}
                        onCustomize={() => setModifierDish(dish)}
                        onClick={() => {
                          if (hasRequiredVariant) {
                            setModifierDish(dish);
                            return;
                          }
                          addLine.mutate({
                            orderId: orderId!,
                            dish: { id: dish.id, precio: dish.precio },
                          });
                        }}
                      />
                    );
                  })}
              </div>
            </div>
          ))}
        </div>

        <div
          className={`bg-white lg:border-l lg:border-stone-200 overflow-y-auto min-h-0 my-scroll flex-col justify-between fixed inset-0 lg:static lg:h-full z-50 ${ticketOpen ? "flex" : "hidden"} lg:flex`}
        >
          <div className="p-5 flex flex-col gap-4">
            <div className="flex justify-between">
              <h2 className="font-bold text-lg">Tiquet</h2>
              <button
                className="lg:hidden bg-accent text-white px-2 py-2 rounded-lg hover:bg-accent/90 cursor-pointer"
                onClick={() => {
                  setTicketOpen(false);
                }}
              >
                <ChevronDown size={18} />
              </button>
            </div>

            {sentLines.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 uppercase tracking-wide">
                  <Check size={14} className="text-green-600" />
                  Enviat a cuina
                </p>
                {sentLines.map((line) => (
                  <div key={line.id} className="flex items-center justify-between text-sm">
                    <span className="text-stone-800">
                      {line.platos.nombre}
                      {line.comanda_linea_modificadores?.length > 0 && (
                        <span className="block text-xs text-stone-400">
                          {line.comanda_linea_modificadores
                            .map((m: { nombre: string }) => m.nombre)
                            .join(", ")}
                        </span>
                      )}
                      {line.nota && (
                        <span className="block text-xs text-stone-400 italic">{line.nota}</span>
                      )}
                    </span>
                    <span className="flex gap-3 text-stone-600">
                      <span>{line.cantidad}</span>
                      <span className="w-16 text-right">
                        {(line.cantidad * line.precio_unitario).toFixed(2)} €
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            )}

            {pendingLines.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-accent uppercase tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
                  Nou · pendent d'enviar
                </p>
                {pendingLines.map((line) => (
                  <div key={line.id} className="flex flex-col gap-1 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-800">
                        {line.platos.nombre}
                        {line.comanda_linea_modificadores?.length > 0 && (
                          <span className="block text-xs text-stone-400">
                            {line.comanda_linea_modificadores
                              .map((m: { nombre: string }) => m.nombre)
                              .join(", ")}
                          </span>
                        )}
                      </span>
                      <span className="flex items-center gap-2 text-stone-600">
                        <button
                          onClick={() => {
                            setEditingNoteFor(editingNoteFor === line.id ? null : line.id);
                            setNoteDraft(line.nota ?? "");
                          }}
                          title="Afegeix una nota"
                          className={`w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer hover:bg-stone-100 ${
                            line.nota ? "border-accent text-accent" : "border-stone-300 text-stone-400"
                          }`}
                        >
                          <StickyNote size={11} />
                        </button>
                        <button
                          onClick={() => {
                            removeUnit.mutate({
                              lineId: line.id,
                              currentQuantity: line.cantidad,
                              orderId: orderId!,
                            });
                          }}
                          className="w-5 h-5 rounded-full border border-stone-300 text-stone-500 flex items-center justify-center hover:bg-stone-100 cursor-pointer"
                        >
                          <Minus size={12} />
                        </button>
                        <span>{line.cantidad}</span>
                        <span className="w-16 text-right">
                          {(line.cantidad * line.precio_unitario).toFixed(2)} €
                        </span>
                      </span>
                    </div>

                    {editingNoteFor === line.id ? (
                      <input
                        autoFocus
                        className="border border-stone-300 rounded-lg px-2 py-1 text-xs"
                        placeholder="p. ex. sense sal"
                        value={noteDraft}
                        onChange={(e) => setNoteDraft(e.target.value)}
                        onBlur={() => {
                          updateLineNote.mutate({ lineId: line.id, nota: noteDraft, orderId: orderId! });
                          setEditingNoteFor(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") e.currentTarget.blur();
                        }}
                      />
                    ) : (
                      line.nota && <p className="text-xs text-stone-400 italic">{line.nota}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {lines?.length === 0 && (
              <p className="text-sm text-stone-400">Encara no s'ha afegit cap plat.</p>
            )}

            <div className="border-t border-stone-200 pt-3 flex items-center justify-between">
              <span className="font-bold">Total</span>
              <span className="font-bold text-lg">{total.toFixed(2)} €</span>
            </div>
          </div>

          <div className="p-5 pt-0 flex flex-col gap-2">
            {pendingLines.length > 0 && (
              <button
                onClick={handleSendToKitchen}
                className="bg-accent text-white rounded-xl py-3 flex flex-col items-center gap-0.5 cursor-pointer hover:bg-accent-dark"
              >
                <span className="font-bold text-sm">Enviar els plats nous a cuina</span>
                <span className="text-xs text-white/80">
                  Només s'envien les {pendingUnits} unitats pendents
                </span>
              </button>
            )}
            {order?.estado === "abierta" ? (
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    requestBill.mutate({ orderId: orderId! });
                    await printBill();
                  }}
                  className="flex-1 border border-stone-300 text-stone-700 rounded-xl py-2 text-sm font-medium cursor-pointer hover:bg-stone-50"
                >
                  Imprimir Cuenta
                </button>
                <button
                  onClick={handleCharge}
                  className="flex-1 bg-accent text-white rounded-xl py-2 text-sm font-medium cursor-pointer hover:bg-accent-dark"
                >
                  Cobrar sense imprimir
                </button>
              </div>
            ) : order?.estado === "cuenta_pedida" ? (
              <div className="flex gap-2">
                <button
                  onClick={handleCharge}
                  className="flex-1 border border-stone-300 text-stone-700 rounded-xl py-2 text-sm font-medium cursor-pointer hover:bg-stone-50"
                >
                  Cobrar comanda
                </button>
                <button
                  onClick={printBill}
                  title="Volver a imprimir la cuenta"
                  className="w-10 border border-stone-300 text-stone-500 rounded-xl flex items-center justify-center cursor-pointer hover:bg-stone-50"
                >
                  <Printer size={16} />
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {!ticketOpen && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-stone-200 p-4 flex flex-col gap-2">
            <button
              onClick={() => setTicketOpen(true)}
              className="flex items-center justify-between text-sm cursor-pointer"
            >
              <span className="text-stone-500">{lines?.length ?? 0} línies al tiquet</span>
              <span className="font-bold text-lg text-stone-900">{total.toFixed(2)} €</span>
            </button>
            {pendingLines.length > 0 && (
              <button
                onClick={handleSendToKitchen}
                className="bg-accent text-white rounded-xl py-3 font-bold cursor-pointer hover:bg-accent-dark"
              >
                Enviar a cuina
              </button>
            )}
          </div>
        )}
      </div>

      {modifierDish && (
        <DishModifiersModal
          dish={modifierDish}
          onClose={() => setModifierDish(null)}
          onAdd={(unitPrice, modifiers) => {
            addLine.mutate({
              orderId: orderId!,
              dish: { id: modifierDish.id, precio: unitPrice },
              modifiers,
            });
            setModifierDish(null);
          }}
        />
      )}
    </div>
  );
}

export default OrderPage;
