const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const adminController = require('../controllers/admin.controller');

// ================= TENANTS =================
router.get('/tenants', auth, adminController.getAllTenants);
router.put('/tenants/:id/room', auth, adminController.assignRoom);

// ================= PAYMENTS =================
router.get('/payments', auth, adminController.getAllPayments);
router.put('/payments/:id/confirm', auth, adminController.confirmPayment);

// ================= COMPLAINTS =================
router.get('/complaints', auth, adminController.getAllComplaints);
router.put('/complaints/:id/resolve', auth, adminController.resolveComplaint);
router.get('/complaints/analytics', auth, adminController.getComplaintAnalytics);

// ================= VACATE NOTICES =================
router.get('/notices', auth, adminController.getAllNotices);
router.put('/notices/:id/approve', auth, adminController.approveNotice);
// ================= ROOMS =================
router.get('/rooms/occupancy', auth, adminController.getRoomOccupancy);
// ================= ALERTS =================
router.post('/alerts', auth, adminController.sendAlert);
//food
router.get('/food', auth, adminController.getAllFoodOrders);

router.post("/rooms", adminController.addRoom);
router.get("/rooms", adminController.getRooms);
router.get("/rooms/:roomId", adminController.getRoomTenants);

// existing (modify logic only)
router.put("/tenants/:tenantId/room", adminController.assignRoom);
//removing tenant from room
router.put("/tenants/:tenantId/remove-room", adminController.removeTenantFromRoom);



module.exports = router;
