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

  return (
    <nav className="navbar navbar-expand-lg bg-dark navbar-dark">
      <div className="container">
        <Link className="navbar-brand" to="/mascotas">
          Sistema Veterinario
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
            </>
          )}

          {user.role === "profesional" && (
            <Link className="nav-link" to="/profesional/turnos">
              Turnos
            </Link>
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