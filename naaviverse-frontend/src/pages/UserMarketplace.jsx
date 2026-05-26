import React, { useState, useMemo, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "./UserMarketplace.scss";

import logActivity from "../utils/activityLogger";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const LAYER_META = {
  macro: { label: "MACRO VIEW — FREE TOOLS", sub: "Free tools to get started.", badgeCls: "vsh-macro", cardCls: "vMacro" },
  micro: { label: "MICRO VIEW — SUBSCRIPTIONS", sub: "Structured progress tracking.", badgeCls: "vsh-micro", cardCls: "vMicro" },
  nano: { label: "NANO VIEW — 1-ON-1 SESSIONS", sub: "Book a personalised expert session.", badgeCls: "vsh-nano", cardCls: "vNano" },
};
const LAYER_ICON = {
  macro: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  micro: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  nano:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 6 3 6 3s6-1 6-3v-5"/></svg>,
};
const TIME_SLOTS = ["10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM", "6:00 PM", "8:00 PM"];
const LAYER_PILLS = [
  { key: "all", label: "All" },
  { key: "macro", label: "Macro" },
  { key: "micro", label: "Micro" },
  { key: "nano", label: "Nano" },
];

const isFreeItem = (s) => {
  if (!s.cost) return true;
  const val = String(s.cost).trim().toLowerCase();
  return val === "0" || val === "free" || val === "";
};

const itemPrice = (s) => {
  if (isFreeItem(s)) return 0;
  const raw = String(s.cost).trim();
  const match = raw.match(/[\d,]+\.?\d*/);
  if (!match) return 0;
  return parseFloat(match[0].replace(/,/g, "")) || 0;
};

const getCostDisplay = (s) => {
  if (isFreeItem(s)) return "Free";
  const raw = String(s.cost).trim();
  if (/[a-zA-Z$]/.test(raw)) return raw;
  const num = parseFloat(raw.replace(/[^\d.]/g, ""));
  return isNaN(num) ? raw : `₹${num.toLocaleString("en-IN")}`;
};

const fmtPrice = (n) => n === 0 ? "Free" : `₹${n.toLocaleString()}`;
const genOrderId = () => `#NV-${Math.floor(100000 + Math.random() * 900000)}`;
const fmtDate = (d) => d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

// ─── Service Card ─────────────────────────────────────────────────────────────
const ServiceCard = ({ item, inCart, onToggleCart, onCardView }) => {
  const layer = item.layer?.toLowerCase() || "macro";
  const meta = LAYER_META[layer] || LAYER_META.macro;
  const free = isFreeItem(item);
  return (
    <div className={`svc-card ${meta.cardCls}`} onClick={() => onCardView && onCardView(item)}>
      <div className="svc-top">
        <div className="svc-tags">
          {item.role && <span className="svc-tag role-tag">{item.role}</span>}
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
      <div className="svc-bot">
        <div className="svc-price-wrap">
          <div className={`svc-price ${free ? "free-price" : ""}`}>{getCostDisplay(item)}</div>
          <div className="svc-billing">{free ? "No cost" : (item.access || "")}</div>
        </div>
        <button
          className={`svc-add ${inCart ? "added" : ""}`}
          onClick={(e) => { e.stopPropagation(); onToggleCart(item); }}
        >
          {inCart ? "✓ Added" : "+ Add"}
        </button>
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
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: 8, verticalAlign: "middle"}}>
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
  Your Cart
</h2>
          <button className="cd-close" onClick={onClose}>✕</button>
        </div>
        {cart.length === 0 ? (
          <div className="cd-empty">
            <div className="cd-empty-icon">
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
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
  const userEmail = userRaw?.user?.email || userRaw?.email || "";
  const userName = userRaw?.user?.displayName || userRaw?.displayName || "";

  const [fullName, setFullName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [phone, setPhone] = useState("");
  const [prefDate, setPrefDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("10:00 AM");
  const [payMethod, setPayMethod] = useState("Card");
  const [cardNum, setCardNum] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [upiId, setUpiId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const subtotal = cart.reduce((a, s) => a + itemPrice(s), 0);
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + tax;

  const handlePay = async () => {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));
    const orderId = genOrderId();
    const stepId = localStorage.getItem("selectedStepId") || "";
    const stepName = localStorage.getItem("selectedStepName") || "";
    const pathId = localStorage.getItem("selectedPathId") || "";
    const pathName = localStorage.getItem("selectedPathName") || "";

    cart.forEach((item) => {
      logActivity({
        type: "market",
        title: `Purchased: ${item.name}`,
        desc: `Bought "${item.name}" · Order ${orderId}`,
        pathId, pathName, stepId, stepName,
        itemName: item.name || "",
        itemCost: isFreeItem(item) ? "Free" : `₹${Number(item.cost).toLocaleString()}`,
        status: "completed",
      });
    });

    onConfirm({ orderId, total, itemCount: cart.length, date: new Date() });
    setSubmitting(false);
  };
  
  return (
    <div className="checkout-page">
      <div className="chk-layout">
        <div className="chk-left">
          <h1 className="chk-title">Checkout</h1>
          <div className="chk-section">
            <div className="chk-section-lbl">Personal Details</div>
            <div className="chk-field"><label>Full Name</label><input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" /></div>
            <div className="chk-field"><label>Email Address</label><input value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" /></div>
            <div className="chk-field"><label>Phone Number</label><input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" /></div>
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
            <div className="chk-section-lbl">Payment Method</div>
            <div className="pay-methods">
              {["Card", "UPI", "Net Banking"].map(m => (
                <div key={m} className={`pay-method ${payMethod === m ? "active" : ""}`} onClick={() => setPayMethod(m)}>
                  {m === "Card" && " "}{m === "UPI" && ""}{m === "Net Banking" && ""}{m}
                </div>
              ))}
            </div>
            {payMethod === "Card" && (
              <>
                <div className="chk-field"><label>Card Number</label><input value={cardNum} onChange={e => setCardNum(e.target.value)} placeholder="4242 4242 4242 4242" maxLength={19} /></div>
                <div className="chk-row2">
                  <div className="chk-field"><label>Expiry</label><input value={expiry} onChange={e => setExpiry(e.target.value)} placeholder="MM / YY" /></div>
                  <div className="chk-field"><label>CVV</label><input value={cvv} onChange={e => setCvv(e.target.value)} placeholder="•••" maxLength={3} type="password" /></div>
                </div>
              </>
            )}
            {payMethod === "UPI" && (
              <div className="chk-field"><label>UPI ID</label><input value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@upi" /></div>
            )}
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
</span>                  <span className="os-name">{s.name}</span>
                  <span className="os-price">{getCostDisplay(s)}</span>
                </div>
              ))}
            </div>
            <div className="os-divider" />
            <div className="os-sum-row"><span>GST (18%)</span><span>₹{tax === 0 ? "0" : tax.toLocaleString()}</span></div>
            <div className="os-sum-row os-total"><span>Total</span><span>₹{total === 0 ? "0" : total.toLocaleString()}</span></div>
            <button className="os-pay-btn" onClick={handlePay} disabled={submitting}>
              {submitting ? "Processing…" : `Pay ₹${total === 0 ? "0" : total.toLocaleString()} →`}
            </button>
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

  // ── Access flags ───────────────────────────────────────────────────────────
  const isSubscribed = location.state?.subscribed ?? false;
  const creditUnlocked = location.state?.creditUnlocked || { micro: false, nano: false };
  const subTier = location.state?.subTier || null;

  // A user can see micro if:
  //   • they have an active micro or nano subscription, OR
  //   • they credit-unlocked micro on this step, OR
  //   • they credit-unlocked nano (nano unlock implies micro access)
  // FIXED — isSubscribed alone doesn't grant access; only credit unlocks do
  // ✅ FIXED — subscription also grants access
  const hasMicro = creditUnlocked.micro || isSubscribed;
  const hasNano = creditUnlocked.nano || (isSubscribed && (subTier === "nano" || subTier === "platinum"));

  // ── Component state ────────────────────────────────────────────────────────
  const [page, setPage] = useState("marketplace");
  const [activeLayer, setActiveLayer] = useState(
    location.state?.defaultTab?.toLowerCase() ||
    location.state?.view?.toLowerCase() ||
    "all"
  );
  const [activeRole, setActiveRole] = useState("All");
  const [searchQ, setSearchQ] = useState("");
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orderInfo, setOrderInfo] = useState(null);

  const marketLoggedRef = useRef(false);

  // Sync active layer if location state changes
  useEffect(() => {
    if (location.state?.view) setActiveLayer(location.state.view.toLowerCase());
  }, [location.state?.view]);

  // Fetch services for the current step
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true); setError("");
      try {
        const stepId = localStorage.getItem("selectedStepId");
        if (!stepId) { setError("No step selected."); setLoading(false); return; }

        const res = await axios.get(`${BASE_URL}/api/marketplace/step/${stepId}`);
        if (res?.data?.status && Array.isArray(res.data.data)) {
          setItems(res.data.data);

          if (!marketLoggedRef.current) {
            marketLoggedRef.current = true;
            const stepName = localStorage.getItem("selectedStepName") || "";
            const pathName = localStorage.getItem("selectedPathName") || "";
            const pathId = localStorage.getItem("selectedPathId") || "";
            logActivity({
              type: "market",
              title: "Browsing marketplace",
              desc: `User opened Marketplace${stepName ? ` for step "${stepName}"` : ""}`,
              pathId, pathName, stepId, stepName,
              status: "viewed",
            });
          }
        } else {
          setItems([]);
        }
      } catch (err) {
        console.error("❌ Marketplace fetch error:", err);
        setError("Failed to load services. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  // Layer item counts (for reference / future UI use)
  const layerCounts = useMemo(() => ({
    all: items.length,
    macro: items.filter(s => s.layer === "macro").length,
    micro: items.filter(s => s.layer === "micro").length,
    nano: items.filter(s => s.layer === "nano").length,
  }), [items]);

  // ── FIX 1: filter respects credit unlocks, not just subscription ───────────
  const filtered = useMemo(() => {
    const q = searchQ.toLowerCase();
    return items.filter(s => {
      // Gate each layer individually
      const layerAllowed =
        s.layer === "macro" ? true :   // macro always free
          s.layer === "micro" ? hasMicro :   // micro: sub OR credit unlock
            s.layer === "nano" ? hasNano :   // nano:  sub OR credit unlock
              true;                               // unknown layers: show

      return (
        layerAllowed &&
        (activeLayer === "all" || s.layer === activeLayer) &&
        (activeRole === "All" || s.role === activeRole) &&
        (!q ||
          s.name?.toLowerCase().includes(q) ||
          s.partner_email?.toLowerCase().includes(q) ||
          s.goal?.toLowerCase().includes(q))
      );
    });
  }, [items, activeLayer, activeRole, searchQ, hasMicro, hasNano]);

  // Cart helpers
  const toggleCart = (item) => {
    const alreadyIn = cart.some(s => s._id === item._id);
    setCart(prev => alreadyIn ? prev.filter(s => s._id !== item._id) : [...prev, item]);
    if (!alreadyIn) {
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

  const handleCardView = (item) => {
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
  const handleConfirm = (info) => { setOrderInfo(info); setPage("confirmed"); setShowCart(false); };
  const currentPageKey = page === "marketplace" ? "marketplace" : page === "checkout" ? "checkout" : "confirmed";

  // ── FIX 2: renderServices uses hasMicro/hasNano, not isSubscribed ──────────
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
        <p>No services found for this step yet.</p>
      </div>
    );

    // Single-layer view (user clicked a specific pill)
    if (activeLayer !== "all") {
      const meta = LAYER_META[activeLayer];
      return (
        <>
          <div className="vsh">
            <span className={`vsh-badge ${meta.badgeCls}`}>{meta.label}</span>
            <span className="vsh-sub">{meta.sub}</span>
            <div className="vsh-line" />
            <span className="vsh-cnt">{filtered.length} service{filtered.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="svc-grid">
            {filtered.map(s => (
              <ServiceCard
                key={s._id}
                item={s}
                inCart={inCart(s._id)}
                onToggleCart={toggleCart}
                onCardView={handleCardView}
              />
            ))}
          </div>
        </>
      );
    }

    // "All" view — show only layers the user has access to
    // macro is always shown; micro/nano depend on subscription or credit unlock
    const visibleLayers = ["macro"];
    if (hasMicro) visibleLayers.push("micro");
    if (hasNano) visibleLayers.push("nano");

    return visibleLayers.map(layer => {
      const group = filtered.filter(s => s.layer === layer);
      if (!group.length) return null;
      const meta = LAYER_META[layer];
      return (
        <React.Fragment key={layer}>
          <div className="vsh">
            <span className={`vsh-badge ${meta.badgeCls}`}>{meta.label}</span>
            <span className="vsh-sub">{meta.sub}</span>
            <div className="vsh-line" />
            <span className="vsh-cnt">{group.length} service{group.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="svc-grid">
            {group.map(s => (
              <ServiceCard
                key={s._id}
                item={s}
                inCart={inCart(s._id)}
                onToggleCart={toggleCart}
                onCardView={handleCardView}
              />
            ))}
          </div>
        </React.Fragment>
      );
    });
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

                {/* ── FIX 3: Layer pills — show all accessible layers, not just the active one */}
                <div className="vpills">
                  {LAYER_PILLS.filter(({ key }) => {
                    if (key === "all") return true;          // always show "All"
                    if (key === "macro") return true;          // macro always free
                    if (key === "micro") return hasMicro;      // micro: sub or credit unlock
                    if (key === "nano") return hasNano;       // nano:  sub or credit unlock
                    return false;
                  }).map(({ key, label }) => (
                    <button
                      key={key}
                      className={`vpill vpill--${key} ${activeLayer === key ? "active" : ""}`}
                      onClick={() => setActiveLayer(key)}
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
          onCheckout={() => { setShowCart(false); setPage("checkout"); }}
        />
      )}

    </div>
  );
};

export default UserMarketplace;