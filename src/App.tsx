import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Pets from "./pages/Pets";
import NewAppointment from "./pages/NewAppointment";
import ProfessionalAppointments from "./pages/ProfessionalAppointments";
import PetDetails from "./pages/PetDetails";
import MedicalAttention from "./pages/MedicalAttention";
import TriageBoard from "./pages/TriageBoard";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import MyAppointments from "./pages/MyAppointments";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import PaymentManagement from "./pages/PaymentManagement";
import PublicVaccinationCard from "./pages/PublicVaccinationCard";
import AlertasStock from "./pages/AlertasStock";
import ProfessionalRoute from "./components/ProfessionalRoute";
import MyRecipes from "./pages/MyRecipes";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />

        <Route
          path="/carnet/:token"
          element={<PublicVaccinationCard />}
        />

        <Route
          path="/mascotas"
          element={
            <ProtectedRoute>
              <Pets />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profesional/alertas-stock"
          element={
            <ProfessionalRoute>
              <AlertasStock />
            </ProfessionalRoute>
          }
        />

        <Route
          path="/mascotas/:id"
          element={
            <ProtectedRoute>
              <PetDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/turnos/nuevo"
          element={
            <ProtectedRoute>
              <NewAppointment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mis-turnos"
          element={
            <ProtectedRoute>
              <MyAppointments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recetas"
          element={
            <ProtectedRoute>
              <MyRecipes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profesional/turnos"
          element={
            <ProtectedRoute>
              <ProfessionalAppointments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profesional/atencion"
          element={
            <ProtectedRoute>
              <MedicalAttention />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profesional/mascotas/:id"
          element={
            <ProtectedRoute>
              <PetDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profesional/triage"
          element={
            <ProtectedRoute>
              <TriageBoard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/triage"
          element={
            <ProtectedRoute>
              <TriageBoard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profesional/pagos"
          element={
            <RoleProtectedRoute
              allowedRoles={["profesional", "veterinario", "admin"]}
            >
              <PaymentManagement />
            </RoleProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;

