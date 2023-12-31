const express = require('express');

const { getOverview, getTour, login, getAccount, updateUserData } = require('../controllers/viewsController')
const { protect, isLoggedIn } = require('../controllers/authController');

const router = express.Router();

router.get('/', isLoggedIn, getOverview)
router.get('/tour/:slug', isLoggedIn, getTour)
router.get('/login', isLoggedIn, login)
router.get('/me', protect, getAccount)

router.post('/submit-user-data', protect, updateUserData)

module.exports = router;
