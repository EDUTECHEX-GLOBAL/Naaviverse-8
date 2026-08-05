import React, { useState, useEffect } from "react";
import useWindowDimensions from "../../../utils/WindowSize.js";
import Skeleton from "react-loading-skeleton";
import MobMenu from "../../../components/mobMenu/mobMenu.jsx";
import { useCoinContextData } from "../../../context/CoinContext";
import { useStore } from "../../../components/store/store.ts";
import "./singleproductpage.scss";
import Navbar from "../../../components/Navbar/index.jsx";

const SingleProduct = () => {
  const { selectedDirectoryProduct, setSelectedDirectoryProduct } =
    useCoinContextData();
  const { mobMenuOpen } = useStore();
  const { width } = useWindowDimensions();
  const [bg, setBg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    let bgcolor = localStorage.getItem("directorycolor");
    setBg(bgcolor);
    const storedData = localStorage.getItem("singleProduct");
    const parsedData = JSON.parse(storedData);
    if (parsedData) {
      // console.log(parsedData, "parsedData");
      setSelectedDirectoryProduct(parsedData);
      setLoading(false);
    }
  }, []);

  return (
    <div className="mob-single-directory-productpage">
      <Navbar />
      {width > 768 ? (
        ""
      ) : (
        <>
          {!mobMenuOpen ? (
            <div className="mob-directory-sp-content">
              {loading ? (
                <div className="mob-directory-sp-cover-pic">
                  <Skeleton width={"100%"} height={"100%"} />
                </div>
              ) : (
                <div
                  className="mob-directory-sp-cover-pic"
                  style={{
                    background: bg,
                  }}
                ></div>
              )}
              <div className="mob-directory-sp-img-box">
                {loading ? (
                  <div className="mob-directory-sp-img">
                    <Skeleton width={"100%"} height={"100%"} />
                  </div>
                ) : (
                  <img
                    src={selectedDirectoryProduct?.product_icon}
                    alt={selectedDirectoryProduct?.product_code}
                    className="mob-directory-sp-img"
                  />
                )}
                {loading ? (
                  <div>
                    <Skeleton width={150} height={40} />
                  </div>
                ) : (
                  <div className="mob-directory-sp-buy">Buy</div>
                )}
              </div>
              {loading ? (
                <div className="mob-directory-sp-name">
                  <Skeleton width={200} height={35} />
                </div>
              ) : (
                <div className="mob-directory-sp-name">
                  {selectedDirectoryProduct?.product_name}
                </div>
              )}
              {loading ? (
                <div
                  className="mob-directory-sp-work"
                  style={{ flexDirection: "column" }}
                >
                  <Skeleton width={300} height={25} />
                  <Skeleton width={300} height={25} />
                  <Skeleton width={300} height={25} />
                </div>
              ) : (
                <div className="mob-directory-sp-work">
                  {selectedDirectoryProduct?.sub_text}
                </div>
              )}
              <div className="mob-directory-sp-gap-box"></div>
              <div className="mob-directory-sp-about">
                {loading ? (
                  <div className="mob-directory-sp-about-text1">
                    <Skeleton width={200} height={35} />
                  </div>
                ) : (
                  <div className="mob-directory-sp-about-text1">
                    About {selectedDirectoryProduct?.product_name}
                  </div>
                )}
                {loading ? (
                  <div
                    className="mob-directory-sp-about-text2"
                    style={{ flexDirection: "column" }}
                  >
                    <Skeleton width={300} height={25} />
                    <Skeleton width={300} height={25} />
                    <Skeleton width={300} height={25} />
                  </div>
                ) : (
                  <div className="mob-directory-sp-about-text2">
                    {selectedDirectoryProduct?.full_description}
                  </div>
                )}
              </div>
              <div className="mob-directory-sp-gap-box"></div>
              <div className="mob-directory-sp-about">
                {loading ? (
                  <>
                    <div className="mob-directory-sp-about-text1">
                      <Skeleton width={200} height={35} />
                    </div>
                    <div
                      className="mob-directory-sp-about-text2"
                      style={{ flexDirection: "column" }}
                    >
                      <Skeleton width={300} height={25} />
                      <Skeleton width={300} height={25} />
                      <Skeleton width={300} height={25} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mob-sdirectory-ingleproduct-about-text1">
                      Pricing Details
                    </div>
                    <div className="mob-directory-sp-about-bt-div">
                      <div className="mob-directory-sp-details">
                        <div className="bt-text1">Billing Type:</div>
                        <div className="mob-directory-sp-billing-types">
                          <div
                            style={{
                              background: selectedDirectoryProduct?.lifetime
                                ? "rgba(229, 229, 229, 0.37)"
                                : "white",
                              border: selectedDirectoryProduct?.lifetime
                                ? "none"
                                : "0.5px solid #e5e5e5",
                            }}
                          >
                            One Time
                          </div>
                          <div
                            style={{
                              background: selectedDirectoryProduct?.lifetime
                                ? "white"
                                : "rgba(229, 229, 229, 0.37)",
                              border: selectedDirectoryProduct?.lifetime
                                ? "0.5px solid #e5e5e5"
                                : "none",
                            }}
                          >
                            Recurring
                          </div>
                        </div>
                      </div>
                      <div className="mob-directory-sp-details">
                        <div className="bt-text1">Frequency:</div>
                        <div className="mob-directory-sp-billing-types">
                          <div
                            style={{
                              background: selectedDirectoryProduct?.monthly
                                ? "rgba(229, 229, 229, 0.37)"
                                : "white",
                              border: selectedDirectoryProduct?.monthly
                                ? "none"
                                : "0.5px solid #e5e5e5",
                            }}
                          >
                            Monthly
                          </div>
                          <div
                            style={{
                              background: selectedDirectoryProduct?.monthly
                                ? "white"
                                : "rgba(229, 229, 229, 0.37)",
                              border: selectedDirectoryProduct?.monthly
                                ? "0.5px solid #e5e5e5"
                                : "none",
                            }}
                          >
                            One Time
                          </div>
                        </div>
                      </div>
                      <div className="mob-directory-sp-details">
                        <div className="bt-text1">Stake:</div>
                        <div className="mob-directory-sp-billing-types">
                          <div
                            style={{
                              background:
                                selectedDirectoryProduct?.staking_allowed
                                  ? "rgba(229, 229, 229, 0.37)"
                                  : "white",
                              border: selectedDirectoryProduct?.staking_allowed
                                ? "none"
                                : "0.5px solid #e5e5e5",
                            }}
                          >
                            Allowed
                          </div>
                          <div
                            style={{
                              background:
                                selectedDirectoryProduct?.staking_allowed
                                  ? "white"
                                  : "rgba(229, 229, 229, 0.37)",
                              border: selectedDirectoryProduct?.staking_allowed
                                ? "0.5px solid #e5e5e5"
                                : "none",
                            }}
                          >
                            Not Allowed
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="mob-directory-sp-gap-box"></div>
              <div className="mob-directory-sp-about">
                {loading ? (
                  <>
                    <div className="mob-directory-sp-about-text1">
                      <Skeleton width={200} height={35} />
                    </div>
                    <div
                      className="mob-directory-sp-about-text2"
                      style={{ flexDirection: "column" }}
                    >
                      <Skeleton width={300} height={25} />
                      <Skeleton width={300} height={25} />
                      <Skeleton width={300} height={25} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mob-directory-sp-about-text1">
                      Other Data
                    </div>
                    <div className="mob-directory-sp-about-bt-div">
                      <div className="mob-directory-sp-details">
                        <div className="bt-text1">Affiliate Points:</div>
                        <div className="mob-directory-sp-billing-types">
                          <div
                            style={{
                              background:
                                selectedDirectoryProduct?.points_creation
                                  ? "rgba(229, 229, 229, 0.37)"
                                  : "white",
                              border: selectedDirectoryProduct?.points_creation
                                ? "none"
                                : "0.5px solid #e5e5e5",
                            }}
                          >
                            Yes
                          </div>
                          <div
                            style={{
                              background:
                                selectedDirectoryProduct?.points_creation
                                  ? "white"
                                  : "rgba(229, 229, 229, 0.37)",
                              border: selectedDirectoryProduct?.points_creation
                                ? "0.5px solid #e5e5e5"
                                : "none",
                            }}
                          >
                            No
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              {loading ? (
                <div className="mob-directory-sp-grace-div">
                  <div>
                    <Skeleton width={100} height={30} />
                  </div>
                  <div>
                    <Skeleton width={100} height={30} />
                  </div>
                </div>
              ) : (
                <>
                  <div className="mob-directory-sp-grace-div">
                    <div>Grace Period:</div>
                    <div>{selectedDirectoryProduct?.grace_period} Days</div>
                  </div>
                </>
              )}
              <div className="mob-directory-sp-gap-box1"></div>
            </div>
          ) : (
            <>
              <MobMenu />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default SingleProduct;
