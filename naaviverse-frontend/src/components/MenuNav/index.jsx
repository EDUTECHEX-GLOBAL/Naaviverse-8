import React from "react";
import { useNavigate } from "react-router-dom";

import downarrow from "../../static/images/dashboard/downarrow.svg";
import profile from "../../static/images/dashboard/profile.svg";
import profilea from "../../static/images/dashboard/profilea.svg";
import sidearrow from "../../static/images/dashboard/sidearrow.svg";
import logout from "../../static/images/dashboard/logout.svg";

const MenuNav = ({
  showDrop,
  setShowDrop,
  hideSearch = false,
}) => {
  const navigate = useNavigate();

  const isPartner   = !!localStorage.getItem("partner");
  const isAdminUser = !!localStorage.getItem("adminuser");
  const isUserRoute = window.location.pathname.startsWith("/dashboard/users");

  // ✅ Partners use their own sidebar — no MenuNav needed
  if (isPartner) return null;

  // ✅ User dashboard — return null completely, sidebar handles everything
  if (isUserRoute) return null;

  // ✅ Non-admin, non-partner, non-user route — just empty nav bar
  if (!isAdminUser) {
    return <div className="dash-nav" style={{ minHeight: "70px" }} />;
  }

  // ── Admin only below this point ──────────────────────────────────────────

  const handleLogout = () => {
    localStorage.clear();
    navigate("/admin/login");
  };

  const handleNavigateProfile = () => {
    setShowDrop(false);
    window.dispatchEvent(new Event("openAdminProfile"));
  };

  const profilePic = localStorage.getItem("userProfilePic") || profile;

  return (
    <>
      <div className="dash-nav">
        <div style={{ flex: 1 }} />
        <div className="full-user" onClick={() => setShowDrop(!showDrop)}>
          <div className="user-box">
            <img className="user-icon" src={profilePic} alt="User" />
          </div>
          <div
            className="arrow-box"
            style={{
              transform: showDrop ? "rotate(180deg)" : "",
              cursor: "pointer",
            }}
          >
            <img className="arrow-icon" src={downarrow} alt="" />
          </div>
        </div>
      </div>

      {showDrop && (
        <div className="m-drop" onMouseDown={(e) => e.stopPropagation()}>
          <div className="m-each" onClick={handleNavigateProfile}>
            <div className="m-left">
              <div className="m-left-icon-box">
                <img className="m-left-icon" src={profilea} alt="" />
              </div>
              <div className="m-left-text">Profile</div>
            </div>
            <div className="m-right-icon-box">
              <img className="m-right-icon" src={sidearrow} alt="" />
            </div>
          </div>
          <div className="m-each-line" />
          <div className="m-each" onClick={handleLogout}>
            <div className="m-left">
              <div className="m-left-icon-box">
                <img className="m-left-icon" src={logout} alt="" />
              </div>
              <div className="m-left-text">Logout</div>
            </div>
            <div className="m-right-icon-box">
              <img className="m-right-icon" src={sidearrow} alt="" />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MenuNav;