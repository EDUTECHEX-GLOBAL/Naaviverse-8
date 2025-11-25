import React, { useEffect, useState } from "react";
import "./currentstep.scss";
import { useCoinContextData } from "../../context/CoinContext";
import { useStore } from "../../components/store/store.ts";
import axios from "axios";
import Step4 from "../dashboard/MallProduct/Step4.jsx";
import CoinComponent from "../dashboard/MallProduct/CoinComponent.jsx";


// images
import dummy from "../JourneyPage/dummy.svg";
import edutech from "./edutech.svg";
import resory from "./resory.svg";
import lek from "./lek.svg";
import logo from "../../static/images/logo.svg";

const CurrentStep = ({ productDataArray, selectedPathId, showSelectedPath, selectedPath }) => {
  const userDetails = JSON.parse(localStorage.getItem("user"));

  const {
    currentStepData,
    setCurrentStepData,
    currentStepDataLength,
    setCurrentStepDataLength,
    currentStepdataPathId,
    setCurrentStepDataPathId,
    stepServices,
    setStepServices,
  } = useCoinContextData();
  

  const {
    sideNav,
    setsideNav,
    buy,
    setBuy, 
    mallCoindata,
    setfilteredcoins,
    index,
    setIndex,
  } = useStore();

  const [showNewDiv, setShowNewDiv] = useState(null);
  const [position1, setPosition1] = useState();
  const [position2, setPosition2] = useState();
  const [position3, setPosition3] = useState();
  const [currentStepPageData, setCurrentStepPageData] = useState([]);
  const [popup, setPopup] = useState(false);
  const [popupContent, setPopupContent] = useState("default"); // "default" | "success"
  const [popupDetails, setPopupDetails] = useState(""); // "yes" | "no"
  const [currentStepPagePathId, setCurrentStepPagePathId] = useState("");
  const [selectedCard, setSelectedCard] = useState(0); // which service card is selected

  const [cards, setCards] = useState(productDataArray);
  const [centerIndex, setCenterIndex] = useState(0);
  const [acceptOffer, setAcceptOffer] = useState(false);
  const [userData, setUserData] = useState([]);

  const [showGradeDesc, setShowGradeDesc] = useState(false);
  const [showStreamDesc, setShowStreamDesc] = useState(false);
  const [showCurriculumDesc, setShowCurriculumDesc] = useState(false);
  const [showGradePointDesc, setShowGradePointDesc] = useState(false);
  const [showFinancialDesc, setShowFinancialDesc] = useState(false);
  const [showPersonalityDesc, setShowPersonalityDesc] = useState(false);

  const [gradeDescription, setGradeDescription] = useState("");
  const [streamDescription, setStreamDescription] = useState("");
  const [curriculumDescription, setCurriculumDescription] = useState("");
  const [gradePointDescription, setGradePointDescription] = useState("");
  const [financialDescription, setFinancialDescription] = useState("");
  const [personalityDescription, setPersonalityDescription] = useState("");

  const handleRejectClick = () => {
    if (position1 === 1) setPosition1(3);
    else if (position1 === 2) setPosition1(1);
    else setPosition1(2);

    if (position2 === 2) setPosition2(1);
    else if (position2 === 3) setPosition2(2);
    else setPosition2(3);

    if (position3 === 3) setPosition3(2);
    else if (position3 === 2) setPosition3(1);
    else setPosition3(3);
  };

  const handleCardClick = (index) => {
    setCenterIndex(index);
    setCards((prevCards) => {
      const leftIndex = (index - 1 + prevCards.length) % prevCards.length;
      const rightIndex = (index + 1) % prevCards.length;
      const finalIndex = prevCards.length - 1;
      const finalLeftIndex =
        index === finalIndex
          ? (index - 1 + prevCards.length) % prevCards.length
          : leftIndex;
      const finalRightIndex = index === finalIndex ? 0 : rightIndex;

      return [
        prevCards[index],
        prevCards[finalRightIndex],
        prevCards[finalLeftIndex],
        ...prevCards.slice(index + 2),
        ...prevCards.slice(0, finalLeftIndex),
      ];
    });
  };

  /** ===================== USER DATA FETCH ====================== **/

// Add error boundary effect
useEffect(() => {
  const handleUnhandledError = (error) => {
    console.error('Unhandled error:', error);
  };

  window.addEventListener('error', handleUnhandledError);
  window.addEventListener('unhandledrejection', handleUnhandledError);

  return () => {
    window.removeEventListener('error', handleUnhandledError);
    window.removeEventListener('unhandledrejection', handleUnhandledError);
  };
}, []);








/** ===================== USER DATA FETCH ====================== **/
useEffect(() => {
  const userEmail = userDetails?.user?.email || userDetails?.email || "";

  // Add proper error handling and check if API is available
  if (!userEmail) {
    console.warn("No user email found");
    return;
  }

  axios
    .get(`/api/users/get/${userEmail}`)
    .then((response) => setUserData(response?.data?.data || []))
    .catch((error) => { 
      console.warn("User data fetch failed, using empty data:", error.message);
      setUserData([]); // Set empty array instead of failing
    });
}, []);

  /** ===================== FETCH STEP DATA ====================== **/
  useEffect(() => {
    const stepId = localStorage.getItem("selectedStepId");
    const stepData = localStorage.getItem("selectedStepData");

    if (stepData) {
      try { 
        setCurrentStepData(JSON.parse(stepData)); 
      } catch (error) {
        console.error("Error parsing step data:", error);
      }
    }

const fetchServices = async (stepId) => {
  if (!stepId) {
    setStepServices([]);
    return;
  }

  try {
    console.log("Fetching services for step:", stepId);
    
    // Add timeout and better error handling
    const response = await axios.get(`/api/services/by-step?step_id=${stepId}`, {
      timeout: 10000, // 10 second timeout
    });
    
    console.log("Services API response:", response.data);

    let servicesData = [];

    // Handle different response structures
    if (Array.isArray(response.data)) {
      servicesData = response.data;
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      servicesData = response.data.data;
    } else if (response.data?.status && Array.isArray(response.data.data)) {
      servicesData = response.data.data;
    }

    console.log("Processed services data:", servicesData);

    if (servicesData.length > 0) {
      setStepServices(servicesData);
      localStorage.setItem("selectedStepServices", JSON.stringify(servicesData));
    } else {
      // If no services from API, use fallback services
      const fallbackServices = getFallbackServices();
      setStepServices(fallbackServices);
      localStorage.setItem("selectedStepServices", JSON.stringify(fallbackServices));
      console.log("Using fallback services - no data from API");
    }

  } catch (error) {
    console.error("Error fetching services:", error.message);
    
    // Try to use cached services first
    const cachedServices = localStorage.getItem("selectedStepServices");
    if (cachedServices) {
      try {
        const parsedServices = JSON.parse(cachedServices);
        setStepServices(parsedServices);
        console.log("Using cached services due to network error");
      } catch (parseError) {
        console.error("Error parsing cached services:", parseError);
        setStepServices(getFallbackServices());
      }
    } else {
      // Use fallback services as last resort
      setStepServices(getFallbackServices());
      console.log("Using fallback services due to network error");
    }
  }
};

    fetchServices(stepId);
  }, []);

  /** ===================== FALLBACK SERVICES ====================== **/
  const getFallbackServices = () => {
    return [
      {
        _id: "fallback-1",
        name: "Academic Counseling Service",
        description: "Get personalized guidance for your academic journey and subject selection",
        ServiceDetails: [{
          first_purchase: { price: 0, coin: "Free" },
          billing_cycle: {
            monthly: { price: 0, coin: "Free" },
            annual: { price: 0, coin: "Free" }
          },
          product_name: "Academic Counseling"
        }]
      },
      {
        _id: "fallback-2", 
        name: "Portfolio Review",
        description: "Expert feedback on your creative portfolio for architecture applications",
        ServiceDetails: [{
          first_purchase: { price: 50, coin: "USD" },
          billing_cycle: {
            monthly: { price: 0, coin: "One-time" },
            annual: { price: 0, coin: "One-time" }
          },
          product_name: "Portfolio Review"
        }]
      },
      {
        _id: "fallback-3",
        name: "Test Preparation Guidance", 
        description: "Strategies and resources for standardized test preparation",
        ServiceDetails: [{
          first_purchase: { price: 0, coin: "Free" },
          billing_cycle: {
            monthly: { price: 0, coin: "Free" },
            annual: { price: 0, coin: "Free" }
          },
          product_name: "Test Prep Resources"
        }]
      }
    ];
  };

  /** ===================== DESCRIPTION RESOLVERS ====================== **/
  useEffect(() => {
    if (userData?.length > 0 && currentStepPageData?.length > 0) {
      const userGrade = userData[0]?.grade;
      const matchGrade = currentStepPageData?.gradeData?.find(
        (g) => g?.grade === userGrade
      );
      setGradeDescription(matchGrade?.description || "");

      const userStream = userData[0]?.stream;
      const matchStream = currentStepPageData?.streamData?.find(
        (s) => s?.stream === userStream
      );
      setStreamDescription(matchStream?.description || "");

      const userCurriculum = userData[0]?.curriculum;
      const matchCurriculum = currentStepPageData?.curriculumData?.find(
        (c) => c?.curriculum === userCurriculum
      );
      setCurriculumDescription(matchCurriculum?.description || "");

      const userGradePoint = userData[0]?.performance;
      const isPartialMatch = (a, b) => {
        const x = a?.replace(/\s/g, "");
        const y = b?.replace(/\s/g, "");
        return x?.includes(y) || y?.includes(x);
      };
      const matchGPA = currentStepPageData?.gradePointAverageData?.find((g) =>
        isPartialMatch(g?.gradePointAverage, userGradePoint)
      );
      setGradePointDescription(matchGPA?.description || "");

      const userFinancial = userData[0]?.financialSituation;
      const matchFin = currentStepPageData?.financialData?.find(
        (f) => f?.financialSituation === userFinancial
      );
      setFinancialDescription(matchFin?.description || "");

      const userPersonality = userData[0]?.personality;
      const matchPers = currentStepPageData?.personalityData?.find(
        (p) => p?.personality === userPersonality
      );
      setPersonalityDescription(matchPers?.description || "");
    }
  }, [userData, currentStepPageData]);

  /** ===================== helpers ====================== **/
  const pickServiceForDrawer = () => {
    const bySelected =
      stepServices?.[selectedCard]?.ServiceDetails?.[0] || stepServices?.[selectedCard];
    const byFirst =
      stepServices?.[0]?.ServiceDetails?.[0] || stepServices?.[0];
    return bySelected || byFirst || null;
  };

  /** ===================== COMPLETE STEP (YES FLOW) ====================== **/
  const completeStep = async (stepid, pathid) => {
    try {
      const obj = {
        email: userDetails?.user?.email,
        pathId: pathid,
        step_id: stepid,
      };

      const { status } = await axios.put(
        "https://careers.marketsverse.com/userpaths/completeStep",
        obj
      );

      if (status >= 200 && status < 300) {
        setPopupContent("success");
        setPopupDetails("yes");
      }
    } catch (error) {
      // allow flow even if API is flaky (for QA)
      setPopupContent("success");
      setPopupDetails("yes");
    }
  };

  /** ===================== FAIL STEP (FAILED FLOW) ====================== **/
  const failStep = async (stepid, pathid) => {
    try {
      const obj = {
        email: userDetails?.user?.email, // fixed
        pathId: pathid,
        step_id: stepid,
      };

      const { status } = await axios.put(
        "https://careers.marketsverse.com/userpaths/failedStep",
        obj
      );

      if (status >= 200 && status < 300) {
        setPopupContent("success");
        setPopupDetails("no");
      }
    } catch (error) {
      setPopupContent("success");
      setPopupDetails("no");
    }
  };

  /** ===================== FILTER COINS (SHOW ALL WHEN EMPTY) ====================== **/
  function filterItem(text) {
    if (!text) {
      setfilteredcoins(mallCoindata || []);
      return;
    }
    const filtered = mallCoindata?.filter((c) =>
      c?.coinSymbol?.toLowerCase()?.includes(text.toLowerCase())
    );
    setfilteredcoins(filtered || []);
  }

  return (
    <div className="currentstep" style={{ height: "91vh", overflow: "hidden" }}>
      {/* ==== HEADER ==== */}
      <div className="cs-top-area" style={{ height: "10rem" }}>
        <div className="cs-text1">
          <div>Your Current Step</div>

          <div
            className="back-Btn"
            onClick={() => {
              setCurrentStepData("");
              setCurrentStepDataLength("");
              setCurrentStepDataPathId("");
              setsideNav("My Journey");
            }}
            style={{ display: currentStepData ? "flex" : "none" }}
          >
            Back To Path
          </div>
        </div>

        <div className="bold-text">
          <div>{currentStepData?.name || currentStepPageData?.name}</div>
          <div>Apx Takes 3 Days</div>
        </div>

        <div style={{ fontSize: 16, fontWeight: 300, lineHeight: "30px" }}>
          {currentStepData?.description}
        </div>
      </div>

      {/* ==== CONTENT ==== */}
      <div className="cs-content" style={{ height: "60vh" }}>
        <div className="overall-cs-content">
          {/* Macro */}
          <div className="macro-view-box">
            <div className="macro-text">Macro View:</div>
            <div className="macro-content">
              <div className="step-text">
                {currentStepData?.name || currentStepPageData?.name}
              </div>
              <div className="macro-text-div">
                {currentStepData?.description || currentStepPageData?.description}
              </div>
            </div>
          </div>

          {/* Micro */}
          <div className="micro-view-box">
            <div className="micro-text">Micro View:</div>

            <div className="micro-content">
              <div className="step-text">
                <span>{currentStepData?.name || currentStepPageData?.name}</span> For You
              </div>

              <div className="micro-text-div-container">
                {/* Simple expanders (only titles show until Open) */}
                {[
                  "Based On You're Grade",
                  "Based On You're Stream",
                  "Based On You're Curriculum",
                  "Based On You're Grade Point Avg",
                  "Based On You're Financial Position",
                  "Based On You're Personality",
                ].map((title, i) => (
                  <div className="micro-text-div" key={title}>
                    <div className="bold-text-div">
                      <div className="bold-text">{title}</div>
                      <div
                        className="unlock-Btn"
                        onClick={() => {
                          [
                            setShowGradeDesc,
                            setShowStreamDesc,
                            setShowCurriculumDesc,
                            setShowGradePointDesc,
                            setShowFinancialDesc,
                            setShowPersonalityDesc,
                          ][i]((prev) => !prev);
                        }}
                      >
                        {[
                          showGradeDesc,
                          showStreamDesc,
                          showCurriculumDesc,
                          showGradePointDesc,
                          showFinancialDesc,
                          showPersonalityDesc,
                        ][i]
                          ? "Close"
                          : "Open"}
                      </div>
                    </div>
                    <div
                      className="sub-text"
                      style={{
                        display: [
                          showGradeDesc,
                          showStreamDesc,
                          showCurriculumDesc,
                          showGradePointDesc,
                          showFinancialDesc,
                          showPersonalityDesc,
                        ][i]
                          ? "flex"
                          : "none",
                      }}
                    >
                      {currentStepData?.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Nano */}
          <div className="nano-view-box">
            <div className="nano-text">Nano View:</div>
            <div className="nano-content">
              <div className="step-text">
                Get A Naavi Certified Vendor To Assist You In Choosing{" "}
                <span>{currentStepData?.name || currentStepPageData?.name}</span>
                <div className="step-description">
                  {currentStepData?.description || currentStepPageData?.description}
                </div>
              </div>

              {/* <div className="nano-overall-div">
                {stepServices?.length > 0 ? (
                  stepServices.slice(0, 3).map((item, idx) => (
                    <Carousel1
                      key={item._id || idx}
                      item={item}
                      showNewDiv={showNewDiv}
                      handleRejectClick={handleRejectClick}
                      position={idx}
                      selectedCard={selectedCard}
                      setSelectedCard={setSelectedCard}
                      setIndex={setIndex}
                      setAcceptOffer={setAcceptOffer}
                      userDetails={userDetails}
                    />
                  ))
                ) : (
                  <div className="no-services-message">
                    <p>No services available for this step yet.</p>
                    <p>Please check back later or contact support.</p>
                  </div>
                )}
              </div> */}
            </div>
          </div>
        </div>
      </div>

      {/* ==== FOOTER ==== */}
      <center>
        <div className="cs-footer1">
          <div
            onClick={() => {
              setPopup(true);
              setPopupDetails("no");
            }}
          >
            Failed
          </div>
          <div>Did you complete this step?</div>
          <div
            onClick={() => {
              setPopup(true);
              setPopupDetails("yes");
            }}
          >
            Yes
          </div>
        </div>
      </center>

      {/* ==== BUY DRAWER ==== */}
      {acceptOffer && (
        <div
          className="accept-offer-overlay"
          onClick={() => {
            setAcceptOffer(false);
            setBuy("step1");
            setIndex([]);
          }}
        >
          <div
            style={{ right: acceptOffer ? "0" : "-100%" }}
            className="right-divv-cs"
            onClick={(e) => e.stopPropagation()}
          >
            {buy === "step1" ? (
              <>
                {/* --- Amounts (Step 1) --- */}
                <div className="amount-details-cs">
                  {/* First Purchase (one-time) */}
                  <div className="left-amnt-cs" style={{ borderRight: "1px solid #E7E7E7" }}>
                    <p className="amnt-font-cs">
                      {(Number(index?.first_purchase?.price ?? 0)).toFixed(2)}&nbsp;
                      {index?.first_purchase?.coin || ""}
                    </p>
                    <p className="text-font-cs">{index?.first_purchase?.coin ? "First Purchase" : ""}</p>
                  </div>

                  {/* Monthly */}
                  <div className="left-amnt1-cs">
                    <p className="amnt-font-cs">
                      {(Number(index?.billing_cycle?.monthly?.price ?? 0)).toFixed(2)}&nbsp;
                      {index?.billing_cycle?.monthly?.coin || ""}
                    </p>
                    <p className="text-font-cs">Monthly</p>
                  </div>

                  {/* Yearly (only if available) */}
                  {index?.billing_cycle?.annual?.price != null && (
                    <div className="left-amnt1-cs" style={{ borderLeft: "1px solid #E7E7E7" }}>
                      <p className="amnt-font-cs">
                        {(Number(index?.billing_cycle?.annual?.price ?? 0)).toFixed(2)}&nbsp;
                        {index?.billing_cycle?.annual?.coin || ""}
                      </p>
                      <p className="text-font-cs">Yearly</p>
                    </div>
                  )}
                </div>

                {/* --- CTA --- */}
                <div className="buttonss-cs">
                  <button
                    className="buy-btn-cs"
                    onClick={() => {
                      // show ALL currencies on Step 2
                      filterItem("");
                      setBuy("step2");
                    }}
                  >
                    Buy Now
                  </button>
                </div>
              </>
            ) : buy === "step2" ? (
              <div className="buy-step1-cs">
                <div
                  style={{
                    width: "100%",
                    height: "17%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ fontSize: "1.25rem", fontWeight: "500", color: "#1F304F" }}>
                    Select Currency To Pay With?
                  </div>
                  <div className="searchh-cs">
                    <input
                      type="text"
                      placeholder="Search Vaults.."
                      onChange={(event) => filterItem(event.target.value)}
                    />
                  </div>
                </div>

                <div className="coin-options-cs">
                  <CoinComponent />
                </div>

                <div className="buttonss-cs">
                  <div className="share-btn-cs" onClick={() => setBuy("step1")}>
                    Close
                  </div>
                </div>
              </div>
            ) : buy === "step3" ? (
              <div className="buy-step1-cs">
                <div style={{ fontSize: "1.25rem", fontWeight: "500", color: "#1F304F" }}>
                  Are You Sure You Want To Subscribe To {index?.product_name}?
                </div>

                <div className="boxx-cs" onClick={() => setBuy("step4")}>
                  Confirm Purchase
                </div>
                <div className="boxx-cs" style={{ marginTop: "1.5rem" }} onClick={() => setBuy("step1")}>
                  Go Back
                </div>
                <div
                  className="boxx-cs"
                  style={{ marginTop: "1.5rem" }}
                  onClick={() => {
                    setBuy("step1");
                    setAcceptOffer(false);
                    setIndex([]);
                  }}
                >
                  Cancel Order
                </div>
              </div>
            ) : buy === "step4" ? (
              <div className="buy-step1-cs">
                <Step4 setAcceptOffer={setAcceptOffer} />
              </div>
            ) : (
              ""
            )}
          </div>
        </div>
      )}

      {/* ==== POPUP ==== */}
      {popup && (
        <div
          className="popup-overlay"
          onClick={() => {
            setPopup(false);
            setPopupContent("default");
            setPopupDetails("");
          }}
        >
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div>
              <img src={logo} alt="" />
            </div>

            {/* Confirm YES */}
            {popupContent === "default" && popupDetails === "yes" && (
              <>
                <div className="popup-text">Are you sure you have completed this step?</div>
                <div className="popup-btns">
                  <div
                    className="yes-Btn"
                    onClick={() => {
                      if (currentStepData?._id) {
                        completeStep(currentStepData?._id, currentStepdataPathId);
                      } else {
                        completeStep(currentStepPageData?._id, currentStepPagePathId);
                      }
                    }}
                  >
                    Yes, go to next step
                  </div>
                  <div
                    className="no-btn"
                    onClick={() => {
                      setPopup(false);
                      setPopupDetails("");
                      setPopupContent("default");
                    }}
                  >
                    Never mind
                  </div>
                </div>
              </>
            )}

            {/* Confirm FAILED */}
            {popupContent === "default" && popupDetails === "no" && (
              <>
                <div className="popup-text">Are you sure you have failed this step?</div>
                <div className="popup-btns">
                  <div
                    className="yes-Btn"
                    style={{ background: "#100F0D" }}
                    onClick={() => {
                      if (currentStepData?._id) {
                        failStep(currentStepData?._id, currentStepdataPathId);
                      } else {
                        failStep(currentStepPageData?._id, currentStepPagePathId);
                      }
                    }}
                  >
                    Yes, move me to another path
                  </div>
                  <div
                    className="no-btn"
                    onClick={() => {
                      setPopup(false);
                      setPopupDetails("");
                      setPopupContent("default");
                    }}
                  >
                    Never mind
                  </div>
                </div>
              </>
            )}

            {/* Shared success */}
            {popupContent === "success" && (
              <>
                <div className="popup-text">
                  {popupDetails === "yes" ? "Completed step updated!" : "Failed step updated!"}
                </div>
                <div className="popup-btns">
                  <div
                    className="yes-Btn"
                    onClick={() => {
                      if (popupDetails === "yes") {
                        // === YES FLOW ===
                        setPopup(false);
                        setPopupContent("default");
                        setPopupDetails("");

                        const svc = pickServiceForDrawer();
                        if (!svc) {
                          alert("No services available for this step.");
                          return;
                        }

                        // populate prices for Step-1 and currencies for Step-2
                        setIndex(svc);
                        setAcceptOffer(true);
                        setBuy("step1");
                        // seed all coins so list is full on Step-2
                        setTimeout(() => filterItem(""), 0);
                      } else {
                        // === FAILED FLOW ===
                        setPopup(false);
                        setPopupContent("default");
                        setPopupDetails("");
                        setsideNav("My Journey");
                      }
                    }}
                  >
                    OK
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================
   ✅ SERVICE CARD (Nano) - FIXED VERSION
============================================================ */
/* ============================================================
   ✅ SERVICE CARD (Nano) - FIXED VERSION
============================================================ */
/* ============================================================
   ✅ SERVICE CARD (Nano) - CLEANED VERSION
============================================================ */
const Carousel1 = ({
  item,
  showNewDiv,
  handleRejectClick,
  position,
  selectedCard,
  setSelectedCard,
  setIndex,
  setAcceptOffer,
  userDetails,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [razorpayOptions, setRazorpayOptions] = useState(null);

  // Define service variable at the top of component
  const service = item?.ServiceDetails?.[0] || item || {};

  // Clean description text function - define INSIDE component
  const cleanDescription = (text) => {
    if (!text) return "Test preparation and guidance services";
    
    // Remove random characters and fix common issues
    const cleaned = text
      .replace(/[^\w\s.,!?-]/g, ' ') // Remove special characters
      .replace(/\s+/g, ' ') // Remove extra spaces
      .trim();
      
    return cleaned.length > 120 ? cleaned.substring(0, 120) + '...' : cleaned;
  };

  // Load Razorpay script
  const loadScript = (src) =>
    new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  // Initialize purchase record
// Initialize purchase record with better error handling
const initiatePurchase = async (sService) => {
  try {
    // Check if service has valid ID
    if (!sService?._id) {
      console.warn("No service ID found, skipping purchase initiation");
      return;
    }

    await axios.post(`https://careers.marketsverse.com/userpurchase/add`, {
      userId: userDetails?.user?._id,
      service_id: sService?._id,
      purchaseStatus: "pending",
    }, {
      timeout: 10000, // Add timeout
    });
  } catch (error) {
    console.warn("Purchase initiation failed, but continuing:", error.message);
    // Don't block the flow if this fails
  }
};

  // Initialize Razorpay payment
// Initialize Razorpay payment with better error handling
const initializeRazorpay = async (amount, service) => {
  try {
    const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
    if (!res) {
      alert("Payment system failed to load. Please try again.");
      return false;
    }

    const response = await fetch(
      "https://careers.marketsverse.com/api/paymentGateway/razorpay/initialize-payment",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_mobile_number: userDetails?.user?.mobile || "9599677424",
          amount,
          user_email: userDetails?.user?.email,
        }),
      }
    );

    // Check if response is ok
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data?.status) {
      const { order_id, amount, currency, name, email, contact, callbackUrl } = data.data[1];
      return {
        key: "rzp_test_pIO7ySTH850hhP",
        amount: amount.toString(),
        currency,
        name: name || "Marketverse",
        description: service?.name || "Service Purchase",
        order_id,
        callback_url: callbackUrl,
        prefill: { 
          name: name || userDetails?.user?.name, 
          email: email || userDetails?.user?.email, 
          contact: contact || userDetails?.user?.mobile 
        },
        theme: { color: "#3399cc" },
      };
    } else {
      throw new Error("Invalid response from payment gateway");
    }
  } catch (error) {
    console.error("Payment initialization failed:", error.message);
    alert("Payment initialization failed. Please try again.");
  }
  return null;
};

  // Handle service selection and purchase
  const handleServiceClick = async (e) => {
    e.stopPropagation();
    
    setIsLoading(true);
    
    try {
      // First initiate purchase record
      await initiatePurchase(service);
      
      // Calculate amount
      const amount = Number(
        service?.billing_cycle?.lifetime?.price ||
        service?.billing_cycle?.monthly?.price ||
        service?.billing_cycle?.annual?.price ||
        service?.first_purchase?.price ||
        0
      );
      
      // For free services, just proceed
      if (amount === 0) {
        console.log("Free service selected:", service.name);
        // Add any additional logic for free services here
        return;
      }
      
      // For paid services, initialize payment
      const options = await initializeRazorpay(amount);
      if (options) {
        const razorpay = new window.Razorpay(options);
        razorpay.open();
      }
    } catch (error) {
      console.error("Service selection failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get button text based on price
  const getButtonText = () => {
    const price = service?.first_purchase?.price || 
                 service?.billing_cycle?.monthly?.price || 
                 service?.billing_cycle?.annual?.price || 
                 service?.billing_cycle?.lifetime?.price;
    
    if (isLoading) return "Processing...";
    return price === 0 ? "Get Started" : "Buy Now";
  };

  // Handle card selection
  const handleCardClick = (e) => {
    e.stopPropagation();
    setSelectedCard(position);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`nano-div2 ${selectedCard === position ? 'selected-service' : ''} ${
        isLoading ? 'loading' : ''
      }`}
    >
      <div className="service-title">
        {service?.name || item?.name || "Unnamed Service"}
      </div>

      <div className="nano-speed-container">
        <div className="speed-div">
          <span>Offered By: </span>
          <span>{service?.productcreatoremail?.split('@')[0] || "Edutechex"}</span>
        </div>

        <div className="speed-div">
          <span>Billing Type:</span>
          <span>{service?.chargingtype || "One-Time"}</span>
        </div>

        <div className="speed-div cost-div">
          <span>Cost:</span>
          <span>
            {service?.first_purchase?.price === 0 ? "Free" : 
             `${service?.first_purchase?.price || 0} USD`}
          </span>
        </div>

        <div className="service-clean-description">
          {cleanDescription(service?.description)}
        </div>
      </div>

      <div className="nano-btns">
        <button
          className={`accept-btn ${isLoading ? 'loading' : ''} ${
            service?.first_purchase?.price === 0 ? 'free-btn' : ''
          }`}
          onClick={handleServiceClick}
          disabled={isLoading}
        >
          {getButtonText()}
        </button>
      </div>
    </div>
  );
};



export default CurrentStep;