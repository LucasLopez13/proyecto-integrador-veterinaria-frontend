import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";
import type { UserRole } from "../types/User";
import "../styles/Auth.css";

function Register() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rol, setRol] = useState<UserRole>("cliente");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      const formattedPhone = telefono.trim()
        ? telefono.trim().startsWith("+54")
          ? telefono.trim()
          : `+54 ${telefono.trim()}`
        : undefined;

      const data = await authService.register({
        nombre,
        apellido,
        email,
        telefono: formattedPhone,
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
      setError(err.message || "Error al registrarse. Verifique los datos ingresados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card auth-card-wide p-4 p-md-5 shadow-sm">
        {/* Geometric Veterinary Logo in Deep Violet */}
        <div className="text-center mb-4">
          <div className="auth-logo-squircle">
            <i className="bi bi-shield-plus fs-2"></i>
          </div>
          <h1 className="auth-title mb-1">Portal Veterinario</h1>
          <p className="auth-subtitle mb-0">Crear una nueva cuenta en la plataforma</p>
        </div>

        {error && (
          <div className="alert alert-danger py-2 px-3 small rounded-2 mb-3" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* 2-column grid for name and surname */}
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label htmlFor="nombre" className="form-label">
                Nombre *
              </label>
              <input
                type="text"
                id="nombre"
                className="form-control rounded-2"
                placeholder="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="apellido" className="form-label">
                Apellido *
              </label>
              <input
                type="text"
                id="apellido"
                className="form-control rounded-2"
                placeholder="Apellido"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Correo electrónico *
            </label>
            <input
              type="email"
              id="email"
              className="form-control rounded-2"
              placeholder="Correo Electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Phone with +54 prefix */}
          <div className="mb-3">
            <label htmlFor="telefono" className="form-label">
              Teléfono de contacto
            </label>
            <div className="input-group">
              <span className="input-group-text phone-prefix-input">+54</span>
              <input
                type="tel"
                id="telefono"
                className="form-control phone-number-field rounded-end-2"
                placeholder="Teléfono"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
            </div>
          </div>

          {/* 2-column grid for Password and Confirm Password */}
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label htmlFor="password" className="form-label">
                Contraseña *
              </label>
              <input
                type="password"
                id="password"
                className="form-control rounded-2"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="confirmPassword" className="form-label">
                Confirmar Contraseña *
              </label>
              <input
                type="password"
                id="confirmPassword"
                className="form-control rounded-2"
                placeholder="Confirmar Contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Tipo de Usuario */}
          <div className="mb-4">
            <label htmlFor="rol" className="form-label">
              Tipo de Usuario *
            </label>
            <select
              id="rol"
              className="form-select rounded-2"
              value={rol}
              onChange={(e) => setRol(e.target.value as UserRole)}
            >
              <option value="cliente">Cliente (Tutor responsable de mascota)</option>
              <option value="profesional">Personal Profesional (Veterinario/a)</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 rounded-2 py-2 fw-medium shadow-sm"
            disabled={loading}
          >
            {loading ? "Creando cuenta..." : "Crear Cuenta"}
          </button>
        </form>

        <div className="text-center mt-4 pt-2 border-top border-light-subtle">
          <span className="auth-footer-text">¿Ya tenés una cuenta? </span>
          <Link to="/login" className="auth-link">
            Iniciar sesión
          </Link>
        </div>
      </div>
    </main>
  );
}

export default Register;