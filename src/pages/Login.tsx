import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/Login.css";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";

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
      setError(err.message || "Error al iniciar sesión. Compruebe sus credenciales.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-logo">🐾</div>
          <h1>Cuidado veterinario</h1>
          <p>El cuidado que tu mascota necesita</p>
        </div>

        <div className="login-divider"></div>

        <div className="login-title">
          <h2>Iniciar sesión</h2>
          <p>Ingresá a tu cuenta para continuar</p>
        </div>

        {error && <div className="alert alert-danger mb-3">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              className="form-control"
              placeholder="nombre@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="Ingresá tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn login-button" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <div className="login-register">
          <span>¿No tenés una cuenta?</span>
          <Link to="/registro">Registrarse</Link>
        </div>
      </div>
    </main>
  );
}

export default Login;