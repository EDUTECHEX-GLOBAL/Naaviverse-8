import React, { useState, useRef, useEffect } from "react";
import { FiMenu, FiX, FiPlus } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { useStore } from "../store/store.ts";// Import useStore
import "./accDashsidebar.scss"; // Import styles

const menuItems = [
  { id: 1, label: "CRM", path: "/dashboard/accountants?menu=CRM" },
  { id: 2, label: "My Paths", path: "/dashboard/accountants?menu=MyPaths" },
  { id: 3, label: "My Steps", path: "/dashboard/accountants?menu=MySteps" },
  { id: 4, label: "Services", path: "/dashboard/accountants?menu=Services" },
];

const MenuDropdown = ({ onSelectMenu = () => {} }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("CRM"); // Default to CRM

  const { setispopular } = useStore(); // ✅ Use Zustand store

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const menu = queryParams.get("menu") || "CRM";
    setSelectedMenu(menu);
    onSelectMenu(menu);
    
  }, [location, onSelectMenu]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMenuClick = (item) => {
    setSelectedMenu(item.label);
    navigate(item.path);
    setIsOpen(false);
    if (typeof onSelectMenu === "function") {
      onSelectMenu(item.label);
    }
  };

  const handleAddNew = () => {
    console.log(" Add New Clicked! Setting ispopular = true");
    setispopular(true); // ✅ Update Zustand state
    setIsOpen(false);
  };

  return (
    <div className="menu-container" ref={menuRef}>
      <div className="menu-icon" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FiX size={28} /> : <FiMenu size={28} />}
      </div>

      {isOpen && (
        <div className="menu-dropdown">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={`menu-item ${selectedMenu === item.label ? "active" : ""}`}
              onClick={() => handleMenuClick(item)}
            >
              {item.label}
            </div>
          ))}
          <div className="menu-item add-new" onClick={handleAddNew}>
            <FiPlus size={20} /> Add New
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuDropdown;
