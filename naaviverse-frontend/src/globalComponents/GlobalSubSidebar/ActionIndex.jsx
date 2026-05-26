import React, { useContext, useState } from "react";
import "../../static/scss/subdrawer.scss";
import "./subdrawer.scss";
import { GlobalContex } from "../../globalContext";

// import About from "./About";
// import Actions from "./Actions";
import close from "../../static/images/whiteClose.svg";
import { ToastContainer, toast } from "react-toastify";

const ActionIndex = ({ userSelectedPublication, selectedRequest, setSelectedRequest }) => {
  // console.log("subdrawer " + tabSelected);
  const {
    showSubDraw,
    setShowSubDraw,
    selectedMcbDashboardApp,
    setSelectedMcbDashboardApp,
    actionsSubDrawer,
    affiliateDrawer,
    requestsDrawer,
    setRequestsDrawer,
    selectedLevel,
    setActionsSubDrawer,
    filterDrawer,
    setFilterDrawer,
    selectedFilterRequest,
    setSelectedFilterRequest,
  } = useContext(GlobalContex);

  const [selectedMenu, setSelectedMenu] = useState("Actions");
  // const [] = useState(false);
  const [step, setStep] = useState(null);
  const [path, setPath] = useState([]);
  const [loading, setLoading] = useState(false);
  const filterData = [{name:"Approved",id:"completed"}, {name:"Pending",id:"pending"}, {name:"Rejected",id:"cancelled"}]


  return (
    <div
      className={filterDrawer ? "right-drawer-visible" : "right-drawer-hidden"}
      style={{ height: window.innerHeight - 123, top: 132 }}
    >
      {loading ||
        step === "loading" ||
        step === "Token Expired" ||
        step == "success" ? (
        ""
      ) : (
        <div></div>
      )}
      {/* {thedata} */}
      <>
        <div
          style={{
            padding: "30px",
            height: "90px",
          }}
        >
          <div
            style={{
              alignItems: "center",
              justifyContent: "space-between",
              display: step === "loading" || step === "success" ? "none" : "flex",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "22px" }} className="draw-title">
                  Which Status?
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                className="backButton icon-imgs close-img"
                onClick={(e) => {
                  setFilterDrawer(false)
                }}
                style={{
                  marginLeft: "20px",
                }}
              >
                <img src={close} alt="" />
              </div>
            </div>

          </div>
          {filterData.map((item, index) => {
            return (
              <div key={index} onClick={() => {setSelectedFilterRequest(item.id);setFilterDrawer(false)}}>
                <div className={"drawCard" + (selectedFilterRequest === item.id ? " cardActive" : "")}>
                  <div>{item.name}</div>
                </div>
              </div>
            )
          })}
          {/* <div
              className="drawCard" style={{ justifyContent: "space-between" }}
            >
              <div >Pending</div>
            </div>
            <div
              className="drawCard" style={{ justifyContent: "space-between" }}
            >
              <div >Rejected</div>
            </div> */}
          <ToastContainer />
        </div>
      </>
    </div >
  );
};

export default ActionIndex;
