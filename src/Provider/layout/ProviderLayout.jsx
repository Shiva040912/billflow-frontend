import { useState } from "react";
import { Outlet } from "react-router-dom";

import ProviderSidebar from "../components/ProviderSidebar";
import ProviderTopbar from "../components/providerTopbar";

import "../styles/layout.css";

const ProviderLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const openSidebar = () => {
    setIsSidebarOpen(true);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="provider-layout">
      <ProviderSidebar
        isSidebarOpen={isSidebarOpen}
        closeSidebar={closeSidebar}
      />

      {isSidebarOpen && (
        <button
          type="button"
          className="provider-sidebar-overlay"
          onClick={closeSidebar}
          aria-label="Close sidebar"
        />
      )}

      <div className="provider-layout-main">
        <ProviderTopbar openSidebar={openSidebar} />

        <main className="provider-page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ProviderLayout;