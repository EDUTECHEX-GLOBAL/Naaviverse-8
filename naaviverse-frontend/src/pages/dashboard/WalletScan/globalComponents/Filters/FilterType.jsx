import React, { useContext, useEffect, useMemo, useState } from "react";
import OtpInput from "react-otp-input";
import classNames from "./settingsModal.module.scss";
// import "antd/dist/antd.css";
import "./new.scss";
import { toast } from "react-toastify";

import userIcon from "../../assets/images/icons/user.svg";
import affilIcon from "../../assets/images/icons/affiliate.svg";
import bondIcon from "../../assets/images/icons/bondIcon.svg";
import appIcon from "../../assets/images/icons/app.svg";
import calendar from "../../assets/images/icons/calendar.svg";
import { GlobalContex } from "../../globalContext";
import { useLocation } from "react-router-dom";

import { DatePicker, Space } from "antd";

const dateFormat = "MM/DD/YYYY";

function FilterType({
  onClose = () => {},
  onSuccess = () => {},
  logoParam,
  allCoins,
  selectedCoin,
  setSelectedCoin,
  filter1,
  setFilter1,
  openCoinFilter,
  setOpenCoinFilter,
  selectedFilter1,
  setSelectedFilter1,
  tabSelected,
  setSelectedFilter21,
  selectedFilter21,
}) {
  const { RangePicker } = DatePicker;
  const { pathname } = useLocation();
  // const { email } = useSelector(selectLoginData);
  const {
    loginData,
    selectedApp,
    setBankerEmail,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
  } = useContext(GlobalContex);
  const [step, setStep] = useState("");
  const [pin, setPin] = useState("");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState([]);

  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    console.log(tabSelected, "kwbdkjwed");
    switch (tabSelected) {
      case "Earnings Per Customer":
        setFilters([
          {
            name: "User",
            icon: userIcon,
          },
          {
            name: "Date",
            icon: calendar,
          },
        ]);
        break;
      default:
        setFilters([
          {
            name: "User",
            icon: userIcon,
          },
          {
            name: "Affiliate",
            icon: affilIcon,
          },
          {
            name: "Bond Offering",
            icon: bondIcon,
          },
          {
            name: "Bond Contract",
            icon: bondIcon,
          },
          {
            name: "Bond",
            icon: bondIcon,
          },
          {
            name: "App",
            icon: appIcon,
          },
        ]);
        break;
    }
  }, []);

  let filteredCoins = allCoins
    ? allCoins.filter((item) => {
        const lowquery = query.toLowerCase();
        return (
          (item.coinName + item.coinSymbol).toLowerCase().indexOf(lowquery) >= 0
        );
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

  const handleDates = (date, dateString) => {
    console.log(date, dateString, "kjbkbdkwed");
    setStartDate(dateString[0]);
    setEndDate(dateString[1]);
  };

  return (
    <>
      <div className={classNames.settingsModal}>
        <div
          className={classNames.overlayClose}
          onClick={() => {
            try {
              onClose();
              setShowCalendar(false);
              if (!startDate || !endDate) {
                setSelectedFilter1(null);
              }
            } catch (error) {}
          }}
        />
        <div className={classNames.settingsCard}>
          <div className={classNames.inCard}>
            {/* <img
              src={logoParam || selectedApp.appFullLogo}
              alt=""
              className={classNames.logo}
            /> */}
            <div
              className={classNames.title}
              style={{
                fontSize: "30px",
                fontWeight: 800,
                color: "#18191D",
                textAlign: "center",
                padding: "30px 20%",
              }}
            >
              Filter By {showCalendar ? "Date" : "Type"}
            </div>
            {/* <div
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
            </div> */}
            {!showCalendar ? (
              <>
                <div style={{ padding: "0px 60px" }}>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: "700",
                      color: "#18191D",
                      paddingBottom: "25px",
                    }}
                  >
                    Which Filter Type Do You Want To Use?
                  </div>
                </div>

                <div
                  style={{
                    padding: "0px 59px",
                    overflowY: "scroll",
                    height: "270px",
                  }}
                >
                  {filters.map((item) => {
                    return (
                      <div
                        className="coin-card"
                        onClick={(e) => {
                          setSelectedFilter1(item);
                          // setSelectedCoin(item);
                          if (item.name !== "Date") {
                            setFilter1(false);
                          } else {
                            setShowCalendar(true);
                          }
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <div>
                            <img src={item.icon} alt="" width={30} />
                          </div>
                          <div style={{ padding: "15px" }}>
                            <div>By {item.name}</div>
                            {item.name === "Date" ? (
                              <div
                                style={{
                                  fontWeight: 400,
                                  fontSize: "14px",
                                  paddingTop: "1px",
                                }}
                              >
                                {startDate && endDate
                                  ? "Range Selected: " +
                                    startDate +
                                    " - " +
                                    endDate
                                  : ""}
                              </div>
                            ) : (
                              ""
                            )}
                            {item.name === "User" ? (
                              <div
                                style={{
                                  fontWeight: 400,
                                  fontSize: "14px",
                                  paddingTop: "1px",
                                }}
                              >
                                {selectedFilter21
                                  ? "Selected User: " + selectedFilter21.name
                                  : ""}
                              </div>
                            ) : (
                              ""
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div
                // className="antdOverrideDate"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: "10vh",
                }}
              >
                <RangePicker
                  allowClear
                  format={dateFormat}
                  onChange={handleDates}
                  size="large"
                  // bordered={false}
                  placement="bottomLeft"
                />
              </div>
            )}
          </div>
          {!showCalendar ? (
            <div className={classNames.footerBtns}>
              <div
                className={classNames.btnSettings}
                style={{ background: selectedApp.appColor }}
                onClick={() => {
                  // setSelectedCoin(null);
                  setFilter1(false);
                  setSelectedFilter1(null);
                  setShowCalendar(false);
                  setStartDate(null);
                  setEndDate(null);
                }}
              >
                <span>Clear Filter</span>
              </div>
            </div>
          ) : (
            <div className={classNames.footerBtns}>
              <div
                className={classNames.btnSettings}
                style={{ background: selectedApp.appColor }}
                onClick={() => {
                  // setSelectedCoin(null);

                  setFilter1(false);
                  setShowCalendar(false);
                }}
              >
                <span>Apply Filter</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default FilterType;
