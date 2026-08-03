import { Navigate, Outlet } from "react-router-dom";

import {
  getProviderUser,
  hasProviderPermission,
} from "../utils/providerPermissions";

const ProviderPermissionRoute = ({ permission }) => {
  const providerUser = getProviderUser();

  const hasAccess = hasProviderPermission(
    providerUser?.role,
    permission
  );

  if (!hasAccess) {
    return <Navigate to="/provider/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProviderPermissionRoute;