const express = require("express");
const router = express.Router();

const UsersController = require("../controllers/User_Controller");
const UserController = require("../controllers/User.Controller");
const { getAllUsers, getUserProfilePic } = require("../controllers/AuthControllers");
const { getUserActivity } = require("../controllers/UserActivity.Controller"); // << ADD THIS

// User profile CRUD
router.post("/add", UsersController.addUserProfile);
router.put("/users/update/:profileDataId", UsersController.updateUserProfile);
router.get("/get/:email", UsersController.getUserProfile);
router.put("/update/:profileDataId", UsersController.updateLevelTwoProfile);
router.put("/addPersonality", UsersController.addPersonality);

// Username check
router.get('/check-username', UserController.checkUsername);

// CRM Activity
router.get("/activity", getUserActivity); // << ADD THIS

// Utility routes
router.get("/", getAllUsers);
router.get("/profile-pic", getUserProfilePic);

module.exports = router;