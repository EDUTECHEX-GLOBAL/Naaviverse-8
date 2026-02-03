import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useWindowDimensions from "../../utils/WindowSize";
import { useStore } from "../../components/store/store.ts";
import MobMenu from "../../components/mobMenu/mobMenu";
import Skeleton from "react-loading-skeleton";
import "./servicepage.scss";
import { useCoinContextData } from "../../context/CoinContext.js";
import axios from "axios";
import Navbar from "../../components/Navbar/index.jsx";

//images
import search from "../../images/search.svg";
import searchIcon from "../../images/searchIcon.svg";
import dummy from "./dummy.svg";
import logo from "../../static/images/logo.svg";
import hamIcon from "../../static/images/icons/hamIcon.svg";

const ServicePage = () => {
  const { mobMenuOpen } = useStore();
  let navigate = useNavigate();
  const { pathname } = useLocation();
  const { width } = useWindowDimensions();
  const [servicePageData, setServicePageData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState([]);
  const [showProductInfo, setShowProductInfo] = useState(false);
  const {
    selecteServiceProduct,
    setSelectedSingleProduct,
    preLoginMenu,
    setPreLoginMenu,
  } = useCoinContextData();

  useEffect(() => {
    setLoading(true);
    axios
      .get(
        // `https://comms.globalxchange.io/gxb/product/banker/get?category=education%20consultants`
        ` https://comms.globalxchange.io/gxb/product/banker/get?category=education consultants`
      )
      .then((response) => {
        let result = response?.data?.data;
        // console.log(result, "servicePageData result");
        setServicePageData(result);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error, "error in fetching servicePageData");
      });
  }, []);

  const filteredServices = servicePageData?.filter((service) =>
    service?.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (pathname.includes("/services")) {
      setPreLoginMenu("Services");
    }
  }, []);

  return (
    <div className="servicepage">
      <Navbar />
      {width > 768 ? (
        <div className="servicepage-content">
          <div className="servicepage-top-div">
            <div className="servicepage-hiding-div">
              <div className="servicepage-static-div"></div>
              <div className="servicepage-search-container">
                <input
                  type="text"
                  placeholder="Search Services By Name.."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="servicepage-search-btn">
                  <img src={search} alt="search" />
                </div>
              </div>
            </div>
          </div>
          <div className="servicepage-bottom-div">
            <div className="servicepage-scroll-div">
              <div className="services-txt">Services</div>
              <div className="services-div">
                {loading
                  ? Array(10)
                      .fill("")
                      .map((e, i) => {
                        return (
                          <div className="each-services" key={i}>
                            <div className="services-img-box">
                              <div className="services-name">
                                <Skeleton width={100} height={30} />
                              </div>
                              <Skeleton
                                width={50}
                                height={50}
                                borderRadius={50}
                              />
                            </div>
                            <div
                              className="services-work"
                              style={{ flexDirection: "column" }}
                            >
                              <Skeleton width={200} height={30} />
                              <Skeleton width={300} height={30} />
                            </div>
                            <div className="services-amount">
                              <Skeleton width={100} height={30} />
                            </div>
                          </div>
                        );
                      })
                  : filteredServices?.map((service, index) => (
                      <div
                        className="each-services"
                        key={index}
                        onClick={() => {
                          setSelectedProduct(service);
                          setShowProductInfo(true);
                        }}
                      >
                        <div className="services-img-box">
                          <div className="services-name">
                            {service?.product_name}
                          </div>
                          <img
                            src={service?.product_icon}
                            alt=""
                            className="services-img"
                          />
                        </div>
                        <div className="services-work">
                          {service?.full_description}
                        </div>
                        <div className="services-amount">
                          <span
                            style={{ fontSize: "1.5rem", marginRight: "5px" }}
                          >
                            {service?.billing_cycle &&
                            service?.billing_cycle?.monthly
                              ? service?.billing_cycle?.monthly?.coin
                              : service?.billing_cycle &&
                                service?.billing_cycle?.lifetime
                              ? service?.billing_cycle?.lifetime?.coin
                              : ""}
                          </span>
                          <span style={{ fontSize: "1.5rem" }}>
                            {service?.billing_cycle &&
                            service?.billing_cycle?.monthly
                              ? Number(
                                  service?.billing_cycle?.monthly?.price
                                )?.toFixed(2)
                              : service?.billing_cycle &&
                                service?.billing_cycle?.lifetime
                              ? Number(
                                  service?.billing_cycle?.lifetime?.price
                                )?.toFixed(2)
                              : ""}
                          </span>
                          <span
                            style={{
                              fontSize: "1.2rem",
                            }}
                          >
                            {service?.monthly ? "/Month" : "/Lifetime"}
                          </span>
                        </div>
                      </div>
                    ))}
              </div>
            </div>
          </div>

          <div
            className="service-container1"
            style={{ right: showProductInfo ? "0" : "-100%" }}
          >
            <div className="malls" style={{ width: "100%", height: "100%" }}>
              <div className="malls-products">
                <div className="content-area">
                  <div className="left-divv" style={{ width: "100%" }}>
                    <div
                      className="productt-det"
                      style={{ borderBottom: "none" }}
                    >
                      <img
                        src={selectedProduct?.product_icon}
                        alt=""
                        style={{ width: "20%", height: "100%" }}
                      />
                      <div className="pro-name">
                        <p
                          style={{
                            fontSize: "40px",
                            fontWeight: "600",
                            marginTop: "0",
                          }}
                        >
                          {selectedProduct?.product_name}
                        </p>
                        <p
                          style={{
                            display: " -webkit-box",
                            webkitLineClamp: "2",
                            webkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            fontSize: "1rem",
                          }}
                        >
                          {selectedProduct?.sub_text}
                        </p>
                      </div>
                    </div>

                    <div className="price-section">
                      <div
                        className="about-section"
                        style={{ borderBottom: "none", padding: "0 0 1rem" }}
                      >
                        <p
                          style={{
                            fontSize: "25px",
                            fontWeight: "600",
                          }}
                        >
                          About {selectedProduct?.product_name}
                        </p>
                        <div style={{ fontSize: "1rem" }}>
                          {selectedProduct?.full_description}
                        </div>
                      </div>
                      <div
                        className="price-divv"
                        style={{ borderBottom: "none" }}
                      >
                        <p
                          style={{
                            fontSize: "25px",
                            fontWeight: "600",
                          }}
                        >
                          Pricing Details
                        </p>
                        <div className="pricing">
                          <div
                            className="billing-txt"
                            style={{ fontSize: "1rem" }}
                          >
                            Billing Type:
                          </div>
                          <div className="pricing-btns">
                            <button
                              style={{
                                background: selectedProduct?.lifetime
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
                                background: selectedProduct?.lifetime
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
                          <div
                            className="billing-txt"
                            style={{ fontSize: "1rem" }}
                          >
                            Frequency:
                          </div>
                          <div className="pricing-btns">
                            <button
                              style={{
                                background: selectedProduct?.monthly
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
                                background: selectedProduct?.monthly
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
                          <div
                            className="billing-txt"
                            style={{ fontSize: "1rem" }}
                          >
                            Staking:
                          </div>
                          <div className="pricing-btns">
                            <button
                              style={{
                                background: selectedProduct?.staking_allowed
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
                                background: selectedProduct?.staking_allowed
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
                          paddingTop: "0",
                          height: "12rem",
                          borderBottom: "none",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "1.5rem",
                            fontWeight: "700",
                          }}
                        >
                          Other Data
                        </p>
                        <div className="pricing">
                          <div
                            className="billing-txt"
                            style={{ fontSize: "1rem" }}
                          >
                            Affiliate Points:
                          </div>
                          <div className="pricing-btns">
                            <button
                              style={{
                                background: selectedProduct?.points_creation
                                  ? "rgba(229, 229, 229, 0.37)"
                                  : "#FFFFFF",
                              }}
                              className="onetym-btn"
                            >
                              Yes
                            </button>
                            <button
                              style={{
                                background: selectedProduct?.points_creation
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
                          <div
                            className="billing-txt"
                            style={{ fontSize: "1rem" }}
                          >
                            Grace Period:
                          </div>
                          <div
                            className="pricing-btns"
                            style={{
                              justifyContent: "flex-end",
                              fontWeight: "600",
                              fontSize: "0.9rem",
                            }}
                          >
                            {selectedProduct?.grace_period} Days
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {showProductInfo && (
            <div
              className="overlay1"
              onClick={() => {
                setShowProductInfo(false);
                setSelectedProduct("");
              }}
            ></div>
          )}
        </div>
      ) : (
        <>
          {!mobMenuOpen ? (
            <div className="mob-service-content">
              <div className="mob-top-div-service">
                <div className="mob-hiding-div-service">
                  <div className="mob-static-div-service">
                    <div>Find Sevices</div>
                  </div>
                  <div className="mob-search-container-service">
                    <input
                      type="text"
                      placeholder="Search services.."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="mob-search-btn-service">
                      <img src={searchIcon} alt="search" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mob-scroll-div-service">
                <div className="mob-bottom-div-service">
                  <div className="mob-accountants-div-service">
                    {loading
                      ? Array(3)
                          .fill("")
                          .map((e, i) => {
                            return (
                              <div className="mob-each-services" key={i}>
                                <div className="mob-services-img-box">
                                  <div className="mob-services-name">
                                    <Skeleton width={100} height={30} />
                                  </div>
                                  <Skeleton
                                    width={50}
                                    height={50}
                                    borderRadius={50}
                                  />
                                </div>
                                <div
                                  className="mob-services-work"
                                  style={{ flexDirection: "column" }}
                                >
                                  <Skeleton width={200} height={30} />
                                  <Skeleton width={300} height={30} />
                                </div>
                                <div className="mob-services-amount">
                                  <Skeleton width={100} height={30} />
                                </div>
                              </div>
                            );
                          })
                      : filteredServices?.map((service, i) => {
                          return (
                            <div
                              className="mob-each-services"
                              key={i}
                              onClick={() => {
                                // console.log(
                                //   service,
                                //   "selected singleServiceProduct"
                                // );
                                setSelectedSingleProduct(service);
                                localStorage.setItem(
                                  "singleServiceProduct",
                                  JSON.stringify(service)
                                );
                                navigate(`/services/${service?.product_code}`);
                              }}
                            >
                              <div className="mob-services-img-box">
                                <div className="mob-services-name">
                                  {service?.product_name}
                                </div>
                                <img
                                  src={service?.product_icon}
                                  alt=""
                                  className="mob-services-img"
                                />
                              </div>
                              <div className="mob-services-work">
                                {service?.full_description}
                              </div>
                              <div className="mob-services-amount">
                                <span style={{ fontSize: "1.2rem" }}>
                                  {service?.billing_cycle &&
                                  service?.billing_cycle?.monthly
                                    ? service?.billing_cycle?.monthly?.coin
                                    : service?.billing_cycle &&
                                      service?.billing_cycle?.lifetime
                                    ? service?.billing_cycle?.lifetime?.coin
                                    : ""}
                                </span>
                                <span style={{ fontSize: "1.2rem" }}>
                                  {service?.billing_cycle &&
                                  service?.billing_cycle?.monthly
                                    ? Number(
                                        service?.billing_cycle?.monthly?.price
                                      )?.toFixed(2)
                                    : service?.billing_cycle &&
                                      service?.billing_cycle?.lifetime
                                    ? Number(
                                        service?.billing_cycle?.lifetime?.price
                                      )?.toFixed(2)
                                    : ""}
                                </span>
                                <span
                                  style={{
                                    fontSize: "0.9rem",
                                  }}
                                >
                                  {service?.monthly ? "/Month" : "/Lifetime"}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <MobMenu />
          )}
        </>
      )}
    </div>
  );
};

export default ServicePage;
