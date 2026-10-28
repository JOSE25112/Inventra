
import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";

import { AuthContext } from "./AuthContext";
import {
  inventoryApi,
  setAccessToken,
  setUnauthorizedHandler,
} from "../services/api";
import type { UsuarioActual } from "../services/api";

interface Props {
  children: ReactNode;
}

export default function AuthProvider({ children }: Props) {
  const [usuario, setUsuario] = useState<UsuarioActual | null>(
    null
  );

  const logout = useCallback(() => {
    setAccessToken(null);
    setUsuario(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);

    return () => {
      setUnauthorizedHandler(null);
    };
  }, [logout]);

  async function login(email: string, password: string) {
    const respuesta = await inventoryApi.login(email, password);

    setAccessToken(respuesta.access_token);

    try {
      const perfil = await inventoryApi.getUsuarioActual();
      setUsuario(perfil);
    } catch (error) {
      logout();
      throw error;
    }
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        autenticado: usuario !== null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
