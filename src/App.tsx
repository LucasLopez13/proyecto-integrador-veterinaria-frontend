import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PostDetail from "./pages/PostDetail";
import Profile from "./pages/Profile";
import CreatePost from "./pages/CreatePost";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/post/:id" element={<PostDetail />} />
      <Route path="/profile"element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/create-post" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;