import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getUsers } from "../services/userService";
import type { User } from "../types/User";

export default function Login() {
  const [nickName, setNickName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

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
  };

  return (
    <div>
      <h2>Iniciar Sesión</h2>

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

        <div>
          <label>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p>{error}</p>}

        <button type="submit">Ingresar</button>
      </form>

      <p>
        ¿No tenés cuenta? <Link to="/register">Registrate</Link>
      </p>
    </div>
  );
}