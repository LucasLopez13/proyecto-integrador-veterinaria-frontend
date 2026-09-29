import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";
import type { UserRole } from "../types/User";
import "../styles/Register.css";

function Register() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState<UserRole>("cliente");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await authService.register({
        nombre,
        apellido,
        email,
        telefono: telefono.trim() || undefined,
        password,
        rol,
      });

      login(data.user, data.token);

      const userRole = data.user.rol || data.user.role;
      if (userRole === "profesional") {
        navigate("/profesional/turnos");
      } else {
        navigate("/mascotas");
      }
    } catch (err: any) {
      setError(err.message || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="register-page">
      <div className="register-card">
        <h1>Sistema Veterinario</h1>
        <h2>Crear cuenta</h2>

        {error && <div className="alert alert-danger mb-3">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="nombre" className="form-label">
                Nombre *
              </label>
              <input
                type="text"
                id="nombre"
                className="form-control"
                placeholder="Juan"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="apellido" className="form-label">
                Apellido *
              </label>
              <input
                type="text"
                id="apellido"
                className="form-control"
                placeholder="Pérez"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Correo electrónico *
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
            <label htmlFor="telefono" className="form-label">
              Teléfono
            </label>
            <input
              type="tel"
              id="telefono"
              className="form-control"
              placeholder="1122334455"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Contraseña *
            </label>
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="rol" className="form-label">
              Tipo de Usuario *
            </label>
            <select
              id="rol"
              className="form-select"
              value={rol}
              onChange={(e) => setRol(e.target.value as UserRole)}
            >
              <option value="cliente">Cliente (Dueño de Mascota)</option>
              <option value="profesional">Personal Profesional (Veterinario)</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary w-100 mt-2" disabled={loading}>
            {loading ? "Creando cuenta..." : "Registrarse"}
          </button>
        </form>

        <p className="login-link mt-3">
          ¿Ya tenés una cuenta? <Link to="/login">Iniciar sesión</Link>
        </p>
      </div>
    </main>
  );
}

export default Register;