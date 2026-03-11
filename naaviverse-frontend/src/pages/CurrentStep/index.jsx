import React, { useEffect, useState } from "react";
import "./currentstep.scss";
import { useCoinContextData } from "../../context/CoinContext";
import { useStore } from "../../components/store/store.ts";
import axios from "axios";
import Step4 from "../dashboard/MallProduct/Step4.jsx";
import CoinComponent from "../dashboard/MallProduct/CoinComponent.jsx";
import { useNavigate } from "react-router-dom";

// images
import logo from "../../static/images/logo.svg";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

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

  const [macroView, setMacroView] = useState("");
  const [microView, setMicroView] = useState({});
  const [nanoView, setNanoView] = useState([]);
  const [microServices, setMicroServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
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
  const [popupContent, setPopupContent] = useState("default");
  const [popupDetails, setPopupDetails] = useState("");
  const [currentStepPagePathId, setCurrentStepPagePathId] = useState("");
  const [selectedCard, setSelectedCard] = useState(0);

  const [cards, setCards] = useState(productDataArray);
  const [centerIndex, setCenterIndex] = useState(0);
  const [acceptOffer, setAcceptOffer] = useState(false);
  const [userData, setUserData] = useState([]);

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
    return Object.values(microView).filter(Boolean).join("\n\n");
  };

  // Error boundary
  useEffect(() => {
    const handleUnhandledError = (error) => {
      console.error("Unhandled error:", error);
    };
    window.addEventListener("error", handleUnhandledError);
    window.addEventListener("unhandledrejection", handleUnhandledError);
    return () => {
      window.removeEventListener("error", handleUnhandledError);
      window.removeEventListener("unhandledrejection", handleUnhandledError);
    };
  }, []);

  // User data fetch
  useEffect(() => {
    if (!userDetails) return;
    const userEmail = userDetails?.user?.email || userDetails?.email;
    if (!userEmail) {
      console.warn("No user email found");
      return;
    }
    axios
      .get(`${BASE_URL}/api/users/get/${userEmail}`)
      .then((res) => {})
      .catch((err) => console.error(err));
  }, []);

  // Fetch step data
  useEffect(() => {
    const stepId = localStorage.getItem("selectedStepId");
    const pathId = selectedPathId || localStorage.getItem("selectedPathId");

    if (!stepId || !pathId) return;

    axios
      .get(`${BASE_URL}/api/userpaths/steps?pathId=${pathId}`)
      .then((res) => {
        const steps = res?.data?.data?.steps || [];
        if (!Array.isArray(steps)) return;

        const step = steps.find(
          (s) => s?._id === stepId || s?.step_id === stepId
        );
        if (step) {
          setCurrentStepPageData(step);
          setCurrentStepPagePathId(pathId);
        }
      })
      .catch((err) => console.error("❌ Error fetching path steps:", err));
  }, [selectedPathId]);

  // Fetch AI step views
  useEffect(() => {
    const loadStepViews = async () => {
      const stepId = localStorage.getItem("selectedStepId");
      const pathId = selectedPathId || localStorage.getItem("selectedPathId");
      if (!stepId || !pathId) return;

      try {
        const res = await axios.get(
          `${BASE_URL}/api/stepviews?pathId=${pathId}&stepId=${stepId}`
        );
        const data = res?.data?.data || {};
        setMacroView(data.macroView ?? "No macro insights available");
        setMicroView(data.microView ?? {});
        setNanoView(data.nanoView || null);
      } catch (err) {
        console.error("❌ Error fetching AI step views:", err);
      }
    };
    loadStepViews();
  }, [selectedPathId]);

  // Reload services
  const reloadServices = async () => {
    const stepId = localStorage.getItem("selectedStepId");
    if (!stepId) return;

    try {
      const res = await axios.get(
        `${BASE_URL}/api/services/by-step?step_id=${stepId}`
      );
      const list = Array.isArray(res?.data?.data) ? res.data.data : [];
      setStepServices(list);
    } catch (err) {
      console.error("❌ Service reload failed:", err.message);
      setStepServices([]);
    }
  };

  // Pick service after stepServices updates
  useEffect(() => {
    if (!acceptOffer) return;
    if (!stepServices || stepServices.length === 0) return;

    const svc = pickServiceForDrawer();
    if (!svc) {
      alert("No services available for this step.");
      return;
    }
    setIndex(svc);
    setBuy("step1");
  }, [stepServices]);

  const pickServiceForDrawer = () => {
    try {
      if (!Array.isArray(stepServices) || stepServices.length === 0) return null;
      const selected = stepServices[selectedCard];
      if (selected?._id) return selected;
      const first = stepServices[0];
      if (first?._id) return first;
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
        s.service_name ===
          "Assess – CBSE → IBDP Readiness (Curriculum Based)"
    );
  }, [stepServices]);

  // Complete step
  const completeStep = async (stepid) => {
    const pathId = selectedPathId || localStorage.getItem("selectedPathId");
    const email = userDetails?.email || userDetails?.user?.email;

    try {
      await axios.put(`${BASE_URL}/api/userpaths/completeStep`, {
        email,
        pathId,
        step_id: stepid,
      });
      setPopupContent("success");
      setPopupDetails("yes");
    } catch (error) {
      console.log("❌ COMPLETE STEP ERROR:", error.response?.data);
      setPopupContent("success");
      setPopupDetails("yes");
    }
  };

  // Fail step
  const failStep = async (stepid) => {
    const pathId = selectedPathId || localStorage.getItem("selectedPathId");
    const email = userDetails?.email || userDetails?.user?.email;

    try {
      await axios.put(`${BASE_URL}/api/userpaths/failedStep`, {
        email,
        pathId,
        step_id: stepid,
      });
      setPopupContent("success");
      setPopupDetails("no");
    } catch (error) {
      console.log("❌ FAILED STEP ERROR:", error.response?.data);
      setPopupContent("success");
      setPopupDetails("no");
    }
  };

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
      {/* HEADER */}
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
      </div>

      {/* CONTENT */}
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

          {/* Micro */}
          <div className="micro-view-box">
            <div className="micro-text">Micro View:</div>
            <div className="micro-content">
              <div className="micro-step-title">
                {currentStepData?.name || currentStepPageData?.name}
              </div>
              <div className="micro-scroll-area">
                <div className="micro-description">
                  {currentStepPageData?.micro_description
                    ? currentStepPageData.micro_description
                        .split("\n")
                        .map((line, i) => <div key={i}>• {line}</div>)
                    : getMicroText(microView)}
                </div>
              </div>
            </div>
          </div>

          {/* Nano */}
          <div className="nano-view-box">
            <div className="nano-text">Nano View:</div>
            <div className="nano-content">
              <div className="step-text">
                Work 1-to-1 With A Naavi-Certified Expert For{" "}
                <span>{currentStepData?.name || currentStepPageData?.name}</span>
              </div>
              <div className="nano-scroll-area">
                <div className="nano-highlight-box">
                  {nanoView?.description ? (
                    nanoView.description
                      .split("\n")
                      .map((line, i) => <div key={i}>• {line}</div>)
                  ) : (
                    <div>No Nano Actions Available</div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* FOOTER */}
      <center>
        <div className="cs-footer1">
          <div onClick={() => { setPopup(true); setPopupDetails("no"); }}>
            Failed
          </div>
          <div>Did you complete this step?</div>
          <div onClick={() => { setPopup(true); setPopupDetails("yes"); }}>
            Yes
          </div>
        </div>
      </center>

      {/* BUY DRAWER */}
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
                <div className="amount-details-cs">
                  <div className="left-amnt-cs" style={{ borderRight: "1px solid #E7E7E7" }}>
                    <p className="amnt-font-cs">
                      {(Number(index?.first_purchase?.price ?? 0)).toFixed(2)}&nbsp;
                      {index?.first_purchase?.coin || ""}
                    </p>
                    <p className="text-font-cs">{index?.first_purchase?.coin ? "First Purchase" : ""}</p>
                  </div>
                  <div className="left-amnt1-cs">
                    <p className="amnt-font-cs">
                      {(Number(index?.billing_cycle?.monthly?.price ?? 0)).toFixed(2)}&nbsp;
                      {index?.billing_cycle?.monthly?.coin || ""}
                    </p>
                    <p className="text-font-cs">Monthly</p>
                  </div>
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
                <div className="buttonss-cs">
                  <button
                    className="buy-btn-cs"
                    onClick={() => { filterItem(""); setBuy("step2"); }}
                  >
                    Buy Now
                  </button>
                </div>
              </>
            ) : buy === "step2" ? (
              <div className="buy-step1-cs">
                <div style={{ width: "100%", height: "17%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
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
                  <div className="share-btn-cs" onClick={() => setBuy("step1")}>Close</div>
                </div>
              </div>
            ) : buy === "step3" ? (
              <div className="buy-step1-cs">
                <div style={{ fontSize: "1.25rem", fontWeight: "500", color: "#1F304F" }}>
                  Are You Sure You Want To Subscribe To {index?.product_name}?
                </div>
                <div className="boxx-cs" onClick={() => setBuy("step4")}>Confirm Purchase</div>
                <div className="boxx-cs" style={{ marginTop: "1.5rem" }} onClick={() => setBuy("step1")}>Go Back</div>
                <div className="boxx-cs" style={{ marginTop: "1.5rem" }} onClick={() => { setBuy("step1"); setAcceptOffer(false); setIndex([]); }}>
                  Cancel Order
                </div>
              </div>
            ) : buy === "step4" ? (
              <div className="buy-step1-cs">
                <Step4 setAcceptOffer={setAcceptOffer} />
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* POPUP */}
      {popup && (
        <div
          className="popup-overlay"
          onClick={() => { setPopup(false); setPopupContent("default"); setPopupDetails(""); }}
        >
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div>
              <img src={logo} alt="" />
            </div>

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
                        completeStep(currentStepPageData?._id, selectedPathId);
                      }
                    }}
                  >
                    Yes, go to next step
                  </div>
                  <div className="no-btn" onClick={() => { setPopup(false); setPopupDetails(""); setPopupContent("default"); }}>
                    Never mind
                  </div>
                </div>
              </>
            )}

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
                        failStep(currentStepPageData?._id, selectedPathId);
                      }
                    }}
                  >
                    Yes, move me to another path
                  </div>
                  <div className="no-btn" onClick={() => { setPopup(false); setPopupDetails(""); setPopupContent("default"); }}>
                    Never mind
                  </div>
                </div>
              </>
            )}

            {popupContent === "success" && (
              <>
                <div className="popup-text">
                  {popupDetails === "yes" ? "Completed step updated!" : "Failed step updated!"}
                </div>
                <div className="popup-btns">
                  <div
                    className="yes-Btn"
                    onClick={async () => {
                      if (popupDetails === "yes") {
                        setPopup(false);
                        setPopupContent("default");
                        setPopupDetails("");
                        await reloadServices();
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
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================
   SERVICE CARD (Nano)
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

  const service = item?.ServiceDetails?.[0] || item || {};

  const cleanDescription = (text) => {
    if (!text) return "";
    const cleaned = text
      .replace(/[^\w\s.,!?-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return cleaned.length > 120 ? cleaned.substring(0, 120) + "..." : cleaned;
  };

  const loadScript = (src) =>
    new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const initiatePurchase = async (sService) => {
    try {
      if (!sService?._id) return;
      await axios.post(
        `https://careers.marketsverse.com/userpurchase/add`,
        {
          userId: userDetails?.user?._id,
          service_id: sService?._id,
          purchaseStatus: "pending",
        },
        { timeout: 10000 }
      );
    } catch (error) {
      console.warn("Purchase initiation failed, but continuing:", error.message);
    }
  };

  const initializeRazorpay = async (amount, service) => {
    try {
      const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      if (!res) { alert("Payment system failed to load. Please try again."); return false; }

      const response = await fetch(
        `${BASE_URL}/api/paymentGateway/razorpay/initialize-payment`,
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

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

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
            contact: contact || userDetails?.user?.mobile,
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

  const handleServiceClick = async (e) => {
    e.stopPropagation();
    setIsLoading(true);
    try {
      await initiatePurchase(service);
      const amount = Number(
        service?.billing_cycle?.lifetime?.price ||
        service?.billing_cycle?.monthly?.price ||
        service?.billing_cycle?.annual?.price ||
        service?.first_purchase?.price ||
        0
      );
      if (amount === 0) return;
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

  const getButtonText = () => {
    const price =
      service?.first_purchase?.price ||
      service?.billing_cycle?.monthly?.price ||
      service?.billing_cycle?.annual?.price ||
      service?.billing_cycle?.lifetime?.price;
    if (isLoading) return "Processing...";
    return price === 0 ? "Get Started" : "Buy Now";
  };

  const handleCardClick = (e) => {
    e.stopPropagation();
    setSelectedCard(position);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`nano-div2 ${selectedCard === position ? "selected-service" : ""} ${isLoading ? "loading" : ""}`}
    >
      <div className="service-title">
        {service?.name || item?.name || "Unnamed Service"}
      </div>

      <div className="nano-speed-container">
        <div className="speed-div">
          <span>Offered By: </span>
          <span>{service?.productcreatoremail?.split("@")[0] || "Edutechex"}</span>
        </div>
        <div className="speed-div">
          <span>Billing Type:</span>
          <span>{service?.chargingtype || "One-Time"}</span>
        </div>
        <div className="speed-div cost-div">
          <span>Cost:</span>
          <span>
            {service?.first_purchase?.price === 0
              ? "Free"
              : `${service?.first_purchase?.price || 0} USD`}
          </span>
        </div>
        <div className="service-clean-description">
          {cleanDescription(service?.description)}
        </div>
      </div>

      <div className="nano-btns">
        <button
          className={`accept-btn ${isLoading ? "loading" : ""} ${service?.first_purchase?.price === 0 ? "free-btn" : ""}`}
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