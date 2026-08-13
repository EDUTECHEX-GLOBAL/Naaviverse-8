import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, Navigate, useParams } from "react-router-dom";
import axios from "axios";
import * as XLSX from "xlsx";
// Adjust this relative path to match where this file actually sits in src/.
// Source: src/logos/naavi_final_logo2.png
import naaviLogo from "../../logos/naavi_final_logo2.png";
import "./PartnerExclusiveDashboard.scss";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

// Helpers for formatted representation
const formatCurrency = (val) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(val);
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

// ─── Static placeholder data for the Support tab ──────────────────────────────
// Swap this out once the "contact super admin" endpoint exists on the backend.
const STATIC_SUPPORT_TICKETS = [
  {
    id: "TCK-3391",
    subject: "Payout not credited for June cycle",
    status: "Resolved",
    priority: "High",
    date: "2026-07-18"
  },
  {
    id: "TCK-3402",
    subject: "Need help adding a new marketplace listing",
    status: "In Progress",
    priority: "Medium",
    date: "2026-07-23"
  },
  {
    id: "TCK-3417",
    subject: "Razorpay merchant node verification query",
    status: "Open",
    priority: "Medium",
    date: "2026-07-27"
  }
];

// ─── Small inline icon set (replaces emoji for a consistent, elegant mark) ────
const Icon = {
  Overview: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3v18h18" /><path d="M7 15l4-5 3 3 5-7" /></svg>
  ),
  Transactions: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>
  ),
  Refunds: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 10h11a5 5 0 0 1 0 10H9" /><polyline points="7 5 3 10 7 15" /></svg>
  ),
  Feedbacks: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
  ),
  Settings: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
  ),
  Support: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><path d="M9.1 9a3 3 0 0 1 5.82 1c0 2-3 2-3 4" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
  ),
  Logout: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
  ),
  Download: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
  ),
  Alert: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
  ),
  Mail: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 6l-10 7L2 6" /></svg>
  ),
  Phone: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
  ),
  Ticket: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9a2 2 0 0 0 2-2V6a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v1a2 2 0 0 0 0 4v1a2 2 0 0 0 0 4v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-1a2 2 0 0 0-2-2z" /></svg>
  ),
  Send: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
  ),
};

const ticketBadgeClass = (status) => {
  if (status === "Resolved") return "badge-resolved";
  if (status === "In Progress") return "badge-inprogress";
  return "badge-open";
};

export default function PartnerExclusiveDashboard() {
  const navigate = useNavigate();
  const { tab } = useParams();

  // 1. Authorization check
  const partner = useMemo(() => {
    try {
      const raw = localStorage.getItem("partner");
      if (!raw || raw === "undefined" || raw === "null") return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, []);

  const activeMenu = useMemo(() => {
    if (!tab) return "Overview";
    const mapping = {
      overview: "Overview",
      transactions: "Transactions",
      refunds: "Refunds",
      feedback: "Feedbacks",
      feedbacks: "Feedbacks",
      settings: "Settings",
      support: "Support",
    };
    return mapping[tab.toLowerCase()] || "Overview";
  }, [tab]);

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all', 'online', 'direct'
  const [filterStatus, setFilterStatus] = useState("all"); // 'all', 'Paid', 'Pending', 'Failed'
  const [feedbackView, setFeedbackView] = useState("cards"); // 'cards' or 'table'
  const [currentPartner, setCurrentPartner] = useState(partner);

  // Support tab local state
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const feedbacksList = useMemo(() => {
    return stats?.feedbacks || [];
  }, [stats]);

  // Settings states
  const [payoutForm, setPayoutForm] = useState({
    bankName: "HDFC Bank",
    accountNumber: "•••• •••• 9876",
    ifsc: "HDFC0001234",
    holderName: currentPartner?.businessName || currentPartner?.username || partner?.businessName || partner?.username || "John Doe",
  });

  const fetchStats = useCallback(async (isSilent = false) => {
    if (!partner || (!partner.partnerId && !partner.email)) return;
    try {
      if (!isSilent) setLoading(true);
      setErrorMsg("");
      const res = await axios.get(`${BASE_URL}/api/partner-dashboard/exclusive-stats`, {
        params: {
          partnerId: partner?.partnerId || currentPartner?.partnerId || "",
          email: partner?.email || currentPartner?.email || ""
        }
      });
      if (res.data?.status && res.data?.data) {
        setStats(res.data.data);
        if (res.data.partner) {
          const updated = { ...partner, ...res.data.partner };
          setCurrentPartner(updated);
          localStorage.setItem("partner", JSON.stringify(updated));
        }
      } else {
        if (!isSilent) setErrorMsg(res.data?.message || "Failed to load dashboard data.");
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      if (!isSilent) setErrorMsg("Failed to connect to stats service.");
    } finally {
      setLoading(false);
    }
  }, [partner, currentPartner?.partnerId, currentPartner?.email]);

  useEffect(() => {
    fetchStats(false);
    // Auto-refresh stats every 10 seconds so newly added fields/transactions reflect automatically
    const intervalId = setInterval(() => {
      fetchStats(true);
    }, 10000);
    return () => clearInterval(intervalId);
  }, [fetchStats]);


  const handleLogout = () => {
    localStorage.removeItem("partner");
    localStorage.removeItem("loginEmail");
    navigate("/login");
  };

  const handleExportExcel = () => {
    if (!stats?.allTransactions?.length) return;
    const ws = XLSX.utils.json_to_sheet(stats.allTransactions.map(tx => ({
      "Student Email": tx.studentEmail,
      "Service/Product": tx.service,
      "Amount (INR)": tx.amount,
      "Status": tx.status,
      "Method": tx.type,
      "Date": new Date(tx.date).toLocaleDateString(),
      "Feedback": tx.feedback
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, `${currentPartner?.partnerId || partner?.partnerId || "partner"}_Transactions.xlsx`);
  };

  const handleTicketSubmit = () => {
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;
    // Static/placeholder flow until the "contact super admin" endpoint exists.
    setTicketSubmitted(true);
    setTicketSubject("");
    setTicketMessage("");
    setTimeout(() => setTicketSubmitted(false), 4000);
  };

  // Filtered transactions for Transactions tab
  const filteredTransactions = useMemo(() => {
    if (!stats?.allTransactions) return [];
    return stats.allTransactions.filter(tx => {
      const matchesSearch = searchQuery === "" ||
        tx.studentEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.service.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = filterType === "all" ||
        (filterType === "online" && tx.type === "Online Payment") ||
        (filterType === "direct" && tx.type === "Direct Purchase");

      const matchesStatus = filterStatus === "all" || tx.status === filterStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [stats?.allTransactions, searchQuery, filterType, filterStatus]);

  if (!partner || (!partner.partnerId && !partner.email)) {
    return <Navigate to="/login" replace />;
  }

  // Sidebar Menu Items
  const sidebarMenu = [
    { key: "Overview", label: "Overview", icon: <Icon.Overview /> },
    { key: "Transactions", label: "Transactions", icon: <Icon.Transactions /> },
    { key: "Refunds", label: "Refunds", icon: <Icon.Refunds /> },
    { key: "Feedbacks", label: "Feedbacks", icon: <Icon.Feedbacks /> },
    { key: "Settings", label: "Settings", icon: <Icon.Settings /> },
    { key: "Support", label: "Support", icon: <Icon.Support /> }
  ];

  return (
    <div className="px-db-root">
      {/* Sidebar */}
      <aside className="px-sidebar">
        <div className="px-sidebar-brand" onClick={() => navigate("/dashboard/accountants")}>
          <img src={naaviLogo} alt="naavi" className="px-brand-logo" />
        </div>
        <nav className="px-sidebar-nav">
          {sidebarMenu.map(menu => (
            <button
              key={menu.key}
              className={`px-nav-item ${activeMenu === menu.key ? "active" : ""}`}
              onClick={() => {
                const mapKeyToPath = {
                  Overview: "",
                  Transactions: "transactions",
                  Refunds: "refunds",
                  Feedbacks: "feedback",
                  Settings: "settings",
                  Support: "support",
                };
                const subPath = mapKeyToPath[menu.key] || "";
                navigate(`/partner/exclusive-dashboard${subPath ? "/" + subPath : ""}`);
              }}
            >
              <span className="px-nav-icon">{menu.icon}</span>
              <span className="px-nav-label">{menu.label}</span>
            </button>
          ))}
        </nav>
        <div className="px-sidebar-footer">
          <button className="px-logout-btn" onClick={handleLogout}>
            <Icon.Logout /> <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content wrapper */}
      <main className="px-main-container">
        {/* Top Header */}
        <header className="px-header">
          <div className="px-header-title">
            <h1>Naavi Exclusive Partner Dashboard</h1>
          </div>
          <div className="px-header-right">
            <div className="px-partner-badge">
              <span className="px-partner-label">Partner ID:</span>
              <span className="px-partner-id">{currentPartner?.partnerId || partner?.partnerId || "N/A"}</span>
            </div>
            <div className="px-header-user">
              <div className="px-user-avatar">
                {(currentPartner?.businessName || currentPartner?.username || partner?.businessName || partner?.username || "P").charAt(0).toUpperCase()}
              </div>
              <div className="px-user-info">
                <span className="px-username">{currentPartner?.businessName || currentPartner?.username || partner?.businessName || partner?.username}</span>
                <span className="px-userrole">Verified Partner</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="px-content-wrapper">
          {loading ? (
            <div className="px-loading-container">
              <div className="px-spinner" />
              <p>Loading payments and metrics...</p>
            </div>
          ) : errorMsg ? (
            <div className="px-error-container">
              <Icon.Alert />
              <p>{errorMsg}</p>
            </div>
          ) : (
            <>
              {/* ──────────────── OVERVIEW VIEW ──────────────── */}
              {activeMenu === "Overview" && (
                <div className="px-view-fade">
                  {/* Metrics row */}
                  <div className="px-metrics-grid">
                    {/* Card 1: Total Earnings */}
                    <div className="px-metric-card card-green">
                      <div className="px-card-header">
                        <span className="px-card-label">Total Earnings</span>
                        <span className="px-card-more">•••</span>
                      </div>
                      <div className="px-card-value">{formatCurrency(stats?.totalEarnings || 0)}</div>
                      <div className="px-card-sub text-success">+12.5% vs last month</div>

                      <div className="px-chart-wrapper">
                        <svg className="px-sparkline" viewBox="0 0 100 30">
                          <defs>
                            <linearGradient id="glowGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#1FA655" stopOpacity="0.35" />
                              <stop offset="100%" stopColor="#1FA655" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <path
                            d="M0,25 Q15,10 30,18 T60,5 T90,12 L100,8 L100,30 L0,30 Z"
                            fill="url(#glowGrad)"
                          />
                          <path
                            d="M0,25 Q15,10 30,18 T60,5 T90,12 L100,8"
                            fill="none"
                            stroke="#1FA655"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Card 2: Active Students */}
                    <div className="px-metric-card card-blue">
                      <div className="px-card-header">
                        <span className="px-card-label">Active Students</span>
                        <span className="px-card-more">•••</span>
                      </div>
                      <div className="px-card-value">{stats?.activeStudents || 0}</div>
                      <div className="px-card-sub text-teal">+8% this week</div>

                      <div className="px-chart-wrapper">
                        <svg className="px-barchart" viewBox="0 0 100 30">
                          <rect x="5" y="10" width="8" height="20" rx="2" fill="rgba(62,123,250,0.28)" />
                          <rect x="18" y="5" width="8" height="25" rx="2" fill="rgba(62,123,250,0.28)" />
                          <rect x="31" y="12" width="8" height="18" rx="2" fill="rgba(62,123,250,0.28)" />
                          <rect x="44" y="8" width="8" height="22" rx="2" fill="rgba(62,123,250,0.28)" />
                          <rect x="57" y="18" width="8" height="12" rx="2" fill="#3E7BFA" />
                          <rect x="70" y="4" width="8" height="26" rx="2" fill="#3E7BFA" />
                          <rect x="83" y="10" width="8" height="20" rx="2" fill="#3E7BFA" />
                        </svg>
                      </div>
                    </div>

                    {/* Card 3: Refund Rate */}
                    <div className="px-metric-card card-amber">
                      <div className="px-card-header">
                        <span className="px-card-label">Refund Rate</span>
                        <span className="px-card-more">•••</span>
                      </div>
                      <div className="px-card-value">{stats?.refundRate || 1.2}%</div>
                      <div className="px-card-sub text-muted">-0.5% lower risk</div>

                      <div className="px-donut-chart-wrapper">
                        <svg className="px-donutchart" viewBox="0 0 36 36">
                          <path
                            className="px-donut-ring"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#F0F3F6"
                            strokeWidth="3.5"
                          />
                          <path
                            className="px-donut-segment"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#F5B324"
                            strokeWidth="3.5"
                            strokeDasharray={`${stats?.refundRate || 1.2}, 100`}
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Recent Transactions Table */}
                  <div className="px-section-card">
                    <div className="px-section-header">
                      <h2>Recent Transactions</h2>
                      <button className="px-view-all-btn" onClick={() => navigate("/partner/exclusive-dashboard/transactions")}>
                        View all →
                      </button>
                    </div>
                    <div className="px-table-responsive">
                      <table className="px-table px-table--transactions">
                        <thead>
                          <tr>
                            <th>Service</th>
                            <th>Student Email</th>
                            <th>Status</th>
                            <th>Type</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats?.recentTransactions?.length ? (
                            stats.recentTransactions.map((tx) => (
                              <tr key={tx._id}>
                                <td>{tx.service}</td>
                                <td><span className="px-tbl-email">{tx.studentEmail}</span></td>
                                <td>
                                  <span className={`px-badge badge-${tx.status.toLowerCase()}`}>
                                    {tx.status}
                                  </span>
                                </td>
                                <td><span className="px-tbl-type">{tx.type}</span></td>
                                <td>{formatDate(tx.date)}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="px-table-empty">
                                No recent transactions recorded yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ──────────────── TRANSACTIONS VIEW ──────────────── */}
              {activeMenu === "Transactions" && (
                <div className="px-view-fade">
                  <div className="px-section-card">
                    <div className="px-section-header">
                      <h2>All Payments &amp; Transactions</h2>
                    </div>

                    {/* Filter toolbar — compact, export lives here */}
                    <div className="px-filter-toolbar">
                      <input
                        type="text"
                        placeholder="Search email or service..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="px-filter-input"
                      />
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-filter-select"
                      >
                        <option value="all">All methods</option>
                        <option value="online">Online checkout</option>
                        <option value="direct">Direct purchase</option>
                      </select>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-filter-select"
                      >
                        <option value="all">All statuses</option>
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                        <option value="Failed">Failed</option>
                      </select>
                      <button className="px-export-btn" onClick={handleExportExcel} disabled={!stats?.allTransactions?.length}>
                        <Icon.Download /> Export
                      </button>
                    </div>

                    <div className="px-table-responsive">
                      <table className="px-table px-table--transactions">
                        <thead>
                          <tr>
                            <th>Service</th>
                            <th>Student Email</th>
                            <th>Amount</th>
                            <th>Method</th>
                            <th>Status</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTransactions.length ? (
                            filteredTransactions.map((tx) => (
                              <tr key={tx._id} title={tx.feedback ? `Feedback: ${tx.feedback}` : undefined}>
                                <td>{tx.service}</td>
                                <td><span className="px-tbl-email">{tx.studentEmail}</span></td>
                                <td><span className="px-tbl-amount">{formatCurrency(tx.amount)}</span></td>
                                <td><span className="px-tbl-type">{tx.type}</span></td>
                                <td>
                                  <span className={`px-badge badge-${tx.status.toLowerCase()}`}>
                                    {tx.status}
                                  </span>
                                </td>
                                <td>{formatDate(tx.date)}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="6" className="px-table-empty">
                                No matching transactions found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ──────────────── REFUNDS VIEW ──────────────── */}
              {activeMenu === "Refunds" && (
                <div className="px-view-fade">
                  <div className="px-section-card">
                    <div className="px-section-header">
                      <h2>Refund Requests</h2>
                    </div>
                    <div className="px-table-responsive">
                      <table className="px-table px-table--refunds">
                        <thead>
                          <tr>
                            <th>Service</th>
                            <th>Student Email</th>
                            <th>Amount</th>
                            <th>Reason</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Skills Workshop</td>
                            <td><span className="px-tbl-email">lisa.wong@email.com</span></td>
                            <td><span className="px-tbl-amount">₹499</span></td>
                            <td>Accidental double billing</td>
                            <td>
                              <span className="px-badge badge-pending">Pending</span>
                            </td>
                          </tr>
                          <tr>
                            <td>Online Tutoring</td>
                            <td><span className="px-tbl-email">sarah.jones@email.com</span></td>
                            <td><span className="px-tbl-amount">₹2,000</span></td>
                            <td>Reschedule &amp; cancellation</td>
                            <td>
                              <span className="px-badge badge-paid">Processed</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ──────────────── FEEDBACKS VIEW ──────────────── */}
              {/* ──────────────── FEEDBACKS VIEW ──────────────── */}
              {activeMenu === "Feedbacks" && (
                <div className="px-view-fade">
                  {/* Bayesian Overall Summary Banner */}
                  <div className="px-bayesian-banner" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                    background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '20px 24px',
                    marginBottom: '24px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '220px' }}>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', fontWeight: '700' }}>
                        Partner Quality Overview
                      </span>
                      <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: '700' }}>
                        Bayesian Performance Engine
                      </h3>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '10px 18px', borderRadius: '12px', textAlign: 'center', minWidth: '130px' }}>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginBottom: '2px' }}>Bayesian Rating</div>
                        <div style={{ fontSize: '20px', fontWeight: '800', color: '#d97706', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                          <span>★ {stats?.bayesianRating ? Number(stats.bayesianRating).toFixed(2) : "4.00"}</span>
                          <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>/ 5.0</span>
                        </div>
                      </div>

                      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '10px 18px', borderRadius: '12px', textAlign: 'center', minWidth: '130px' }}>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginBottom: '2px' }}>Marketplace Score</div>
                        <div style={{ fontSize: '20px', fontWeight: '800', color: '#059669' }}>
                          {stats?.marketplaceScore ? Number(stats.marketplaceScore).toFixed(1) : "80.0"} <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>/ 100</span>
                        </div>
                      </div>

                      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '10px 18px', borderRadius: '12px', textAlign: 'center', minWidth: '110px' }}>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginBottom: '2px' }}>Total Reviews</div>
                        <div style={{ fontSize: '20px', fontWeight: '800', color: '#4f46e5' }}>
                          {stats?.totalFeedbackCount || stats?.feedbacks?.length || 0} <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>valid</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-section-card">
                    <div className="px-section-header px-section-header--split">
                      <h2>Student Feedbacks &amp; Reviews</h2>

                      <div className="px-feedback-tabs">
                        <button
                          className={`px-feedback-tab-btn ${feedbackView === "cards" ? "active" : ""}`}
                          onClick={() => setFeedbackView("cards")}
                        >
                          Grid
                        </button>
                        <button
                          className={`px-feedback-tab-btn ${feedbackView === "table" ? "active" : ""}`}
                          onClick={() => setFeedbackView("table")}
                        >
                          Table
                        </button>
                      </div>
                    </div>

                    {feedbackView === "table" ? (
                      <div className="px-table-responsive">
                        <table className="px-table px-table--feedback">
                          <thead>
                            <tr>
                              <th>Service</th>
                              <th>Student</th>
                              <th>Rating</th>
                              <th>Action</th>
                              <th>Comment</th>
                              <th>Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {feedbacksList.length ? (
                              feedbacksList.map((fb, idx) => (
                                <tr key={fb._id || idx}>
                                  <td>
                                    <div style={{ fontWeight: '600', color: '#1e293b' }}>{fb.service}</div>
                                    {fb.type === "marketplace" || fb.providerName ? (
                                      <span style={{ fontSize: '10px', background: '#eef2ff', color: '#4f46e5', padding: '2px 7px', borderRadius: '4px', fontWeight: '600', display: 'inline-block', marginTop: '3px' }}>
                                        🛒 Marketplace
                                      </span>
                                    ) : (
                                      <span style={{ fontSize: '10px', background: '#f1f5f9', color: '#64748b', padding: '2px 7px', borderRadius: '4px', fontWeight: '600', display: 'inline-block', marginTop: '3px' }}>
                                        📌 Step View
                                      </span>
                                    )}
                                  </td>
                                  <td>
                                    <div className="px-fb-cell">
                                      <div className="px-fb-avatar">
                                        {(fb.studentName || fb.studentEmail || "S").charAt(0).toUpperCase()}
                                      </div>
                                      <span>{fb.studentName || fb.studentEmail}</span>
                                    </div>
                                  </td>
                                  <td className="px-fb-stars">
                                    {(() => {
                                      const r = Math.min(5, Math.max(1, fb.rating || (fb.action === "helpful" ? 5 : fb.action === "notRelevant" ? 1 : 4)));
                                      return (
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                          <span style={{ fontWeight: '700', color: '#f59e0b', fontSize: '13px' }}>{r.toFixed(1)}</span>
                                          <span>{"★".repeat(r) + "☆".repeat(5 - r)}</span>
                                        </span>
                                      );
                                    })()}
                                  </td>
                                  <td>
                                    <span className={`px-badge badge-${fb.action === "helpful" ? "paid" : fb.action === "notRelevant" ? "failed" : "pending"}`}>
                                      {fb.action}
                                    </span>
                                  </td>
                                  <td className="px-fb-comment-cell">{fb.comment}</td>
                                  <td>{formatDate(fb.date)}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="6" className="px-table-empty">
                                  No feedbacks recorded yet.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="px-feedback-list">
                        {feedbacksList.length ? (
                          feedbacksList.map((fb, idx) => (
                            <div className="px-feedback-card" key={fb._id || idx}>
                              <div className="px-fb-header">
                                <div className="px-fb-user">
                                  <div className="px-fb-avatar">
                                    {(fb.studentEmail || fb.studentName || "S").charAt(0).toUpperCase()}
                                  </div>
                                  <div className="px-fb-info">
                                    <span className="px-fb-email">{fb.studentName || fb.studentEmail}</span>
                                    <span className="px-fb-product">{fb.service}</span>
                                    {fb.type === "marketplace" || fb.providerName ? (
                                      <span style={{ fontSize: '10px', background: '#eef2ff', color: '#4f46e5', padding: '2px 6px', borderRadius: '4px', fontWeight: '600', display: 'inline-block', marginTop: '2px' }}>🛒 Marketplace</span>
                                    ) : (
                                      <span style={{ fontSize: '10px', background: '#f1f5f9', color: '#64748b', padding: '2px 6px', borderRadius: '4px', fontWeight: '600', display: 'inline-block', marginTop: '2px' }}>📌 Step View</span>
                                    )}
                                  </div>
                                </div>
                                <div className="px-fb-rating" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  {(() => {
                                    const r = Math.min(5, Math.max(1, fb.rating || (fb.action === "helpful" ? 5 : fb.action === "notRelevant" ? 1 : 4)));
                                    return (
                                      <>
                                        <span style={{ fontWeight: '700', color: '#f59e0b', fontSize: '13px' }}>{r.toFixed(1)}</span>
                                        <span>{"★".repeat(r) + "☆".repeat(5 - r)}</span>
                                      </>
                                    );
                                  })()}
                                </div>
                              </div>
                              <p className="px-fb-body">{fb.comment}</p>
                              <div className="px-fb-footer">
                                <span className="px-fb-action">{fb.action}</span>
                                <span>{formatDate(fb.date)}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-feedback-empty">No feedbacks recorded yet.</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ──────────────── SETTINGS VIEW ──────────────── */}
              {activeMenu === "Settings" && (
                <div className="px-view-fade">
                  <div className="px-section-card">
                    <div className="px-section-header">
                      <h2>Payout &amp; Integration Settings</h2>
                    </div>

                    <div className="px-settings-layout">
                      <div className="px-settings-section">
                        <h3>Bank account details</h3>
                        <div className="px-form-grid">
                          <div className="px-form-group">
                            <label>Account holder name</label>
                            <input
                              type="text"
                              value={payoutForm.holderName}
                              onChange={(e) => setPayoutForm({ ...payoutForm, holderName: e.target.value })}
                            />
                          </div>
                          <div className="px-form-group">
                            <label>Bank name</label>
                            <input
                              type="text"
                              value={payoutForm.bankName}
                              onChange={(e) => setPayoutForm({ ...payoutForm, bankName: e.target.value })}
                            />
                          </div>
                          <div className="px-form-group">
                            <label>Account number</label>
                            <input
                              type="text"
                              value={payoutForm.accountNumber}
                              onChange={(e) => setPayoutForm({ ...payoutForm, accountNumber: e.target.value })}
                            />
                          </div>
                          <div className="px-form-group">
                            <label>IFSC code</label>
                            <input
                              type="text"
                              value={payoutForm.ifsc}
                              onChange={(e) => setPayoutForm({ ...payoutForm, ifsc: e.target.value })}
                            />
                          </div>
                        </div>
                        <button className="px-btn-primary" onClick={() => alert("Payout settings updated successfully!")}>
                          Save changes
                        </button>
                      </div>

                      <div className="px-settings-section settings-integration">
                        <h3>Razorpay integration</h3>
                        <div className="px-integration-status">
                          <span className="px-status-dot glow-green" />
                          <div>
                            <p><strong>Gateway linked</strong></p>
                            <p className="subtext">Payments from students on the NaaviExclusive checkout route automatically to your verified merchant node.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ──────────────── SUPPORT VIEW ──────────────── */}
              {activeMenu === "Support" && (
                <div className="px-view-fade">
                  {/* Quick contact channels */}
                  <div className="px-support-top">
                    <div className="px-support-channel channel-email">
                      <div className="px-channel-icon"><Icon.Mail /></div>
                      <div>
                        <div className="px-channel-label">Email support</div>
                        <div className="px-channel-value">partnersupport@naavi.com</div>
                      </div>
                    </div>
                    <div className="px-support-channel channel-call">
                      <div className="px-channel-icon"><Icon.Phone /></div>
                      <div>
                        <div className="px-channel-label">Partner helpline</div>
                        <div className="px-channel-value">+91 90000 12345</div>
                      </div>
                    </div>
                    <div className="px-support-channel channel-admin">
                      <div className="px-channel-icon"><Icon.Ticket /></div>
                      <div>
                        <div className="px-channel-label">Avg. response</div>
                        <div className="px-channel-value">Under 24 hrs</div>
                      </div>
                    </div>
                  </div>

                  <div className="px-section-card">
                    <div className="px-support-grid">
                      <div className="px-support-info">
                        <h3>Frequently asked questions</h3>
                        <ul className="px-faq-list">
                          <li>
                            <strong>When do payouts get settled?</strong>
                            <p>Payouts are settled monthly on the 5th business day of each calendar cycle.</p>
                          </li>
                          <li>
                            <strong>How do I challenge a refund request?</strong>
                            <p>Flag it directly from the Refunds list, or email partnersupport@naavi.com with proof of service completion.</p>
                          </li>
                          <li>
                            <strong>Can I configure custom pricing per session?</strong>
                            <p>Yes — edit your active offerings from the Marketplace settings tab in your accountant workspace.</p>
                          </li>
                        </ul>
                      </div>

                      <div className="px-support-form">
                        <h3>Raise a request</h3>
                        <div className="px-form-group">
                          <label>Subject</label>
                          <input
                            type="text"
                            placeholder="e.g. payout delay, merchant node update..."
                            value={ticketSubject}
                            onChange={(e) => setTicketSubject(e.target.value)}
                          />
                        </div>
                        <div className="px-form-group">
                          <label>Message details</label>
                          <textarea
                            rows="3"
                            placeholder="Tell us what we can help with..."
                            value={ticketMessage}
                            onChange={(e) => setTicketMessage(e.target.value)}
                          />
                        </div>
                        <button
                          className="px-btn-primary px-btn-send"
                          onClick={handleTicketSubmit}
                          disabled={!ticketSubject.trim() || !ticketMessage.trim()}
                        >
                          <Icon.Send /> {ticketSubmitted ? "Sent ✓" : "Send to super admin"}
                        </button>
                      </div>
                    </div>

                    {/* Ticket history — static placeholder until the backend endpoint exists */}
                    <div className="px-ticket-history">
                      <div className="px-section-header">
                        <h2>Your requests</h2>
                      </div>
                      <div className="px-table-responsive">
                        <table className="px-table px-table--tickets">
                          <thead>
                            <tr>
                              <th>Subject</th>
                              <th>Priority</th>
                              <th>Status</th>
                              <th>Raised on</th>
                            </tr>
                          </thead>
                          <tbody>
                            {STATIC_SUPPORT_TICKETS.map((t) => (
                              <tr key={t.id}>
                                <td>
                                  <span className="px-ticket-row-subject">{t.subject}</span>
                                  <span className="px-ticket-row-id">{t.id}</span>
                                </td>
                                <td><span className="px-tbl-type">{t.priority}</span></td>
                                <td>
                                  <span className={`px-badge ${ticketBadgeClass(t.status)}`}>
                                    {t.status}
                                  </span>
                                </td>
                                <td>{formatDate(t.date)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}