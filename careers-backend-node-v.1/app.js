/**
 * ============================
 *   🌍 NAAVIVERSE BACKEND
 *   Express Application Setup
 * ============================
 */

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("dotenv").config({ path: path.join(__dirname, ".env") });

var axios = require("axios");
const AWS = require("aws-sdk");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

/* ------------------- AWS CONFIG ------------------- */
AWS.config.update({ region: "ap-south-1" });
const s3 = new AWS.S3();

/* ------------------- ROUTER IMPORTS ------------------- */

var indexRouter = require("./routes/index");
var authRouter = require("./routes/authRouter");
var servicesRouter = require("./routes/servicesRouter");
var adminServicesRouter = require("./routes/adminServicesRouter");
var usersRouter = require("./routes/usersRouter");
var universitiesRouter = require("./routes/universitiesRouter");
var pathsRouter = require("./routes/pathRouter");
var userpathRouter = require("./routes/userpathRouter");
var preLoginRouter = require("./routes/preLoginRouter");
var userPersonalityRouter = require("./routes/userPersonalityRouter");
var partnerRouter = require("./routes/partnerRouter");
var adminRouter = require("./routes/adminRouter");
var personalityRouter = require("./routes/personalityRouter");
var programRouter = require("./routes/programRouter");
var uploadRouter = require("./routes/uploadRouter");
var approvalRouter = require("./routes/approvalRouter");
var visitorRoutes = require("./Admin/routes/VisitorRoute");
const adminAuthRoutes = require("./Admin/routes/adminAuthRoutes");
const adminDashboardRoutes = require("./Admin/routes/adminDashboardRoutes");
const dashboardRouter = require("./routes/Dashboardrouter");
const activityRouter  = require("./routes/activityRouter");
const stepsRouter = require("./routes/stepsRouter");
const marketplaceRouter = require("./routes/marketplaceRouter");

const programNameRouter = require("./routes/programName.router");
const universityProgramRouter = require("./routes/Universityprogram.router");
const locationRouter = require("./routes/Location.router");

const currencyRoutes = require("./routes/currency.route");
const countryRoutes = require("./routes/countryRoutes");
const stateRoutes = require("./routes/stateRoutes");
const cityRoutes = require("./routes/cityRoutes");

// ── Super Admin — newsletter/landing page email subscriptions ──────────────
const adminNewsletterRoutes = require("./Admin/routes/subscriptionRoutes");
const contactRoutes = require("./Admin/routes/contactRoutes");

// ── Platform Admin — paid platform subscriptions (monthly/annual) ──────────
const platformSubscriptionRoutes = require("./routes/subscriptionRoutes");

/* ------------------- APP SETTINGS ------------------- */

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

/* ------------------- MIDDLEWARE ------------------- */

app.use(logger("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

/* ------------------- CORS CONFIG ------------------- */

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:4545",
  "https://naaviverse-vercel-frontend-sigma.vercel.app",
  "https://naaviverse-frontend-sepia.vercel.app"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("❌ CORS blocked:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

/* ------------------- DATABASE CONNECTION ------------------- */

const database_url = process.env.DATABASE_URI;

mongoose
  .connect(database_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

/* ------------------- ROUTES ------------------- */

app.use("/", indexRouter);

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/upload", uploadRouter);

app.use("/api/services", servicesRouter);
app.use("/admin/services", adminServicesRouter);

app.use("/api/steps", stepsRouter);
app.use("/api/marketplace", marketplaceRouter);

app.use("/api/universities", universitiesRouter);
app.use("/api/paths", pathsRouter);
app.use("/api/userpaths", userpathRouter);
app.use("/api/pre_login", preLoginRouter);
app.use("/api/userAnswers", userPersonalityRouter);
app.use("/api/partner", partnerRouter);
app.use("/api/admin", adminRouter);
app.use("/api/personality", personalityRouter);
app.use("/api/approvals", approvalRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/activity",  activityRouter);
app.use("/api/payment", require("./routes/paymentRoutes"));

// ── Super Admin routes (newsletter, contacts, visitors, dashboard) ─────────
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin-dashboard", adminDashboardRoutes);
app.use("/api/admin-subscribe", adminNewsletterRoutes);   // newsletter subscribers
app.use("/api/admin-contact", contactRoutes);
app.use("/api/admin-visitors", visitorRoutes);

/* ---------- EXTRA ROUTES ---------- */

app.use("/api", currencyRoutes);

app.use("/api/programs", programNameRouter);
app.use("/api/university-programs", universityProgramRouter);
app.use("/api/locations", locationRouter);

app.use("/api/countries", countryRoutes);
app.use("/api/states", stateRoutes);
app.use("/api/cities", cityRoutes);

// ── Platform subscription routes (paid plans — monthly/annual) ────────────
app.use("/api/subscriptions", platformSubscriptionRoutes);

app.use("/api/perplexity", require("./routes/perplexity.route"));
app.use("/api/regenerate", require("./routes/regenerateAll.route"));
app.use("/api/crm", require("./routes/crmRoutes"));
app.use("/api/regenerate", require("./routes/regenerateBatch.route"));
app.use("/api/utils", require("./routes/addStepIds.route"));
app.use("/api/stepviews", require("./routes/stepviews.route"));
app.use("/api/wallet", require("./routes/vaultRouter"));
app.use("/api/categories", require("./routes/categoriesRouter"));

/* ------------------- ERROR HANDLING ------------------- */

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.json({ error: err.message });
});

module.exports = app;