import { useState } from "react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import "../styles/dashboard-layout.css";

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] =
    useState(false);

  const openSidebar = () => {
    setIsSidebarOpen(true);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
      />

      {isSidebarOpen && (
        <button
          type="button"
          className="sidebar-mobile-overlay"
          onClick={closeSidebar}
          aria-label="Close sidebar"
        />
      )}

      <div className="dashboard-wrapper">
        <Topbar onMenuClick={openSidebar} />

        <main className="dashboard-main">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;