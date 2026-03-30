// src/pages/Wallet/index.jsx
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
  AddWalletCredits,
} from "../../views/inner-pages/pages/services/wallet";
// Same env var used across your entire App.jsx


const Wallet = () => {
  const { accsideNav, setaccsideNav } = useStore();
  const navigate = useNavigate();

  const [showDrop, setShowDrop] = useState(false);
  const [balance, setBalance] = useState(0);
  const [txns, setTxns] = useState([]);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [txnsLoading, setTxnsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creditInput, setCreditInput] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  const getUserFromStorage = () => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.user || parsed;
    } catch { return null; }
  };

  const userDetails = getUserFromStorage();
  const email = userDetails?.email || "";


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
        if (res.data.status) setTxns(res.data.txns);
        setTxnsLoading(false);
      })
      .catch(() => {
        setTxnsLoading(false);
        toast.error("Could not load transactions.", {
          position: toast.POSITION.TOP_RIGHT,
        });
      });
  };

  const handleAddCredits = () => {
    const amount = parseInt(creditInput);
    if (!amount || amount <= 0) {
      toast.warning("Please enter a valid amount.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return;
    }
    setIsAdding(true);
    AddWalletCredits({
      email,
      amount,
      description: "Manual top-up",
      source: "manual",
    })
      .then((res) => {
        if (res.data.status) {
          setBalance((prev) => prev + amount);
          fetchTxns();
          setShowModal(false);
          setCreditInput("");
          toast.success(`${amount} credits added!`, {
            position: toast.POSITION.TOP_RIGHT,
          });
        }
        setIsAdding(false);
      })
      .catch(() => {
        setIsAdding(false);
        toast.error("Failed to add credits.", {
          position: toast.POSITION.TOP_RIGHT,
        });
      });
  };

  // Group transactions by date — mirrors VaultTransactions.jsx pattern
  const groupedTxns = txns.reduce((acc, txn) => {
    const key = moment(txn.timestamp).format("MMDDYYYY");
    if (!acc[key]) {
      const d = moment(txn.timestamp).startOf("day");
      const today = moment().startOf("day");
      const yesterday = moment().subtract(1, "days").startOf("day");
      const label = d.isSame(today) ? "Today"
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

          {/* ✅ dashboard-screens is the scroll container — no extra div */}
          <div className="dashboard-screens" onClick={() => setShowDrop(false)}>
            <div className="services-main" onClick={() => setShowDrop(false)}>

              {/* Page heading */}
              <div className="wallet-page-header">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <rect x="2" y="6" width="18" height="13" rx="2.5" stroke="#1a1a2e" strokeWidth="1.6" />
                  <path d="M2 10h18" stroke="#1a1a2e" strokeWidth="1.6" />
                  <circle cx="16" cy="14" r="1.8" fill="#1a1a2e" />
                </svg>
                <span className="wallet-page-title">My Wallet</span>
              </div>

              <div className="wallet-container">
                {isNewUser && (
                  <div className="wallet-welcome-banner">
                    <span className="wallet-welcome-icon">🎁</span>
                    <p className="wallet-welcome-text">
                      <strong>Welcome bonus applied!</strong> You received{" "}
                      <strong>50 free credits</strong> when you created your Naavi account.
                    </p>
                  </div>
                )}

                {balanceLoading ? (
                  <Skeleton className="wallet-balance-skeleton" />
                ) : (
                  <div className="wallet-balance-card">
                    <div className="wallet-balance-badge">Active</div>
                    <div className="wallet-balance-label">Available Credits</div>
                    <div className="wallet-balance-amount">
                      {balance}<span className="wallet-balance-unit"> credits</span>
                    </div>
                    <div className="wallet-balance-sub">
                      Credits never expire · earned on signup &amp; purchases
                    </div>
                  </div>
                )}

                <div className="wallet-actions-row">
                  <button className="wallet-btn wallet-btn-primary" onClick={() => setShowModal(true)}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Add Credits
                  </button>
                  <button className="wallet-btn" onClick={() => toast.info("Redeem feature coming soon!", { position: toast.POSITION.TOP_RIGHT })}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Redeem
                  </button>
                </div>

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
                          <WalletTxnRow key={txn._id} txn={txn} />
                        ))}
                      </div>
                    </div>
                  ))
                )}

                <div className="wallet-info-note">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                    <circle cx="7" cy="7" r="5.5" stroke="#5b3fa0" strokeWidth="1.4" />
                    <path d="M7 6v4M7 4.5v.01" stroke="#5b3fa0" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  Credits are used to unlock paths, premium counselling sessions, and exclusive Naavi features.
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>

      {showModal && (
        <div className="wallet-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="wallet-modal" onClick={(e) => e.stopPropagation()}>
            <div className="wallet-modal-header">
              <span className="wallet-modal-title">Add Credits</span>
              <button className="wallet-modal-close" onClick={() => { setShowModal(false); setCreditInput(""); }}>✕</button>
            </div>
            <label className="wallet-modal-label">Amount to add</label>
            <input
              className="wallet-modal-input"
              type="number"
              min="1"
              placeholder="e.g. 100"
              value={creditInput}
              onChange={(e) => setCreditInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddCredits()}
              autoFocus
            />
            <div className="wallet-modal-actions">
              <button className="wallet-btn" onClick={() => { setShowModal(false); setCreditInput(""); }}>Cancel</button>
              <button
                className="wallet-btn wallet-btn-primary"
                onClick={handleAddCredits}
                disabled={isAdding}
                style={{ opacity: isAdding ? 0.6 : 1 }}
              >
                {isAdding ? "Adding..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

// Transaction row — mirrors VaultItemForexCrypto
const WalletTxnRow = ({ txn }) => {
  const isCredit = txn.type === "credit";
  const isBonus = txn.metadata?.type === "welcome_bonus";
  return (
    <div className="wallet-tx-row">
      <div className="wallet-tx-icon" style={{
        background: isBonus ? "#e8eeff" : isCredit ? "#eaf3de" : "#faeeda",
        color: isBonus ? "#185FA5" : isCredit ? "#3B6D11" : "#854F0B",
      }}>
        {isBonus ? "★" : isCredit ? "↑" : "↓"}
      </div>
      <div className="wallet-tx-info">
        <div className="wallet-tx-name">
          {txn.metadata?.description || (isCredit ? "Credits added" : "Credits used")}
        </div>
        <div className="wallet-tx-date">
          {moment(txn.timestamp).format("h:mm A")}
          {txn.metadata?.source ? ` · ${txn.metadata.source}` : ""}
        </div>
      </div>
      <div className="wallet-tx-amount" style={{ color: isCredit ? "#3B6D11" : "#A32D2D" }}>
        {isCredit ? "+" : "−"}{txn.amount}
      </div>
    </div>
  );
};

export default Wallet;