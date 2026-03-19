const express = require('express');
const router = express.Router();

const adminAuthController = require('../controllers/adminAuth.controller');
const adminController = require('../controllers/admin.controller');
const auth = require('../middleware/auth.middleware'); // JWT verification

// ================= ADMIN AUTH =================
router.post('/register', adminAuthController.register); // Admin registration
router.post('/login', adminAuthController.login);       // Admin login

// ================= ADMIN DASHBOARD =================
// All routes below require admin token
router.use(auth); // Protect routes

// Tenants
router.get('/tenants', adminController.getAllTenants);
router.put('/tenants/:id/room', adminController.assignRoom);

// Payments
router.get('/payments', adminController.getAllPayments);

// Complaints
router.get('/complaints', adminController.getAllComplaints);
router.put('/complaints/:id/resolve', adminController.resolveComplaint);
router.get('/complaints/analytics', adminController.getComplaintAnalytics);

// Vacate notices
router.get('/notices', adminController.getAllNotices);

module.exports = router;
