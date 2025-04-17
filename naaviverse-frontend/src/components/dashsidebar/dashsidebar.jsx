import React, { useState } from "react";
import "./dashsidebar.scss";
import { useStore } from "../store/store.ts";
import { useNavigate } from "react-router-dom";
import { useCoinContextData } from "../../context/CoinContext";
import { Menu, X } from "lucide-react"; // You can switch to react-icons if needed
import history from "./history.svg";

const menuItems = [
  { id: 0, title: "Paths", path: "/dashboard/users" },
  { id: 1, title: "My Journey", path: "/dashboard/users" },
  { id: 2, title: "Current Step", path: "/dashboard/users" },
  { id: 3, title: "Transactions", path: "/dashboard/users" },
];

const Dashsidebar = ({ isNotOnMainPage, handleChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { sideNav, setsideNav, setBuy } = useStore();
  const navigate = useNavigate();

  const {
    checkForHistory,
    preLoginHistoryData,
    setPathItemSelected,
    setSelectedPathItem,
    setCurrentStepData,
    setCurrentStepDataLength,
    setCurrentStepDataPathId,
    setTransactionSelected,
    setTransactionData,
  } = useCoinContextData();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleMenuClick = (item) => {
    setsideNav(item.title);
    navigate(item.path);
    setIsOpen(false);
    if (handleChange) handleChange();

    // Reset context data for specific sections
    if (item.title !== "Paths") {
      setCurrentStepData('');
      setCurrentStepDataLength('');
      setCurrentStepDataPathId('');
      setTransactionSelected(false);
      setTransactionData([]);
    }
  };

  return (
    <div className="menu-container">
      {/* Hamburger Toggle Button */}
      <div className="menu-toggle" onClick={toggleMenu}>
        {isOpen ? <X size={28} /> : <Menu size={28} />}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="dropdown-menu">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={`menu-item ${sideNav === item.title ? "active" : ""}`}
              onClick={() => handleMenuClick(item)}
            >
              {item.title}
            </div>
          ))}

          {checkForHistory && (
            <div className="history-box">
              <div><img src={history} alt="history" /></div>
              <div className="history-label">You viewed the following path:</div>
              <div className="history-details">
                <div className="font-bold">{preLoginHistoryData?.destination_institution}</div>
                <div>{preLoginHistoryData?.program}</div>
                <div className="path-id"><strong>pathid:</strong> {preLoginHistoryData?._id}</div>
              </div>
              <div className="open-btn" onClick={() => {
                setPathItemSelected(true);
                setSelectedPathItem(preLoginHistoryData);
                localStorage.setItem("selectedPath", JSON.stringify(preLoginHistoryData?.nameOfPath));
              }}>Open</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashsidebar;
