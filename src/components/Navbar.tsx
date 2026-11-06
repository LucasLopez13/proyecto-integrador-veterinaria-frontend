import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Navbar.css";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    setMenuAbierto(false);
  }, [location.pathname]);

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    setMenuAbierto(false);
    logout();
    navigate("/login");
  };

  const rawRole =
    typeof user.rol === "object" && (user.rol as any)?.nombre
      ? (user.rol as any).nombre
      : user.role || user.rol || "";

  const role = String(rawRole).toLowerCase().trim();

  const isProfessional =
    role === "profesional" ||
    role === "admin";

  const canManageBilling =
    role === "profesional" ||
    role === "admin" ||
    role === "recepcion";

  const homePath = isProfessional ? "/profesional/turnos" : "/mascotas";

  const cerrarMenu = () => setMenuAbierto(false);

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom border-violet-subtle sticky-top">
      <div className="container">
        <Link
          className="navbar-brand d-flex align-items-center gap-2 fw-bold text-violet"
          to={homePath}
          onClick={cerrarMenu}
        >
          <i
            className="bi bi-shield-plus text-primary fs-5"
            style={{ color: "var(--vet-primary, #6D28D9)" }}
          ></i>
          <span className="brand-title">VetCare</span>
        </Link>

        <button
          type="button"
          className="navbar-toggler border rounded-2 px-2 py-1 shadow-none d-lg-none"
          style={{
            borderColor: "var(--vet-border-tint, #EDE9FE)",
            color: "var(--vet-text-main, #1E1B4B)",
          }}
          aria-controls="vetcare-navbar-nav"
          aria-expanded={menuAbierto}
          aria-label="Alternar menu de navegacion"
          onClick={() => setMenuAbierto((prev) => !prev)}
        >
          <i className={`bi ${menuAbierto ? "bi-x-lg" : "bi-list"} fs-4`}></i>
        </button>

        <div
          id="vetcare-navbar-nav"
          className={`collapse navbar-collapse ${menuAbierto ? "show" : ""}`}
        >
          <div className="navbar-nav ms-auto d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center gap-1 pt-3 pt-lg-0">
            {role === "cliente" && (
              <>
                <Link className="nav-link" to="/mascotas" onClick={cerrarMenu}>
                  <i className="bi bi-heart me-1 d-lg-none"></i> Mis mascotas
                </Link>
                <Link className="nav-link" to="/mascotas/nueva" onClick={cerrarMenu}>
                  <i className="bi bi-plus-circle me-1 d-lg-none"></i> Registrar mascota
                </Link>
                <Link className="nav-link" to="/mis-turnos" onClick={cerrarMenu}>
                  <i className="bi bi-calendar-check me-1 d-lg-none"></i> Mis turnos
                </Link>

                <Link className="nav-link" to="/recetas" onClick={cerrarMenu}>
                  <i className="bi bi-capsule me-1 d-lg-none"></i> Mis recetas
                </Link>
              </>
            )}

            {isProfessional && (
              <>
                <Link
                  className="nav-link d-inline-flex align-items-center gap-1"
                  to="/profesional/turnos"
                  onClick={cerrarMenu}
                >
                  <i className="bi bi-calendar-check"></i> Turnos
                </Link>

                <Link
                  className="nav-link d-inline-flex align-items-center gap-1"
                  to="/profesional/pacientes"
                  onClick={cerrarMenu}
                >
                  <i className="bi bi-heart"></i> Pacientes
                </Link>

                <Link
                  className="nav-link nav-link-triage d-inline-flex align-items-center gap-1"
                  to="/profesional/triage"
                  onClick={cerrarMenu}
                >
                  <i className="bi bi-heart-pulse text-danger"></i> Triage &amp; Urgencias
                </Link>

                <Link
                  className="nav-link d-inline-flex align-items-center gap-1"
                  to="/profesional/alertas-stock"
                  onClick={cerrarMenu}
                >
                  <i className="bi bi-exclamation-triangle"></i> Alertas de stock
                </Link>
              </>
            )}

            {canManageBilling && (
              <Link
                className="nav-link d-inline-flex align-items-center gap-1"
                to="/facturacion/ordenes"
                onClick={cerrarMenu}
              >
                <i className="bi bi-receipt"></i> Facturacion
              </Link>
            )}

            <div className="d-flex align-items-center justify-content-between gap-2 mt-2 mt-lg-0 pt-2 pt-lg-0">
              <div className="user-profile-chip ms-lg-3 me-2 d-flex align-items-center gap-2">
                <span className="user-avatar-squircle">
                  {user.nombre ? user.nombre.charAt(0).toUpperCase() : "U"}
                </span>
                <div className="user-info-text text-start">
                  <span className="user-name d-block">{user.nombre || "Usuario"}</span>
                  <small className="user-role-label text-muted d-block">
                    {role || "Tutor"}
                  </small>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-outline-secondary btn-sm rounded-2 d-inline-flex align-items-center gap-1"
                onClick={handleLogout}
                title="Cerrar sesion"
              >
                <i className="bi bi-box-arrow-right"></i> Salir
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
