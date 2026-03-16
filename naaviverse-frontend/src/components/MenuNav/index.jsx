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
  const isPartner = !!localStorage.getItem("partner");

  // ✅ Partners use sidebar profile — no top nav needed
  if (isPartner) return null;

  const handleLogout = () => {
    const adminUser = localStorage.getItem("adminuser");
    localStorage.clear();
    if (adminUser) {
      navigate("/admin/login");
    } else {
      navigate("/login");
    }
  };

  const handleNavigateProfile = () => {
    setShowDrop(false);
    const adminUser = localStorage.getItem("adminuser");
    if (adminUser) {
      window.dispatchEvent(new Event("openAdminProfile"));
      return;
    }
    const partner = localStorage.getItem("partner");
    if (partner) {
      navigate("/dashboard/accountants/profile");
    } else {
      navigate("/dashboard/users/profile");
    }
  };

  const profilePic = localStorage.getItem("userProfilePic") || profile;

  return (
    <>
      <div className="dash-nav">
        <div style={{ flex: 1 }}></div>
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
