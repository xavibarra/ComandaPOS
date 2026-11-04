import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import PinKeypad from "./PinKeypad";
import { useSessionStore } from "./sessionStore";
import { useWaiters } from "./useWaiters";

function LoginPage() {
  const { data: waiters } = useWaiters();
  const [selectedWaiter, setSelectedWaiter] = useState<{ id: string; nombre: string } | null>(
    null,
  );
  const [adminLogin, setAdminLogin] = useState(false);
  const [wrongPin, setWrongPin] = useState(false);
  const startWaiterSession = useSessionStore((state) => state.startWaiterSession);
  const startAdminSession = useSessionStore((state) => state.startAdminSession);
  const navigate = useNavigate();

  const goBack = () => {
    setSelectedWaiter(null);
    setAdminLogin(false);
    setWrongPin(false);
  };

  if (selectedWaiter) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6">
        <button className="text-sm text-stone-500 cursor-pointer" onClick={goBack}>
          ← Tornar
        </button>
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white ${
            wrongPin ? "bg-red-500" : "bg-accent"
          }`}
        >
          {selectedWaiter.nombre.charAt(0).toUpperCase()}
        </div>
        <p className="font-bold">{selectedWaiter.nombre}</p>
        {wrongPin && <p className="text-sm text-red-600">PIN incorrecte, torna-ho a provar</p>}
        <PinKeypad
          length={4}
          onComplete={async (pin) => {
            const { data, error } = await supabase.rpc("verificar_pin_camarero", {
              camarero_id_input: selectedWaiter.id,
              pin,
            });
            if (!error && data && data.length > 0) {
              startWaiterSession(data[0].id, data[0].nombre);
              navigate("/waiter");
              return;
            }
            setWrongPin(true);
          }}
        />
      </div>
    );
  }

  if (adminLogin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6">
        <button className="text-sm text-stone-500 cursor-pointer" onClick={goBack}>
          ← Tornar
        </button>
        <p className="font-bold">Accés d'administració</p>
        {wrongPin && <p className="text-sm text-red-600">PIN incorrecte, torna-ho a provar</p>}
        <PinKeypad
          length={6}
          onComplete={async (pin) => {
            const { data, error } = await supabase.rpc("verificar_pin_admin", { pin });
            if (!error && data) {
              startAdminSession();
              navigate("/admin");
              return;
            }
            setWrongPin(true);
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 className="font-bold text-xl">Qui ets?</h1>
      <div className="flex flex-wrap justify-center gap-6 max-w-sm">
        {waiters?.map((waiter) => (
          <button
            key={waiter.id}
            onClick={() => setSelectedWaiter(waiter)}
            className="flex flex-col items-center gap-2 cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-accent text-white flex items-center justify-center text-xl font-bold">
              {waiter.nombre.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium">{waiter.nombre}</span>
          </button>
        ))}
      </div>
      <button
        onClick={() => setAdminLogin(true)}
        className="text-xs text-stone-400 mt-6 cursor-pointer hover:text-stone-600"
      >
        Admin
      </button>
    </div>
  );
}

export default LoginPage;
