/**
 * utils/generateInvoicePDF.js
 *
 * Generates a Naavi-branded invoice PDF buffer using pdfkit.
 * Layout mirrors the sendInvoiceEmail.js HTML template exactly.
 *
 * Install once:  npm install pdfkit
 * Returns a Buffer — usable as email attachment or HTTP response.
 */

const path = require("path");
const PDFDocument = require("pdfkit");

const LOGO_PATH = path.join(__dirname, "naavi_final_logo2.png");

// ── Brand colours (same as email template) ────────────────────
const C = {
  dark:        "#1A1A2E",
  tealDark:    "#0F6E56",
  tealMid:     "#1D9E75",
  tealLight:   "#E1F5EE",
  tealBorder:  "#9FE1CB",
  purple:      "#534AB7",
  purpleLight: "#EEEDFE",
  purpleBorder:"#AFA9EC",
  gray:        "#6B7280",
  grayLight:   "#F9FAFB",
  grayMid:     "#4B5563",
  border:      "#E5E7EB",
  white:       "#FFFFFF",
  amber:       "#B7860F",
  platinum:    "#0F6E56",
  successText: "#085041",
};

// ── Helpers ───────────────────────────────────────────────────
function formatDate(d) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric", month: "long", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  }).format(new Date(d));
}

function formatAmount(n) {
  return "Rs. " + Number(n).toLocaleString("en-IN");
}

function invoiceNo(payment) {
  const d = new Date(payment.createdAt).toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = (payment.razorpayPaymentId || "XXXX").slice(-4).toUpperCase();
  return `INV-${d}-${suffix}`;
}

function creditsForPlan(planTier) {
  const map = { silver: 500, gold: 750, platinum: 1000 };
  return map[(planTier || "").toLowerCase()] || 500;
}

function planColor(planTier) {
  const map = { silver: "#534AB7", gold: "#B7860F", platinum: "#0F6E56" };
  return map[(planTier || "").toLowerCase()] || "#B7860F";
}

// Draw a rounded rectangle (pdfkit doesn't support fill+stroke in one call cleanly)
function roundedBox(doc, x, y, w, h, r, fillColor, strokeColor) {
  doc.roundedRect(x, y, w, h, r);
  if (fillColor && strokeColor) {
    doc.fillAndStroke(fillColor, strokeColor);
  } else if (fillColor) {
    doc.fill(fillColor);
  } else if (strokeColor) {
    doc.stroke(strokeColor);
  }
}

// ── Main export ───────────────────────────────────────────────
function generateInvoicePDF(payment) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 0 });
    const chunks = [];
    doc.on("data", c => chunks.push(c));
    doc.on("end",  () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const W  = doc.page.width;   // 595
    const H  = doc.page.height;  // 842
    const M  = 36;               // left/right margin (matches email 36px padding)
    const CW = W - M * 2;        // content width = 523

    const baseAmt  = Math.round(payment.amount / 1.18);
    const gstAmt   = payment.amount - baseAmt;
    const invNo    = invoiceNo(payment);
    const credits  = creditsForPlan(payment.planTier);
    const badgeClr = planColor(payment.planTier);
    const planTier = (payment.planTier || "Gold").toUpperCase();

    // ════════════════════════════════════════════════════
    //  1. WHITE HEADER — logo left, invoice right
    // ════════════════════════════════════════════════════
    const headerH = 74;
    doc.rect(0, 0, W, headerH).fill(C.white);
    // bottom border line
    doc.moveTo(0, headerH).lineTo(W, headerH).lineWidth(0.5).strokeColor(C.border).stroke();

    // Logo
    try {
      doc.image(LOGO_PATH, M, 16, { height: 42, fit: [160, 42] });
    } catch {
      doc.fillColor(C.dark).font("Helvetica-Bold").fontSize(20).text("naavi", M, 26);
    }

    // Invoice label (top-right)
    doc.fillColor("#9CA3AF").font("Helvetica-Bold").fontSize(9)
      .text("INVOICE", 0, 20, { align: "right", width: W - M, characterSpacing: 1.2 });
    doc.fillColor(C.dark).font("Helvetica-Bold").fontSize(13)
      .text(invNo, 0, 33, { align: "right", width: W - M });

    // ── Teal accent strip ──────────────────────────────
    doc.rect(0, headerH, W, 3).fill(C.tealMid);

    // ════════════════════════════════════════════════════
    //  2. SUCCESS BANNER
    // ════════════════════════════════════════════════════
    let y = headerH + 3;
    const bannerH = 62;
    doc.rect(0, y, W, bannerH).fill(C.tealLight);

    doc.fillColor(C.successText).font("Helvetica-Bold").fontSize(15)
      .text("Payment Successful!", 0, y + 14, { align: "center", width: W });

    const subLine = `Your ${payment.planTier || "Gold"} plan is now active.`;
    doc.fillColor(C.tealDark).font("Helvetica").fontSize(10)
      .text(subLine, 0, y + 35, { align: "center", width: W });

    // ════════════════════════════════════════════════════
    //  3. META ROW  (Invoice | Date | Payment ID | Status)
    // ════════════════════════════════════════════════════
    y += bannerH + 14;
    const metaBoxH = 52;
    roundedBox(doc, M, y, CW, metaBoxH, 6, C.grayLight, C.border);

    const metaFields = [
      ["Invoice",    invNo],
      ["Date",       formatDate(payment.createdAt)],
      ["Payment ID", payment.razorpayPaymentId || "—"],
      ["Status",     "PAID"],
    ];
    const colW = CW / 4;

    metaFields.forEach(([label, val], i) => {
      const x = M + i * colW;
      // vertical divider (except first)
      if (i > 0) {
        doc.moveTo(x, y + 8).lineTo(x, y + metaBoxH - 8)
          .lineWidth(0.5).strokeColor(C.border).stroke();
      }
      doc.fillColor("#9CA3AF").font("Helvetica-Bold").fontSize(7.5)
        .text(label.toUpperCase(), x + 10, y + 10, { width: colW - 14, characterSpacing: 0.5 });

      if (label === "Status") {
        // Pill badge
        roundedBox(doc, x + 10, y + 26, 36, 14, 7, C.tealLight, null);
        doc.fillColor(C.tealDark).font("Helvetica-Bold").fontSize(7.5)
          .text(val, x + 10, y + 30, { width: 36, align: "center" });
      } else {
        const fontSize = label === "Payment ID" ? 8 : 9.5;
        doc.fillColor(C.dark).font("Helvetica-Bold").fontSize(fontSize)
          .text(val, x + 10, y + 27, { width: colW - 18 });
      }
    });

    // ════════════════════════════════════════════════════
    //  4. PLAN CARD
    // ════════════════════════════════════════════════════
    y += metaBoxH + 14;
    const cardH = 86;
    roundedBox(doc, M, y, CW, cardH, 8, C.purpleLight, C.purpleBorder);

    // Tier badge pill
    doc.roundedRect(M + 14, y + 14, 48, 16, 8).fill(badgeClr);
    doc.fillColor(C.white).font("Helvetica-Bold").fontSize(8)
      .text(planTier, M + 14, y + 19, { width: 48, align: "center" });

    // Plan name
    doc.fillColor(C.dark).font("Helvetica-Bold").fontSize(14)
      .text(payment.productName || `Naavi ${payment.planTier || "Gold"} Plan`, M + 14, y + 36);

    // Credits + billing
    doc.fillColor(C.gray).font("Helvetica").fontSize(10)
      .text(`${credits} Credits  ·  ${payment.billingMethod || "Monthly"} billing`, M + 14, y + 55);

    // Amount (right side)
    doc.fillColor(C.tealDark).font("Helvetica-Bold").fontSize(22)
      .text(formatAmount(payment.amount), 0, y + 30, { align: "right", width: W - M - 16 });
    doc.fillColor(C.gray).font("Helvetica").fontSize(9)
      .text("incl. GST", 0, y + 56, { align: "right", width: W - M - 16 });

    // ════════════════════════════════════════════════════
    //  5. LINE ITEMS TABLE
    // ════════════════════════════════════════════════════
    y += cardH + 14;

    // Table header — use plain roundedRect with single radius, draw over top of rows
    const thH = 30;
    const rowH = 38;
    const gstRowH = 34;
    const totRowH = 38;
    const tableStartY = y; // save for border + back-calculation

    // Draw full table background first (rounded corners), then paint rows on top
    doc.roundedRect(M, tableStartY, CW, thH + rowH + gstRowH + totRowH, 6).fill(C.white);

    // Header band (top-rounded via clip workaround: just rect the bottom half)
    doc.rect(M, tableStartY, CW, thH).fill(C.tealDark);

    doc.fillColor(C.white).font("Helvetica-Bold").fontSize(8.5)
      .text("DESCRIPTION", M + 10, tableStartY + 10, { width: CW * 0.65, characterSpacing: 0.5 });
    doc.fillColor(C.white).font("Helvetica-Bold").fontSize(8.5)
      .text("AMOUNT", M + CW * 0.65, tableStartY + 10, { width: CW * 0.35 - 10, align: "right", characterSpacing: 0.5 });

    // Row 1 — plan base
    y += thH;
    doc.rect(M, y, CW, rowH).fill(C.white);
    doc.fillColor(C.dark).font("Helvetica").fontSize(11)
      .text(`${payment.planTier || "Gold"} Plan (${payment.billingMethod || "Monthly"})`, M + 10, y + 8);
    doc.fillColor("#9CA3AF").font("Helvetica").fontSize(9)
      .text("HSN 998431", M + 10, y + 23);
    doc.fillColor(C.dark).font("Helvetica-Bold").fontSize(11)
      .text(formatAmount(baseAmt), M + CW * 0.65, y + 13, { width: CW * 0.35 - 10, align: "right" });

    doc.moveTo(M, y + rowH).lineTo(M + CW, y + rowH).lineWidth(0.4).strokeColor(C.border).stroke();

    // Row 2 — GST
    y += rowH;
    doc.rect(M, y, CW, gstRowH).fill(C.grayLight);
    doc.fillColor(C.gray).font("Helvetica").fontSize(11)
      .text("GST @ 18%", M + 10, y + 11);
    doc.fillColor(C.gray).font("Helvetica").fontSize(11)
      .text(formatAmount(gstAmt), M + CW * 0.65, y + 11, { width: CW * 0.35 - 10, align: "right" });

    doc.moveTo(M, y + gstRowH).lineTo(M + CW, y + gstRowH).lineWidth(0.4).strokeColor(C.border).stroke();

    // Row 3 — Total
    y += gstRowH;
    doc.rect(M, y, CW, totRowH).fill(C.white);
    // thick top border
    doc.moveTo(M, y).lineTo(M + CW, y).lineWidth(1.5).strokeColor(C.border).stroke();

    doc.fillColor(C.dark).font("Helvetica-Bold").fontSize(13)
      .text("Total Charged", M + 10, y + 11);
    doc.fillColor(C.tealDark).font("Helvetica-Bold").fontSize(15)
      .text(formatAmount(payment.amount), M + CW * 0.55, y + 10, { width: CW * 0.45 - 10, align: "right" });

    // Full border around entire table (use saved tableStartY — no NaN risk)
    doc.roundedRect(M, tableStartY, CW, thH + rowH + gstRowH + totRowH, 6)
      .lineWidth(0.5).strokeColor(C.border).stroke();

    // ════════════════════════════════════════════════════
    //  6. CREDITS BADGE
    // ════════════════════════════════════════════════════
    y += totRowH + 14;
    const credBadgeH = 34;
    roundedBox(doc, M, y, CW, credBadgeH, 7, C.tealLight, C.tealBorder);
    doc.fillColor(C.tealDark).font("Helvetica").fontSize(10.5)
      .text(`${credits} Credits have been added to your Naavi wallet`, M + 14, y + 11, { width: CW - 28 });

    // ════════════════════════════════════════════════════
    //  7. CTA BUTTON (text-based)
    // ════════════════════════════════════════════════════
    y += credBadgeH + 18;
    const btnW = 170, btnH = 34;
    const btnX = M + (CW - btnW) / 2;
    doc.roundedRect(btnX, y, btnW, btnH, 8).fill(C.dark);
    doc.fillColor(C.white).font("Helvetica-Bold").fontSize(11)
      .text("Start Learning  \u2192", btnX, y + 10, { width: btnW, align: "center" });

    // ════════════════════════════════════════════════════
    //  8. FOOTER
    // ════════════════════════════════════════════════════
    const footerH = 62;
    const footerY = H - footerH;

    // Light top border
    doc.moveTo(0, footerY).lineTo(W, footerY).lineWidth(0.5).strokeColor(C.border).stroke();
    doc.rect(0, footerY, W, footerH).fill(C.white);

    // "Questions?" row
    doc.fillColor(C.grayMid).font("Helvetica").fontSize(10)
      .text("Questions?  ", M, footerY + 12, { continued: true })
    doc.fillColor(C.tealDark).font("Helvetica-Bold").fontSize(10)
      .text("support@naavi.ai", { continued: false });

    doc.fillColor(C.gray).font("Helvetica").fontSize(9)
      .text("Secured by Razorpay", 0, footerY + 12, { align: "right", width: W - M });

    // Sub-line
    doc.fillColor("#9CA3AF").font("Helvetica").fontSize(8.5)
      .text(
        "This is a computer-generated invoice and does not require a signature.",
        M, footerY + 32, { width: CW }
      );

    doc.end();
  });
}

module.exports = { generateInvoicePDF };