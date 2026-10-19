import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useSessionStore } from "./sessionStore";

export function usePinLogin() {
  const [pin, setPin] = useState("");
  const navigate = useNavigate();
  const startWaiterSession = useSessionStore((state) => state.startWaiterSession);
  const startAdminSession = useSessionStore((state) => state.startAdminSession);

  useEffect(() => {
    const checkPin = async () => {
      if (pin.length === 4) {
        const { data, error } = await supabase.rpc("verificar_pin_camarero", { pin });
        if (!error && data && data.length > 0) {
          startWaiterSession(data[0].id, data[0].nombre);
          navigate("/waiter");
          return;
        }
      } else if (pin.length === 6) {
        const { data, error } = await supabase.rpc("verificar_pin_admin", { pin });
        if (!error && data) {
          startAdminSession();
          navigate("/admin");
          return;
        }
      }
    };
    checkPin();
  }, [startAdminSession, pin, startWaiterSession, navigate]);
  const addDigit = (digit: string) => {
    setPin((current) => (current.length < 6 ? current + digit : current));
  };

  const removeDigit = () => {
    setPin((current) => current.slice(0, -1));
  };

  return { pin, addDigit, removeDigit, setPin };
}
