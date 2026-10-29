
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Navbar.css";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const role = user.role || user.rol;

  const isProfessional =
    role === "profesional" ||
    role === "veterinario" ||
    role === "admin";

  const homePath = isProfessional ? "/profesional/turnos" : "/mascotas";

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom border-violet-subtle sticky-top">
      <div className="container">
        <Link
          className="navbar-brand d-flex align-items-center gap-2 fw-bold text-violet"
          to={homePath}
        >
          <i
            className="bi bi-shield-plus text-primary fs-5"
            style={{ color: "var(--vet-primary, #6D28D9)" }}
          ></i>
          <span className="brand-title">VetCare</span>
        </Link>

        <div className="navbar-nav ms-auto d-flex align-items-center gap-1">
          {role === "cliente" && (
            <>
              <Link className="nav-link" to="/mascotas">
                Mis mascotas
              </Link>
              <Link className="nav-link" to="/mascotas/nueva">
                Registrar mascota
              </Link>
              <Link className="nav-link" to="/mis-turnos">
                Mis turnos
              </Link>
            </>
          )}

          {isProfessional && (
            <>
              <Link
                className="nav-link d-inline-flex align-items-center gap-1"
                to="/profesional/turnos"
              >
                <i className="bi bi-calendar-check"></i> Turnos
              </Link>

              <Link
                className="nav-link nav-link-triage d-inline-flex align-items-center gap-1"
                to="/profesional/triage"
              >
                <i className="bi bi-heart-pulse text-danger"></i> Triage &amp; Urgencias
              </Link>

              <Link
                className="nav-link d-inline-flex align-items-center gap-1"
                to="/profesional/pagos"
              >
                <i className="bi bi-wallet2"></i> Pagos
              </Link>

              <Link
                className="nav-link d-inline-flex align-items-center gap-1"
                to="/profesional/alertas-stock"
              >
                <i className="bi bi-exclamation-triangle"></i> Alertas de stock
              </Link>
            </>
          )}

          <div className="user-profile-chip ms-lg-3 me-2 d-none d-sm-flex align-items-center gap-2">
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
            title="Cerrar sesión"
          >
            <i className="bi bi-box-arrow-right"></i> Salir
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
