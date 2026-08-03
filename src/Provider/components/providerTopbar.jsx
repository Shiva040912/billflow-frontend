import { FiBell, FiLogOut, FiMenu, FiSearch } from "react-icons/fi";

const ProviderTopbar = ({ openSidebar }) => {
  const handleLogout = () => {
    localStorage.removeItem("billFlowProviderAccessToken");
    localStorage.removeItem("billFlowProviderUser");

    window.location.href = "/provider/login";
  };

  return (
    <header className="provider-topbar">
      <div className="provider-topbar-left">
        <button
          type="button"
          className="provider-menu-btn"
          onClick={openSidebar}
        >
          <FiMenu />
        </button>

        <div>
          <h2>Dashboard</h2>
          <p>Welcome back, Super Admin</p>
        </div>
      </div>

      <div className="provider-topbar-right">
        <div className="provider-search-box">
          <FiSearch />

          <input
            type="text"
            placeholder="Search companies, plans..."
          />
        </div>

        <button
          type="button"
          className="provider-topbar-icon"
        >
          <FiBell />
        </button>

        <button
          type="button"
          className="provider-logout-btn"
          onClick={handleLogout}
        >
          <FiLogOut />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default ProviderTopbar;