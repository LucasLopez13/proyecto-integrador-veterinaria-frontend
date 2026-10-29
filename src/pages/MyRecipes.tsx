import { useEffect, useState } from "react";
import type { Recipe } from "../types/Recipe";
import { recipeService } from "../services/recipeService";
import "../styles/MyRecipes.css";

function MyRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarRecetas = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await recipeService.getAll();
        setRecipes(data);
      } catch (err: any) {
        console.error("Error al cargar recetas:", err);
        setError(err.message || "Error al conectar con el servidor");
      } finally {
        setLoading(false);
      }
    };

    cargarRecetas();
  }, []);

  if (loading) {
    return (
      <main className="recipes-page">
        <div className="recipes-container">
          <div className="recipes-loading">
            <p>Cargando tus recetas...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="recipes-page">
      <div className="recipes-container">

        <div className="recipes-header">
          <h1>Mis recetas</h1>
          <p>
            Consultá las recetas e indicaciones de tus mascotas.
          </p>
        </div>

        {error && (
          <div className="recipes-error">
            {error}
          </div>
        )}

        {!error && recipes.length === 0 && (
          <div className="recipes-empty">
            <div className="recipes-empty-icon">💊</div>

            <h3>No tenés recetas registradas</h3>

            <p>
              Cuando un profesional registre una receta, podrás verla
              en esta sección.
            </p>
          </div>
        )}

        {recipes.length > 0 && (
          <div className="recipes-grid">
            {recipes.map((recipe) => (
              <article className="recipe-card" key={recipe.id}>

                <div className="recipe-card-header">
                  <div className="recipe-medicine">
                    <div className="recipe-medicine-icon">
                      💊
                    </div>

                    <h2>{recipe.medicamento}</h2>
                  </div>

                  <span
                    className={`recipe-status ${
                      recipe.estado === "activo"
                        ? "recipe-status-active"
                        : recipe.estado === "finalizado"
                        ? "recipe-status-finished"
                        : "recipe-status-cancelled"
                    }`}
                  >
                    {recipe.estado}
                  </span>
                </div>

                <div className="recipe-card-body">

                  <div className="recipe-info">
                    <div className="recipe-info-icon">🐾</div>

                    <div className="recipe-info-content">
                      <span className="recipe-info-label">
                        Mascota
                      </span>

                      <span className="recipe-info-value">
                        {recipe.mascota?.nombre || "No disponible"}
                      </span>
                    </div>
                  </div>

                  <div className="recipe-info">
                    <div className="recipe-info-icon">📅</div>

                    <div className="recipe-info-content">
                      <span className="recipe-info-label">
                        Fecha
                      </span>

                      <span className="recipe-info-value">
                        {new Date(recipe.fecha).toLocaleDateString(
                          "es-AR"
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="recipe-info">
                    <div className="recipe-info-icon">👨‍⚕️</div>

                    <div className="recipe-info-content">
                      <span className="recipe-info-label">
                        Profesional
                      </span>

                      <span className="recipe-info-value">
                        {recipe.profesional
                          ? `${recipe.profesional.nombre} ${recipe.profesional.apellido}`
                          : "No disponible"}
                      </span>
                    </div>
                  </div>

                  <div className="recipe-instructions">
                    <div className="recipe-instructions-title">
                      📋 Indicaciones
                    </div>

                    <p className="recipe-instructions-text">
                      {recipe.indicaciones}
                    </p>
                  </div>

                </div>
              </article>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}

export default MyRecipes;