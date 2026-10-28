
import { Navigate, Outlet } from "react-router";
import { useAuth } from "../auth/useAuth";

interface Props {
  adminOnly?: boolean;
}

export default function ProtectedRoute({
  adminOnly = false,
}: Props) {
  const { usuario, autenticado } = useAuth();

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && usuario?.rol !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
