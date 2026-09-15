import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./userHome.scss";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const getUserFromStorage = () => {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.user || parsed;
  } catch { return null; }
};

const Icon = ({ type, size = 16, color = "currentColor" }) => {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round" };
  switch (type) {
    case "arrow-l": return <svg {...p}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>;
    default: return null;
  }
};

export default function UserPurchasesPage() {
  const navigate = useNavigate();
  const user = getUserFromStorage();
  const [purchases, setPurchases] = useState([]);
  const [purchasesLoading, setPurchasesLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;

    const fetchPurchases = async () => {
      try {
        setPurchasesLoading(true);
        const [txRes, userPathsRes] = await Promise.allSettled([
          axios.get(`${BASE_URL}/api/payment/transactions`, {
            params: { email: user.email },
          }),
          axios.get(`${BASE_URL}/api/userpaths`, {
            params: { email: user.email, status: "active" },
          }),
        ]);

        const txData = txRes.status === "fulfilled" ? txRes.value.data : null;
        const userPathsData = userPathsRes.status === "fulfilled" ? userPathsRes.value.data?.data || [] : [];

        if (txData?.success) {
          const filtered = txData.data
            .filter((t) => t.status?.toLowerCase() === "paid" && t.productId !== "naavi-platform")
            .map((t) => {
              const rawName = t.productName || "Marketplace Item";
              const cleanName = rawName
                .replace(/^Marketplace \(Free\) —\s*/i, "")
                .replace(/^Marketplace —\s*/i, "")
                .replace(/^Subscription —\s*/i, "");

              const isFree =
                Number(t.amount || 0) === 0 ||
                t.tier === "macro" ||
                rawName.toLowerCase().includes("(free)");

              const typeLabel = t.tier
                ? t.tier.charAt(0).toUpperCase() + t.tier.slice(1)
                : isFree
                ? "Macro"
                : "Marketplace";

              return {
                id: t._id,
                name: cleanName,
                type: typeLabel,
                plan: isFree
                  ? "Macro View"
                  : t.planTier && t.productId === "naavi-platform"
                  ? t.planTier.charAt(0).toUpperCase() + t.planTier.slice(1)
                  : "Marketplace",
                cost: isFree ? "Free" : `₹${(t.amount || 0).toLocaleString("en-IN")}`,
                amount: t.amount || 0,
                isFree,
                date: new Date(t.createdAt || Date.now()).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }),
                rawDate: new Date(t.createdAt || Date.now()).getTime(),
                status: isFree ? "Free" : "Paid",
                icon: isFree ? "🧭" : "🛍️",
              };
            });

          const macroPathEnrollments = (userPathsData || []).map((up) => {
            const pathName =
              up.PathDetails?.[0]?.nameOfPath ||
              up.PathDetails?.[0]?.name ||
              up.pathDetails?.nameOfPath ||
              up.pathName ||
              "Pathway";

            return {
              id: `macro-path-${up._id || up.pathId}`,
              name: `${pathName} (Macro View)`,
              type: "Macro",
              plan: "Macro View",
              cost: "Free",
              amount: 0,
              isFree: true,
              date: new Date(up.createdAt || Date.now()).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              rawDate: new Date(up.createdAt || Date.now()).getTime(),
              status: "Free",
              icon: "🧭",
            };
          });

          const allPurchases = [...filtered, ...macroPathEnrollments].sort(
            (a, b) => b.rawDate - a.rawDate
          );

          setPurchases(allPurchases);
        }
      } catch (err) {
        console.error("❌ Purchases fetch error:", err);
      } finally {
        setPurchasesLoading(false);
      }
    };

    fetchPurchases();
  }, [user?.email]);

  return (
    <div className="uh-root" style={{ padding: "24px" }}>
      <div className="uh-card" style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
        <div className="uh-view-all-header" style={{ marginBottom: "20px" }}>
          <button className="uh-view-all-back-btn" onClick={() => navigate("/dashboard/users/home")}>
            <Icon type="arrow-l" size={12} color="var(--uh-blue-mid)" /> Back to Dashboard
          </button>
          <h3 className="uh-view-all-title" style={{ fontSize: "18px" }}>Marketplace Purchases</h3>
        </div>

        <div className="uh-section-title" style={{ fontSize: "11px", marginBottom: "14px" }}>All Purchases</div>

        {purchasesLoading ? (
          <div className="uh-loading">Loading purchases…</div>
        ) : purchases.length === 0 ? (
          <div className="uh-no-purchases" style={{ padding: "60px 20px", textAlign: "center", color: "#64748b" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🛍️</div>
            <strong>No purchases found</strong>
            <p style={{ margin: "6px 0 0", fontSize: "0.85rem" }}>Paid marketplace items will show up here once purchased.</p>
          </div>
        ) : (
          <>
            <div className="uh-purchases-list" style={{ gap: "10px", marginBottom: "20px" }}>
              {purchases.map(m => (
                <div key={m.id} className="uh-purchase-row">
                  <div className="uh-purchase-emoji">{m.icon}</div>
                  <div className="uh-purchase-info">
                    <span className="uh-purchase-name">{m.name}</span>
                    <span className="uh-purchase-meta">{m.type} · {m.isFree ? "Enrolled" : "Purchased"} {m.date}</span>
                  </div>
                  <div className="uh-purchase-right">
                    <span className={`uh-plan-tag p-${(m.plan || "").toLowerCase().replace(/\s+/g, "-")}`}>{m.plan}</span>
                    <span className="uh-purchase-cr" style={{ color: m.isFree ? "#4f46e5" : "#0d9488", fontWeight: "bold" }}>{m.cost}</span>
                  </div>
                  <span className={`uh-status-dot ${m.isFree ? "s-free" : "s-active"}`}>
                    {m.isFree ? "Free" : "Paid"}
                  </span>
                </div>
              ))}
            </div>
            <div className="uh-purchases-total" style={{ padding: "14px" }}>
              <span style={{ fontSize: "13px" }}>Total spent</span>
              <strong style={{ fontSize: "16px" }}>₹{purchases.reduce((s, p) => s + (p.amount || 0), 0).toLocaleString("en-IN")}</strong>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
