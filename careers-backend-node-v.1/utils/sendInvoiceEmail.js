const nodemailer = require("nodemailer");
const { generateInvoicePDF } = require("./generateInvoicePDF");
const fs = require("fs");
const path = require("path");

// ── Read logo as base64 ───────────────────────────────────────
const LOGO_PATH = path.join(__dirname, "naavi_final_logo2.png");
let LOGO_BASE64 = "";
try {
  const logoBuffer = fs.readFileSync(LOGO_PATH);
  LOGO_BASE64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;
  console.log("✅ Naavi logo loaded successfully");
} catch (err) {
  console.warn("⚠ Logo not found:", err.message);
}

// ── Transporter ───────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_SERVICE_USER,
    pass: process.env.EMAIL_SERVICE_PASS,
  },
});

// ── Helpers ───────────────────────────────────────────────────
function formatAmount(n) {
  return "₹" + Number(n).toLocaleString("en-IN");
}

function formatDate(d) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric", month: "long", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  }).format(new Date(d));
}

function invoiceNo(payment) {
  const d = new Date(payment.createdAt)
    .toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = (payment.razorpayPaymentId || "XXXX")
    .slice(-4).toUpperCase();
  return `INV-${d}-${suffix}`;
}

function creditsForPlan(planTier) {
  const map = { silver: 500, gold: 100, platinum: 1000 };
  return map[(planTier || "").toLowerCase()] || 100;
}

function planColor(planTier) {
  const map = {
    silver: "#534AB7",
    gold: "#B7860F",
    platinum: "#0F6E56",
  };
  return map[(planTier || "").toLowerCase()] || "#B7860F";
}

// ── HTML Template ─────────────────────────────────────────────
function buildHtml(payment, invNo) {
  const credits = creditsForPlan(payment.planTier);
  const badgeColor = planColor(payment.planTier);
  const baseAmt = Math.round(payment.amount / 1.18);
  const gstAmt = payment.amount - baseAmt;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Naavi Invoice ${invNo}</title>
</head>
<body style="margin:0;padding:0;background:#f0f3fa;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f3fa;padding:32px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0"
  style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

  <!-- HEADER -->
  <tr>
    <td style="background:#1A1A2E;padding:28px 36px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
<td>
  ${LOGO_BASE64
      ? `<img src="${LOGO_BASE64}" alt="Naavi"
            height="44"
            style="display:block;max-width:180px;object-fit:contain;"/>`
      : `<div style="font-size:24px;font-weight:800;color:#fff;">naavi</div>
       <div style="font-size:10px;color:#9CA3AF;margin-top:2px;">AI Powered Path Engine</div>`
    }
</td>
          <td align="right" style="vertical-align:top;">
            <div style="font-size:11px;font-weight:700;color:#9CA3AF;letter-spacing:0.08em;">INVOICE</div>
            <div style="font-size:13px;font-weight:700;color:#fff;margin-top:2px;">${invNo}</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- TEAL ACCENT -->
  <tr><td style="background:#1D9E75;height:3px;font-size:0;"></td></tr>

  <!-- SUCCESS BANNER -->
  <tr>
    <td style="background:#E1F5EE;padding:24px 36px;text-align:center;">
      <div style="font-size:20px;font-weight:700;color:#085041;">✅ Payment Successful!</div>
      <div style="font-size:13px;color:#0F6E56;margin-top:4px;">
        Your <strong>${payment.planTier || "Gold"}</strong> plan is now active.
      </div>
    </td>
  </tr>

  <!-- META ROW -->
  <tr>
    <td style="padding:0 36px;">
      <table width="100%" cellpadding="0" cellspacing="0"
        style="background:#F9FAFB;border-radius:10px;margin:20px 0 0;border:1px solid #E5E7EB;">
        <tr>
          <td style="padding:14px 18px;border-right:1px solid #E5E7EB;">
            <div style="font-size:9px;font-weight:700;color:#9CA3AF;text-transform:uppercase;">Invoice</div>
            <div style="font-size:11px;font-weight:700;color:#1A1A2E;margin-top:3px;">${invNo}</div>
          </td>
          <td style="padding:14px 18px;border-right:1px solid #E5E7EB;">
            <div style="font-size:9px;font-weight:700;color:#9CA3AF;text-transform:uppercase;">Date</div>
            <div style="font-size:11px;font-weight:700;color:#1A1A2E;margin-top:3px;">${formatDate(payment.createdAt)}</div>
          </td>
          <td style="padding:14px 18px;border-right:1px solid #E5E7EB;">
            <div style="font-size:9px;font-weight:700;color:#9CA3AF;text-transform:uppercase;">Payment ID</div>
            <div style="font-size:10px;font-weight:700;color:#1A1A2E;margin-top:3px;font-family:monospace;">${payment.razorpayPaymentId || "—"}</div>
          </td>
          <td style="padding:14px 18px;">
            <div style="font-size:9px;font-weight:700;color:#9CA3AF;text-transform:uppercase;">Status</div>
            <div style="margin-top:4px;">
              <span style="background:#E1F5EE;color:#0F6E56;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;">PAID</span>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- PLAN CARD -->
  <tr>
    <td style="padding:20px 36px 0;">
      <table width="100%" cellpadding="0" cellspacing="0"
        style="background:#EEEDFE;border-radius:12px;border:1px solid #AFA9EC;">
        <tr>
          <td style="padding:18px 20px;">
            <span style="background:${badgeColor};color:#fff;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;">
              ${(payment.planTier || "GOLD").toUpperCase()}
            </span>
            <div style="font-size:16px;font-weight:700;color:#1A1A2E;margin-top:8px;">
              ${payment.productName || "Naavi Gold Plan"}
            </div>
            <div style="font-size:11px;color:#6B7280;margin-top:4px;">
              ${credits} Credits · ${payment.billingMethod || "Monthly"} billing
            </div>
          </td>
          <td align="right" style="padding:18px 20px;white-space:nowrap;">
            <div style="font-size:26px;font-weight:800;color:#0F6E56;">${formatAmount(payment.amount)}</div>
            <div style="font-size:10px;color:#6B7280;margin-top:2px;">incl. GST</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- LINE ITEMS -->
  <tr>
    <td style="padding:20px 36px 0;">
      <table width="100%" cellpadding="0" cellspacing="0"
        style="border-radius:10px;overflow:hidden;border:1px solid #E5E7EB;">
        <tr style="background:#0F6E56;">
          <td style="padding:10px 14px;font-size:9px;font-weight:700;color:#fff;text-transform:uppercase;">Description</td>
          <td style="padding:10px 14px;font-size:9px;font-weight:700;color:#fff;text-transform:uppercase;" align="right">Amount</td>
        </tr>
        <tr style="background:#ffffff;">
          <td style="padding:12px 14px;font-size:12px;color:#1A1A2E;">
            ${payment.planTier || "Gold"} Plan (${payment.billingMethod || "Monthly"})
            <div style="font-size:10px;color:#9CA3AF;margin-top:2px;">HSN 998431</div>
          </td>
          <td style="padding:12px 14px;font-size:12px;font-weight:600;color:#1A1A2E;font-family:monospace;" align="right">
            ${formatAmount(baseAmt)}
          </td>
        </tr>
        <tr style="background:#F9FAFB;">
          <td style="padding:12px 14px;font-size:12px;color:#6B7280;">GST @ 18%</td>
          <td style="padding:12px 14px;font-size:12px;color:#6B7280;font-family:monospace;" align="right">
            ${formatAmount(gstAmt)}
          </td>
        </tr>
        <tr style="background:#ffffff;border-top:1.5px solid #E5E7EB;">
          <td style="padding:14px 14px;font-size:13px;font-weight:700;color:#1A1A2E;">Total Charged</td>
          <td style="padding:14px 14px;font-size:15px;font-weight:800;color:#0F6E56;font-family:monospace;" align="right">
            ${formatAmount(payment.amount)}
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- CREDITS BADGE -->
  <tr>
    <td style="padding:16px 36px 0;">
      <table width="100%" cellpadding="0" cellspacing="0"
        style="background:#E1F5EE;border-radius:10px;border:1px solid #9FE1CB;">
        <tr>
          <td style="padding:12px 16px;font-size:12px;color:#0F6E56;font-weight:500;">
            🎯 <strong>${credits} Credits</strong> have been added to your Naavi wallet
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- CTA -->
  <tr>
    <td style="padding:24px 36px;" align="center">
      <a href="https://naaviverse-frontend-sepia.vercel.app/dashboard/users/current-step"
        style="display:inline-block;background:#1A1A2E;color:#fff;font-size:13px;font-weight:700;padding:13px 32px;border-radius:10px;text-decoration:none;">
        Start Learning →
      </a>
    </td>
  </tr>

  <!-- FOOTER -->
  <tr>
    <td style="background:#1A1A2E;padding:20px 36px;border-radius:0 0 16px 16px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:11px;color:#9CA3AF;">
            Questions? <a href="mailto:support@naavi.ai" style="color:#6EE0E0;text-decoration:none;">support@naavi.ai</a>
          </td>
          <td align="right" style="font-size:10px;color:#6B7280;">Secured by Razorpay</td>
        </tr>
        <tr>
          <td colspan="2" style="padding-top:8px;font-size:9px;color:#4B5563;">
            This is a computer-generated invoice and does not require a signature.
          </td>
        </tr>
      </table>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

// ── Main export ───────────────────────────────────────────────
async function sendInvoiceEmail(payment) {
  const invNo = invoiceNo(payment);
  const pdfBuffer = await generateInvoicePDF(payment);
  const html = buildHtml(payment, invNo);

  const mailOptions = {
    from: `"Naavi" <${process.env.EMAIL_SERVICE_USER}>`,
    to: payment.userEmail,
    subject: `Your Naavi Invoice ${invNo} — Payment Confirmed`,
    html,
    attachments: [
      {
        filename: `Naavi_Invoice_${invNo}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  };

  await transporter.sendMail(mailOptions);
  console.log(`✅ Invoice email sent → ${payment.userEmail}  [${invNo}]`);
}

module.exports = { sendInvoiceEmail };