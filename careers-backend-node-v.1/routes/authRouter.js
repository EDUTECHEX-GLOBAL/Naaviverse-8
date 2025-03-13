const router = require("express").Router();
const {
  login,
  signUp,
  forgotPassword,
  sendConfirmationEmail,
  sendResetPasswordEmail,
  resetPassword,
  logout,
  verifyOTP,
  updatePassword,
  getAllUsers,
  getUserProfilePic,
  checkDuplicatedEmail,

} = require("../controllers/authControllers");



router.post("/signup", signUp);
router.get("/logout", logout);
router.post("/verifyotp", verifyOTP);
router.post("/forgotPassword", forgotPassword);
router.post("/updatepassword", updatePassword);
router.post("/resetPassword/:token", resetPassword);
router.post("/confirmation", sendConfirmationEmail);
router.post("/login", login);
router.get("/get", getAllUsers);
router.get("/get-profile-pic", getUserProfilePic);
router.post("/duplicatedemail", checkDuplicatedEmail)
module.exports = router;
