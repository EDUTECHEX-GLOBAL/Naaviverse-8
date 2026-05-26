const router = require("express").Router();
const {
  login,
  

} = require("../controllers/AdminControllers");




router.post("/login", login);
module.exports = router;
