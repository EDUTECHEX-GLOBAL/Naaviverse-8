import React, { useMemo, useState, useEffect, useContext } from "react";

import Skeleton from "react-loading-skeleton";
import NavBar from "../../../globalComponents/NavBar";
import { GlobalContex } from "../../../globalContext";
import "../../../static/scss/list.scss";
import Users from "./Users";
// import Articles from "./Articles";
// import Authors from "./Authors";
// import Categories from "./Categories";
// import Navbars from "./Navbars";

// import Publications from "./Publications";
// import Users from "./Users";
// import Videos from "./Videos";
// import WebStory from "./WebStory";
// import CaseStudy from "./CaseStudy";
// import Reports from "./Reports";
// import Documentary from "./Documentary";

const CRM = () => {
  const tabs = [
    "Users",
    "Mentors",
    "Vendors"
  ];

  const { setShowSubDraw, tabSelected, setTabSelected } =
    useContext(GlobalContex);

  useEffect(() => {
    setTabSelected("Users");
  }, []);

  const tabComponent = useMemo(() => {
    switch (tabSelected) {
      case "Users":
        return <Users />
      default:
        return (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: 700,
              fontSize: "20px",
              height: "70vh",
            }}
          >
            Coming Soon
          </div>
        );
    }
  }, [
    tabSelected,
    // openCoinFilter, refetchApi
  ]);

  return (
    <div>
      <NavBar
        tabs={tabs}
        tabSelected={tabSelected}
        setTabSelected={setTabSelected}
        enabledFilters={[true, true, true, false, false, true]}
      />

      {tabComponent}

      {/* <div style={{ width: "100%" }}>
        <div className="listGrid">
          <div>Asset</div>
          <div>Cost</div>
          <div>Length</div>
          <div>Daily Return</div>
          <div>Monthly Return</div>
        </div>
      </div> */}
      {/* <div
        style={{
          // display: "flex",
          fontWeight: 700,
          fontSize: "20px",
        }}
      >

        <Subdrawer />
      </div> */}
    </div>
  );
};

export default CRM;
