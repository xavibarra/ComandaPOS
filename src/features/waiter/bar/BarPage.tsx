import { Beer, LogOut } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/Header";
import { tableStateStyles } from "../../../lib/tableStates";
import { useSessionStore } from "../../auth/sessionStore";
import OrderPage from "../order/OrderPage";
import { useCreateOrder } from "../tables/useCreateOrder";
import type { PreviewLine } from "./useBarTables";
import { useBarTables } from "./useBarTables";

function BarPage() {
  const { data: tabs } = useBarTables();
  const createOrder = useCreateOrder();
  const navigate = useNavigate();
  const endSession = useSessionStore((state) => state.endSession);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const openTab = (tab: { id: string; estado: string; orderId: string | null }) => {
    if (tab.estado === "libre") {
      createOrder.mutate(
        { tableIds: [tab.id], guests: 1 },
        { onSuccess: (orderId) => setSelectedOrderId(orderId) },
      );
      return;
    }
    if (tab.orderId) setSelectedOrderId(tab.orderId);
  };

  return (
    <div className="h-dvh flex flex-col">
      <Header
        title="Barra"
        className="bg-stone-900"
        icon={<Beer className="text-white" size={22} />}
        onBack={() => navigate("/waiter")}
        rightContent={
          <button
            onClick={() => {
              endSession();
              navigate("/");
            }}
            title="Tancar sessió"
            className="bg-white/20 text-white p-2 rounded-lg cursor-pointer"
          >
            <LogOut size={18} />
          </button>
        }
      />
      <div className="flex-1 flex overflow-hidden">
        <div
          className={`w-full lg:w-80 shrink-0 lg:border-r border-stone-200 overflow-y-auto p-3 grid grid-cols-2 gap-3 content-start ${
            selectedOrderId ? "hidden lg:grid" : "grid"
          }`}
        >
          {tabs?.map((tab) => {
            const style = tableStateStyles[tab.estado];
            const selected = tab.orderId !== null && tab.orderId === selectedOrderId;
            return (
              <button
                key={tab.id}
                onClick={() => openTab(tab)}
                className={`rounded-xl border-2 p-3 flex flex-col gap-1.5 text-left cursor-pointer transition-colors ${
                  selected
                    ? "border-accent bg-accent/5"
                    : "border-stone-200 bg-white hover:border-stone-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold">{tab.nombre}</span>
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${style?.dot ?? "bg-stone-300"}`}
                  />
                </div>
                {tab.previewLines.length > 0 ? (
                  <p className="text-xs text-stone-500 leading-snug line-clamp-3">
                    {tab.previewLines
                      .map((l: PreviewLine) => `${l.cantidad} ${l.nombre}`)
                      .join(", ")}
                  </p>
                ) : (
                  <p className="text-xs text-stone-400">{style?.label ?? tab.estado}</p>
                )}
              </button>
            );
          })}
        </div>
        <div className={`flex-1 overflow-hidden ${selectedOrderId ? "block" : "hidden lg:block"}`}>
          {selectedOrderId ? (
            <OrderPage orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />
          ) : (
            <div className="h-full hidden lg:flex items-center justify-center text-stone-400">
              Selecciona una barra
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BarPage;
