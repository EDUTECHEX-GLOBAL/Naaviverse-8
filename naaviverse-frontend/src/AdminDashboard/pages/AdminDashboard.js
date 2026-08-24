import { Link, useLocation, Outlet } from "react-router-dom";
import {
  FaEnvelope,
  FaUserPlus,
  FaUsers,
  FaSignOutAlt,
  FaBars,
  FaBell,
  FaHome,
  FaTimes,
  FaHeadset,
} from 'react-icons/fa';

import assessalogo from "../../assets/images/logo/naavi_final_logo2.webp";
import { useState } from "react";
import "./AdminStyles.scss";

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-dashboard-shell">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="admin-main-shell">
        {/* Header */}
        <div className="admin-topbar">
          <button className="admin-menu-toggle d-md-none" onClick={() => setSidebarOpen(true)}>
            <FaBars />
          </button>
        </div>

        {/* Outlet for nested routes */}
        <Outlet />
      </div>
    </div>
  );
}

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const handleLogout = () => {
    localStorage.removeItem('superAdminToken');
    window.location.href = '/admin-login';
  };

  return (
    <div
      className={`sidebar-container ${sidebarOpen ? 'open' : ''}`}
      onClick={() => setSidebarOpen(false)}
    >
      <div
        className="sidebar-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button for mobile */}
        <div className="d-flex justify-content-end d-md-none p-2">
          <div
            className="btn-custom"
            onClick={() => setSidebarOpen(false)}
          >
            <FaTimes />
          </div>
        </div>

        <div className="admin-logo-container">
  <img src={assessalogo} alt="Logo" className="admin-logo" />
</div>

        <div className="admin-sidebar">
          <NavItem icon={FaHome} label="Home" path="/admin-dashboard/admin-home" setSidebarOpen={setSidebarOpen} />
          <NavItem icon={FaHeadset} label="Assistance Requests" path="/admin-dashboard/admin-marketplace-assistance" setSidebarOpen={setSidebarOpen} />
          <NavItem icon={FaEnvelope} label="Contact Us" path="/admin-dashboard/admin-contact" setSidebarOpen={setSidebarOpen} />
          <NavItem icon={FaUserPlus} label="Subscribe" path="/admin-dashboard/admin-subscribe" setSidebarOpen={setSidebarOpen} />
          <NavItem icon={FaUsers} label="Visitors" path="/admin-dashboard/admin-visitors" setSidebarOpen={setSidebarOpen} />
          <div
            className="admin-nav-link admin-nav-link--logout"
            style={{ cursor: 'pointer' }}
            onClick={handleLogout}
          >
            <FaSignOutAlt /> Logout
          </div>
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon: Icon, label, path, setSidebarOpen }) {
  const location = useLocation();
  const isActive = location.pathname === path;

  return (
    <Link
      to={path}
      className={`admin-nav-link ${isActive ? 'active' : ''}`}
      onClick={() => setSidebarOpen(false)}
    >
      <Icon /> {label}
    </Link>
  );
}
