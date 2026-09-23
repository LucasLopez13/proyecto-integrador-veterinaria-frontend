import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/Login.css";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:5000/api/usuarios/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Email o contraseña incorrectos");
        return;
      }

      login(data);
      navigate("/mascotas");
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert("No se pudo conectar con el servidor");
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

        <form onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="email">
              Correo electrónico
            </label>

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
            <label htmlFor="password">
              Contraseña
            </label>

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

          <button type="submit" className="btn login-button">
            Ingresar
          </button>
        </form>

        <div className="login-register">
          <span>¿No tenés una cuenta?</span>

          <Link to="/registro">
            Registrarse
          </Link>
        </div>
      </div>
    </main>
  );
}

export default Login;