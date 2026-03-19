const express = require('express');
const router = express.Router();

const foodController = require('../controllers/food.controller');
const tenantAuth = require('../middleware/tenantAuth.middleware');
const adminAuth = require('../middleware/adminAuth.middleware');

// TENANT
router.post('/add', tenantAuth, foodController.addMeal);
router.get('/my', tenantAuth, foodController.getMyMeals);

// ADMIN
router.get('/', adminAuth, foodController.getAllMeals);

module.exports = router;
