const express = require("express");
const router = express.Router();

const usersController = require("../controllers/user_controller");
const userController = require("../controllers/user.controller");
const { getAllUsers, getUserProfilePic } = require("../controllers/authControllers");
const { getUserActivity } = require("../controllers/userActivity.controller"); // << ADD THIS

// User profile CRUD
router.post("/add", usersController.addUserProfile);
router.put("/users/update/:profileDataId", usersController.updateUserProfile);
router.get("/get/:email", usersController.getUserProfile);
router.put("/update/:profileDataId", usersController.updateLevelTwoProfile);
router.put("/addPersonality", usersController.addPersonality);

// Username check
router.get('/check-username', userController.checkUsername);

// CRM Activity
router.get("/activity", getUserActivity); // << ADD THIS

// Utility routes
router.get("/", getAllUsers);
router.get("/profile-pic", getUserProfilePic);

module.exports = router;