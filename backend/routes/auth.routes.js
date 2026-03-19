const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const adminAuthController = require('../controllers/adminAuth.controller');

// ================= TENANT AUTH =================
// Tenant Registration
router.post('/register', authController.register);

// Tenant Login
router.post('/login', authController.login);

// ================= ADMIN AUTH =================
// ❌ Admin Registration REMOVED

// Admin Login ONLY
router.post('/admin/login', adminAuthController.login);

module.exports = router;
