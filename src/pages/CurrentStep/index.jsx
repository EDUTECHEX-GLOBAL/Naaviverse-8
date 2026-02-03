import React, { useEffect, useState } from "react";
import "./currentstep.scss";
import { useCoinContextData } from "../../context/CoinContext";
import { useStore } from "../../components/store/store.ts";
import axios from "axios";
import Step4 from "../dashboard/MallProduct/Step4.jsx";
import CoinComponent from "../dashboard/MallProduct/CoinComponent.jsx";


import { useNavigate } from "react-router-dom";

// images
import dummy from "../JourneyPage/dummy.svg";
import edutech from "./edutech.svg";
import resory from "./resory.svg";
import lek from "./lek.svg";
import logo from "../../static/images/logo.svg";

const demoMicroServices = [
  {
    id: "svc1",
    name: "IBDP Readiness Mentorship",
    description:
      "One-on-one guidance to help students transition smoothly from CBSE to IBDP.",
    provider: "EduTechX",
    access: "Appointment Based",
    cost: "₹3,000 / session",
  },
  {
    id: "svc2",
    name: "Curriculum Transition Plan",
    description:
      "Personalized roadmap covering subjects, assessments, and skill gaps.",
    provider: "Naavi Mentors",
    access: "Subscription Required",
    cost: "Included in Subscription",
  },
  {
    id: "svc3",
    name: "Academic Skill Assessment",
    description:
      "Detailed evaluation of writing, reasoning, and conceptual readiness.",
    provider: "IB Experts Group",
    access: "One-Time",
    cost: "₹5,000",
  },
  {
    id: "svc4",
    name: "Parent Guidance Session",
    description:
      "Helps parents understand IB expectations, workload, and long-term planning.",
    provider: "Naavi Certified Mentor",
    access: "Appointment Based",
    cost: "₹2,000 / session",
  },
];

const demoNanoServices = [
  {
    id: 1,
    title: "1-to-1 Academic Foundation Execution",
    expert: "Naavi Certified Math & Physics Mentor",
    scope: [
      "Personalized study plan",
      "Weekly 1-to-1 sessions",
      "Assignments & problem-solving",
      "Progress tracking"
    ],
    duration: "4 Weeks",
    outcome: "Strong Math & Physics foundation",
    price: "₹15,000"
  }
];


const CurrentStep = ({ productDataArray, selectedPathId, showSelectedPath, selectedPath }) => {
  const userDetails = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();
  useEffect(() => {
    const rawUser = localStorage.getItem("user");
    if (rawUser) {
      console.log("AUTH CHECK:", JSON.parse(rawUser));
    }
  }, []);

  const navigate = useNavigate();

  // Controls which micro item is open
  // const [openKey, setOpenKey] = useState(null);
  // const formatMicroTitle = (key) => {
  //   const map = {
  //     grade: "Based On Your Grade",
  //     stream: "Based On Your Stream",
  //     curriculum: "Based On Your Curriculum",
  //     gpa: "Based On Your Grade Point Avg",
  //     financialPosition: "Based On Your Financial Position",
  //     personality: "Based On Your Personality",
  //   };
  //   return map[key] || key;
  // };


  const [macroView, setMacroView] = useState("");
  const [microView, setMicroView] = useState({});
  const [nanoView, setNanoView] = useState([]);
  const [showServicePopup, setShowServicePopup] = useState(false);
  // const [selectedService, setSelectedService] = useState(null);
  const [microServices, setMicroServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  // ===================== NANO VIEW STATES =====================
  const [showNanoModal, setShowNanoModal] = useState(false);
  const [selectedNanoService, setSelectedNanoService] = useState(null);
  const [showNanoCheckout, setShowNanoCheckout] = useState(false);





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
  const [stepView, setStepView] = useState(null);

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
  const getMicroText = (microView) => {
    if (!microView) return "";

    return Object.values(microView)
      .filter(Boolean)
      .join("\n\n");
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



  useEffect(() => {
    if (!showServicePopup || !currentStepData?._id) return;

    const fetchMicroServices = async () => {
      try {
        setServicesLoading(true);

        const res = await axios.get(
          `http://localhost:4545/api/services`,
          {
            params: {
              step_id: currentStepData._id,
              view: "micro",
            },
          }
        );

        setMicroServices(res.data || []);
      } catch (error) {
        console.error("Failed to fetch micro services", error);
        setMicroServices([]);
      } finally {
        setServicesLoading(false);
      }
    };

    fetchMicroServices();
  }, [showServicePopup, currentStepData?._id]);





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
    const pathId = selectedPathId || localStorage.getItem("selectedPathId");

    console.log("🔥 Loaded Path ID:", pathId);
    console.log("🔥 Selected Step ID:", stepId);

    if (!stepId || !pathId) return;

    axios
      .get(`/api/userpaths/steps?pathId=${pathId}`)
      .then((res) => {
        console.log("🔥 STEPS RESPONSE:", res.data);

        // ✅ FIX: steps are inside data.steps
        const steps = res?.data?.data?.steps || [];

        if (!Array.isArray(steps)) {
          console.error("❌ steps is not an array:", steps);
          return;
        }

        const step = steps.find(
          (s) => s?._id === stepId || s?.step_id === stepId
        );

        if (step) {
          console.log("✅ STEP FOUND FROM PATH:", step);
          setCurrentStepPageData(step);
          setCurrentStepPagePathId(pathId);
        } else {
          console.warn("❌ Step not found in path");
        }
      })
      .catch((err) => {
        console.error("❌ Error fetching path steps:", err);
      });
  }, [selectedPathId]);

  /** ===================== FETCH AI STEP VIEWS (PATH BASED) ====================== **/
  useEffect(() => {
    const loadStepViews = async () => {
      const stepId = localStorage.getItem("selectedStepId");
      const pathId = selectedPathId || localStorage.getItem("selectedPathId");

      if (!stepId || !pathId) return;

      try {
        const res = await axios.get(
          `/api/stepviews?pathId=${pathId}&stepId=${stepId}`
        );

        console.log("🔥 AI STEP VIEWS (PATH):", res.data?.data);

        const data = res?.data?.data || {};

        // ✅ FIX: allow empty strings but avoid undefined
        setMacroView(data.macroView ?? "No macro insights available");
        setMicroView(data.microView ?? {});
       setNanoView(data.nanoView || null);

      } catch (err) {
        console.error("❌ Error fetching AI step views:", err);
      }
    };

    loadStepViews();
  }, [selectedPathId]);



  /** ===================== RELOAD SERVICES FOR CURRENT STEP ====================== **/
  const reloadServices = async () => {
    const stepId = localStorage.getItem("selectedStepId");
    if (!stepId) return;

    try {
      const res = await axios.get(
        `http://localhost:4545/api/services/by-step?step_id=${stepId}`
      );

      // ✅ services are FLAT objects
      const list = Array.isArray(res?.data?.data) ? res.data.data : [];

      console.log("✅ Services loaded:", list);
      setStepServices(list);
    } catch (err) {
      console.error("❌ Service reload failed:", err.message);
      setStepServices([]);
    }
  };

  /** ===================== PICK SERVICE AFTER stepServices UPDATES ====================== **/
  useEffect(() => {
    if (!acceptOffer) return;
    if (!stepServices || stepServices.length === 0) return;

    console.log("🔍 stepServices ready");

    const svc = pickServiceForDrawer();
    if (!svc) {
      alert("No services available for this step.");
      return;
    }

    setIndex(svc);       // ✅ svc is now a REAL service
    setBuy("step1");     // drawer opens correctly
  }, [stepServices]);



  /** ===================== DESCRIPTION RESOLVERS ====================== **/
  // useEffect(() => {
  //   if (userData?.length > 0 && currentStepPageData?.length > 0) {
  //     const userGrade = userData[0]?.grade;
  //     const matchGrade = currentStepPageData?.gradeData?.find(
  //       (g) => g?.grade === userGrade
  //     );
  //     setGradeDescription(matchGrade?.description || "");

  //     const userStream = userData[0]?.stream;
  //     const matchStream = currentStepPageData?.streamData?.find(
  //       (s) => s?.stream === userStream
  //     );
  //     setStreamDescription(matchStream?.description || "");

  //     const userCurriculum = userData[0]?.curriculum;
  //     const matchCurriculum = currentStepPageData?.curriculumData?.find(
  //       (c) => c?.curriculum === userCurriculum
  //     );
  //     setCurriculumDescription(matchCurriculum?.description || "");

  //     const userGradePoint = userData[0]?.performance;
  //     const isPartialMatch = (a, b) => {
  //       const x = a?.replace(/\s/g, "");
  //       const y = b?.replace(/\s/g, "");
  //       return x?.includes(y) || y?.includes(x);
  //     };
  //     const matchGPA = currentStepPageData?.gradePointAverageData?.find((g) =>
  //       isPartialMatch(g?.gradePointAverage, userGradePoint)
  //     );
  //     setGradePointDescription(matchGPA?.description || "");

  //     const userFinancial = userData[0]?.financialSituation;
  //     const matchFin = currentStepPageData?.financialData?.find(
  //       (f) => f?.financialSituation === userFinancial
  //     );
  //     setFinancialDescription(matchFin?.description || "");

  //     const userPersonality = userData[0]?.personality;
  //     const matchPers = currentStepPageData?.personalityData?.find(
  //       (p) => p?.personality === userPersonality
  //     );
  //     setPersonalityDescription(matchPers?.description || "");
  //   }
  // }, [userData, currentStepPageData]);

  /** ===================== helpers ====================== **/
  const pickServiceForDrawer = () => {
    try {
      if (!Array.isArray(stepServices) || stepServices.length === 0) {
        console.warn("❌ No stepServices available");
        return null;
      }

      // 1️⃣ Selected card
      const selected = stepServices[selectedCard];
      if (selected?._id) {
        console.log("🎯 Using selected service:", selected.name);
        return selected;
      }

      // 2️⃣ Fallback to first service
      const first = stepServices[0];
      if (first?._id) {
        console.log("🎯 Using first service:", first.name);
        return first;
      }

      return null;
    } catch (err) {
      console.error("💥 pickServiceForDrawer error:", err);
      return null;
    }
  };


  const curriculumService = React.useMemo(() => {
    if (!Array.isArray(stepServices)) return null;

    return stepServices.find(
      (s) =>
        s.service_code === "ASSESS_CBSE_IBDP_CURRICULUM" ||
        s.service_name === "Assess – CBSE → IBDP Readiness (Curriculum Based)"
    );
  }, [stepServices]);



  /** ===================== COMPLETE STEP (YES FLOW) ====================== **/
  const completeStep = async (stepid) => {
    const pathId = selectedPathId || localStorage.getItem("selectedPathId");
    const email = userDetails?.email || userDetails?.user?.email;

    console.log("📤 SENDING TO BACKEND:", {
      email,
      pathId,
      step_id: stepid
    });

    try {
      const res = await axios.put(
        "http://localhost:4545/api/userpaths/completeStep",
        {
          email,
          pathId,
          step_id: stepid
        }
      );

      setPopupContent("success");
      setPopupDetails("yes");
    } catch (error) {
      console.log("❌ COMPLETE STEP ERROR:", error.response?.data);
      setPopupContent("success");
      setPopupDetails("yes");
    }
  };

  /** ===================== FAIL STEP (FAILED FLOW) ====================== **/
  const failStep = async (stepid) => {
    const pathId = selectedPathId || localStorage.getItem("selectedPathId");
    const email = userDetails?.email || userDetails?.user?.email;

    console.log("📤 SENDING FAILED STEP:", {
      email,
      pathId,
      step_id: stepid
    });

    try {
      const res = await axios.put(
        "http://localhost:4545/api/userpaths/failedStep",
        {
          email,
          pathId,
          step_id: stepid
        }
      );

      setPopupContent("success");
      setPopupDetails("no");
    } catch (error) {
      console.log("❌ FAILED STEP ERROR:", error.response?.data);
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
    <div className="currentstep">
      {/* ==== HEADER ==== */}
     <div className="cs-top-area">

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

        <div style={{ fontSize: 16, fontWeight: 300, }}>
          {currentStepData?.description}

        </div>
      </div>

      {/* ==== CONTENT ==== */}
   <div className="cs-content">
     <div className="overall-cs-content grid-layout">

          {/* Macro */}
          <div className="macro-view-box">
            <div className="macro-text">Macro View:</div>
            <div className="macro-content">
              <div className="step-text">
                {currentStepData?.name || currentStepPageData?.name}
              </div>
              <div className="macro-text-div">
                {currentStepPageData?.macro_description ||
                  currentStepPageData?.description ||
                  macroView?.description ||
                  ""}
              </div>



            </div>
          </div>

          {/* ================= MICRO VIEW ================= */}
          <div className="micro-view-box">
            <div className="micro-text">Micro View:</div>

            <div className="micro-content">

              {/* Step title (fixed) */}
              <div className="micro-step-title">
                {currentStepData?.name || currentStepPageData?.name}
              </div>

              {/* Scrollable content */}
              <div className="micro-scroll-area">
                <div className="micro-description">
                  {currentStepPageData?.micro_description
                    ? currentStepPageData.micro_description
                      .split("\n")
                      .map((line, i) => <div key={i}>• {line}</div>)
                    : getMicroText(microView)}
                </div>


                {/* CTA (opens popup) */}
                <div
                  className="micro-inline-cta"
                  onClick={() => setShowServicePopup(true)}
                >
                  To get more details, click here →
                </div>
              </div>

            </div>
          </div>

          {/* ================= MICRO GUIDANCE POPUP ================= */}
          {showServicePopup && (
            <div className="micro-guidance-popup-overlay">
              <div className="micro-guidance-popup">

                {/* Header */}
                <div className="popup-header">
                  <h3 className="popup-title">
                    {currentStepData?.name || currentStepPageData?.name}
                  </h3>

                  <span
                    className="popup-close"
                    onClick={() => setShowServicePopup(false)}
                  >
                    ✕
                  </span>
                </div>

                {/* Body */}
                <div className="popup-body">

                  {/* Loading */}
                  {servicesLoading && (
                    <div className="popup-loading">
                      Loading guidance options…
                    </div>
                  )}

                  {/* SERVICES LIST (HR DEMO) */}
                  {!servicesLoading && demoMicroServices.length > 0 && (
                    <div className="partner-grid">
                      {demoMicroServices.slice(0, 4).map((service) => (
                        <div className="service-card" key={service.id}>

                          <div>
                            <h4 className="service-name">{service.name}</h4>

                            <p className="service-description">
                              {service.description}
                            </p>

                            <div className="service-meta">
                              <div><strong>Provider:</strong> {service.provider}</div>
                              <div><strong>Access:</strong> {service.access}</div>
                              <div><strong>Cost:</strong> {service.cost}</div>
                            </div>
                          </div>

                          <button
                            className="service-cta"
                            onClick={() => {
                              setSelectedService(service);
                              setShowCheckout(true);
                            }}
                          >
                            START
                          </button>


                        </div>
                      ))}
                    </div>
                  )}

                </div>

              </div>
            </div>
          )}

          {showCheckout && selectedService && (
            <div className="micro-guidance-popup-overlay">
              <div className="checkout-popup">

                {/* Header */}
                <div className="popup-header">
                  <h3>Book Service</h3>
                  <span
                    className="popup-close"
                    onClick={() => setShowCheckout(false)}
                  >
                    ✕
                  </span>
                </div>

                {/* Body */}
                <div className="popup-body">

                  {/* Service Summary */}
                  <div className="checkout-card">
                    <h4>{selectedService.name}</h4>
                    <p>{selectedService.description}</p>

                    <div className="checkout-meta">
                      <div><strong>Provider:</strong> {selectedService.provider}</div>
                      <div><strong>Access:</strong> {selectedService.access}</div>
                      <div><strong>Cost:</strong> {selectedService.cost}</div>
                    </div>
                  </div>

                  {/* Booking Form */}
                  <div className="checkout-form">
                    <label>
                      Preferred Date
                      <input type="date" />
                    </label>

                    <label>
                      Preferred Time Slot
                      <select>
                        <option>10:00 AM – 11:00 AM</option>
                        <option>12:00 PM – 1:00 PM</option>
                        <option>4:00 PM – 5:00 PM</option>
                      </select>
                    </label>
                  </div>

                  {/* Payment Section */}
                  <div className="payment-box">
                    <div className="payment-row">
                      <span>Service Fee</span>
                      <span>{selectedService.cost}</span>
                    </div>

                    <button className="pay-now-btn">
                      Proceed to Payment
                    </button>
                  </div>

                </div>
              </div>
            </div>
          )}




          {/* Nano */}
          <div className="nano-view-box">
            <div className="nano-text">Nano View:</div>

<div className="nano-content">
  <div className="step-text">
    Work 1-to-1 With A Naavi-Certified Expert For{" "}
    <span>{currentStepData?.name || currentStepPageData?.name}</span>
  </div>

  {/* ✅ BIG SCROLL AREA */}
  <div className="nano-scroll-area">
    <div className="nano-highlight-box">
      {nanoView?.description ? (
        nanoView.description.split("\n").map((line, i) => (
          <div key={i}>• {line}</div>
        ))
      ) : (
        <div>No Nano Actions Available</div>
      )}
    </div>
  </div>

  {/* ✅ CTA FIXED */}
 
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
                        completeStep(currentStepData?._id, selectedPathId);
                      } else {
                        completeStep(currentStepPageData?._id, selectedPathId);;
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
                        failStep(currentStepData?._id, selectedPathId);
                      } else {
                        failStep(currentStepPageData?._id, selectedPathId);;
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
                  {popupDetails === "yes"
                    ? "Completed step updated!"
                    : "Failed step updated!"}
                </div>

                <div className="popup-btns">
                  <div
                    className="yes-Btn"
                    onClick={async () => {
                      if (popupDetails === "yes") {
                        setPopup(false);
                        setPopupContent("default");
                        setPopupDetails("");

                        console.log("🔄 Reloading services before opening drawer...");

                        await reloadServices();   // only reload here

                        // 🔥 open drawer but DO NOT pick service yet
                        setAcceptOffer(true);
                        setBuy("stepLoading");
                        filterItem("");
                      } else {
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
            )}  {/* END popupContent === "success" */}


          </div> {/* END modal-container */}
        </div> /* END popup-overlay */
      )}        {/* END popup && (...) */}
      {/* ================= SERVICE POPUP ================= */}
      {/* {showServicePopup && selectedService && (
  <div
    className="service-modal-overlay"
    onClick={() => setShowServicePopup(false)}
  >
    <div
      className="service-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="close-btn"
        onClick={() => setShowServicePopup(false)}
      >
        ✕
      </button>

      <h3>{selectedService.service_name}</h3>

      <p style={{ marginTop: "0.75rem" }}>
        {selectedService.service_description ||
          selectedService.description}
      </p>

      <div style={{ marginTop: "1rem", fontWeight: 600 }}>
        Price:{" "}
        {Number(selectedService.first_month_price || 0) === 0
          ? "Free"
          : `₹${selectedService.first_month_price}`}
      </div>

      <button
        className="primary-btn"
        style={{ marginTop: "1.5rem" }}
        onClick={() => {
          setSelectedCard(
            stepServices.findIndex(
              (s) => s._id === selectedService._id
            )
          );
          setShowServicePopup(false);
          setAcceptOffer(true);
          setBuy("step1");
        }}
      >
        Proceed
      </button>
    </div>
  </div>
)} */}

    </div> /* END main wrapper */
  );     // END return
};       // END CurrentStep component



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
      className={`nano-div2 ${selectedCard === position ? 'selected-service' : ''} ${isLoading ? 'loading' : ''
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
          className={`accept-btn ${isLoading ? 'loading' : ''} ${service?.first_purchase?.price === 0 ? 'free-btn' : ''
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