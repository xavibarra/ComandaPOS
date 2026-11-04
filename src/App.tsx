import { Route, Routes } from "react-router-dom";
import AdminPanelPage from "./features/admin/AdminPanelPage";
import CategoriesAdminPage from "./features/admin/categories/CategoriesAdminPage";
import DishesAdminPage from "./features/admin/dishes/DishesAdminPage";
import SecurityAdminPage from "./features/admin/security/SecurityAdminPage";
import TablesAdminPage from "./features/admin/tables/TablesAdminPage";
import WaitersAdminPage from "./features/admin/waiters/WaitersAdminPage";
import LoginPage from "./features/auth/LoginPage";
import ProtectedRoute from "./features/auth/ProtectedRoute";
import BarPage from "./features/waiter/bar/BarPage";
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
      <Route
        path="/bar"
        element={
          <ProtectedRoute>
            <BarPage />
          </ProtectedRoute>
        }
      />
      <Route path="/kitchen" element={<KitchenPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminPanelPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/waiters"
        element={
          <ProtectedRoute adminOnly>
            <WaitersAdminPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dishes"
        element={
          <ProtectedRoute adminOnly>
            <DishesAdminPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/security"
        element={
          <ProtectedRoute adminOnly>
            <SecurityAdminPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <ProtectedRoute adminOnly>
            <CategoriesAdminPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tables"
        element={
          <ProtectedRoute adminOnly>
            <TablesAdminPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
