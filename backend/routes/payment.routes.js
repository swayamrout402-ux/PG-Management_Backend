const express = require('express');
const router = express.Router();

const paymentController = require('../controllers/payment.controller');
const tenantAuth = require('../middleware/tenantAuth.middleware');
const adminAuth = require('../middleware/adminAuth.middleware');

// TENANT
router.get('/my', tenantAuth, paymentController.getTenantPayments);

// ADMIN
router.get('/', adminAuth, paymentController.getAllPayments);
router.put('/:id/paid', adminAuth, paymentController.markPaymentPaid);

module.exports = router;
