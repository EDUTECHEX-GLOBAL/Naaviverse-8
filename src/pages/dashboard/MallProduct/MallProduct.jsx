import React from "react";
import { useEffect, useState } from "react";
import "./malls.scss";
import { useNavigate } from "react-router-dom";
import CoinComponent from "./CoinComponent";
import Step4 from "./Step4";
import { useStore } from "../../../components/store/store.ts";
import Dashsidebar from "../../../components/dashsidebar/dashsidebar";
import searchic from "../../../static/images/dashboard/searchic.svg";
import downarrow from "../../../static/images/dashboard/downarrow.svg";
import profile from "../../../static/images/dashboard/profile.svg";
import sidearrow from "../../../static/images/dashboard/sidearrow.svg";
import logout from "../../../static/images/dashboard/logout.svg";
import settings from "../../../static/images/dashboard/settings.svg";
import support from "../../../static/images/dashboard/support.svg";
import accounts from "../../../static/images/dashboard/accounts.svg";
import vaults from "../../../static/images/dashboard/vaults.svg";
import profilea from "../../../static/images/dashboard/profilea.svg";

const MallProduct = () => {
  let navigate = useNavigate();
  const { index, setIndex, buy, setBuy, mallCoindata, setfilteredcoins } =
    useStore();
  const [showDrop, setShowDrop] = useState(false);
  const [searchservice, setSearchservice] = useState("");

  useEffect(() => {
    let product = localStorage.getItem("product");
    setIndex(JSON.parse(product));
    // console.log(JSON.parse(product), "product details");
  }, []);

  function filterItem(text) {
    let filterItem = mallCoindata?.filter((eachitem) => {
      return eachitem?.coinSymbol?.toLowerCase()?.includes(text?.toLowerCase());
    });
    setfilteredcoins(filterItem);
  }

  const handleLogout = () => {
    setBuy("step1");
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="dashboard-main">
      <div className="dashboard-body">
        <div onClick={() => setShowDrop(false)}>
          <Dashsidebar isNotOnMainPage={true} />
        </div>
        <div className="dashboard-screens" style={{ height: "100%" }}>
          <div style={{ height: "100%" }}>
            <div className="dash-nav">
              <div
                className="search-input-box"
                onClick={() => setShowDrop(false)}
              >
                <input
                  className="search-input"
                  type="text"
                  placeholder="Search For Services..."
                  value={searchservice}
                  onChange={(e) => setSearchservice(e.target.value)}
                />
              </div>
              <div className="search-box" onClick={() => setShowDrop(false)}>
                <img className="search-icon" src={searchic} alt="" />
              </div>
              <div className="full-user" onClick={() => setShowDrop(!showDrop)}>
                <div className="user-box">
                  <img
                    className="user-icon"
                    src={
                      JSON.parse(localStorage.getItem("user"))?.user
                        ?.profile_img !== undefined
                        ? JSON.parse(localStorage.getItem("user"))?.user
                            ?.profile_img
                        : profile
                    }
                    alt=""
                  />
                </div>
                <div
                  className="arrow-box"
                  style={{
                    transform: showDrop ? "rotate(180deg)" : "",
                    cursor: "pointer",
                  }}
                >
                  <img className="arrow-icon" src={downarrow} alt="" />
                </div>
              </div>
            </div>
            <div
              className="service-container"
              onClick={() => setShowDrop(false)}
              style={{ height: "calc(100% - 70px)" }}
            >
              <div className="malls">
                <div className="malls-products">
                  <div className="content-area">
                    <div className="left-divv">
                      <div className="productt-det">
                        <img
                          src={index?.product?.product_icon}
                          alt=""
                          style={{ width: "20%", height: "100%" }}
                        />
                        <div className="pro-name">
                          <p
                            style={{
                              fontSize: "40px",
                              fontWeight: "600",
                              color: "#1F304F",
                              marginTop: "0",
                            }}
                          >
                            {index?.product?.product_name}
                          </p>
                          <p
                            style={{
                              color: "#1F304F",
                              display: " -webkit-box",
                              webkitLineClamp: "2",
                              webkitBoxOrient: "vertical",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {index?.product?.sub_text}
                          </p>
                        </div>
                      </div>

                      <div className="price-section">
                        <div className="about-section">
                          <p
                            style={{
                              fontSize: "25px",
                              fontWeight: "600",
                              color: "#1F304F",
                            }}
                          >
                            About {index?.product?.product_name}
                          </p>
                          <div>{index?.product?.full_description}</div>
                        </div>
                        <div className="price-divv">
                          <p
                            style={{
                              fontSize: "25px",
                              fontWeight: "600",
                              color: "#1F304F",
                            }}
                          >
                            Pricing Details
                          </p>
                          <div className="pricing">
                            <div className="billing-txt">Billing Type:</div>
                            <div className="pricing-btns">
                              <button
                                style={{
                                  background: index?.product?.lifetime
                                    ? "rgba(229, 229, 229, 0.37)"
                                    : "#FFFFFF",
                                  border: "0.5px solid #e5e5e5",
                                }}
                                className="onetym-btn"
                              >
                                One Time
                              </button>
                              <button
                                style={{
                                  background: index?.product?.lifetime
                                    ? "#FFFFFF"
                                    : "rgba(229, 229, 229, 0.37)",
                                  border: "0.5px solid #e5e5e5",
                                }}
                                className="onetym-btn"
                              >
                                Recurring
                              </button>
                            </div>
                          </div>
                          <div className="pricing">
                            <div className="billing-txt">Frequency:</div>
                            <div className="pricing-btns">
                              <button
                                style={{
                                  background: index?.product?.monthly
                                    ? "rgba(229, 229, 229, 0.37)"
                                    : "#FFFFFF",
                                  border: "0.5px solid #e5e5e5",
                                }}
                                className="onetym-btn"
                              >
                                Monthly
                              </button>
                              <button
                                style={{
                                  background: index?.product?.monthly
                                    ? "#FFFFFF"
                                    : "rgba(229, 229, 229, 0.37)",
                                  border: "0.5px solid #e5e5e5",
                                }}
                                className="onetym-btn"
                              >
                                Anually
                              </button>
                            </div>
                          </div>
                          <div className="pricing">
                            <div className="billing-txt">Staking:</div>
                            <div className="pricing-btns">
                              <button
                                style={{
                                  background: index?.product?.staking_allowed
                                    ? "rgba(229, 229, 229, 0.37)"
                                    : "#FFFFFF",
                                  border: "0.5px solid #e5e5e5",
                                }}
                                className="onetym-btn"
                              >
                                Allowed
                              </button>
                              <button
                                style={{
                                  background: index?.product?.staking_allowed
                                    ? "#FFFFFF"
                                    : "rgba(229, 229, 229, 0.37)",
                                  border: "0.5px solid #e5e5e5",
                                }}
                                className="onetym-btn"
                              >
                                Not Allowed
                              </button>
                            </div>
                          </div>
                        </div>
                        <div
                          className="price-divv"
                          style={{
                            paddingTop: "2rem",
                            height: "23rem",
                            borderBottom: "none",
                          }}
                        >
                          <p
                            style={{
                              fontSize: "1.5rem",
                              fontWeight: "700",
                              color: "#1F304F",
                            }}
                          >
                            Other Data
                          </p>
                          <div className="pricing">
                            <div className="billing-txt">Affiliate Points:</div>
                            <div className="pricing-btns">
                              <button
                                style={{
                                  background: index?.product?.points_creation
                                    ? "rgba(229, 229, 229, 0.37)"
                                    : "#FFFFFF",
                                }}
                                className="onetym-btn"
                              >
                                Yes
                              </button>
                              <button
                                style={{
                                  background: index?.product?.points_creation
                                    ? "#FFFFFF"
                                    : "rgba(229, 229, 229, 0.37)",
                                  border: "0.5px solid #e5e5e5",
                                }}
                                className="onetym-btn"
                              >
                                No
                              </button>
                            </div>
                          </div>
                          <div className="pricing">
                            <div className="billing-txt">Grace Period:</div>
                            <div
                              className="pricing-btns"
                              style={{
                                justifyContent: "flex-end",
                                color: "#1F304F",
                                fontWeight: "600",
                              }}
                            >
                              {index?.product?.grace_period} Days
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="right-divv">
                      {buy === "step1" ? (
                        <>
                          <div className="amount-details">
                            <div
                              className="left-amnt"
                              style={{ borderRight: "1px solid #E7E7E7" }}
                            >
                              <p className="amnt-font">
                                {index?.product?.pricesWithAppFees?.length >
                                  0 &&
                                index?.product?.pricesWithAppFees[0]?.price
                                  ? index?.product?.pricesWithAppFees[0]?.price?.toFixed(
                                      2
                                    )
                                  : "0.00"}
                                &nbsp;
                                {index?.product?.pricesWithAppFees?.length >
                                  0 &&
                                index?.product?.pricesWithAppFees[0]?.coin
                                  ? index?.product?.pricesWithAppFees[0]?.coin
                                  : ""}
                              </p>
                              <p className="text-font">
                                {index?.product?.pricesWithAppFees?.length >
                                  0 &&
                                index?.product?.pricesWithAppFees[0]
                                  ?.billing_method === "first_purchase"
                                  ? "First Purchase"
                                  : index?.product?.pricesWithAppFees[0]
                                      ?.billing_method}
                              </p>
                            </div>
                            <div className="left-amnt1">
                              <p className="amnt-font">
                                {index?.product?.pricesWithAppFees?.length >
                                  0 &&
                                index?.product?.pricesWithAppFees[1]?.price
                                  ? index?.product?.pricesWithAppFees[1]?.price?.toFixed(
                                      2
                                    )
                                  : "0.00"}
                                &nbsp;
                                {index?.product?.pricesWithAppFees?.length >
                                  0 && index?.product?.pricesWithAppFees[1]
                                  ? index?.product?.pricesWithAppFees[1]?.coin
                                  : ""}
                              </p>
                              <p className="text-font">
                                {index?.product?.pricesWithAppFees?.length >
                                  0 &&
                                index?.product?.pricesWithAppFees[1]
                                  ?.billing_method
                                  ? index?.product?.pricesWithAppFees[1]
                                      ?.billing_method
                                  : ""}
                              </p>
                            </div>
                          </div>
                          {/* <div className="billing">
                            <div>Billing Currency:</div>
                            <div>
                              {index?.product?.monthly
                                ? index?.product?.billing_cycle?.monthly?.coin
                                : index?.product?.billing_cycle?.lifetime?.coin}
                            </div>
                          </div> */}
                          <div className="buttonss">
                            <button
                              className="buy-btn"
                              onClick={() => {
                                setBuy("step2");
                              }}
                            >
                              Buy Now
                            </button>
                            {/* <button className="share-btn">Share</button> */}
                          </div>
                        </>
                      ) : buy === "step2" ? (
                        <div className="buy-step1">
                          <div
                            style={{
                              width: "100%",
                              height: "20%",
                              height: "17%",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "1.25rem",
                                fontWeight: "500",
                                color: "#1F304F",
                              }}
                            >
                              Select Currency To Pay With?
                            </div>
                            <div className="searchh">
                              <input
                                type="text"
                                placeholder="Search Accountants.io Vaults.."
                                onChange={(event) =>
                                  filterItem(event.target.value)
                                }
                              />
                            </div>
                          </div>
                          <div className="coin-options">
                            <CoinComponent />
                          </div>
                          <div className="buttonss">
                            <div
                              className="share-btn"
                              style={{ textAlign: "center" }}
                              onClick={() => {
                                setBuy("step1");
                              }}
                            >
                              Close
                            </div>
                          </div>
                        </div>
                      ) : buy === "step3" ? (
                        <div className="buy-step1">
                          <div
                            style={{
                              fontSize: "1.25rem",
                              fontWeight: "500",
                              color: "#1F304F",
                            }}
                          >
                            Are You Sure You Want To Subscribe To{" "}
                            {index?.product_name}?
                          </div>
                          <div className="boxx" onClick={() => setBuy("step4")}>
                            Confirm Purchase
                          </div>
                          <div
                            className="boxx"
                            style={{
                              marginTop: "1.5rem",
                            }}
                            onClick={() => setBuy("step2")}
                          >
                            Go Back
                          </div>
                          <div
                            className="boxx"
                            style={{
                              marginTop: "1.5rem",
                            }}
                            onClick={() => {
                              navigate("/dashboard/users");
                              setBuy("step1");
                            }}
                          >
                            Cancel Order
                          </div>
                        </div>
                      ) : (
                        <div className="buy-step1">
                          <Step4 />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <>
        {showDrop ? (
          <div className="m-drop" onMouseDown={(e) => e.stopPropagation()}>
            <div className="m-each">
              <div className="m-left">
                <div className="m-left-icon-box">
                  <img className="m-left-icon" src={accounts} alt="" />
                </div>
                <div className="m-left-text">Accounts</div>
              </div>
              <div className="m-right-icon-box">
                <img className="m-right-icon" src={sidearrow} alt="" />
              </div>
            </div>
            <div className="m-each">
              <div className="m-left">
                <div className="m-left-icon-box">
                  <img className="m-left-icon" src={vaults} alt="" />
                </div>
                <div className="m-left-text">Vaults</div>
              </div>
              <div className="m-right-icon-box">
                <img className="m-right-icon" src={sidearrow} alt="" />
              </div>
            </div>
            <div className="m-each">
              <div className="m-left">
                <div className="m-left-icon-box">
                  <img className="m-left-icon" src={profilea} alt="" />
                </div>
                <div className="m-left-text">Profile</div>
              </div>
              <div className="m-right-icon-box">
                <img className="m-right-icon" src={sidearrow} alt="" />
              </div>
            </div>
            <div className="m-each-line"> </div>
            <div className="m-each">
              <div className="m-left">
                <div className="m-left-icon-box">
                  <img className="m-left-icon" src={support} alt="" />
                </div>
                <div className="m-left-text">Support</div>
              </div>
              <div className="m-right-icon-box">
                <img className="m-right-icon" src={sidearrow} alt="" />
              </div>
            </div>
            <div className="m-each">
              <div className="m-left">
                <div className="m-left-icon-box">
                  <img className="m-left-icon" src={settings} alt="" />
                </div>
                <div className="m-left-text">Settings</div>
              </div>
              <div className="m-right-icon-box">
                <img className="m-right-icon" src={sidearrow} alt="" />
              </div>
            </div>
            <div className="m-each" onClick={() => handleLogout()}>
              <div className="m-left">
                <div className="m-left-icon-box">
                  <img className="m-left-icon" src={logout} alt="" />
                </div>
                <div className="m-left-text">Logout</div>
              </div>
              <div className="m-right-icon-box">
                <img className="m-right-icon" src={sidearrow} alt="" />
              </div>
            </div>
          </div>
        ) : (
          ""
        )}
      </> */}
    </div>
  );
};

export default MallProduct;
