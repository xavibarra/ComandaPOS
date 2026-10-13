import { useParams } from "react-router-dom";
import { listarImpresoras } from "../../lib/qz";
import { useAgregarLinea } from "./useAgregarLinea";
import { useEnviarCocina } from "./useEnviarCocina";
import { useLineasComandas } from "./useLineasComandas";
import { usePlatos } from "./usePlatos";
import { useQuitarUnidad } from "./useQuitarUnidad";

function ComandaPage() {
  const { comandaId } = useParams();
  const { data: platos } = usePlatos();
  const categorias = Array.from(new Set(platos?.map((plato) => plato.categoria)));
  const agregarLinea = useAgregarLinea();
  const { data: lineas } = useLineasComandas(comandaId!);
  const quitarUnidad = useQuitarUnidad();
  const enviarCocina = useEnviarCocina();
  console.log("platos", platos);

  return (
    <div>
      <h1>Comanda</h1>
      <p>Comanda: {comandaId}</p>
      {categorias.map((categoria) => (
        <div key={categoria}>
          <h2>{categoria}</h2>
          <ul>
            {platos
              ?.filter((plato) => plato.categoria === categoria)
              .map((plato) => (
                <li
                  onClick={() => {
                    agregarLinea.mutate({
                      comandaId: comandaId!,
                      plato: { id: plato.id, precio: plato.precio },
                    });
                  }}
                  key={plato.id}
                >
                  {plato.nombre}
                </li>
              ))}
          </ul>
        </div>
      ))}
      <h1>Pedidos</h1>
      <ul>
        {lineas?.map((linea) => (
          <li key={linea.id}>
            {linea.platos.nombre} - {linea.cantidad} -{" "}
            {linea.enviado_a_cocina ? "Enviat" : "Pendent"}
            {!linea.enviado_a_cocina && (
              <button
                onClick={() => {
                  quitarUnidad.mutate({
                    lineaId: linea.id,
                    cantidadActual: linea.cantidad,
                    comandaId: comandaId!,
                  });
                }}
              >
                Quitar una unidad
              </button>
            )}
          </li>
        ))}
      </ul>
      {lineas?.some((linea) => !linea.enviado_a_cocina) && (
        <button
          onClick={() => {
            enviarCocina.mutate({
              comandaId: comandaId!,
            });
          }}
        >
          Enviar a cocina
        </button>
      )}
      <button
        onClick={async () => {
          try {
            const impresoras = await listarImpresoras();
            console.log("Impresoras encontradas:", impresoras);
          } catch (err) {
            console.error("Error conectando con QZ Tray:", err);
          }
        }}
      >
        Probar impresora
      </button>
    </div>
  );
}

export default ComandaPage;
