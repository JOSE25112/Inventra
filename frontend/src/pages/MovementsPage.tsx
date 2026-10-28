
import { useEffect, useState } from "react";

import { inventoryApi } from "../services/api";
import type {
  Movimiento,
  MovimientoInput,
  Producto,
} from "../types/inventory";

export default function MovementsPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);

  const [productoId, setProductoId] = useState(0);
  const [tipo, setTipo] = useState<"entrada" | "salida">("entrada");
  const [cantidad, setCantidad] = useState(1);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function cargarDatos() {
    const [products, movements] = await Promise.all([
      inventoryApi.getProductos(),
      inventoryApi.getMovimientos(),
    ]);

    setProductos(products);
    setMovimientos(movements);
  }

  useEffect(() => {
    let active = true;

    Promise.all([
      inventoryApi.getProductos(),
      inventoryApi.getMovimientos(),
    ])
      .then(([products, movements]) => {
        if (!active) return;

        setProductos(products);
        setMovimientos(movements);
      })
      .catch((err: unknown) => {
        if (!active) return;

        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar los movimientos"
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const seleccionado = productos.find(
    (producto) => producto.id === productoId
  );

  async function registrar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    const datos: MovimientoInput = {
      producto_id: productoId,
      tipo,
      cantidad,
    };

    try {
      await inventoryApi.crearMovimiento(datos);
      await cargarDatos();

      setCantidad(1);
      setSuccess("Movimiento registrado correctamente.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo registrar el movimiento"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="main-content">
      <header className="topbar">
        <div>
          <span className="eyebrow">OPERACIONES DE ALMACÉN</span>
          <h1>Movimientos de inventario</h1>
          <p>Registra entradas y salidas de mercancía.</p>
        </div>
      </header>

      {error && <div className="alert">{error}</div>}
      {success && <div className="success-alert">{success}</div>}

      <div className="categories-layout">
        <section className="table-card">
          <h2>Historial de movimientos</h2>
          <p className="section-description">
            Últimos 100 movimientos registrados.
          </p>

          {loading ? (
            <p>Cargando movimientos...</p>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>FECHA</th>
                    <th>PRODUCTO</th>
                    <th>TIPO</th>
                    <th>CANTIDAD</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientos.map((m) => (
                    <tr key={m.id}>
                      <td>
                        {new Date(m.fecha).toLocaleString("es-MX")}
                      </td>
                      <td>
                        {productos.find(
                          (p) => p.id === m.producto_id
                        )?.nombre ?? `Producto #${m.producto_id}`}
                      </td>
                      <td>
                        <span className={
                          m.tipo === "entrada"
                            ? "status good"
                            : "status low"
                        }>
                          {m.tipo === "entrada" ? "Entrada" : "Salida"}
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
          )}
        </section>

        <section className="table-card">
          <h2>Registrar movimiento</h2>
          <p className="section-description">
            Actualiza las existencias de un producto.
          </p>

          <form className="product-form" onSubmit={registrar}>
            <label>
              Producto
              <select
                required
                value={productoId}
                onChange={(e) =>
                  setProductoId(Number(e.target.value))
                }
              >
                <option value={0} disabled>
                  Selecciona un producto
                </option>
                {productos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} — {p.stock} unidades
                  </option>
                ))}
              </select>
            </label>

            {seleccionado && (
              <div className="stock-info">
                Stock actual:
                <strong> {seleccionado.stock} unidades</strong>
              </div>
            )}

            <label>
              Tipo de movimiento
              <select
                value={tipo}
                onChange={(e) =>
                  setTipo(e.target.value as "entrada" | "salida")
                }
              >
                <option value="entrada">Entrada</option>
                <option value="salida">Salida</option>
              </select>
            </label>

            <label>
              Cantidad
              <input
                type="number"
                min={1}
                step={1}
                required
                value={cantidad}
                onChange={(e) =>
                  setCantidad(Number(e.target.value))
                }
              />
            </label>

            <button
              type="submit"
              disabled={
                saving ||
                loading ||
                productoId === 0 ||
                !Number.isInteger(cantidad) ||
                cantidad <= 0 ||
                (tipo === "salida" &&
                  !!seleccionado &&
                  cantidad > seleccionado.stock)
              }
            >
              {saving ? "Registrando..." : "Registrar movimiento"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
