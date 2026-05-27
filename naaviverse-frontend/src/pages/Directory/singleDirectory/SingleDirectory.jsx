import React, { useEffect, useState } from "react";
import { useStore } from "../../../components/store/store.ts";
import "../directory.scss";
import NavBar from "../../../components/Layouts/Navbar/navbar";
import useWindowDimensions from "../../../utils/WindowSize";
import { GetAutomatedServices } from "../../../services/accountant";
import clickarrow from "../../../static/images/dashboard/clickarrow.svg";
import search from "../../../images/search.svg";
import searchIcon from "../../../images/searchIcon.svg";
import MobMenu from "../../../components/mobMenu/mobMenu";
import { GetAllAccountantsWithoutFollowers } from "../../../services/accountant";
import { useLocation } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import { useNavigate } from "react-router-dom";
import { useCoinContextData } from "../../../context/CoinContext";
import Navbar from "../../../components/Navbar/index.jsx";

//images
import logo from "../../../static/images/logo.svg";
import hamIcon from "../../../static/images/icons/hamIcon.svg";

const SingleDirectory = () => {
  let navigate = useNavigate();
  const { pathname } = useLocation();
  const { mobMenuOpen } = useStore();
  const { width } = useWindowDimensions();
  const [automatedservices, setautomatedservices] = useState([]);
  const [isApiLoading, setisApiLoading] = useState(true);
  const [filteredAccountantsData, setFilteredAccountantsData] = useState([]);
  const [singleDirectory, setSingleDirectory] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState([]);
  const [showProductInfo, setShowProductInfo] = useState(false);
  const {
    preLoginMenu,
    setPreLoginMenu,
    selectedDirectoryProduct,
    setSelectedDirectoryProduct,
  } = useCoinContextData();

  useEffect(() => {
    // console.log(pathname.slice(pathname.lastIndexOf("/")), "pathname");
    setLoading(true);
    GetAllAccountantsWithoutFollowers()
      .then((response) => {
        let result = response?.data?.data;
        // console.log(result, "result88698698");
        // setAccountantsData(result);
        // setFilteredAccountantsData(result);
        const foundData = result?.find(
          (o) =>
            `/${o?.bankerTag}` === pathname.slice(pathname.lastIndexOf("/"))
        );
        setSingleDirectory(foundData);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error, "error in getting accountantsData");
      });
  }, []);

  // function filterItem(text) {
  //   let filterItem = accountantsData?.filter((eachitem) => {
  //     return eachitem?.displayName
  //       ?.toLowerCase()
  //       ?.includes(text?.toLowerCase());
  //   });
  //   setFilteredAccountantsData(filterItem);
  // }

  // function filterItem(text) {
  //   let filterItem = automatedservices?.filter((eachitem) => {
  //     return eachitem?.product.product_name
  //       ?.toLowerCase()
  //       ?.includes(text?.toLowerCase());
  //   });
  //   setFilteredAccountantsData(filterItem);
  // }

  useEffect(() => {
    handleAutomatedServices();
  }, [singleDirectory]);

  function capitalizeWords(sentence) {
    // Split the sentence into an array of words
    var words = sentence?.toLowerCase().split(" ");

    // Capitalize the first letter of each word
    for (var i = 0; i < words?.length; i++) {
      words[i] = words[i]?.charAt(0)?.toUpperCase() + words[i]?.slice(1);
    }

    // Join the capitalized words back into a sentence
    var capitalizedSentence = words?.join(" ");

    return capitalizedSentence;
  }

  const handleAutomatedServices = () => {
    if (singleDirectory?.email) {
      // console.log(singleDirectory?.email, "ee");
      setisApiLoading(true);
      let obj = {
        product_creator: singleDirectory?.email,
      };
      GetAutomatedServices(obj)
        .then((res) => {
          if (res.data.status) {
            // console.log(res.data.products, "products");
            setautomatedservices(res.data.products);
            setisApiLoading(false);
          }
        })
        .catch((err) => {
          console.log(err, "error in handleAutomatedServices");
          setisApiLoading(false);
        });
    }
  };

  useEffect(() => {
    if (pathname.includes("/directory/nodes")) {
      setPreLoginMenu("Partners");
    }
  }, []);

  return (
    <div className="single-directory-page">
      <Navbar />
      {width > 768 ? (
        <div className="single-directory-content">
          {loading ? (
            Array(1)
              .fill("")
              .map((e, i) => {
                return (
                  <div
                    key={i}
                    style={{
                      borderRadius: "25px",
                      margin: "35px 0px",
                      background: "#ffffff",
                      border: "0.5px solid #e7e7e7",
                    }}
                  >
                    <Skeleton className="single-cover-pic" />
                    <div className="account-img-box">
                      <Skeleton className="account-img" />
                    </div>
                    <div className="account-name">
                      <Skeleton width={100} height={25} />
                    </div>
                    <div className="account-work">
                      <Skeleton width={100} height={25} />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        margin: "0px 50px",
                        alignItems: "center",
                      }}
                    >
                      <Skeleton
                        className="single-btn"
                        style={{ background: "#ffffff", border: "none" }}
                        width={100}
                        height={35}
                      />

                      <div style={{ display: "flex", alignItems: "center" }}>
                        <div>
                          <div className="account-speaclities">
                            <Skeleton width={100} height={25} />
                          </div>
                          <div className="account-speaclities-all">
                            <div
                              className="account-speaclities-each"
                              style={{ border: "none", padding: "0" }}
                            >
                              <Skeleton width={100} height={25} />
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="account-country">
                            <Skeleton width={100} height={25} />
                          </div>
                          <div className="account-countries-all">
                            <div
                              className="account-countries-each"
                              style={{ border: "none", padding: "0" }}
                            >
                              <Skeleton width={100} height={25} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
          ) : (
            <div
              style={{
                borderRadius: "25px",
                margin: "35px 0px",
                background: "#ffffff",
                border: "0.5px solid #e7e7e7",
              }}
            >
              <div
                className="single-cover-pic"
                style={{ background: `#${singleDirectory?.colorCode}` }}
              ></div>
              <div className="account-img-box">
                <img
                  src={singleDirectory?.profilePicURL}
                  alt=""
                  className="account-img"
                  style={{ zIndex: 1 }}
                />
              </div>
              <div className="account-name">{singleDirectory?.displayName}</div>
              <div className="account-work">{singleDirectory?.description}</div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  margin: "0px 50px",
                  alignItems: "center",
                }}
              >
                <div onClick={e => navigate('/login')}
                  className="single-btn"
                  style={{
                    background: `#${singleDirectory?.colorCode}`,
                    border: "none",
                  }}
                >
                  Follow
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div>
                    <div
                      className="account-speaclities"
                      style={{ marginTop: "-10px" }}
                    >
                      Specialty
                    </div>
                    <div className="account-speaclities-all">
                      <div className="account-speaclities-each">
                        {capitalizeWords(singleDirectory?.subCategory)}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div
                      className="account-country"
                      style={{ marginTop: "-10px" }}
                    >
                      Countries
                    </div>
                    <div className="account-countries-all">
                      <div className="account-countries-each">
                        {singleDirectory?.country}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div
            style={{
              borderRadius: "25px",
              margin: "35px 0px",
              background: "#ffffff",
              padding: "30px",
              border: "0.5px solid #e7e7e7",
            }}
          >
            <div style={{ fontSize: "1.25rem", fontWeight: "500" }}>
              What {singleDirectory?.displayName} Can Do For You
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                flexWrap: "wrap",
                gap: "0 2%",
              }}
            >
              {!isApiLoading &&
              automatedservices != null &&
              automatedservices != undefined ? (
                <>
                  {automatedservices?.map((each, i) => (
                    <div
                      className="each-service"
                      style={{
                        marginTop: "30px",
                        marginRight: "0",
                      }}
                      key={i}
                      onClick={() => {
                        setSelectedProduct(each);
                        setShowProductInfo(true);
                      }}
                    >
                      <div>
                        <img
                          style={{ width: "30px" }}
                          src={each.product.product_icon}
                          alt=""
                        />
                      </div>
                      <div className="each-service-title">
                        {each.product.product_name}
                      </div>
                      <div className="each-service-desc">
                        {each.product.sub_text}
                      </div>
                      <div className="each-service-bottom">
                        <div className="each-service-price">
                          $
                          {`${parseFloat(
                            each.product.pricesWithAppFees[
                              each.product.pricesWithAppFees.length - 1
                            ].price
                          ).toFixed(2)}/${
                            each.product.pricesWithAppFees[
                              each.product.pricesWithAppFees.length - 1
                            ].billing_method
                          }`}
                        </div>
                        <div
                          className="zoom1"
                          style={{ cursor: "not-allowed" }}
                        >
                          <span
                            style={{
                              display: "flex",
                              justifyContent: "space-around",
                              alignItems: "center",
                              height: "40px",
                            }}
                          >
                            <div className="check1-text">CHECK</div>
                            <img
                              className="clickarrow-img"
                              src={clickarrow}
                              alt=""
                            />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                Array(10)
                  .fill("")
                  .map((e, i) => {
                    return (
                      <div
                        key={i}
                        className="each-service"
                        style={{
                          marginTop: "30px",
                          marginRight: "0",
                        }}
                      >
                        <div>
                          <Skeleton width={30} height={30} />
                        </div>
                        <div className="each-service-title">
                          <Skeleton width={100} height={25} />
                        </div>
                        <div className="each-service-desc">
                          <Skeleton width={120} height={25} />
                        </div>
                        <div className="each-service-bottom">
                          <div className="each-service-price">
                            <Skeleton width={150} height={25} />
                          </div>
                          <div>
                            <Skeleton width={100} height={25} />
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          {!mobMenuOpen ? (
            <div className="mob-directory-content">
              {/* <div className="mob-top-div">
                <div className="mob-hiding-div" style={{ background: `#${singleDirectory?.colorCode}`, transform: "scaleY(1.01)" }}>
                  <div className="mob-static-div">
                    <div> </div>
                  </div>
                  <div className="mob-search-container">
                    <input
                      type="text"
                      placeholder="Search By Name.."
                      onChange={(event) => filterItem(event.target.value)}
                    />
                    <div className="mob-search-btn">
                      <img src={searchIcon} alt="search" />
                    </div>
                  </div>
                </div>
              </div> */}
              <div className="mob-scroll-div" style={{ height: "100%" }}>
                <div
                  className="mob-single-directory-content"
                  // style={{ marginTop: "40px" }}
                >
                  {loading ? (
                    Array(1)
                      .fill("")
                      .map((e, i) => {
                        return (
                          <div
                            style={{
                              background: "#ffffff",
                            }}
                            key={i}
                          >
                            <Skeleton
                              className="mob-single-cover-pic"
                              style={{
                                height: "10rem",
                              }}
                            />
                            <div className="mob-account-img-box">
                              <Skeleton
                                className="mob-account-img"
                                style={{ zIndex: "3" }}
                              />
                            </div>
                            <div className="mob-account-name">
                              <Skeleton width={100} height={25} />
                            </div>
                            <div className="mob-account-work">
                              <Skeleton width={200} height={25} />
                            </div>
                            <div
                              style={{
                                margin: "0px 20px",
                                paddingTop: "30px",
                              }}
                            >
                              <div
                                className="mob-single-btn"
                                style={{
                                  padding: "0",
                                  border: "none",
                                  background: "transparent",
                                }}
                              >
                                <Skeleton width={100} height={25} />
                              </div>
                              <div style={{ display: "flex", gap: "1rem" }}>
                                <div>
                                  <div className="mob-account-speaclities">
                                    <Skeleton width={100} height={25} />
                                  </div>
                                  <div className="mob-account-speaclities-all">
                                    <div
                                      className="mob-account-speaclities-each"
                                      style={{ padding: "0", border: "none" }}
                                    >
                                      <Skeleton width={120} height={25} />
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <div className="mob-account-country">
                                    <Skeleton width={100} height={25} />
                                  </div>
                                  <div className="mob-account-countries-all">
                                    <div
                                      className="mob-account-countries-each"
                                      style={{ padding: "0", border: "none" }}
                                    >
                                      <Skeleton width={150} height={25} />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <div
                      style={{
                        background: "#ffffff",
                      }}
                    >
                      <div
                        className="mob-single-cover-pic"
                        style={{
                          background: `#${singleDirectory?.colorCode}`,
                          height: "10rem",
                        }}
                      ></div>
                      <div className="mob-account-img-box">
                        <img
                          src={singleDirectory?.profilePicURL}
                          alt=""
                          className="mob-account-img"
                          style={{ zIndex: "3" }}
                        />
                      </div>
                      <div className="mob-account-name">
                        {singleDirectory?.displayName}
                      </div>
                      <div className="mob-account-work">
                        {singleDirectory?.description}
                      </div>
                      <div
                        style={{
                          // display: "flex",
                          // justifyContent: "space-between",
                          margin: "0px 20px",
                          paddingTop: "30px",
                          // alignItems: "center",
                        }}
                      >
                        <div
                          className="mob-single-btn"
                          style={{ padding: "10px 30px" }}
                        >
                          Follow
                        </div>
                        <div style={{ display: "flex", gap: "1rem" }}>
                          <div>
                            <div className="mob-account-speaclities">
                              Specialty
                            </div>
                            <div className="mob-account-speaclities-all">
                              <div
                                className="mob-account-speaclities-each"
                                style={{ padding: "10px 1.5rem" }}
                              >
                                {capitalizeWords(singleDirectory?.subCategory)}
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="mob-account-country">Countries</div>
                            <div className="mob-account-countries-all">
                              <div
                                className="mob-account-countries-each"
                                style={{ padding: "10px 1.5rem" }}
                              >
                                {singleDirectory?.country}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div
                    style={{
                      margin: "10px 0px",
                      background: "#ffffff",
                      padding: "30px 15px",
                    }}
                  >
                    <div>
                      What {singleDirectory?.displayName} Can Do For You
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                      }}
                    >
                      {!isApiLoading &&
                      automatedservices != null &&
                      automatedservices != undefined ? (
                        <>
                          {automatedservices?.map((each, i) => (
                            <div
                              className="mob-each-service"
                              style={{
                                marginTop: "30px",
                              }}
                              onClick={() => {
                                setSelectedDirectoryProduct(each?.product);
                                localStorage.setItem(
                                  "singleProduct",
                                  JSON.stringify(each?.product)
                                );
                                localStorage.setItem(
                                  "directorycolor",
                                  `#${singleDirectory?.colorCode}`
                                );
                                navigate(
                                  `/directory/nodes/${each?.product?.banker_metadata?.displayName}/${each?.product?.product_code}`
                                );
                              }}
                            >
                              <div style={{ width: "30px", height: "30px" }}>
                                <img
                                  style={{ width: "30px" }}
                                  // className="mob-each-service-img1"
                                  src={each.product.product_icon}
                                  alt=""
                                />
                              </div>
                              <div className="mob-each-service-title">
                                {each.product.product_name}
                              </div>
                              <div className="mob-each-service-desc">
                                {each.product.sub_text}
                              </div>
                              <div className="mob-each-service-bottom">
                                <div className="mob-each-service-price">
                                  $
                                  {`${parseFloat(
                                    each.product.pricesWithAppFees[
                                      each.product.pricesWithAppFees.length - 1
                                    ].price
                                  ).toFixed(2)}/${
                                    each.product.pricesWithAppFees[
                                      each.product.pricesWithAppFees.length - 1
                                    ].billing_method
                                  }`}
                                </div>
                                <div
                                  className="mob-zoom1"
                                  style={{ cursor: "not-allowed" }}
                                >
                                  <span
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-around",
                                      alignItems: "center",
                                      height: "40px",
                                    }}
                                  >
                                    <div className="mob-check1-text">CHECK</div>
                                    <img
                                      className="mob-clickarrow-img"
                                      src={clickarrow}
                                      alt=""
                                    />
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </>
                      ) : (
                        Array(3)
                          .fill("")
                          .map((e, i) => {
                            return (
                              <div
                                className="mob-each-service"
                                style={{
                                  marginTop: "30px",
                                }}
                                key={i}
                              >
                                <div>
                                  <Skeleton width={30} height={30} />
                                </div>
                                <div className="mob-each-service-title">
                                  <Skeleton width={100} height={25} />
                                </div>
                                <div className="mob-each-service-desc">
                                  <Skeleton width={200} height={25} />
                                </div>
                                <div className="mob-each-service-bottom">
                                  <div className="mob-each-service-price">
                                    <Skeleton width={100} height={25} />
                                  </div>
                                  <div>
                                    <Skeleton width={100} height={25} />
                                  </div>
                                </div>
                              </div>
                            );
                          })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <MobMenu />
            </>
          )}
        </>
      )}
      <div
        className="service-container1"
        style={{
          right: showProductInfo ? "0" : "-100%",
          // display: showProductInfo ? 'block' : 'none'
        }}
      >
        <div className="malls" style={{ width: "100%", height: "100%" }}>
          <div className="malls-products">
            <div className="content-area">
              <div className="left-divv" style={{ width: "100%" }}>
                <div className="productt-det" style={{ borderBottom: "none" }}>
                  <img
                    src={selectedProduct?.product?.product_icon}
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
                      {selectedProduct?.product?.product_name}
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
                      {selectedProduct?.product?.sub_text}
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
                        color: "#1F304F",
                      }}
                    >
                      About {selectedProduct?.product?.product_name}
                    </p>
                    <div>{selectedProduct?.product?.full_description}</div>
                  </div>
                  <div className="price-divv" style={{ borderBottom: "none" }}>
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
                            background: selectedProduct?.product?.lifetime
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
                            background: selectedProduct?.product?.lifetime
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
                            background: selectedProduct?.product?.monthly
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
                            background: selectedProduct?.product?.monthly
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
                            background: selectedProduct?.product
                              ?.staking_allowed
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
                            background: selectedProduct?.product
                              ?.staking_allowed
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
                            background: selectedProduct?.product
                              ?.points_creation
                              ? "rgba(229, 229, 229, 0.37)"
                              : "#FFFFFF",
                          }}
                          className="onetym-btn"
                        >
                          Yes
                        </button>
                        <button
                          style={{
                            background: selectedProduct?.product
                              ?.points_creation
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
                        {selectedProduct?.product?.grace_period} Days
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
  );
};

export default SingleDirectory;
