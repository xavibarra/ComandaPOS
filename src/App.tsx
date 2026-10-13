import { Route, Routes } from "react-router-dom";
import AdminPage from "./features/admin/AdminPage";
import LoginPage from "./features/auth/LoginPage";
import ProtectedRoute from "./features/auth/ProtectedRoute";
import CamareroPage from "./features/camarero/CamareroPage";
import ComandaPage from "./features/camarero/ComandaPage";
import CocinaPage from "./features/cocina/CocinaPage";
function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route
        path="/camarero"
        element={
          <ProtectedRoute>
            <CamareroPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/comandaPage/:comandaId"
        element={
          <ProtectedRoute>
            <ComandaPage />
          </ProtectedRoute>
        }
      />
      <Route path="/cocina" element={<CocinaPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
