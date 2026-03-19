const express = require('express');
const router = express.Router();
const controller = require('../controllers/complaint.controller');
const tenantAuth = require('../middleware/tenantAuth.middleware');

router.post('/create', tenantAuth, controller.createComplaint);
router.get('/my', tenantAuth, controller.getTenantComplaints);

module.exports = router;
