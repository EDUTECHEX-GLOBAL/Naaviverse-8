import React, { useState, useContext, useEffect, useRef } from "react";
import Skeleton from "react-loading-skeleton";
import moment from "moment";
import { YesterdayToday } from "../Transactions/VaultComponent/FunctionTools";
import { useCoinContextData } from "../../context/CoinContext";
import { useStore } from "../../components/store/store.ts";
import { useNavigate } from "react-router-dom";
import "./transactionpage.scss";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

// ─── HELPERS ────────────────────────────────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return { date: "—", time: "—" };
  const d = new Date(dateStr);
  return {
    date: new Intl.DateTimeFormat("en-US", {
      month: "short", day: "numeric", year: "numeric",
    }).format(d),
    time: new Intl.DateTimeFormat("en-US", {
      hour: "numeric", minute: "numeric", hour12: true,
    }).format(d),
  };
};

const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case "paid":    return "status-paid";
    case "pending": return "status-pending";
    case "failed":  return "status-failed";
    default:        return "status-default";
  }
};

const getTotalSpent = (txns) =>
  (txns || [])
    .filter((t) => t.status?.toLowerCase() === "paid")
    .reduce((s, t) => s + (Number(t.amount) || 0), 0);

const getActivePlans = (txns) =>
  (txns || []).filter((t) => t.status?.toLowerCase() === "paid").length;

const getLastPayment = (txns) => {
  const paid = (txns || []).filter((t) => t.status?.toLowerCase() === "paid");
  if (!paid.length) return "—";
  const latest = paid.sort(
    (a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
  )[0];
  return formatDate(latest.date || latest.createdAt).date;
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
const VaultTransactions = () => {
  const userDetails = JSON.parse(localStorage.getItem("user") || "{}");
  const { selectedCoin, transactionData, setTransactionData } = useCoinContextData();

  const [loading, setLoading]       = useState(false);
  const [activeTab, setActiveTab]   = useState("All");
  const [allTxns, setAllTxns]       = useState([]);

  const TABS = ["All", "Paid", "Pending", "Failed"];

  useEffect(() => {
    const email = userDetails?.user?.email || userDetails?.email;
    if (!email) return;
    setLoading(true);
    axios
      .get(`${BASE_URL}/api/subscriptions/user-transactions`, {
        params: { email },
      })
      .then((res) => {
        const data = res.data?.data || res.data?.transactions || [];
        setAllTxns(data);
        setTransactionData(data);
      })
      .catch(() => setAllTxns([]))
      .finally(() => setLoading(false));
  }, [userDetails?.user?.email || userDetails?.email]);

  const txns = allTxns.length ? allTxns : transactionData || [];

  const filteredTxns = txns.filter((t) =>
    activeTab === "All" || t.status?.toLowerCase() === activeTab.toLowerCase()
  );

  const totalSpent   = getTotalSpent(txns);
  const activePlans  = getActivePlans(txns);
  const lastPayment  = getLastPayment(txns);

  return (
    <div className="txn-page">

      {/* ── SUMMARY CARDS ── */}
      <div className="txn-summary-strip">

        <div className="summary-card blue">
          <div className="sc-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div>
            <div className="s-label">Total Spent</div>
            <div className="s-value">
              {loading ? <Skeleton width={80} height={22} /> : `₹${totalSpent.toLocaleString("en-IN")}`}
            </div>
            <div className="s-sub">Lifetime Value</div>
          </div>
        </div>

        <div className="summary-card green">
          <div className="sc-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <div>
            <div className="s-label">Active Plans</div>
            <div className="s-value">
              {loading ? <Skeleton width={40} height={22} /> : activePlans}
            </div>
            <div className="s-sub">Subscriptions</div>
          </div>
        </div>

        <div className="summary-card amber">
          <div className="sc-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div>
            <div className="s-label">Last Payment</div>
            <div className="s-value" style={{ fontSize: "1rem", letterSpacing: "-0.01em" }}>
              {loading ? <Skeleton width={90} height={22} /> : lastPayment}
            </div>
            <div className="s-sub">Most Recent</div>
          </div>
        </div>

      </div>

      {/* ── FILTER TABS ── */}
      <div className="txn-tabs">
        {TABS.map((tab) => (
          <div
            key={tab}
            className={`txn-tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* ── TABLE ── */}
      <div className="txn-table-wrap">

        {/* Desktop header */}
        <div className="txn-header-row">
          <span>Date</span>
          <span>Partner</span>
          <span>Service</span>
          <span>Amount</span>
          <span>Billing</span>
          <span>Status</span>
          <span>Invoice</span>
        </div>

        <div className="txn-body">
          {loading ? (
            [1, 2, 3].map((_, i) => (
              <div className="txn-skeleton-row" key={i}>
                {[1, 2, 3, 4, 5, 6, 7].map((_, j) => (
                  <Skeleton key={j} height={18} borderRadius={6} />
                ))}
              </div>
            ))
          ) : filteredTxns.length > 0 ? (
            filteredTxns.map((t, i) => {
              const { date, time } = formatDate(t.date || t.createdAt);
              return (
                <div className="txn-row" key={t._id || i}>

                  {/* Date */}
                  <div className="date-cell">
                    <div className="date-main">{date}</div>
                    <div className="date-time">{time}</div>
                  </div>

                  {/* Partner */}
                  <div>
                    <span className="partner-badge">
                      <span className="partner-dot" />
                      <span>{t.partner || t.partnerName || "Naavi"}</span>
                    </span>
                  </div>

                  {/* Service */}
                  <div>
                    <div className="service-name">{t.product || t.productName || t.service || "—"}</div>
                    <div className="service-sub">Subscription</div>
                  </div>

                  {/* Amount */}
                  <div className="amount-cell">
                    ₹{Number(t.amount || 0).toLocaleString("en-IN")}
                  </div>

                  {/* Billing */}
                  <div>
                    <span className={`billing-pill ${t.billing?.toLowerCase() === "monthly" ? "monthly" : ""}`}>
                      {t.billing || t.billingMethod || "—"}
                    </span>
                  </div>

                  {/* Status */}
                  <div>
                    <span className={getStatusClass(t.status)}>
                      {t.status || "—"}
                    </span>
                  </div>

                  {/* Invoice */}
                  <div>
                    {t.invoiceUrl ? (
                      <a
                        className="invoice-btn"
                        href={t.invoiceUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="7 10 12 15 17 10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        PDF
                      </a>
                    ) : (
                      <span className="invoice-na">—</span>
                    )}
                  </div>

                </div>
              );
            })
          ) : (
            <div className="txn-empty">
              <div className="empty-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c8d0e0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
              </div>
              <div className="empty-title">No transactions found</div>
              <div className="empty-sub">Your payment history will appear here</div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default VaultTransactions;