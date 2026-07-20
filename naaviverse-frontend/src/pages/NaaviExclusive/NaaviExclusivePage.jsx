import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./NaaviExclusivePage.scss";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatPrice = (cost) => {
  if (!cost || cost === "Free" || cost === "free") return "₹0";
  const num = parseFloat(String(cost).replace(/[^0-9.]/g, ""));
  if (isNaN(num)) return cost;
  return `₹${num.toLocaleString("en-IN")}`;
};

const getPriceNumber = (cost) => {
  if (!cost || cost === "Free" || cost === "free") return 0;
  const num = parseFloat(String(cost).replace(/[^0-9.]/g, ""));
  return isNaN(num) ? 0 : num;
};

const genOrderId = () =>
  "NX-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();

const loadScript = (src) => {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve(true);
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// ─── Step Indicator ───────────────────────────────────────────────────────────
const StepIndicator = ({ step }) => (
  <div className="ne-steps">
    {["Details", "Payment", "Confirmation"].map((label, i) => {
      const idx = i + 1;
      const done = step > idx;
      const active = step === idx;
      return (
        <React.Fragment key={label}>
          <div className={`ne-step ${active ? "active" : ""} ${done ? "done" : ""}`}>
            <div className="ne-step-circle">
              {done ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : idx}
            </div>
            <span className="ne-step-label">{label}</span>
          </div>
          {i < 2 && <div className={`ne-step-line ${done ? "done" : ""}`} />}
        </React.Fragment>
      );
    })}
  </div>
);

// ─── Item Summary Card ─────────────────────────────────────────────────────────
const ItemSummaryCard = ({ item }) => {
  const isFree = !item.cost || item.cost === "Free";
  return (
    <div className="ne-summary-card">
      <div className="ne-summary-orbit" />
      <div className="ne-sc-topline">
        <div className="ne-sc-badge">External Partner</div>
        <span className="ne-sc-signal">Verified</span>
      </div>
      <div className="ne-sc-name">{item.name || "Service"}</div>
      <div className="ne-sc-by">Curated by {item.partner_email || "Partner"}</div>
      {item.goal && <div className="ne-sc-goal">{item.goal}</div>}
      <div className="ne-sc-divider" />
      <div className="ne-sc-meta-grid">
        {item.layer && (
          <div className="ne-sc-meta-row">
            <span className="ne-sc-lbl">View</span>
            <span className="ne-sc-val">{item.layer.toUpperCase()}</span>
          </div>
        )}
        {item.duration && (
          <div className="ne-sc-meta-row">
            <span className="ne-sc-lbl">Duration</span>
            <span className="ne-sc-val">{item.duration}</span>
          </div>
        )}
        {item.outcomes && (
          <div className="ne-sc-meta-row">
            <span className="ne-sc-lbl">Outcomes</span>
            <span className="ne-sc-val">{item.outcomes}</span>
          </div>
        )}
        {item.websiteUrl && (
          <div className="ne-sc-meta-row">
            <span className="ne-sc-lbl">Provider Site</span>
            <a
              href={item.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ne-sc-link"
            >
              {item.websiteUrl.replace("https://", "")}
            </a>
          </div>
        )}
      </div>
      <div className="ne-sc-divider" />
      <div className="ne-sc-price-row">
        <span>Total</span>
        <span className={`ne-sc-total ${isFree ? "free" : ""}`}>
          {isFree ? "Free" : formatPrice(item.cost)}
        </span>
      </div>
      <div className="ne-sc-footnote">Partner access unlocks after confirmation.</div>
    </div>
  );
};

// ─── Step 1 — Student Details ─────────────────────────────────────────────────
const DetailsStep = ({ form, onChange, onNext }) => {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required.";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email.";
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone.replace(/\s/g, "")))
      e.phone = "Enter a valid 10-digit phone.";
    if (!form.dob) e.dob = "Date of birth is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  return (
    <div className="ne-step-panel">
      <div className="ne-panel-header">
        <div className="ne-panel-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <div>
          <h2>Student Details</h2>
          <p>Tell us who is enrolling in this service</p>
        </div>
      </div>

      <div className="ne-fields-grid">
        <div className="ne-field">
          <label htmlFor="ne-fullname">Full Name *</label>
          <input id="ne-fullname" name="fullName" placeholder="John Doe"
            value={form.fullName} onChange={onChange}
            className={errors.fullName ? "error" : ""} />
          {errors.fullName && <span className="ne-err">{errors.fullName}</span>}
        </div>

        <div className="ne-field">
          <label htmlFor="ne-email">Email Address *</label>
          <input id="ne-email" name="email" type="email" placeholder="john@example.com"
            value={form.email} onChange={onChange}
            className={errors.email ? "error" : ""} />
          {errors.email && <span className="ne-err">{errors.email}</span>}
        </div>

        <div className="ne-field">
          <label htmlFor="ne-phone">Phone Number *</label>
          <input id="ne-phone" name="phone" type="tel" placeholder="9876543210"
            value={form.phone} onChange={onChange} maxLength={10}
            className={errors.phone ? "error" : ""} />
          {errors.phone && <span className="ne-err">{errors.phone}</span>}
        </div>

        <div className="ne-field">
          <label htmlFor="ne-dob">Date of Birth *</label>
          <input id="ne-dob" name="dob" type="date"
            value={form.dob} onChange={onChange}
            className={errors.dob ? "error" : ""} />
          {errors.dob && <span className="ne-err">{errors.dob}</span>}
        </div>

        <div className="ne-field full-width">
          <label htmlFor="ne-institution">School / Institution (optional)</label>
          <input id="ne-institution" name="institution"
            placeholder="e.g., Delhi Public School"
            value={form.institution} onChange={onChange} />
        </div>

        <div className="ne-field full-width">
          <label htmlFor="ne-notes">Additional Notes (optional)</label>
          <textarea id="ne-notes" name="notes"
            placeholder="Any specific requirements or context..."
            value={form.notes} onChange={onChange} rows={3} />
        </div>
      </div>

      <button id="ne-next-details" className="ne-primary-btn" onClick={handleNext}>
        Continue to Payment
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </button>
    </div>
  );
};

// ─── Step 2 — Payment Form ────────────────────────────────────────────────────
const PaymentStep = ({ item, studentForm, onBack, onSuccess }) => {
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const isFree = !item.cost || item.cost === "Free";

  const handlePay = async () => {
    try {
      setProcessing(true);
      setErrorMsg("");

      // 1. Load Razorpay Script
      const loaded = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      if (!loaded) {
        setProcessing(false);
        setErrorMsg("Failed to load Razorpay SDK. Please check your internet connection.");
        return;
      }

      // Get profileDataId if available in localStorage
      let profileId = "";
      try {
        const userObj = JSON.parse(localStorage.getItem("user") || "{}");
        profileId = userObj.profileDataId || "";
      } catch (e) {}

      // 2. Create Backend order
      const amountVal = getPriceNumber(item.cost);
      const itemLayer = item.layer?.toLowerCase();
      const payload = {
        userEmail: studentForm.email,
        productId: item._id,
        productName: item.name,
        billingMethod: "lifetime", // marketplace products are lifetime/one-time
        profileId: profileId,
        amount: amountVal || 1, // fallback to 1 Rs if 0 is passed for test validation
        currency: "INR",
        planTier: undefined,
        tier: itemLayer === "nano" ? "nano" : "micro",
      };

      const res = await axios.post(`${BASE_URL}/api/payment/create-order`, payload);
      
      if (!res.data || !res.data.success) {
        setProcessing(false);
        setErrorMsg(res.data?.error || "Failed to initialize payment order.");
        return;
      }

      const order = res.data.order;

      // 3. Launch Razorpay popup
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || "rzp_test_pIO7ySTH850hhP",
        amount: order.amount,
        currency: order.currency || "INR",
        name: "Naavi Platform",
        description: item.name,
        order_id: order.id,
        handler: async function (response) {
          try {
            // 4. Verify payment
            const verify = await axios.post(`${BASE_URL}/api/payment/verify`, response);
            if (verify.data.success) {
              setProcessing(false);
              onSuccess();
            } else {
              setProcessing(false);
              setErrorMsg("Payment verification failed. Please contact support.");
            }
          } catch (verifyErr) {
            setProcessing(false);
            setErrorMsg("Payment verification verification error.");
          }
        },
        prefill: {
          name: studentForm.fullName,
          email: studentForm.email,
          contact: studentForm.phone,
        },
        theme: {
          color: "#6366f1"
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error("Razorpay initiation error:", err);
      setProcessing(false);
      setErrorMsg("An error occurred while launching secure checkout.");
    }
  };
  return (
    <div className="ne-step-panel ne-payment-panel">
      <div className="ne-panel-header">
        <div className="ne-panel-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
        </div>
        <div>
          <h2>Secure Payment Gateway</h2>
          <p>Complete your payment securely via Razorpay</p>
        </div>
      </div>

      {isFree ? (
        <div className="ne-free-notice">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          This is a <strong>free service</strong>. No payment required.
        </div>
      ) : (
        <div className="ne-payment-preview">
          <div className="ne-payment-card">
            <div className="ne-payment-card-shine" />
            <div className="ne-payment-card-head">
              <span>NaaviExclusive</span>
              <span>Razorpay</span>
            </div>
            <div className="ne-payment-chip" />
            <div className="ne-payment-number">••••  ••••  ••••  {studentForm.phone?.slice(-4) || "2026"}</div>
            <div className="ne-payment-meta">
              <span>{studentForm.fullName || "Student Name"}</span>
              <strong>{formatPrice(item.cost)}</strong>
            </div>
          </div>
          <div className="ne-payment-copy">
            <span className="ne-mini-badge">Encrypted checkout</span>
            <h3>Razorpay Secure Checkout</h3>
            <p>Cards, UPI, net banking, and mobile wallets are handled through a protected payment gateway.</p>
            <div className="ne-payment-assurance">
              <span>256-bit SSL</span>
              <span>PCI-DSS</span>
              <span>Instant receipt</span>
            </div>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="ne-error-alert">
          ⚠️ {errorMsg}
        </div>
      )}

      <div className="ne-pay-actions">
        <button id="ne-back-payment" className="ne-ghost-btn" onClick={onBack} disabled={processing}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </button>
        <button id="ne-confirm-pay" className={`ne-primary-btn ${processing ? "loading" : ""}`}
          onClick={handlePay} disabled={processing}>
          {processing ? (
            <><span className="ne-spinner" /> Launching Checkout...</>
          ) : (
            <>
              {isFree ? "Confirm Enrollment" : `Pay ${formatPrice(item.cost)} via Razorpay`}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// ─── Step 3 — Success / Confirmation ─────────────────────────────────────────
const SuccessStep = ({ item, form, orderId, onReturnToNaaviverse }) => {
  const [countdown, setCountdown] = useState(8);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current);
          onReturnToNaaviverse();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [onReturnToNaaviverse]);

  return (
    <div className="ne-step-panel ne-success-panel">
      <div className="ne-success-animation">
        <div className="ne-success-ring" />
        <div className="ne-success-checkmark">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>

      <h2 className="ne-success-title">Payment Successful!</h2>
      <p className="ne-success-sub">
        You have successfully enrolled in <strong>{item.name}</strong>
      </p>

      <div className="ne-receipt-card">
        <div className="ne-receipt-row"><span>Order ID</span><strong>{orderId}</strong></div>
        <div className="ne-receipt-row"><span>Student</span><strong>{form.fullName}</strong></div>
        <div className="ne-receipt-row"><span>Email</span><strong>{form.email}</strong></div>
        <div className="ne-receipt-row"><span>Service</span><strong>{item.name}</strong></div>
        <div className="ne-receipt-row">
          <span>Amount Paid</span>
          <strong className="ne-green">{!item.cost || item.cost === "Free" ? "₹0 (Free)" : formatPrice(item.cost)}</strong>
        </div>
        <div className="ne-receipt-row">
          <span>Status</span>
          <strong className="ne-green">✅ Confirmed</strong>
        </div>
      </div>

      <p className="ne-countdown-text">
        Returning you to Naaviverse in <strong>{countdown}s</strong>...
      </p>

      <button id="ne-return-now" className="ne-primary-btn" onClick={() => { clearInterval(timerRef.current); onReturnToNaaviverse(); }}>
        Return to Naaviverse Now
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </button>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const NaaviExclusivePage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // ── Read item: try location.state first, then localStorage (new-tab mode) ──
  const item = (() => {
    if (location.state?.item) return location.state.item;
    try {
      const stored = localStorage.getItem("naaviExclusiveItem");
      if (stored) return JSON.parse(stored);
    } catch (e) { /* ignore */ }
    // Fallback demo
    return {
      _id: "demo",
      name: "Demo External Service",
      partner_email: "partner@example.com",
      goal: "Demo service for testing the exclusive checkout flow.",
      layer: "macro",
      cost: "Free",
      websiteUrl: "https://example.com",
    };
  })();

  const returnPath =
    location.state?.returnPath ||
    localStorage.getItem("naaviExclusiveReturnPath") ||
    "/dashboard/users/Marketplace";

  const [step, setStep] = useState(1);
  const [orderId] = useState(genOrderId);

  // Parse user profile from localStorage
  const userObj = (() => {
    try {
      const parsed = JSON.parse(localStorage.getItem("user") || "{}");
      return parsed;
    } catch (e) {
      return {};
    }
  })();

  const [form, setForm] = useState({
    fullName: userObj.name || localStorage.getItem("userName") || "",
    email: userObj.email || localStorage.getItem("loginEmail") || "",
    phone: userObj.phone || userObj.phoneNumber || "",
    dob: userObj.dob || "",
    institution: userObj.institution || userObj.schoolName || "",
    notes: "",
  });

  const handleFormChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleReturn = () => {
    // Clear localStorage after successful checkout
    localStorage.removeItem("naaviExclusiveItem");
    localStorage.removeItem("naaviExclusiveReturnPath");

    // Write success status to localStorage so the opener tab can pick it up
    try {
      localStorage.setItem(
        "naaviExclusiveSuccess",
        JSON.stringify({ orderId, itemName: item.name })
      );
    } catch (e) { /* ignore */ }

    // If this page was opened in a new tab (via window.open), close it.
    if (window.opener && !window.opener.closed) {
      window.close();
    } else {
      // Fallback: navigate within the same tab
      navigate(returnPath, {
        state: {
          exclusiveSuccess: true,
          orderId,
          purchasedItem: item,
          studentEmail: form.email,
        },
      });
    }
  };

  return (
    <div className="ne-root">
      <div className="ne-grid-bg" />
      <div className="ne-light-beam" />

      <header className="ne-header">
        <div className="ne-header-inner">
          <div className="ne-logo">
            <span className="ne-logo-icon">✦</span>
            <span className="ne-logo-text">
              Naavi<span className="ne-logo-accent">Exclusive</span>
            </span>
          </div>
          <div className="ne-header-tag">External Partner Checkout</div>
        </div>
      </header>

      <main className="ne-main">
        <section className="ne-intro">
          <span className="ne-kicker">Private partner gateway</span>
          <h1>Complete your exclusive partner access</h1>
          <p>
            A premium, secure checkout flow for trusted external services inside Naaviverse.
          </p>
        </section>

        <div className="ne-layout">
          <aside className="ne-sidebar">
            <ItemSummaryCard item={item} />
            <div className="ne-trust-badges">
              <div className="ne-trust-item"><span>01</span> Secure 256-bit SSL</div>
              <div className="ne-trust-item"><span>02</span> Email confirmation sent</div>
              <div className="ne-trust-item"><span>03</span> Easy cancellation policy</div>
            </div>
          </aside>

          <section className="ne-content">
            {step < 3 && <StepIndicator step={step} />}

            {step === 1 && (
              <DetailsStep form={form} onChange={handleFormChange} onNext={() => setStep(2)} />
            )}
            {step === 2 && (
              <PaymentStep item={item} studentForm={form} onBack={() => setStep(1)} onSuccess={() => setStep(3)} />
            )}
            {step === 3 && (
              <SuccessStep item={item} form={form} orderId={orderId} onReturnToNaaviverse={handleReturn} />
            )}
          </section>
        </div>
      </main>

      <footer className="ne-footer">
        <span>© {new Date().getFullYear()} Naaviverse Platform. All rights reserved.</span>
        <span className="ne-footer-dot">·</span>
        <span>Powered by NaaviExclusive™</span>
      </footer>
    </div>
  );
};

export default NaaviExclusivePage;
