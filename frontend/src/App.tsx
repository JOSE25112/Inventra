
import { Navigate, Route, Routes } from "react-router";

import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import UsersPage from "./pages/UsersPage";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import ProductsPage from "./pages/ProductsPage";
import CategoriesPage from "./pages/CategoriesPage";
import MovementsPage from "./pages/MovementsPage";

export default function App() {
  return (
    <Routes>
      {/* Ruta pública */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas que requieren autenticación */}
      <Route element={<ProtectedRoute />}>
  <Route element={<Layout />}>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/productos" element={<ProductsPage />} />
    <Route path="/categorias" element={<CategoriesPage />} />
    <Route path="/movimientos" element={<MovementsPage />} />

    <Route element={<ProtectedRoute adminOnly />}>
      <Route path="/usuarios" element={<UsersPage />} />
    </Route>
  </Route>
</Route>

      <Route
        path="*"
        element={<Navigate to="/dashboard" replace />}
      />
    </Routes>

    
  );
}
