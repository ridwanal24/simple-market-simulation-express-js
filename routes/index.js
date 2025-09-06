const express = require('express');
const authController = require('../controllers/authController');
const profileController = require('../controllers/profileController');
const orderController = require('../controllers/orderController');
const marketController = require('../controllers/marketController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router()

// Auth
router.post('/auth/login', authController.login);

// Profile 
router.get('/profile', authMiddleware, profileController.getProfile);
router.get('/profile/balance', authMiddleware, profileController.getBalance);
router.get('/profile/assets', authMiddleware, profileController.getAssets);

// Order
router.post('/trade/order', authMiddleware, orderController.createOrder);

// OrderBook
router.get('/market/depth', marketController.getDepth);

// Klines
router.get('/market/klines', marketController.getKlines);

// History transactions
router.get('/market/transactions', marketController.getTransactions);

module.exports = router