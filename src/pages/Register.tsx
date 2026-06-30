import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUser } from "../services/userService";

export default function Register() {
  const [nickName, setNickName] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
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
    <div>
      <h2>Registro</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>NickName</label>
          <input
            type="text"
            value={nickName}
            onChange={(e) => setNickName(e.target.value)}
            required
          />
        </div>

        {error && <p>{error}</p>}

        <button type="submit">Registrarse</button>
      </form>

      <p>
        ¿Ya tenés cuenta? <Link to="/login">Iniciar sesión</Link>
      </p>
    </div>
  );
}