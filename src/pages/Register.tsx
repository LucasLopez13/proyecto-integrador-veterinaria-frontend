import { Link } from "react-router-dom";
import "../styles/Register.css";

function Register() {
  return (
    <main className="register-page">
      <div className="register-card">
        <h1>Sistema Veterinario</h1>
        <h2>Crear cuenta</h2>

        <form>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              Nombre
            </label>
            <input
              type="text"
              id="name"
              className="form-control"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Correo electrónico
            </label>
            <input
              type="email"
              id="email"
              className="form-control"
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
            Registrarse
          </button>
        </form>

        <p className="login-link">
          ¿Ya tenés una cuenta? <Link to="/login">Iniciar sesión</Link>
        </p>
      </div>
    </main>
  );
}

export default Register;