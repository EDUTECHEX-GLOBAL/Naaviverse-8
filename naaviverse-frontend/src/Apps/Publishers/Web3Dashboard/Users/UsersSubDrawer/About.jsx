import React, { useContext, useEffect, useState } from "react";

import back from "../../../../../static/images/icons/back.svg";
import close from "../../../../../static/images/icons/close1.svg";
import editApp from "../../../../../static/images/clipIcons/appData.svg";
import editApp1 from "../../../../../static/images/icons/editApp.svg";
import userIcon from "../../../../../static/images/clipIcons/userIcon.svg";
import deleteApp from "../../../../../static/images/clipIcons/delete.svg";
import bondIcon from "../../../../../static/images/clipIcons/bondIcon.svg";
import plusIcon from "../../../../../static/images/clipIcons/plus.svg";
import closeIcon from "../../../../../static/images/clipIcons/no.svg";
import defaultImg from "../../../../../static/images/icons/app_placeholder.png";
import usicon from "../../../../../static/images/clipIcons/theusicoon.svg"

import connectedBonds from "../../../../../static/images/icons/connectedBonds.svg";
import bondContracts from "../../../../../static/images/icons/bondPurchases.svg";
import bondIssued from "../../../../../static/images/icons/bondIssued.svg";
import interestPayments from "../../../../../static/images/icons/interestPayments.svg";
import bondSettlements from "../../../../../static/images/icons/bondSettlements.svg";
import expiredBonds from "../../../../../static/images/icons/expiredBonds.svg";

import cloudUploadIcon from "../../../../../static/images/clipIcons/cloudUpload.svg";
import loadingGif from "../../../../../static/images/loading.gif";

import { GlobalContex } from "../../../../../globalContext";
import axios from "axios";
import * as jose from "jose";
import LoadingAnimation from "../../../../../globalComponents/LoadingAnimation";
import Skeleton from "react-loading-skeleton";
import Scrollbars from "react-custom-scrollbars";

const About = ({
  allApps,
  loading,
  setLoading,
  step,
  setStep,
  path,
  setPath,
}) => {
  const {
    loginData,
    bankerEmail,
    showSubDraw,
    setShowSubDraw,
    bondSelected,
    setBondSelected,
    setSelectedTab,
    mcbMenu,
    selectedMcbDashboardApp,
    setSelectedMcbDashboardApp,
    refetchAppData,
    setRefetchAppData,
  } = useContext(GlobalContex);

  const secret = "uyrw7826^&(896GYUFWE&*#GBjkbuaf"; // secret not to be disclosed anywhere.
  const emailDev = "rahulrajsb@outlook.com"; // email of the developer.

  //Update App Details States
  const [updatedData, setUpdatedData] = useState("");

  const [imgLoading, setImgLoading] = useState(false);
  const [defaultBondTier, setDefaultBondTier] = useState(null);
  const [newDefaultBondTier, setNewDefaultBondTier] = useState();
  const [showDefaultBondList, setShowDefaultBondList] = useState(false);
  const [defaultBondTierList, setDefaultBondTierList] = useState([]);
  const [search, setSearch] = useState("");
  const [bondTierLoading, setBondTierLoading] = useState(false);
  const [updateCurrency, setUpdateCurrency] = useState("")
  const [currencyList, setCurrencyList] = useState(false)
  const [currencyData, setCurrencyData] = useState([])
  const [searchCurrency, setSearchCurrency] = useState("")
  const [defaultCurrency, setDefaultCurrency] = useState("")
  const offeringDefaultCase = [
    {
      name: "Core Branding",
      icon: userIcon,
      value: null,
      enabled: true,
    },
    {
      name: "Default Bond Tier",
      icon: bondIcon,
      value: null,
      enabled: true,
    },
    {
      name: "Default Display Currency",
      icon: usicon,
      value: null,
      enabled: true,
    },
  ];

  useEffect(() => {
    setStep("About");
    setPath(["About"]);
  }, [showSubDraw]);

  const handleBackStep = () => {
    setUpdatedData("");
    if (path.length > 1) {
      path.splice(-1);
      // console.log(tempPath, "kqjdkjwed");
      setPath([...path]);
      if (path.length > 0) {
        setStep(path[path.length - 1]);
      }
    }
  };

  function renameFile(originalFile, newName) {
    return new File([originalFile], newName, {
      type: originalFile.type,
      lastModified: originalFile.lastModified,
    });
  }

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

  const uploadImage = async (e, setUpdatedData, setLoading) => {
    setImgLoading(true);
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
    setUpdatedData(data.payload.url);
    setImgLoading(false);
  };

  const handleBreadcrumbClick = (clickedStep) => {
    setUpdatedData("");
    const foundStepIndex = path.findIndex((o) => o === clickedStep);
    const tempPath = path;
    tempPath.splice(foundStepIndex + 1, tempPath.length);
    setPath([...tempPath]);
    console.log(path, "lwndwed");
  };

  useEffect(() => {
    setStep(path[path.length - 1]);
  }, [path]);

  useEffect(() => {
    setNewDefaultBondTier(null);
  }, [showSubDraw]);

  const thecurrencies = () => {
    axios
      .get(
        `https://comms.globalxchange.io/coin/vault/get/all/coins?fiat=true`
      )
      .then(({ data }) => {
        console.log("currency-data ", data?.coins)
        setCurrencyData(data?.coins)
      });
  }

  const opencurrency = () => {
    setCurrencyList(true)
    thecurrencies()
  }

  //Update App Data Functions Start

  const handleDataChange = (bodyData) => {
    setLoading(true);
    const tempData = {
      email: bankerEmail,
      token: loginData.idToken,
      update: true,
      app_code: selectedMcbDashboardApp?.app_code,
    };
    axios
      .post(`https://comms.globalxchange.io/gxb/apps/update`, {
        ...tempData,
        ...bodyData,
      })
      .then(({ data }) => {
        if (data.status) {
          setLoading(false);
          handleBackStep();
          setRefetchAppData(!refetchAppData);
          setUpdatedData("");
        } else {
          if (data.message === "jwt expired") {
            setLoading(false);
            setStep("Token Expired");
          }
        }
      });
  };

  useEffect(() => {
    if (selectedMcbDashboardApp) {
      setSelectedMcbDashboardApp(
        allApps.find((o) => o.app_code === selectedMcbDashboardApp.app_code)
      );
    }
  }, [allApps]);

  useEffect(() => {
    if (selectedMcbDashboardApp) {
      axios
        .get(
          `https://comms.globalxchange.io/gxb/apps/get?app_code=${selectedMcbDashboardApp?.app_code}`
        )
        .then(({ data }) => {
          setDefaultBondTier(data?.apps[0]?.default_customBond_list_id);
        });
      axios
        .get(
          `https://comms.globalxchange.io/gxb/app/gxlive/user/operator/get?email=${bankerEmail}&show_apps=true`
        )
        .then(({ data }) => {
          setDefaultCurrency(data?.operators[0].app_data.find((item) => item.app_code === selectedMcbDashboardApp?.app_code))
        });
    }
  }, [selectedMcbDashboardApp]);

  useEffect(() => {
    axios
      .get(
        `https://comms.globalxchange.io/coin/iced/banker/custom/bond/user/list/get?email=${bankerEmail}`
      )
      .then(({ data }) => {
        setDefaultBondTierList(data.data);
      });
  }, []);

  const fullHeightDrawer = (message) => {
    if (message) {
      return (
        <div
          style={{
            height: window.innerHeight - 175,
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {message}
        </div>
      );
    } else {
      return (
        <div
          style={{
            height: window.innerHeight - 175,
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
            Updating App Data...
          </div>
        </div>
      );
    }
  };


  const theHeightDrawer = (message) => {
    if (message) {
      return (
        <div
          style={{
            height: window.innerHeight - 175,
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
            {message}
          </div>
        </div>
      );
    } else {
      return (
        <div
          style={{
            height: window.innerHeight - 175,
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
            Updating App Data...
          </div>
        </div>
      );
    }
  };

  const updateDefaultBondTier = () => {
    setLoading(true);
    axios
      .post(
        `https://comms.globalxchange.io/coin/iced/banker/custom/bond/user/list/default/set`,
        {
          list_id: newDefaultBondTier?.list_id,
          app_code: selectedMcbDashboardApp?.app_code,
          email: bankerEmail,
          token: loginData?.idToken,
        }
      )
      .then(({ data }) => {
        if (data.status) {
          setLoading(false);
          setRefetchAppData(!refetchAppData);
          setShowSubDraw(false);
        } else {
          if (data.message === "jwt expired") {
            setLoading(false);
            setStep("Token Expired");
          }
        }
      });
  };

  //Update App Data Functions Ends

  const HandleCurrency = () => {
    setLoading(true)
    let body = {
      email: bankerEmail,
      token: loginData.idToken,
      update: true,
      app_code: selectedMcbDashboardApp?.app_code,
      data: {
        color_logo: selectedMcbDashboardApp?.data?.color_logo,
        white_icon: selectedMcbDashboardApp?.data?.white_icon,
        website_description:
          selectedMcbDashboardApp?.data?.website_description,
        website_title: selectedMcbDashboardApp?.data?.website_title,
        currencyname: updateCurrency.coinSymbol,
      }
    }
    axios
      .post(`https://comms.globalxchange.io/gxb/apps/update`,
        body
      )
      .then(({ data }) => {
        console.log(data, "data...")
        if (data.status) {
          setLoading(false);
          setShowSubDraw(false)
          setUpdateCurrency("")
          setSearchCurrency("")
        } else {
          if (data.message === "jwt expired") {
            setLoading(false);
            setStep("Token Expired");
          }
        }
      });
    console.log(JSON.stringify(body), "savedata")
  }

  const conditionalSteps = () => {
    switch (step) {
      //All CodeBranding Steps

      case "Core Branding":
        return (
          <div
            className="scrollbarSideDraw"
            style={{
              overflowY: "scroll",
              overflowX: "hidden",
              height: window.innerHeight - 300,
            }}
          >
            <div style={{ position: "relative" }}>
              <div className="lableName">Name Of App</div>
              <div className="inputWrap1">
                {selectedMcbDashboardApp?.app_name}
              </div>
              <div
                className="editIcon"
                style={{ top: "27%" }}
                onClick={(e) => {
                  setStep("App Name");
                  setPath([...path, "App Name"]);
                }}
              >
                <img src={editApp1} alt="" />
              </div>
            </div>

            {/* Logo section starts */}
            <div style={{ paddingTop: "40px" }}>
              <div className="lableName">Logos</div>
              <div style={{ display: "flex" }}>
                <div>
                  <div className="logoCard" style={{ marginRight: "23px" }}>
                    <img
                      src={selectedMcbDashboardApp?.app_icon}
                      alt=""
                      style={{ width: "46px", height: "46px" }}
                    />
                    <div
                      className="editIcon1"
                      onClick={(e) => {
                        setStep("Coloured Icon");
                        setPath([...path, "Coloured Icon"]);
                      }}
                    >
                      <img src={editApp1} alt="" />
                    </div>
                  </div>
                  <div className="iconLabel">Coloured Icon</div>
                </div>
                <div>
                  <div className="logoCard" style={{ marginRight: "23px" }}>
                    <img
                      src={selectedMcbDashboardApp?.data?.white_icon}
                      alt=""
                      style={{ width: "46px", height: "46px" }}
                    />
                    <div
                      className="editIcon1"
                      onClick={(e) => {
                        setStep("White Icon");
                        setPath([...path, "White Icon"]);
                      }}
                    >
                      <img src={editApp1} alt="" />
                    </div>
                  </div>
                  <div className="iconLabel">White Icon</div>
                </div>
              </div>
              <div style={{ display: "flex", paddingTop: "33px" }}>
                <div style={{ marginRight: "25px" }}>
                  <div className="logoCard" style={{ width: "170px" }}>
                    <img
                      src={selectedMcbDashboardApp?.data?.color_logo}
                      alt=""
                      style={{ width: "100%", padding: "10px", height: "46px" }}
                    />
                    <div
                      className="editIcon1"
                      onClick={(e) => {
                        setStep("Coloured Logo");
                        setPath([...path, "Coloured Logo"]);
                      }}
                    >
                      <img src={editApp1} alt="" />
                    </div>
                  </div>
                  <div className="iconLabel" style={{ width: "170px" }}>
                    Coloured Logo
                  </div>
                </div>
                <div>
                  <div className="logoCard" style={{ width: "170px" }}>
                    <img
                      src={selectedMcbDashboardApp?.cover_photo}
                      alt=""
                      style={{ width: "100%", padding: "10px" }}
                    />
                    <div
                      className="editIcon1"
                      onClick={(e) => {
                        setStep("Cover Photo");
                        setPath([...path, "Cover Photo"]);
                      }}
                    >
                      <img src={editApp1} alt="" />
                    </div>
                  </div>
                  <div className="iconLabel" style={{ width: "170px" }}>
                    Cover Photo
                  </div>
                </div>
              </div>
            </div>
            {/* Logo section ends */}

            <div style={{ position: "relative", paddingTop: "40px" }}>
              <div className="lableName">Primary Colour Code</div>
              <div className="colourInput">
                <div>
                  {selectedMcbDashboardApp?.color_codes[0]?.primarycolourcode
                    ? `#${selectedMcbDashboardApp?.color_codes[0]?.primarycolourcode}`
                    : "Not Given"}
                </div>
                <div
                  style={{
                    background: selectedMcbDashboardApp?.color_codes[0]
                      ?.primarycolourcode
                      ? `#${selectedMcbDashboardApp?.color_codes[0]?.primarycolourcode}`
                      : "white",
                    borderLeft: "0.5px solid #e7e7e7",
                  }}
                >
                  &nbsp;
                </div>
              </div>

              <div
                className="editIcon"
                onClick={(e) => {
                  setStep("Colour Code");
                  setPath([...path, "Colour Code"]);
                }}
              >
                <img src={editApp1} alt="" />
              </div>
            </div>
            <div style={{ position: "relative", paddingTop: "40px" }}>
              <div className="lableName">Website</div>
              <div className="inputWrap1">
                {selectedMcbDashboardApp?.website}
              </div>
              <div
                className="editIcon"
                onClick={(e) => {
                  setStep("Website");
                  setPath([...path, "Website"]);
                }}
              >
                <img src={editApp1} alt="" />
              </div>
            </div>
            <div style={{ position: "relative", paddingTop: "40px" }}>
              <div className="lableName">Short Description</div>
              <div className="inputWrap1" style={{ height: "110px" }}>
                {selectedMcbDashboardApp?.short_description}
              </div>
              <div
                className="editIcon"
                style={{ top: "35%" }}
                onClick={(e) => {
                  setStep("Short Description");
                  setPath([...path, "Short Description"]);
                }}
              >
                <img src={editApp1} alt="" />
              </div>
            </div>
            <div style={{ position: "relative", paddingTop: "40px" }}>
              <div className="lableName">Long Description</div>
              <div className="inputWrap1" style={{ height: "300px" }}>
                {selectedMcbDashboardApp?.long_description}
              </div>
              <div
                className="editIcon"
                style={{ top: "18%" }}
                onClick={(e) => {
                  setStep("Long Description");
                  setPath([...path, "Long Description"]);
                }}
              >
                <img src={editApp1} alt="" />
              </div>
            </div>
            <div style={{ position: "relative", paddingTop: "40px" }}>
              <div className="lableName">Website Title</div>
              <div className="inputWrap1" style={{ height: "110px" }}>
                {selectedMcbDashboardApp?.data?.website_title}
              </div>
              <div
                className="editIcon"
                style={{ top: "35%" }}
                onClick={(e) => {
                  setStep("Website Title");
                  setPath([...path, "Website Title"]);
                }}
              >
                <img src={editApp1} alt="" />
              </div>
            </div>
            <div
              style={{
                position: "relative",
                paddingTop: "40px",
              }}
            >
              <div className="lableName">Website Description</div>
              <div className="inputWrap1" style={{ height: "150px" }}>
                {selectedMcbDashboardApp?.data?.website_description}
              </div>
              <div
                className="editIcon"
                style={{ top: "30%" }}
                onClick={(e) => {
                  setStep("Website Description");
                  setPath([...path, "Website Description"]);
                }}
              >
                <img src={editApp1} alt="" />
              </div>
            </div>
            <div style={{ position: "relative", paddingTop: "40px" }}>
              <div className="lableName">Registration Link</div>
              <div className="inputWrap1">
                {selectedMcbDashboardApp?.registration_link}
              </div>
              <div
                className="editIcon"
                onClick={(e) => {
                  setStep("Registration Link");
                  setPath([...path, "Registration Link"]);
                }}
              >
                <img src={editApp1} alt="" />
              </div>
            </div>
            <div style={{ position: "relative", paddingTop: "40px" }}>
              <div className="lableName">Web App Link</div>
              <div className="inputWrap1">
                {selectedMcbDashboardApp?.data?.application_link}
              </div>
              <div
                className="editIcon"
                onClick={(e) => {
                  setStep("Web App Link");
                  setPath([...path, "Web App Link"]);
                }}
              >
                <img src={editApp1} alt="" />
              </div>
            </div>
          </div>
        );

      case "App Name":
        return (
          <>
            {!loading ? (
              <>
                <div
                  className="scrollbarSideDraw"
                  style={{
                    overflowY: "scroll",
                    overflowX: "hidden",
                    height: window.innerHeight - 400,
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <div className="lableName">Current Name Of App</div>
                    <div className="inputWrap1">
                      {selectedMcbDashboardApp?.app_name}
                    </div>
                  </div>
                  <div style={{ position: "relative", paddingTop: "40px" }}>
                    <div className="lableName">Enter New Name</div>
                    <div className="inputWrap1">
                      <input
                        placeholder="Enter Name...."
                        value={updatedData}
                        onChange={(e) => setUpdatedData(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="footerBtns">
                  <div onClick={(e) => handleBackStep()}>Go Back</div>
                  <div
                    onClick={(e) =>
                      handleDataChange({
                        app_name: updatedData,
                      })
                    }
                  >
                    Save Changes
                  </div>
                </div>
              </>
            ) : (
              fullHeightDrawer()
            )}
          </>
        );

      case "Coloured Icon":
        return (
          <>
            {!loading ? (
              <>
                <div
                  className="scrollbarSideDraw"
                  style={{
                    overflowY: "scroll",
                    overflowX: "hidden",
                    height: window.innerHeight - 400,
                  }}
                >
                  <div>
                    <div className="lableName">Current Coloured Icon</div>
                    <div className="logoCard" style={{ marginRight: "23px" }}>
                      <img
                        src={selectedMcbDashboardApp?.app_icon}
                        alt=""
                        style={{ width: "46px", height: "46px" }}
                      />
                    </div>
                  </div>
                  <br />
                  <div className="lableName">New Coloured Icon</div>
                  <div className="filesUpload" style={{ marginTop: "-20px" }}>
                    <label
                      className="fileInp icon"
                      style={{
                        flex: "0 0 100%",
                        maxWidth: "103px",
                        height: "80px",
                      }}
                    >
                      <img
                        style={{ width: "46px", height: "46px" }}
                        className={`${Boolean(updatedData)}`}
                        src={
                          imgLoading
                            ? loadingGif
                            : updatedData || cloudUploadIcon
                        }
                        alt=""
                      />
                      <input
                        type="file"
                        onChange={(e) => {
                          uploadImage(e, setUpdatedData, setLoading);
                        }}
                        accept="image/*"
                      />

                      <div className="hovTxt">
                        Upload
                        <br />
                        New
                      </div>
                    </label>
                  </div>
                </div>
                <div className="footerBtns">
                  <div onClick={(e) => handleBackStep()}>Go Back</div>
                  <div
                    onClick={(e) =>
                      handleDataChange({
                        app_icon: updatedData,
                      })
                    }
                  >
                    Save Changes
                  </div>
                </div>
              </>
            ) : (
              fullHeightDrawer()
            )}
          </>
        );

      case "White Icon":
        return (
          <>
            {!loading ? (
              <>
                <div
                  className="scrollbarSideDraw"
                  style={{
                    overflowY: "scroll",
                    overflowX: "hidden",
                    height: window.innerHeight - 400,
                  }}
                >
                  <div>
                    <div className="lableName">Current White Icon</div>
                    <div className="logoCard" style={{ marginRight: "23px" }}>
                      <img
                        src={selectedMcbDashboardApp?.data?.white_icon}
                        alt=""
                        style={{ width: "46px", height: "46px" }}
                      />
                    </div>
                  </div>
                  <br />
                  <div className="lableName">New White Icon</div>
                  <div className="filesUpload" style={{ marginTop: "-20px" }}>
                    <label
                      className="fileInp icon"
                      style={{
                        flex: "0 0 100%",
                        maxWidth: "103px",
                        height: "80px",
                      }}
                    >
                      <img
                        style={{ width: "46px", height: "46px" }}
                        className={`${Boolean(updatedData)}`}
                        src={
                          imgLoading
                            ? loadingGif
                            : updatedData || cloudUploadIcon
                        }
                        alt=""
                      />
                      <input
                        type="file"
                        onChange={(e) => {
                          uploadImage(e, setUpdatedData, setLoading);
                        }}
                        accept="image/*"
                      />

                      <div className="hovTxt">
                        Upload
                        <br />
                        New
                      </div>
                    </label>
                  </div>
                </div>
                <div className="footerBtns">
                  <div onClick={(e) => handleBackStep()}>Go Back</div>
                  <div
                    onClick={(e) =>
                      handleDataChange({
                        data: {
                          color_logo: selectedMcbDashboardApp?.data?.color_logo,
                          white_icon: updatedData,
                          website_description:
                            selectedMcbDashboardApp?.data?.website_description,
                          website_title:
                            selectedMcbDashboardApp?.data?.website_title,
                          currencyname: "USD",
                        },
                      })
                    }
                  >
                    Save Changes
                  </div>
                </div>
              </>
            ) : (
              fullHeightDrawer()
            )}
          </>
        );

      case "Coloured Logo":
        return (
          <>
            {!loading ? (
              <>
                <div
                  className="scrollbarSideDraw"
                  style={{
                    overflowY: "scroll",
                    overflowX: "hidden",
                    height: window.innerHeight - 400,
                  }}
                >
                  <div>
                    <div className="lableName">Current Coloured Logo</div>
                    <div className="logoCard" style={{ width: "170px" }}>
                      <img
                        src={selectedMcbDashboardApp?.data?.color_logo}
                        alt=""
                        style={{
                          width: "100%",
                          padding: "10px",
                          height: "46px",
                        }}
                      />
                    </div>
                  </div>
                  <br />
                  <div className="lableName">New Coloured Logo</div>
                  <div className="filesUpload" style={{ marginTop: "-20px" }}>
                    <label
                      className="fileInp icon"
                      style={{
                        flex: "0 0 100%",
                        maxWidth: "170px",
                        height: "80px",
                        padding: "10px",
                      }}
                    >
                      <img
                        className={`${Boolean(updatedData)}`}
                        src={
                          imgLoading
                            ? loadingGif
                            : updatedData || cloudUploadIcon
                        }
                        alt=""
                      />
                      <input
                        type="file"
                        onChange={(e) => {
                          uploadImage(e, setUpdatedData, setLoading);
                        }}
                        accept="image/*"
                      />

                      <div className="hovTxt">
                        Upload
                        <br />
                        New
                      </div>
                    </label>
                  </div>
                </div>
                <div className="footerBtns">
                  <div onClick={(e) => handleBackStep()}>Go Back</div>
                  <div
                    onClick={(e) =>
                      handleDataChange({
                        data: {
                          color_logo: updatedData,
                          white_icon: selectedMcbDashboardApp?.data?.white_icon,
                          website_description:
                            selectedMcbDashboardApp?.data?.website_description,
                          website_title:
                            selectedMcbDashboardApp?.data?.website_title,
                          currencyname: "USD",
                        },
                      })
                    }
                  >
                    Save Changes
                  </div>
                </div>
              </>
            ) : (
              fullHeightDrawer()
            )}
          </>
        );

      case "Cover Photo":
        return (
          <>
            {!loading ? (
              <>
                <div
                  className="scrollbarSideDraw"
                  style={{
                    overflowY: "scroll",
                    overflowX: "hidden",
                    height: window.innerHeight - 400,
                  }}
                >
                  <div>
                    <div className="lableName">Current Cover Photo</div>
                    <div className="logoCard" style={{ width: "170px" }}>
                      <img
                        src={selectedMcbDashboardApp?.cover_photo}
                        alt=""
                        style={{ width: "100%", padding: "10px" }}
                      />
                    </div>
                  </div>
                  <br />
                  <div className="lableName">New Cover Photo</div>
                  <div className="filesUpload" style={{ marginTop: "-20px" }}>
                    <label
                      className="fileInp icon"
                      style={{
                        flex: "0 0 100%",
                        maxWidth: "170px",
                        height: "80px",
                        padding: "10px",
                      }}
                    >
                      <img
                        className={`${Boolean(updatedData)}`}
                        src={
                          imgLoading
                            ? loadingGif
                            : updatedData || cloudUploadIcon
                        }
                        alt=""
                      />
                      <input
                        type="file"
                        onChange={(e) => {
                          uploadImage(e, setUpdatedData, setLoading);
                        }}
                        accept="image/*"
                      />

                      <div className="hovTxt">
                        Upload
                        <br />
                        New
                      </div>
                    </label>
                  </div>
                </div>
                <div className="footerBtns">
                  <div onClick={(e) => handleBackStep()}>Go Back</div>
                  <div
                    onClick={(e) =>
                      handleDataChange({
                        cover_photo: updatedData,
                      })
                    }
                  >
                    Save Changes
                  </div>
                </div>
              </>
            ) : (
              fullHeightDrawer()
            )}
          </>
        );

      case "Colour Code":
        return (
          <>
            {!loading ? (
              <>
                <div
                  className="scrollbarSideDraw"
                  style={{
                    overflowY: "scroll",
                    overflowX: "hidden",
                    height: window.innerHeight - 400,
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <div className="lableName">Current Colour Code</div>
                    <div className="colourInput">
                      <div>
                        {selectedMcbDashboardApp?.color_codes[0]
                          ?.primarycolourcode
                          ? `#${selectedMcbDashboardApp?.color_codes[0]?.primarycolourcode}`
                          : "Not Given"}
                      </div>
                      <div
                        style={{
                          background: selectedMcbDashboardApp?.color_codes[0]
                            ?.primarycolourcode
                            ? `#${selectedMcbDashboardApp?.color_codes[0]?.primarycolourcode}`
                            : "white",
                          borderLeft: "0.5px solid #e7e7e7",
                        }}
                      >
                        &nbsp;
                      </div>
                    </div>
                  </div>

                  <div style={{ position: "relative", paddingTop: "40px" }}>
                    <div className="lableName">Enter New Colour Code</div>
                    <div className="colourInput">
                      <input
                        style={{ border: "none", paddingLeft: "20px" }}
                        placeholder="Enter New Colour Code...."
                        value={updatedData}
                        onChange={(e) => setUpdatedData(e.target.value)}
                      />
                      <div
                        style={{
                          background: updatedData ? `#${updatedData}` : "white",
                          borderLeft: "0.5px solid #e7e7e7",
                        }}
                      >
                        &nbsp;
                      </div>
                    </div>
                  </div>
                </div>
                <div className="footerBtns">
                  <div onClick={(e) => handleBackStep()}>Go Back</div>
                  <div
                    onClick={(e) =>
                      handleDataChange({
                        color_codes: [
                          {
                            primarycolourcode: updatedData,
                          },
                        ],
                      })
                    }
                  >
                    Save Changes
                  </div>
                </div>
              </>
            ) : (
              fullHeightDrawer()
            )}
          </>
        );

      case "Token Expired":
        return (
          <>
            {fullHeightDrawer("Token Expired. Please Relogin.")}
            <div className="footerBtns">
              <div onClick={(e) => handleBackStep()}>Go Back</div>
              <div
                onClick={(e) => {
                  localStorage.clear();
                  window.location.reload();
                }}
              >
                Logout
              </div>
            </div>
          </>
        );

      case "Website":
        return (
          <>
            {!loading ? (
              <>
                <div
                  className="scrollbarSideDraw"
                  style={{
                    overflowY: "scroll",
                    overflowX: "hidden",
                    height: window.innerHeight - 400,
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <div className="lableName">Current Website Address</div>
                    <div className="inputWrap1">
                      {selectedMcbDashboardApp?.website}
                    </div>
                  </div>
                  <div style={{ position: "relative", paddingTop: "40px" }}>
                    <div className="lableName">Enter New Website Address</div>
                    <div className="inputWrap1">
                      <input
                        placeholder="Enter Website Address...."
                        value={updatedData}
                        onChange={(e) => setUpdatedData(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="footerBtns">
                  <div onClick={(e) => handleBackStep()}>Go Back</div>
                  <div
                    onClick={(e) =>
                      handleDataChange({
                        website: updatedData,
                      })
                    }
                  >
                    Save Changes
                  </div>
                </div>
              </>
            ) : (
              fullHeightDrawer()
            )}
          </>
        );

      case "Short Description":
        return (
          <>
            {!loading ? (
              <>
                <div
                  className="scrollbarSideDraw"
                  style={{
                    overflowY: "scroll",
                    overflowX: "hidden",
                    height: window.innerHeight - 400,
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <div className="lableName">Current Short Description</div>
                    <div className="inputWrap1" style={{ height: "110px" }}>
                      {selectedMcbDashboardApp?.short_description}
                    </div>
                  </div>
                  <div style={{ position: "relative", paddingTop: "40px" }}>
                    <div className="lableName">Enter New Short Description</div>
                    <div className="inputWrap1" style={{ height: "auto" }}>
                      <textarea
                        style={{ width: "100%", border: "none" }}
                        rows="5"
                        placeholder="Enter Short Description...."
                        value={updatedData}
                        onChange={(e) => setUpdatedData(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="footerBtns">
                  <div onClick={(e) => handleBackStep()}>Go Back</div>
                  <div
                    onClick={(e) =>
                      handleDataChange({
                        short_description: updatedData,
                      })
                    }
                  >
                    Save Changes
                  </div>
                </div>
              </>
            ) : (
              fullHeightDrawer()
            )}
          </>
        );

      case "Long Description":
        return (
          <>
            {!loading ? (
              <>
                <div
                  className="scrollbarSideDraw"
                  style={{
                    overflowY: "scroll",
                    overflowX: "hidden",
                    height: window.innerHeight - 400,
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <div className="lableName">Current Long Description</div>
                    <div className="inputWrap1" style={{ height: "300px" }}>
                      {selectedMcbDashboardApp?.long_description}
                    </div>
                  </div>
                  <div style={{ position: "relative", paddingTop: "40px" }}>
                    <div className="lableName">Enter New Long Description</div>
                    <div className="inputWrap1" style={{ height: "auto" }}>
                      <textarea
                        style={{ width: "100%", border: "none" }}
                        rows="10"
                        placeholder="Enter Long Description...."
                        value={updatedData}
                        onChange={(e) => setUpdatedData(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="footerBtns">
                  <div onClick={(e) => handleBackStep()}>Go Back</div>
                  <div
                    onClick={(e) =>
                      handleDataChange({
                        long_description: updatedData,
                      })
                    }
                  >
                    Save Changes
                  </div>
                </div>
              </>
            ) : (
              fullHeightDrawer()
            )}
          </>
        );

      case "Website Title":
        return (
          <>
            {!loading ? (
              <>
                <div
                  className="scrollbarSideDraw"
                  style={{
                    overflowY: "scroll",
                    overflowX: "hidden",
                    height: window.innerHeight - 400,
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <div className="lableName">Current Website Title</div>
                    <div className="inputWrap1" style={{ height: "110px" }}>
                      {selectedMcbDashboardApp?.data?.website_title}
                    </div>
                  </div>
                  <div style={{ position: "relative", paddingTop: "40px" }}>
                    <div className="lableName">Enter New Website Title</div>
                    <div className="inputWrap1" style={{ height: "auto" }}>
                      <textarea
                        rows="5"
                        style={{ width: "100%", border: "none" }}
                        placeholder="Enter Website Address...."
                        value={updatedData}
                        onChange={(e) => setUpdatedData(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="footerBtns">
                  <div onClick={(e) => handleBackStep()}>Go Back</div>
                  <div
                    onClick={(e) =>
                      handleDataChange({
                        data: {
                          color_logo: selectedMcbDashboardApp?.data?.color_logo,
                          white_icon: selectedMcbDashboardApp?.data?.white_icon,
                          website_description:
                            selectedMcbDashboardApp?.data?.website_description,
                          website_title: updatedData,
                          currencyname: "USD",
                        },
                      })
                    }
                  >
                    Save Changes
                  </div>
                </div>
              </>
            ) : (
              fullHeightDrawer()
            )}
          </>
        );

      case "Website Description":
        return (
          <>
            {!loading ? (
              <>
                <div
                  className="scrollbarSideDraw"
                  style={{
                    overflowY: "scroll",
                    overflowX: "hidden",
                    height: window.innerHeight - 400,
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <div className="lableName">Current Website Description</div>
                    <div className="inputWrap1" style={{ height: "150px" }}>
                      {selectedMcbDashboardApp?.data?.website_description}
                    </div>
                  </div>
                  <div style={{ position: "relative", paddingTop: "40px" }}>
                    <div className="lableName">
                      Enter New Website Description
                    </div>
                    <div className="inputWrap1" style={{ height: "auto" }}>
                      <textarea
                        rows="7"
                        style={{ width: "100%", border: "none" }}
                        placeholder="Enter Website Description...."
                        value={updatedData}
                        onChange={(e) => setUpdatedData(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="footerBtns">
                  <div onClick={(e) => handleBackStep()}>Go Back</div>
                  <div
                    onClick={(e) =>
                      handleDataChange({
                        data: {
                          color_logo: selectedMcbDashboardApp?.data?.color_logo,
                          white_icon: selectedMcbDashboardApp?.data?.white_icon,
                          website_description: updatedData,
                          website_title:
                            selectedMcbDashboardApp?.data?.website_title,
                          currencyname: "USD",
                        },
                      })
                    }
                  >
                    Save Changes
                  </div>
                </div>
              </>
            ) : (
              fullHeightDrawer()
            )}
          </>
        );

      case "Registration Link":
        return (
          <>
            {!loading ? (
              <>
                <div
                  className="scrollbarSideDraw"
                  style={{
                    overflowY: "scroll",
                    overflowX: "hidden",
                    height: window.innerHeight - 400,
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <div className="lableName">Current Registration Link</div>
                    <div className="inputWrap1">
                      {selectedMcbDashboardApp?.registration_link}
                    </div>
                  </div>
                  <div style={{ position: "relative", paddingTop: "40px" }}>
                    <div className="lableName">Enter New Registration Link</div>
                    <div className="inputWrap1">
                      <input
                        placeholder="Enter Registration Link...."
                        value={updatedData}
                        onChange={(e) => setUpdatedData(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="footerBtns">
                  <div onClick={(e) => handleBackStep()}>Go Back</div>
                  <div
                    onClick={(e) =>
                      handleDataChange({
                        registration_link: updatedData,
                      })
                    }
                  >
                    Save Changes
                  </div>
                </div>
              </>
            ) : (
              fullHeightDrawer()
            )}
          </>
        );

      case "Web App Link":
        return (
          <>
            {!loading ? (
              <>
                <div
                  className="scrollbarSideDraw"
                  style={{
                    overflowY: "scroll",
                    overflowX: "hidden",
                    height: window.innerHeight - 400,
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <div className="lableName">Current Web App Link</div>
                    <div className="inputWrap1">
                      {selectedMcbDashboardApp?.data?.application_link}
                    </div>
                  </div>
                  <div style={{ position: "relative", paddingTop: "40px" }}>
                    <div className="lableName">Enter New Web App Link</div>
                    <div className="inputWrap1">
                      <input
                        placeholder="Enter Web App Link...."
                        value={updatedData}
                        onChange={(e) => setUpdatedData(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="footerBtns">
                  <div onClick={(e) => handleBackStep()}>Go Back</div>
                  <div
                    onClick={(e) =>
                      handleDataChange({
                        data: {
                          color_logo: selectedMcbDashboardApp?.data?.color_logo,
                          white_icon: selectedMcbDashboardApp?.data?.white_icon,
                          website_description:
                            selectedMcbDashboardApp?.data?.website_description,
                          website_title:
                            selectedMcbDashboardApp?.data?.website_title,
                          currencyname: "USD",
                          application_link: updatedData,
                        },
                      })
                    }
                  >
                    Save Changes
                  </div>
                </div>
              </>
            ) : (
              fullHeightDrawer()
            )}
          </>
        );

      // All Default Bond Tier Steps

      case "Default Bond Tier":
        return (
          <div
            className="scrollbarSideDraw"
            style={{
              overflowY: "scroll",
              overflowX: "hidden",
              height: window.innerHeight - 300,
            }}
          >
            <div style={{ position: "relative" }}>
              <div className="lableName">Default Bond Tier</div>
              <div className="inputWrap1">{defaultBondTier}</div>
              <div
                className="editIcon"
                style={{ top: "27%" }}
                onClick={(e) => {
                  setStep("Edit Default Bond Tier");
                  setPath([...path, "Edit Default Bond Tier"]);
                }}
              >
                <img src={editApp1} alt="" />
              </div>
            </div>
          </div>
        );

      case "Edit Default Bond Tier":
        return (
          <>
            {!loading ? (
              !showDefaultBondList ? (
                <>
                  <div
                    className="scrollbarSideDraw"
                    style={{
                      overflowY: "scroll",
                      overflowX: "hidden",
                      height: window.innerHeight - 400,
                    }}
                  >
                    <div style={{ position: "relative" }}>
                      <div className="lableName">Current Default Bond Tier</div>
                      <div className="inputWrap1">{defaultBondTier}</div>
                    </div>
                    <div style={{ position: "relative", paddingTop: "40px" }}>
                      <div className="lableName">
                        Select New Default Bond Tier
                      </div>
                      <div
                        className="inputWrap1"
                        onClick={(e) => setShowDefaultBondList(true)}
                      >
                        {newDefaultBondTier ? (
                          <span>{newDefaultBondTier.name}</span>
                        ) : (
                          <span style={{ opacity: "0.5" }}>
                            Click to Select
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="footerBtns">
                    <div onClick={(e) => handleBackStep()}>Go Back</div>
                    <div onClick={(e) => updateDefaultBondTier()}>
                      Save Changes
                    </div>
                  </div>
                </>
              ) : (
                <div className="newConglomerate" style={{ height: "80vh" }}>
                  <div className="titleOp" style={{ marginTop: "0px" }}>
                    Select Default Bond Tier
                  </div>
                  <div className="searchWrap">
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      type="text"
                      placeholder="Search Assets....|"
                    />
                  </div>
                  <Scrollbars className="searchList">
                    {loading
                      ? Array(6)
                        .fill("")
                        .map((_, i) => (
                          <div className="user" key={i}>
                            <Skeleton className="dp" circle />
                            <div className="userDetail">
                              <Skeleton className="name" width={200} />
                              <Skeleton className="email" width={200} />
                            </div>
                          </div>
                        ))
                      : defaultBondTierList
                        .filter(
                          (item) =>
                            item.name
                              ?.toLowerCase()
                              .includes(search.toLowerCase()) ||
                            item.list_id
                              ?.toLowerCase()
                              .includes(search.toLowerCase())
                        )
                        .map((item) => (
                          <div
                            className="user"
                            key={item._id}
                            onClick={() => {
                              setNewDefaultBondTier(item);
                              setShowDefaultBondList(false);
                            }}
                          >
                            <img className="dp" src={item.icon} alt="" />
                            <div className="userDetail">
                              <div
                                className="name"
                                style={{ fontSize: "22px", fontWeight: 700 }}
                              >
                                {item.name}
                              </div>
                              <div
                                className="email"
                                style={{ fontSize: "12px", fontWeight: 400 }}
                              >
                                {item.list_id}
                              </div>
                            </div>
                          </div>
                        ))}
                    <div className="space"></div>
                  </Scrollbars>
                </div>
              )
            ) : (
              fullHeightDrawer("")
            )}
          </>
        );
      case "Default Display Currency":
        return (
          <div
            className="scrollbarSideDraw"
            style={{
              overflowY: "scroll",
              overflowX: "hidden",
              height: window.innerHeight - 300,
            }}
          >
            <div style={{ position: "relative" }}>
              <div className="lableName">Current Default Display Currency</div>
              <div className="inputWrap1">
                {defaultCurrency?.data?.currencyname}
              </div>
              <div
                className="editIcon"
                style={{ top: "27%" }}
                onClick={(e) => {
                  setStep("Edit");
                  setPath([...path, "Edit"]);
                }}
              >
                <img src={editApp1} alt="" />
              </div>
            </div>
          </div>
        );
      case "Edit":
        return (
          <>
            {!loading ? (
              !currencyList ?
                <><div
                  className="scrollbarSideDraw"
                  style={{
                    overflowY: "scroll",
                    overflowX: "hidden",
                    height: window.innerHeight - 400,
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <div className="lableName">Current Default Display Currency</div>
                    <div className="inputWrap1">
                      {defaultCurrency?.data?.currencyname}
                    </div>
                  </div>
                  <div style={{ position: "relative", paddingTop: "40px" }}>
                    <div className="lableName">Select New Default Display Currency</div>
                    <div className="inputWrap1">
                      <input style={{ fontWeight: "700" }}
                        placeholder="Click To Select"
                        value={updateCurrency.coinSymbol}
                        onClick={opencurrency}
                      />
                    </div>
                  </div>
                </div>
                  <div className="footerBtns">
                    <div onClick={(e) => handleBackStep()}>Go Back</div>
                    <div onClick={HandleCurrency}>
                      Save Changes
                    </div>
                  </div></> :
                <div className="newConglomerate" style={{ height: "80vh" }}>
                  <div className="titleOp" style={{ marginTop: "0px" }}>
                    Select Default Display Currency
                  </div>
                  <div className="searchWrap">
                    <input
                      value={searchCurrency}
                      onChange={(e) => setSearchCurrency(e.target.value)}
                      type="text"
                      placeholder="Search....|"
                    />
                  </div>
                  <Scrollbars className="searchList">
                    {loading
                      ? Array(6)
                        .fill("")
                        .map((_, i) => (
                          <div className="user" key={i}>
                            <Skeleton className="dp" circle />
                            <div className="userDetail">
                              <Skeleton className="name" width={200} />
                              <Skeleton className="email" width={200} />
                            </div>
                          </div>
                        ))
                      : currencyData
                        .filter(
                          (item) =>
                            item.coinName
                              ?.toLowerCase()
                              .includes(searchCurrency.toLowerCase()) ||
                            item.coinSymbol
                              ?.toLowerCase()
                              .includes(searchCurrency.toLowerCase())
                        )
                        .map((item) => (
                          <div
                            className="user"
                            key={item._id}
                            onClick={() => {
                              setUpdateCurrency(item);
                              setCurrencyList(false);
                            }}
                          >
                            <img className="dp" src={item.coinImage} alt="" />
                            <div className="userDetail">
                              <div
                                className="name"
                                style={{ fontSize: "22px", fontWeight: 700 }}
                              >
                                {item.coinName}
                              </div>
                              <div
                                className="email"
                                style={{ fontSize: "12px", fontWeight: 400 }}
                              >
                                {item.coinSymbol}
                              </div>
                            </div>
                          </div>
                        ))}
                    <div className="space"></div>
                  </Scrollbars>
                </div>
            ) : (
              theHeightDrawer("Updating Default Display Currency...")
            )}
          </>
        );
      default:
        return (
          <div style={{ padding: "0px 30px" }}>
            <div className="sidebarTitle">What Would You Like To See? </div>
            <div
              style={{ overflowY: "scroll", height: window.innerHeight - 380 }}
            >
              {offeringDefaultCase.map((item) => {
                return (
                  <div
                    // className={
                    //   item.enabled ? "sidebarCard" : "sidebarCardDisabled"
                    // }
                    className="sidebarCard"
                    onClick={(e) => {
                      if (item.enabled) {
                        setStep(item.name);
                        setPath([...path, item.name]);
                      }
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <img src={item.icon} alt="" style={{ width: "20px" }} />
                      <div style={{ paddingLeft: "10px" }}>{item.name}</div>
                    </div>
                    <div>{item.value}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <div
        style={{
          height: "90px",
        }}
      >
        {!loading && step !== "Token Expired" ? (
          <div style={{ padding: "30px" }}>
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
                    selectedMcbDashboardApp?.app_icon
                      ? selectedMcbDashboardApp?.app_icon
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
                  <div style={{ fontSize: "22px" }}>
                    {selectedMcbDashboardApp?.app_name}
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
                  onClick={(e) => setShowSubDraw(false)}
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
              style={{
                display: "flex",
                flexDirection: "row",
                height: "20px",
                paddingTop: "7px",
              }}
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
        ) : (
          ""
        )}
        {conditionalSteps()}
      </div>
    </>
  );
};

export default About;
