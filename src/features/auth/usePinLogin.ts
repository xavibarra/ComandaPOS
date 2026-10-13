import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useSesionStore } from "./sesionStore";

export function usePinLogin() {
  const [pin, setPin] = useState("");
  const navigate = useNavigate();
  const iniciarSesionCamarero = useSesionStore((state) => state.iniciarSesionCamarero);
  const iniciarSesionAdmin = useSesionStore((state) => state.iniciarSesionAdmin);

  useEffect(() => {
    console.log("a");
    const verificar = async () => {
      if (pin.length === 4) {
        const { data, error } = await supabase.rpc("verificar_pin_camarero", { pin });
        if (!error && data && data.length > 0) {
          iniciarSesionCamarero(data[0].id, data[0].nombre);
          navigate("/camarero");
          return;
        }
      } else if (pin.length === 6) {
        const { data, error } = await supabase.rpc("verificar_pin_admin", { pin });
        if (!error && data) {
          iniciarSesionAdmin();
          navigate("/admin");
          return;
        }
      }
    };
    verificar();
  }, [iniciarSesionAdmin, pin, iniciarSesionCamarero, navigate]);
  const añadirDigito = (digito: string) => {
    setPin((actual) => (actual.length < 6 ? actual + digito : actual));
  };

  const borrarDigito = () => {
    setPin((actual) => actual.slice(0, -1));
  };

  return { pin, añadirDigito, borrarDigito, setPin };
}
