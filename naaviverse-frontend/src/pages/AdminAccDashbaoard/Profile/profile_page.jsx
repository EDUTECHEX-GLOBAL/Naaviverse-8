import React from "react";
import "./profile_page.scss";

const AdminProfilePage = () => {
  const admin = JSON.parse(localStorage.getItem("adminuser"));

  return (
    <div className="admin-profile-page">
      <h2>Admin Profile</h2>

      {/* BASIC INFO */}
      <div className="admin-profile-card">
        <h3>Basic Information</h3>
        <div className="info-row">
          <span>Name</span>
          <span>{admin?.name || "Admin"}</span>
        </div>
        <div className="info-row">
          <span>Email</span>
          <span>{admin?.email}</span>
        </div>
        <div className="info-row">
          <span>Role</span>
          <span>Super Admin</span>
        </div>
      </div>

      {/* SECURITY */}
      <div className="admin-profile-card">
        <h3>Security</h3>
        <button className="primary-btn">Change Password</button>
        <button className="secondary-btn">Enable 2FA</button>
      </div>

      {/* SYSTEM */}
      <div className="admin-profile-card">
        <h3>System Access</h3>
        <p>Full access to Users, Partners, Paths & Services.</p>
      </div>
    </div>
  );
};

export default AdminProfilePage;
