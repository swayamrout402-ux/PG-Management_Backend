const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth.middleware');
const tenantController = require('../controllers/tenant.controller');

// ================= DASHBOARD =================
router.get('/dashboard', auth, tenantController.dashboard);

// ================= PAYMENTS =================
router.get('/payments', auth, tenantController.getPayments);
router.post('/payments', auth, tenantController.addPayment);

// ================= COMPLAINTS =================
router.get('/complaints', auth, tenantController.getComplaints);
router.post('/complaints', auth, tenantController.addComplaint);

// ================= VACATE NOTICE =================
router.get('/notice', auth, tenantController.getNotice);
router.post('/notice', auth, tenantController.sendNotice);
// ================= ALERTS =================
router.get('/alerts', auth, tenantController.getMyAlerts);
//food in food.routes.js





module.exports = router;
