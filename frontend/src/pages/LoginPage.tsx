
import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useNavigate } from "react-router";

import { useAuth } from "../auth/useAuth";

export default function LoginPage() {
  const { login, autenticado } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (autenticado) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email.trim(), password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo iniciar sesión"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-brand">
        <div>
          <div className="login-logo">◈ Inventra</div>
          <h1>Control inteligente de inventarios</h1>
          <p>
            Administra productos, existencias y movimientos
            de almacén desde una sola plataforma.
          </p>
        </div>
        <small>Inventra · Sistema de Gestión de Inventarios</small>
      </section>

      <section className="login-section">
        <div className="login-card">
          <span className="eyebrow">BIENVENIDO</span>
          <h2>Iniciar sesión</h2>
          <p>Ingresa tus credenciales para continuar.</p>

          {error && (
            <div className="alert" role="alert">
              {error}
            </div>
          )}

          <form className="product-form" onSubmit={handleSubmit}>
            <label>
              Correo electrónico
              <input
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@empresa.com"
              />
            </label>

            <label>
              Contraseña
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Introduce tu contraseña"
              />
            </label>

            <button type="submit" disabled={loading}>
              {loading ? "Verificando..." : "Iniciar sesión"}
            </button>
          </form>

          <p className="login-note">
            Acceso exclusivo para usuarios autorizados.
          </p>
        </div>
      </section>
    </main>
  );
}
