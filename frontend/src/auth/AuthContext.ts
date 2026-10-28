
import { createContext } from "react";
import type { UsuarioActual } from "../services/api";

export interface AuthContextType {
  usuario: UsuarioActual | null;
  autenticado: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<
  AuthContextType | undefined
>(undefined);
