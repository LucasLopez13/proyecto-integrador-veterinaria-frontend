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

  const homePath =
    user.role === "profesional" || user.rol === "profesional"
      ? "/profesional/turnos"
      : "/mascotas";

  return (
    <nav className="navbar navbar-expand-lg bg-dark navbar-dark">
      <div className="container">
        <Link className="navbar-brand" to={homePath}>
          🐾 VetCare
        </Link>

        <div className="navbar-nav ms-auto">
          {user.role === "cliente" && (
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


          {(user.role === "profesional" || user.rol === "profesional") && (
            <>
              <Link className="nav-link" to="/profesional/turnos">
                Turnos
              </Link>

              <Link className="nav-link" to="/profesional/alertas-stock">
                Alertas de stock
              </Link>
            </>
          )}


          <button
            type="button"
            className="btn btn-outline-light ms-lg-3"
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;