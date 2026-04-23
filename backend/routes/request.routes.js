const express = require('express');
const router = express.Router();

const requestController = require('../controllers/request.controller');

// ⚠️ IMPORT YOUR AUTH MIDDLEWARE HERE
const { verifyTenant, verifyAdmin } = require('../middleware/auth.middleware');

// ================= TENANT =================
router.post('/', verifyTenant, requestController.createRequest);
router.get('/my', verifyTenant, requestController.getMyRequests);

// ================= ADMIN =================
router.get('/admin', verifyAdmin, requestController.getAllRequests);
router.put('/admin/:id', verifyAdmin, requestController.updateRequestStatus);
router.post('/admin/:id/assign', verifyAdmin, requestController.assignRoom);

module.exports = router;
