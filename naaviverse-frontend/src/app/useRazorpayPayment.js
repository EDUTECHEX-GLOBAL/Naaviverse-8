/**
 * ═══════════════════════════════════════════════════════════════
 *  NAAVI — useRazorpayPayment.js
 *  src/app/useRazorpayPayment.js
 * ═══════════════════════════════════════════════════════════════
 */

import { useCallback } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

// ── Gold/Silver/Platinum price table ─────────────────────────────
const PRICES = {
  gold:     { monthly: 830,   annual: 9960  },
  silver:   { monthly: 4150,  annual: 49800 },
  platinum: { monthly: 8300,  annual: 99600 },
};

const PLAN_LABELS = {
  gold: "Gold", silver: "Silver", platinum: "Platinum",
};

export const useRazorpayPayment = ({ userEmail, userDetails, onSuccess, onError }) => {

  const initiatePayment = useCallback(async ({ tier, billing }) => {

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      onError("Could not load Razorpay. Please check your connection.");
      return;
    }

    const amount = PRICES[tier]?.[billing];
    if (!amount) {
      onError(`Invalid plan selected (tier: ${tier}, billing: ${billing})`);
      return;
    }

    const planLabel = PLAN_LABELS[tier] || tier;

    let order;
    try {
      const res = await axios.post(`${BASE_URL}/api/payment/create-order`, {
        userEmail,
        productId:     "naavi-platform",
        productName:   `Naavi ${planLabel} Plan`,
        billingMethod: billing,
        amount,
        currency:      "INR",
        profileId:     userDetails?.id || userDetails?.user?.id || null,
        tier,
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

    const options = {
      key:         process.env.REACT_APP_RAZORPAY_KEY_ID,
      amount:      order.amount,
      currency:    order.currency,
      name:        "Naavi",
      description: `${planLabel} Plan — ${billing === "annual" ? "Annual" : "Monthly"}`,
      order_id:    order.id,

      prefill: {
        email:   userEmail,
        name:    userDetails?.user?.name  || userDetails?.name  || "",
        contact: userDetails?.user?.phone || userDetails?.phone || "",
      },

      theme: { color: "#5c62ec" },

      handler: async (response) => {
        try {
          const verifyRes = await axios.post(`${BASE_URL}/api/payment/verify`, {
            razorpay_order_id:   response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature:  response.razorpay_signature,
          });

          if (verifyRes.data?.success) {
            // ── After payment, credit the wallet with plan credits ──
            const PLAN_CREDITS = { gold: 100, silver: 500, platinum: 1000 };
            const credits = PLAN_CREDITS[tier] || 100;
            try {
              await axios.post(`${BASE_URL}/api/wallet/credit`, {
                email:       userEmail,
                amount:      credits,
                description: `${planLabel} Plan credits`,
                source:      "subscription",
              });
            } catch (e) {
              console.warn("⚠ Wallet credit failed (non-critical):", e.message);
            }
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
        ondismiss: () => onError(""),
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (response) => {
      onError(`Payment failed: ${response.error?.description || "Unknown error"}. Please try again.`);
    });
    rzp.open();

  }, [userEmail, userDetails, onSuccess, onError]);

  return { initiatePayment };
};