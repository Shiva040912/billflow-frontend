import { NavLink } from "react-router-dom";

import {
  FiBarChart2,
  FiBriefcase,
  FiCreditCard,
  FiHome,
  FiLayers,
  FiUsers,
  FiX,
  FiZap,
} from "react-icons/fi";

import {
  getProviderUser,
  hasProviderPermission,
} from "../utils/ProviderPermission";

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
];

const ProviderSidebar = ({ isSidebarOpen, closeSidebar }) => {
  const providerUser = getProviderUser();
  const providerRole = providerUser?.role;

  const allowedMenuItems = menuItems.filter((item) =>
    hasProviderPermission(providerRole, item.permission)
  );

  return (
    <aside
      className={`provider-sidebar ${
        isSidebarOpen ? "provider-sidebar-open" : ""
      }`}
    >
      <div className="provider-sidebar-top">
        <div className="provider-brand">
          <div className="provider-brand-mark">
            <FiZap />
          </div>

          <div className="provider-brand-text">
            <h2>BillFlow</h2>
            <span>Provider Console</span>
          </div>
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

      <div className="provider-sidebar-content">
        <p className="provider-nav-label">Workspace</p>

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
              <span className="provider-sidebar-icon">{item.icon}</span>

              <span className="provider-sidebar-name">{item.name}</span>

              <span className="provider-active-marker" />
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default ProviderSidebar;