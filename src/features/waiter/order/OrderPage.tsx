import { useNavigate, useParams } from "react-router-dom";
import { listPrinters, printBillTicket, printKitchenTicket } from "../../../lib/qz";
import { useAddLine } from "./useAddLine";
import { useCategories } from "./useCategories";
import { useChargeOrder } from "./useChargeOrder";
import { useDishes } from "./useDishes";
import { useOrder } from "./useOrder";
import { useOrderLines } from "./useOrderLines";
import { useOrderTables } from "./useOrderTables";
import { useRemoveUnit } from "./useRemoveUnit";
import { useRequestBill } from "./useRequestBill";
import { useSendToKitchen } from "./useSendToKitchen";
function OrderPage() {
  const { orderId } = useParams();
  const { data: dishes } = useDishes();
  const { data: categories } = useCategories();
  const addLine = useAddLine();
  const { data: lines } = useOrderLines(orderId!);
  const removeUnit = useRemoveUnit();
  const sendToKitchen = useSendToKitchen();
  const { data: orderTables } = useOrderTables(orderId!);
  const { data: order } = useOrder(orderId!);
  const requestBill = useRequestBill();
  const chargeOrder = useChargeOrder();
  const navigate = useNavigate();
  const total = lines?.reduce((a, b) => a + b.platos.precio * b.cantidad, 0) ?? 0;
  const tableNames = orderTables?.map((m) => m.mesas.nombre);
  return (
    <div>
      <h1>Comanda</h1>
      <p>
        Comanda: {orderId} - {order?.numero}
      </p>
      {categories?.map((category) => (
        <div key={category.id}>
          <h2>{category.nombre}</h2>
          <ul>
            {dishes
              ?.filter((dish) => dish.categorias.id === category.id)
              .map((dish) => (
                <li
                  onClick={() => {
                    addLine.mutate({
                      orderId: orderId!,
                      dish: { id: dish.id, precio: dish.precio },
                    });
                  }}
                  key={dish.id}
                >
                  {dish.nombre}
                </li>
              ))}
          </ul>
        </div>
      ))}
      <h1>Pedidos</h1>
      <ul>
        {lines?.map((line) => (
          <li key={line.id}>
            {line.platos.nombre} - {line.cantidad} -{" "}
            {line.enviado_a_cocina ? "Enviat" : "Pendent"}
            {!line.enviado_a_cocina && (
              <button
                onClick={() => {
                  removeUnit.mutate({
                    lineId: line.id,
                    currentQuantity: line.cantidad,
                    orderId: orderId!,
                  });
                }}
              >
                Quitar una unidad
              </button>
            )}
          </li>
        ))}
      </ul>
      {lines?.some((line) => !line.enviado_a_cocina) && (
        <button
          onClick={async () => {
            const linesToPrint = lines
              ?.filter((l) => !l.enviado_a_cocina && l.platos.imprime_a_cocina)
              .sort((a, b) => a.platos.categorias.orden - b.platos.categorias.orden)
              .map((l) => ({ nombre: l.platos.nombre, cantidad: l.cantidad }));
            sendToKitchen.mutate({
              orderId: orderId!,
            });
            await printKitchenTicket(
              "Cocina",
              order?.numero ?? 0,
              tableNames ?? [],
              linesToPrint ?? [],
            );
          }}
        >
          Enviar a cocina
        </button>
      )}
      <button
        onClick={async () => {
          try {
            const printers = await listPrinters();
            console.log("Impresoras encontradas:", printers);
          } catch (err) {
            console.error("Error conectando con QZ Tray:", err);
          }
        }}
      >
        Probar impresora
      </button>
      <h2>Total: {total}€</h2>
      <button
        onClick={async () => {
          requestBill.mutate({ orderId: orderId! });
          const linesForBill = lines?.map((l) => ({
            nombre: l.platos.nombre,
            cantidad: l.cantidad,
            precio: l.platos.precio,
          }));
          await printBillTicket(
            "Cocina",
            order?.numero ?? 0,
            tableNames ?? [],
            linesForBill ?? [],
            total,
          );
        }}
      >
        Imprimir Cuenta
      </button>
      <button
        onClick={() => {
          chargeOrder.mutate(
            { orderId: orderId! },
            {
              onSuccess: () => {
                navigate(`/waiter`);
              },
            },
          );
        }}
      >
        Cobrar comanda
      </button>
    </div>
  );
}

export default OrderPage;
