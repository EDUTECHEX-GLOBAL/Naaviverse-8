const { sendNotificationMail } = require("../middlewares/verifySignUp");

module.exports = async function sendEmail(to, subject, html) {
  try {
    await sendNotificationMail(to, subject, html);
    return true;
  } catch (err) {
    console.error("Email send error:", err);
    return false;
  }
};
