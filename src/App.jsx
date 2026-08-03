import { BrowserRouter, Route, Routes } from "react-router-dom";

import DashboardLayout from "./Reciver/layouts/DashboardLayout";
import ProtectedRoute from "./Reciver/components/ProtectedRoute";

import Home from "./Reciver/pages/Home";
import Login from "./Reciver/pages/Login";
import ChoosePlan from "./Reciver/pages/ChoosePlan";
import CreateCompany from "./Reciver/pages/CreateCompany";
import Dashboard from "./Reciver/pages/Dashboard";
import Payment from "./Reciver/pages/Payment";
import Products from "./Reciver/pages/Products";
import Categories from "./Reciver/pages/Categories";
import Billing from "./Reciver/pages/Billing";
import Customers from "./Reciver/pages/Customers";
import Suppliers from "./Reciver/pages/Suppliers";
import Inventory from "./Reciver/pages/Inventory";
import Sales from "./Reciver/pages/Sales";
import Report from "./Reciver/pages/Report";
import Settings from "./Reciver/pages/Settings";

import ProviderRoutes from "./Provider/routes/ProviderRoutes";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Receiver Public Routes */}
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/create-company" element={<CreateCompany />} />

        <Route path="/choose-plan" element={<ChoosePlan />} />

        <Route path="/payment" element={<Payment />} />

        {/* Receiver Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Products />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Categories />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Customers />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/billing"
          element={
            <ProtectedRoute>
              <Billing />
            </ProtectedRoute>
          }
        />

        <Route
          path="/suppliers"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Suppliers />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Inventory />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/sales"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Sales />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Report />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Settings />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Provider Routes */}
        <Route path="/provider/*" element={<ProviderRoutes />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;