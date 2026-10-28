
import { useEffect, useMemo, useState } from "react";
import ProductForm from "../components/ProductForm";
import { inventoryApi } from "../services/api";
import { useAuth } from "../auth/useAuth";
import type {
  Categoria,
  Producto,
  ProductoInput,
} from "../types/inventory";
import "../App.css";

const currency = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

export default function ProductsPage()  {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Producto | null>(null);
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === "admin";

  async function cargarDatos() {
    const [products, categories] = await Promise.all([
      inventoryApi.getProductos(),
      inventoryApi.getCategorias(),
    ]);

    setProductos(products);
    setCategorias(categories);
  }

  useEffect(() => {
    let active = true;

    Promise.all([
      inventoryApi.getProductos(),
      inventoryApi.getCategorias(),
    ])
      .then(([products, categories]) => {
        if (!active) return;
        setProductos(products);
        setCategorias(categories);
      })
      .catch((err: unknown) => {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Error de conexión"
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

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();

    return productos.filter((p) =>
      `${p.nombre} ${p.sku}`.toLowerCase().includes(query)
    );
  }, [productos, search]);

  const stats = useMemo(() => ({
    total: productos.length,
    existencias: productos.reduce((n, p) => n + p.stock, 0),
    bajoStock: productos.filter(
      (p) => p.stock <= p.stock_minimo
    ).length,
    valor: productos.reduce(
      (n, p) => n + Number(p.precio) * p.stock, 0
    ),
  }), [productos]);

  async function guardarProducto(data: ProductoInput) {
    if (editing) {
      await inventoryApi.actualizarProducto(editing.id, data);
    } else {
      await inventoryApi.crearProducto(data);
    }

    await cargarDatos();
    setShowForm(false);
    setEditing(null);
    setError("");
  }

  async function eliminarProducto(producto: Producto) {
    if (!window.confirm(
      `¿Eliminar el producto "${producto.nombre}"?`
    )) return;

    try {
      await inventoryApi.eliminarProducto(producto.id);
      await cargarDatos();
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar"
      );
    }
  }

  function abrirEdicion(producto: Producto) {
    setEditing(producto);
    setShowForm(true);
  }

  function abrirCreacion() {
    setEditing(null);
    setShowForm(true);
  }

  return (
    <div >
      

      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="eyebrow">GESTIÓN DE INVENTARIO</span>
                <h1>Administración de Productos</h1>
                <p>Registra, consulta y administra tus productos.</p>
          </div>
          {esAdmin && (
  <button
    onClick={abrirCreacion}
    disabled={loading || categorias.length === 0}
  >
    + Nuevo producto
  </button>
)}
        </header>

        {error && <div className="alert">{error}</div>}

        {loading ? (
          <p>Cargando inventario...</p>
        ) : (
          <>
            <section className="stats-grid">
              <div className="stat-card">
                <span>Total de productos</span>
                <strong>{stats.total}</strong>
                <small>Productos registrados</small>
              </div>
              <div className="stat-card">
                <span>Unidades en inventario</span>
                <strong>{stats.existencias}</strong>
                <small>Existencias actuales</small>
              </div>
              <div className="stat-card">
                <span>Productos con stock bajo</span>
                <strong className="warning">{stats.bajoStock}</strong>
                <small>Requieren atención</small>
              </div>
              <div className="stat-card">
                <span>Valor del inventario</span>
                <strong className="money">
                  {currency.format(stats.valor)}
                </strong>
                <small>Valoración usando precio registrado</small>
              </div>
            </section>

            <section className="table-card">
              <div className="table-header">
                <div>
                  <h2>Productos</h2>
                  <p>Listado general del inventario</p>
                </div>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nombre o SKU..."
                  aria-label="Buscar productos"
                />
              </div>

              {categorias.length === 0 && (
                <div className="notice">
                  No hay categorías disponibles. Crea una desde
                  Swagger en POST /api/categorias.
                </div>
              )}

              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>SKU</th>
                      <th>PRODUCTO</th>
                      <th>CATEGORÍA</th>
                      <th>PRECIO</th>
                      <th>STOCK</th>
                      <th>ESTADO</th>
                      <th>ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p) => {
                      const bajo = p.stock <= p.stock_minimo;
                      return (
                        <tr key={p.id}>
                          <td>{p.sku}</td>
                          <td className="product-name">{p.nombre}</td>
                          <td>
                            {categorias.find(
                              (c) => c.id === p.categoria_id
                            )?.nombre ?? "Sin categoría"}
                          </td>
                          <td>{currency.format(Number(p.precio))}</td>
                          <td>{p.stock}</td>
                          <td>
                            <span className={
                              bajo ? "status low" : "status good"
                            }>
                              {bajo ? "Stock bajo" : "Disponible"}
                            </span>
                          </td>
                          <td>
                           {esAdmin && (
  <div className="actions">
    <button
      className="btn-secondary"
      onClick={() => abrirEdicion(p)}
    >
      Editar
    </button>

    <button
      className="btn-danger"
      onClick={() => eliminarProducto(p)}
    >
      Eliminar
    </button>
  </div>
)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filtered.length === 0 && (
                <p className="empty-state">
                  {search
                    ? "No encontramos productos con esa búsqueda."
                    : "No hay productos registrados todavía."}
                </p>
              )}
            </section>
          </>
        )}

        {showForm && (
          <div className="modal-backdrop">
            <div className="modal" role="dialog"
              aria-modal="true" aria-label="Formulario de producto">
              <ProductForm
                key={editing?.id ?? "nuevo"}
                categorias={categorias}
                producto={editing}
                onSave={guardarProducto}
                onCancel={() => {
                  setShowForm(false);
                  setEditing(null);
                }}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
