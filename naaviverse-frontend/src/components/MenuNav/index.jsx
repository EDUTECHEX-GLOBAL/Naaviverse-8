import React from "react";
import { useNavigate } from "react-router-dom";

import searchic from "../../static/images/dashboard/searchic.svg";
import downarrow from "../../static/images/dashboard/downarrow.svg";
import profile from "../../static/images/dashboard/profile.svg";
import profilea from "../../static/images/dashboard/profilea.svg";
import sidearrow from "../../static/images/dashboard/sidearrow.svg";
import logout from "../../static/images/dashboard/logout.svg";

const MenuNav = ({
  showDrop,
  setShowDrop,
  searchTerm,
  setSearchterm,
  searchPlaceholder,
  hideSearch = false,   // ✅ pass hideSearch={true} on Home & Profile pages
}) => {
  const navigate = useNavigate();

  // ✅ Hide top-right user menu for partner flow — they use the sidebar profile instead
  const isPartner = !!localStorage.getItem("partner");

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
      {/* ===== TOP NAV ===== */}
      <div className="dash-nav">
        {/* ✅ Hide search bar on Home and Profile pages */}
        {!hideSearch && (
          <>
            <div className="search-input-box" onClick={() => setShowDrop(false)}>
              <input
                className="search-input"
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchterm(e.target.value)}
              />
            </div>
            <div className="search-box" onClick={() => setShowDrop(false)}>
              <img className="search-icon" src={searchic} alt="" />
            </div>
          </>
        )}

        {/* ✅ Show user icon + dropdown ONLY for user flow, not partner */}
        {!isPartner && (
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
        )}
      </div>

      {/* ===== DROPDOWN — user flow only ===== */}
      {!isPartner && showDrop && (
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