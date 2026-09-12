import { Link } from "react-router-dom";
import "../styles/Login.css";

function Login() {
  return (
    <main className="login-page">
      <div className="login-card">
        <h1>Sistema Veterinario</h1>
        <h2>Iniciar sesión</h2>

        <form>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Correo electrónico
            </label>
            <input
              type="email"
              id="email"
              className="form-control"
              placeholder="nombre@correo.com"
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