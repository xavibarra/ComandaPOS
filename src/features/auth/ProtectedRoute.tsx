import { Navigate } from "react-router-dom";
import type { JSX } from "react/jsx-runtime";
import { useSessionStore } from "./sessionStore";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const session = useSessionStore((state) => state.session);
  if (!session) {
    return <Navigate to="/" />;
  }
  return children;
}

export default ProtectedRoute;
