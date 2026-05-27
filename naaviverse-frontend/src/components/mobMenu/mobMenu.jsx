import React from "react";
import "./mobMenu.scss";
import { useStore } from "../store/store.ts";
import { useNavigate } from "react-router-dom";

const navMenu = [
  {
    id: 0,
    title: "About Us",
    link: "/",
  },
  {
    id: 1,
    title: "Paths",
    link: "/maps",
  },
  {
    id: 2,
    title: "Partners",
    link: "/directory/nodes",
  },
  {
    id: 3,
    title: "Services",
    link: "/services",
  },
  // {
  //   id: 4,
  //   title: "Affiliates",
  //   link:"/"
  // },
];

const MobMenu = () => {
  let navigate = useNavigate();
  const {
    selectedNav,
    setselectedNav,
    mobMenuOpen,
    setmobMenuOpen,
    setLoginType,
  } = useStore();
  return (
    <div className="mob-menu">
      <div className="all-mob-menu">
        {navMenu.map((each, i) => (
          <div
            className="each-mob-title"
            onClick={() => {
              setselectedNav(each.title);
              navigate(each.link);
              setmobMenuOpen(false);
            }}
            style={{
              background:
                selectedNav === each.title ? "rgba(31, 48, 79, 0.05)" : "",
              fontWeight: selectedNav === each.title ? "600" : "",
            }}
          >
            {each.title}
          </div>
        ))}
      </div>
      <div className="mob-buttons">
        <div
          className="mob-started"
          onClick={() => {
            navigate("/login");
            setLoginType("Users");
          }}
        >
          For Users
        </div>
        <div
          className="mob-accountants"
          onClick={() => {
            navigate("/login");
            setLoginType("Accountants");
          }}
        >
          For Partners
        </div>
      </div>
    </div>
  );
};

export default MobMenu;
