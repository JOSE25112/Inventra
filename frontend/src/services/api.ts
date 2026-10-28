
import type {
  Categoria,
  Producto,
  ProductoInput,
} from "../types/inventory";

import type{
  Movimiento,
  MovimientoInput,
}from "../types/inventory";

const API_URL =
  import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";


let accessToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function setUnauthorizedHandler(
  handler: (() => void) | null
) {
  onUnauthorized = handler;
}


async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
  "Content-Type": "application/json",
  ...(accessToken
    ? { Authorization: `Bearer ${accessToken}` }
    : {}),
  ...options?.headers,
},
  });

  
if (!response.ok) {
  if (response.status === 401 && accessToken) {
    setAccessToken(null);
    onUnauthorized?.();
  }

  const error = await response.json().catch(() => null);

  throw new Error(
    typeof error?.detail === "string"
      ? error.detail
      : `Error HTTP ${response.status}`
  );
}


  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const inventoryApi = {
  getCategorias: () =>
    request<Categoria[]>("/api/categorias"),

  getProductos: () =>
    request<Producto[]>("/api/productos"),

  crearProducto: (data: ProductoInput) =>
    request<Producto>("/api/productos", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  actualizarProducto: (id: number, data: ProductoInput) =>
    request<Producto>(`/api/productos/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  eliminarProducto: (id: number) =>
    request<void>(`/api/productos/${id}`, {
      method: "DELETE",
    }),
    crearCategoria: (data: {
  nombre: string;
  descripcion: string | null;
}) =>
  request<Categoria>("/api/categorias", {
    method: "POST",
    body: JSON.stringify(data),
  }),

eliminarCategoria: (id: number) =>
  request<void>(`/api/categorias/${id}`, {
    method: "DELETE",
  }),
  
getMovimientos: () =>
  request<Movimiento[]>("/api/movimientos"),

crearMovimiento: (data: MovimientoInput) =>
  request<Movimiento>("/api/movimientos", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  
  login: (email: string, password: string) =>
  request<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  }),

getUsuarioActual: () =>
  request<UsuarioActual>("/api/auth/me"),

getUsuarios: () =>
  request<UsuarioActual[]>("/api/usuarios"),

crearUsuario: (data: UsuarioNuevo) =>
  request<UsuarioActual>("/api/usuarios", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  getDashboardStats: () =>
    request<DashboardStats>("/api/dashboard/stats"),
  getAuditoria: () => 
    request<MovimientoAuditoria[]>(
      "/api/movimientos/auditoria"
    )

};
export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface UsuarioActual {
  id: number;
  nombre: string;
  email: string;
  rol: "admin" | "empleado";
}

export interface UsuarioNuevo {
  nombre: string;
  email: string;
  password: string;
  rol: "admin" | "empleado";
}
export interface DashboardStats{
  total_productos: number;
  unidades_disponibles: number;
  productos_stock_bajo: number;
  productos_agotados: number;
  valor_venta_estimado: string;

}
export interface MovimientoAuditoria{
  id: number;
  producto_id: number;
  producto_nombre: string;
  producto_sku: number;
  usuario_id: number;
  usuario_nombre: string;
  tipo: "entrada"|"salida";
  cantidad: number;
  fecha: string;
}