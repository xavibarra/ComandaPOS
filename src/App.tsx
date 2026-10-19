import { Route, Routes } from "react-router-dom";
import AdminPage from "./features/admin/AdminPage";
import LoginPage from "./features/auth/LoginPage";
import ProtectedRoute from "./features/auth/ProtectedRoute";
import KitchenPage from "./features/kitchen/KitchenPage";
import OrderPage from "./features/waiter/order/OrderPage";
import WaiterPage from "./features/waiter/tables/WaiterPage";
function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route
        path="/waiter"
        element={
          <ProtectedRoute>
            <WaiterPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/order/:orderId"
        element={
          <ProtectedRoute>
            <OrderPage />
          </ProtectedRoute>
        }
      />
      <Route path="/kitchen" element={<KitchenPage />} />
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
