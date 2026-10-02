const mongoose = require("mongoose");
const VaultTransaction = require("../models/VaultTransactionModel");
const UserPath = require("../models/UserPathsModel");
const Path = require("../models/PathModel");
const Step = require("../models/StepsModel");
const Payment = require("../models/PaymentModel");
const Purchase = require("../models/PurchaseModel");
const MarketplaceAssistance = require("../models/MarketplaceAssistanceModel");
const Activity = require("../models/ActivityModel");

function formatTimeAgo(date) {
  if (!date) return "Recently";
  const now = new Date();
  const d = new Date(date);
  const diffSec = Math.floor((now - d) / 1000);
  if (isNaN(diffSec) || diffSec < 0) return "Just now";
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDays = Math.floor(diffHour / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

/**
 * GET /api/users/notifications?email=...
 * GET /api/user-dashboard/notifications?email=...
 *
 * Real, live notification feed for a user aggregated from:
 * - Vault (Credit additions, debits, expiry alerts)
 * - UserPaths (Enrolled paths, steps unlocked, steps completed)
 * - Payments & Purchases (Platform subscriptions, marketplace orders)
 * - Marketplace Assistance (Ticket replies & recommendation replacements)
 * - User Activity Stream (Live platform events)
 */
const getUserNotifications = async (req, res) => {
  try {
    const email = (req.query.email || req.query.userEmail || "").trim();
    if (!email) {
      return res.status(400).json({ status: false, message: "Email is required" });
    }

    const [vaultTxns, userPaths, payments, purchases, assistanceReqs, userActivity] = await Promise.all([
      VaultTransaction.find({ email }).sort({ timestamp: -1, createdAt: -1 }).limit(20).lean().catch(() => []),
      UserPath.find({ email, status: "active" }).sort({ updatedAt: -1, createdAt: -1 }).lean().catch(() => []),
      Payment.find({ userEmail: email }).sort({ createdAt: -1 }).limit(15).lean().catch(() => []),
      Purchase.find({ clientEmail: email }).sort({ date: -1, createdAt: -1 }).limit(15).lean().catch(() => []),
      MarketplaceAssistance.find({ userEmail: email }).sort({ updatedAt: -1, createdAt: -1 }).limit(10).lean().catch(() => []),
      Activity.findOne({ actorEmail: email, role: "user" }).lean().catch(() => null),
    ]);

    const notifs = [];

    // 1. Vault Expiry Alert
    const bonusTxn = vaultTxns.find(t => t.metadata?.type === "welcome_bonus" || t.expiresAt);
    if (bonusTxn) {
      let expiresAt = null;
      if (bonusTxn.expiresAt) {
        expiresAt = new Date(bonusTxn.expiresAt);
      } else if (bonusTxn.timestamp) {
        expiresAt = new Date(bonusTxn.timestamp);
        expiresAt.setDate(expiresAt.getDate() + 14);
      }

      if (expiresAt) {
        const now = new Date();
        const isExpired = expiresAt < now;
        const msLeft = Math.max(0, expiresAt - now);
        const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
        if (isExpired) {
          const daysAgo = Math.floor((now - expiresAt) / (1000 * 60 * 60 * 24));
          notifs.push({
            id: `vault-exp-${bonusTxn._id}`,
            type: "wallet",
            title: "Credits Expired",
            desc: `Your credits expired ${daysAgo > 0 ? `${daysAgo}d ago` : "today"}. Recharge to continue!`,
            text: `Your credits expired ${daysAgo > 0 ? `${daysAgo}d ago` : "today"}. Recharge to continue!`,
            time: formatTimeAgo(expiresAt),
            rawDate: expiresAt,
            targetTab: "wallet",
            targetUrl: "/dashboard/users/wallet",
          });
        } else {
          notifs.push({
            id: `vault-exp-${bonusTxn._id}`,
            type: "wallet",
            title: `Your Credits Expire In ${daysLeft} ${daysLeft === 1 ? "Day" : "Days"}!`,
            desc: `Your bonus credits expire in ${daysLeft} days. Recharge or use them on pathway milestones.`,
            text: `Your credits expire in ${daysLeft} ${daysLeft === 1 ? "day" : "days"}!`,
            time: formatTimeAgo(bonusTxn.timestamp || bonusTxn.createdAt),
            rawDate: new Date(),
            targetTab: "wallet",
            targetUrl: "/dashboard/users/wallet",
          });
        }
      }
    }

    // 2. Vault Transactions (recent deposits & debits)
    vaultTxns.slice(0, 5).forEach((t) => {
      const isCredit = t.type === "credit";
      const desc = t.metadata?.description || (isCredit ? `+${t.amount} Credits Added to your wallet` : `${t.amount} Credits Used for pathway service`);
      notifs.push({
        id: `vault-txn-${t._id}`,
        type: "wallet",
        title: isCredit ? "Credits Added" : "Credits Used",
        desc,
        text: desc,
        time: formatTimeAgo(t.timestamp || t.createdAt),
        rawDate: t.timestamp || t.createdAt || new Date(),
        targetTab: "wallet",
        targetUrl: "/dashboard/users/wallet",
      });
    });

    // 3. User Paths & Completed/Unlocked Steps
    for (const up of userPaths) {
      let pathDoc = null;
      try {
        pathDoc = await Path.findById(up.pathId).lean();
      } catch (_) {}
      const pName = pathDoc?.nameOfPath || pathDoc?.name || "Learning Pathway";

      notifs.push({
        id: `path-enrolled-${up._id}`,
        type: "path",
        title: "Selected Path: " + pName,
        desc: `Enrolled in "${pName}" pathway`,
        text: `Enrolled in "${pName}"`,
        time: formatTimeAgo(up.createdAt),
        rawDate: up.createdAt || new Date(),
        targetTab: "mypath",
        targetUrl: "/dashboard/users/my-journey",
      });

      if (up.completedSteps?.length) {
        try {
          const stepDocs = await Step.find({ _id: { $in: up.completedSteps } }).lean();
          stepDocs.forEach((st, idx) => {
            const sName = st.macro_name || st.name || `Step ${st.step_order || idx + 1}`;
            notifs.push({
              id: `step-done-${st._id}`,
              type: "path",
              title: "Step Completed",
              desc: `Completed milestone: ${sName}`,
              text: `Completed: ${sName}`,
              time: formatTimeAgo(up.updatedAt || up.createdAt),
              rawDate: up.updatedAt || up.createdAt || new Date(),
              targetTab: "mypath",
              targetUrl: "/dashboard/users/my-journey",
            });
          });
        } catch (_) {}
      }

      if (up.currentStep && mongoose.Types.ObjectId.isValid(up.currentStep)) {
        try {
          const curStep = await Step.findById(up.currentStep).lean();
          if (curStep) {
            const sName = curStep.macro_name || curStep.name || "Next Step";
            notifs.push({
              id: `step-unlocked-${curStep._id}`,
              type: "path",
              title: "Next Step Unlocked",
              desc: `Unlocked milestone: ${sName}`,
              text: `Unlocked: ${sName}`,
              time: formatTimeAgo(up.updatedAt || up.createdAt),
              rawDate: up.updatedAt || up.createdAt || new Date(),
              targetTab: "current-step",
              targetUrl: "/dashboard/users/current-step",
            });
          }
        } catch (_) {}
      }
    }

    // 4. Payments (Subscriptions & Marketplace purchases)
    payments.forEach((p) => {
      const isPaid = p.status?.toLowerCase() === "paid";
      const isPlan = p.productId === "naavi-platform" || (p.productName || "").toLowerCase().includes("plan");
      const cleanName = (p.productName || "Product")
        .replace(/^Marketplace \(Free\) —\s*/i, "")
        .replace(/^Marketplace —\s*/i, "");

      notifs.push({
        id: `pay-${p._id}`,
        type: isPlan ? "subscription" : "purchase",
        title: isPlan
          ? (isPaid ? "Subscription Active" : "Subscription Pending")
          : (isPaid ? "Purchase Confirmed" : "Order Pending"),
        desc: isPlan
          ? (isPaid ? `Platform subscription active: ${cleanName}` : `Subscription order placed: ${cleanName}`)
          : (isPaid ? `Purchase confirmed: ${cleanName}` : `Order pending: ${cleanName}`),
        text: isPlan ? `Subscription: ${cleanName}` : `Purchase: ${cleanName}`,
        time: formatTimeAgo(p.createdAt),
        rawDate: p.createdAt || new Date(),
        targetTab: isPlan ? "subscriptions" : "purchases",
        targetUrl: isPlan ? "/dashboard/users/transactions" : "/dashboard/users/purchases",
      });
    });

    // 5. Purchases (from Marketplace purchases collection)
    purchases.forEach((pur) => {
      const pName = pur.productName || "Service";
      notifs.push({
        id: `pur-${pur._id}`,
        type: "purchase",
        title: "Marketplace Order",
        desc: `Marketplace Order: ${pName} confirmed`,
        text: `Marketplace Order: ${pName} confirmed`,
        time: formatTimeAgo(pur.date || pur.createdAt),
        rawDate: pur.date || pur.createdAt || new Date(),
        targetTab: "purchases",
        targetUrl: "/dashboard/users/purchases",
      });
    });

    // 6. Marketplace Assistance
    assistanceReqs.forEach((ast) => {
      const status = ast.status;
      let title = "Marketplace Assistance";
      let text = `Marketplace assistance requested for "${ast.stepName || "Step"}"`;
      if (status === "resolved") {
        title = "Recommendations Ready";
        text = `New recommendations ready for "${ast.stepName || "Step"}"`;
      } else if (status === "reviewing") {
        title = "Advisor Reviewing";
        text = `Advisor is reviewing recommendations for "${ast.stepName || "Step"}"`;
      }
      notifs.push({
        id: `ast-${ast._id || ast.ticketId}`,
        type: "approval",
        title,
        desc: text,
        text,
        time: formatTimeAgo(ast.updatedAt || ast.createdAt),
        rawDate: ast.updatedAt || ast.createdAt || new Date(),
        targetTab: "purchases",
        targetUrl: "/dashboard/users/purchases",
      });
    });

    // 7. Live User Activity Events
    if (userActivity?.events?.length) {
      userActivity.events.slice(-10).forEach((ev, idx) => {
        if (ev.title || ev.desc) {
          const isLogin = ev.type === "login" || (ev.title && ev.title.toLowerCase().includes("login"));
          const isPath = ev.type === "path" || (ev.title && ev.title.toLowerCase().includes("path"));
          const isStep = ev.type === "step" || (ev.title && ev.title.toLowerCase().includes("step"));
          const isMarket = ev.type === "market" || ev.type === "purchase" || (ev.title && ev.title.toLowerCase().includes("market"));

          notifs.push({
            id: `act-${ev._id || idx}`,
            type: isLogin ? "system" : isPath || isStep ? "path" : isMarket ? "purchase" : "system",
            title: isLogin ? "Logged In" : (ev.title || "Platform Activity"),
            desc: ev.desc || `${email}: Session Started`,
            text: ev.title || ev.desc,
            time: formatTimeAgo(ev.createdAt),
            rawDate: ev.createdAt || new Date(),
            targetTab: isStep ? "current-step" : isPath ? "mypath" : isMarket ? "purchases" : "home",
            targetUrl: isStep ? "/dashboard/users/current-step" : isPath ? "/dashboard/users/my-journey" : isMarket ? "/dashboard/users/purchases" : "/dashboard/users/home",
          });
        }
      });
    }

    // 8. Deduplicate by unique title + desc and sort by rawDate descending
    const seenKeys = new Set();
    const uniqueNotifs = [];

    // Sort newest first
    notifs.sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));

    for (const n of notifs) {
      const key = `${n.title || ''}-${n.desc || n.text || ''}`.toLowerCase().trim();
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        uniqueNotifs.push(n);
      }
    }

    // Fallback if brand new user has no activity yet
    if (uniqueNotifs.length === 0) {
      uniqueNotifs.push(
        {
          id: "welcome-1",
          type: "system",
          title: "Welcome to Naavi",
          desc: "Welcome to Naavi! Explore pathways to begin your journey.",
          text: "Welcome to Naavi! Explore pathways to begin your journey.",
          time: "Just now",
          rawDate: new Date(),
          targetTab: "paths",
          targetUrl: "/dashboard/users/paths",
        },
        {
          id: "welcome-2",
          type: "wallet",
          title: "Welcome Bonus Credits",
          desc: "Welcome Bonus credits available in your wallet! Use them to unlock learning milestones.",
          text: "Welcome Bonus credits available in your wallet!",
          time: "Just now",
          rawDate: new Date(Date.now() - 60000),
          targetTab: "wallet",
          targetUrl: "/dashboard/users/wallet",
        },
        {
          id: "welcome-3",
          type: "path",
          title: "Setup Your Learning Path",
          desc: "Complete your profile to unlock customized learning steps.",
          text: "Complete your profile to unlock customized learning steps.",
          time: "Just now",
          rawDate: new Date(Date.now() - 120000),
          targetTab: "mypath",
          targetUrl: "/dashboard/users/my-journey",
        }
      );
    }

    const limited = uniqueNotifs.slice(0, 40);

    return res.json({
      status: true,
      notifications: limited,
      total: limited.length,
    });
  } catch (err) {
    console.error("getUserNotifications error:", err);
    return res.status(500).json({
      status: false,
      message: "Error fetching user notifications",
      error: err.message,
    });
  }
};

module.exports = { getUserNotifications };
