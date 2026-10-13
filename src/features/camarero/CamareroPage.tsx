import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useCrearComanda } from "./useCrearComanda";
import { useMesas } from "./useMesas";

function CamareroPage() {
  const { data: mesas } = useMesas();
  const [modoSeleccion, setModoSeleccion] = useState(false);
  const [mesaSeleccionada, setMesaSeleccionada] = useState<string[]>([]);
  const [mesasParaAbrir, setMesasParaAbrir] = useState<string[] | null>(null);
  const [comensales, setComensales] = useState<number>(1);
  const navigate = useNavigate();
  const crearComanda = useCrearComanda();

  return (
    <div>
      <h1>Camarero</h1>
      <button
        onClick={() => {
          setModoSeleccion(!modoSeleccion);
        }}
      >
        {modoSeleccion ? "Desactivar Modo Selección" : "Activar Modo Selección"}
      </button>
      {modoSeleccion && <p>Modo selección activado</p>}
      {modoSeleccion && mesaSeleccionada.length > 0 && (
        <button
          onClick={() => {
            setMesasParaAbrir(mesaSeleccionada);
          }}
        >
          Confirmar selección de mesas ({mesaSeleccionada.length})
        </button>
      )}

      <ul>
        {mesas?.map((mesa) => (
          <li
            key={mesa.id}
            onClick={async () => {
              if (modoSeleccion) {
                if (mesaSeleccionada.includes(mesa.id)) {
                  setMesaSeleccionada(mesaSeleccionada.filter((id) => id !== mesa.id));
                } else {
                  setMesaSeleccionada([...mesaSeleccionada, mesa.id]);
                }
              } else {
                if (mesa.estado === "libre") {
                  setMesasParaAbrir([mesa.id]);
                } else {
                  const { data: comandaId } = await supabase.rpc("buscar_comanda_abierta", {
                    mesa_id_input: mesa.id,
                  });
                  navigate(`/comandaPage/${comandaId}`);
                }
              }
            }}
          >
            <h2
              style={{
                backgroundColor: mesaSeleccionada.includes(mesa.id) ? "lightblue" : "white",
              }}
            >
              Mesa {mesa.nombre}
            </h2>
            <p>Estado: {mesa.estado}</p>
          </li>
        ))}
      </ul>
      {mesasParaAbrir && (
        <div>
          <h2>¿Cuantos comensales?</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              crearComanda.mutate(
                { mesaIds: mesasParaAbrir!, comensales },
                {
                  onSuccess: (comandaID) => {
                    navigate(`/comandaPage/${comandaID}`);
                  },
                },
              );
            }}
          >
            <input
              type="number"
              name="comensales"
              min="1"
              required
              value={comensales}
              onChange={(e) => setComensales(parseInt(e.target.value) || 1)}
            />
            <button type="submit">Abrir comanda</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default CamareroPage;
