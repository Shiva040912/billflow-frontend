import {
  FiBarChart2,
  FiBox,
  FiCreditCard,
  FiGrid,
  FiLogOut,
  FiPackage,
  FiSettings,
  FiShoppingCart,
  FiTruck,
  FiUsers,
  FiX,
} from "react-icons/fi";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem(
      "billFlowAccessToken",
    );
    localStorage.removeItem("billFlowUser");
    localStorage.removeItem("billFlowCompany");

    if (onClose) {
      onClose();
    }

    navigate("/", {
      replace: true,
    });
  };

  const handleNavigation = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleBrandClick = () => {
    navigate("/dashboard");
    handleNavigation();
  };

  const getLinkClassName = ({ isActive }) =>
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
      <div className="sidebar-top">
        <button
          type="button"
          className="sidebar-brand"
          onClick={handleBrandClick}
        >
          <div className="sidebar-logo">B</div>

          <div className="sidebar-brand-details">
            <h2>BillFlow</h2>
            <p>Billing Software</p>
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

      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard"
          className={getLinkClassName}
          onClick={handleNavigation}
        >
          <FiGrid />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/billing"
          className={getLinkClassName}
          onClick={handleNavigation}
        >
          <FiCreditCard />
          <span>POS Billing</span>
        </NavLink>

        <NavLink
          to="/products"
          className={getLinkClassName}
          onClick={handleNavigation}
        >
          <FiBox />
          <span>Products</span>
        </NavLink>

        <NavLink
          to="/categories"
          className={getLinkClassName}
          onClick={handleNavigation}
        >
          <FiPackage />
          <span>Categories</span>
        </NavLink>

        <NavLink
          to="/customers"
          className={getLinkClassName}
          onClick={handleNavigation}
        >
          <FiUsers />
          <span>Customers</span>
        </NavLink>

        <NavLink
          to="/suppliers"
          className={getLinkClassName}
          onClick={handleNavigation}
        >
          <FiTruck />
          <span>Suppliers</span>
        </NavLink>

        <NavLink
          to="/inventory"
          className={getLinkClassName}
          onClick={handleNavigation}
        >
          <FiShoppingCart />
          <span>Inventory</span>
        </NavLink>

        <NavLink
          to="/reports"
          className={getLinkClassName}
          onClick={handleNavigation}
        >
          <FiBarChart2 />
          <span>Reports</span>
        </NavLink>

        <NavLink
          to="/settings"
          className={getLinkClassName}
          onClick={handleNavigation}
        >
          <FiSettings />
          <span>Settings</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button
          type="button"
          className="sidebar-logout-button"
          onClick={handleLogout}
        >
          <FiLogOut />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;