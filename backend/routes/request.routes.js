const express = require("express");
const router = express.Router();

const requestController = require("../controllers/request.controller");

// Tenant
router.post("/", requestController.createRequest);
router.get("/my", requestController.getMyRequests);

// Admin
router.get("/admin", requestController.getAllRequests);
router.put("/admin/:id", requestController.updateRequestStatus);
router.post("/admin/:id/assign", requestController.assignRoom);

module.exports = router;
