
export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
}

export interface Producto {
  id: number;
  sku: string;
  nombre: string;
  descripcion: string | null;
  precio: string;
  stock: number;
  stock_minimo: number;
  categoria_id: number;
}

export type ProductoInput = Omit<
  Producto,
    "id" | "stock">;


export interface Movimiento {
  id: number;
  producto_id: number;
  usuario_id: number;
  tipo: "entrada" | "salida";
  cantidad: number;
  fecha: string;
}

export type MovimientoInput = Pick<Movimiento,
"producto_id"| "tipo" | "cantidad">;