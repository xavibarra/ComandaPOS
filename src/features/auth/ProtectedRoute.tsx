import { Navigate } from "react-router-dom";
import type { JSX } from "react/jsx-runtime";
import { useSesionStore } from "./sesionStore";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const sesion = useSesionStore((state) => state.sesion);
  if (!sesion) {
    return <Navigate to="/" />;
  }
  return children;
}

export default ProtectedRoute;
