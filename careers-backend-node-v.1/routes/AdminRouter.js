const router = require("express").Router();
const {
  login,
  

} = require("../controllers/AdminController");




router.post("/login", login);
module.exports = router;
