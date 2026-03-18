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

/* ─────────────────────────────────────────
   SKELETON PRIMITIVES
───────────────────────────────────────── */

/** A single shimmer bar */
const SkeletonBar = ({ width = "100%", height = "14px", style = {} }) => (
  <div
    className="sk-bar"
    style={{ width, height, borderRadius: "6px", ...style }}
  />
);

/** Multi-line text block skeleton */
const SkeletonText = ({ lines = 3 }) => (
  <div className="sk-text-block">
    {Array.from({ length: lines }).map((_, i) => (
      <SkeletonBar
        key={i}
        width={i === lines - 1 ? "65%" : "100%"}
        height="13px"
        style={{ marginBottom: i < lines - 1 ? "8px" : 0 }}
      />
    ))}
  </div>
);

/** Full view-card skeleton — matches the real card structure exactly */
const SkeletonViewCard = ({ accent }) => (
  <div className={`view-card sk-card sk-card--${accent}`}>
    <div className="vc-head">
      <SkeletonBar width="18px" height="18px" style={{ borderRadius: "50%", flexShrink: 0 }} />
      <SkeletonBar width="90px" height="13px" style={{ marginLeft: "8px" }} />
    </div>
    <div className="vc-body">
      <SkeletonBar width="55%" height="16px" style={{ marginBottom: "14px" }} />
      <SkeletonText lines={4} />
    </div>
    <div className="vc-foot">
      <SkeletonBar width="160px" height="36px" style={{ borderRadius: "8px" }} />
    </div>
  </div>
);

/** Page-head skeleton */
const SkeletonPageHead = () => (
  <div className="page-head sk-page-head">
    {/* breadcrumb + pill + back */}
    <div className="page-head-top-row">
      <SkeletonBar width="200px" height="13px" />
      <SkeletonBar width="110px" height="28px" style={{ borderRadius: "20px" }} />
      <SkeletonBar width="120px" height="28px" style={{ borderRadius: "20px" }} />
    </div>
    {/* title */}
    <SkeletonBar width="55%" height="32px" style={{ marginTop: "18px", marginBottom: "14px" }} />
    {/* description — 2 lines */}
    <SkeletonText lines={2} />
  </div>
);

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */

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

  // ── View states ──────────────────────────────────────────────────────────
  const [macroView, setMacroView]               = useState(null);
  const [microView, setMicroView]               = useState(null);
  const [nanoView,  setNanoView]                = useState(null);

  // ── Loading flags ─────────────────────────────────────────────────────────
  const [stepLoading,    setStepLoading]         = useState(true);
  const [viewsLoading,   setViewsLoading]        = useState(true);

  // ── Service / buy states ──────────────────────────────────────────────────
  const [microServices,  setMicroServices]       = useState([]);
  const [servicesLoading,setServicesLoading]     = useState(false);
  const [selectedService,setSelectedService]     = useState(null);
  const [showCheckout,   setShowCheckout]        = useState(false);
  const [showNanoModal,  setShowNanoModal]       = useState(false);
  const [selectedNanoService, setSelectedNanoService] = useState(null);
  const [showNanoCheckout,    setShowNanoCheckout]    = useState(false);

  const [totalStepsCount, setTotalStepsCount]   = useState(null);

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

  const [showNewDiv,           setShowNewDiv]           = useState(null);
  const [position1,            setPosition1]            = useState();
  const [position2,            setPosition2]            = useState();
  const [position3,            setPosition3]            = useState();
  const [currentStepPageData,  setCurrentStepPageData]  = useState(null);
  const [popup,                setPopup]                = useState(false);
  const [popupContent,         setPopupContent]         = useState("default");
  const [popupDetails,         setPopupDetails]         = useState("");
  const [currentStepPagePathId,setCurrentStepPagePathId]= useState("");
  const [selectedCard,         setSelectedCard]         = useState(0);

  const [cards,       setCards]       = useState(productDataArray);
  const [centerIndex, setCenterIndex] = useState(0);
  const [acceptOffer, setAcceptOffer] = useState(false);
  const [userData,    setUserData]    = useState([]);
  const [stepView,    setStepView]    = useState(null);

  /* ── Helpers ────────────────────────────────────────────────────────────── */

  const getMicroText = (mv) => {
    if (!mv) return null;
    const joined = Object.values(mv).filter(Boolean).join("\n\n");
    return joined || null;
  };

  /* ── Error boundary ─────────────────────────────────────────────────────── */
  useEffect(() => {
    const handleUnhandledError = (error) => console.error("Unhandled error:", error);
    window.addEventListener("error", handleUnhandledError);
    window.addEventListener("unhandledrejection", handleUnhandledError);
    return () => {
      window.removeEventListener("error", handleUnhandledError);
      window.removeEventListener("unhandledrejection", handleUnhandledError);
    };
  }, []);

  /* ── User data fetch ─────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!userDetails) return;
    const userEmail = userDetails?.user?.email || userDetails?.email;
    if (!userEmail) return;
    axios
      .get(`${BASE_URL}/api/users/get/${userEmail}`)
      .catch((err) => console.error(err));
  }, []);

  /* ── Fetch step data ─────────────────────────────────────────────────────── */
  useEffect(() => {
    const stepId = localStorage.getItem("selectedStepId");
    const pathId = selectedPathId || localStorage.getItem("selectedPathId");
    if (!stepId || !pathId) { setStepLoading(false); return; }

    setStepLoading(true);
    axios
      .get(`${BASE_URL}/api/userpaths/steps?pathId=${pathId}`)
      .then((res) => {
        const steps = res?.data?.data?.steps || [];
        if (!Array.isArray(steps)) return;

        setTotalStepsCount(steps.length);

        const step = steps.find((s) => s?._id === stepId || s?.step_id === stepId);
        if (step) {
          setCurrentStepPageData(step);
          setCurrentStepPagePathId(pathId);
        }
      })
      .catch((err) => console.error("❌ Error fetching path steps:", err))
      .finally(() => setStepLoading(false));
  }, [selectedPathId]);

  /* ── Fetch AI step views ─────────────────────────────────────────────────── */
  useEffect(() => {
    const loadStepViews = async () => {
      const stepId = localStorage.getItem("selectedStepId");
      const pathId = selectedPathId || localStorage.getItem("selectedPathId");
      if (!stepId || !pathId) { setViewsLoading(false); return; }

      setViewsLoading(true);
      try {
        const res = await axios.get(
          `${BASE_URL}/api/stepviews?pathId=${pathId}&stepId=${stepId}`
        );
        const data = res?.data?.data || {};
        setMacroView(data.macroView   || null);
        setMicroView(data.microView   || null);
        setNanoView(data.nanoView     || null);
      } catch (err) {
        console.error("❌ Error fetching AI step views:", err);
        setMacroView(null);
        setMicroView(null);
        setNanoView(null);
      } finally {
        setViewsLoading(false);
      }
    };
    loadStepViews();
  }, [selectedPathId]);

  /* ── Reload services ─────────────────────────────────────────────────────── */
  const reloadServices = async () => {
    const stepId = localStorage.getItem("selectedStepId");
    if (!stepId) return;
    try {
      const res = await axios.get(`${BASE_URL}/api/services/by-step?step_id=${stepId}`);
      const list = Array.isArray(res?.data?.data) ? res.data.data : [];
      setStepServices(list);
    } catch (err) {
      console.error("❌ Service reload failed:", err.message);
      setStepServices([]);
    }
  };

  /* ── Pick service after stepServices updates ─────────────────────────────── */
  useEffect(() => {
    if (!acceptOffer) return;
    if (!stepServices || stepServices.length === 0) return;
    const svc = pickServiceForDrawer();
    if (!svc) { alert("No services available for this step."); return; }
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
    } catch { return null; }
  };

  /* ── Complete / fail step ────────────────────────────────────────────────── */
  const completeStep = async (stepid) => {
    const pathId = selectedPathId || localStorage.getItem("selectedPathId");
    const email  = userDetails?.email || userDetails?.user?.email;
    try {
      await axios.put(`${BASE_URL}/api/userpaths/completeStep`, { email, pathId, step_id: stepid });
      setPopupContent("success");
      setPopupDetails("yes");
    } catch {
      setPopupContent("success");
      setPopupDetails("yes");
    }
  };

  const failStep = async (stepid) => {
    const pathId = selectedPathId || localStorage.getItem("selectedPathId");
    const email  = userDetails?.email || userDetails?.user?.email;
    try {
      await axios.put(`${BASE_URL}/api/userpaths/failedStep`, { email, pathId, step_id: stepid });
      setPopupContent("success");
      setPopupDetails("no");
    } catch {
      setPopupContent("success");
      setPopupDetails("no");
    }
  };

  function filterItem(text) {
    if (!text) { setfilteredcoins(mallCoindata || []); return; }
    const filtered = mallCoindata?.filter((c) =>
      c?.coinSymbol?.toLowerCase()?.includes(text.toLowerCase())
    );
    setfilteredcoins(filtered || []);
  }

  /* ── Back handler ────────────────────────────────────────────────────────── */
  const handleBackToJourney = () => {
    setCurrentStepData("");
    setCurrentStepDataLength("");
    setCurrentStepDataPathId("");
    setsideNav("My Journey");
    navigate("/dashboard/users/my-journey");
  };

  /* ── Derived values ──────────────────────────────────────────────────────── */
  const stepName       = currentStepData?.name || currentStepPageData?.name || null;
  const stepDesc       = currentStepPageData?.macro_description || currentStepPageData?.description || null;
  const macroDesc      = currentStepPageData?.macro_description || macroView?.description || macroView || null;
  const microDesc      = currentStepPageData?.micro_description || getMicroText(microView) || null;
  const nanoDesc       = nanoView?.description || null;

  const isPageLoading  = stepLoading;
  const isViewsLoad    = viewsLoading;

  const stepNumber     = currentStepPageData?.step_number || localStorage.getItem("selectedStepNumber") || null;
  const totalSteps     = currentStepDataLength || totalStepsCount || null;

  /* ════════════════════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="currentstep">

      {/* ── STEP PROGRESS BAR ── */}
      <div className="step-bar">
        <div className="sp active" id="tab1">
          <span className="sp-n">1</span>
          Current Step
        </div>
        <span className="sp-arr">›</span>
        <div className="sp" id="tab2">
          <span className="sp-n">2</span>
          Marketplace
        </div>
        <span className="sp-arr">›</span>
        <div className="sp" id="tab3">
          <span className="sp-n">3</span>
          Cart
        </div>
        <span className="sp-arr">›</span>
        <div className="sp" id="tab4">
          <span className="sp-n">4</span>
          Checkout
        </div>
        <span className="sp-arr">›</span>
        <div className="sp" id="tab5">
          <span className="sp-n">5</span>
          Confirmed
        </div>
      </div>

      {/* ── PAGE CONTENT ── */}
      <div className="cs-page-content">

        {/* ── PAGE HEAD ── */}
        {isPageLoading ? (
          <SkeletonPageHead />
        ) : (
          <div className="page-head">

            {/* TOP ROW */}
            <div className="page-head-top-row">
              <div className="breadcrumb">
                <span>My Journey</span>
                <span>›</span>
                <span className="bc-hi">
                  {stepNumber ? `Step ${stepNumber}` : "Current Step"}
                </span>
              </div>

              {/* Step X of Y pill */}
              <div className="page-meta">
                <span className="meta-pill mp-gray">
                  📍{" "}
                  {stepNumber && totalSteps
                    ? `Step ${stepNumber} of ${totalSteps}`
                    : stepNumber
                    ? `Step ${stepNumber}`
                    : ""}
                </span>
              </div>

              {/* Back button */}
              <span
                className="meta-pill mp-gray back-link"
                onClick={handleBackToJourney}
              >
                ← Back To Path
              </span>
            </div>

            {/* Title */}
            {stepName && <h1>{stepName}</h1>}

            {/* Description */}
            {stepDesc && <p>{stepDesc}</p>}

          </div>
        )}

        {/* ── 3 VIEW CARDS ── */}
        <div className="views-grid">

          {/* MACRO */}
          {isViewsLoad ? (
            <SkeletonViewCard accent="macro" />
          ) : (
            <div className="view-card vMacro">
              <div className="vc-head hMacro">
                <div className="vc-dot dMacro"></div>
                <span className="vc-lbl lMacro">Macro View</span>
              </div>
              <div className="vc-body">
                <div className="vc-title">Why This Step Matters</div>
                {macroDesc ? (
                  <div className="vc-desc">{macroDesc}</div>
                ) : (
                  <div className="vc-desc vc-empty">No macro view available yet.</div>
                )}
              </div>
              <div className="vc-foot">
                <button
                  className="vc-btn bMacro"
                  onClick={() => {
                    setsideNav("Market Place");
                    navigate("/dashboard/users/Marketplace", { state: { view: "Macro" } });
                  }}
                >
                  🆓 Browse Free Tools
                </button>
              </div>
            </div>
          )}

          {/* MICRO */}
          {isViewsLoad ? (
            <SkeletonViewCard accent="micro" />
          ) : (
            <div className="view-card vMicro">
              <div className="vc-head hMicro">
                <div className="vc-dot dMicro"></div>
                <span className="vc-lbl lMicro">Micro View</span>
              </div>
              <div className="vc-body">
                <div className="vc-title">How It's Done</div>
                {microDesc ? (
                  <div className="vc-desc">{microDesc}</div>
                ) : (
                  <div className="vc-desc vc-empty">No micro view available yet.</div>
                )}
              </div>
              <div className="vc-foot">
                <button
                  className="vc-btn bMicro"
                  onClick={() => {
                    setsideNav("Market Place");
                    navigate("/dashboard/users/Marketplace", { state: { view: "Micro" } });
                  }}
                >
                  🔄 Browse Subscriptions
                </button>
              </div>
            </div>
          )}

          {/* NANO */}
          {isViewsLoad ? (
            <SkeletonViewCard accent="nano" />
          ) : (
            <div className="view-card vNano">
              <div className="vc-head hNano">
                <div className="vc-dot dNano"></div>
                <span className="vc-lbl lNano">Nano View</span>
              </div>
              <div className="vc-body">
                <div className="vc-title">Work 1-to-1 With An Expert</div>
                {nanoDesc ? (
                  <div className="vc-desc">{nanoDesc}</div>
                ) : (
                  <div className="vc-desc vc-empty">No nano view available yet.</div>
                )}
              </div>
              <div className="vc-foot">
                <button
                  className="vc-btn bNano"
                  onClick={() => {
                    setsideNav("Market Place");
                    navigate("/dashboard/users/Marketplace", { state: { view: "Nano" } });
                  }}
                >
                  🎓 Book a Session
                </button>
              </div>
            </div>
          )}

        </div>

        {/* ── COMPLETION BAR ── */}
        {isPageLoading ? (
          <div className="comp-bar sk-comp-bar">
            <div className="cb-left">
              <SkeletonBar width="120px" height="13px" style={{ marginBottom: "8px" }} />
              <SkeletonBar width="200px" height="16px" />
            </div>
            <div className="cb-btns">
              <SkeletonBar width="100px" height="40px" style={{ borderRadius: "8px" }} />
              <SkeletonBar width="140px" height="40px" style={{ borderRadius: "8px" }} />
            </div>
          </div>
        ) : (
          <div className="comp-bar">
            <div className="cb-left">
              <span className="cb-q">Did You Complete This Step?</span>
            </div>
            <div className="cb-btns">
              <button
                className="btn-fail"
                onClick={() => { setPopup(true); setPopupDetails("no"); }}
              >
                ✕ Failed
              </button>
              <button
                className="btn-yes"
                onClick={() => { setPopup(true); setPopupDetails("yes"); }}
              >
                ✓ Yes, Completed
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ── BUY DRAWER ── */}
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
                <div
                  className="boxx-cs"
                  style={{ marginTop: "1.5rem" }}
                  onClick={() => { setBuy("step1"); setAcceptOffer(false); setIndex([]); }}
                >
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

      {/* ── POPUP ── */}
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
                      const id = currentStepData?._id || currentStepPageData?._id;
                      if (id) completeStep(id, selectedPathId);
                    }}
                  >
                    Yes, go to next step
                  </div>
                  <div
                    className="no-btn"
                    onClick={() => { setPopup(false); setPopupDetails(""); setPopupContent("default"); }}
                  >
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
                      const id = currentStepData?._id || currentStepPageData?._id;
                      if (id) failStep(id, selectedPathId);
                    }}
                  >
                    Yes, move me to another path
                  </div>
                  <div
                    className="no-btn"
                    onClick={() => { setPopup(false); setPopupDetails(""); setPopupContent("default"); }}
                  >
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

export default CurrentStep;