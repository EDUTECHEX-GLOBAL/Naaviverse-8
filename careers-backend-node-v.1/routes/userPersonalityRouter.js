var express = require("express");
var router = express.Router();

const userPersonalityRouter = require("../controllers/UserPersonalityController");


router.post("/add", userPersonalityRouter.addAnswer);
router.get("/get", userPersonalityRouter.getAnswers);

module.exports = router;