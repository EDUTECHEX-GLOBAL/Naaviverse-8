import React, { Fragment, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import SearchModal from "../search-modal/SearchModal";
import ThemeMainMenu from "./ThemeMainMenu";
import Naavi from "../../assets/images/logo/naavi_final_logo2.png";
import SideTogglePanel from "./SideToggler";
import "./topnav.scss";

const TopNavFour = () => {
  const [navbar, setNavbar] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [modalIsOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  const navigate = useNavigate();
  const location = useLocation();

  // Sticky navbar
  useEffect(() => {
    const toggleMenu = () => setNavbar(window.scrollY >= 68);
    window.addEventListener("scroll", toggleMenu);
    return () => window.removeEventListener("scroll", toggleMenu);
  }, []);

  // Responsive check
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);
  const closeModal = () => setIsOpen(false);

  return (
    <Fragment>
      <SearchModal
        isOpen={modalIsOpen}
        onClick={closeModal}
        bgColor="bg-three"
      />

      <header
  className={`theme-main-menu sticky-menu theme-menu-four ${
    navbar ? "fixed" : ""
  }`}
>
  <div className="container">
    <div className="inner-content d-flex align-items-center justify-content-between">

      {/* LOGO */}
      <Link to="/" className="logo">
        <img src={Naavi} alt="Logo" width={150} />
      </Link>

      {/* DESKTOP MENU */}
      {!isMobile && (
        <nav className="navbar navbar-expand-lg">
          <ThemeMainMenu />
        </nav>
      )}

      {/* TOGGLE BUTTON (DESKTOP + MOBILE) */}
      <button className="menu-icon-btn" onClick={openSidebar}>
        <span className="menu-icon-custom">
          <span className="bar" />
          <span className="bar" />
          <span className="bar" />
        </span>
      </button>

    </div>
  </div>
</header>

       

      {/* 🔴 SIDE PANEL — RENDER ONCE ONLY */}
      <SideTogglePanel isOpen={isSidebarOpen} onClose={closeSidebar} />
    </Fragment>
  );
};

export default TopNavFour;
