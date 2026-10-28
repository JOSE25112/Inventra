
import { useEffect, useState } from "react";
import type {
  Categoria,
  Producto,
  ProductoInput,
} from "../types/inventory";

interface Props {
  categorias: Categoria[];
  producto?: Producto | null;
  onSave: (data: ProductoInput) => Promise<void>;
  onCancel: () => void;
}

const emptyForm: ProductoInput = {
  sku: "",
  nombre: "",
  descripcion: "",
  precio: "0.00",
  stock_minimo: 5,
  categoria_id: 0,
};

export default function ProductForm({
  categorias,
  producto,
  onSave,
  onCancel,
}: Props) {
  const [form, setForm] = useState<ProductoInput>(
    producto
      ? {
          sku: producto.sku,
          nombre: producto.nombre,
          descripcion: producto.descripcion,
          precio: producto.precio,
          stock_minimo: producto.stock_minimo,
          categoria_id: producto.categoria_id,
        }
      : emptyForm
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(
      producto
        ? {
            sku: producto.sku,
            nombre: producto.nombre,
            descripcion: producto.descripcion,
            precio: producto.precio,
            stock_minimo: producto.stock_minimo,
            categoria_id: producto.categoria_id,
          }
        : { ...emptyForm }
    );
  }, [producto]);

  function update<K extends keyof ProductoInput>(
    key: K,
    value: ProductoInput[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      await onSave(form);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo guardar el producto"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <h2>{producto ? "Editar producto" : "Nuevo producto"}</h2>

      {error && <p className="error">{error}</p>}

      <label>
        SKU
        <input
          required
          maxLength={50}
          value={form.sku}
          onChange={(e) => update("sku", e.target.value)}
          placeholder="LAP-001"
        />
      </label>

      <label>
        Nombre
        <input
          required
          maxLength={150}
          value={form.nombre}
          onChange={(e) => update("nombre", e.target.value)}
          placeholder="Laptop Lenovo"
        />
      </label>

      <label>
        Categoría
        <select
          required
          value={form.categoria_id}
          onChange={(e) =>
            update("categoria_id", Number(e.target.value))
          }
        >
          <option value={0} disabled>
            Seleccionar categoría
          </option>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nombre}
            </option>
          ))}
        </select>
      </label>

      <label>
        Descripción
        <textarea
          maxLength={500}
          value={form.descripcion ?? ""}
          onChange={(e) =>
            update("descripcion", e.target.value)
          }
        />
      </label>

      <div className="form-grid">
        <label>
          Precio
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={form.precio}
            onChange={(e) =>
              update("precio", e.target.value)
            }
          />
          
        </label>
<p className="stock-info">
  Las existencias se controlan desde el módulo
  de Movimientos de inventario.
</p>
        <label>
          Stock
          <input
          />
        </label>

        <label>
          Stock mínimo
          <input
            required
            type="number"
            min="0"
            step="1"
            value={form.stock_minimo}
            onChange={(e) =>
              update("stock_minimo", Number(e.target.value))
            }
          />
        </label>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary"
          onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" disabled={saving}>
          {saving ? "Guardando..." : "Guardar producto"}
        </button>
      </div>
    </form>
  );
}
