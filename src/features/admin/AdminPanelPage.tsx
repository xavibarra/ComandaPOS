import { LogOut } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import { useSessionStore } from "../auth/sessionStore";
import { useWaiters } from "../auth/useWaiters";

function AdminPanelPage() {
  const [waiterModeOpen, setWaiterModeOpen] = useState(false);
  const { data: waiters } = useWaiters();
  const startWaiterSession = useSessionStore((state) => state.startWaiterSession);
  const endSession = useSessionStore((state) => state.endSession);
  const navigate = useNavigate();

  const sections = [
    { label: "Cambrers", path: "/admin/waiters", ready: true },
    { label: "Plats", path: "/admin/dishes", ready: true },
    { label: "Taules", path: "/admin/tables", ready: true },
    { label: "Balanç de vendes", path: "/admin/balance", ready: false },
    { label: "Seguretat", path: "/admin/security", ready: true },
  ];

  if (waiterModeOpen) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
        <button
          className="text-sm text-stone-500 cursor-pointer"
          onClick={() => setWaiterModeOpen(false)}
        >
          ← Tornar
        </button>
        <h1 className="font-bold text-xl">Qui ets?</h1>
        <div className="flex flex-wrap justify-center gap-6 max-w-sm">
          {waiters?.map((waiter) => (
            <button
              key={waiter.id}
              onClick={() => {
                startWaiterSession(waiter.id, waiter.nombre);
                navigate("/waiter");
              }}
              className="flex flex-col items-center gap-2 cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-accent text-white flex items-center justify-center text-xl font-bold">
                {waiter.nombre.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium">{waiter.nombre}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Panell d'administració"
        rightContent={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWaiterModeOpen(true)}
              className="bg-white text-accent px-3 py-2 rounded-lg text-sm font-medium cursor-pointer"
            >
              Mode cambrer
            </button>
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
          </div>
        }
      />
      <div className="p-4 max-w-2xl mx-auto grid grid-cols-2 gap-4">
        {sections.map((section) => (
          <button
            key={section.path}
            disabled={!section.ready}
            onClick={() => navigate(section.path)}
            className={`rounded-xl p-6 text-center font-medium border ${
              section.ready
                ? "bg-white border-stone-200 cursor-pointer hover:border-accent"
                : "bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed"
            }`}
          >
            {section.label}
            {!section.ready && <p className="text-xs mt-1">Properament</p>}
          </button>
        ))}
      </div>
    </div>
  );
}

export default AdminPanelPage;
