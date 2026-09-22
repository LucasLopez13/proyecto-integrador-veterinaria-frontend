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
    const response = await fetch("http://localhost:5000/api/usuarios/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

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
        <h1>Sistema Veterinario</h1>
        <h2>Iniciar sesión</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
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

          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>
            <input
  type="password"
  id="password"
  className="form-control"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  required
/>
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Ingresar
          </button>
        </form>

        <p className="register-link">
          ¿No tenés una cuenta? <Link to="/registro">Registrarse</Link>
        </p>
      </div>
    </main>
  );
}

export default Login;