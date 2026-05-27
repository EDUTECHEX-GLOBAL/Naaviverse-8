import React, { useEffect, useMemo, useState } from "react";

import OtpInput from "react-otp-input";
import classNames from "./settingsModal.module.scss";
import arrowGo from "../../static/images/clipIcons/arrowGo.svg";

// import { toast } from "react-toastify";
import axios from "axios";

import { useContext } from "react";
import { GlobalContex } from "../../globalContext";
import { useRef } from "react";

import "./adminModal.scss";
import Skeleton from "react-loading-skeleton";
function AdminModal({ onClose = () => {}, onSuccess = () => {}, logoParam }) {
  const {
    bankerEmail,
    loginData,
    // setLoginData,
    setBankerEmail,
    selectedApp,
    // loading,
    // setLoading,
    query,
    // setQuery,
    // shareToken,
    // setShareToken,
    // banker,
    // setBanker,
    allShareToken,
    // setAllShareToken,
    // allBankers,
    // setAllBankers,
    // setModalOpen,
    selectedBrand,
    setSelectedBrand,
    selectedBrandApp,
    setSelectedBrandApp,
    allAppsForBrand,
    allBrands,
    mcbAdminLoading,
    allPublications,
    setAllPublications,
    selectedPublication,
    setSelectedPublication,
    authorDetail,
    setAuthorDetail,
  } = useContext(GlobalContex);

  const bankerEmailRef = useRef();

  const [step, setStep] = useState("");
  const [pin, setPin] = useState("");
  const [search, setSearch] = useState("");
  // const [query, setQuery] = useState("");
  const [newBankerData, setNewBankerData] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  // const [loading, setLoading] = useState(false);

  // const filteredSharedToken = allShareToken
  //   ? allShareToken.filter((item) => {
  //       const lowquery = query.toLowerCase();
  //       return (
  //         (item.token_profile_data.coinSymbol + item.apps_metadata[0].app_name)
  //           .toLowerCase()
  //           .indexOf(lowquery) >= 0
  //       );
  //     })
  //   : "";

  const checkPinValidity = () => {
    axios
      .post(
        `https://comms.globalxchange.io/gxb/apps/user/validate/group/pin`,
        {
          email: loginData.user.email,
          token: loginData?.idToken,
          pin: pin,
          group_id: "66me7fdkhxsbtur",
        }
      )
      .then((res) => {
        if (res.data.status) {
          setModalLoading(false);
          setStep("Validated");
          setTimeout(() => {
            setStep("EnterEmail");
          }, 2000);
        } else {
          if (res.data.message === "jwt expired") {
            setModalLoading(false);
            setStep("InvalidJwt");
          } else {
            setModalLoading(false);
            setStep("Invalid");
          }
        }
      })
      .finally((e) => {
        setPin("");
      });
  };

  useEffect(() => {
    console.log(selectedPublication, "kjwdkjwefkjwebfk");
  }, []);

  useEffect(() => {
    if (pin.length === 4) {
      setModalLoading(true);
      checkPinValidity();
    }
  }, [pin]);

  const handleSetBankerEmail = () => {
    axios
      .get(
        `https://comms.globalxchange.io/user/profile/data/get?email=${bankerEmailRef.current.value}`
      )
      .then((res) => {
        if (res.data.status) {
          // console.log(
          //   res.data?.usersData,
          //   "testing the user data from Admin Modal..."
          // );
          setNewBankerData(res.data.usersData[0]);
          setStep("VerifyUser");
          localStorage.setItem(
            "web3today",
            JSON.stringify(res.data.usersData[0])
          );
          localStorage.setItem(
            "newBankerData",
            JSON.stringify(res.data.usersData[0])
          );
          localStorage.setItem(
            "bankerEmailNew",
            res.data.usersData[0]?.hardCoded[0]?.data?.email
          );
        }
      });

    // setBankerEmail(bankerEmailRef.current.value);
    // setStep(null);
  };

  const getAuthorDetails = ({ email }) => {
    axios
      .get(
        `https://publications.apimachine.com/application/publisher/detail/${email}`
        // `https://publications.apimachine.com/publisher?email=${bankerEmail}`
      )
      .then(({ data }) => {
        if (data.status) {
          console.log("pubisthere");
          setBankerEmail(email);
          setStep(null);
        } else {
          console.log("pubistherenot");
          setStep(null);
        }
      });
  };

  const stepRender = useMemo(() => {
    switch (step) {
      case "Admin":
        return (
          <>
            <div className="modalStyle">
              <div className="headerSection">Settings</div>
              <div className="breadcrumb">
                <span className="crumbs" onClick={(e) => setStep(null)}>
                  Settings
                </span>
                &nbsp;
                {"> "}
                <span
                  className="crumbs"
                  style={{ textDecoration: "underline", fontWeight: 700 }}
                >
                  Admin
                </span>
              </div>
              <div className={classNames.inCard}>
                <div className={classNames.otpView}>
                  <div className={classNames.label}>Enter Admin PIN</div>
                  <OtpInput
                    value={pin}
                    onChange={setPin}
                    numInputs={4}
                    separator={<span> </span>}
                    shouldAutoFocus
                    containerStyle={classNames.otpInputWrapper}
                    inputStyle={classNames.otpInput}
                  />
                </div>
              </div>
            </div>

            <br />

            <div className={classNames.footerBtns} style={{ display: "flex" }}>
              <div
                onClick={(e) => setStep(null)}
                className={classNames.btnSettings}
                style={{ background: "white", color: "#292929" }}
              >
                <span>Back</span>
              </div>
              <div
                // onClick={(e) => checkPinValidity()}
                className={classNames.btnSettings}
                style={{
                  background: selectedApp.appColor,
                  borderLeft: "1px solid gray",
                }}
              >
                <span style={{ opacity: "0.5" }}>Next</span>
              </div>
            </div>
          </>
        );
      case "Validated":
        return (
          <>
            <div
              className="modalStyle"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "25px",
                fontWeight: 700,
                textAlign: "center",
              }}
            >
              Your Pin Has Been Successfully Validated
            </div>
          </>
        );
      case "EnterEmail":
        return (
          <>
            <div className="modalStyle">
              <div className="headerSection">Settings</div>
              <div className="breadcrumb">
                <span className="crumbs" onClick={(e) => setStep(null)}>
                  Settings
                </span>
                &nbsp;
                {"> "}
                <span className="crumbs" onClick={(e) => setStep("Admin")}>
                  Admin
                </span>
                {"> "}
                <span style={{ fontWeight: 700, textDecoration: "underline" }}>
                  Enter Email
                </span>
              </div>
              <br />
              <div className="titleSection">Enter Email</div>
              <div style={{ width: "100%" }}>
                <input
                  ref={bankerEmailRef}
                  placeholder="Enter Email"
                  // value={newBankerEmail}
                  // onChange={(e) => setNewBankerEmail(e.target.value)}
                  type="text"
                  style={{
                    borderRadius: "15px",
                    width: "100%",
                    border: "0.5px solid #E5E5E5",
                    height: "59px",
                    padding: "0px 20px",
                    color: "black",
                  }}
                />
              </div>
            </div>
            <br />

            <div className={classNames.footerBtns} style={{ display: "flex" }}>
              <div
                onClick={(e) => setStep(null)}
                className={classNames.btnSettings}
                style={{ background: "#E7E7E780", color: "#292929" }}
              >
                <span>Back</span>
              </div>
              <div
                onClick={(e) => handleSetBankerEmail()}
                className={classNames.btnSettings}
                style={{
                  background: selectedApp.appColor,
                  borderLeft: "1px solid gray",
                }}
              >
                <span>Next</span>
              </div>
            </div>
          </>
        );
      case "VerifyUser":
        return (
          <>
            <div className="modalStyle">
              <div className="headerSection">Settings</div>
              <div className="breadcrumb">
                <span className="crumbs" onClick={(e) => setStep("Admin")}>
                  Admin
                </span>
                {"> "}
                <span className="crumbs" onClick={(e) => setStep("EnterEmail")}>
                  Enter Email
                </span>
                {">"}
                <span
                  className="crumbs"
                  style={{
                    fontWeight: 700,
                    textDecoration: "underline",
                    paddingLeft: "5px",
                  }}
                >
                  Verify User
                </span>
              </div>
              <br />
              <div className="titleSection">Is This The User?</div>
              <div
                onClick={(e) => {
                  if (selectedApp.appName === "Authors") {
                    getAuthorDetails(newBankerData?.hardCoded[0]?.data?.email);
                  } else {
                    setBankerEmail(newBankerData?.hardCoded[0]?.data?.email);
                    setStep(null);
                  }
                }}
                style={{
                  width: "100%",
                  borderRadius: "15px",
                  width: "100%",
                  border: "0.5px solid #E5E5E5",
                  height: "65px",
                  padding: "0px 20px",
                  color: "black",
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <img
                  src={newBankerData?.dynamic[0]?.data?.profile_img}
                  alt=""
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "100%",
                  }}
                />
                <div style={{ paddingLeft: "10px" }}>
                  <div style={{ fontWeight: 700 }}>
                    {newBankerData?.hardCoded[0]?.data?.username}
                  </div>
                  <div>{newBankerData?.hardCoded[0]?.data?.email}</div>
                </div>
              </div>
            </div>
            <br />

            <div className={classNames.footerBtns} style={{ display: "flex" }}>
              <div
                onClick={(e) => setStep(null)}
                className={classNames.btnSettings}
                style={{ background: "#E7E7E780", color: "#292929" }}
              >
                <span>Back</span>
              </div>
              <div
                onClick={(e) => {
                  if (selectedApp.appName === "Author") {
                    getAuthorDetails(newBankerData?.hardCoded[0]?.data?.email);
                  } else {
                    setBankerEmail(newBankerData?.hardCoded[0]?.data?.email);
                    setStep(null);
                  }
                }}
                // onClick={(e) => handleSetBankerEmail()}
                className={classNames.btnSettings}
                style={{
                  background: selectedApp.appColor,
                  borderLeft: "1px solid gray",
                }}
              >
                <span>Next</span>
              </div>
            </div>
          </>
        );

      case "Invalid":
        return (
          <>
            <div
              className="modalStyle"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "25px",
                fontWeight: 700,
                textAlign: "center",
                marginLeft: "30px",
                marginRight: "30px",
              }}
            >
              The Pin You Entered Is Invalid
            </div>
            <div className={classNames.footerBtns} style={{ display: "flex" }}>
              <div
                onClick={(e) => onClose()}
                className={classNames.btnSettings}
                style={{ background: "white", color: "#292929" }}
              >
                <span>Close</span>
              </div>
              <div
                onClick={(e) => setStep("Admin")}
                className={classNames.btnSettings}
                style={{
                  background: selectedApp.appColor,
                  borderLeft: "1px solid gray",
                }}
              >
                <span>Back</span>
              </div>
            </div>
          </>
        );
      case "InvalidJwt":
        return (
          <>
            <div
              className="modalStyle"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "25px",
                fontWeight: 700,
                textAlign: "center",
              }}
            >
              Token Has Expired.
              <br />
              Please Relogin.
            </div>
            <div className={classNames.footerBtns} style={{ display: "flex" }}>
              <div
                onClick={(e) => onClose()}
                className={classNames.btnSettings}
                style={{ background: "white", color: "#292929" }}
              >
                <span>Close</span>
              </div>
              <div
                onClick={(e) => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className={classNames.btnSettings}
                style={{
                  background: selectedApp.appColor,
                  borderLeft: "1px solid gray",
                }}
              >
                <span>Sign-Out</span>
              </div>
            </div>
          </>
        );

      case "ChangeBrands":
        return (
          <>
            <div className="modalStyle">
              <div className="headerSection">Settings</div>
              <div className="breadcrumb">
                <span onClick={(e) => setStep(null)}>Settings</span>
                &nbsp;
                {"> "}
                <span style={{ textDecoration: "underline", fontWeight: 700 }}>
                  Change Publication
                </span>
              </div>
              <div
                style={{
                  color: "#182542",
                  marginTop: "-15px",
                  fontSize: "15px",
                  fontWeight: "bolder",
                  paddingBottom: "20px",
                }}
              >
                Select One Of Your Publication
              </div>
              <div style={{ height: "310px", borderRadius: "10px" }}>
                <div>
                  <input
                    className="changeapp-search"
                    placeholder="Search Publications..."
                    style={{
                      height: "55px",
                      paddingLeft: "30px",
                      width: "100%",
                      borderRadius: "10px",
                      fontSize: "20px",
                    }}
                    onChange={(e) => {
                      setSearch(e.target.value);
                    }}
                  />
                </div>

                <div
                  style={{
                    width: "100%",
                    marginTop: "5px",
                    height: "250px",
                    borderRadius: "10px",
                    overflowY: "scroll",
                    paddingBottom: "5vh",
                  }}
                >
                  {selectedApp?.appName === "Authors"
                    ? allPublications
                        .filter((el) =>
                          el.PublicationDetails[0]?.PublicationDetail[0]?.name
                            .toLowerCase()
                            .includes(search.toLowerCase())
                        )
                        .map((item) => {
                          return (
                            <div
                              onClick={(e) => {
                                setSelectedPublication(item?.PublicationDetails[0].PublicationDetail[0]);
                                localStorage.setItem(
                                  "selectedPublication",
                                  JSON.stringify(item)
                                );
                                setStep(null);
                              }}
                              className="changeapp-data"
                              style={{
                                width: "100%",
                                height: "80px",
                                borderRadius: "10px",
                                border: "0.5px solid #e7e7e7",
                                borderWidth: "0px 1px 0px 1px",
                                display: "flex",
                                marginTop: "15px",
                                cursor: "pointer",
                              }}
                              // onClick={handleBrandEvent}
                              key={item.PublicationDetails[0].PublicationDetail[0]?._id}
                            >
                              <div style={{ width: "20%" }} key={item.PublicationDetails[0]._id}>
                                <img
                                  style={{
                                    borderRadius: "50%",
                                    width: "70%",
                                    height: "80%",
                                    marginLeft: "10px",
                                    marginTop: "10px",
                                  }}
                                  src={item.PublicationDetails[0].PublicationDetail[0]?.profile_pic}
                                  alt="imgg"
                                />
                              </div>
                              <div style={{ width: "60%" }} key={item._id}>
                                <h4
                                  style={{
                                    color: "#182542",
                                    paddingTop: "15px",
                                    fontWeight: "bolder",
                                    paddingLeft: "10px",
                                  }}
                                >
                                  {item.PublicationDetails[0].PublicationDetail[0]?.name}
                                </h4>
                                <p
                                  style={{
                                    color: "#182542",
                                    paddingLeft: "10px",
                                    lineHeight: "5px",
                                    fontSize: "small",
                                  }}
                                >
                                  {item?.PublicationDetails[0]?._id}
                                </p>
                              </div>
                              {/* <div style={{ width: "20%" }}>
                            <p
                              style={{
                                color: "#182542",
                                paddingTop: "30px",
                                fontWeight: "bolder",
                                paddingLeft: "10px",
                              }}
                              key={item?._id}
                            >
                              {item?.app_data?.length}
                              <span> Apps</span>
                            </p>
                          </div> */}
                            </div>
                          );
                        })
                    : allPublications
                        .filter((el) =>
                          el?.name.toLowerCase().includes(search.toLowerCase())
                        )
                        .map((item) => {
                          console.log(item, "item")
                          return (
                            <div
                              onClick={(e) => {
                                setSelectedPublication(item);
                                localStorage.setItem(
                                  "selectedPublication",
                                  JSON.stringify(item)
                                );
                                setStep(null);
                              }}
                              className="changeapp-data"
                              style={{
                                width: "100%",
                                height: "80px",
                                borderRadius: "10px",
                                border: "0.5px solid #e7e7e7",
                                borderWidth: "0px 1px 0px 1px",
                                display: "flex",
                                marginTop: "15px",
                                cursor: "pointer",
                              }}
                              // onClick={handleBrandEvent}
                              key={item._id}
                            >
                              <div style={{ width: "20%" }}>
                                <img
                                  style={{
                                    borderRadius: "50%",
                                    width: "70%",
                                    height: "80%",
                                    marginLeft: "10px",
                                    marginTop: "10px",
                                  }}
                                  src={item?.profile_pic}
                                  alt="imgg"
                                />
                              </div>
                              <div style={{ width: "60%" }}>
                                <h4
                                  style={{
                                    color: "#182542",
                                    paddingTop: "15px",
                                    fontWeight: "bolder",
                                    paddingLeft: "10px",
                                  }}
                                >
                                  {item?.name}
                                </h4>
                                <p
                                  style={{
                                    color: "#182542",
                                    paddingLeft: "10px",
                                    lineHeight: "5px",
                                    fontSize: "small",
                                  }}
                                >
                                  {item?._id}
                                </p>
                              </div>
                              {/* <div style={{ width: "20%" }}>
                        <p
                          style={{
                            color: "#182542",
                            paddingTop: "30px",
                            fontWeight: "bolder",
                            paddingLeft: "10px",
                          }}
                          key={item?._id}
                        >
                          {item?.app_data?.length}
                          <span> Apps</span>
                        </p>
                      </div> */}
                            </div>
                          );
                        })}
                </div>
              </div>
            </div>

            <br />

            <div
              className={classNames.footerBtns}
              style={{ display: "flex", marginTop: "-100px" }}
            >
              <div
                onClick={(e) => setStep("")}
                className={classNames.btnSettings}
                style={{ backgroundColor: "#f3f3f3", color: "#292929" }}
              >
                <span>Back</span>
              </div>
              <div
                // onClick={(e) => checkPinValidity()}
                className={classNames.btnSettings}
                style={{
                  background: selectedApp.appColor,
                  borderLeft: "1px solid gray",
                }}
              >
                <span style={{ opacity: "0.5" }}>Next</span>
              </div>
            </div>
          </>
        );

      default:
        return (
          <>
            <div className="modalStyle">
              <div className="headerSection" style={{ marginTop: "-15px" }}>
                Settings
              </div>
              <div className="breadcrumb">
                <span style={{ textDecoration: "underline", fontWeight: 700 }}>
                  Settings
                </span>
                &nbsp;
                {">"}
              </div>
              <div className="titleSection">What Do You Want To Change?</div>

              <div style={{ overflowY: "scroll", height: "250px" }}>
                <div onClick={(e) => setStep("Admin")} className="menuCards1">
                  <div>
                    <div style={{ fontSize: "16px", fontWeight: 700 }}>
                      Logged in User
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ fontSize: "12px", fontWeight: 400 }}>
                        Currently Selected:&nbsp;
                      </div>
                      <>
                        <div>
                          {localStorage.getItem("newBankerData") ? (
                            <img
                              src={
                                JSON.parse(
                                  localStorage.getItem("newBankerData")
                                ).dynamic[0]?.data?.profile_img
                              }
                              alt=""
                              style={{
                                width: "17px",
                                height: "17px",
                                borderRadius: "100%",
                              }}
                            />
                          ) : loginData?.user?.profile_img ? (
                            <img
                              src={loginData?.user?.profile_img}
                              alt=""
                              style={{
                                width: "17px",
                                height: "17px",
                                borderRadius: "100%",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                height: "17px",
                                width: "17px",
                                borderRadius: "100%",
                              }}
                            >
                              &nbsp;
                            </div>
                          )}
                        </div>
                        <div style={{ fontSize: "12px", fontWeight: 700 }}>
                          &nbsp;{bankerEmail}
                        </div>
                      </>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setStep("ChangeBrands")}
                  className="menuCards"
                  style={{
                    marginTop: "30px",
                    // border:"1px solid red"
                  }}
                >
                  <div>
                    <div style={{ fontSize: "16px", fontWeight: 700 }}>
                      Publication
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <div style={{ fontSize: "12px", fontWeight: 400 }}>
                        Currently Selected:&nbsp;
                      </div>
                      {selectedPublication ? (
                        <>
                          <div
                            style={{
                              height: "17px",
                              width: "17px",
                              borderRadius: "100%",
                            }}
                          >
                            <img
                              src={
                                // selectedsingleBrands && selectedsingleBrands.brand_logo
                                selectedPublication?.profile_pic
                              }
                              alt=""
                              style={{
                                width: "17px",
                                height: "17px",
                                borderRadius: "100%",
                                marginTop: "-10px",
                              }}
                            />
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              fontWeight: 700,
                              marginLeft: "5px",
                            }}
                          >
                            {
                              // selectedsingleBrands && selectedsingleBrands.brand_name
                              selectedPublication?.name
                            }
                          </div>
                        </>
                      ) : (
                        ""
                        // <div
                        //   style={{
                        //     display: "flex",
                        //     flexDirection: "row",
                        //     alignItems: "center",
                        //   }}
                        // >
                        //   <Skeleton
                        //     className="dp"
                        //     circle
                        //     width={17}
                        //     height={17}
                        //     style={{ marginRight: "10px" }}
                        //   />

                        //   <Skeleton width={100} />
                        // </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <img src={arrowGo} alt="" width="20px" />
                  </div>
                </div>

                {/* <div
                  onClick={() => setStep("ChangeBrands")}
                  className="menuCards"
                  style={{
                    marginTop: "30px",
                    // border:"1px solid red"
                  }}
                >
                  <div>
                    <div style={{ fontSize: "16px", fontWeight: 700 }}>
                      Selected Brands
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <div style={{ fontSize: "12px", fontWeight: 400 }}>
                        Currently Selected:&nbsp;
                      </div>
                      {!mcbAdminLoading ? (
                        <>
                          <div
                            style={{
                              height: "17px",
                              width: "17px",
                              borderRadius: "100%",
                            }}
                          >
                            <img
                              src={
                                // selectedsingleBrands && selectedsingleBrands.brand_logo
                                selectedBrand?.brand_logo
                              }
                              alt=""
                              style={{
                                width: "17px",
                                height: "17px",
                                borderRadius: "100%",
                                marginTop: "-10px",
                              }}
                            />
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              fontWeight: 700,
                              marginLeft: "5px",
                            }}
                          >
                            {
                              // selectedsingleBrands && selectedsingleBrands.brand_name
                              selectedBrand?.brand_name
                            }
                          </div>
                        </>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >
                          <Skeleton
                            className="dp"
                            circle
                            width={17}
                            height={17}
                            style={{ marginRight: "10px" }}
                          />

                          <Skeleton width={100} />
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <img src={arrowGo} alt="" width="20px" />
                  </div>
                </div>

                <div
                  onClick={(e) => setStep("ChangeApp")}
                  className="menuCards"
                  style={{ marginTop: "30px" }}
                >
                  <div>
                    <div style={{ fontSize: "16px", fontWeight: 700 }}>
                      Selected Application
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <div style={{ fontSize: "12px", fontWeight: 400 }}>
                        Currently Selected:&nbsp;
                      </div>
                      {!mcbAdminLoading ? (
                        <>
                          <div
                            style={{
                              height: "17px",
                              width: "17px",
                              borderRadius: "100%",
                            }}
                          >
                            <img
                              src={
                                // selectedsingleApplication && selectedsingleApplication.app_icon
                                selectedBrandApp?.app_icon
                                // localStorage.getItem("selectedsingleapplication") ? JSON.parse(localStorage.getItem("selectedsingleapplication")).app_icon : null
                              }
                              alt=""
                              style={{
                                width: "17px",
                                height: "17px",
                                borderRadius: "100%",
                                marginTop: "-10px",
                              }}
                            />
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              fontWeight: 700,
                              marginLeft: "5px",
                            }}
                          >
                            {
                              // selectedsingleApplication && selectedsingleApplication.app_name
                              selectedBrandApp?.app_name
                              //  localStorage.getItem("selectedsingleapplication") ? JSON.parse(localStorage.getItem("selectedsingleapplication")).app_name : null
                            }
                          </div>
                        </>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >
                          <Skeleton
                            className="dp"
                            circle
                            width={17}
                            height={17}
                            style={{ marginRight: "10px" }}
                          />

                          <Skeleton width={100} />
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <img src={arrowGo} alt="" width="20px" />
                  </div>
                </div> */}
              </div>
            </div>
            <div
              className={classNames.footerBtns}
              style={{ display: "flex", marginTop: "-50px" }}
            >
              <div
                onClick={(e) => onClose()}
                className={classNames.btnSettings}
                style={{ background: "#E7E7E780", color: "#292929" }}
              >
                <span>Close</span>
              </div>
              <div
                className={classNames.btnSettings}
                style={{
                  background: selectedApp.appColor,
                  borderLeft: "1px solid gray",
                }}
              >
                <span style={{ opacity: 0.4 }}>Next</span>
              </div>
            </div>
          </>
        );
    }
  }, [
    loginData.user.email,
    logoParam,
    onClose,
    onSuccess,
    pin,
    step,
    bankerEmail,
    search,
    setSearch,
    allBrands,
    selectedBrand,
    allAppsForBrand,
    selectedBrandApp,
    // selectedApplication,
    // setSelectedApplication,
    // selectedsingleApplication,
    // setSelectedsingleApplication,
    // selectedBrands,
    // setSelectedBrands,
    // selectedsingleBrands,
    // setSelectedsingleApplication,
    // operatorId,
    // setOperatorId,
  ]);

  return (
    <>
      <div className={classNames.settingsModal}>
        <div
          className={classNames.overlayClose}
          onClick={() => {
            try {
              onClose();
            } catch (error) {}
          }}
        />
        <div className={classNames.settingsCard}>{stepRender}</div>
      </div>
    </>
  );
}

export default AdminModal;
