import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./userHome.scss";
import { SvgShoppingBag, SvgCompass } from "../../utils/SvgIcons";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const getUserFromStorage = () => {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.user || parsed;
  } catch { return null; }
};

export default function UserPurchasesPage() {
  const navigate = useNavigate();
  const user = getUserFromStorage();
  const [purchases, setPurchases] = useState([]);
  const [purchasesLoading, setPurchasesLoading] = useState(true);
  const [filterType, setFilterType] = useState("paid");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

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
          const isSubscriptionPlan = (t) => {
            if (!t) return false;
            const prodId = (t.productId || "").toLowerCase();
            const prodName = (t.productName || "").trim();
            const nameLower = prodName.toLowerCase();

            if (
              prodId === "naavi-marketplace" ||
              prodId.startsWith("macro-") ||
              prodId.startsWith("micro-") ||
              prodId.startsWith("nano-") ||
              nameLower.startsWith("marketplace") ||
              t.partnerId ||
              t.partnerEmail
            ) {
              return false;
            }

            if (prodId === "naavi-platform" || t.planTier) {
              return true;
            }

            return (
              nameLower.includes("nano plan") ||
              nameLower.includes("micro plan") ||
              nameLower.includes("plus plan") ||
              nameLower.includes("pro plan") ||
              nameLower.includes("naavi pro") ||
              nameLower.includes("standard plan") ||
              nameLower.includes("platform subscription")
            );
          };

          const filtered = (txData.data || [])
            .filter((t) => t.status?.toLowerCase() !== "pending" && !isSubscriptionPlan(t))
            .map((t) => {
              const rawName = t.productName || "Marketplace Item";
              const cleanName = rawName
                .replace(/^Marketplace \(Free\) —\s*/i, "")
                .replace(/^Marketplace —\s*/i, "")
                .replace(/^Subscription —\s*/i, "");

              const isFailed = t.status?.toLowerCase() === "failed";
              const isFree =
                !isFailed &&
                (Number(t.amount || 0) === 0 || rawName.toLowerCase().includes("(free)"));

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
                  : "Marketplace",
                cost: isFree ? "₹0" : `₹${(t.amount || 0).toLocaleString("en-IN")}`,
                amount: t.amount || 0,
                isFree,
                isFailed,
                date: new Date(t.createdAt || Date.now()).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }),
                rawDate: new Date(t.createdAt || Date.now()).getTime(),
                status: isFailed ? "Failed" : isFree ? "Free" : "Paid",
                icon: isFree ? <SvgCompass size={16} /> : <SvgShoppingBag size={16} />,
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
              cost: "₹0",
              amount: 0,
              isFree: true,
              isFailed: false,
              date: new Date(up.createdAt || Date.now()).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              rawDate: new Date(up.createdAt || Date.now()).getTime(),
              status: "Free",
              icon: <SvgCompass size={16} />,
            };
          });

          const allPurchases = [...filtered, ...macroPathEnrollments].sort(
            (a, b) => b.rawDate - a.rawDate
          );

          setPurchases(allPurchases);
        }
      } catch (err) {
        console.error("[error] Purchases fetch error:", err);
      } finally {
        setPurchasesLoading(false);
      }
    };

    fetchPurchases();
  }, [user?.email]);

  const displayedPurchases = purchases.filter((p) =>
    filterType === "free" ? p.isFree : !p.isFree
  );

  return (
    <div className="uh-root uh-purchases-page-root">
      <div className="uh-card uh-purchases-page-card">
        <div className="uh-view-all-header">
          <h3 className="uh-view-all-title">
            Marketplace Purchases
          </h3>

          {/* Marketplace Purchases Filter Dropdown (Right-aligned to stay inside card on all screens) */}
          <div className="uh-view-all-filter-wrap" ref={dropdownRef}>
            <button
              type="button"
              className={`uh-filter-select uh-filter-btn ${dropdownOpen ? "is-open" : ""}`}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-label="Filter purchases"
            >
              <span>{filterType === "free" ? "Free" : "Paid"}</span>
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {dropdownOpen && (
              <div className="uh-dropdown-menu">
                <div
                  className={`uh-dropdown-item ${filterType === "free" ? "active" : ""}`}
                  onClick={() => {
                    setFilterType("free");
                    setDropdownOpen(false);
                  }}
                >
                  Free
                </div>
                <div
                  className={`uh-dropdown-item ${filterType === "paid" ? "active" : ""}`}
                  onClick={() => {
                    setFilterType("paid");
                    setDropdownOpen(false);
                  }}
                >
                  Paid
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="uh-section-title" style={{ fontSize: "11px", marginBottom: "14px" }}>
          {filterType === "free" ? "Free Purchases" : "Paid Purchases"}
        </div>

        {purchasesLoading ? (
          <div className="uh-loading">Loading purchases…</div>
        ) : displayedPurchases.length === 0 ? (
          <div className="uh-no-purchases" style={{ padding: "60px 20px", textAlign: "center", color: "#64748b" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}><SvgShoppingBag size={14} />️</div>
            <strong>No {filterType} purchases found</strong>
            <p style={{ margin: "6px 0 0", fontSize: "0.85rem" }}>
              {filterType === "paid"
                ? "Paid marketplace items will show up here once purchased."
                : "Free enrolled pathways and items will show up here."}
            </p>
          </div>
        ) : (
          <>
            <div className="uh-purchases-list" style={{ gap: "10px", marginBottom: "20px" }}>
              {displayedPurchases.map(m => (
                <div key={m.id} className="uh-purchase-row">
                  <div className="uh-purchase-emoji">{m.icon}</div>
                  <div className="uh-purchase-info">
                    <span className="uh-purchase-name">{m.name}</span>
                    <span className="uh-purchase-meta">{m.type} · {m.isFailed ? "Failed on " : m.isFree ? "Enrolled " : "Purchased "} {m.date}</span>
                  </div>
                  <div className="uh-purchase-right">
                    <span className={`uh-plan-tag p-${(m.plan || "").toLowerCase().replace(/\s+/g, "-")}`}>{m.plan}</span>
                    <span className="uh-purchase-cr" style={{ color: m.isFailed ? "#dc2626" : m.isFree ? "#4f46e5" : "#0d9488", fontWeight: "bold" }}>{m.cost}</span>
                  </div>
                  <span className={`uh-status-dot ${m.isFailed ? "s-failed" : m.isFree ? "s-free" : "s-active"}`}>
                    {m.status}
                  </span>
                </div>
              ))}
            </div>
            <div className="uh-purchases-total" style={{ padding: "14px" }}>
              <span style={{ fontSize: "13px" }}>Total spent</span>
              <strong style={{ fontSize: "16px" }}>₹{displayedPurchases.filter(p => p.status === "Paid").reduce((s, p) => s + (p.amount || 0), 0).toLocaleString("en-IN")}</strong>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
