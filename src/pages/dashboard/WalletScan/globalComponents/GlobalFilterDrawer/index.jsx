import React, { useEffect } from "react";
import { useContext } from "react";
import { useState } from "react";
import { GlobalContex } from "../../globalContext";
import "./filterDraw.scss";
import "./subdrawer.scss";
import back from "../../assets/images/icons/back.svg";
import close from "../../assets/images/icons/close1.svg";
import arrorRight from "../../assets/images/icons/arrorRight.svg";
import FilterAssetList from "./FilterAssetList";
import FilterStatusList from "./FilterStatusList";
import FilterLength from "./FilterLength";
import axios from "axios";

const GlobalFilterDrawer = () => {
  const {
    bankerEmail,
    globalFilter,
    setGlobalFilter,
    refetchBonds,
    setRefetchBonds,
    selectedAssetFilters,
    setSelectedAssetFilters,
    selectedStatusFilters,
    setSelectedStatusFilters,
    selectedLengthFilter,
    setSelectedLengthFilter,
  } = useContext(GlobalContex);

  const [tab, setTab] = useState("Filter");
  const [step, setStep] = useState("");
  const [path, setPath] = useState([]);
  // const [subStep, setSubStep] = useState("");

  useEffect(() => {
    setStep("Filter");
    setPath(["Filter"]);
  }, []);

  const handleBackStep = () => {
    if (path.length > 1) {
      path.splice(-1);
      // console.log(tempPath, "kqjdkjwed");
      setPath([...path]);
      if (path.length > 0) {
        setStep(path[path.length - 1]);
      }
    }
  };

  const handleBreadcrumbClick = (clickedStep) => {
    const foundStepIndex = path.findIndex((o) => o === clickedStep);
    const tempPath = path;
    tempPath.splice(foundStepIndex + 1, tempPath.length);
    setPath([...tempPath]);
    console.log(path, "lwndwed");
  };

  useEffect(() => {
    setStep(path[path.length - 1]);
  }, [path]);

  const getContent = () => {
    switch (step) {
      case "Asset":
        return (
          <>
            <div
              style={{
                padding: " 30px 35px",
              }}
            >
              <FilterAssetList />
            </div>
            <div
              className={
                selectedAssetFilters.length > 0
                  ? "bottomButtonFull"
                  : "bottomButtonDisabled"
              }
            >
              <div
                style={{ cursor: "pointer" }}
                className="buttonText fontAnimate"
                onClick={(e) => {
                  setStep("");
                  handleBackStep();
                }}
              >
                Done Selecting
              </div>
            </div>
          </>
        );

      case "Status":
        return (
          <>
            <div
              style={{
                padding: " 30px 35px",
              }}
            >
              <FilterStatusList />
            </div>
            <div
              className={
                selectedStatusFilters.length > 0
                  ? "bottomButtonFull"
                  : "bottomButtonDisabled"
              }
            >
              <div
                style={{ cursor: "pointer" }}
                className="buttonText fontAnimate"
                onClick={(e) => {
                  setStep("");
                  handleBackStep();
                }}
              >
                Done Selecting
              </div>
            </div>
          </>
        );

      case "Length":
        return (
          <>
            <div
              style={{
                padding: " 30px 35px",
              }}
            >
              <FilterLength />
            </div>
            <div
              className={
                selectedLengthFilter.length > 0
                  ? "bottomButtonFull"
                  : "bottomButtonDisabled"
              }
            >
              <div
                style={{ cursor: "pointer" }}
                className="buttonText fontAnimate"
                onClick={(e) => {
                  setStep("");
                  handleBackStep();
                }}
              >
                Done Selecting
              </div>
            </div>
          </>
        );

      default:
        return (
          <>
            <div
              style={{
                padding: " 30px 35px",
              }}
            >
              <div className="headerStyle">Current Filter Settings</div>

              {/* Asset Filter */}
              <div
                className="filterCards"
                onClick={(e) => {
                  setStep("Asset");
                  setPath([...path, "Asset"]);
                }}
              >
                <div>
                  <div className="cardTitle">Asset</div>
                  <div className="cardSubTitle">
                    Currently Showing:&nbsp;
                    {selectedAssetFilters.length > 0
                      ? selectedAssetFilters.map((item, index) => {
                          return (
                            <>
                              <span style={{ fontWeight: 600 }}>{item}</span>
                              <span>
                                {selectedAssetFilters.length - 1 !== index
                                  ? ","
                                  : ""}
                              </span>
                              &nbsp;
                            </>
                          );
                        })
                      : "All Assets"}
                  </div>
                </div>
                <img src={arrorRight} alt="" />
              </div>

              {/* Status Filter */}
              <div
                className="filterCards"
                onClick={(e) => {
                  setStep("Status");
                  setPath([...path, "Status"]);
                }}
              >
                <div>
                  <div className="cardTitle">Status</div>
                  <div className="cardSubTitle">
                    Currently Showing:&nbsp;
                    {selectedStatusFilters.length > 0
                      ? selectedStatusFilters.map((item, index) => {
                          return (
                            <>
                              <span
                                style={{
                                  fontWeight: 600,
                                  textTransform: "capitalize",
                                }}
                              >
                                {item}
                              </span>
                              <span>
                                {selectedStatusFilters.length - 1 !== index
                                  ? ","
                                  : ""}
                              </span>
                              &nbsp;
                            </>
                          );
                        })
                      : "All Assets"}
                  </div>
                </div>
                <img src={arrorRight} alt="" />
              </div>

              {/* Length Filter */}
              <div
                className="filterCards"
                onClick={(e) => {
                  setStep("Length");
                  setPath([...path, "Length"]);
                }}
              >
                <div>
                  <div className="cardTitle">Length</div>
                  <div className="cardSubTitle">
                    Currently Showing:&nbsp;
                    {selectedLengthFilter > 0 ? (
                      <span style={{ fontWeight: 600 }}>
                        {selectedLengthFilter + " Days"}
                      </span>
                    ) : (
                      "All Lengths"
                    )}
                  </div>
                </div>
                <img src={arrorRight} alt="" />
              </div>
            </div>

            <div
              className="bottomButtonWhite"
              onClick={(e) => {
                setGlobalFilter(false);
                setSelectedAssetFilters([]);
                setSelectedStatusFilters([]);
                setSelectedLengthFilter("");
                setRefetchBonds(true);
              }}
            >
              <span className="fontAnimate">Clear Filter</span>
            </div>
            <div
              className="bottomButton"
              onClick={(e) => {
                setGlobalFilter(false);
                setRefetchBonds(true);
              }}
            >
              <span className="fontAnimate">Update Filter</span>
            </div>
          </>
        );
    }
  };

  return (
    <>
      <div
        className={
          globalFilter ? "right-drawer-visible" : "right-drawer-hidden"
        }
        style={{ height: window.innerHeight - 123 }}
      >
        <div className="navs-disp">
          <div
            onClick={(e) => {
              setTab("Filter");
              setStep("");
            }}
            className={tab === "Filter" ? "navs-data active-tab" : "navs-data"}
          >
            <div>Filter</div>
          </div>
          <div
            onClick={(e) => {
              setTab("API");
              setStep("");
            }}
            className={tab === "API" ? "navs-data active-tab" : "navs-data"}
          >
            <div>API</div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "30px",
            // paddingTop:"50px",
            height: "90px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ paddingLeft: "10px" }}>
              <div style={{ fontSize: "28px", fontWeight: "600" }}>
                Bond Offerings
              </div>

              <div
                className={
                  step === path[path.length]
                    ? "breadcrumbSelected"
                    : "breadcrumb"
                }
              >
                {path?.map((item, index) => {
                  return (
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight:
                          index === path.length - 1 && index !== 0 ? 600 : "",
                      }}
                      onClick={(e) => handleBreadcrumbClick(item)}
                    >
                      {index !== 0 ? <span>&nbsp;{`>`}&nbsp;</span> : ""}&nbsp;
                      <span
                        className="hoverText"
                        style={{
                          textDecoration:
                            index === path.length - 1 && index !== 0
                              ? "underline"
                              : "",
                        }}
                      >
                        {item}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            {path.length > 1 ? (
              <div
                className="backButton icon-imgs"
                onClick={(e) => handleBackStep()}
              >
                <img src={back} alt="" />
              </div>
            ) : (
              ""
            )}
            <div
              className="backButton icon-imgs"
              onClick={(e) => setGlobalFilter(false)}
              style={{
                marginLeft: "10px",
              }}
            >
              <img src={close} alt="" />
            </div>
          </div>
        </div>
        {getContent()}
      </div>
      {/* <div
        style={{
          background: "white",
          paddingTop: 0,
          position: "fixed",
          top: "132px",
          bottom: "0px",
          // left: "395px",
          right: "0px",
          width: "500px",
          overflowY: "scroll",
          background: "white",
          borderLeft: "1px solid #e7e7e7",
        }}
      >
        <>
          <div className="headTabBox">
            <div
              className={`tab ${tab === "Filter"}`}
              onClick={() => {
                setTab("Filter");
                setStep("");
              }}
            >
              Filter
            </div>
            <div
              className={`tab ${tab === "API"}`}
              onClick={() => {
                setTab("API");
                setStep("");
              }}
            >
              API
            </div>
          </div>
          <div className="header">
            <div className="content">
              <div className="title">Bond Offerings</div>
              <div className="breadCrumbs">
                <span
                  onClick={() => {
                    setStep("");
                    setSubStep("");
                  }}
                >
                  {tab}
                </span>{" "}
                {step ? (
                  <>
                    -&gt;&nbsp;
                    <span
                      onClick={() => {
                        setSubStep("");
                      }}
                    >
                      {step}
                    </span>
                  </>
                ) : (
                  ""
                )}
                {subStep ? (
                  <>
                    -&gt;&nbsp;
                    <span>{subStep}</span>
                  </>
                ) : (
                  ""
                )}
              </div>
            </div>

            <div
              className="backBtn"
              onClick={() => {
                if (subStep) {
                  setSubStep("");
                } else {
                  setStep("");
                }
              }}
            >
              <img src={back} alt="" />
            </div>

            <div
              className="backBtn"
              onClick={() => {
                setGlobalFilter(false);
              }}
            >
              <img src={close} alt="" />
            </div>
          </div>
        </>
        {getContent()}
      </div> */}
    </>
  );
};

export default GlobalFilterDrawer;
