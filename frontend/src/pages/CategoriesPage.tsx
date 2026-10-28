
import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import { inventoryApi } from "../services/api";
import type { Categoria, Producto } from "../types/inventory";

export default function CategoriesPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === "admin";

  async function cargarDatos() {
    const [categories, products] = await Promise.all([
      inventoryApi.getCategorias(),
      inventoryApi.getProductos(),
    ]);

    setCategorias(categories);
    setProductos(products);
  }

  useEffect(() => {
    let active = true;

    Promise.all([
      inventoryApi.getCategorias(),
      inventoryApi.getProductos(),
    ])
      .then(([categories, products]) => {
        if (!active) return;
        setCategorias(categories);
        setProductos(products);
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Error de conexión");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function crearCategoria(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      await inventoryApi.crearCategoria({
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || null,
      });

      await cargarDatos();

      setNombre("");
      setDescripcion("");
      setSuccess("Categoría registrada correctamente.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo registrar"
      );
    } finally {
      setSaving(false);
    }
  }

  async function eliminarCategoria(categoria: Categoria) {
    if (!window.confirm(
      `¿Deseas eliminar la categoría "${categoria.nombre}"?`
    )) {
      return;
    }

    setError("");
    setSuccess("");
    setDeletingId(categoria.id);

    try {
      await inventoryApi.eliminarCategoria(categoria.id);
      await cargarDatos();
      setSuccess("Categoría eliminada correctamente.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo eliminar"
      );
    } finally {
      setDeletingId(null);
    }
  }

  function contarProductos(categoriaId: number) {
    return productos.filter(
      (producto) => producto.categoria_id === categoriaId
    ).length;
  }

  return (
    <main className="main-content">
      <header className="topbar">
        <div>
          <span className="eyebrow">ADMINISTRACIÓN</span>
          <h1>Categorías</h1>
          <p>Organiza y clasifica tu inventario.</p>
        </div>
      </header>

      {error && <div className="alert">{error}</div>}
      {success && <div className="success-alert">{success}</div>}

      <div className="categories-layout">
        {esAdmin && (
        <section className="table-card">
          <h2>Listado de categorías</h2>
          <p className="section-description">
            Categorías registradas en PostgreSQL.
          </p>

          {loading ? (
            <p>Cargando categorías...</p>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>NOMBRE</th>
                    <th>DESCRIPCIÓN</th>
                    <th>PRODUCTOS</th>
                    <th>ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {categorias.map((categoria) => {
                    const total = contarProductos(categoria.id);

                    return (
                      <tr key={categoria.id}>
                        <td className="product-name">
                          {categoria.nombre}
                        </td>
                        <td>{categoria.descripcion ?? "Sin descripción"}</td>
                        <td>{total}</td>
                        <td>
                          <button
                            type="button"
                            className="btn-danger"
                            disabled={total > 0 || deletingId !== null}
                            title={total > 0
                              ? "La categoría contiene productos"
                              : "Eliminar categoría"}
                            onClick={() => eliminarCategoria(categoria)}
                          >
                            {deletingId === categoria.id
                              ? "Eliminando..."
                              : "Eliminar"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {categorias.length === 0 && (
                <p className="empty-state">
                  No hay categorías registradas.
                </p>
              )}
            </div>
          )}
        </section>
        )}
        
      {esAdmin && (
        <section className="table-card">
          <h2>Nueva categoría</h2>
          <p className="section-description">
            Registra una categoría para clasificar productos.
          </p>

          <form className="product-form" onSubmit={crearCategoria}>
            <label>
              Nombre de la categoría
              <input
                required
                minLength={1}
                maxLength={100}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Computadoras"
              />
            </label>

            <label>
              Descripción
              <textarea
                maxLength={255}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripción de la categoría"
              />
            </label>

            <button type="submit" disabled={saving || !nombre.trim()}>
              {saving ? "Guardando..." : "Guardar categoría"}
            </button>
          </form>
        </section>
      )};
      </div>
    </main>
  );
}
