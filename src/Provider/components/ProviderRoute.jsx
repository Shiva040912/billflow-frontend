import { Navigate, Route, Routes } from "react-router-dom";

import ProviderProtectedRoute from "../components/providerProtectedRoute";
import ProviderPermissionRoute from "../components/ProviderPermissionRoute";
import ProviderLayout from "../layout/ProviderLayout";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Companies from "../pages/Companies";
import Employees from "../pages/Employees";
import Plans from "../pages/Plans";
import Subscriptions from "../pages/Subscriptions";
import Payments from "../pages/Payments";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";

const ProviderRoutes = () => {
  return (
    <Routes>
      <Route path="login" element={<Login />} />

      <Route element={<ProviderProtectedRoute />}>
        <Route element={<ProviderLayout />}>
          <Route path="dashboard" element={<Dashboard />} />

          <Route element={<ProviderPermissionRoute permission="companies" />}>
            <Route path="companies" element={<Companies />} />
          </Route>

          <Route element={<ProviderPermissionRoute permission="employees" />}>
            <Route path="employees" element={<Employees />} />
          </Route>

          <Route element={<ProviderPermissionRoute permission="plans" />}>
            <Route path="plans" element={<Plans />} />
          </Route>

          <Route
            element={
              <ProviderPermissionRoute permission="subscriptions" />
            }
          >
            <Route path="subscriptions" element={<Subscriptions />} />
          </Route>

          <Route element={<ProviderPermissionRoute permission="payments" />}>
            <Route path="payments" element={<Payments />} />
          </Route>

          <Route element={<ProviderPermissionRoute permission="reports" />}>
            <Route path="reports" element={<Reports />} />
          </Route>

          <Route element={<ProviderPermissionRoute permission="settings" />}>
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>
      </Route>

      <Route path="" element={<Navigate to="dashboard" replace />} />

      <Route
        path="*"
        element={<Navigate to="/provider/dashboard" replace />}
      />
    </Routes>
  );
};

export default ProviderRoutes;