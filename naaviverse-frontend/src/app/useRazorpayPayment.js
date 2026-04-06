/**
 * ═══════════════════════════════════════════════════════════════
 *  NAAVI — useRazorpayPayment.js
 *
 *  SAVE THIS FILE AT:
 *  src/app/useRazorpayPayment.js
 *
 *  Calls your existing backend:
 *    POST /api/payment/create-order
 *    POST /api/payment/verify
 * ═══════════════════════════════════════════════════════════════
 */

import { useCallback } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

/* ── Inject Razorpay SDK script once ────────────────────────── */
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export const useRazorpayPayment = ({ userEmail, userDetails, onSuccess, onError }) => {

  const initiatePayment = useCallback(async ({ tier, billing }) => {

    // ── 1. Load SDK ──────────────────────────────────────────
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      onError("Could not load Razorpay. Please check your connection.");
      return;
    }

    // ── 2. POST /api/payment/create-order ────────────────────
    //    Field names match your paymentRoutes.js exactly:
    //    userEmail, productId, productName, billingMethod, amount, profileId, currency

    // Tier-based price table (must match your backend PRICES)
    const PRICES = {
      micro: { monthly: 499,  annual: 4188 },
      nano:  { monthly: 999,  annual: 8388 },
    };
    const amount = PRICES[tier]?.[billing];
    if (!amount) {
      onError(`Invalid plan selected (tier: ${tier}, billing: ${billing})`);
      return;
    }

    let order;
    try {
      const res = await axios.post(`${BASE_URL}/api/payment/create-order`, {
        userEmail,                                              // ✅ matches route
        productId:     "naavi-platform",                       // ✅ matches route
        productName:   `Naavi ${tier === "nano" ? "Nano" : "Micro"} Plan`, // ✅
        billingMethod: billing,                                // ✅ matches route
        amount,                                                // ✅ matches route
        currency:      "INR",                                  // ✅ matches route
        profileId:     userDetails?.id || userDetails?.user?.id || null, // ✅
        tier,                                                  // extra info
      });

      if (!res.data?.success) throw new Error(res.data?.error || "Order creation failed");
      order = res.data.order;

    } catch (err) {
      onError(
        err?.response?.data?.error ||
        err.message ||
        "Failed to create payment order. Please try again."
      );
      return;
    }

    // ── 3. Open Razorpay modal ───────────────────────────────
    const options = {
      key:         process.env.REACT_APP_RAZORPAY_KEY_ID,
      amount:      order.amount,
      currency:    order.currency,
      name:        "Naavi",
      description: `${tier === "nano" ? "Nano" : "Micro"} Plan — ${billing === "annual" ? "Annual" : "Monthly"}`,
      order_id:    order.id,

      prefill: {
        email:   userEmail,
        name:    userDetails?.user?.name  || userDetails?.name  || "",
        contact: userDetails?.user?.phone || userDetails?.phone || "",
      },

      theme: { color: "#5c62ec" },

      // ── 4. On payment success → POST /api/payment/verify ──
      handler: async (response) => {
        try {
          const verifyRes = await axios.post(`${BASE_URL}/api/payment/verify`, {
            razorpay_order_id:   response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature:  response.razorpay_signature,
          });

          if (verifyRes.data?.success) {
            // ✅ Your verify route already handles Subscription upsert — no extra call needed
            onSuccess({ tier, billing });

          } else {
            onError(
              verifyRes.data?.message ||
              "Payment received but verification failed. Contact support — Payment ID: " +
              response.razorpay_payment_id
            );
          }

        } catch {
          onError(
            "Payment received but confirmation failed. " +
            "Contact support — Payment ID: " + response.razorpay_payment_id
          );
        }
      },

      modal: {
        ondismiss: () => onError(""), // user closed modal — clear errors silently
      },
    };

    const rzp = new window.Razorpay(options);

    rzp.on("payment.failed", (response) => {
      onError(
        `Payment failed: ${response.error?.description || "Unknown error"}. Please try again.`
      );
    });

    rzp.open();

  }, [userEmail, userDetails, onSuccess, onError]);

  return { initiatePayment };
};