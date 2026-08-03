import { NavLink } from "react-router-dom";
import {
  FiBarChart2,
  FiBriefcase,
  FiCreditCard,
  FiHome,
  FiLayers,
  FiSettings,
  FiUsers,
  FiUserCheck,
  FiX,
} from "react-icons/fi";

import {
  getProviderUser,
  hasProviderPermission,
} from "../utils/providerPermission";

const menuItems = [
  {
    name: "Dashboard",
    path: "/provider/dashboard",
    permission: "dashboard",
    icon: <FiHome />,
  },
  {
    name: "Companies",
    path: "/provider/companies",
    permission: "companies",
    icon: <FiBriefcase />,
  },
  {
    name: "Employees",
    path: "/provider/employees",
    permission: "employees",
    icon: <FiUsers />,
  },
  {
    name: "Plans",
    path: "/provider/plans",
    permission: "plans",
    icon: <FiLayers />,
  },
  {
    name: "Subscriptions",
    path: "/provider/subscriptions",
    permission: "subscriptions",
    icon: <FiUserCheck />,
  },
  {
    name: "Payments",
    path: "/provider/payments",
    permission: "payments",
    icon: <FiCreditCard />,
  },
  {
    name: "Reports",
    path: "/provider/reports",
    permission: "reports",
    icon: <FiBarChart2 />,
  },
  {
    name: "Settings",
    path: "/provider/settings",
    permission: "settings",
    icon: <FiSettings />,
  },
];

const ProviderSidebar = ({ isSidebarOpen, closeSidebar }) => {
  const providerUser = getProviderUser();
  const providerRole = providerUser?.role;

  const allowedMenuItems = menuItems.filter((item) =>
    hasProviderPermission(providerRole, item.permission),
  );

  return (
    <aside
      className={`provider-sidebar ${
        isSidebarOpen ? "provider-sidebar-open" : ""
      }`}
    >
      <div className="provider-sidebar-header">
        <div>
          <h2>BillFlow</h2>
          <span>Provider Admin</span>
        </div>

        <button
          type="button"
          className="provider-sidebar-close"
          onClick={closeSidebar}
          aria-label="Close sidebar"
        >
          <FiX />
        </button>
      </div>

      <nav className="provider-sidebar-nav">
        {allowedMenuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive
                ? "provider-sidebar-link active"
                : "provider-sidebar-link"
            }
            onClick={closeSidebar}
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default ProviderSidebar;