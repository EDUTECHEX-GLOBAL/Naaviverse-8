import React, { useContext, useEffect, useState } from "react";

import back from "../../../../../static/images/icons/back.svg";
import close from "../../../../../static/images/icons/close1.svg";
import editPub from "../../../../../static/images/clipIcons/editPub.svg";
import userIcon from "../../../../../static/images/clipIcons/userIcon.svg";
import deletePub from "../../../../../static/images/clipIcons/delete.svg";
import bondIcon from "../../../../../static/images/clipIcons/bondIcon.svg";
import plusIcon from "../../../../../static/images/clipIcons/plus.svg";
import yesIcon from "../../../../../static/images/clipIcons/yes.svg";
import noIcon from "../../../../../static/images/clipIcons/no.svg";
// import defaultImg from "../../../../../static/images/icons/app_placeholder.png";
// import defaultImg from "../../../../static/images/icons/app_placeholder.png";
import defaultImg from "../../../../../static/images/icons/defaultImg.svg";
import lock from "../../../../../static/images/icons/lock.svg";

import changeBond from "../../../../../static/images/icons/changeBond.svg";
import okIcon from "../../../../../static/images/icons/tik.svg";
import backIcon from "../../../../../static/images/icons/backArrow.svg";

import { GlobalContex } from "../../../../../globalContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LoadingAnimation from "../../../../../globalComponents/LoadingAnimation";
import Scrollbars from "react-custom-scrollbars";
import Skeleton from "react-loading-skeleton";

const Actions = ({
  selectedAuthor,
  allBonds,
  currenciesData,
  loading,
  setLoading,
  step,
  setStep,
  path,
  setPath,
  setRefetchAuthors,
}) => {
  const navigate = useNavigate();
  const {
    showSubDraw,
    setShowSubDraw,
    selectedListItem,
    setSelectedListItem,
    bondSelected,
    setBondSelected,
    bankerEmail,
    loginData,
    refetchBonds,
    setRefetchBonds,
    selectedMcbDashboardApp,
    setRefetchData,
    allPublications,
    setAllPublications,
  } = useContext(GlobalContex);

  const [bondStatus, setBondStatus] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setStep("");
    setPath(["Action"]);
  }, [showSubDraw]);

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

  const handleDeleteAuthor = () => {
    setLoading(true);
    axios
      .delete(
        `https://publications.apimachine.com/publisher/${selectedAuthor?._id}`
      )
      .then(({ data }) => {
        if (data.status) {
          setStep("success");
          setTimeout(() => {
            setLoading(false);
            setPath([]);
            setStep("");
            setShowSubDraw(false);
            setRefetchAuthors(true);
          }, 1000);
        }
      });
  };

  const fullHeightDrawer = (message) => {
    if (message) {
      return (
        <div
          style={{
            height: window.innerHeight - 123,
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <LoadingAnimation logoAnim sideDraw={true} />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              textAlign: "center",
              marginBottom: "20px",
            }}
          >
            {message}
          </div>
        </div>
      );
    } else {
      return (
        <div
          style={{
            height: window.innerHeight - 123,
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <LoadingAnimation logoAnim sideDraw={true} />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              textAlign: "center",
            }}
          >
            Updating Brand List...
          </div>
        </div>
      );
    }
  };

  const conditionalSteps = () => {
    switch (step) {
      case "loading":
        return fullHeightDrawer(`Deleting ${selectedAuthor?.name}`);

      case "success":
        return (
          <div
            className="assetDispText"
            style={{
              fontSize: "18px",
              fontWeight: "600",
              textAlign: "center",
              justifyContent: "center",
              alignItems: "center",
              display: "flex",
              height: "60vh",
              padding: "0px 20px",
            }}
          >
            You Have Successfully Deleted {selectedAuthor?.name}
          </div>
        );

      case "Token Expired":
        return (
          <>
            <div className="sidebarTitle">Token Expired. Login Again.</div>
            <div
              className="sidebarCard"
              onClick={(e) => {
                localStorage.clear();
                window.location.reload();
              }}
            >
              <img src={lock} alt="" style={{ width: "20px" }} />
              <div style={{ paddingLeft: "10px" }}>Logout</div>
            </div>
          </>
        );

      case "Delete Author":
        return (
          <>
            <div className="sidebarTitle">
              Are you sure you want to delete this Author?
            </div>
            <div
              className="sidebarCard"
              onClick={() => {
                setStep("loading");
                setPath([...path, "loading"]);
                handleDeleteAuthor();
              }}
            >
              <img
                src={yesIcon}
                alt=""
                className="coin"
                style={{ width: "25px", height: "25px" }}
              />
              <div style={{ paddingLeft: "10px" }}>Yes</div>
            </div>
            <div
              className="sidebarCard"
              // onClick={() => {
              //   setBondStatus("inactive");
              //   setStep("Verify Status");
              //   setPath([...path, "Verify Status"]);
              // }}
            >
              <img
                src={noIcon}
                alt=""
                className="coin"
                style={{ width: "25px", height: "25px" }}
              />
              <div style={{ paddingLeft: "10px" }}>No</div>
            </div>
          </>
        );

      default:
        return (
          <>
            <div className="sidebarTitle">What Would You Like To Do? </div>
            <div
              className="sidebarCard"
              onClick={() => {
                // setStep("Edit Bond Data");
              }}
            >
              <img
                src={editPub}
                alt=""
                className="coin"
                style={{ width: "25px", height: "25px" }}
              />
              <div style={{ paddingLeft: "10px" }}>Edit Author</div>
            </div>
            <div
              className="sidebarCard"
              // onClick={() => {
              //   setStep("Delete Author");
              //   setPath([...path, "Delete Author"]);
              // }}
            >
              <img
                src={deletePub}
                alt=""
                className="coin"
                style={{ width: "25px", height: "25px" }}
              />
              <div style={{ paddingLeft: "10px" }}>Delete Author</div>
            </div>
          </>
        );
    }
  };

  return (
    <>
      <div
        style={{
          padding: "30px",
          height: "90px",
        }}
      >
        {loading ||
        step === "loading" ||
        step === "Token Expired" ||
        step == "success" ? (
          ""
        ) : (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <img
                  src={
                    selectedAuthor?.profile_pic
                      ? selectedAuthor?.profile_pic
                      : defaultImg
                  }
                  alt=""
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "100%",
                  }}
                />
                <div style={{ paddingLeft: "10px" }}>
                  <div style={{ fontSize: "22px" }}>{selectedAuthor?.name}</div>
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
                  onClick={(e) => {
                    setPath([]);
                    setShowSubDraw(false);
                  }}
                  style={{
                    marginLeft: "20px",
                  }}
                >
                  <img src={close} alt="" />
                </div>
              </div>
            </div>

            <div
              className="breadcrumb"
              style={{ display: "flex", flexDirection: "row" }}
            >
              {path?.map((item, index) => {
                return (
                  <div>
                    {index !== 0 ? <span>&nbsp;{`->`}&nbsp;</span> : ""}
                    <span
                      onClick={(e) => handleBreadcrumbClick(item)}
                      className={
                        index === path.length - 1 ? "crumbSelected" : "crumbs"
                      }
                    >
                      {item}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {conditionalSteps()}
      </div>
    </>
  );
};

export default Actions;
