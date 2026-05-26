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

require("dotenv").config({
  path: path.join(__dirname, ".env"),
});

var axios = require("axios");
const AWS = require("aws-sdk");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

/* ------------------- AWS CONFIG ------------------- */

AWS.config.update({
  region: "ap-south-1",
});

const s3 = new AWS.S3();

/* ------------------- ROUTER IMPORTS ------------------- */

const indexRouter = require("./routes/Index");

const authRouter = require("./routes/AuthRouter");
const servicesRouter = require("./routes/ServicesRouter");
const adminServicesRouter = require("./routes/AdminServicesRouter");
const usersRouter = require("./routes/UsersRouter");
const universitiesRouter = require("./routes/UniversitiesRouter");
const pathsRouter = require("./routes/PathRouter");
const userpathRouter = require("./routes/UserPathRouter");
const preLoginRouter = require("./routes/PreLoginRouter");
const userPersonalityRouter = require("./routes/UserPersonalityRouter");
const partnerRouter = require("./routes/PartnerRouter");
const adminRouter = require("./routes/AdminRouter");
const personalityRouter = require("./routes/PersonalityRouter");
const programRouter = require("./routes/ProgramRouter");
const uploadRouter = require("./routes/UploadRouter");
const approvalRouter = require("./routes/ApprovalRouter");

const visitorRoutes = require("./Admin/routes/VisitorRoute");
const adminAuthRoutes = require("./Admin/routes/AdminAuthRoutes");
const adminDashboardRoutes = require("./Admin/routes/AdminDashboardRoutes");

const dashboardRouter = require("./routes/Dashboardrouter");
const activityRouter = require("./routes/ActivityRouter");
const stepsRouter = require("./routes/StepsRouter");
const marketplaceRouter = require("./routes/MarketPlaceRouter");

const partnerDashboardRouter = require("./routes/PartnerDashboardRouter");

const programNameRouter = require("./routes/ProgramNameRouter");
const universityProgramRouter = require("./routes/UniversityProgramRouter");
const locationRouter = require("./routes/LocationRouter");

const currencyRoutes = require("./routes/CurrencyRoute");
const countryRoutes = require("./routes/CountryRoutes");
const stateRoutes = require("./routes/StateRoutes");
const cityRoutes = require("./routes/CityRoutes");

/* ------------------- ADMIN ROUTES ------------------- */

const adminNewsletterRoutes = require("./Admin/routes/SubscriptionRoutes");
const contactRoutes = require("./Admin/routes/ContactRoutes");

/* ------------------- SUBSCRIPTION ROUTES ------------------- */

const platformSubscriptionRoutes = require("./routes/SubscriptionRoutes");

/* ------------------- APP SETTINGS ------------------- */

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

/* ------------------- MIDDLEWARE ------------------- */

app.use(logger("dev"));

app.use(express.json({ limit: "50mb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "50mb",
  })
);

app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));

/* ------------------- CORS CONFIG ------------------- */

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:4545",
  "https://naaviverse-vercel-frontend-sigma.vercel.app",
  "https://naaviverse-frontend-sepia.vercel.app",
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

  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.options("*", cors(corsOptions));

/* ------------------- DATABASE CONNECTION ------------------- */

const database_url = process.env.DATABASE_URI;

mongoose
  .connect(database_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
  });

/* ------------------- ROUTES ------------------- */

app.use("/", indexRouter);

/* ---------- AUTH ---------- */

app.use("/api/auth", authRouter);

/* ---------- USERS ---------- */

app.use("/api/users", usersRouter);

/* ---------- UPLOAD ---------- */

app.use("/api/upload", uploadRouter);

/* ---------- SERVICES ---------- */

app.use("/api/services", servicesRouter);

app.use("/admin/services", adminServicesRouter);

/* ---------- STEPS ---------- */

app.use("/api/steps", stepsRouter);

/* ---------- MARKETPLACE ---------- */

app.use("/api/marketplace", marketplaceRouter);

/* ---------- UNIVERSITIES ---------- */

app.use("/api/universities", universitiesRouter);

/* ---------- PATHS ---------- */

app.use("/api/paths", pathsRouter);

app.use("/api/userpaths", userpathRouter);

/* ---------- PRE LOGIN ---------- */

app.use("/api/pre_login", preLoginRouter);

/* ---------- USER PERSONALITY ---------- */

app.use("/api/userAnswers", userPersonalityRouter);

/* ---------- PARTNER ---------- */

app.use("/api/partner", partnerRouter);

/* ---------- ADMIN ---------- */

app.use("/api/admin", adminRouter);

/* ---------- PERSONALITY ---------- */

app.use("/api/personality", personalityRouter);

/* ---------- APPROVALS ---------- */

app.use("/api/approvals", approvalRouter);

/* ---------- DASHBOARD ---------- */

app.use("/api/dashboard", dashboardRouter);

/* ---------- ACTIVITY ---------- */

app.use("/api/activity", activityRouter);

/* ---------- PAYMENT ---------- */

app.use("/api/payment", require("./routes/PaymentRoutes"));

/* ---------- PARTNER DASHBOARD ---------- */

app.use("/api/partner-dashboard", partnerDashboardRouter);

/* ---------- ADMIN AUTH ---------- */

app.use("/api/admin/auth", adminAuthRoutes);

/* ---------- ADMIN DASHBOARD ---------- */

app.use("/api/admin-dashboard", adminDashboardRoutes);

/* ---------- ADMIN SUBSCRIPTIONS ---------- */

app.use("/api/admin-subscribe", adminNewsletterRoutes);

/* ---------- ADMIN CONTACT ---------- */

app.use("/api/admin-contact", contactRoutes);

/* ---------- ADMIN VISITORS ---------- */

app.use("/api/admin-visitors", visitorRoutes);

/* ---------- CURRENCY ---------- */

app.use("/api", currencyRoutes);

/* ---------- PROGRAMS ---------- */

app.use("/api/programs", programNameRouter);

/* ---------- UNIVERSITY PROGRAMS ---------- */

app.use("/api/university-programs", universityProgramRouter);

/* ---------- LOCATIONS ---------- */

app.use("/api/locations", locationRouter);

/* ---------- COUNTRIES ---------- */

app.use("/api/countries", countryRoutes);

/* ---------- STATES ---------- */

app.use("/api/states", stateRoutes);

/* ---------- CITIES ---------- */

app.use("/api/cities", cityRoutes);

/* ---------- PLATFORM SUBSCRIPTIONS ---------- */

app.use("/api/subscriptions", platformSubscriptionRoutes);

/* ---------- EXTRA ROUTES ---------- */

app.use("/api/perplexity", require("./routes/PerplexityRoute"));

app.use("/api/regenerate", require("./routes/RegenerateAllRoute"));

app.use("/api/crm", require("./routes/CrmRoutes"));

app.use("/api/regenerate", require("./routes/RegenerateBatchRoute"));

app.use("/api/utils", require("./routes/AddStepIdsRoute"));

app.use("/api/stepviews", require("./routes/StepviewsRoute"));

app.use("/api/wallet", require("./routes/VaultRouter"));

app.use("/api/categories", require("./routes/CategoriesRouter"));

/* ------------------- ERROR HANDLING ------------------- */

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;

  res.locals.error =
    req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);

  res.json({
    error: err.message,
  });
});

/* ------------------- SERVER ------------------- */

const PORT = process.env.PORT || 4545;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;