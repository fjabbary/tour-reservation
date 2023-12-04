const express = require('express');

const { getOverview, getTour, login } = require('../controllers/viewsController')
const { protect } = require('../controllers/authController');

const router = express.Router();
router.get('/', getOverview)


router.get('/tour/:slug', protect, getTour)

router.get('/login', login)

module.exports = router;
