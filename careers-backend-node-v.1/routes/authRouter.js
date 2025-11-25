const router = require("express").Router();
const {
  signUp,
  login,
  forgotPassword,
  sendConfirmationEmail,
  sendResetPasswordEmail,
  resetPassword,
  logout,
  verifyOTP,
  updatePassword,
  checkEmailDuplicate,
  getAllUsers,
  submitForgotPassword,
} = require("../controllers/authControllers");

// Auth routes
router.post("/signup", signUp);
router.post("/login", login);
router.get("/logout", logout);
router.post("/verifyOTP", verifyOTP);
router.post("/forgotPassword", forgotPassword);
router.post("/updatepassword", updatePassword);
router.post("/changePassword", updatePassword);
router.post("/resetPassword/:token", resetPassword);
router.post("/confirmation", sendConfirmationEmail);
router.get("/allusers", getAllUsers);

// Utility
router.post("/checkEmailDuplicate", checkEmailDuplicate);
router.post("/forgotPassword/submit", submitForgotPassword);


module.exports = router;
