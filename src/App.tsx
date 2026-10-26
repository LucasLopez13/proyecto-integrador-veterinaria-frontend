import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Pets from "./pages/Pets";
import NewPet from "./pages/NewPet";
import NewAppointment from "./pages/NewAppointment";
import ProfessionalAppointments from "./pages/ProfessionalAppointments";
import PetDetails from "./pages/PetDetails";
import MedicalAttention from "./pages/MedicalAttention";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import MyAppointments from "./pages/MyAppointments";
import AlertasStock from "./pages/AlertasStock";
import ProfessionalRoute from "./components/ProfessionalRoute";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />

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
          path="/mascotas/nueva"
          element={
            <ProtectedRoute>
              <NewPet />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mascotas/nueva"
          element={
            <ProtectedRoute>
              <NewPet />
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
      </Routes>
    </>
  );
}

export default App;