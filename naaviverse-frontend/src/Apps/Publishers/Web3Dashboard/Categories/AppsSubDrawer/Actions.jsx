import React, { useContext, useEffect, useState } from "react";

import back from "../../../../../static/images/icons/back.svg";
import close from "../../../../../static/images/whiteClose.svg";
import UploadIconImg from "../../../../../static/images/uploadIconImg.svg";
import editApp from "../../../../../static/images/clipIcons/appData.svg";
import userIcon from "../../../../../static/images/clipIcons/userIcon.svg";
import deleteApp from "../../../../../static/images/clipIcons/delete.svg";
import bondIcon from "../../../../../static/images/clipIcons/bondIcon.svg";
import plusIcon from "../../../../../static/images/clipIcons/plus.svg";
import closeIcon from "../../../../../static/images/clipIcons/no.svg";
import defaultImg from "../../../../../static/images/icons/app_placeholder.png";
import lock from "../../../../../static/images/icons/lock.svg";

import changeBond from "../../../../../static/images/icons/changeBond.svg";
import okIcon from "../../../../../static/images/icons/tik.svg";
import backIcon from "../../../../../static/images/icons/backArrow.svg";
import * as jose from "jose";

import { GlobalContex } from "../../../../../globalContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./subdrawer.scss";
import LoadingAnimation from "../../../../../globalComponents/LoadingAnimation";
import loadingGif from "../../../../../static/images/loading.gif";
import cloudUploadIcon from "../../../../../static/images/clipIcons/cloudUpload.svg";


const Actions = ({
  allBonds,
  currenciesData,
  loading,
  setLoading,
  step,
  setStep,
  path,
  setPath,
}) => {
  const navigate = useNavigate();
  const {
    showSubDraw,
    setShowSubDraw,
    selectedListItem,
    setSelectedListItem,
    bondSelected,
    setBondSelected,
    selectedPublication,
    bankerEmail,
    loginData,
    refetchBonds,
    setRefetchBonds,
    selectedMcbDashboardApp,
    refetchCategory,
    setRefetchCategory,
  } = useContext(GlobalContex);

  function renameFile(originalFile, newName) {
    return new File([originalFile], newName, {
      type: originalFile.type,
      lastModified: originalFile.lastModified,
    });
  }

  const secret = "uyrw7826^&(896GYUFWE&*#GBjkbuaf"; // secret not to be disclosed anywhere.
  const emailDev = "rahulrajsb@outlook.com";

  const [bondStatus, setBondStatus] = useState("");
  const [theTitle, setTheTitle] = useState("Select An Action");
  const [newName, setNewName] = useState("");
  const [apiLoad, setApiLoad] = useState(false);
  const [colouredIcon, setColouredIcon] = useState("");
  const [colouredIconLoading, setColouredIconLoading] = useState("");
  const [successData, setSuccessData] = useState("");
  const [loadingData, setLoadingData] = useState("");
  // const [theTitle, setTheTitle] = useState("Select An Action");

  // useEffect(() => {
  //   setStep("Action");
  //   setPath(["Action"]);
  // }, [showSubDraw]);

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

  const signJwt = async (fileName, emailDev, secret) => {
    try {
      const jwts = await new jose.SignJWT({ name: fileName, email: emailDev })
        .setProtectedHeader({ alg: "HS512" })
        .setIssuer("gxjwtenchs512")
        .setExpirationTime("10m")
        .sign(new TextEncoder().encode(secret));
      return jwts;
    } catch (error) {
      console.log(error, "kjbedkjwebdw");
    }
  };

  const uploadImage = async (e, setImage, setLoading) => {
    setLoading(true);
    const fileName = `${new Date().getTime()}${e.target.files[0].name.substr(
      e.target.files[0].name.lastIndexOf(".")
    )}`;
    const formData = new FormData();
    const file = renameFile(e.target.files[0], fileName);
    formData.append("files", file);
    const path_inside_brain = "root/";

    const jwts = await signJwt(fileName, emailDev, secret);
    console.log(jwts, "lkjkswedcf");
    let { data } = await axios.post(
      `https://drivetest.globalxchange.io/file/dev-upload-file?email=${emailDev}&path=${path_inside_brain}&token=${jwts}&name=${fileName}`,
      formData,
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
    setImage(data.payload.url);
    setLoading(false);
  };

  useEffect(() => {
    setStep(path[path.length - 1]);
  }, [path]);

  const changeBondStatus = () => {
    setLoading(true);
    axios
      .post(
        `https://comms.globalxchange.io/coin/iced/banker/custom/bond/update`,
        {
          bond_template_id: bondSelected?.bond_template_id,
          email: bankerEmail,
          token: loginData.idToken,
          update_data: {
            status: bondStatus,
          },
        }
      )
      .then((res) => {
        if (res.data.status) {
          setLoading(true);
          setPath([]);
          setStep("");
          setShowSubDraw(false);
          setRefetchBonds(true);
          // setRefetchData(true);
          // setBondStatus("");
          // setTimeout(() => {
          //   onClose();
          // }, 2000);
        } else {
          setLoading(true);
          setStep("Token Expired");
        }
      });
  };

  const pathAdjust = () => {
    if (path.length > 0) {
      setPath(path.slice(0, -1))
    } else {
      setPath([])
    }
    // console.log(step, "steppp")
    if (step === "Edit Category" || step === "Delete Category") {
      setTheTitle("Select An Action")
    } else if (step === "Edit Name") {
      setTheTitle("What do you want to change?")
    } else if (step === "Edit Icon") {
      setTheTitle("What do you want to change?")
    }
  }

  const fullHeightDrawer = (message) => {
    if (message) {
      return (
        <div
          style={{
            height: window.innerHeight - 150,
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

  const handleDeleteCate = () => {
    setStep("loading");
    setLoadingData("Deleting Category...");
    setApiLoad(true);
    axios.delete(`https://publications.apimachine.com/category/${selectedMcbDashboardApp?._id}`)
      .then(({ data }) => {
        if (data.status) {
          setStep("success");
          setSuccessData("You have successfully deleted Category. You will be redirected to the updated category list now.");
          setTimeout(() => {
            setStep("");
            setPath([]);
            setRefetchCategory(!refetchCategory);
            setShowSubDraw(false);
            setApiLoad(false);
          }, 1000);
        } else {
          alert("Something went wrong, please try again later")
          setApiLoad(false);
        }
      })
  }

  const CategoryValidate = () => {
    if (newName === "") {
      alert("Please enter a name");
    } else {
      setStep("loading");
      setLoadingData("Updating Category...");
      setApiLoad(true);
      let body = {
        title: newName,
      }
      axios
        .put(`https://publications.apimachine.com/category/${selectedMcbDashboardApp?._id}`, body)
        .then((res) => {
          if (res.data.status) {
            setStep("success");
            setSuccessData("You have successfully updated Category. You will be redirected to the updated category list now.");
            setTimeout(() => {
              setStep("");
              setPath([]);
              setApiLoad(false);
              setShowSubDraw(false);
              setRefetchCategory(!refetchCategory);
              setNewName("");
            }, 1000);
          } else {
            alert("Something went wrong, please try again later")
            setApiLoad(false);
          }
        })
    }
  }

  const CategoryIconValidate = () => {
    if (!colouredIcon || colouredIcon === colouredIconLoading) {
      alert("Please upload Icon");
    } else {
      setStep("loading");
      setLoadingData("Updating Category...");
      setApiLoad(true);
      let body = {
        thumbnail: colouredIcon,
      }
      axios
        .put(`https://publications.apimachine.com/category/${selectedMcbDashboardApp?._id}`, body)
        .then((res) => {
          if (res.data.status) {
            setStep("success");
            setSuccessData("You have successfully updated Category. You will be redirected to the updated category list now.");
            setTimeout(() => {
              setStep("");
              setPath([]);
              setApiLoad(false);
              setShowSubDraw(false);
              setRefetchCategory(!refetchCategory);
              setColouredIcon("");
            }, 1000);
          } else {
            alert("Something went wrong, please try again later")
            setApiLoad(false);
          }
        })
    }
  }

  const conditionalSteps = () => {
    // console.log(step, "steppp")
    switch (step) {
      case "loading":
        return fullHeightDrawer(loadingData);
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
            {successData}
            {/* Publisher Added/Removed successfully to {selectedPublication?.name}{" "}
              Publication */}
          </div>
        );
      case "step1":
        return (
          <>
            <div className="sidebarTitle">This is the 1st step </div>
            <div
              className="sidebarCard"
              onClick={(e) => {
                setStep("step2");
                setPath([...path, "step2"]);
              }}
            >
              <img src={editApp} alt="" style={{ width: "20px" }} />
              <div style={{ paddingLeft: "10px" }}>Item 1 of Step 1</div>
            </div>
          </>
        );

      case "step2":
        return (
          <>
            <div className="sidebarTitle">This is the 2nd step </div>
            <div
              className="sidebarCard"
              onClick={(e) => {
                setStep("step3");
                setPath([...path, "step3"]);
              }}
            >
              <img src={editApp} alt="" style={{ width: "20px" }} />
              <div style={{ paddingLeft: "10px" }}>Item 1 of Step 2</div>
            </div>
          </>
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

      case "Change Bond Status":
        return (
          <>
            <div className="sidebarTitle">Select New Status </div>
            <div
              className="sidebarCard"
              onClick={() => {
                setBondStatus("active");
                setStep("Verify Status");
                setPath([...path, "Verify Status"]);
              }}
            >
              <img
                src={editApp}
                alt=""
                className="coin"
                style={{ width: "25px", height: "25px" }}
              />
              <div style={{ paddingLeft: "10px" }}>Active</div>
              {bondSelected?.status === "active" ? (
                <div
                  // className="statusIndicator"
                  style={{
                    background: "#18191D",
                    height: "100%",
                    width: "12px",
                    position: "absolute",
                    right: 0,
                  }}
                >
                  &nbsp;
                </div>
              ) : (
                ""
              )}
            </div>
            <div
              className="sidebarCard"
              onClick={() => {
                setBondStatus("inactive");
                setStep("Verify Status");
                setPath([...path, "Verify Status"]);
              }}
            >
              <img
                src={changeBond}
                alt=""
                className="coin"
                style={{ width: "25px", height: "25px" }}
              />
              <div style={{ paddingLeft: "10px" }}>Inactive</div>
              {bondSelected?.status === "inactive" ? (
                <div
                  // className="statusIndicator"
                  style={{
                    background: "#18191D",
                    height: "100%",
                    width: "12px",
                    position: "absolute",
                    right: 0,
                  }}
                >
                  &nbsp;
                </div>
              ) : (
                ""
              )}
            </div>
          </>
        );

      case "Verify Status":
        return (
          <>
            <div
              className="sidebarTitle"
              style={{ fontSize: "16px", fontWeight: 400 }}
            >
              Are You Sure You Want To Change This Bond Offering From "
              {bondSelected?.status}" to “{bondStatus}”?
            </div>
            <div
              className="sidebarCard"
              // onClick={() => {
              //   setBondStatus("active");
              //   setStep("Verify Status");
              //   setPath([...path, "Verify Status"]);
              // }}
              onClick={(e) => changeBondStatus()}
            >
              <img
                src={okIcon}
                alt=""
                className="coin"
                style={{ width: "25px", height: "25px" }}
              />
              <div style={{ paddingLeft: "10px" }}>Yes</div>
            </div>
            <div
              className="sidebarCard"
              onClick={() => {
                setPath([]);
              }}
            >
              <img
                src={backIcon}
                alt=""
                className="coin"
                style={{ width: "25px", height: "25px" }}
              />
              <div style={{ paddingLeft: "10px" }}>No, Go Back</div>
            </div>
          </>
        );

      case "Edit Category":
        return (
          <>
            <div className="sidebarCard" onClick={() => {
              setStep("Edit Name");
              setPath([...path, "Edit Name"]);
              setTheTitle("Edit Name")
            }}>
              <div>Name</div>
            </div>
            <div className="sidebarCard" onClick={() => {
              setStep("Edit Icon");
              setPath([...path, "Edit Icon"]);
              setTheTitle("Edit Icon")
            }}>
              <div>Icon</div>
            </div>
          </>
        );

      case "Delete Category":
        return (
          <>
            <div className="sidebarCard" onClick={() => {
              setStep("loading");
              setPath([...path, "loading"]);
              handleDeleteCate();
            }}>
              <div>Yes I Am</div>
            </div>
            <div className="sidebarCard" onClick={() => {
              setPath([]);
              setTheTitle("Select An Action")
              setStep("default");
            }}>
              <div>Never Mind</div>
            </div>
          </>
        );

      case "Edit Name":
        return (
          <>
            <div className="sidebarInputBox">
              <div>{selectedMcbDashboardApp?.title}</div>
            </div>
            <div className="breakLine">
              <div className="horizantalLine"></div>
              &nbsp;&nbsp;&nbsp;<div>New</div>&nbsp;&nbsp;&nbsp;
              <div className="horizantalLine"></div>
            </div>
            <div className="sidebarInputBox">
              <input type="text" value={newName} className="inputBox" placeholder="Enter New Name" onChange={(e) => setNewName(e.target.value)} />
            </div>
            <div className="bottomSubmit" onClick={CategoryValidate}>
              <p className="btm-text">Submit Edit</p>
            </div>
          </>
        );

      case "Edit Icon":
        return (
          <>
            <div>
              <img src={selectedMcbDashboardApp?.thumbnail} alt="" className="category-img" />
            </div>
            <div className="breakLine">
              <div className="horizantalLine"></div>
              &nbsp;&nbsp;&nbsp;<div>New</div>&nbsp;&nbsp;&nbsp;
              <div className="horizantalLine"></div>
            </div>
            <div className="bottomSubmit" onClick={CategoryIconValidate}>
              <p className="btm-text">Submit Edit</p>
            </div>
            <label className="fileInp icon centerIco">
              <img
                className={`${Boolean(colouredIcon)} centerImg`}
                src={
                  colouredIconLoading
                    ? loadingGif
                    : colouredIcon || UploadIconImg
                }
                alt=""
                style={{ width: "40px" }}
              />
              <input
                type="file"
                onChange={(e) => {
                  uploadImage(
                    e,
                    setColouredIcon,
                    setColouredIconLoading
                  );
                }}
                accept="image/*"
              />
              {/* <div
                    className="text"
                    style={{ fontWeight: "700", fontSize: "12px" }}
                  >
                    Colored Icon
                  </div> */}
              <div className="hovTxt">
                Upload
                <br />
                New
              </div>
            </label>
          </>
        );
      default:
        return (
          <>
            {/* <div className="sidebarTitle">What Would You Like To See? </div> */}
            <div
              className="sidebarCard"
              onClick={() => {
                setStep("Edit Category");
                setPath([...path, "Edit Category"]);
                setTheTitle("What Do You Want To Change?")
              }}
            >
              <img
                src={editApp}
                alt=""
                className="coin"
                style={{ width: "25px", height: "25px" }}
              />
              <div style={{ paddingLeft: "10px" }}>Edit Category</div>
            </div>
            <div
              className="sidebarCard"
              onClick={() => {
                setStep("Delete Category");
                setPath([...path, "Delete Category"]);
                setTheTitle("Delete Category")
              }}
            >
              <img
                src={changeBond}
                alt=""
                className="coin"
                style={{ width: "25px", height: "25px" }}
              />
              <div style={{ paddingLeft: "10px" }}>Delete Category</div>
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
        <div style={{ display: apiLoad ? "none" : "" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <div>{theTitle}</div>
              <div style={{ paddingLeft: "10px" }}>
                <div style={{ fontSize: "22px" }}>
                  {selectedMcbDashboardApp?.app_name}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>

              <div
                className="backButton icon-imgs close-img"
                onClick={(e) => {
                  setPath([]);
                  setShowSubDraw(false);
                  setTheTitle("Select An Action")
                  setColouredIcon("");
                }}
                style={{
                  marginLeft: "20px",
                }}
              >
                <img src={close} alt="" />
              </div>
            </div>
            {path.length > 0 ? (
              <div className="back-btm-button" onClick={pathAdjust}>
                <p className="btm-text">Go Back</p>
                {/* <button className="btm-text">go back</button> */}
              </div>
            ) : (
              ""
            )}
          </div>

          {/* <div
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
          </div> */}
        </div>
        {conditionalSteps()}
      </div>
    </>
  );
};

export default Actions;
