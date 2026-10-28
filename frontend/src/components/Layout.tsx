
import { NavLink, Outlet, useNavigate } from "react-router";
import { useAuth } from "../auth/useAuth";

const menu = [
  { path: "/dashboard", label: "Dashboard", icon: "▦" },
  { path: "/productos", label: "Productos", icon: "▤" },
  { path: "/categorias", label: "Categorías", icon: "◈" },
  { path: "/movimientos", label: "Movimientos", icon: "↗" },
  {
    path: "/usuarios",
    label: "Usuarios",
    icon: "♙",
    adminOnly: true,
  },
];

export default function Layout() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  function cerrarSesion() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">◈ Inventra</div>

        <div className="menu-label">MENÚ PRINCIPAL</div>

        <nav aria-label="Navegación principal">
          {menu
  .filter((item) =>
    !("adminOnly" in item && item.adminOnly) ||
    usuario?.rol === "admin"
  )
  .map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-item nav-link ${isActive ? "active" : ""}`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-panel">
            <strong>{usuario?.nombre}</strong>
            <small>
              {usuario?.rol === "admin"
                ? "Administrador"
                : "Empleado"}
            </small>
          </div>

          <button
            className="logout-button"
            onClick={cerrarSesion}
          >
            Cerrar sesión
          </button>

          <small>Inventra · v0.8.0</small>
        </div>
      </aside>

      <div className="layout-content">
        <Outlet />
      </div>
    </div>
  );
}
