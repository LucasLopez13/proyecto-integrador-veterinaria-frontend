import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API_URL from "../services/api";

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
      const response = await fetch(
        `${API_URL}/users`
      );

      const users = await response.json();

      const user = users.find(
        (u: any) => u.nickName === nickName
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
    } catch (error) {
      setError(
        "Error al conectar con el servidor"
      );
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow">
            <div className="card-body">
              <h2 className="text-center mb-4">
                Iniciar Sesión
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">
                    NickName
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    value={nickName}
                    onChange={(e) =>
                      setNickName(e.target.value)
                    }
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Contraseña
                  </label>

                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    required
                  />
                </div>

                {error && (
                  <div className="alert alert-danger">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                >
                  Ingresar
                </button>
              </form>

              <p className="text-center mt-3 mb-0">
                ¿No tenés cuenta?{" "}
                <Link to="/register">
                  Registrate
                </Link>
              </p>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}