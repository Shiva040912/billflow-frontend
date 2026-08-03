import { Navigate, Outlet } from "react-router-dom";

const ProviderProtectedRoute = () => {
  const token = localStorage.getItem("billFlowProviderAccessToken");

  const storedUser = localStorage.getItem("billFlowProviderUser");

  let providerUser = null;

  try {
    providerUser = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    providerUser = null;
  }

  const isProviderAuthenticated =
    Boolean(token) &&
    providerUser?.role &&
    providerUser?.role !== "customer";

  if (!isProviderAuthenticated) {
    localStorage.removeItem("billFlowProviderAccessToken");
    localStorage.removeItem("billFlowProviderUser");

    return <Navigate to="/provider/login" replace />;
  }

  return <Outlet />;
};

export default ProviderProtectedRoute;