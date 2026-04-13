const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getProfile, updateProfile, uploadAvatar, changePassword } = require('../controllers/profileController');

router.get('/', protect, getProfile);
router.put('/', protect, updateProfile);
router.put('/avatar', protect, uploadAvatar);
router.post('/change-password', protect, changePassword);

module.exports = router;
