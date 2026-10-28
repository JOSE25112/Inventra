
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { inventoryApi } from "../services/api";
import type {
  UsuarioActual,
  UsuarioNuevo,
} from "../services/api";

const initialForm: UsuarioNuevo = {
  nombre: "",
  email: "",
  password: "",
  rol: "empleado",
};

export default function UsersPage() {
  const [usuarios, setUsuarios] = useState<UsuarioActual[]>([]);
  const [form, setForm] = useState<UsuarioNuevo>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    inventoryApi.getUsuarios()
      .then((data) => {
        if (active) setUsuarios(data);
      })
      .catch((err: unknown) => {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar los usuarios"
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function crearUsuario(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const nuevo = await inventoryApi.crearUsuario(form);

      setUsuarios((prev) =>
        [...prev, nuevo].sort((a, b) => a.id - b.id)
      );

      setForm({ ...initialForm });

      setSuccess("Usuario creado correctamente.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo crear el usuario"
      );
    } finally {
      setSaving(false);
    }
  }

  const administradores = usuarios.filter(
    (u) => u.rol === "admin"
  ).length;

  const empleados = usuarios.filter(
    (u) => u.rol === "empleado"
  ).length;

  return (
    <main className="main-content">
      <header className="topbar">
        <div>
          <span className="eyebrow">ADMINISTRACIÓN</span>
          <h1>Gestión de usuarios</h1>
          <p>Administra las cuentas de acceso a Inventra.</p>
        </div>
      </header>

      {error && <div className="alert" role="alert">{error}</div>}
      {success && (
        <div className="success-alert" role="status">
          {success}
        </div>
      )}

      <section className="stats-grid">
        <div className="stat-card">
          <span>Total de usuarios</span>
          <strong>{usuarios.length}</strong>
          <small>Cuentas registradas</small>
        </div>

        <div className="stat-card">
          <span>Administradores</span>
          <strong>{administradores}</strong>
          <small>Acceso administrativo</small>
        </div>

        <div className="stat-card">
          <span>Empleados</span>
          <strong>{empleados}</strong>
          <small>Acceso operativo</small>
        </div>
      </section>

      <div className="categories-layout">
        <section className="table-card">
          <h2>Usuarios registrados</h2>
          <p className="section-description">
            Cuentas almacenadas en PostgreSQL.
          </p>

          {loading ? (
            <p>Cargando usuarios...</p>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>NOMBRE</th>
                    <th>CORREO</th>
                    <th>ROL</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((usuario) => (
                    <tr key={usuario.id}>
                      <td>{usuario.id}</td>
                      <td className="product-name">
                        {usuario.nombre}
                      </td>
                      <td>{usuario.email}</td>
                      <td>
                        <span
                          className={`status ${
                            usuario.rol === "admin"
                              ? "good"
                              : "low"
                          }`}
                        >
                          {usuario.rol === "admin"
                            ? "Administrador"
                            : "Empleado"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {usuarios.length === 0 && !loading && (
                <p className="empty-state">
                  No se encontraron usuarios.
                </p>
              )}
            </div>
          )}
        </section>

        <section className="table-card">
          <h2>Nuevo usuario</h2>
          <p className="section-description">
            Crea una cuenta con permisos específicos.
          </p>

          <form className="product-form" onSubmit={crearUsuario}>
            <label>
              Nombre
              <input
                required
                minLength={2}
                maxLength={100}
                value={form.nombre}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p, nombre: e.target.value
                  }))
                }
              />
            </label>

            <label>
              Correo electrónico
              <input
                type="email"
                required
                autoComplete="off"
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p, email: e.target.value
                  }))
                }
              />
            </label>

            <label>
              Contraseña inicial
              <input
                type="password"
                required
                minLength={12}
                maxLength={128}
                autoComplete="new-password"
                value={form.password}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p, password: e.target.value
                  }))
                }
              />
            </label>

            <label>
              Rol
              <select
                value={form.rol}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    rol: e.target.value as "admin" | "empleado"
                  }))
                }
              >
                <option value="empleado">Empleado</option>
                <option value="admin">Administrador</option>
              </select>
            </label>

            <button type="submit" disabled={saving}>
              {saving ? "Registrando..." : "Crear usuario"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
