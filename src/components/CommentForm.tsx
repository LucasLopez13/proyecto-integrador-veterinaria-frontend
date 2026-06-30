import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { createComment } from "../services/commentService";

type CommentFormProps = {
  postId: number;
  onCommentAdded: () => void;
};

export default function CommentForm({
  postId,
  onCommentAdded,
}: CommentFormProps) {
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
    <div className="mt-4">
      <h4 className="mb-3">Agregar comentario</h4>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escribí tu comentario..."
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
        >
          Comentar
        </button>
      </form>

      {mensaje && (
        <div className="alert alert-info mt-3 mb-0">
          {mensaje}
        </div>
      )}
    </div>
  );
}