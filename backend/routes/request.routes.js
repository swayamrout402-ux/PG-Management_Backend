const express = require('express');
const router = express.Router();

const requestController = require('../controllers/request.controller');

// 🔥 TEMP FIX (so server doesn't crash)
const verifyTenant = (req, res, next) => {
  req.user = { tenant_id: 1 };
  next();
};

const verifyAdmin = (req, res, next) => {
  next();
};

// ================= TENANT =================
router.post('/', verifyTenant, requestController.createRequest);
router.get('/my', verifyTenant, requestController.getMyRequests);

// ================= ADMIN =================
router.get('/admin', verifyAdmin, requestController.getAllRequests);
router.put('/admin/:id', verifyAdmin, requestController.updateRequestStatus);
router.post('/admin/:id/assign', verifyAdmin, requestController.assignRoom);

module.exports = router;
