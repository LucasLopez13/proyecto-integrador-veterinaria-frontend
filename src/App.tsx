import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Pets from "./pages/Pets";
import NewPet from "./pages/NewPet";
import NewAppointment from "./pages/NewAppointment";
import ProfessionalAppointments from "./pages/ProfessionalAppointments";
import PetDetails from "./pages/PetDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import MyAppointments from "./pages/MyAppointments";

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