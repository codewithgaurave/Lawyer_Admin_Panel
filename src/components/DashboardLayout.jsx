// src/components/DashboardLayout.jsx
import { useState, useMemo, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import routes from ".././route/SidebarRaoute";
import Sidebar from "../pages/Sidebar";
import Header from "./Header";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { admin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const currentPageTitle = useMemo(() => {
    return routes.find((route) => route.path === location.pathname)?.name || "Dashboard";
  }, [location.pathname]);

  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
  const closeSidebar  = useCallback(() => setSidebarOpen(false), []);

  const handleLogout = useCallback(() => {
    logout();
    navigate("/login", { replace: true });
  }, [logout, navigate]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        routes={routes}
        currentPath={location.pathname}
        logout={handleLogout}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} currentPageTitle={currentPageTitle} />

        <main className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <Outlet /> 
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;