const express = require('express');
const router = express.Router();

const requestController = require('../controllers/request.controller');
const verifyTenant = require('../middleware/auth.middleware');

// ================= TENANT =================
router.post('/', verifyTenant, requestController.createRequest);
router.get('/my', verifyTenant, requestController.getMyRequests);

// ================= ADMIN =================
const verifyAdmin = (req, res, next) => {
  // TEMP: allow all (you can secure later)
  next();
};

router.get('/admin', verifyAdmin, requestController.getAllRequests);
router.put('/admin/:id', verifyAdmin, requestController.updateRequestStatus);
router.post('/admin/:id/assign', verifyAdmin, requestController.assignRoom);

module.exports = router;
