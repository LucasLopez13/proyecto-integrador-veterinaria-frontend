import { Link } from "react-router-dom";
import "../styles/About.css";

export default function About() {
  return (
    <main className="about-container container py-5">

      <div className="about-hero text-center mb-5">
        <h1>UnaHur Anti-Social</h1>
        <p className="lead">
          Una red social desarrollada como proyecto de la materia
          <strong> Construcción de Interfaces de Usuario.</strong>
        </p>

        <Link to="/" className="btn btn-primary mt-3">
          Volver al inicio
        </Link>
      </div>

      <div className="row g-4">

        <div className="col-md-6">
          <div className="about-card">
            <h3>🎯 Objetivo</h3>

            <p>
              El proyecto tiene como objetivo desarrollar una red social que
              permita a los usuarios registrarse, iniciar sesión, crear
              publicaciones, visualizar contenido e interactuar mediante
              comentarios.
            </p>
          </div>
        </div>

        <div className="col-md-6">
          <div className="about-card">
            <h3>⚙️ Tecnologías</h3>

            <ul>
              <li>React</li>
              <li>TypeScript</li>
              <li>React Router</li>
              <li>Bootstrap</li>
              <li>API REST</li>
            </ul>
          </div>
        </div>

        <div className="col-md-6">
          <div className="about-card">
            <h3>✨ Funcionalidades</h3>

            <ul>
              <li>Registro de usuarios</li>
              <li>Inicio de sesión</li>
              <li>Creación de publicaciones</li>
              <li>Comentarios</li>
              <li>Perfil de usuario</li>
            </ul>
          </div>
        </div>

        <div className="col-md-6">
          <div className="about-card">
            <h3>👥 Equipo</h3>

            <p>
              Aplicación desarrollada como trabajo práctico para la materia
              Construcción de Interfaces de Usuario de la Universidad Nacional
              de Hurlingham.
            </p>
          </div>
        </div>

      </div>

    </main>
  );
}