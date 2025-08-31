const express = require('express');
const authController = require('../controllers/authController');
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router()

// Auth
router.post('/auth/login', authController.login);

// Profile 
router.get('/profile', authMiddleware, profileController.getProfile);

module.exports = router