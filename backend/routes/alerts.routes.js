const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const adminAuth = require('../middleware/adminAuth.middleware');

const {
  getTenantAlerts,
  createAlert
} = require('../controllers/alerts.controller');

// Tenant: view own alerts
router.get('/', auth, getTenantAlerts);

// Admin: create alert for tenant
router.post('/create', adminAuth, createAlert);

module.exports = router;
