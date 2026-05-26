var express = require("express");
var router = express.Router();

const PreLoginController = require("../controllers/PreLoginController")
const { verifyToken } = require("../middlewares/authjwt");

router.post("/store",  [verifyToken], PreLoginController.storePreLogin);
router.get("/get_path", PreLoginController.getPreLoginPath);
router.get("/get_coordinates", PreLoginController.getCoordinates);


module.exports = router;