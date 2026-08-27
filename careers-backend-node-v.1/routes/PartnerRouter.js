// routes/partnerRouter.js
// ─────────────────────────────────────────────────────────────────────────────
// Activity routes are NO LONGER here.
// They live in routes/activityRouter.js mounted at /api/activity
// ─────────────────────────────────────────────────────────────────────────────

const router = require("express").Router();

const {
  login,
  signUp,
  forgotPassword,
  sendConfirmationEmail,
  sendResetPasswordEmail,
  resetPassword,
  logout,
  updatePassword,
  getAllPartners,
  updatePartnerProfile,
  getPartnerByEmail,
  getPartnerProfilePic,
  verifyOtp,
  createInternalPartner,
  getAllInternalPartners,
  updateInternalPartner,
  toggleInternalPartnerStatus,
  resetInternalPartnerPassword,
  changePartnerPassword,
} = require("../controllers/PartnersController");
const { getPartnerActivity } = require("../controllers/PartnerActivityController");
// ── Authentication ────────────────────────────────────────────────────────
router.post("/signup",              signUp);
router.post("/login",               login);
router.get("/logout",               logout);

// ── OTP & Verification ────────────────────────────────────────────────────
router.post("/verifyotp",           verifyOtp);
router.post("/forgotPassword",      forgotPassword);
router.post("/updatepassword",      updatePassword);
router.post("/resetPassword/:token", resetPassword);
router.post("/confirmation",        sendConfirmationEmail);

// ── Partner Management ────────────────────────────────────────────────────
router.get("/getpartners",          getAllPartners);
router.put("/add",                  updatePartnerProfile);
router.get("/get",                  getPartnerByEmail);
router.get("/get-profile-pic",      getPartnerProfilePic);
router.get("/activity", getPartnerActivity); 

// ── Internal Partners Management (Super Admin) ───────────────────────────
router.post("/internal/create",          createInternalPartner);
router.get("/internal/all",              getAllInternalPartners);
router.put("/internal/update/:id",       updateInternalPartner);
router.patch("/internal/status/:id",     toggleInternalPartnerStatus);
router.post("/internal/reset-password",  resetInternalPartnerPassword);
router.post("/internal/change-password", changePartnerPassword);

module.exports = router;
