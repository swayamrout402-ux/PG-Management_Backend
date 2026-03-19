const express = require('express');
const router = express.Router();

const roomController = require('../controllers/room.controller');
const adminAuth = require('../middleware/adminAuth.middleware');

// ADMIN
router.get('/', adminAuth, roomController.getAllRooms);
router.post('/assign', adminAuth, roomController.assignRoom);

module.exports = router;
