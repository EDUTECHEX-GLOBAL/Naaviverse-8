/**
 * utils/generateInvoicePDF.js
 *
 * Generates a Naavi-branded invoice PDF buffer using pdfkit.
 * Install once:  npm install pdfkit
 *
 * Returns a Buffer — usable as email attachment or HTTP response.
 */

const PDFDocument = require("pdfkit");

// ── Brand colours ─────────────────────────────────────────────
const C = {
  dark:        "#1A1A2E",
  tealDark:    "#0F6E56",
  tealMid:     "#1D9E75",
  tealLight:   "#E1F5EE",
  purple:      "#534AB7",
  purpleLight: "#EEEDFE",
  gray:        "#6B7280",
  grayLight:   "#F3F4F6",
  border:      "#E5E7EB",
  white:       "#FFFFFF",
  amber:       "#E07A10",
};

// ── Helpers ───────────────────────────────────────────────────
function formatDate(d) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric", month: "long", year: "numeric",
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

// ── Main export ───────────────────────────────────────────────
function generateInvoicePDF(payment) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 0 });
    const chunks = [];
    doc.on("data",  c => chunks.push(c));
    doc.on("end",   () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const W = doc.page.width;   // 595
    const M = 40;               // left/right margin
    const CW = W - M * 2;      // content width

    // ════════════════════════════════════════════════════
    //  HEADER BAND
    // ════════════════════════════════════════════════════
    doc.rect(0, 0, W, 130).fill(C.dark);

    // Teal accent strip
    doc.rect(0, 128, W, 3).fill(C.tealMid);

    // Brand name
    doc.fillColor(C.white).font("Helvetica-Bold").fontSize(22)
      .text("naavi", M, 30);
    doc.fillColor("#9CA3AF").font("Helvetica").fontSize(9)
      .text("AI Powered Path Engine", M, 57);

    // INVOICE label (right)
    doc.fillColor(C.white).font("Helvetica-Bold").fontSize(28)
      .text("INVOICE", 0, 30, { align: "right", width: W - M });

    // ── Meta strip ────────────────────────────────────
    doc.rect(0, 131, W, 52).fill(C.grayLight);

    const invNo   = invoiceNo(payment);
    const metaY   = 142;
    const colW    = CW / 4;

    const metaFields = [
      ["Invoice No.",   invNo],
      ["Date",          formatDate(payment.createdAt)],
      ["Payment ID",    payment.razorpayPaymentId || "—"],
      ["Status",        "PAID"],
    ];

    metaFields.forEach(([label, val], i) => {
      const x = M + i * colW;
      doc.fillColor(C.gray).font("Helvetica").fontSize(7.5)
        .text(label.toUpperCase(), x, metaY, { width: colW - 4 });

      if (label === "Status") {
        doc.roundedRect(x, metaY + 12, 36, 14, 3).fill(C.tealLight);
        doc.fillColor(C.tealDark).font("Helvetica-Bold").fontSize(8)
          .text(val, x + 6, metaY + 16);
      } else {
        doc.fillColor(C.dark).font("Helvetica-Bold").fontSize(9.5)
          .text(val, x, metaY + 13, { width: colW - 4 });
      }
    });

    // ════════════════════════════════════════════════════
    //  BILLED TO  /  FROM
    // ════════════════════════════════════════════════════
    let y = 205;

    // Billed To
    doc.fillColor(C.tealDark).font("Helvetica-Bold").fontSize(8)
      .text("BILLED TO", M, y);
    doc.fillColor(C.dark).font("Helvetica-Bold").fontSize(12)
      .text(payment.userEmail?.split("@")[0] || "User", M, y + 14);
    doc.fillColor(C.gray).font("Helvetica").fontSize(9.5)
      .text(payment.userEmail || "", M, y + 29)
      .text("UPI  |  " + (payment.razorpayPaymentId || "—"), M, y + 43);

    // From
    const midX = W / 2 + 20;
    doc.fillColor(C.tealDark).font("Helvetica-Bold").fontSize(8)
      .text("FROM", midX, y);
    doc.fillColor(C.dark).font("Helvetica-Bold").fontSize(12)
      .text("Naavi Technologies Pvt. Ltd.", midX, y + 14);
    doc.fillColor(C.gray).font("Helvetica").fontSize(9.5)
      .text("support@naavi.ai", midX, y + 29)
      .text("GSTIN: 29XXXXXXXXXXXXXXX", midX, y + 43);

    // Divider
    y += 64;
    doc.moveTo(M, y).lineTo(W - M, y).lineWidth(0.5).strokeColor(C.border).stroke();

    // ════════════════════════════════════════════════════
    //  PLAN CARD
    // ════════════════════════════════════════════════════
    y += 14;
    const cardH = 88;
    doc.roundedRect(M, y, CW, cardH, 7)
      .fillAndStroke(C.purpleLight, "#AFA9EC");

    // Silver badge
    doc.roundedRect(M + 14, y + 12, 44, 14, 3).fill(C.purple);
    doc.fillColor(C.white).font("Helvetica-Bold").fontSize(7.5)
      .text((payment.planTier || "SILVER").toUpperCase(), M + 18, y + 16);

    doc.fillColor(C.dark).font("Helvetica-Bold").fontSize(13)
      .text(payment.productName || "Silver Monthly Plan", M + 14, y + 32);
    doc.fillColor(C.gray).font("Helvetica").fontSize(9.5)
      .text(`${creditsForPlan(payment.planTier)} Credits included  |  ${payment.billingMethod || "Monthly"} billing`, M + 14, y + 50)
      .text("Micro View — AP Courses access", M + 14, y + 64);

    // Price (right side of card)
    doc.fillColor(C.tealDark).font("Helvetica-Bold").fontSize(20)
      .text(formatAmount(payment.amount), 0, y + 32, { align: "right", width: W - M - 14 });
    doc.fillColor(C.gray).font("Helvetica").fontSize(9)
      .text("incl. GST", 0, y + 56, { align: "right", width: W - M - 14 });

    // ════════════════════════════════════════════════════
    //  LINE ITEMS TABLE
    // ════════════════════════════════════════════════════
    y += cardH + 18;

    // Table header
    doc.rect(M, y, CW, 26).fill(C.tealDark);
    doc.fillColor(C.white).font("Helvetica-Bold").fontSize(8.5);
    const cols = [
      { label: "Description",   x: M + 8,         w: CW * 0.40 },
      { label: "HSN",           x: M + CW * 0.42,  w: CW * 0.13 },
      { label: "Qty",           x: M + CW * 0.56,  w: CW * 0.08 },
      { label: "Unit Price",    x: M + CW * 0.65,  w: CW * 0.17 },
      { label: "Amount",        x: M + CW * 0.83,  w: CW * 0.17 },
    ];
    cols.forEach(col => {
      doc.text(col.label, col.x, y + 9, { width: col.w });
    });

    // Row 1 — plan
    y += 26;
    const baseAmt  = Math.round(payment.amount / 1.18);
    const gstAmt   = payment.amount - baseAmt;

    const rows = [
      ["Silver Plan (Monthly)", "998431", "1", formatAmount(baseAmt), formatAmount(baseAmt)],
      ["GST @ 18%",            "",        "",  "",                    formatAmount(gstAmt)],
    ];

    rows.forEach((row, ri) => {
      const rowBg = ri % 2 === 0 ? C.white : C.grayLight;
      doc.rect(M, y, CW, 26).fill(rowBg);
      doc.fillColor(C.dark).font("Helvetica").fontSize(9);
      cols.forEach((col, ci) => {
        doc.text(row[ci] || "", col.x, y + 8, { width: col.w });
      });
      doc.moveTo(M, y + 26).lineTo(W - M, y + 26)
        .lineWidth(0.4).strokeColor(C.border).stroke();
      y += 26;
    });

    // ════════════════════════════════════════════════════
    //  TOTALS BOX
    // ════════════════════════════════════════════════════
    y += 10;
    const totBoxX = W - M - 200;
    const totBoxW = 200;
    const totBoxH = 72;
    doc.roundedRect(totBoxX, y, totBoxW, totBoxH, 5)
      .fillAndStroke(C.grayLight, C.border);

    const tRows = [
      ["Subtotal",   formatAmount(baseAmt), false],
      ["GST (18%)",  formatAmount(gstAmt),  false],
      ["Total Paid", formatAmount(payment.amount), true],
    ];

    let ty = y + 12;
    tRows.forEach(([label, val, bold], ri) => {
      if (ri === 2) {
        doc.moveTo(totBoxX + 8, ty - 4).lineTo(totBoxX + totBoxW - 8, ty - 4)
          .lineWidth(0.5).strokeColor(C.border).stroke();
      }
      doc.fillColor(bold ? C.tealDark : C.gray)
        .font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(bold ? 10 : 9)
        .text(label, totBoxX + 10, ty, { width: 90 });
      doc.fillColor(bold ? C.tealDark : C.dark)
        .font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(bold ? 10 : 9)
        .text(val, totBoxX + 10, ty, { width: totBoxW - 18, align: "right" });
      ty += bold ? 18 : 16;
    });

    // ── Credits badge ──────────────────────────────────
    const credits = creditsForPlan(payment.planTier);
    doc.roundedRect(M, y + 8, 300, 22, 4)
      .fillAndStroke(C.tealLight, "#9FE1CB");
    doc.fillColor(C.tealDark).font("Helvetica").fontSize(9)
      .text(`${credits} Credits awarded to your Naavi wallet`, M + 10, y + 14, { width: 280 });

    // ════════════════════════════════════════════════════
    //  FOOTER
    // ════════════════════════════════════════════════════
    doc.rect(0, doc.page.height - 52, W, 52).fill(C.dark);
    doc.fillColor("#9CA3AF").font("Helvetica").fontSize(8)
      .text(
        "Thank you for choosing Naavi!  support@naavi.ai  |  razorpay.com/support",
        0, doc.page.height - 38, { align: "center", width: W }
      )
      .text(
        "This is a computer-generated invoice and does not require a physical signature.",
        0, doc.page.height - 24, { align: "center", width: W }
      );
    doc.fillColor("#6B7280").font("Helvetica").fontSize(7.5)
      .text("Secured by Razorpay", M, doc.page.height - 14)
      .text("naavi.ai", 0, doc.page.height - 14, { align: "right", width: W - M });

    doc.end();
  });
}

module.exports = { generateInvoicePDF };

//this code is working i think