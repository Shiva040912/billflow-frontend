export const PROVIDER_ROLE_ACCESS = {
  super_admin: [
    "dashboard",
    "companies",
    "employees",
    "plans",
    "subscriptions",
    "payments",
    "reports",
    "settings",
  ],

  support_executive: [
    "dashboard",
    "companies",
  ],

  sales_executive: [
    "dashboard",
    "companies",
    "plans",
    "subscriptions",
  ],

  finance_executive: [
    "dashboard",
    "payments",
    "reports",
  ],

  technical_support: [
    "dashboard",
    "companies",
    "settings",
  ],
};

export const hasProviderPermission = (role, permission) => {
  if (!role || !permission) {
    return false;
  }

  return PROVIDER_ROLE_ACCESS[role]?.includes(permission) || false;
};

export const getProviderUser = () => {
  const storedUser = localStorage.getItem("billFlowProviderUser");

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch {
    localStorage.removeItem("billFlowProviderUser");
    return null;
  }
};