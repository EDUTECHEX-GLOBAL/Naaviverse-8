import React, { useContext, useEffect, useMemo, useState } from "react";
import OtpInput from "react-otp-input";
import classNames from "./settingsModal.module.scss";

import { toast } from "react-toastify";

import userIcon from "../../static/images/icons/user.svg";
import affilIcon from "../../static/images/icons/affiliate.svg";
import bondIcon from "../../static/images/icons/bondIcon.svg";
import appIcon from "../../static/images/icons/app.svg";
import emailIcon from "../../static/images/icons/home_logo_3.svg";
import axios from "axios";

import defaultImage from "../../static/images/icons/app_placeholder.png";
import { GlobalContex } from "../../globalContext";

function UserFilter({
  onClose = () => {},
  onSuccess = () => {},
  logoParam,
  setFilter2,
  selectedFilter2,
  setSelectedFilter2,
  setSelectedFilter21,
  setRefetchApi,
  refetchApi,
  query,
  setQuery,
  tabSelected,
}) {
  // const { email } = useSelector(selectLoginData);
  // const { bankerEmail } = useSelector(selectLoginData);
  const { loginData, bankerEmail, selectedApp } = useContext(GlobalContex);
  // const { bankerEmail } = useContext(BankerContext);
  const [step, setStep] = useState("");
  const [pin, setPin] = useState("");
  const [allBondHolders, setAllBondHolders] = useState([]);

  const filters = [
    {
      name: "Enter Email",
      icon: emailIcon,
    },
    {
      name: "See All Bond Holders",
      icon: bondIcon,
    },
  ];

  let filteredBondHolders = allBondHolders
    ? allBondHolders.filter((item) => {
        const lowquery = query.toLowerCase();
        return (item.name + item.email).toLowerCase().indexOf(lowquery) >= 0;
      })
    : "";

  useEffect(() => {
    if (pin === "9605") {
      setStep("AdminBankers");
    } else if (pin.length === 4) {
      toast.error("Invalid Pin");
      setPin("");
    }
  }, [pin]);

  useEffect(() => {
    console.log(tabSelected, "jhgjh");
    switch (tabSelected) {
      case "Earnings Per Customers":
        axios
          .get(
            `https://comms.globalxchange.io/coin/iced/banker/earned/spread/per/customer/get?banker_email=${bankerEmail}`
          )
          .then((res) => {
            setAllBondHolders(res.data.users);
          });
        break;

      default:
        axios
          .get(
            `https://comms.globalxchange.io/coin/iced/banker/custom/bond/users/data/get?email=${bankerEmail}`
          )
          .then((res) => {
            setAllBondHolders(res.data.users);
          });
        break;
    }
  }, []);

  const stepRender = useMemo(() => {
    switch (step) {
      case "email":
        return (
          <>
            <div className={classNames.inCard}>
              <div
                className={classNames.title}
                style={{
                  fontSize: "30px",
                  fontWeight: 800,
                  color: "#18191D",
                  textAlign: "center",
                  padding: "30px 20% !important",
                }}
              >
                Filter By User
              </div>
              <div
                style={{
                  // background: "#E7E7E7",
                  height: "40px",
                  marginTop: "-20px",
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: "50px",
                  color: "#18191D",
                }}
              >
                <span
                  style={{ cursor: "pointer" }}
                  onClick={(e) => {
                    setStep("");
                  }}
                >
                  Users
                </span>
                &nbsp;{">"}
                &nbsp;
                <span
                  style={{ fontWeight: "bold", textDecoration: "underline" }}
                >
                  Enter Email
                </span>
              </div>

              <div style={{ padding: "15px 50px" }}>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#18191D",
                    padding: "40px 0px",
                  }}
                >
                  How Do You Want To Select User?
                </div>
              </div>

              <div
                style={{
                  padding: "0px 40px",
                  overflowY: "scroll",
                  height: "180px",
                }}
              >
                <input
                  value={selectedFilter2}
                  onChange={(e) => setSelectedFilter2(e.target.value)}
                  type="text"
                  placeholder="Enter Email..."
                  style={{
                    border: "0.5px solid #E5E5E5",
                    borderRadius: "15px",
                    height: "86px",
                    width: "100%",
                    padding: "0px 30px",
                    fontSize: "18px",
                    fontWeight: "700",
                  }}
                />
              </div>
            </div>
            <div className={classNames.footerBtns}>
              <div
                className={classNames.btnSettings}
                onClick={() => {
                  setRefetchApi(true);
                  setFilter2(false);
                }}
                
              >
                <span>Create Filter</span>
              </div>
            </div>
          </>
        );
      case "bondHolder":
        return (
          <>
            <div className={classNames.inCard}>
              <div
                className={classNames.title}
                style={{
                  fontSize: "30px",
                  fontWeight: 800,
                  color: "#18191D",
                  textAlign: "center",
                  padding: "30px 20% !important",
                }}
              >
                Filter By User
              </div>
              <div
                style={{
                  // background: "#E7E7E7",
                  height: "40px",
                  marginTop: "-20px",
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: "50px",
                  color: "#18191D",
                }}
              >
                <span
                  style={{ cursor: "pointer" }}
                  onClick={(e) => {
                    setStep("");
                  }}
                >
                  Users
                </span>
                &nbsp;{">"}
                &nbsp;
                <span
                  style={{ fontWeight: "bold", textDecoration: "underline" }}
                >
                  Select User
                </span>
              </div>

              <div
                style={{
                  padding: "0px 40px",
                  paddingTop: "30px",
                }}
              >
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  type="text"
                  placeholder="Enter Name or Email..."
                  style={{
                    border: "0.5px solid #E5E5E5",
                    borderRadius: "15px",
                    height: "62px",
                    width: "100%",
                    padding: "0px 30px",
                    fontSize: "16px",
                    fontWeight: "700",
                  }}
                />
              </div>
              <div
                style={{
                  padding: "0px 40px",
                  overflowY: "scroll",
                  height: "180px",
                  paddingTop: "30px",
                }}
              >
                <>
                  {/* {selectedFilter2 ? (
                    <div
                      className="coin-card-selected"
                      style={{
                        height: "90px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                      onClick={(e) => {
                        setSelectedFilter2(null);
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <img
                          src={
                            selectedFilter2?.profile_img
                              ? selectedFilter2?.profile_img
                              : defaultImage
                          }
                          alt=""
                          width={40}
                          style={{ borderRadius: "50%" }}
                        />
                        <div style={{ paddingLeft: "20px" }}>
                          <div>{selectedFilter2?.name}</div>
                          <div style={{ fontWeight: 400, fontSize: "10px" }}>
                            {selectedFilter2?.email}
                          </div>
                        </div>
                      </div>
                      <div>
                        <div>
                          {selectedFilter2?.total_bondTxnsCount} Contacts
                        </div>
                        <div style={{ fontWeight: 400, fontSize: "10px" }}>
                          {selectedFilter2?.total_bondsCount} Bonds
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )} */}
                  {filteredBondHolders
                    // .filter((o) => o.email !== selectedFilter2.email)
                    .map((item, index) => {
                      return (
                        <div
                          className={
                            selectedFilter2 === item.email
                              ? "coin-card-selected"
                              : "coin-card"
                          }
                          style={{
                            height: "90px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                          onClick={(e) => {
                            setSelectedFilter2(item.email);
                            setSelectedFilter21(item);
                          }}
                        >
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <img
                              src={
                                item.profile_img
                                  ? item.profile_img
                                  : defaultImage
                              }
                              alt=""
                              width={40}
                              style={{ borderRadius: "50%" }}
                            />
                            <div style={{ paddingLeft: "20px" }}>
                              <div>{item.name}</div>
                              <div
                                style={{ fontWeight: 400, fontSize: "10px" }}
                              >
                                {item.email}
                              </div>
                            </div>
                          </div>
                          <div>
                            <div>{item.total_bondTxnsCount} Contacts</div>
                            <div style={{ fontWeight: 400, fontSize: "10px" }}>
                              {item.total_bondsCount} Bonds
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </>
              </div>
            </div>
            <div className={classNames.footerBtns}>
              <div
                style={{ background: selectedApp.appColor }}
                className={classNames.btnSettings}
                onClick={() => {
                  setRefetchApi(true);
                  setFilter2(false);
                }}
              >
                <span>Create Filter</span>
              </div>
            </div>
          </>
        );
      default:
        return (
          <>
            <div 
              className={classNames.inCard}
              style={{
                // border:"1px solid red"
              }}
            >
              {/* <img
                src={logoParam || FULL_LOGO}
                alt=""
                
              /> */}
              <div
                className={classNames.title}
                style={{
                  fontSize: "30px",
                  fontWeight: 800,
                  color: "#18191D",
                  textAlign: "center",
                  padding: "30px 20% !important",
                  
                }}
              >
                Filter By User
              </div>
              <div
                style={{
                  // background: "#E7E7E7",
                  height: "40px",
                  marginTop: "-20px",
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: "50px",
                  color: "#18191D",
                  fontWeight: "bold",
                  fontSize: "13px",
                }}
              >
                <span style={{ textDecoration: "underline" }}>Users</span>&nbsp;
                {">"}
              </div>
              <div style={{ padding: "0px 50px" }}>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#18191D",
                    padding: "40px 0px",
                  }}
                >
                  How Do You Want To Select User?
                </div>
              </div>

              <div
                style={{
                  padding: "0px 50px",
                  overflowY: "scroll",
                  height: "180px",
                }}
              >
                {filters.map((item, index) => {
                  return (
                    <div
                      className="coin-card"
                      style={{ height: "90px" }}
                      onClick={(e) => {
                        if (index == 0) {
                          setStep("email");
                        } else if (index == 1) {
                          setStep("bondHolder");
                        }
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <img src={item.icon} alt="" width={30} />
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{item.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className={classNames.footerBtns}>
              <div
                className={classNames.btnSettings}
                style={{ 
                  background: selectedApp.appColor ,
                  // border:"1px solid red",
                  // height:"200px"
                }}
                onClick={() => {
                  setFilter2(false);
                  setSelectedFilter2(null);
                  setSelectedFilter21(null);
                  setRefetchApi(!refetchApi);
                }}
              >
                <span>Clear Filter</span>
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
    tabSelected,
  ]);

  return (
    <>
      <div className={classNames.settingsModal}>
        <div
          className={classNames.overlayClose}
          onClick={() => {
            try {
              onClose();
              setSelectedFilter2(null);
            } catch (error) {}
          }}
        />
        <div className={classNames.settingsCard}>{stepRender}</div>
      </div>
    </>
  );
}

export default UserFilter;
