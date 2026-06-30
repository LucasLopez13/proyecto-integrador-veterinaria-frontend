import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { createComment } from "../services/commentService";

type CommentFormProps = {
  postId: number;
  onCommentAdded: () => void;
};

export default function CommentForm({ postId,onCommentAdded }: CommentFormProps) {
  const [texto, setTexto] = useState("");
  const [mensaje, setMensaje] = useState("");
  
  const { user } = useContext(AuthContext);

  const handleSubmit = async (
  e: React.FormEvent<HTMLFormElement>
  ) => {
  e.preventDefault();

  if (!user) {
    setMensaje("Debés iniciar sesión para comentar.");
    return;
  }

  await createComment({
    texto,
    userNickName: user.nickName,
    postId,
  });

  setTexto("");
  setMensaje("Comentario agregado.");
  onCommentAdded();
};

  return (
    <div>
      <h4>Agregar comentario</h4>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          required
        />

        <button type="submit">Comentar</button>
      </form>

      {mensaje && <p>{mensaje}</p>}
    </div>
  );
}