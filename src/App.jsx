import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

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
import Contact from "./Reciver/pages/Contact";
import Settings from "./Reciver/pages/Settings";
import Employees from "./Reciver/pages/Employee";

import ProviderRoutes from "./Provider/routes/ProviderRoutes";
import ProviderProtectedRoute from "./Provider/components/providerProtectedRoute";
import ProviderLayout from "./Provider/layout/ProviderLayout";
import Support from "./Provider/pages/Supports";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/create-company"
          element={
            <CreateCompany />
          }
        />

        <Route
          path="/choose-plan"
          element={
            <ChoosePlan />
          }
        />

        <Route
          path="/payment"
          element={<Payment />}
        />

       

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute permission="dashboard">
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/products"
          element={
            <ProtectedRoute permission="products">
              <DashboardLayout>
                <Products />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/categories"
          element={
            <ProtectedRoute permission="categories">
              <DashboardLayout>
                <Categories />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/customers"
          element={
            <ProtectedRoute permission="customers">
              <DashboardLayout>
                <Customers />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Owner only */}
        <Route
          path="/employees"
          element={
            <ProtectedRoute permission="employees">
              <DashboardLayout>
                <Employees />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/billing"
          element={
            <ProtectedRoute permission="billing">
              <Billing />
            </ProtectedRoute>
          }
        />

        <Route
          path="/suppliers"
          element={
            <ProtectedRoute permission="suppliers">
              <DashboardLayout>
                <Suppliers />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory"
          element={
            <ProtectedRoute permission="inventory">
              <DashboardLayout>
                <Inventory />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/sales"
          element={
            <ProtectedRoute permission="sales">
              <DashboardLayout>
                <Sales />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute permission="reports">
              <DashboardLayout>
                <Report />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        
        <Route
          path="/contact"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Contact />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        
        <Route
          path="/settings"
          element={
            <ProtectedRoute permission="settings">
              <DashboardLayout>
                <Settings />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

       

        <Route
          element={
            <ProviderProtectedRoute />
          }
        >
          <Route
            element={
              <ProviderLayout />
            }
          >
            <Route
              path="/provider/support"
              element={<Support />}
            />
          </Route>
        </Route>

       

        <Route
          path="/provider/*"
          element={
            <ProviderRoutes />
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;