import React, { useState, useMemo, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./UserMarketplace.scss";
import axios from "axios";
import logActivity from "../utils/activityLogger";

// Use process.env for Create React App
const API = process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_URL || (process.env.NODE_ENV === "development" ? "http://127.0.0.1:8001" : "");
const MONGO_ID_RE = /^[a-f\d]{24}$/i;

const LAYER_META = {
  macro: { label: "MACRO VIEW — FREE TOOLS", sub: "Free tools to get started.", badgeCls: "vsh-macro", cardCls: "vMacro" },
  micro: { label: "MICRO VIEW — SUBSCRIPTIONS", sub: "Structured progress tracking.", badgeCls: "vsh-micro", cardCls: "vMicro" },
  nano: { label: "NANO VIEW — 1-ON-1 SESSIONS", sub: "Book a personalised expert session.", badgeCls: "vsh-nano", cardCls: "vNano" },
};

const LAYER_ICON = {
  macro: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
  micro: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>,
  nano: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c0 2 6 3 6 3s6-1 6-3v-5" /></svg>,
};

const TIME_SLOTS = ["10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM", "6:00 PM", "8:00 PM"];

const LAYER_PILLS = [
  { key: "macro", label: "Macro" },
  { key: "micro", label: "Micro" },
  { key: "nano", label: "Nano" },
];

const CATEGORY_PILLS = [
  { key: "all", label: "All" },
  { key: "vendor", label: "Vendors" },
  { key: "mentor", label: "Mentors" },
  { key: "distributor", label: "Distributors" },
  { key: "institution", label: "Institutions" },
];

// Mock services fallback disabled - real database/step items rendered dynamically
const MOCK_SERVICES = [];

const getItemCategory = (item) => {
  return (item?.category || "vendor").toLowerCase();
};

const isFreeItem = (s) => {
  if (!s.cost) return true;
  const val = String(s.cost).trim().toLowerCase();
  return val === "0" || val === "free" || val === "";
};

const itemPrice = (s) => {
  if (isFreeItem(s)) return 0;
  const raw = String(s.cost).replace(/[^0-9]/g, "");
  return parseInt(raw, 10) || 0;
};

const getCostDisplay = (s) => {
  if (isFreeItem(s)) return "Free";
  const price = itemPrice(s);
  return `₹${price.toLocaleString("en-IN")}`;
};

const fmtPrice = (n) => n === 0 ? "Free" : `₹${n.toLocaleString()}`;
const getMarketplaceStarRating = (item) => {
  const avg = Number(item?.average_rating || item?.analytics?.average_rating || 0);
  if (avg > 0) return Math.min(5, Math.max(1, avg)).toFixed(1);

  const score = Number(item?.marketplace_score || item?.analytics?.marketplace_score || 0);
  if (score > 0) {
    return Math.min(5, Math.max(3.5, 3.5 + (score / 100) * 1.5)).toFixed(1);
  }

  return "4.0";
};
const genOrderId = () => `#NV-${Math.floor(100000 + Math.random() * 900000)}`;
const fmtDate = (d) => d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

// ─── Compact Feedback Strip ──────────────────────────────────────────────────
const FeedbackStrip = ({ value = {}, onChange }) => {
  const [selected, setSelected] = useState(value.action || "");
  const [commentText, setCommentText] = useState(value.comment || "");
  const [showComment, setShowComment] = useState(false);

  useEffect(() => {
    if (value.action !== undefined) {
      setSelected(value.action);
      if (value.action === "comment") {
        setShowComment(true);
      }
    }
    if (value.comment !== undefined) {
      setCommentText(value.comment);
    }
  }, [value.action, value.comment]);

  const handleAction = (action) => {
    if (action === "comment") {
      setShowComment(!showComment);
    } else {
      const isSelected = selected === action;
      const nextAction = isSelected ? "" : action;
      setSelected(nextAction);
      setShowComment(false);
      onChange({
        action: nextAction,
        comment: "",
        skipped: nextAction === "skip",
      });
    }
  };

  const handleSubmitComment = (e) => {
    e.stopPropagation();
    onChange({
      action: "comment",
      comment: commentText,
      skipped: false,
    });
    setSelected("comment_submitted");
    setShowComment(false);
  };

  const clearFeedback = (e) => {
    e.stopPropagation();
    setSelected("");
    setCommentText("");
    setShowComment(false);
    onChange({ action: "", comment: "", skipped: false });
  };

  return (
    <div className="feedback-compact-container" onClick={(e) => e.stopPropagation()}>
      <div className="feedback-compact-row">
        <span className="feedback-prompt">Helpful?</span>
        <div className="feedback-actions">
          <button
            type="button"
            className={`feedback-icon-btn ${selected === "helpful" ? "active active--helpful" : ""}`}
            onClick={() => handleAction("helpful")}
            title="Mark Helpful"
          >
            👍
          </button>
          <button
            type="button"
            className={`feedback-icon-btn ${selected === "notRelevant" ? "active active--not-relevant" : ""}`}
            onClick={() => handleAction("notRelevant")}
            title="Mark Not Relevant"
          >
            👎
          </button>
          <button
            type="button"
            className={`feedback-icon-btn ${selected === "comment" || selected === "comment_submitted" ? "active active--comment" : ""}`}
            onClick={() => handleAction("comment")}
            title="Add Comment"
          >
            💬
          </button>
          {(selected || commentText) && (
            <button
              type="button"
              className="feedback-clear-btn"
              onClick={clearFeedback}
              title="Clear Feedback"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {showComment && (
        <div className="feedback-comment-input-area">
          <textarea
            className="feedback-comment-textarea"
            placeholder="Type your feedback..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button
            type="button"
            className="feedback-comment-submit-btn"
            onClick={handleSubmitComment}
          >
            Submit
          </button>
        </div>
      )}

      {selected && selected !== "comment" && !showComment && (
        <div className="feedback-note-inline">
          {selected === "helpful" && "Marked as helpful"}
          {selected === "notRelevant" && "Marked as not relevant"}
          {selected === "comment_submitted" && "Comment submitted"}
        </div>
      )}
    </div>
  );
};

// ─── Service Card ─────────────────────────────────────────────────────────────
const ServiceCard = ({ item, inCart, onToggleCart, onCardView, onVisitSite, feedback, onFeedbackChange, isPurchased }) => {
  const layer = item.layer?.toLowerCase() || "macro";
  const meta = LAYER_META[layer] || LAYER_META.macro;
  const free = isFreeItem(item);
  const isExternal = item.checkoutType === "external";

  return (
    <div
      className={`svc-card ${meta.cardCls} ${isExternal ? "svc-card--external" : ""} ${isPurchased ? "svc-card--purchased" : ""}`}
      onClick={() => onCardView && onCardView(item)}
    >
      <div className="svc-top">
        <div className="svc-tags">
          {item.role && (
            <span className={`svc-tag role-tag ${isExternal ? "role-tag--external" : ""}`}>
              {item.role}
            </span>
          )}
          <span className="svc-rating-badge" title="Marketplace rating">
            <span className="svc-rating-stars">★★★★★</span>
            <span>{getMarketplaceStarRating(item)}</span>
          </span>
        </div>
        <span className="svc-ico" style={{ color: layer === "macro" ? "#6366f1" : layer === "micro" ? "#0d9488" : "#d97706" }}>
          {LAYER_ICON[layer]}
        </span>
        <div className="svc-name">{item.name || "Unnamed Service"}</div>
        <div className="svc-by">by {item.partner_email || ""}</div>
        {item.goal && <div className="svc-desc">{item.goal}</div>}

        <div className="svc-details">
          {item.outcomes && <div className="svc-detail-row"><span className="svc-detail-lbl">Outcomes:</span><span>{item.outcomes}</span></div>}
          {item.duration && <div className="svc-detail-row"><span className="svc-detail-lbl">Duration:</span><span>{item.duration}</span></div>}
          {item.iterations && <div className="svc-detail-row"><span className="svc-detail-lbl">Sessions:</span><span>{item.iterations}</span></div>}
          {item.discount && <div className="svc-detail-row"><span className="svc-detail-lbl">Discount:</span><span>{item.discount}</span></div>}
          {item.features && <div className="svc-detail-row"><span className="svc-detail-lbl">Features:</span><span>{item.features}</span></div>}
        </div>

      </div>

      <FeedbackStrip value={feedback} onChange={onFeedbackChange} />

      <div className="svc-bot">
        <div className="svc-price-wrap">
          <div className={`svc-price ${free ? "free-price" : ""} ${isExternal ? "external-price" : ""}`}>{getCostDisplay(item)}</div>
          <div className="svc-billing">{free ? "No cost" : "Paid"}</div>
        </div>

        {isPurchased ? (
          <div className="svc-purchased-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            <span>Purchased</span>
          </div>
        ) : (
          <button
            className={`svc-add ${inCart ? "added" : ""}`}
            onClick={(e) => { e.stopPropagation(); onToggleCart(item); }}
          >
            {inCart ? "✓ Added" : "+ Add"}
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Cart Drawer ──────────────────────────────────────────────────────────────
const CartDrawer = ({ cart, onRemove, onClose, onCheckout }) => {
  const subtotal = cart.reduce((a, s) => a + itemPrice(s), 0);
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + tax;
  return (
    <div className="cart-drawer-overlay" onClick={onClose}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="cd-header">
          <h2>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8, verticalAlign: "middle" }}>
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            Your Cart
          </h2>
          <button className="cd-close" onClick={onClose}>✕</button>
        </div>
        {cart.length === 0 ? (
          <div className="cd-empty">
            <div className="cd-empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            </div>
            <p className="cd-empty-title">Cart is empty</p>
            <p className="cd-empty-sub">Browse the marketplace to add services.</p>
          </div>
        ) : (
          <>
            <div className="cd-items">
              {cart.map((s) => {
                const layer = s.layer?.toLowerCase() || "macro";
                return (
                  <div className="cart-item" key={s._id}>
                    <div className="ci-ico" style={{ color: layer === "macro" ? "#6366f1" : layer === "micro" ? "#0d9488" : "#d97706" }}>
                      {LAYER_ICON[layer]}
                    </div>
                    <div className="ci-inf">
                      <div className="ci-name">{s.name}</div>
                      <div className="ci-meta">
                        <span className={`ci-layer ci-${layer}`}>{layer.charAt(0).toUpperCase() + layer.slice(1)}</span>
                        {s.role && <span>{s.role}</span>}
                        <span>by {s.partner_email}</span>
                      </div>
                    </div>
                    <div className="ci-price">{fmtPrice(itemPrice(s))}</div>
                    <button className="ci-rm" onClick={() => onRemove(s._id)}>✕</button>
                  </div>
                );
              })}
            </div>
            <div className="cart-sum">
              <div className="cs-r"><span>Subtotal ({cart.length} items)</span><span>₹{subtotal.toLocaleString()}</span></div>
              <div className="cs-r"><span>GST (18%)</span><span>₹{tax.toLocaleString()}</span></div>
              <div className="cs-r tot"><span>Total Payable</span><span>₹{total.toLocaleString()}</span></div>
              <button className="chk-btn" onClick={onCheckout}>Proceed to Checkout →</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ─── Step Progress Bar ────────────────────────────────────────────────────────
const StepBar = ({ currentPage, onStepChange }) => {
  const steps = [
    { key: "currentStep", label: "Current Step", n: 1 },
    { key: "marketplace", label: "Marketplace", n: 2 },
    { key: "cart", label: "Cart", n: 3 },
    { key: "checkout", label: "Checkout", n: 4 },
    { key: "confirmed", label: "Confirmed", n: 5 },
  ];
  const order = steps.map(s => s.key);
  const ci = order.indexOf(currentPage);
  return (
    <div className="step-bar">
      {steps.map((s, i) => {
        const done = i < ci;
        const active = i === ci;
        return (
          <React.Fragment key={s.key}>
            <div
              className={`sp ${done ? "done" : ""} ${active ? "active" : ""}`}
              onClick={() => done && onStepChange && onStepChange(s.key)}
              style={{ cursor: done ? "pointer" : "default" }}
            >
              <span className="sp-n">{done ? "✓" : s.n}</span>
              {s.label}
            </div>
            {i < steps.length - 1 && <span className="sp-arr">›</span>}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ─── Checkout Page ────────────────────────────────────────────────────────────
const CheckoutPage = ({ cart, onConfirm, onBack }) => {
  const userRaw = (() => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } })();
  const userEmail = userRaw?.user?.email || userRaw?.email || "guest@naaviverse.com";
  const userName = userRaw?.user?.displayName || userRaw?.displayName || "Guest User";

  const [fullName, setFullName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [phone, setPhone] = useState("");
  const [prefDate, setPrefDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("10:00 AM");
  const [submitting, setSubmitting] = useState(false);
  const [payError, setPayError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const subtotal = cart.reduce((a, s) => a + itemPrice(s), 0);
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + tax;

  const handlePayClick = () => {
    const errors = {};
    if (!fullName.trim()) errors.fullName = "Full name is required";
    if (!email.trim()) errors.email = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address";
    if (!phone.trim()) errors.phone = "Phone number is required";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setPayError("Please fill in all required fields before proceeding.");
      return;
    }

    setFieldErrors({});
    setPayError("");

    // Check if there is an external partner item in the cart (non-admin partner)
    const externalItem = cart.find(item => item.checkoutType === "external");

    if (externalItem) {
      // Prefill details in naavi-exclusive
      sessionStorage.setItem("naaviExclusiveItem", JSON.stringify(externalItem));
      sessionStorage.setItem("naaviExclusiveReturnPath", "/dashboard/users/Marketplace");
      sessionStorage.setItem("naaviExclusiveStudentDetails", JSON.stringify({
        fullName,
        email,
        phone
      }));

      // Open NaaviExclusive in a new tab
      localStorage.setItem("naaviExclusiveItemId", externalItem._id);
      window.open(`/naavi-exclusive/${externalItem.partnerId || ""}`, "_blank");

      // Reset cart and go back to marketplace
      onBack();
      return;
    }

    setSubmitting(true);

    // Call backend API to record the mock purchase
    axios.post(`${process.env.REACT_APP_API_BASE_URL || ""}/api/payment/mock-purchase`, {
      userEmail: email,
      items: cart.map(item => ({
        _id: item._id,
        name: item.name,
        layer: item.layer,
        cost: item.cost,
        partnerId: item.partnerId || null,
        partner_email: item.partner_email || null
      })),
      total,
      orderId: genOrderId()
    })
    .then((res) => {
      setSubmitting(false);
      onConfirm({
        orderId: res.data?.orderId || genOrderId(),
        total,
        itemCount: cart.length,
        date: new Date(),
        studentEmail: email,
        item: cart[0]
      });
    })
    .catch((err) => {
      console.error("Mock purchase API failed:", err);
      setSubmitting(false);
      onConfirm({
        orderId: genOrderId(),
        total,
        itemCount: cart.length,
        date: new Date(),
        studentEmail: email,
        item: cart[0]
      });
    });
  };

  return (
    <div className="checkout-page">
      <div className="chk-layout">
        <div className="chk-left">
          <h1 className="chk-title">Checkout</h1>
          <div className="chk-section">
            <div className="chk-section-lbl">Personal Details <span className="req-note">* All fields required</span></div>
            <div className={`chk-field ${fieldErrors.fullName ? "field-error" : ""}`}>
              <label>Full Name <span className="req-star">*</span></label>
              <input
                value={fullName}
                onChange={e => { setFullName(e.target.value); setFieldErrors(p => ({ ...p, fullName: "" })); }}
                placeholder="Your full name"
                className={fieldErrors.fullName ? "input-err" : ""}
              />
              {fieldErrors.fullName && <span className="err-msg">{fieldErrors.fullName}</span>}
            </div>
            <div className={`chk-field ${fieldErrors.email ? "field-error" : ""}`}>
              <label>Email Address <span className="req-star">*</span></label>
              <input
                value={email}
                onChange={e => { setEmail(e.target.value); setFieldErrors(p => ({ ...p, email: "" })); }}
                placeholder="your@email.com"
                className={fieldErrors.email ? "input-err" : ""}
              />
              {fieldErrors.email && <span className="err-msg">{fieldErrors.email}</span>}
            </div>
            <div className={`chk-field ${fieldErrors.phone ? "field-error" : ""}`}>
              <label>Phone Number <span className="req-star">*</span></label>
              <input
                value={phone}
                onChange={e => { setPhone(e.target.value); setFieldErrors(p => ({ ...p, phone: "" })); }}
                placeholder="+91 98765 43210"
                className={fieldErrors.phone ? "input-err" : ""}
              />
              {fieldErrors.phone && <span className="err-msg">{fieldErrors.phone}</span>}
            </div>
          </div>
          <div className="chk-section">
            <div className="chk-section-lbl">Schedule Session</div>
            <div className="chk-field"><label>Preferred Date</label><input type="date" value={prefDate} onChange={e => setPrefDate(e.target.value)} /></div>
            <div className="chk-field">
              <label>Select Time Slot</label>
              <div className="time-slots">
                {TIME_SLOTS.map(t => <div key={t} className={`time-slot ${timeSlot === t ? "active" : ""}`} onClick={() => setTimeSlot(t)}>{t}</div>)}
              </div>
            </div>
          </div>
          <div className="chk-section">
            <div className="chk-section-lbl">Payment</div>
            <div className="rzp-pay-note">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, verticalAlign: 'middle', flexShrink: 0 }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Secured Checkout Simulation. Choose pay button below to proceed.
            </div>
            {payError && <div className="rzp-pay-error">{payError}</div>}
          </div>
        </div>
        <div className="chk-right">
          <div className="order-summary">
            <div className="os-title">Order Summary</div>
            <div className="os-items">
              {cart.map(s => (
                <div className="os-row" key={s._id}>
                  <span className="os-ico" style={{ color: s.layer === "macro" ? "#6366f1" : s.layer === "micro" ? "#0d9488" : "#d97706" }}>
                    {LAYER_ICON[s.layer?.toLowerCase() || "macro"]}
                  </span>
                  <span className="os-name">{s.name}</span>
                  <span className="os-price">{getCostDisplay(s)}</span>
                </div>
              ))}
            </div>
            <div className="os-divider" />
            <div className="os-sum-row"><span>GST (18%)</span><span>₹{tax === 0 ? "0" : tax.toLocaleString()}</span></div>
            <div className="os-sum-row os-total"><span>Total</span><span>₹{total === 0 ? "0" : total.toLocaleString()}</span></div>
            <button className="os-pay-btn rzp-pay-btn" onClick={handlePayClick} disabled={submitting}>
              {submitting ? (
                <span className="rzp-btn-inner">
                  <span className="rzp-mini-spinner" /> Processing Mock Payment…
                </span>
              ) : (
                <span className="rzp-btn-inner">
                  Pay ₹{total === 0 ? "0" : total.toLocaleString()}
                </span>
              )}
            </button>
            <p className="rzp-secure-text">
              100% Secure. Mock checkout processor active.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Confirmed Page ───────────────────────────────────────────────────────────
const ConfirmedPage = ({ orderInfo, onBackToJourney }) => (
  <div className="confirmed-page">
    <div className="conf-card">
      <div className="conf-check">✓</div>
      <h2 className="conf-title">Booking Confirmed!</h2>
      <p className="conf-sub">Your services have been booked successfully. You'll receive a confirmation email with session details and next steps.</p>
      <div className="conf-details">
        <div className="conf-row"><span>Order ID</span><span className="conf-val">{orderInfo.orderId}</span></div>
        <div className="conf-row"><span>Services Booked</span><span className="conf-val">{orderInfo.itemCount} item{orderInfo.itemCount !== 1 ? "s" : ""}</span></div>
        <div className="conf-row"><span>Amount Paid</span><span className="conf-val">₹{orderInfo.total === 0 ? "0" : orderInfo.total.toLocaleString()}</span></div>
        <div className="conf-row"><span>Date</span><span className="conf-val">{fmtDate(orderInfo.date)}</span></div>
      </div>
      <button className="conf-back-btn" onClick={onBackToJourney}>← Back to My Journey</button>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const UserMarketplace = ({ onStepChange }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // ── Access flags (Forced to true for mockup testing) ─────────────────────
  const hasMicro = true;
  const hasNano = true;

  // ── Component state ────────────────────────────────────────────────────────
  const [page, setPage] = useState("marketplace");
  const [activeLayer, setActiveLayer] = useState(
    location.state?.defaultTab?.toLowerCase() ||
    location.state?.view?.toLowerCase() ||
    "macro"
  );
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQ, setSearchQ] = useState("");
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderInfo, setOrderInfo] = useState(null);
  const [marketplaceFeedback, setMarketplaceFeedback] = useState({});
  const [exclusiveSuccessToast, setExclusiveSuccessToast] = useState(null);
  const [purchasedIds, setPurchasedIds] = useState(new Set());
  const trackedViewsRef = useRef(new Set());

  const trackMarketplaceAnalytics = async (item, action) => {
    if (!item?._id || !MONGO_ID_RE.test(String(item._id))) return;
    try {
      await axios.post(`${API}/api/marketplace/analytics`, {
        service_id: item._id,
        action,
      });
    } catch (err) {
      console.error("Marketplace analytics update failed:", err);
    }
  };

  // Sync active layer if location state changes
  useEffect(() => {
    if (location.state?.view) setActiveLayer(location.state.view.toLowerCase());
  }, [location.state?.view]);

  // Detect return from NaaviExclusive checkout (same-tab fallback via location.state)
  useEffect(() => {
    if (location.state?.exclusiveSuccess) {
      setExclusiveSuccessToast({
        orderId: location.state.orderId || "",
        itemName: location.state.purchasedItem?.name || "Service",
      });
      setCart([]); // Clear cart on success
      const t = setTimeout(() => setExclusiveSuccessToast(null), 8000);
      return () => clearTimeout(t);
    }
  }, [location.state?.exclusiveSuccess]);

  useEffect(() => {
    const handleSuccess = (raw) => {
      try {
        const data = JSON.parse(raw);
        setExclusiveSuccessToast({ orderId: data.orderId || "", itemName: data.itemName || "Service" });
        setCart([]); // Clear cart on success
        localStorage.removeItem("naaviExclusiveSuccess");
        setTimeout(() => setExclusiveSuccessToast(null), 8000);
      } catch (e) { /* ignore */ }
    };

    // 1. Storage Event Listener (instant cross-tab update)
    const onStorage = (e) => {
      if (e.key === "naaviExclusiveSuccess" && e.newValue) {
        handleSuccess(e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);

    // 2. Interval polling (fallback check)
    const interval = setInterval(() => {
      const raw = localStorage.getItem("naaviExclusiveSuccess");
      if (raw) {
        handleSuccess(raw);
      }
    }, 500);

    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(interval);
    };
  }, []);

  // ── Fetch user's existing purchases ──────────────────────────────────────
  useEffect(() => {
    const raw = localStorage.getItem("user");
    const user = raw ? (() => { try { return JSON.parse(raw); } catch { return null; } })() : null;
    const email = user?.user?.email || user?.email;
    if (!email) return;
    axios.get(`${API}/api/payment/user-purchases`, { params: { email } })
      .then(res => {
        const purchases = res.data?.purchases || [];
        setPurchasedIds(new Set(purchases.map(p => p.productId)));
      })
      .catch(err => console.error("Failed to load user purchases:", err));
  }, []);

  // ── Fetch real marketplace items from DB when a step is selected ──────────
  useEffect(() => {
    const stepId = localStorage.getItem("selectedStepId") || "";
    if (!stepId || !MONGO_ID_RE.test(stepId)) {
      setItems([]);
      return;
    }
    setLoading(true);
    axios.get(`${process.env.REACT_APP_API_BASE_URL || "http://localhost:4545"}/api/marketplace/step/${stepId}`)
      .then(res => {
        const fetched = res.data?.data || [];
        setItems(fetched);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  // Filter respects category and search
  const categoryBaseItems = useMemo(() => {
    const q = searchQ.toLowerCase().trim();
    return items.filter(s => {
      // Gate subscription/credit access for paid layers (always allowed in mock mode)
      const isLayerMatched = s.layer === activeLayer;

      const isSearchMatched = !q ||
        s.name?.toLowerCase().includes(q) ||
        s.partner_email?.toLowerCase().includes(q) ||
        s.goal?.toLowerCase().includes(q) ||
        s.role?.toLowerCase().includes(q);

      return isLayerMatched && isSearchMatched;
    });
  }, [items, activeLayer, searchQ]);

  const filtered = useMemo(() => (
    activeCategory === "all"
      ? categoryBaseItems
      : categoryBaseItems.filter(s => getItemCategory(s) === activeCategory)
  ), [categoryBaseItems, activeCategory]);

  const categoryCounts = useMemo(() => {
    const counts = CATEGORY_PILLS.reduce((acc, pill) => ({ ...acc, [pill.key]: 0 }), {});
    categoryBaseItems.forEach((item) => {
      const category = getItemCategory(item);
      counts[category] = (counts[category] || 0) + 1;
      counts.all += 1;
    });
    return counts;
  }, [categoryBaseItems]);

  useEffect(() => {
    filtered.forEach((item) => {
      if (!item?._id || !MONGO_ID_RE.test(String(item._id))) return;
      const key = `${activeLayer}:${activeCategory}:${item._id}`;
      if (trackedViewsRef.current.has(key)) return;
      trackedViewsRef.current.add(key);
      trackMarketplaceAnalytics(item, "view");
    });
  }, [filtered, activeLayer, activeCategory]);

  // Cart helpers
  const toggleCart = (item) => {
    const alreadyIn = cart.some(s => s._id === item._id);
    setCart(prev => alreadyIn ? prev.filter(s => s._id !== item._id) : [...prev, item]);
    if (!alreadyIn) {
      trackMarketplaceAnalytics(item, "cart_addition");
      const layerLabel =
        item.layer === "macro" ? "Macro" :
          item.layer === "micro" ? "Micro" :
            item.layer === "nano" ? "Nano" : "";
      logActivity({
        type: "market",
        title: `Added to cart: ${item.name} (${layerLabel})`,
        desc: `User added "${item.name}" from ${layerLabel} view to cart`,
        pathId: localStorage.getItem("selectedPathId") || "",
        pathName: localStorage.getItem("selectedPathName") || "",
        stepId: localStorage.getItem("selectedStepId") || "",
        stepName: localStorage.getItem("selectedStepName") || "",
        itemName: item.name || "",
        itemCost: isFreeItem(item) ? "Free" : `₹${Number(item.cost).toLocaleString()}`,
        status: "in_progress",
      });
    }
  };

  const handleVisitSite = (item) => {
    trackMarketplaceAnalytics(item, "click");
    // Log the redirect activity
    logActivity({
      type: "market",
      title: `External Checkout: ${item.name}`,
      desc: `User navigated to NaaviExclusive checkout for: ${item.websiteUrl}`,
      pathId: localStorage.getItem("selectedPathId") || "",
      pathName: localStorage.getItem("selectedPathName") || "",
      stepId: localStorage.getItem("selectedStepId") || "",
      stepName: localStorage.getItem("selectedStepName") || "",
      itemName: item.name || "",
      itemCost: getCostDisplay(item),
      status: "exclusive-checkout",
    });
    // ── Store item in sessionStorage so the new tab can read it ──────────────
    // (window.open cannot carry React Router state across tabs)
    sessionStorage.setItem("naaviExclusiveItem", JSON.stringify(item));
    sessionStorage.setItem("naaviExclusiveReturnPath", "/dashboard/users/Marketplace");
    // Open NaaviExclusive in a NEW tab
    window.open("/naavi-exclusive", "_blank", "noopener,noreferrer");
  };

  const handleCardView = (item) => {
    trackMarketplaceAnalytics(item, "click");
    // Navigate or log redirection for external checkout type
    if (item.checkoutType === "external") {
      console.log(`[Redirect] Opening external site: ${item.websiteUrl}`);
      logActivity({
        type: "market",
        title: `Redirect to External Site: ${item.name}`,
        desc: `User redirected to third-party website: ${item.websiteUrl}`,
        pathId: localStorage.getItem("selectedPathId") || "",
        pathName: localStorage.getItem("selectedPathName") || "",
        stepId: localStorage.getItem("selectedStepId") || "",
        stepName: localStorage.getItem("selectedStepName") || "",
        itemName: item.name || "",
        itemCost: getCostDisplay(item),
        status: "redirected",
      });
      return;
    }

    const layerLabel =
      item.layer === "macro" ? "Macro (Free Tools)" :
        item.layer === "micro" ? "Micro (Subscriptions)" :
          item.layer === "nano" ? "Nano (1-on-1 Sessions)" :
            item.layer || "";

    logActivity({
      type: "market",
      title: `Browsed ${layerLabel}: ${item.name}`,
      desc: `User viewed "${item.name}" in ${layerLabel} view`,
      pathId: localStorage.getItem("selectedPathId") || "",
      pathName: localStorage.getItem("selectedPathName") || "",
      stepId: localStorage.getItem("selectedStepId") || "",
      stepName: localStorage.getItem("selectedStepName") || "",
      itemName: item.name || "",
      itemCost: isFreeItem(item) ? "Free" : `₹${Number(item.cost).toLocaleString()}`,
      status: "viewed",
    });
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(s => s._id !== id));
  const inCart = (id) => cart.some(s => s._id === id);
  const handleConfirm = (info) => {
    navigate("/purchase/success", {
      state: {
        orderId: info.orderId,
        purchasedItem: info.item || null,
        studentEmail: info.studentEmail || ""
      }
    });
    setCart([]); // Clear cart
  };
  const currentPageKey = page === "marketplace" ? "marketplace" : page === "checkout" ? "checkout" : "confirmed";

  const updateMarketplaceFeedback = async (itemId, nextValue) => {
    setMarketplaceFeedback(prev => ({
      ...prev,
      [itemId]: nextValue,
    }));

    try {
      const raw = localStorage.getItem("user");
      const user = raw ? (() => { try { return JSON.parse(raw); } catch { return null; } })() : null;
      const email = user?.email || user?.user?.email || "praneethsunkara143@gmail.com";

      const pathId = localStorage.getItem("selectedPathId") || "";
      const stepId = localStorage.getItem("selectedStepId") || "";
      const pathName = localStorage.getItem("selectedPathName") || "";
      const stepName = localStorage.getItem("selectedStepName") || "";

      // Find the specific marketplace item to get its name and category
      const item = items.find(i => String(i._id) === String(itemId)) || {};

      const BACKEND_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:4545";
      await axios.post(`${BACKEND_URL}/api/feedback`, {
        type: "marketplace",
        studentEmail: email,
        pathId,
        stepId,
        pathName,
        stepName,
        providerName: item.name || item.title || "Marketplace Resource",
        providerType: item.category || item.role || "vendor",
        partner_email: item.partner_email || "praneethsunkara143@gmail.com",
        providerEmail: item.partner_email || "praneethsunkara143@gmail.com",
        marketplaceItemId: itemId,
        service_id: itemId,
        action: nextValue.action || "",
        comment: nextValue.comment || "",
      });
      console.log("Marketplace feedback submitted for item:", item.name || itemId);
    } catch (err) {
      console.error("Error submitting marketplace feedback:", err);
    }

  };

  const renderServiceGroup = (groupItems) => (
    <div className="svc-grid">
      {groupItems.map(s => (
        <ServiceCard
          key={s._id}
          item={s}
          inCart={inCart(s._id)}
          onToggleCart={toggleCart}
          onCardView={handleCardView}
          onVisitSite={handleVisitSite}
          feedback={marketplaceFeedback[s._id]}
          onFeedbackChange={(nextValue) => updateMarketplaceFeedback(s._id, nextValue)}
          isPurchased={purchasedIds.has(String(s._id))}
        />
      ))}
    </div>
  );

  const renderPartnerGroups = (groupItems) => {
    if (activeCategory !== "all") {
      return renderServiceGroup(groupItems);
    }

    return CATEGORY_PILLS
      .filter(({ key }) => key !== "all")
      .map(({ key, label }) => {
        const partnerItems = groupItems.filter(s => getItemCategory(s) === key);
        if (!partnerItems.length) return null;

        return (
          <div className="partner-group" key={key}>
            <div className="partner-group-head">
              <span className="partner-group-title">{label}</span>
              <div className="partner-group-line" />
              <span className="partner-group-count">
                {partnerItems.length} service{partnerItems.length !== 1 ? "s" : ""}
              </span>
            </div>
            {renderServiceGroup(partnerItems)}
          </div>
        );
      });
  };

  const renderServices = () => {
    if (error) return (
      <div className="mkt-status-box">
        <div style={{ fontSize: 36 }}>⚠️</div>
        <p>{error}</p>
      </div>
    );

    if (filtered.length === 0) return (
      <div className="mkt-status-box">
        <div style={{ fontSize: 36 }}>🔍</div>
        <p>No services found matching the criteria.</p>
      </div>
    );

    // Single-layer view (Macro, Micro, or Nano tab)
    const meta = LAYER_META[activeLayer];
    return (
      <>
        <div className="vsh">
          <span className={`vsh-badge ${meta.badgeCls}`}>{meta.label}</span>
          <span className="vsh-sub">{meta.sub}</span>
          <div className="vsh-line" />
          <span className="vsh-cnt">{filtered.length} service{filtered.length !== 1 ? "s" : ""}</span>
        </div>
        {renderPartnerGroups(filtered)}
      </>
    );
  };

  return (
    <div className="user-marketplace">

      <StepBar
        currentPage={currentPageKey}
        onStepChange={(key) => {
          if (key === "currentStep") { onStepChange && onStepChange("currentStep"); }
          else if (key === "marketplace") setPage("marketplace");
        }}
      />

      {/* ── Exclusive Checkout Success Banner ───────────────────────────────── */}
      {exclusiveSuccessToast && (
        <div style={{
          margin: "16px 24px",
          background: "linear-gradient(135deg, rgba(16,185,129,.12) 0%, rgba(99,102,241,.1) 100%)",
          border: "1px solid rgba(16,185,129,.35)",
          borderRadius: 12,
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          animation: "fadeInDown 0.4s ease",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 22 }}>✅</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#f0f4ff" }}>
                Marketplace Enrollment Successful!
              </div>
              <div style={{ fontSize: "0.78rem", color: "#8b9abf", marginTop: 2 }}>
                <strong style={{ color: "#10b981" }}>{exclusiveSuccessToast.itemName}</strong> has been activated.
                {exclusiveSuccessToast.orderId && (
                  <> &nbsp;·&nbsp; Order: <span style={{ color: "#6366f1" }}>{exclusiveSuccessToast.orderId}</span></>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => setExclusiveSuccessToast(null)}
            style={{
              background: "none", border: "none", color: "#4a5578",
              cursor: "pointer", fontSize: "1.1rem", padding: "2px 6px",
              lineHeight: 1,
            }}
            title="Dismiss"
          >✕</button>
        </div>
      )}

      {page === "marketplace" && (
        <div className="mkt-body">
          <div className="mkt-layout">
            <div className="mkt-main">

              <div className="mkt-topbar">
                {/* Search */}
                <div className="mkt-sw">
                  <svg className="mkt-si-icon" viewBox="0 0 20 20" fill="none">
                    <circle cx="8.5" cy="8.5" r="5.25" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M13 13l3.2 3.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                  <input
                    className="mkt-si-input"
                    type="text"
                    placeholder="Search services, roles, partners…"
                    value={searchQ}
                    onChange={e => setSearchQ(e.target.value)}
                  />
                  {searchQ && <button className="mkt-si-clear" onClick={() => setSearchQ("")}>✕</button>}
                </div>

                <div className="mkt-div" />

                {/* Layer pills */}
                <div className="vpills">
                  {LAYER_PILLS.map(({ key, label }) => (
                    <button
                      key={key}
                      className={`vpill vpill--${key} ${activeLayer === key ? "active" : ""}`}
                      onClick={() => {
                        setActiveLayer(key);
                        setActiveCategory("all");
                      }}
                    >
                      <span className="vpill-label">{label}</span>
                    </button>
                  ))}
                </div>

                <div className="mkt-div" />

                {/* Cart button */}
                <button className="cart-top-btn" onClick={() => setShowCart(true)}>
                  <svg className="cart-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
                    <path d="M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Cart</span>
                  {cart.length > 0 && <span className="cart-top-badge">{cart.length}</span>}
                </button>
              </div>

              <div className="mkt-filter-row">
                <div className="category-pills">
                  {CATEGORY_PILLS.map(({ key, label }) => (
                    <button
                      key={key}
                      className={`category-pill ${activeCategory === key ? "active" : ""}`}
                      onClick={() => setActiveCategory(key)}
                    >
                      <span>{label}</span>
                      <span className="category-pill-count">{categoryCounts[key] || 0}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="services-container">
                {loading
                  ? <div className="mkt-loading"><div className="mkt-spinner" /><p>Loading services…</p></div>
                  : renderServices()
                }
              </div>

            </div>
          </div>
        </div>
      )}

      {page === "checkout" && (
        <div className="mkt-body">
          <CheckoutPage cart={cart} onConfirm={handleConfirm} onBack={() => setPage("marketplace")} />
        </div>
      )}

      {page === "confirmed" && orderInfo && (
        <div className="mkt-body">
          <ConfirmedPage orderInfo={orderInfo} onBackToJourney={() => onStepChange && onStepChange("myJourney")} />
        </div>
      )}

      {showCart && (
        <CartDrawer
          cart={cart}
          onRemove={removeFromCart}
          onClose={() => setShowCart(false)}
          onCheckout={() => {
            setShowCart(false);
            const externalItem = cart.find(item => item.checkoutType === "external");
            if (externalItem) {
              sessionStorage.setItem("naaviExclusiveItem", JSON.stringify(externalItem));
              sessionStorage.setItem("naaviExclusiveReturnPath", "/dashboard/users/Marketplace");
              localStorage.setItem("naaviExclusiveItemId", externalItem._id);
              window.open(`/naavi-exclusive/${externalItem.partnerId || ""}`, "_blank");
              return;
            }
            setPage("checkout");
          }}
        />
      )}

    </div>
  );
};

export default UserMarketplace;