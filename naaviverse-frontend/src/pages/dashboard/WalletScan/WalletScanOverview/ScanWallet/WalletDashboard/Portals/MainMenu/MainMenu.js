import React from "react";
import nextId from "react-id-generator";
import Images from "../../../../../assets/0-exporter";
import "./main-menu.style.scss";

export const MainMenuList = [
  {
    keyId: nextId(),
    enable: false,
    name: "AG Store",
    id: "store",
    icon: Images.agStore,
  },
  {
    keyId: nextId(),
    enable: true,
    name: "Refresh",
    id: "refresh",
    icon: Images.refresh,
  },
  {
    keyId: nextId(),
    enable: false,
    name: "Theatre",
    id: "theatre",
    icon: Images.theatre,
  },
  {
    keyId: nextId(),
    enable: false,
    name: "Chats",
    id: "chats",
    icon: Images.chats,
  },
  {
    keyId: nextId(),
    enable: false,
    name: "Accountants",
    id: "accountant",
    icon: Images.accountants,
  },
  {
    keyId: nextId(),
    enable: true,
    name: "Logout",
    id: "logout",
    icon: Images.lock,
  },
];

export default function MainMenu({ userDetails, handleClick, closeIt }) {
  return (
    <div onClick={() => closeIt()} className="main-menu-main">
      <div onClick={(e) => e.stopPropagation()} className="main-menu-modal">
        
        <div className="main-menu-user-details">
          <img src={userDetails?.profile_img} />
          <h3>Hey {userDetails.username}</h3>
          <p>How Can We Help You?</p>
        </div>

        <div className="main-menu-options">
          {MainMenuList.map((obj) => (
            <div key={obj.keyId} className="single-option-wrapper">
              <div
                onClick={() => {
                  handleClick(obj);
                  closeIt();
                }}
                className={obj.enable ? "" : "disable-it"}
              >
                <img src={obj.icon} alt={obj.id} />
              </div>
              <p>{obj.name}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
