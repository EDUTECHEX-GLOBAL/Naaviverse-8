import React, { useEffect, useState, useCallback } from "react";
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

const LAYER_COST = { micro: 2, nano: 4 };

/* ─────────────────────────────────────────
   SKELETON PRIMITIVES
───────────────────────────────────────── */

const SkeletonBar = ({ width = "100%", height = "14px", style = {} }) => (
  <div className="sk-bar" style={{ width, height, borderRadius: "6px", ...style }} />
);

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

const SkeletonPageHead = () => (
  <div className="page-head sk-page-head">
    <div className="page-head-top-row">
      <SkeletonBar width="200px" height="13px" />
      <SkeletonBar width="110px" height="28px" style={{ borderRadius: "20px" }} />
      <SkeletonBar width="120px" height="28px" style={{ borderRadius: "20px" }} />
    </div>
    <SkeletonBar width="55%" height="32px" style={{ marginTop: "18px", marginBottom: "14px" }} />
    <SkeletonText lines={2} />
  </div>
);

/* ─────────────────────────────────────────
   CREDIT UNLOCK OVERLAY
   Replaces the old LockOverlay for Micro/Nano
───────────────────────────────────────── */

const CreditUnlockOverlay = ({
  type,           // "micro" | "nano"
  balance,        // current wallet balance
  unlocking,      // bool — API in flight
  onUnlock,       // () => void — trigger unlock
  onSeePlans,     // () => void — fallback to subscription
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const cost = LAYER_COST[type];
  const canAfford = balance >= cost;

  return (
    <div className={`lock-overlay lock-overlay--${type}`}>
      <div className="lock-overlay__inner">
        {/* Lock icon */}
        <div className="lock-icon-wrap">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor" opacity="0.15" />
            <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="12" cy="16" r="1.5" fill="currentColor" />
          </svg>
        </div>

        {/* Description */}
        <p className="lock-overlay__text">
          {type === "nano"
            ? "Unlock 1-on-1 expert sessions & premium mentorship"
            : "Unlock full structured guidance & assessment tools"}
        </p>

        {/* ── Credit unlock section ── */}
        {!showConfirm ? (
          <div className="cuo-actions">
            {canAfford ? (
              <button
                className="cuo-btn cuo-btn--credits"
                onClick={() => setShowConfirm(true)}
                disabled={unlocking}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
                </svg>
                Use {cost} Credits
              </button>
            ) : (
              <div className="cuo-low">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fca5a5" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Need {cost} credits · you have {balance}
              </div>
            )}
            <button className="lock-overlay__btn" onClick={onSeePlans}>
              See Plans →
            </button>
          </div>
        ) : (
          /* ── Confirm step ── */
          <div className="cuo-confirm">
            <p className="cuo-confirm-text">
              Spend <strong>{cost} credits</strong> to permanently unlock?
              <br />
              <span className="cuo-confirm-balance">Balance after: {balance - cost} credits</span>
            </p>
            <div className="cuo-confirm-btns">
              <button
                className="cuo-btn cuo-btn--confirm"
                onClick={() => { onUnlock(); setShowConfirm(false); }}
                disabled={unlocking}
              >
                {unlocking ? "Unlocking…" : "Yes, Unlock"}
              </button>
              <button
                className="cuo-btn cuo-btn--cancel"
                onClick={() => setShowConfirm(false)}
                disabled={unlocking}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   NANO UPSELL BANNER
───────────────────────────────────────── */

const NanoUpsellBanner = ({ onUpgrade }) => (
  <div className="nano-upsell-banner">
    <div className="nano-upsell-banner__left">
      <span className="nano-upsell-banner__icon">🎯</span>
      <div>
        <div className="nano-upsell-banner__title">Want 1-on-1 expert sessions?</div>
        <div className="nano-upsell-banner__sub">
          Upgrade to Nano to unlock personalised mentor sessions for every step.
        </div>
      </div>
    </div>
    <button className="nano-upsell-banner__btn" onClick={onUpgrade}>
      Upgrade to Nano →
    </button>
  </div>
);

/* ─────────────────────────────────────────
   SUBSCRIPTION GATE
───────────────────────────────────────── */

const SubscriptionGate = ({ onBack, onSubscribe, subscribing, upgradeMode = false }) => {
  const [selectedTier, setSelectedTier] = useState(upgradeMode ? "nano" : "micro");
  const [selectedBilling, setSelectedBilling] = useState("annual");

  const microPlans = [
    {
      billing: "monthly", price: "₹499", period: "/ month", save: null,
      feats: ["Full Macro View access", "Micro View per step", "Structured assessments", "Progress tracking", "Cancel anytime"],
    },
    {
      billing: "annual", price: "₹349", period: "/ month", save: "Billed ₹4,188/year — Save 30%", tag: "Best Value",
      feats: ["Everything in Monthly", "Locked-in pricing", "Priority support"],
    },
  ];

  const nanoPlans = [
    {
      billing: "monthly", price: "₹999", period: "/ month", save: null,
      feats: ["Everything in Micro", "Nano View per step", "1-on-1 expert mentor sessions", "Complete Marketplace", "Cancel anytime"],
    },
    {
      billing: "annual", price: "₹699", period: "/ month", save: "Billed ₹8,388/year — Save 30%", tag: "Most Popular",
      feats: ["Everything in Monthly Nano", "Priority mentor matching", "Exclusive institution access", "Dedicated success manager", "Locked-in pricing"],
    },
  ];

  const activePlans = selectedTier === "micro" ? microPlans : nanoPlans;

  return (
    <div className="sub-gate">
      <div className="sub-gate__inner">
        <button className="sub-gate__back" onClick={onBack} disabled={subscribing}>
          ← Back to Current Step
        </button>
        <div className="sub-gate__badge">
          {upgradeMode ? "⬆ Upgrade to Nano" : "🔓 Unlock Full Access"}
        </div>
        <h2 className="sub-gate__title">
          {upgradeMode ? "Upgrade Your Naavi Plan" : "Choose Your Naavi Plan"}
        </h2>
        <p className="sub-gate__desc">
          {upgradeMode
            ? "Unlock 1-on-1 expert sessions, priority mentor matching, and the full Nano experience."
            : "Get complete access to Micro & Nano views, structured assessments, expert mentorship, and the full marketplace."}
        </p>
        {!upgradeMode && (
          <div className="sub-tier-toggle">
            <button
              className={`sub-tier-toggle__btn ${selectedTier === "micro" ? "active" : ""}`}
              onClick={() => { setSelectedTier("micro"); setSelectedBilling("annual"); }}
            >
              Micro View
              <span className="sub-tier-toggle__sub">Structured guidance</span>
            </button>
            <button
              className={`sub-tier-toggle__btn ${selectedTier === "nano" ? "active nano" : ""}`}
              onClick={() => { setSelectedTier("nano"); setSelectedBilling("annual"); }}
            >
              Nano View
              <span className="sub-tier-toggle__sub">+ Expert mentorship</span>
            </button>
          </div>
        )}
        <div className="sub-plans">
          {activePlans.map((plan) => {
            const isSelected = selectedBilling === plan.billing;
            return (
              <div
                key={plan.billing}
                className={`sub-plan ${isSelected ? "sub-plan--selected" : ""} ${selectedTier === "nano" ? "sub-plan--nano" : ""}`}
                onClick={() => setSelectedBilling(plan.billing)}
              >
                {plan.tag && <div className="sub-plan__tag">{plan.billing === "annual" ? "⭐ " : ""}{plan.tag}</div>}
                <div className="sub-plan__name">{plan.billing === "monthly" ? "Monthly" : "Annual"}</div>
                <div className={`sub-plan__price ${selectedTier === "nano" ? "sub-plan__price--nano" : ""}`}>
                  {plan.price} <span>{plan.period}</span>
                </div>
                {plan.save && <div className={`sub-plan__save ${selectedTier === "nano" ? "sub-plan__save--nano" : ""}`}>{plan.save}</div>}
                <ul className="sub-plan__feats">
                  {plan.feats.map((f) => <li key={f}>{f}</li>)}
                </ul>
              </div>
            );
          })}
        </div>
        <button
          className={`sub-gate__cta ${selectedTier === "nano" ? "sub-gate__cta--nano" : ""}`}
          onClick={() => onSubscribe({ tier: selectedTier, billing: selectedBilling })}
          disabled={subscribing}
          style={{ opacity: subscribing ? 0.7 : 1, cursor: subscribing ? "not-allowed" : "pointer" }}
        >
          {subscribing ? "Activating..." : `Activate ${selectedTier === "nano" ? "Nano" : "Micro"} Plan →`}
        </button>
        {!upgradeMode && selectedTier === "micro" && (
          <p className="sub-gate__nano-hint">
            Need mentor sessions too?{" "}
            <button className="sub-gate__nano-hint-link" onClick={() => { setSelectedTier("nano"); setSelectedBilling("annual"); }}>
              See Nano plans →
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   SUBSCRIPTION SUCCESS
───────────────────────────────────────── */

const SubscriptionSuccess = ({ plan, tier, onStartLearning }) => {
  const isNano = tier === "nano";
  return (
    <div className="sub-success">
      <div className="sub-success__inner">
        <div className="sub-success__icon">
          <svg viewBox="0 0 52 52" className="sub-success__svg">
            <circle className="sub-success__circle" cx="26" cy="26" r="25" fill="none" />
            <path className="sub-success__check" fill="none" d="M14 27l8 8 16-16" />
          </svg>
        </div>
        <div className="sub-success__badge">🎉 Payment Successful</div>
        <h2 className="sub-success__title">{isNano ? "Welcome to Naavi Nano!" : "Welcome to Naavi Micro!"}</h2>
        <p className="sub-success__desc">
          {isNano
            ? <span>You now have full access to <strong>Micro View</strong> and <strong>Nano View</strong>.</span>
            : <span>You now have full access to <strong>Micro View</strong>.</span>}
        </p>
        <div className="sub-success__plan-pill">
          {isNano
            ? (plan === "annual" ? "⭐ Nano Annual — ₹699/month" : "Nano Monthly — ₹999/month")
            : (plan === "annual" ? "⭐ Micro Annual — ₹349/month" : "Micro Monthly — ₹499/month")}
        </div>
        <button className="sub-success__cta" onClick={onStartLearning}>Start Learning →</button>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */

const CurrentStep = ({ productDataArray, selectedPathId, showSelectedPath, selectedPath }) => {
  const userDetails = (() => {
    try { return JSON.parse(localStorage.getItem("user")); }
    catch { return null; }
  })();

  const navigate  = useNavigate();
  const userEmail = userDetails?.user?.email || userDetails?.email || "guest";

  const SUB_KEY      = `naavi_subscribed_${userEmail}`;
  const SUB_TIER_KEY = `naavi_sub_tier_${userEmail}`;
  const PRODUCT_ID   = "naavi-platform";
  const PRODUCT_NAME = "Naavi Platform";

  // ── Subscription state ─────────────────────────────────────────────────
  const [subscribed,    setSubscribed]    = useState(() => localStorage.getItem(SUB_KEY) === "true");
  const [subTier,       setSubTier]       = useState(() => localStorage.getItem(SUB_TIER_KEY) || null);
  const [showSubGate,   setShowSubGate]   = useState(false);
  const [upgradeMode,   setUpgradeMode]   = useState(false);
  const [subscribing,   setSubscribing]   = useState(false);
  const [subError,      setSubError]      = useState("");
  const [showSuccess,   setShowSuccess]   = useState(false);
  const [subscribedPlan, setSubscribedPlan] = useState("");
  const [subscribedTier, setSubscribedTier] = useState("");

  // ── NEW: Credit unlock state ───────────────────────────────────────────
  const [walletBalance,   setWalletBalance]   = useState(0);
  const [creditUnlocked,  setCreditUnlocked]  = useState({ micro: false, nano: false });
  const [unlocking,       setUnlocking]       = useState({ micro: false, nano: false });
  // Toast-style success message after credit unlock
  const [unlockToast,     setUnlockToast]     = useState(""); // "micro" | "nano" | ""

  // ── View states ────────────────────────────────────────────────────────
  const [macroView, setMacroView] = useState(null);
  const [microView, setMicroView] = useState(null);
  const [nanoView,  setNanoView]  = useState(null);

  // ── Loading flags ──────────────────────────────────────────────────────
  const [stepLoading,  setStepLoading]  = useState(true);
  const [viewsLoading, setViewsLoading] = useState(true);

  const [microServices,     setMicroServices]     = useState([]);
  const [servicesLoading,   setServicesLoading]   = useState(false);
  const [selectedService,   setSelectedService]   = useState(null);
  const [showCheckout,      setShowCheckout]      = useState(false);
  const [showNanoModal,     setShowNanoModal]      = useState(false);
  const [selectedNanoService, setSelectedNanoService] = useState(null);
  const [showNanoCheckout,  setShowNanoCheckout]  = useState(false);
  const [totalStepsCount,   setTotalStepsCount]   = useState(null);

  const {
    currentStepData, setCurrentStepData,
    currentStepDataLength, setCurrentStepDataLength,
    currentStepdataPathId, setCurrentStepDataPathId,
    stepServices, setStepServices,
  } = useCoinContextData();

  const {
    sideNav, setsideNav,
    buy, setBuy,
    mallCoindata, setfilteredcoins,
    index, setIndex,
  } = useStore();

  const [showNewDiv,         setShowNewDiv]         = useState(null);
  const [currentStepPageData, setCurrentStepPageData] = useState(null);
  const [popup,              setPopup]              = useState(false);
  const [popupContent,       setPopupContent]       = useState("default");
  const [popupDetails,       setPopupDetails]       = useState("");
  const [currentStepPagePathId, setCurrentStepPagePathId] = useState("");
  const [selectedCard,       setSelectedCard]       = useState(0);
  const [cards,              setCards]              = useState(productDataArray);
  const [centerIndex,        setCenterIndex]        = useState(0);
  const [acceptOffer,        setAcceptOffer]        = useState(false);
  const [userData,           setUserData]           = useState([]);

  const getMicroText = (mv) => {
    if (!mv) return null;
    const joined = Object.values(mv).filter(Boolean).join("\n\n");
    return joined || null;
  };

  // ── Derived: subscription-based access ────────────────────────────────
  const hasMicroSub = subscribed && (subTier === "micro" || subTier === "nano");
  const hasNanoSub  = subscribed && subTier === "nano";

  // ── NEW: Combined access (subscription OR credit unlock) ───────────────
  const hasMicro = hasMicroSub || creditUnlocked.micro;
  const hasNano  = hasNanoSub  || creditUnlocked.nano;

  /* ── Verify subscription from DB ──────────────────────────────────────── */
  useEffect(() => {
    const verify = async () => {
      if (!userEmail || userEmail === "guest") return;
      try {
        const res = await axios.get(
          `${BASE_URL}/api/subscriptions/status?email=${userEmail}&productId=${PRODUCT_ID}`
        );
        const isSubscribed = res.data?.subscribed === true;
        const tier = res.data?.tier || null;
        localStorage.setItem(SUB_KEY, String(isSubscribed));
        localStorage.setItem(SUB_TIER_KEY, tier || "");
        setSubscribed(isSubscribed);
        setSubTier(isSubscribed ? tier : null);
      } catch {
        const cachedSub  = localStorage.getItem(SUB_KEY) === "true";
        const cachedTier = localStorage.getItem(SUB_TIER_KEY) || null;
        setSubscribed(cachedSub);
        setSubTier(cachedSub ? cachedTier : null);
      }
    };
    verify();
  }, [userEmail]);

  /* ── NEW: Fetch wallet balance + credit unlocks for current step ───────── */
  useEffect(() => {
    const stepId = localStorage.getItem("selectedStepId");
    if (!userEmail || userEmail === "guest" || !stepId) return;

    // Fetch balance and unlock status in parallel
    Promise.all([
      axios.get(`${BASE_URL}/api/wallet/balance`, { params: { email: userEmail } }),
      axios.get(`${BASE_URL}/api/subscriptions/step-unlock/check`, { params: { email: userEmail, step_id: stepId } }),
    ])
      .then(([balRes, unlockRes]) => {
        if (balRes.data?.status)    setWalletBalance(balRes.data.balance);
        if (unlockRes.data?.status) setCreditUnlocked(unlockRes.data.unlocked);
      })
      .catch(() => {});
  }, [userEmail, currentStepPageData?._id]);

  /* ── NEW: handleCreditUnlock — deducts credits + saves unlock permanently */
  const handleCreditUnlock = useCallback(async (layer) => {
    const stepId = localStorage.getItem("selectedStepId");
    if (!stepId || !userEmail || userEmail === "guest") return;
    if (unlocking[layer]) return;

    setUnlocking((prev) => ({ ...prev, [layer]: true }));
    try {
      const { data } = await axios.post(`${BASE_URL}/api/subscriptions/step-unlock/unlock`, {
        email:   userEmail,
        step_id: stepId,
        layer,
      });
      if (data?.status) {
        // Update unlocked state + new balance immediately
        setCreditUnlocked((prev) => ({ ...prev, [layer]: true }));
        setWalletBalance(data.remainingBalance);
        // Show brief success toast
        setUnlockToast(layer);
        setTimeout(() => setUnlockToast(""), 3000);
      }
    } catch (err) {
      console.error("❌ Credit unlock failed:", err);
    } finally {
      setUnlocking((prev) => ({ ...prev, [layer]: false }));
    }
  }, [userEmail, unlocking]);

  /* ── Subscription handlers ─────────────────────────────────────────────── */
  const handleSeePlans = () => { setSubError(""); setUpgradeMode(false); setShowSubGate(true); };
  const handleUpgradeToNano = () => { setSubError(""); setUpgradeMode(true); setShowSubGate(true); };

  const handleSubscribe = async ({ tier, billing }) => {
    if (!userEmail || userEmail === "guest") { setSubError("Please log in to subscribe."); return; }
    setSubscribing(true); setSubError("");
    try {
      const res = await axios.post(`${BASE_URL}/api/subscriptions/create`, {
        userEmail,
        profileId:     userDetails?.id || userDetails?.user?.id || null,
        productId:     PRODUCT_ID,
        productName:   PRODUCT_NAME,
        billingMethod: billing,
        tier,
      });
      if (res.data?.success) {
        const newTier = res.data?.subscription?.tier || tier;
        localStorage.setItem(SUB_KEY, "true");
        localStorage.setItem(SUB_TIER_KEY, newTier);
        setSubscribed(true); setSubTier(newTier);
        setShowSubGate(false); setUpgradeMode(false);
        setSubscribedPlan(billing); setSubscribedTier(newTier);
        setShowSuccess(true);
      } else {
        setSubError(res.data?.message || "Subscription could not be activated.");
      }
    } catch { setSubError("Something went wrong. Please try again."); }
    finally { setSubscribing(false); }
  };

  const handleBackFromGate = () => { setShowSubGate(false); setUpgradeMode(false); setSubError(""); };

  /* ── Step data fetch ───────────────────────────────────────────────────── */
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
        if (step) { setCurrentStepPageData(step); setCurrentStepPagePathId(pathId); }
      })
      .catch((err) => console.error("❌ Error fetching path steps:", err))
      .finally(() => setStepLoading(false));
  }, [selectedPathId]);

  /* ── Fetch AI step views ───────────────────────────────────────────────── */
  useEffect(() => {
    const loadStepViews = async () => {
      const stepId = localStorage.getItem("selectedStepId");
      const pathId = selectedPathId || localStorage.getItem("selectedPathId");
      if (!stepId || !pathId) { setViewsLoading(false); return; }
      setViewsLoading(true);
      try {
        const res = await axios.get(`${BASE_URL}/api/stepviews?pathId=${pathId}&stepId=${stepId}`);
        const data = res?.data?.data || {};
        setMacroView(data.macroView || null);
        setMicroView(data.microView || null);
        setNanoView(data.nanoView  || null);
      } catch {
        setMacroView(null); setMicroView(null); setNanoView(null);
      } finally { setViewsLoading(false); }
    };
    loadStepViews();
  }, [selectedPathId]);

  /* ── User data ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!userDetails) return;
    const email = userDetails?.user?.email || userDetails?.email;
    if (!email) return;
    axios.get(`${BASE_URL}/api/users/get/${email}`).catch(() => {});
  }, []);

  const reloadServices = async () => {
    const stepId = localStorage.getItem("selectedStepId");
    if (!stepId) return;
    try {
      const res = await axios.get(`${BASE_URL}/api/services/by-step?step_id=${stepId}`);
      setStepServices(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch { setStepServices([]); }
  };

  useEffect(() => {
    if (!acceptOffer || !stepServices || stepServices.length === 0) return;
    const svc = pickServiceForDrawer();
    if (!svc) { alert("No services available for this step."); return; }
    setIndex(svc); setBuy("step1");
  }, [stepServices]);

  const pickServiceForDrawer = () => {
    try {
      if (!Array.isArray(stepServices) || stepServices.length === 0) return null;
      const selected = stepServices[selectedCard];
      if (selected?._id) return selected;
      const first = stepServices[0];
      return first?._id ? first : null;
    } catch { return null; }
  };

  const completeStep = async (stepid) => {
    const pathId = selectedPathId || localStorage.getItem("selectedPathId");
    const email  = userDetails?.email || userDetails?.user?.email;
    try {
      await axios.put(`${BASE_URL}/api/userpaths/completeStep`, { email, pathId, step_id: stepid });
    } catch { }
    setPopupContent("success"); setPopupDetails("yes");
  };

  const failStep = async (stepid) => {
    const pathId = selectedPathId || localStorage.getItem("selectedPathId");
    const email  = userDetails?.email || userDetails?.user?.email;
    try {
      await axios.put(`${BASE_URL}/api/userpaths/failedStep`, { email, pathId, step_id: stepid });
    } catch { }
    setPopupContent("success"); setPopupDetails("no");
  };

  function filterItem(text) {
    if (!text) { setfilteredcoins(mallCoindata || []); return; }
    setfilteredcoins(mallCoindata?.filter((c) =>
      c?.coinSymbol?.toLowerCase()?.includes(text.toLowerCase())
    ) || []);
  }

  const handleBackToJourney = () => {
    setCurrentStepData(""); setCurrentStepDataLength(""); setCurrentStepDataPathId("");
    setsideNav("My Journey");
    navigate("/dashboard/users/my-journey");
  };

  /* ── Derived values ────────────────────────────────────────────────────── */
  const stepName   = currentStepData?.name || currentStepPageData?.name || null;
  const stepDesc   = currentStepPageData?.macro_description || currentStepPageData?.description || null;
  const macroDesc  = currentStepPageData?.macro_description || macroView?.description || macroView || null;
  const microDesc  = currentStepPageData?.micro_description || getMicroText(microView) || null;
  const nanoDesc   = nanoView?.description || null;
  const isPageLoading = stepLoading;
  const isViewsLoad   = viewsLoading;
  const stepNumber    = currentStepPageData?.step_order || localStorage.getItem("selectedStepNumber") || null;
  const totalSteps    = currentStepDataLength || totalStepsCount || null;

  /* ═══════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════ */

  if (showSuccess) {
    return (
      <div className="currentstep">
        <div className="step-bar">
          <div className="sp active"><span className="sp-n">1</span>Current Step</div>
          <span className="sp-arr">›</span>
          <div className="sp active"><span className="sp-n">✓</span>Subscription</div>
          <span className="sp-arr">›</span>
          <div className="sp"><span className="sp-n">3</span>Marketplace</div>
          <span className="sp-arr">›</span>
          <div className="sp"><span className="sp-n">4</span>Cart</div>
          <span className="sp-arr">›</span>
          <div className="sp"><span className="sp-n">5</span>Confirmed</div>
        </div>
        <SubscriptionSuccess plan={subscribedPlan} tier={subscribedTier} onStartLearning={() => setShowSuccess(false)} />
      </div>
    );
  }

  if (showSubGate) {
    return (
      <div className="currentstep">
        <div className="step-bar">
          <div className="sp active"><span className="sp-n">1</span>Current Step</div>
          <span className="sp-arr">›</span>
          <div className="sp"><span className="sp-n">2</span>Subscription</div>
          <span className="sp-arr">›</span>
          <div className="sp"><span className="sp-n">3</span>Marketplace</div>
          <span className="sp-arr">›</span>
          <div className="sp"><span className="sp-n">4</span>Cart</div>
          <span className="sp-arr">›</span>
          <div className="sp"><span className="sp-n">5</span>Confirmed</div>
        </div>
        {subError && (
          <div style={{ background: "#fef2f2", border: "1px solid #fee2e2", color: "#b91c1c", padding: "10px 20px", fontSize: "13px", fontWeight: 600, textAlign: "center" }}>
            ⚠ {subError}
          </div>
        )}
        <SubscriptionGate
          onBack={handleBackFromGate}
          onSubscribe={handleSubscribe}
          subscribing={subscribing}
          upgradeMode={upgradeMode}
        />
      </div>
    );
  }

  return (
    <div className="currentstep">

      <div className="step-bar">
        <div className="sp active"><span className="sp-n">1</span>Current Step</div>
        <span className="sp-arr">›</span>
        <div className="sp"><span className="sp-n">2</span>Marketplace</div>
        <span className="sp-arr">›</span>
        <div className="sp"><span className="sp-n">3</span>Cart</div>
        <span className="sp-arr">›</span>
        <div className="sp"><span className="sp-n">4</span>Checkout</div>
        <span className="sp-arr">›</span>
        <div className="sp"><span className="sp-n">5</span>Confirmed</div>
      </div>

      <div className="cs-page-content">

        {/* NEW: Unlock success toast */}
        {unlockToast && (
          <div className="unlock-toast">
            ✅ {unlockToast === "micro" ? "Micro" : "Nano"} View unlocked! {walletBalance} credits remaining.
          </div>
        )}

        {/* NEW: Wallet balance chip — always visible so user knows their balance */}
        {!isPageLoading && userEmail !== "guest" && (
          <div className="wallet-chip">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
            </svg>
            {walletBalance} credits
          </div>
        )}

        {/* PAGE HEAD */}
        {isPageLoading ? <SkeletonPageHead /> : (
          <div className="page-head">
            <div className="page-head-top-row">
              <div className="breadcrumb">
                <span>My Journey</span><span>›</span>
                <span className="bc-hi">{stepNumber ? `Step ${stepNumber}` : "Current Step"}</span>
              </div>
              <span className="meta-pill mp-gray back-link" onClick={handleBackToJourney}>
                ← Back To Path
              </span>
            </div>
            {stepName && <h1>{stepName}</h1>}
            {stepDesc && <p>{stepDesc}</p>}
          </div>
        )}

        {/* Nano upsell banner — only for micro-only subscribers (not credit unlocks) */}
        {hasMicroSub && !hasNanoSub && !isViewsLoad && (
          <NanoUpsellBanner onUpgrade={handleUpgradeToNano} />
        )}

        {/* VIEW CARDS */}
        <div className="views-grid">

          {/* MACRO — always free */}
          {isViewsLoad ? <SkeletonViewCard accent="macro" /> : (
            <div className="view-card vMacro">
              <div className="vc-head hMacro">
                <span className="vc-lbl lMacro">Macro View</span>
                <span className="vc-access-badge badge-free">Free</span>
              </div>
              <div className="vc-body">
                {currentStepPageData?.name && <div className="vc-step-name">{currentStepPageData.name}</div>}
                <div className="vc-title">Why This Step Matters</div>
                {macroDesc
                  ? <div className="vc-desc">{macroDesc}</div>
                  : <div className="vc-desc vc-empty">No macro view available yet.</div>}
              </div>
              <div className="vc-foot">
                <button
                  className="vc-btn bMacro"
                  onClick={() => { setsideNav("Market Place"); navigate("/dashboard/users/Marketplace", { state: { view: "Macro", subscribed } }); }}
                >
                  Discover Resources →
                </button>
              </div>
            </div>
          )}

          {/* MICRO — locked overlay now includes credit unlock option */}
          {isViewsLoad ? <SkeletonViewCard accent="micro" /> : (
            <div className={`view-card vMicro ${!hasMicro ? "view-card--locked" : ""}`}>
              {/* NEW: CreditUnlockOverlay instead of plain LockOverlay */}
              {!hasMicro && (
                <CreditUnlockOverlay
                  type="micro"
                  balance={walletBalance}
                  unlocking={unlocking.micro}
                  onUnlock={() => handleCreditUnlock("micro")}
                  onSeePlans={handleSeePlans}
                />
              )}
              <div className="vc-head hMicro">
                <span className="vc-lbl lMicro">Micro View</span>
                <span className={`vc-access-badge ${hasMicro ? "badge-sub" : "badge-locked"}`}>
                  {/* NEW: show credit badge if credit-unlocked (not subscription) */}
                  {hasMicro
                    ? (hasMicroSub ? "Micro Plan" : "2 Credits ✓")
                    : "🔒 Locked"}
                </span>
              </div>
              <div className="vc-body">
                {currentStepPageData?.micro_name && <div className="vc-step-name">{currentStepPageData.micro_name}</div>}
                <div className="vc-title">How It's Done</div>
                {microDesc
                  ? <div className="vc-desc">{microDesc}</div>
                  : <div className="vc-desc vc-empty">
                    {hasMicro ? "No micro view available yet." : "Unlock with 2 credits or subscribe to access structured guidance."}
                  </div>}
              </div>
              <div className="vc-foot">
                {hasMicro ? (
                  <button className="vc-btn bMicro"
                    onClick={() => { setsideNav("Market Place"); navigate("/dashboard/users/Marketplace", { state: { view: "micro", subscribed, defaultTab: "micro" } }); }}>
                    Browse Resources →
                  </button>
                ) : (
                  <button className="vc-btn bLocked" onClick={handleSeePlans}>🔒 Unlock Required</button>
                )}
              </div>
            </div>
          )}

          {/* NANO — locked overlay now includes credit unlock option */}
          {isViewsLoad ? <SkeletonViewCard accent="nano" /> : (
            <div className={`view-card vNano ${!hasNano ? "view-card--locked" : ""}`}>
              {/* NEW: CreditUnlockOverlay instead of plain LockOverlay */}
              {!hasNano && (
                <CreditUnlockOverlay
                  type="nano"
                  balance={walletBalance}
                  unlocking={unlocking.nano}
                  onUnlock={() => handleCreditUnlock("nano")}
                  onSeePlans={hasMicro ? handleUpgradeToNano : handleSeePlans}
                />
              )}
              <div className="vc-head hNano">
                <span className="vc-lbl lNano">Nano View</span>
                <span className={`vc-access-badge ${hasNano ? "badge-paid" : "badge-locked"}`}>
                  {/* NEW: show credit badge if credit-unlocked */}
                  {hasNano
                    ? (hasNanoSub ? "Nano Plan" : "4 Credits ✓")
                    : "🔒 Locked"}
                </span>
              </div>
              <div className="vc-body">
                {currentStepPageData?.nano_name && <div className="vc-step-name">{currentStepPageData.nano_name}</div>}
                <div className="vc-title">Live Mentor Guidance</div>
                {nanoDesc
                  ? <div className="vc-desc">{nanoDesc}</div>
                  : <div className="vc-desc vc-empty">
                    {hasNano
                      ? "No nano view available yet."
                      : hasMicro
                        ? "Unlock with 4 credits or upgrade to Nano plan."
                        : "Unlock with 4 credits or subscribe to access expert sessions."}
                  </div>}
              </div>
              <div className="vc-foot">
                {hasNano ? (
                  <button className="vc-btn bNano"
                    onClick={() => { setsideNav("Market Place"); navigate("/dashboard/users/Marketplace", { state: { view: "nano", subscribed, defaultTab: "nano" } }); }}>
                    Book a Session →
                  </button>
                ) : hasMicro ? (
                  <button className="vc-btn bNanoUpgrade" onClick={handleUpgradeToNano}>
                    ⬆ Upgrade to Nano
                  </button>
                ) : (
                  <button className="vc-btn bLocked" onClick={handleSeePlans}>🔒 Unlock Required</button>
                )}
              </div>
            </div>
          )}

        </div>

        {/* COMPLETION BAR */}
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
            <div className="cb-left"><span className="cb-q">Did You Complete This Step?</span></div>
            <div className="cb-btns">
              <button className="btn-fail" onClick={() => { setPopup(true); setPopupDetails("no"); }}>✕ Failed</button>
              <button className="btn-yes"  onClick={() => { setPopup(true); setPopupDetails("yes"); }}>✓ Yes, Completed</button>
            </div>
          </div>
        )}

      </div>

      {/* BUY DRAWER — unchanged */}
      {acceptOffer && (
        <div className="accept-offer-overlay" onClick={() => { setAcceptOffer(false); setBuy("step1"); setIndex([]); }}>
          <div style={{ right: acceptOffer ? "0" : "-100%" }} className="right-divv-cs" onClick={(e) => e.stopPropagation()}>
            {buy === "step1" ? (
              <>
                <div className="amount-details-cs">
                  <div className="left-amnt-cs" style={{ borderRight: "1px solid #E7E7E7" }}>
                    <p className="amnt-font-cs">{(Number(index?.first_purchase?.price ?? 0)).toFixed(2)}&nbsp;{index?.first_purchase?.coin || ""}</p>
                    <p className="text-font-cs">{index?.first_purchase?.coin ? "First Purchase" : ""}</p>
                  </div>
                  <div className="left-amnt1-cs">
                    <p className="amnt-font-cs">{(Number(index?.billing_cycle?.monthly?.price ?? 0)).toFixed(2)}&nbsp;{index?.billing_cycle?.monthly?.coin || ""}</p>
                    <p className="text-font-cs">Monthly</p>
                  </div>
                  {index?.billing_cycle?.annual?.price != null && (
                    <div className="left-amnt1-cs" style={{ borderLeft: "1px solid #E7E7E7" }}>
                      <p className="amnt-font-cs">{(Number(index?.billing_cycle?.annual?.price ?? 0)).toFixed(2)}&nbsp;{index?.billing_cycle?.annual?.coin || ""}</p>
                      <p className="text-font-cs">Yearly</p>
                    </div>
                  )}
                </div>
                <div className="buttonss-cs">
                  <button className="buy-btn-cs" onClick={() => { filterItem(""); setBuy("step2"); }}>Buy Now</button>
                </div>
              </>
            ) : buy === "step2" ? (
              <div className="buy-step1-cs">
                <div style={{ width: "100%", height: "17%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div style={{ fontSize: "1.25rem", fontWeight: "500", color: "#1F304F" }}>Select Currency To Pay With?</div>
                  <div className="searchh-cs">
                    <input type="text" placeholder="Search Vaults.." onChange={(e) => filterItem(e.target.value)} />
                  </div>
                </div>
                <div className="coin-options-cs"><CoinComponent /></div>
                <div className="buttonss-cs"><div className="share-btn-cs" onClick={() => setBuy("step1")}>Close</div></div>
              </div>
            ) : buy === "step3" ? (
              <div className="buy-step1-cs">
                <div style={{ fontSize: "1.25rem", fontWeight: "500", color: "#1F304F" }}>Are You Sure You Want To Subscribe To {index?.product_name}?</div>
                <div className="boxx-cs" onClick={() => setBuy("step4")}>Confirm Purchase</div>
                <div className="boxx-cs" style={{ marginTop: "1.5rem" }} onClick={() => setBuy("step1")}>Go Back</div>
                <div className="boxx-cs" style={{ marginTop: "1.5rem" }} onClick={() => { setBuy("step1"); setAcceptOffer(false); setIndex([]); }}>Cancel Order</div>
              </div>
            ) : buy === "step4" ? (
              <div className="buy-step1-cs"><Step4 setAcceptOffer={setAcceptOffer} /></div>
            ) : null}
          </div>
        </div>
      )}

      {/* POPUP — unchanged */}
      {popup && (
        <div className="popup-overlay" onClick={() => { setPopup(false); setPopupContent("default"); setPopupDetails(""); }}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div><img src={logo} alt="" /></div>
            {popupContent === "default" && popupDetails === "yes" && (
              <>
                <div className="popup-text">Are you sure you have completed this step?</div>
                <div className="popup-btns">
                  <div className="yes-Btn" onClick={() => {
                    const id = currentStepData?._id || currentStepPageData?._id;
                    if (id) completeStep(id, selectedPathId);
                    else { const fb = localStorage.getItem("selectedStepId"); if (fb) completeStep(fb, selectedPathId); }
                  }}>Yes, go to next step</div>
                  <div className="no-btn" onClick={() => { setPopup(false); setPopupDetails(""); setPopupContent("default"); }}>Never mind</div>
                </div>
              </>
            )}
            {popupContent === "default" && popupDetails === "no" && (
              <>
                <div className="popup-text">Are you sure you have failed this step?</div>
                <div className="popup-btns">
                  <div className="yes-Btn" style={{ background: "#100F0D" }} onClick={() => {
                    const id = currentStepData?._id || currentStepPageData?._id;
                    if (id) failStep(id, selectedPathId);
                  }}>Yes, move me to another path</div>
                  <div className="no-btn" onClick={() => { setPopup(false); setPopupDetails(""); setPopupContent("default"); }}>Never mind</div>
                </div>
              </>
            )}
            {popupContent === "success" && (
              <>
                <div className="popup-text">{popupDetails === "yes" ? "Completed Step Updated!" : "Failed Step Updated!"}</div>
                <div className="popup-btns">
                  <div className="yes-Btn" onClick={async () => {
                    if (popupDetails === "yes") {
                      setPopup(false); setPopupContent("default"); setPopupDetails("");
                      try {
                        const pathId = currentStepPagePathId || localStorage.getItem("selectedPathId");
                        const currentNumber = parseInt(stepNumber) || 1;
                        const res = await axios.get(`${BASE_URL}/api/userpaths/steps?pathId=${pathId}`);
                        const allSteps = res?.data?.data?.steps || [];
                        const sorted = [...allSteps].sort((a, b) => a.step_order - b.step_order);
                        const nextStep = sorted.find((s) => s.step_order === currentNumber + 1);
                        if (nextStep) {
                          const nextId = nextStep._id || nextStep.step_id;
                          localStorage.setItem("selectedStepId", nextId);
                          localStorage.setItem("selectedStepNumber", String(nextStep.step_order));
                          setCurrentStepPageData(nextStep); setCurrentStepPagePathId(pathId);
                          setCurrentStepData(nextStep); setCurrentStepDataLength(allSteps.length); setCurrentStepDataPathId(pathId);
                          setMacroView(null); setMicroView(null); setNanoView(null);
                          // NEW: Reset credit unlock state for the new step
                          setCreditUnlocked({ micro: false, nano: false });
                          setViewsLoading(true); setStepLoading(false);
                          try {
                            const viewRes = await axios.get(`${BASE_URL}/api/stepviews?pathId=${pathId}&stepId=${nextId}`);
                            const viewData = viewRes?.data?.data || {};
                            setMacroView(viewData.macroView || null);
                            setMicroView(viewData.microView || null);
                            setNanoView(viewData.nanoView  || null);
                            // NEW: Also fetch unlock status for new step
                          const unlockRes = await axios.get(`${BASE_URL}/api/subscriptions/step-unlock/check`, {
                              params: { email: userEmail, step_id: nextId }
                            });
                            if (unlockRes.data?.status) setCreditUnlocked(unlockRes.data.unlocked);
                          } catch {
                            setMacroView(null); setMicroView(null); setNanoView(null);
                          } finally { setViewsLoading(false); }
                          setsideNav("Current Step");
                        } else {
                          setsideNav("My Journey");
                          navigate("/dashboard/users/my-journey");
                        }
                      } catch { setsideNav("My Journey"); navigate("/dashboard/users/my-journey"); }
                    } else {
                      setPopup(false); setPopupContent("default"); setPopupDetails("");
                      setsideNav("My Journey"); navigate("/dashboard/users/my-journey");
                    }
                  }}>OK</div>
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