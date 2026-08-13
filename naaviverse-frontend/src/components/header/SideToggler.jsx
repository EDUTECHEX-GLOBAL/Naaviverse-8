import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ContactInfoWidget from "../../views/inner-pages/contact/ContactInfoWidget";
import Newsletter from "../../components/footernew/Newsletter";
import SocialWidget from "../../components/footernew/SocialWidget";
import logos from "../../assets/images/logo/naavi_final_logo2.png";
import "./toggler.scss"; // Add this import

export default function SideTogglePanel({ isOpen, onClose, isMobile }) {
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setActiveDropdown(null);
    }
  }, [isOpen]);

  const toggleDropdown = (menu) => {
    setActiveDropdown(activeDropdown === menu ? null : menu);
  };

  const closePanel = () => {
    setActiveDropdown(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={`side-panel ${isOpen ? "active" : ""}`}>
        <button className="side-panel-close" onClick={closePanel} />
        <div className="side-panel-overlay" onClick={closePanel} />
        <div className="side-panel-content">
          <div className="side-panel-shape" />
          <Link className="side-panel-logo" to="/" onClick={closePanel}>
            <img src={logos} alt="Logo" />
          </Link>

          {isMobile ? (
            /* 📱 MOBILE RESPONSIVE NAV MENU */
            <div className="mobile-nav">
              <ul className="mobile-nav-list">
                <li className="mobile-nav-item">
                  <Link to="/" onClick={closePanel} className="mobile-nav-link">
                    HOME
                  </Link>
                </li>

                <li className="mobile-nav-item">
                  <span
                    className="mobile-nav-link"
                    onClick={() => toggleDropdown("about")}
                  >
                    ABOUT{" "}
                    <i
                      className={`fas fa-chevron-down chevron-icon ${
                        activeDropdown === "about" ? "open" : ""
                      }`}
                    ></i>
                  </span>
                  <ul
                    className={`mobile-sub-menu ${
                      activeDropdown === "about" ? "open" : ""
                    }`}
                  >
                    <li className="mobile-sub-item">
                      <Link
                        className="mobile-sub-link"
                        to="/about/what-is-naavi"
                        onClick={closePanel}
                      >
                        What is Naavi?
                      </Link>
                    </li>
                    <li className="mobile-sub-item">
                      <Link
                        className="mobile-sub-link"
                        to="/about/our-vision"
                        onClick={closePanel}
                      >
                        Our Vision
                      </Link>
                    </li>
                    <li className="mobile-sub-item">
                      <Link
                        className="mobile-sub-link"
                        to="/about/why-naavi"
                        onClick={closePanel}
                      >
                        Why Naavi
                      </Link>
                    </li>
                    <li className="mobile-sub-item">
                      <Link
                        className="mobile-sub-link"
                        to="/about/mission-philosophy"
                        onClick={closePanel}
                      >
                        Mission & Philosophy
                      </Link>
                    </li>
                    <li className="mobile-sub-item">
                      <Link
                        className="mobile-sub-link"
                        to="/about/navigation-problem"
                        onClick={closePanel}
                      >
                        The Navigation Problem
                      </Link>
                    </li>
                    <li className="mobile-sub-item">
                      <Link
                        className="mobile-sub-link"
                        to="/about/pathway-intelligence"
                        onClick={closePanel}
                      >
                        Pathway Intelligence
                      </Link>
                    </li>
                    <li className="mobile-sub-item">
                      <Link
                        className="mobile-sub-link"
                        to="/about/naaviverse"
                        onClick={closePanel}
                      >
                        Naaviverse
                      </Link>
                    </li>
                  </ul>
                </li>

                <li className="mobile-nav-item">
                  <span
                    className="mobile-nav-link"
                    onClick={() => toggleDropdown("team")}
                  >
                    TEAM{" "}
                    <i
                      className={`fas fa-chevron-down chevron-icon ${
                        activeDropdown === "team" ? "open" : ""
                      }`}
                    ></i>
                  </span>
                  <ul
                    className={`mobile-sub-menu ${
                      activeDropdown === "team" ? "open" : ""
                    }`}
                  >
                    <li className="mobile-sub-item">
                      <Link
                        className="mobile-sub-link"
                        to="/team/founders"
                        onClick={closePanel}
                      >
                        Founders
                      </Link>
                    </li>
                  </ul>
                </li>

                <li className="mobile-nav-item">
                  <span
                    className="mobile-nav-link"
                    onClick={() => toggleDropdown("impact")}
                  >
                    IMPACT{" "}
                    <i
                      className={`fas fa-chevron-down chevron-icon ${
                        activeDropdown === "impact" ? "open" : ""
                      }`}
                    ></i>
                  </span>
                  <ul
                    className={`mobile-sub-menu ${
                      activeDropdown === "impact" ? "open" : ""
                    }`}
                  >
                    <li className="mobile-sub-item">
                      <Link
                        className="mobile-sub-link"
                        to="/impact/skill-gap-problem"
                        onClick={closePanel}
                      >
                        Skill Gap Problem
                      </Link>
                    </li>
                    <li className="mobile-sub-item">
                      <Link
                        className="mobile-sub-link"
                        to="/impact/future-workforce"
                        onClick={closePanel}
                      >
                        Future Workforce
                      </Link>
                    </li>
                    <li className="mobile-sub-item">
                      <Link
                        className="mobile-sub-link"
                        to="/impact/human-potential"
                        onClick={closePanel}
                      >
                        Human Potential
                      </Link>
                    </li>
                    <li className="mobile-sub-item">
                      <Link
                        className="mobile-sub-link"
                        to="/impact/student-outcomes"
                        onClick={closePanel}
                      >
                        Student Outcomes
                      </Link>
                    </li>
                    <li className="mobile-sub-item">
                      <Link
                        className="mobile-sub-link"
                        to="/impact/education-transformation"
                        onClick={closePanel}
                      >
                        Education Transformation
                      </Link>
                    </li>
                    <li className="mobile-sub-item">
                      <Link
                        className="mobile-sub-link"
                        to="/impact/global-opportunity-access"
                        onClick={closePanel}
                      >
                        Global Opportunity Access
                      </Link>
                    </li>
                    <li className="mobile-sub-item">
                      <Link
                        className="mobile-sub-link"
                        to="/impact/sdgs-social-impact"
                        onClick={closePanel}
                      >
                        SDGs & Social Impact
                      </Link>
                    </li>
                  </ul>
                </li>

                <li className="mobile-nav-item">
                  <span
                    className="mobile-nav-link"
                    onClick={() => toggleDropdown("technology")}
                  >
                    TECHNOLOGY{" "}
                    <i
                      className={`fas fa-chevron-down chevron-icon ${
                        activeDropdown === "technology" ? "open" : ""
                      }`}
                    ></i>
                  </span>
                  <ul
                    className={`mobile-sub-menu ${
                      activeDropdown === "technology" ? "open" : ""
                    }`}
                  >
                    <li className="mobile-sub-item">
                      <Link
                        className="mobile-sub-link"
                        to="/technology/pathways-system"
                        onClick={closePanel}
                      >
                        Pathways
                      </Link>
                    </li>
                    <li className="mobile-sub-item">
                      <Link
                        className="mobile-sub-link"
                        to="/technology/llms-knowledge-graphs"
                        onClick={closePanel}
                      >
                        LLMs & Knowledge Graphs
                      </Link>
                    </li>
                  </ul>
                </li>

                <li className="mobile-nav-item">
                  <span
                    className="mobile-nav-link"
                    onClick={() => toggleDropdown("more")}
                  >
                    MORE{" "}
                    <i
                      className={`fas fa-chevron-down chevron-icon ${
                        activeDropdown === "more" ? "open" : ""
                      }`}
                    ></i>
                  </span>
                  <ul
                    className={`mobile-sub-menu ${
                      activeDropdown === "more" ? "open" : ""
                    }`}
                  >
                    <li className="mobile-sub-item">
                      <Link
                        className="mobile-sub-link"
                        to="/contact"
                        onClick={closePanel}
                      >
                        Contact Us
                      </Link>
                    </li>
                  </ul>
                </li>
              </ul>

              <div className="mobile-cta-box">
                <button
                  onClick={() => {
                    const subBox = document.getElementById("mobile-subscribe-section");
                    if (subBox) {
                      subBox.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="mobile-get-started-btn"
                >
                  Get Started
                </button>
              </div>

              {/* 📱 MOBILE SUBSCRIBE & CONTACT SECTION */}
              <div id="mobile-subscribe-section" className="mt-4 pt-3 border-top">
                <div className="side-panel-box">
                  <ContactInfoWidget title="Contact Us" withIcon />
                </div>

                <div className="side-panel-box">
                  <Newsletter
                    title="Subscribe"
                    subtitle="Subscribe to the list to get pilot access to the platform and updates"
                    placeholder="example@gmail.com"
                  />
                </div>

                <div className="side-panel-box">
                  <SocialWidget />
                </div>
              </div>
            </div>
          ) : (
            /* 🖥️ DESKTOP CONTACT WIDGET DRAWERS */
            <>
              <div className="side-panel-box">
                <h2 className="side-panel-heading">
                  Do you have a project in your <br /> mind? Keep connect us.
                </h2>
              </div>

              <div className="side-panel-box">
                <ContactInfoWidget title="Contact Us" withIcon />
              </div>

              <div className="side-panel-box">
                <Newsletter
                  title="Subscribe"
                  subtitle="Subscribe to the list to get pilot access to the platform and updates"
                  placeholder="example@gmail.com"
                />
              </div>

              <div className="side-panel-box">
                <SocialWidget />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
