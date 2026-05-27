const express = require('express');
const router = express.Router();

const {
  registerAdmin,
  loginAdmin,
  resetPassword, 
  loginSuperAdmin,
} = require('../controllers/AdminAuthController');


router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.post('/super-login', loginSuperAdmin);
router.post('/reset', resetPassword);

module.exports = router;