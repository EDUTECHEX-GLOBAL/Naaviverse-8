import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Navigate } from "react-router-dom";
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

export default function PartnerExclusiveDashboard() {
  const navigate = useNavigate();

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

  const [activeMenu, setActiveMenu] = useState("Overview");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all', 'online', 'direct'
  const [filterStatus, setFilterStatus] = useState("all"); // 'all', 'Paid', 'Pending', 'Failed'

  // Settings states
  const [payoutForm, setPayoutForm] = useState({
    bankName: "HDFC Bank",
    accountNumber: "•••• •••• 9876",
    ifsc: "HDFC0001234",
    holderName: partner?.businessName || partner?.username || "John Doe",
  });

  useEffect(() => {
    if (!partner || (!partner.partnerId && !partner.email)) return;

    const fetchStats = async () => {
      try {
        setLoading(true);
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
      }
    };

    const intervalId = setInterval(fetchStats, 5000); // refresh dashboard stats every 5s
    fetchStats();
    return () => clearInterval(intervalId);
  }, [partner]);


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
    { key: "Overview", label: "Overview", icon: "📊" },
    { key: "Transactions", label: "Transactions", icon: "💸" },
    { key: "Refunds", label: "Refunds", icon: "↩️" },
    { key: "Feedbacks", label: "Feedbacks", icon: "💬" },
    { key: "Settings", label: "Settings", icon: "⚙️" },
    { key: "Support", label: "Support", icon: "❔" }
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
              onClick={() => setActiveMenu(menu.key)}
            >
              <span className="px-nav-icon">{menu.icon}</span>
              <span className="px-nav-label">{menu.label}</span>
            </button>
          ))}
        </nav>
        <div className="px-sidebar-footer">
          <button className="px-logout-btn" onClick={handleLogout}>
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Content wrapper */}
      <main className="px-main-container">
        {/* Top Header */}
        <header className="px-header">
          <div className="px-header-title">
            <h1>Naavi Exclusive Partner Dashboard</h1>
            <p className="px-partner-badge">Partner ID: {partner.partnerId}</p>
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
              <span>⚠️</span>
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
                              <stop offset="0%" stopColor="#0d9488" stopOpacity="0.4" />
                              <stop offset="100%" stopColor="#0d9488" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <path
                            d="M0,25 Q15,10 30,18 T60,5 T90,12 L100,8 L100,30 L0,30 Z"
                            fill="url(#glowGrad)"
                          />
                          <path
                            d="M0,25 Q15,10 30,18 T60,5 T90,12 L100,8"
                            fill="none"
                            stroke="#0d9488"
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
                          <rect x="5" y="10" width="8" height="20" rx="2" fill="rgba(34,115,230,0.4)" />
                          <rect x="18" y="5" width="8" height="25" rx="2" fill="rgba(34,115,230,0.4)" />
                          <rect x="31" y="12" width="8" height="18" rx="2" fill="rgba(34,115,230,0.4)" />
                          <rect x="44" y="8" width="8" height="22" rx="2" fill="rgba(34,115,230,0.4)" />
                          <rect x="57" y="18" width="8" height="12" rx="2" fill="#2273e6" />
                          <rect x="70" y="4" width="8" height="26" rx="2" fill="#2273e6" />
                          <rect x="83" y="10" width="8" height="20" rx="2" fill="#2273e6" />
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
                            stroke="#1E293B"
                            strokeWidth="3.5"
                          />
                          <path
                            className="px-donut-segment"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#F59E0B"
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
                      <button className="px-view-all-btn" onClick={() => setActiveMenu("Transactions")}>
                        View All Transactions ➔
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
                            <th>Feedback</th>
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
                                <td className="px-tbl-comment">"{tx.feedback}"</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="6" style={{ textAlign: "center", padding: "40px 0" }}>
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
                        📥 Export to Excel
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
                    <div className="px-section-header">
                      <h2>Student Feedbacks & Reviews</h2>
                    </div>
                    <div className="px-feedback-list">
                      {stats?.feedbacks?.length ? (
                        stats.feedbacks.map((fb, idx) => (
                          <div className="px-feedback-card" key={fb._id || idx}>
                            <div className="px-fb-header">
                              <div className="px-fb-user">
                                <div className="px-fb-avatar" style={{ backgroundColor: `hsl(${(idx * 65) % 360}, 60%, 45%)` }}>
                                  {fb.studentEmail.charAt(0).toUpperCase()}
                                </div>
                                <div className="px-fb-info">
                                  <span className="px-fb-email">{fb.studentName}</span>
                                  <span className="px-fb-product">Service: {fb.service}</span>
                                </div>
                              </div>
                              <div className="px-fb-rating">
                                {fb.action === "notRelevant" ? "★★" : "★★★★★"}
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
                      ) : stats?.allTransactions?.filter(t => t.status === "Paid").map((tx, idx) => (
                        <div className="px-feedback-card" key={tx._id || idx}>
                          <div className="px-fb-header">
                            <div className="px-fb-user">
                              <div className="px-fb-avatar" style={{ backgroundColor: `hsl(${(idx * 60) % 360}, 50%, 50%)` }}>
                                {tx.studentEmail.charAt(0).toUpperCase()}
                              </div>
                              <div className="px-fb-info">
                                <span className="px-fb-email">{tx.studentEmail}</span>
                                <span className="px-fb-product">Service: {tx.service}</span>
                              </div>
                            </div>
                            <div className="px-fb-rating">
                              {"★".repeat(5)}
                            </div>
                          </div>
                          <div className="px-fb-body">
                            <p>"{tx.feedback}"</p>
                          </div>
                          <div className="px-fb-footer">
                            <span>Logged via: {tx.type}</span>
                            <span>•</span>
                            <span>{formatDate(tx.date)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
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
