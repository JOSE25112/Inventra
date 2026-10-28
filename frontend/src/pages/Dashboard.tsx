
import { useEffect, useState } from "react";
import {
  inventoryApi,
} from "../services/api";
import type {
  DashboardStats,
  MovimientoAuditoria,
} from "../services/api";
import "../App.css";

const dinero = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [movimientos, setMovimientos] = useState<
    MovimientoAuditoria[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    Promise.all([
      inventoryApi.getDashboardStats(),
      inventoryApi.getAuditoria(),
    ])
      .then(([data, historial]) => {
        if (!active) return;
        setStats(data);
        setMovimientos(historial);
      })
      .catch((err: unknown) => {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudo cargar el Dashboard"
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

  if (loading) {
    return (
      <main className="main-content">
        <p>Cargando indicadores...</p>
      </main>
    );
  }

  return (
    <main className="main-content">
      <header className="topbar">
        <div>
          <span className="eyebrow">PANEL DE CONTROL</span>
          <h1>Resumen de Inventario</h1>
          <p>Indicadores y actividad reciente de almacén.</p>
        </div>
      </header>

      {error && <div className="alert">{error}</div>}

      {stats && (
        <section className="stats-grid">
          <div className="stat-card">
            <span>Productos registrados</span>
            <strong>{stats.total_productos}</strong>
            <small>Referencias en el catálogo</small>
          </div>

          <div className="stat-card">
            <span>Unidades disponibles</span>
            <strong>{stats.unidades_disponibles}</strong>
            <small>Existencias totales</small>
          </div>

          <div className="stat-card">
            <span>Stock bajo</span>
            <strong className="warning">
              {stats.productos_stock_bajo}
            </strong>
            <small>Productos que requieren atención</small>
          </div>

          <div className="stat-card">
            <span>Productos agotados</span>
            <strong>{stats.productos_agotados}</strong>
            <small>Sin existencias</small>
          </div>
        </section>
      )}

      {stats && (
        <section className="table-card dashboard-value">
          <span className="eyebrow">
            VALOR POTENCIAL DEL INVENTARIO
          </span>
          <h2>
            {dinero.format(
              Number(stats.valor_venta_estimado)
            )}
          </h2>
          <p className="section-description">
            Calculado con los precios de venta registrados.
          </p>
        </section>
      )}

      <section className="table-card">
        <h2>Actividad reciente</h2>
        <p className="section-description">
          Últimas operaciones registradas en almacén.
        </p>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>FECHA</th>
                <th>PRODUCTO</th>
                <th>USUARIO</th>
                <th>TIPO</th>
                <th>CANTIDAD</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.slice(0, 8).map((m) => (
                <tr key={m.id}>
                  <td>
                    {new Date(m.fecha).toLocaleString("es-MX")}
                  </td>
                  <td className="product-name">
                    {m.producto_nombre}
                  </td>
                  <td>{m.usuario_nombre}</td>
                  <td>
                    <span className={
                      m.tipo === "entrada"
                        ? "status good"
                        : "status low"
                    }>
                      {m.tipo === "entrada"
                        ? "Entrada"
                        : "Salida"}
                    </span>
                  </td>
                  <td>
                    {m.tipo === "entrada" ? "+" : "-"}
                    {m.cantidad}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {movimientos.length === 0 && (
            <p className="empty-state">
              Todavía no hay movimientos registrados.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
