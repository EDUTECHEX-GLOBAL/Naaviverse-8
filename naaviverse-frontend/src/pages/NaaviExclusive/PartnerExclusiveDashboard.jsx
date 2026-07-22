import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, Navigate, useParams } from "react-router-dom";
import axios from "axios";
import * as XLSX from "xlsx";
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
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all', 'online', 'direct'
  const [filterStatus, setFilterStatus] = useState("all"); // 'all', 'Paid', 'Pending', 'Failed'
  const [feedbackView, setFeedbackView] = useState("cards"); // 'cards' or 'table'

  const feedbacksList = useMemo(() => {
    return stats?.feedbacks || [];
  }, [stats]);

  // Settings states
  const [payoutForm, setPayoutForm] = useState({
    bankName: "HDFC Bank",
    accountNumber: "•••• •••• 9876",
    ifsc: "HDFC0001234",
    holderName: partner?.businessName || partner?.username || "John Doe",
  });

  const fetchStats = useCallback(async (isManual = false) => {
    if (!partner || (!partner.partnerId && !partner.email)) return;
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);
      setErrorMsg("");
      const res = await axios.get(`${BASE_URL}/api/partner-dashboard/exclusive-stats`, {
        params: {
          partnerId: partner?.partnerId || "",
          email: partner?.email || ""
        }
      });
      if (res.data?.status && res.data?.data) {
        setStats(res.data.data);
        // If partnerId was resolved by backend and is missing locally, save it!
        if (res.data.partner?.partnerId && !partner.partnerId) {
          const updated = { ...partner, partnerId: res.data.partner.partnerId };
          localStorage.setItem("partner", JSON.stringify(updated));
        }
      } else {
        setErrorMsg(res.data?.message || "Failed to load dashboard data.");
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setErrorMsg("Failed to connect to stats service.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [partner]);

  useEffect(() => {
    fetchStats();
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
    XLSX.writeFile(wb, `${partner?.partnerId || "partner"}_Transactions.xlsx`);
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
      {/* Background blobs */}
      <div className="px-blob px-blob-1" />
      <div className="px-blob px-blob-2" />

      {/* Sidebar */}
      <aside className="px-sidebar">
        <div className="px-sidebar-brand" onClick={() => navigate("/dashboard/accountants")}>
          <span className="px-brand-icon">✦</span>
          <span className="px-brand-text">Naavi<span className="px-brand-accent">Exclusive</span></span>
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
            <Icon.Logout /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content wrapper */}
      <main className="px-main-container">
        {/* Top Header */}
        <header className="px-header">
          <div className="px-header-title">
            <h1>Naavi Exclusive Partner Dashboard</h1>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "4px" }}>
              <p className="px-partner-badge">Partner ID: {partner.partnerId}</p>
              <button
                className="px-refresh-btn"
                onClick={() => fetchStats(true)}
                disabled={loading || refreshing}
              >
                {refreshing ? "⏳ Loading..." : "↻ Refresh"}
              </button>
            </div>
          </div>
          <div className="px-header-user">
            <div className="px-user-avatar">
              {(partner.businessName || partner.username || "P").charAt(0).toUpperCase()}
            </div>
            <div className="px-user-info">
              <span className="px-username">{partner.businessName || partner.username}</span>
              <span className="px-userrole">Verified Partner</span>
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
                    <div className="px-metric-card">
                      <div className="px-card-header">
                        <span className="px-card-label">Total Earnings</span>
                        <span className="px-card-more">•••</span>
                      </div>
                      <div className="px-card-value">{formatCurrency(stats?.totalEarnings || 0)}</div>
                      <div className="px-card-sub text-success">+12.5% vs last month</div>

                      {/* SVG Line Sparkline Chart */}
                      <div className="px-chart-wrapper">
                        <svg className="px-sparkline" viewBox="0 0 100 30">
                          <defs>
                            <linearGradient id="glowGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#c6a15b" stopOpacity="0.4" />
                              <stop offset="100%" stopColor="#c6a15b" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <path
                            d="M0,25 Q15,10 30,18 T60,5 T90,12 L100,8 L100,30 L0,30 Z"
                            fill="url(#glowGrad)"
                          />
                          <path
                            d="M0,25 Q15,10 30,18 T60,5 T90,12 L100,8"
                            fill="none"
                            stroke="#e7c988"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Card 2: Active Students */}
                    <div className="px-metric-card">
                      <div className="px-card-header">
                        <span className="px-card-label">Active Students</span>
                        <span className="px-card-more">•••</span>
                      </div>
                      <div className="px-card-value">{stats?.activeStudents || 0}</div>
                      <div className="px-card-sub text-teal">+8% this week</div>

                      {/* SVG Bar Chart */}
                      <div className="px-chart-wrapper">
                        <svg className="px-barchart" viewBox="0 0 100 30">
                          <rect x="5" y="10" width="8" height="20" rx="2" fill="rgba(124,111,242,0.35)" />
                          <rect x="18" y="5" width="8" height="25" rx="2" fill="rgba(124,111,242,0.35)" />
                          <rect x="31" y="12" width="8" height="18" rx="2" fill="rgba(124,111,242,0.35)" />
                          <rect x="44" y="8" width="8" height="22" rx="2" fill="rgba(124,111,242,0.35)" />
                          <rect x="57" y="18" width="8" height="12" rx="2" fill="#7c6ff2" />
                          <rect x="70" y="4" width="8" height="26" rx="2" fill="#7c6ff2" />
                          <rect x="83" y="10" width="8" height="20" rx="2" fill="#7c6ff2" />
                        </svg>
                      </div>
                    </div>

                    {/* Card 3: Refund Rate */}
                    <div className="px-metric-card">
                      <div className="px-card-header">
                        <span className="px-card-label">Refund Rate</span>
                        <span className="px-card-more">•••</span>
                      </div>
                      <div className="px-card-value">{stats?.refundRate || 1.2}%</div>
                      <div className="px-card-sub text-muted">-0.5% lower risk</div>

                      {/* SVG Donut Chart */}
                      <div className="px-donut-chart-wrapper">
                        <svg className="px-donutchart" viewBox="0 0 36 36">
                          <path
                            className="px-donut-ring"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#252838"
                            strokeWidth="3.5"
                          />
                          <path
                            className="px-donut-segment"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#dba552"
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
                        View All Transactions →
                      </button>
                    </div>
                    <div className="px-table-responsive">
                      <table className="px-table">
                        <thead>
                          <tr>
                            <th>Student Email</th>
                            <th>Service</th>
                            <th>Payment Status</th>
                            <th>Type</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats?.recentTransactions?.length ? (
                            stats.recentTransactions.map((tx) => (
                              <tr key={tx._id}>
                                <td><span className="px-tbl-email">{tx.studentEmail}</span></td>
                                <td>{tx.service}</td>
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
                              <td colSpan="5" style={{ textAlign: "center", padding: "40px 0" }}>
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
                      <h2>All Payments & Transactions</h2>
                      <button className="px-export-btn" onClick={handleExportExcel} disabled={!stats?.allTransactions?.length}>
                        <Icon.Download /> Export to Excel
                      </button>
                    </div>

                    {/* Filter toolbar */}
                    <div className="px-filter-toolbar">
                      <input
                        type="text"
                        placeholder="Search student email or service name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="px-filter-input"
                      />
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-filter-select"
                      >
                        <option value="all">All Methods</option>
                        <option value="online">Online Checkout</option>
                        <option value="direct">Direct Purchase</option>
                      </select>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-filter-select"
                      >
                        <option value="all">All Statuses</option>
                        <option value="Paid">Paid Only</option>
                        <option value="Pending">Pending Only</option>
                        <option value="Failed">Failed Only</option>
                      </select>
                    </div>

                    <div className="px-table-responsive">
                      <table className="px-table">
                        <thead>
                          <tr>
                            <th>Student Email</th>
                            <th>Service Name</th>
                            <th>Amount</th>
                            <th>Method</th>
                            <th>Status</th>
                            <th>Transaction Date</th>
                            <th>Feedback Log</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTransactions.length ? (
                            filteredTransactions.map((tx) => (
                              <tr key={tx._id}>
                                <td><span className="px-tbl-email">{tx.studentEmail}</span></td>
                                <td>{tx.service}</td>
                                <td><strong>{formatCurrency(tx.amount)}</strong></td>
                                <td><span className="px-tbl-type">{tx.type}</span></td>
                                <td>
                                  <span className={`px-badge badge-${tx.status.toLowerCase()}`}>
                                    {tx.status}
                                  </span>
                                </td>
                                <td>{formatDate(tx.date)}</td>
                                <td className="px-tbl-comment">"{tx.feedback}"</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="7" style={{ textAlign: "center", padding: "60px 0" }}>
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
                      <table className="px-table">
                        <thead>
                          <tr>
                            <th>Refund ID</th>
                            <th>Student Email</th>
                            <th>Product/Service</th>
                            <th>Refund Amount</th>
                            <th>Reason</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>#REF-9812A</td>
                            <td><span className="px-tbl-email">lisa.wong@email.com</span></td>
                            <td>Skills Workshop</td>
                            <td>₹499</td>
                            <td>Accidental double billing</td>
                            <td>
                              <span className="px-badge badge-pending">Pending Approval</span>
                            </td>
                          </tr>
                          <tr>
                            <td>#REF-9482A</td>
                            <td><span className="px-tbl-email">sarah.jones@email.com</span></td>
                            <td>Online Tutoring</td>
                            <td>₹2,000</td>
                            <td>Student requested reschedule and cancellation</td>
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
              {activeMenu === "Feedbacks" && (
                <div className="px-view-fade">
                  <div className="px-section-card">
                    <div className="px-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h2>Student Feedbacks & Reviews</h2>
                      
                      {/* View Toggles */}
                      <div className="px-feedback-tabs" style={{ display: "flex", gap: "4px", background: "rgba(255,255,255,0.04)", padding: "4px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <button
                          className={`px-feedback-tab-btn ${feedbackView === "cards" ? "active" : ""}`}
                          onClick={() => setFeedbackView("cards")}
                          style={{
                            background: feedbackView === "cards" ? "#7c6ff2" : "transparent",
                            border: "none",
                            color: feedbackView === "cards" ? "#fff" : "#a6ade0",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            fontSize: "0.8rem",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "all 0.2s ease"
                          }}
                        >
                          Grid View
                        </button>
                        <button
                          className={`px-feedback-tab-btn ${feedbackView === "table" ? "active" : ""}`}
                          onClick={() => setFeedbackView("table")}
                          style={{
                            background: feedbackView === "table" ? "#7c6ff2" : "transparent",
                            border: "none",
                            color: feedbackView === "table" ? "#fff" : "#a6ade0",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            fontSize: "0.8rem",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "all 0.2s ease"
                          }}
                        >
                          Tabular View
                        </button>
                      </div>
                    </div>

                    {feedbackView === "table" ? (
                      <div className="px-table-responsive">
                        <table className="px-table">
                          <thead>
                            <tr>
                              <th>Student</th>
                              <th>Service / Pathway</th>
                              <th>Rating</th>
                              <th>Action</th>
                              <th>Comment / Full Feedback</th>
                              <th>Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {feedbacksList.length ? (
                              feedbacksList.map((fb, idx) => (
                                <tr key={fb._id || idx}>
                                  <td>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                      <div className="px-fb-avatar" style={{ width: "24px", height: "24px", borderRadius: "50%", color: "#14161f", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", backgroundColor: idx % 2 === 0 ? "#c6a15b" : "#7c6ff2", flexShrink: 0 }}>
                                        {(fb.studentName || fb.studentEmail || "S").charAt(0).toUpperCase()}
                                      </div>
                                      <span className="px-tbl-email">{fb.studentName || fb.studentEmail}</span>
                                    </div>
                                  </td>
                                  <td>{fb.service}</td>
                                  <td style={{ color: "#e7c988", fontSize: "0.85rem", letterSpacing: "0.04em" }}>
                                    {"★".repeat(fb.rating || 3)}{"☆".repeat(5 - (fb.rating || 3))}
                                  </td>
                                  <td>
                                    <span className={`px-badge badge-${fb.action === "helpful" ? "paid" : fb.action === "notRelevant" ? "failed" : "pending"}`} style={{ fontSize: "0.65rem", padding: "2px 6px" }}>
                                      {fb.action}
                                    </span>
                                  </td>
                                  <td style={{ color: "#f2f1ea", fontSize: "0.82rem", whiteSpace: "normal", wordBreak: "break-word", lineHeight: "1.4" }}>
                                    "{fb.comment}"
                                  </td>
                                  <td>{formatDate(fb.date)}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="6" style={{ textAlign: "center", padding: "40px 0" }}>
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
                                  <div className="px-fb-avatar" style={{ backgroundColor: idx % 2 === 0 ? "#c6a15b" : "#7c6ff2" }}>
                                    {(fb.studentEmail || fb.studentName || "S").charAt(0).toUpperCase()}
                                  </div>
                                  <div className="px-fb-info">
                                    <span className="px-fb-email">{fb.studentName || fb.studentEmail}</span>
                                    <span className="px-fb-product">Service: {fb.service}</span>
                                  </div>
                                </div>
                                <div className="px-fb-rating">
                                  {"★".repeat(fb.rating || 3)}{"☆".repeat(5 - (fb.rating || 3))}
                                </div>
                              </div>
                              <div className="px-fb-body">
                                <p>"{fb.comment}"</p>
                              </div>
                              <div className="px-fb-footer">
                                <span>Action: {fb.action}</span>
                                <span>•</span>
                                <span>{formatDate(fb.date)}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div style={{ textAlign: "center", padding: "40px 0", color: "#656d8c", gridColumn: "span 2" }}>
                            No feedbacks recorded yet.
                          </div>
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
                      <h2>Payout & Integration Settings</h2>
                    </div>

                    <div className="px-settings-layout">
                      <div className="px-settings-section">
                        <h3>Bank Account Details (For Monthly Payouts)</h3>
                        <div className="px-form-grid">
                          <div className="px-form-group">
                            <label>Account Holder Name</label>
                            <input
                              type="text"
                              value={payoutForm.holderName}
                              onChange={(e) => setPayoutForm({ ...payoutForm, holderName: e.target.value })}
                            />
                          </div>
                          <div className="px-form-group">
                            <label>Bank Name</label>
                            <input
                              type="text"
                              value={payoutForm.bankName}
                              onChange={(e) => setPayoutForm({ ...payoutForm, bankName: e.target.value })}
                            />
                          </div>
                          <div className="px-form-group">
                            <label>Account Number</label>
                            <input
                              type="text"
                              value={payoutForm.accountNumber}
                              onChange={(e) => setPayoutForm({ ...payoutForm, accountNumber: e.target.value })}
                            />
                          </div>
                          <div className="px-form-group">
                            <label>IFSC Code</label>
                            <input
                              type="text"
                              value={payoutForm.ifsc}
                              onChange={(e) => setPayoutForm({ ...payoutForm, ifsc: e.target.value })}
                            />
                          </div>
                        </div>
                        <button className="px-save-settings-btn" onClick={() => alert("Payout settings updated successfully!")}>
                          Save Payout Settings
                        </button>
                      </div>

                      <div className="px-settings-section">
                        <h3>Razorpay Integration status</h3>
                        <div className="px-integration-status">
                          <span className="px-status-dot glow-green" />
                          <div>
                            <p><strong>Razorpay Gateway Linked</strong></p>
                            <p className="subtext">Payments from students on NaaviExclusive checkout are automatically routed to your verified merchant node.</p>
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
                  <div className="px-section-card">
                    <div className="px-section-header">
                      <h2>Partner Support Center</h2>
                    </div>
                    <div className="px-support-grid">
                      <div className="px-support-info">
                        <h3>Frequently Asked Questions</h3>
                        <ul className="px-faq-list">
                          <li>
                            <strong>When do payouts get settled?</strong>
                            <p>Payouts are settled monthly on the 5th business day of each calendar cycle.</p>
                          </li>
                          <li>
                            <strong>How do I challenge a refund request?</strong>
                            <p>You can flag the request directly from the Refunds list or email us at partnersupport@naavi.com with proof of service completion.</p>
                          </li>
                          <li>
                            <strong>Can I configure custom pricing per session?</strong>
                            <p>Yes, you can edit your active offerings directly from the Marketplace settings tab in your accountant workspace dashboard.</p>
                          </li>
                        </ul>
                      </div>

                      <div className="px-support-form">
                        <h3>Create a Support Ticket</h3>
                        <div className="px-form-group">
                          <label>Subject</label>
                          <input type="text" placeholder="e.g. payout delay, merchant node update..." />
                        </div>
                        <div className="px-form-group">
                          <label>Message details</label>
                          <textarea rows="5" placeholder="Tell us what we can help with..." />
                        </div>
                        <button className="px-save-settings-btn" onClick={() => alert("Ticket submitted successfully! Support will reply via email shortly.")}>
                          Submit Ticket
                        </button>
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