import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";
import "../styles/Auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await authService.login({ email, password });
      login(data.user, data.token);

      const userRole = data.user.rol || data.user.role;
      if (userRole === "profesional") {
        navigate("/profesional/turnos");
      } else {
        navigate("/mascotas");
      }
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión. Verifique sus credenciales.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card p-4 p-md-5 shadow-sm">
        {/* Geometric Veterinary Logo in Deep Violet */}
        <div className="text-center mb-4">
          <div className="auth-logo-squircle">
            <i className="bi bi-shield-plus fs-2"></i>
          </div>
          <h1 className="auth-title mb-1">Portal Veterinario</h1>
          <p className="auth-subtitle mb-0">Gestión clínica y turnos</p>
        </div>

        {error && (
          <div className="alert alert-danger py-2 px-3 small rounded-2 mb-3" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Correo electrónico
            </label>
            <input
              type="email"
              id="email"
              className="form-control rounded-2"
              placeholder="doctor@vetcare.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label htmlFor="password" className="form-label mb-0">
                Contraseña
              </label>
            </div>
            <input
              type="password"
              id="password"
              className="form-control rounded-2"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Full-width button with strict rounded-2 (6px radius) */}
          <button
            type="submit"
            className="btn btn-primary w-100 rounded-2 py-2 fw-medium shadow-sm"
            disabled={loading}
          >
            {loading ? "Ingresando..." : "Ingresar al Sistema"}
          </button>
        </form>

        <div className="text-center mt-4 pt-2 border-top border-light-subtle">
          <span className="auth-footer-text">¿No tenés una cuenta? </span>
          <Link to="/registro" className="auth-link">
            Crear cuenta
          </Link>
        </div>
      </div>
    </main>
  );
}

export default Login;