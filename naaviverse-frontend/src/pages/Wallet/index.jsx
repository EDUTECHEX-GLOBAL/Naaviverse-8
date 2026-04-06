import React, { useState, useEffect } from "react";
import { useStore } from "../../components/store/store.ts";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Dashsidebar from "../../components/dashsidebar/dashsidebar";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import "./wallet.css";
import {
  GetWalletBalance,
  GetWalletTxns,
} from "../../views/inner-pages/pages/services/wallet";

const Wallet = () => {
  const { accsideNav, setaccsideNav } = useStore();
  const navigate = useNavigate();

  const [showDrop, setShowDrop]               = useState(false);
  const [balance, setBalance]                 = useState(0);
  const [txns, setTxns]                       = useState([]);
  const [balanceLoading, setBalanceLoading]   = useState(true);
  const [txnsLoading, setTxnsLoading]         = useState(true);
  const [isNewUser, setIsNewUser]             = useState(false);
  const [creditExpiresAt, setCreditExpiresAt] = useState(null);

  const getUserFromStorage = () => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.user || parsed;
    } catch { return null; }
  };

  const userDetails = getUserFromStorage();
  const email       = userDetails?.email || "";

  // ─────────────────────────────────────────────────────────────────────────────
  // KEY FIX: computeExpiresAt works for BOTH new and old DB records
  //
  // Priority order:
  //  1. txn.expiresAt        — new records (have expiresAt stored in DB)
  //  2. txn.timestamp +14d   — old bonus records (no expiresAt in DB yet)
  //  3. userDetails.createdAt+14d — absolute last fallback
  // ─────────────────────────────────────────────────────────────────────────────
  const computeExpiresAt = (fetchedTxns) => {
    const bonus = fetchedTxns.find((t) => t.metadata?.type === "welcome_bonus");

    if (bonus) {
      // Case 1: new record with expiresAt already in DB
      if (bonus.expiresAt) return new Date(bonus.expiresAt);

      // Case 2: old record — compute from the bonus creation timestamp
      if (bonus.timestamp) {
        const d = new Date(bonus.timestamp);
        d.setDate(d.getDate() + 14);
        return d;
      }
    }

    // Case 3: no bonus txn at all — use account createdAt
    const createdAt = userDetails?.createdAt;
    if (createdAt) {
      const d = new Date(createdAt);
      d.setDate(d.getDate() + 14);
      return d;
    }

    return null;
  };

  useEffect(() => {
    if (!email) { navigate("/login"); return; }
    fetchBalance();
    fetchTxns();
    const createdAt = userDetails?.createdAt;
    setIsNewUser(!createdAt || moment().diff(moment(createdAt), "hours") < 24);
  }, [email]);

  const fetchBalance = () => {
    setBalanceLoading(true);
    GetWalletBalance(email)
      .then((res) => {
        if (res.data.status) setBalance(res.data.balance);
        setBalanceLoading(false);
      })
      .catch(() => {
        setBalanceLoading(false);
        toast.error("Could not load wallet balance.", {
          position: toast.POSITION.TOP_RIGHT,
        });
      });
  };

  const fetchTxns = () => {
    setTxnsLoading(true);
    GetWalletTxns(email)
      .then((res) => {
        if (res.data.status) {
          const fetchedTxns = res.data.txns;
          setTxns(fetchedTxns);
          // This now works for old records too — no migration needed
          const expiry = computeExpiresAt(fetchedTxns);
          if (expiry) setCreditExpiresAt(expiry);
        }
        setTxnsLoading(false);
      })
      .catch(() => {
        setTxnsLoading(false);
        toast.error("Could not load transactions.", {
          position: toast.POSITION.TOP_RIGHT,
        });
      });
  };

  // ── Derived expiry values (recomputed on every render — always fresh) ────────
  const now             = new Date();
  const isCreditExpired = creditExpiresAt ? creditExpiresAt < now : false;
  const msLeft          = creditExpiresAt ? Math.max(0, creditExpiresAt - now) : 0;
  const daysLeft        = msLeft ? Math.ceil(msLeft / (1000 * 60 * 60 * 24)) : 0;

  const getExpirySubText = () => {
    if (!creditExpiresAt)  return "Credits earned on signup & purchases";
    if (isCreditExpired)   return "⏰ Welcome credits have expired";
    if (daysLeft <= 1)     return "⚠ Welcome credits expire today — use them now!";
    if (daysLeft <= 3)     return `⚠ Welcome credits expire in ${daysLeft} days — use them soon!`;
    return `⚠ Welcome credits expire in ${daysLeft} days · ${moment(creditExpiresAt).format("MMM D, YYYY")}`;
  };

  const getBannerLine = () => {
    if (!creditExpiresAt || isCreditExpired) return null;
    if (daysLeft <= 1) return "⚠ These credits expire today — use them now!";
    if (daysLeft <= 3) return `⚠ Expires in ${daysLeft} days — use them before they're gone!`;
    return `Valid for ${daysLeft} more days · expires ${moment(creditExpiresAt).format("MMM D, YYYY")}`;
  };

  const bannerLine = getBannerLine();

  // ── Group transactions by day ────────────────────────────────────────────────
  const groupedTxns = txns.reduce((acc, txn) => {
    const key = moment(txn.timestamp).format("MMDDYYYY");
    if (!acc[key]) {
      const d         = moment(txn.timestamp).startOf("day");
      const today     = moment().startOf("day");
      const yesterday = moment().subtract(1, "days").startOf("day");
      const label = d.isSame(today)     ? "Today"
                  : d.isSame(yesterday) ? "Yesterday"
                  : moment(txn.timestamp).format("MMMM D, YYYY");
      acc[key] = { label, items: [] };
    }
    acc[key].items.push(txn);
    return acc;
  }, {});

  return (
    <div>
      <div className="dashboard-main">
        <div className="dashboard-body">

          <div onClick={() => setShowDrop(false)}>
            <Dashsidebar />
          </div>

          <div className="dashboard-screens" onClick={() => setShowDrop(false)}>
            <div className="services-main" onClick={() => setShowDrop(false)}>

              {/* Page heading */}
              <div className="wallet-page-header">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <rect x="2" y="6" width="18" height="13" rx="2.5" stroke="#1a1a2e" strokeWidth="1.6"/>
                  <path d="M2 10h18" stroke="#1a1a2e" strokeWidth="1.6"/>
                  <circle cx="16" cy="14" r="1.8" fill="#1a1a2e"/>
                </svg>
                <span className="wallet-page-title">My Wallet</span>
              </div>

              <div className="wallet-container">

                {/* Welcome banner — shows whenever credits are still active */}
                {creditExpiresAt && !isCreditExpired && (
                  <div className="wallet-welcome-banner">
                    <span className="wallet-welcome-icon"></span>
                    <div style={{ flex: 1 }}>
                      <p className="wallet-welcome-text">
                        <strong>Welcome bonus applied!</strong> You received{" "}
                        <strong>50 free credits</strong> when you created your Naavi account.
                      </p>
                    </div>
                  </div>
                )}

                {/* Expired banner */}
                {isCreditExpired && (
                  <div className="wallet-expired-banner">
                    <span>⏰</span>
                    <p>
                      Your 50 welcome credits expired on{" "}
                      {moment(creditExpiresAt).format("MMM D, YYYY")}.
                      Subscribe to unlock full access.
                    </p>
                  </div>
                )}

                {/* Balance card */}
                {balanceLoading ? (
                  <Skeleton className="wallet-balance-skeleton" height={160} />
                ) : (
                  <div className="wallet-balance-card">
                    <div className="wallet-balance-badge">Active</div>
                    <div className="wallet-balance-label">Available Credits</div>
                    <div className="wallet-balance-amount">
                      {balance}<span className="wallet-balance-unit"> credits</span>
                    </div>
                    <div className={`wallet-balance-sub${
                      !isCreditExpired && daysLeft > 0 && daysLeft <= 3
                        ? " wallet-balance-sub--warning" : ""
                    }`}>
                      {getExpirySubText()}
                    </div>
                  </div>
                )}

                {/* Transaction list */}
                <div className="wallet-section-title">Recent Transactions</div>

                {txnsLoading ? (
                  <div className="wallet-tx-list">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="wallet-tx-row">
                        <Skeleton circle width={36} height={36} />
                        <div style={{ flex: 1, marginLeft: 12 }}>
                          <Skeleton width={200} />
                          <Skeleton width={140} style={{ marginTop: 4 }} />
                        </div>
                        <Skeleton width={50} />
                      </div>
                    ))}
                  </div>
                ) : txns.length === 0 ? (
                  <div className="wallet-empty-state">
                    No transactions yet. Your credit history will appear here.
                  </div>
                ) : (
                  Object.values(groupedTxns).map((group) => (
                    <div key={group.label}>
                      <div className="wallet-day-label">{group.label}</div>
                      <div className="wallet-tx-list">
                        {group.items.map((txn) => (
                          <WalletTxnRow
                            key={txn._id}
                            txn={txn}
                            bonusExpiresAt={creditExpiresAt}
                          />
                        ))}
                      </div>
                    </div>
                  ))
                )}

                <div className="wallet-info-note">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                    <circle cx="7" cy="7" r="5.5" stroke="#5b3fa0" strokeWidth="1.4"/>
                    <path d="M7 6v4M7 4.5v.01" stroke="#5b3fa0" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Credits are used to unlock paths, premium counselling sessions, and exclusive Naavi features.
                  {creditExpiresAt && !isCreditExpired && (
                    <> Welcome credits expire {moment(creditExpiresAt).fromNow()}.</>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

// ─── WalletTxnRow ─────────────────────────────────────────────────────────────
// bonusExpiresAt — passed down from parent; used as fallback when
// txn.expiresAt is null (old bonus records created before schema change)
const WalletTxnRow = ({ txn, bonusExpiresAt }) => {
  const isCredit  = txn.type === "credit";
  const isBonus   = txn.metadata?.type === "welcome_bonus";
  const isExpired = txn.isExpired;

  // Resolve expiry for this row:
  //   bonus row + new record  → txn.expiresAt
  //   bonus row + old record  → bonusExpiresAt (computed by parent)
  //   any debit row           → null (never show expiry on debits)
  const resolvedExpiry = (() => {
    if (!isBonus) return null;
    if (txn.expiresAt)   return new Date(txn.expiresAt);
    if (bonusExpiresAt)  return bonusExpiresAt;
    return null;
  })();

  const expiryLabel = (() => {
    if (!resolvedExpiry) return null;
    const now  = new Date();
    if (resolvedExpiry < now) return { text: "Expired", warn: true, gone: true };
    const days = Math.ceil((resolvedExpiry - now) / (1000 * 60 * 60 * 24));
    if (days <= 1) return { text: "Expires today", warn: true,  gone: false };
    if (days <= 3) return { text: `Expires in ${days}d`, warn: true,  gone: false };
    return           { text: `Expires ${moment(resolvedExpiry).format("MMM D")}`, warn: false, gone: false };
  })();

  return (
    <div className={`wallet-tx-row${isExpired ? " wallet-tx-row--expired" : ""}`}>
      <div
        className="wallet-tx-icon"
        style={{
          background: isBonus ? "#e8eeff" : isCredit ? "#eaf3de" : "#faeeda",
          color:      isBonus ? "#185FA5" : isCredit ? "#3B6D11"  : "#854F0B",
          opacity:    isExpired ? 0.45 : 1,
        }}
      >
        {isBonus ? "★" : isCredit ? "↑" : "↓"}
      </div>

      <div className="wallet-tx-info">
        <div className="wallet-tx-name" style={{ opacity: isExpired ? 0.5 : 1 }}>
          {txn.metadata?.description || (isCredit ? "Credits added" : "Credits used")}
          {expiryLabel && (
            <span className={`wallet-tx-expiry-pill${expiryLabel.warn ? " warn" : ""}${expiryLabel.gone ? " expired" : ""}`}>
              {expiryLabel.text}
            </span>
          )}
        </div>
        <div className="wallet-tx-date">
          {moment(txn.timestamp).format("h:mm A")}
          {txn.metadata?.source ? ` · ${txn.metadata.source}` : ""}
        </div>
      </div>

      <div
        className="wallet-tx-amount"
        style={{
          color:   isExpired ? "#bbb" : isCredit ? "#3B6D11" : "#A32D2D",
          opacity: isExpired ? 0.5 : 1,
        }}
      >
        {isCredit ? "+" : "−"}{txn.amount}
        {isExpired && <div className="wallet-tx-expired-tag">expired</div>}
      </div>
    </div>
  );
};

export default Wallet;