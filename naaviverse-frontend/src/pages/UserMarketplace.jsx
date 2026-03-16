import React, { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "./UserMarketplace.scss";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const LAYER_META = {
  macro: { label: "MACRO VIEW — FREE TOOLS",       sub: "Free tools to get started.",           badgeCls: "vsh-macro", cardCls: "vMacro", pill: "🔵 Macro" },
  micro: { label: "MICRO VIEW — SUBSCRIPTIONS",    sub: "Structured progress tracking.",        badgeCls: "vsh-micro", cardCls: "vMicro", pill: "🟢 Micro" },
  nano:  { label: "NANO VIEW — 1-ON-1 SESSIONS",   sub: "Book a personalised expert session.",  badgeCls: "vsh-nano",  cardCls: "vNano",  pill: "🟡 Nano"  },
};
const LAYER_ICON = { macro: "📊", micro: "📚", nano: "🎓" };
const TIME_SLOTS = ["10:00 AM","12:00 PM","2:00 PM","4:00 PM","6:00 PM","8:00 PM"];

// ─── helpers ────────────────────────────────────────────────────────────────
const isFreeItem = (s) => !s.cost || s.cost === "0" || s.cost?.toLowerCase() === "free";
const itemPrice  = (s) => isFreeItem(s) ? 0 : Number(s.cost) || 0;
const fmtPrice   = (n) => n === 0 ? "Free" : `₹${n.toLocaleString()}`;
const genOrderId = () => `#NV-${Math.floor(100000 + Math.random() * 900000)}`;
const fmtDate    = (d) => d.toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" });

// ─── Service Card ────────────────────────────────────────────────────────────
const ServiceCard = ({ item, inCart, onToggleCart }) => {
  const layer = item.layer?.toLowerCase() || "macro";
  const meta  = LAYER_META[layer] || LAYER_META.macro;
  const free  = isFreeItem(item);
  return (
    <div className={`svc-card ${meta.cardCls}`}>
      <div className="svc-top">
        <div className="svc-tags">
          <span className={`svc-tag layer-tag layer-${layer}`}>{layer.charAt(0).toUpperCase()+layer.slice(1)}</span>
          {item.role && <span className="svc-tag role-tag">{item.role}</span>}
          {free       && <span className="svc-tag st-free">Free</span>}
        </div>
        <span className="svc-ico">{LAYER_ICON[layer]}</span>
        <div className="svc-name">{item.name || "Unnamed Service"}</div>
        <div className="svc-by">by {item.partner_email || ""}</div>
        {item.goal && <div className="svc-desc">{item.goal}</div>}
        <div className="svc-details">
          {item.outcomes   && <div className="svc-detail-row"><span className="svc-detail-lbl">Outcomes:</span><span>{item.outcomes}</span></div>}
          {item.duration   && <div className="svc-detail-row"><span className="svc-detail-lbl">Duration:</span><span>{item.duration}</span></div>}
          {item.iterations && <div className="svc-detail-row"><span className="svc-detail-lbl">Sessions:</span><span>{item.iterations}</span></div>}
          {item.discount   && <div className="svc-detail-row"><span className="svc-detail-lbl">Discount:</span><span>{item.discount}</span></div>}
          {item.features   && <div className="svc-detail-row"><span className="svc-detail-lbl">Features:</span><span>{item.features}</span></div>}
        </div>
      </div>
      <div className="svc-bot">
        <div className="svc-price-wrap">
          <div className={`svc-price ${free ? "free-price" : ""}`}>{free ? "Free" : `₹${Number(item.cost).toLocaleString()}`}</div>
          <div className="svc-billing">{free ? "No cost" : (item.access || "")}</div>
        </div>
        <button className={`svc-add ${inCart ? "added" : ""}`} onClick={() => onToggleCart(item)}>
          {inCart ? "✓ Added" : "+ Add"}
        </button>
      </div>
    </div>
  );
};

// ─── Cart Drawer ─────────────────────────────────────────────────────────────
const CartDrawer = ({ cart, onRemove, onClose, onCheckout }) => {
  const subtotal = cart.reduce((a, s) => a + itemPrice(s), 0);
  const tax   = Math.round(subtotal * 0.18);
  const total = subtotal + tax;
  return (
    <div className="cart-drawer-overlay" onClick={onClose}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="cd-header">
          <h2>🛒 Your Cart</h2>
          <button className="cd-close" onClick={onClose}>✕</button>
        </div>
        {cart.length === 0 ? (
          <div className="cd-empty">
            <div className="cd-empty-icon">🛒</div>
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
                    <div className="ci-ico">{LAYER_ICON[layer]}</div>
                    <div className="ci-inf">
                      <div className="ci-name">{s.name}</div>
                      <div className="ci-meta">
                        <span className={`ci-layer ci-${layer}`}>{layer.charAt(0).toUpperCase()+layer.slice(1)}</span>
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
    { key: "marketplace", label: "Marketplace",  n: 2 },
    { key: "cart",        label: "Cart",         n: 3 },
    { key: "checkout",    label: "Checkout",     n: 4 },
    { key: "confirmed",   label: "Confirmed",    n: 5 },
  ];
  const order = steps.map(s => s.key);
  const ci    = order.indexOf(currentPage);
  return (
    <div className="step-bar">
      {steps.map((s, i) => {
        const done   = i < ci;
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
  const userRaw    = (() => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } })();
  const userEmail  = userRaw?.user?.email || userRaw?.email || "";
  const userName   = userRaw?.user?.displayName || userRaw?.displayName || "";

  const [fullName,    setFullName]    = useState(userName);
  const [email,       setEmail]       = useState(userEmail);
  const [phone,       setPhone]       = useState("");
  const [prefDate,    setPrefDate]    = useState("");
  const [timeSlot,    setTimeSlot]    = useState("10:00 AM");
  const [payMethod,   setPayMethod]   = useState("Card");
  const [cardNum,     setCardNum]     = useState("");
  const [expiry,      setExpiry]      = useState("");
  const [cvv,         setCvv]         = useState("");
  const [upiId,       setUpiId]       = useState("");
  const [submitting,  setSubmitting]  = useState(false);

  const subtotal = cart.reduce((a, s) => a + itemPrice(s), 0);
  const tax      = Math.round(subtotal * 0.18);
  const total    = subtotal + tax;

  const handlePay = async () => {
    setSubmitting(true);
    // Dummy 1s delay simulating transaction
    await new Promise(r => setTimeout(r, 1000));
    const orderId = genOrderId();
    onConfirm({ orderId, total, itemCount: cart.length, date: new Date() });
    setSubmitting(false);
  };

  return (
    <div className="checkout-page">
      <div className="chk-layout">

        {/* Left — form */}
        <div className="chk-left">
          <h1 className="chk-title">Checkout</h1>

          {/* Personal Details */}
          <div className="chk-section">
            <div className="chk-section-lbl">Personal Details</div>
            <div className="chk-field">
              <label>Full Name</label>
              <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" />
            </div>
            <div className="chk-field">
              <label>Email Address</label>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
            </div>
            <div className="chk-field">
              <label>Phone Number</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" />
            </div>
          </div>

          {/* Schedule Session */}
          <div className="chk-section">
            <div className="chk-section-lbl">Schedule Session</div>
            <div className="chk-field">
              <label>Preferred Date</label>
              <input type="date" value={prefDate} onChange={e => setPrefDate(e.target.value)} />
            </div>
            <div className="chk-field">
              <label>Select Time Slot</label>
              <div className="time-slots">
                {TIME_SLOTS.map(t => (
                  <div key={t} className={`time-slot ${timeSlot === t ? "active" : ""}`} onClick={() => setTimeSlot(t)}>{t}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="chk-section">
            <div className="chk-section-lbl">Payment Method</div>
            <div className="pay-methods">
              {["Card","UPI","Net Banking"].map(m => (
                <div key={m} className={`pay-method ${payMethod === m ? "active" : ""}`} onClick={() => setPayMethod(m)}>
                  {m === "Card" && "💳 "}{m === "UPI" && "📱 "}{m === "Net Banking" && "🏦 "}{m}
                </div>
              ))}
            </div>

            {payMethod === "Card" && (
              <>
                <div className="chk-field">
                  <label>Card Number</label>
                  <input value={cardNum} onChange={e => setCardNum(e.target.value)} placeholder="4242 4242 4242 4242" maxLength={19} />
                </div>
                <div className="chk-row2">
                  <div className="chk-field">
                    <label>Expiry</label>
                    <input value={expiry} onChange={e => setExpiry(e.target.value)} placeholder="MM / YY" />
                  </div>
                  <div className="chk-field">
                    <label>CVV</label>
                    <input value={cvv} onChange={e => setCvv(e.target.value)} placeholder="•••" maxLength={3} type="password" />
                  </div>
                </div>
              </>
            )}
            {payMethod === "UPI" && (
              <div className="chk-field">
                <label>UPI ID</label>
                <input value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@upi" />
              </div>
            )}
          </div>
        </div>

        {/* Right — Order Summary */}
        <div className="chk-right">
          <div className="order-summary">
            <div className="os-title">Order Summary</div>
            <div className="os-items">
              {cart.map(s => (
                <div className="os-row" key={s._id}>
                  <span className="os-ico">{LAYER_ICON[s.layer?.toLowerCase() || "macro"]}</span>
                  <span className="os-name">{s.name}</span>
                  <span className="os-price">{isFreeItem(s) ? "Free" : `₹${Number(s.cost).toLocaleString()}`}</span>
                </div>
              ))}
            </div>
            <div className="os-divider" />
            <div className="os-sum-row"><span>GST (18%)</span><span>₹{tax === 0 ? "0" : tax.toLocaleString()}</span></div>
            <div className="os-sum-row os-total"><span>Total</span><span>₹{total === 0 ? "0" : total.toLocaleString()}</span></div>
            <button className="os-pay-btn" onClick={handlePay} disabled={submitting}>
              {submitting ? "Processing..." : `Pay ₹${total === 0 ? "0" : total.toLocaleString()} →`}
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
      <p className="conf-sub">
        Your services have been booked successfully. You'll receive a confirmation email with session details and next steps.
      </p>
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

  // Page: "marketplace" | "checkout" | "confirmed"
  const [page, setPage] = useState("marketplace");

  const [activeLayer, setActiveLayer] = useState(location.state?.view?.toLowerCase() || "all");
  const [activeRole,  setActiveRole]  = useState("All");
  const [maxCost,     setMaxCost]     = useState(100000);
  const [searchQ,     setSearchQ]     = useState("");
  const [cart,        setCart]        = useState([]);
  const [showCart,    setShowCart]    = useState(false);
  const [items,       setItems]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [orderInfo,   setOrderInfo]   = useState(null);

  useEffect(() => {
    if (location.state?.view) setActiveLayer(location.state.view.toLowerCase());
  }, [location.state?.view]);

  // Fetch real data
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true); setError("");
      try {
        const stepId = localStorage.getItem("selectedStepId");
        if (!stepId) { setError("No step selected."); setLoading(false); return; }
        const res = await axios.get(`${BASE_URL}/api/marketplace/step/${stepId}`);
        if (res?.data?.status && Array.isArray(res.data.data)) setItems(res.data.data);
        else setItems([]);
      } catch (err) {
        console.error("❌ Marketplace fetch error:", err);
        setError("Failed to load services. Please try again.");
      } finally { setLoading(false); }
    };
    fetchItems();
  }, []);

  const layerCounts = useMemo(() => ({
    all:   items.length,
    macro: items.filter(s => s.layer === "macro").length,
    micro: items.filter(s => s.layer === "micro").length,
    nano:  items.filter(s => s.layer === "nano").length,
  }), [items]);

  const allRoles = useMemo(() => {
    const roles = [...new Set(items.map(s => s.role).filter(Boolean))];
    return ["All", ...roles];
  }, [items]);

  const filtered = useMemo(() => {
    const q = searchQ.toLowerCase();
    return items.filter(s => {
      const cost = Number(s.cost) || 0;
      return (
        (activeLayer === "all" || s.layer === activeLayer) &&
        (activeRole === "All" || s.role === activeRole) &&
        cost <= maxCost &&
        (!q || s.name?.toLowerCase().includes(q) || s.partner_email?.toLowerCase().includes(q) || s.goal?.toLowerCase().includes(q))
      );
    });
  }, [items, activeLayer, activeRole, maxCost, searchQ]);

  const toggleCart    = (item) => setCart(prev => prev.find(s => s._id === item._id) ? prev.filter(s => s._id !== item._id) : [...prev, item]);
  const removeFromCart = (id)  => setCart(prev => prev.filter(s => s._id !== id));
  const inCart         = (id)  => cart.some(s => s._id === id);

  const handleConfirm = (info) => { setOrderInfo(info); setPage("confirmed"); setShowCart(false); };

  const currentPageKey = page === "marketplace" ? "marketplace" : page === "checkout" ? "checkout" : "confirmed";

  const renderServices = () => {
    if (error) return <div className="mkt-status-box"><div style={{ fontSize:36 }}>⚠️</div><p>{error}</p></div>;
    if (filtered.length === 0) return <div className="mkt-status-box"><div style={{ fontSize:36 }}>🔍</div><p>No services found for this step yet.</p></div>;
    if (activeLayer !== "all") {
      const meta = LAYER_META[activeLayer];
      return <>
        <div className="vsh">
          <span className={`vsh-badge ${meta.badgeCls}`}>{meta.label}</span>
          <span className="vsh-sub">{meta.sub}</span>
          <div className="vsh-line" />
          <span className="vsh-cnt">{filtered.length} service{filtered.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="svc-grid">
          {filtered.map(s => <ServiceCard key={s._id} item={s} inCart={inCart(s._id)} onToggleCart={toggleCart} />)}
        </div>
      </>;
    }
    return ["macro","micro","nano"].map(layer => {
      const group = filtered.filter(s => s.layer === layer);
      if (!group.length) return null;
      const meta = LAYER_META[layer];
      return <React.Fragment key={layer}>
        <div className="vsh">
          <span className={`vsh-badge ${meta.badgeCls}`}>{meta.label}</span>
          <span className="vsh-sub">{meta.sub}</span>
          <div className="vsh-line" />
          <span className="vsh-cnt">{group.length} service{group.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="svc-grid">
          {group.map(s => <ServiceCard key={s._id} item={s} inCart={inCart(s._id)} onToggleCart={toggleCart} />)}
        </div>
      </React.Fragment>;
    });
  };

  return (
    <div className="user-marketplace">

      <StepBar currentPage={currentPageKey} onStepChange={(key) => { if (key === "currentStep") { onStepChange && onStepChange("currentStep"); } else if (key === "marketplace") setPage("marketplace"); }} />

      {/* ── MARKETPLACE PAGE ── */}
      {page === "marketplace" && (
        <div className="mkt-body">
          <div className="mkt-layout">
            <aside className="mkt-filters">
              <div className="mf-lbl" style={{ marginTop:0 }}>Layer</div>
              {[
                { key:"all",   label:"All Layers", count:layerCounts.all,   dot:"#94a3b8" },
                { key:"macro", label:"Macro",       count:layerCounts.macro, dot:"#6366f1" },
                { key:"micro", label:"Micro",       count:layerCounts.micro, dot:"#0d9488" },
                { key:"nano",  label:"Nano",        count:layerCounts.nano,  dot:"#d97706" },
              ].map(({ key, label, count, dot }) => (
                <div key={key} className={`mf-chip ${activeLayer === key ? "active" : ""}`} onClick={() => setActiveLayer(key)}>
                  <div className="mf-dot" style={{ background:dot }} />
                  {label}
                  <span className="mf-cnt">{count}</span>
                </div>
              ))}
              {/* {allRoles.length > 1 && <>
                <div className="mf-lbl">Partner Role</div>
                {allRoles.map(role => (
                  <div key={role} className={`mf-chip ${activeRole === role ? "active" : ""}`} onClick={() => setActiveRole(role)}>{role}</div>
                ))}
              </>} */}
              <div className="mf-lbl">Max Cost</div>
              <input type="range" min="0" max="100000" value={maxCost} onChange={e => setMaxCost(Number(e.target.value))} className="price-slider" />
              <div className="price-lbl"><span>₹0</span><span>{maxCost === 100000 ? "Any" : `₹${maxCost.toLocaleString()}`}</span></div>
            </aside>

            <div className="mkt-main">
              <div className="mkt-topbar">
                <div className="mkt-sw">
                  <span className="mkt-si">🔍</span>
                  <input className="mkt-si-input" type="text" placeholder="Search services, roles, partners..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
                </div>
                <div className="mkt-div" />
                <div className="vpills">
                  {[{key:"all",label:"All"},{key:"macro",label:"🔵 Macro"},{key:"micro",label:"🟢 Micro"},{key:"nano",label:"🟡 Nano"}].map(({ key, label }) => (
                    <div key={key} className={`vpill ${activeLayer === key ? "active" : ""}`} onClick={() => setActiveLayer(key)}>{label}</div>
                  ))}
                </div>
                <div className="mkt-div" />
                <button className="cart-top-btn" onClick={() => setShowCart(true)}>
                  🛒 Cart
                  {cart.length > 0 && <span className="cart-top-badge">{cart.length}</span>}
                </button>
              </div>
              <div className="services-container">
                {loading ? (
                  <div className="mkt-loading"><div className="mkt-spinner" /><p>Loading services...</p></div>
                ) : renderServices()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CHECKOUT PAGE ── */}
      {page === "checkout" && (
        <div className="mkt-body">
          <CheckoutPage
            cart={cart}
            onConfirm={handleConfirm}
            onBack={() => setPage("marketplace")}
          />
        </div>
      )}

      {/* ── CONFIRMED PAGE ── */}
      {page === "confirmed" && orderInfo && (
        <div className="mkt-body">
          <ConfirmedPage
            orderInfo={orderInfo}
            onBackToJourney={() => onStepChange && onStepChange("myJourney")}
          />
        </div>
      )}

      {/* Cart Drawer */}
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