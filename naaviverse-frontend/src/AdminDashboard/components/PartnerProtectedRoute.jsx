// ============================================================
// FILE: src/AdminDashboard/components/PartnerProtectedRoute.jsx
// ============================================================

import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const PartnerProtectedRoute = ({ children }) => {
  const partner = JSON.parse(localStorage.getItem("partner"));

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!partner || !partner.profileCreated) {
      setLoading(false);
      return;
    }

    // ✅ Correct URL: /api/approvals/status (plural — matches app.js mount)
    axios
      .get(`${BASE_URL}/api/approvals/status?email=${partner.email}`)
      .then((res) => {
        const liveStatus = res.data?.data?.status; // "approved" | "pending" | "rejected"

        console.log("✅ Approval response:", res.data);
        console.log("✅ liveStatus:", liveStatus);

        if (liveStatus === "approved") {
          localStorage.setItem("partner", JSON.stringify({
            ...partner, profileCreated: true, status: "approved",
          }));
          setStatus("approved");

        } else if (liveStatus === "rejected") {
          localStorage.setItem("partner", JSON.stringify({
            ...partner, profileCreated: true, status: "rejected",
          }));
          setStatus("rejected");

        } else {
          localStorage.setItem("partner", JSON.stringify({
            ...partner, profileCreated: true, status: "pending",
          }));
          setStatus("pending");
        }
      })
      .catch(() => {
        setStatus(partner.status || "pending");
      })
      .finally(() => setLoading(false));

  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 1. Not logged in
  if (!partner) return <Navigate to="/login" />;

  // 2. Profile not created yet
  if (!partner.profileCreated) {
    if (window.location.pathname !== "/dashboard/accountants/profile") {
      return <Navigate to="/dashboard/accountants/profile" />;
    }
    return children;
  }

  // 3. Loading
  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.overlay} />
        <div style={{ ...styles.card, padding: "40px 60px" }}>
          <div style={{ fontSize: "32px", marginBottom: "16px" }}>⏳</div>
          <p style={styles.message}>Verifying your account status…</p>
        </div>
      </div>
    );
  }

  // 4. PENDING
  if (status === "pending") {
    return (
      <div style={styles.page}>
        <div style={styles.overlay} />
        <div style={styles.card}>
          <div style={styles.iconCircle}>⏳</div>
          <h2 style={styles.title}>Account Under Review</h2>
          <p style={styles.message}>
            Your profile has been submitted successfully.<br />
            Our admin team is currently reviewing your account.<br /><br />
            <strong>You will receive an email once your account is approved.</strong>
          </p>
          <div style={styles.statusBadge}>● Pending Approval</div>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>
    );
  }

  // 5. REJECTED
  if (status === "rejected") {
    return (
      <div style={styles.page}>
        <div style={styles.overlay} />
        <div style={{ ...styles.card, borderTop: "4px solid #EF4444" }}>
          <div style={{ ...styles.iconCircle, background: "#FEE2E2" }}>❌</div>
          <h2 style={{ ...styles.title, color: "#DC2626" }}>Account Not Approved</h2>
          <p style={styles.message}>
            Unfortunately, your account was not approved.<br />
            Please contact support for more information.
          </p>
          <div style={{ ...styles.statusBadge, background: "#FEE2E2", color: "#DC2626" }}>
            ● Rejected
          </div>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>
    );
  }

  // 6. APPROVED
  return children;
};

const handleLogout = () => {
  localStorage.removeItem("partner");
  localStorage.removeItem("authToken");
  localStorage.removeItem("loginEmail");
  window.location.href = "/login";
};

const styles = {
  page: {
    position: "fixed", inset: 0,
    display: "flex", justifyContent: "center", alignItems: "center",
    zIndex: 9999,
  },
  overlay: {
    position: "absolute", inset: 0,
    background: "rgba(15, 23, 42, 0.65)",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
  },
  card: {
    position: "relative", zIndex: 1,
    background: "#fff", padding: "50px 60px",
    borderRadius: "20px", boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
    textAlign: "center", maxWidth: "480px", width: "90%",
    borderTop: "4px solid #2B7BB0",
  },
  iconCircle: {
    width: "72px", height: "72px", background: "#EFF6FF",
    borderRadius: "50%", display: "flex", alignItems: "center",
    justifyContent: "center", fontSize: "32px", margin: "0 auto 20px",
  },
  title: { fontSize: "24px", fontWeight: "700", color: "#1E293B", marginBottom: "12px" },
  message: { color: "#64748B", fontSize: "15px", lineHeight: "1.8", marginBottom: "24px" },
  statusBadge: {
    display: "inline-block", background: "#FEF9C3", color: "#854D0E",
    padding: "8px 24px", borderRadius: "999px",
    fontSize: "13px", fontWeight: "600", marginBottom: "28px",
  },
  logoutBtn: {
    display: "block", width: "100%", padding: "12px",
    background: "none", border: "1px solid #E2E8F0",
    borderRadius: "10px", color: "#64748B", fontSize: "14px", cursor: "pointer",
  },
};

export default PartnerProtectedRoute;