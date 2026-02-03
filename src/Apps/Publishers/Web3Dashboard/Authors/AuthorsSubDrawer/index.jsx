import React, { useContext, useState } from "react";
import "../../../../../static/scss/subdrawer.scss";
import { GlobalContex } from "../../../../../globalContext";

import About from "./About";
import Actions from "./Actions";

const AuthorsSubDrawer = ({
  selectedAuthor,
  loading,
  setLoading,
  setRefetchAuthors,
}) => {
  // console.log("subdrawer " + tabSelected);
  const {
    showSubDraw,
    setShowSubDraw,
    selectedMcbDashboardApp,
    setSelectedMcbDashboardApp,
  } = useContext(GlobalContex);

  const [selectedMenu, setSelectedMenu] = useState("Actions");
  // const [] = useState(false);
  const [step, setStep] = useState("");
  const [path, setPath] = useState([]);

  const conditionalData = () => {
    switch (selectedMenu) {
      case "About":
        return (
          // <About
          //   selectedAuthor={selectedAuthor}
          //   loading={loading}
          //   setLoading={setLoading}
          //   step={step}
          //   setStep={setStep}
          //   path={path}
          //   setPath={setPath}
          //   setRefetchAuthors={setRefetchAuthors}
          // />
          <div>Coming Soon</div>
        );

      case "Actions":
        return (
          <Actions
            selectedAuthor={selectedAuthor}
            loading={loading}
            setLoading={setLoading}
            step={step}
            setStep={setStep}
            path={path}
            setPath={setPath}
            setRefetchAuthors={setRefetchAuthors}
          />
        );

      default:
        break;
    }
  };

  return (
    <div
      className={showSubDraw ? "right-drawer-visible" : "right-drawer-hidden"}
      style={{ height: window.innerHeight - 123, top:132 }}
    >
      {!loading && step !== "Token Expired" && step !== "success" ? (
    <div></div>
      ) : (
        ""
      )}
      {/* {thedata} */}
      {conditionalData()}
    </div>
  );
};

export default AuthorsSubDrawer;
