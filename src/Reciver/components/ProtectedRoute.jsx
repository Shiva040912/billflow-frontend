import {
  Navigate,
  useLocation,
} from "react-router-dom";

const RECEIVER_ROLE_ACCESS = {
  cashier: [
    "dashboard",
    "billing",
    "customers",
  ],

  inventory_manager: [
    "dashboard",
    "products",
    "categories",
    "suppliers",
    "inventory",
  ],

  sales_manager: [
    "dashboard",
    "customers",
    "sales",
    "reports",
  ],

  accountant: [
    "dashboard",
    "billing",
    "sales",
    "reports",
  ],
};

const ProtectedRoute = ({
  children,
  permission,
}) => {
  const location =
    useLocation();

  const accessToken =
    localStorage.getItem(
      "billFlowAccessToken",
    );

  const storedUser =
    localStorage.getItem(
      "billFlowUser",
    );

  if (
    !accessToken ||
    !storedUser
  ) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from:
            location.pathname,
        }}
      />
    );
  }

  let user = null;

  try {
    user =
      JSON.parse(storedUser);
  } catch {
    localStorage.removeItem(
      "billFlowAccessToken",
    );

    localStorage.removeItem(
      "billFlowUser",
    );

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  /*
   * Owner gets full access.
   */
  const isOwner =
    user?.role === "owner" ||
    user?.accountType ===
      "owner";

  if (isOwner) {
    return children;
  }

  /*
   * Employee login.
   */
  const employeeRole =
    user?.employeeRole;

  if (!employeeRole) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  /*
   * If route only needs authentication
   * and no specific permission,
   * allow authenticated employee.
   */
  if (!permission) {
    return children;
  }

  const allowedPermissions =
    RECEIVER_ROLE_ACCESS[
      employeeRole
    ] || [];

  const hasPermission =
    allowedPermissions.includes(
      permission,
    );

  if (!hasPermission) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return children;
};

export default ProtectedRoute;