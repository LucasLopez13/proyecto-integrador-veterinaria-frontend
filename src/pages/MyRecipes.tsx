import { useEffect, useState } from "react";
import type { Recipe } from "../types/Recipe";
import { recipeService } from "../services/recipeService";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { EmptyState } from "../components/common/EmptyState";
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
        setError(err.message || "Error al conectar con el servidor");
      } finally {
        setLoading(false);
      }
    };

    cargarRecetas();
  }, []);

  return (
    <main className="recipes-page">
      <div className="recipes-container">

        <div className="recipes-header">
          <div className="recipes-header-info">
            <div className="recipes-header-icon">
              <i className="bi bi-capsule"></i>
            </div>
            <div>
              <h1>Mis recetas</h1>
              <p>
                Consultá las recetas médicas e indicaciones para tus mascotas.
              </p>
            </div>
          </div>
        </div>

        {loading && (
          <div className="recipes-loading-card">
            <LoadingSpinner message="Cargando tus recetas..." />
          </div>
        )}

        {!loading && error && (
          <div className="recipes-error">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <div>
              <h3>Error al cargar recetas</h3>
              <p>{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && recipes.length === 0 && (
          <EmptyState
            icon="bi-capsule"
            title="No tenés recetas registradas"
            description="Cuando un profesional veterinario registre una prescripción médica, podrás consultarla en esta sección."
          />
        )}

        {!loading && !error && recipes.length > 0 && (
          <div className="recipes-grid">
            {recipes.map((recipe) => (
              <article className="recipe-card" key={recipe.id}>

                <div className="recipe-card-header">
                  <div className="recipe-medicine">
                    <div className="recipe-medicine-icon">
                      <i className="bi bi-capsule"></i>
                    </div>

                    <div>
                      <h2>{recipe.medicamento}</h2>
                      <span className="recipe-medicine-subtitle">
                        Prescripción médica
                      </span>
                    </div>
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
                    <i
                      className={`bi ${
                        recipe.estado === "activo"
                          ? "bi-check-circle"
                          : recipe.estado === "finalizado"
                          ? "bi-check2-all"
                          : "bi-x-circle"
                      } me-1`}
                    ></i>
                    {recipe.estado}
                  </span>
                </div>

                <div className="recipe-card-body">

                  <div className="recipe-info">
                    <div className="recipe-info-icon">
                      <i className="bi bi-heart-pulse"></i>
                    </div>

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
                    <div className="recipe-info-icon">
                      <i className="bi bi-calendar3"></i>
                    </div>

                    <div className="recipe-info-content">
                      <span className="recipe-info-label">
                        Fecha de emisión
                      </span>

                      <span className="recipe-info-value">
                        {new Date(recipe.fecha).toLocaleDateString("es-AR")}
                      </span>
                    </div>
                  </div>

                  <div className="recipe-info">
                    <div className="recipe-info-icon">
                      <i className="bi bi-person-badge"></i>
                    </div>

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
                      <i className="bi bi-file-earmark-medical me-1"></i> Indicaciones
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