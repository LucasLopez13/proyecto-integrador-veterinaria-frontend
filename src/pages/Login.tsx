import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getUsers } from "../services/userService";
import type { User } from "../types/User";
import "../styles/Login.css";
export default function Login() {
  const [nickName, setNickName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setError("");

    try {
      const users = await getUsers();

      const user = users.find(
        (user: User) => user.nickName === nickName
      );

      if (!user) {
        setError("Usuario no encontrado");
        return;
      }

      if (password !== "123456") {
        setError("Contraseña incorrecta");
        return;
      }

      login(user);
      navigate("/");
    } catch {
      setError("Error al conectar con el servidor");
    }
  };

  return (
    <main className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow auth-card">
            <div className="card-body">
              <h2 className="card-title mb-4">Iniciar sesión</h2>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">NickName</label>
                  <input
                    type="text"
                    className="form-control"
                    value={nickName}
                    onChange={(e) => setNickName(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Contraseña</label>
                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <div className="alert alert-danger">
                    {error}
                  </div>
                )}

                <div className="d-grid">
                  <button type="submit" className="btn btn-primary">
                    Ingresar
                  </button>
                </div>
              </form>

              <p className="mt-3 mb-0 text-center">
                ¿No tenés cuenta?{" "}
                <Link to="/register">
                  Registrate
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}