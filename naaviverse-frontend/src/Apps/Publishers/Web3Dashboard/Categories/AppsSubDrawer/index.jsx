import React, { useContext, useState } from "react";
import "../../../../../static/scss/subdrawer.scss";
import { GlobalContex } from "../../../../../globalContext";

import About from "./About";
import Actions from "./Actions";

const AppsSubDrawer = ({ allApps }) => {
  // console.log("subdrawer " + tabSelected);
  const {
    showSubDraw,
    setShowSubDraw,
    selectedMcbDashboardApp,
    setSelectedMcbDashboardApp,
  } = useContext(GlobalContex);

  const [selectedMenu, setSelectedMenu] = useState("Actions");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(null);
  const [path, setPath] = useState([]);

  const conditionalData = () => {
    switch (selectedMenu) {
      case "About":
        return (
          <About
            allApps={allApps}
            loading={loading}
            setLoading={setLoading}
            step={step}
            setStep={setStep}
            path={path}
            setPath={setPath}
          />
        );

      case "Actions":
        return (
          <Actions
            loading={loading}
            setLoading={setLoading}
            step={step}
            setStep={setStep}
            path={path}
            setPath={setPath}
          />
        );

      default:
        break;
    }
  };

  return (
    <div
      className={showSubDraw ? "right-drawer-visible" : "right-drawer-hidden"}
      style={{ height: window.innerHeight - 123, marginTop:"8px" }}
    >
      {conditionalData()}
    </div>
  );
};

export default AppsSubDrawer;
