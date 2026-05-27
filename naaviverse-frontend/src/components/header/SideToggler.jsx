// src/components/SideTogglePanel.js

import React from "react";
import { Link } from "react-router-dom";
import ContactInfoWidget from "../../views/inner-pages/contact/ContactInfoWidget";
import Newsletter from "../../components/footernew/Newsletter";
import SocialWidget from "../../components/footernew/SocialWidget";
import logos from "../../assets/images/logo/naavi_final_logo2.png";
import "./toggler.scss"; // Add this import

export default function SideTogglePanel({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <>
      <div className={`side-panel ${isOpen ? "active" : ""}`}>
        <button className="side-panel-close" onClick={onClose} />
        <div className="side-panel-overlay" onClick={onClose} />
        <div className="side-panel-content">
          <div className="side-panel-shape" />
          <Link className="side-panel-logo" to="/">
            <img src={logos} alt="Logo" />
          </Link>

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
              subtitle="Subscribe to our newsletters to get the latest news and updates"
              placeholder="example@gmail.com"
            />
          </div>

          <div className="side-panel-box">
            <SocialWidget />
          </div>
        </div>
      </div>
    </>
  );
}
