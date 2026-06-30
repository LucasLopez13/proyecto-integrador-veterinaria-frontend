import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUser } from "../services/userService";

export default function Register() {
  const [nickName, setNickName] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      await createUser({ nickName });
      navigate("/login");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    }
  };

  return (
    <main className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="card-title mb-4">Registro</h2>

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

                {error && (
                  <div className="alert alert-danger">
                    {error}
                  </div>
                )}

                <div className="d-grid">
                  <button type="submit" className="btn btn-primary">
                    Registrarse
                  </button>
                </div>
              </form>

              <p className="mt-3 mb-0 text-center">
                ¿Ya tenés cuenta?{" "}
                <Link to="/login">Iniciar sesión</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}