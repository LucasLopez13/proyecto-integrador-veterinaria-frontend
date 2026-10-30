import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Pets from "./pages/Pets";
import NewPet from "./pages/NewPet";
import NewAppointment from "./pages/NewAppointment";
import ProfessionalAppointments from "./pages/ProfessionalAppointments";
import PetDetails from "./pages/PetDetails";
import MedicalAttention from "./pages/MedicalAttention";
import TriageBoard from "./pages/TriageBoard";
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
            <RoleProtectedRoute
              allowedRoles={["cliente"]}
              redirectTo="/profesional/turnos"
            >
              <Pets />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/mascotas/nueva"
          element={
            <RoleProtectedRoute
              allowedRoles={["cliente"]}
              redirectTo="/profesional/turnos"
            >
              <NewPet />
            </RoleProtectedRoute>
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
            <RoleProtectedRoute
              allowedRoles={["cliente"]}
              redirectTo="/profesional/turnos"
            >
              <PetDetails />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/turnos/nuevo"
          element={
            <RoleProtectedRoute
              allowedRoles={["cliente"]}
              redirectTo="/profesional/turnos"
            >
              <NewAppointment />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/mis-turnos"
          element={
            <RoleProtectedRoute
              allowedRoles={["cliente"]}
              redirectTo="/profesional/turnos"
            >
              <MyAppointments />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/recetas"
          element={
            <RoleProtectedRoute
              allowedRoles={["cliente"]}
              redirectTo="/profesional/turnos"
            >
              <MyRecipes />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/profesional/turnos"
          element={
            <RoleProtectedRoute
              allowedRoles={["profesional", "admin"]}
              redirectTo="/mascotas"
            >
              <ProfessionalAppointments />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/profesional/atencion"
          element={
            <RoleProtectedRoute
              allowedRoles={["profesional", "admin"]}
              redirectTo="/mascotas"
            >
              <MedicalAttention />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/profesional/mascotas/nueva"
          element={
            <RoleProtectedRoute
              allowedRoles={["profesional", "admin"]}
              redirectTo="/mascotas"
            >
              <NewPet />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/profesional/mascotas/:id"
          element={
            <RoleProtectedRoute
              allowedRoles={["profesional", "admin"]}
              redirectTo="/mascotas"
            >
              <PetDetails />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/profesional/triage"
          element={
            <RoleProtectedRoute
              allowedRoles={["profesional", "admin"]}
              redirectTo="/mascotas"
            >
              <TriageBoard />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/triage"
          element={
            <RoleProtectedRoute
              allowedRoles={["profesional", "admin"]}
              redirectTo="/mascotas"
            >
              <TriageBoard />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/profesional/pagos"
          element={
            <RoleProtectedRoute
              allowedRoles={["profesional", "admin"]}
              redirectTo="/mascotas"
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
