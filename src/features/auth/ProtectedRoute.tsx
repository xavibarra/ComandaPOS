import { Navigate } from "react-router-dom";
import type { JSX } from "react/jsx-runtime";
import { useSessionStore } from "./sessionStore";

function ProtectedRoute({
  children,
  adminOnly,
}: {
  children: JSX.Element;
  adminOnly?: boolean;
}) {
  const session = useSessionStore((state) => state.session);
  if (!session) {
    return <Navigate to="/" />;
  }
  if (adminOnly && session.type !== "admin") {
    return <Navigate to="/waiter" />;
  }
  return children;
}

export default ProtectedRoute;
