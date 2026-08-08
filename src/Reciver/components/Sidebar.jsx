import {
  FiBarChart2,
  FiBox,
  FiCreditCard,
  FiGrid,
  FiPackage,
  FiSettings,
  FiShoppingCart,
  FiTruck,
  FiUserCheck,
  FiUsers,
  FiX,
  FiZap,
} from "react-icons/fi";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

const ROLE_ACCESS = {
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
    "reports",
  ],

  accountant: [
    "dashboard",
    "billing",
    "reports",
  ],
};

const menuItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    permission: "dashboard",
    icon: <FiGrid />,
  },
  {
    name: "POS Billing",
    path: "/billing",
    permission: "billing",
    icon: <FiCreditCard />,
  },
  {
    name: "Products",
    path: "/products",
    permission: "products",
    icon: <FiPackage />,
  },
  {
    name: "Categories",
    path: "/categories",
    permission: "categories",
    icon: <FiBox />,
  },
  {
    name: "Customers",
    path: "/customers",
    permission: "customers",
    icon: <FiUsers />,
  },
  {
    name: "Employees",
    path: "/employees",
    permission: "employees",
    icon: <FiUserCheck />,
  },
  {
    name: "Suppliers",
    path: "/suppliers",
    permission: "suppliers",
    icon: <FiTruck />,
  },
  {
    name: "Inventory",
    path: "/inventory",
    permission: "inventory",
    icon: <FiShoppingCart />,
  },
  {
    name: "Reports",
    path: "/reports",
    permission: "reports",
    icon: <FiBarChart2 />,
  },
  {
    name: "Settings",
    path: "/settings",
    permission: "settings",
    icon: <FiSettings />,
  },
];

const Sidebar = ({
  isOpen,
  onClose,
}) => {
  const navigate =
    useNavigate();

  const storedUser =
    localStorage.getItem(
      "billFlowUser"
    );

  let currentUser = null;

  try {
    currentUser =
      storedUser
        ? JSON.parse(
            storedUser
          )
        : null;
  } catch {
    currentUser = null;
  }

  const isOwner =
    currentUser?.role ===
      "owner" ||
    currentUser?.accountType ===
      "owner";

  const employeeRole =
    currentUser?.employeeRole;

  const allowedMenuItems =
    isOwner
      ? menuItems
      : menuItems.filter(
          (item) =>
            ROLE_ACCESS[
              employeeRole
            ]?.includes(
              item.permission
            )
        );

  const handleNavigation =
    () => {
      if (onClose) {
        onClose();
      }
    };

  const handleBrandClick =
    () => {
      navigate(
        "/dashboard"
      );

      handleNavigation();
    };

  const getLinkClassName = ({
    isActive,
  }) =>
    isActive
      ? "sidebar-link active"
      : "sidebar-link";

  return (
    <aside
      className={
        isOpen
          ? "sidebar sidebar-open"
          : "sidebar"
      }
      aria-label="Main navigation"
    >
      <div className="sidebar-header">
        <button
          type="button"
          className="sidebar-brand"
          onClick={
            handleBrandClick
          }
        >
          <span className="sidebar-brand-logo">
            <FiZap />
          </span>

          <div className="sidebar-brand-details">
            <h2>
              Bill<span>Flow</span>
            </h2>

            <p>
              Business Workspace
            </p>
          </div>
        </button>

        <button
          type="button"
          className="sidebar-close-button"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <FiX />
        </button>
      </div>

      <div className="sidebar-section-label">
        Workspace
      </div>

      <nav className="sidebar-nav">
        {allowedMenuItems.map(
          (item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={
                getLinkClassName
              }
              onClick={
                handleNavigation
              }
            >
              <span className="sidebar-link-icon">
                {item.icon}
              </span>

              <span>
                {item.name}
              </span>
            </NavLink>
          )
        )}
      </nav>

      <div className="sidebar-bottom-card">
        <span className="sidebar-bottom-card-icon">
          <FiZap />
        </span>

        <div>
          <strong>
            BillFlow Business
          </strong>

          <p>
            Manage daily work faster.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;