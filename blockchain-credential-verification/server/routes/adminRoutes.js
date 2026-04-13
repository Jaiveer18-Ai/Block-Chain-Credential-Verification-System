const express = require('express');
const router = express.Router();
const { 
    getStats, 
    getAllUsers, 
    getAllCredentials, 
    deleteCredential, 
    createAdmin, 
    getAllAdmins,
    setupFirstAdmin,
    updateUserStatus,
    deleteUser
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

// Public route for initial setup (only works if NO admins exist)
router.post('/setup', setupFirstAdmin);

// Protected Admin Routes
router.get('/stats', protect, roleCheck('admin'), getStats);
router.get('/users', protect, roleCheck('admin'), getAllUsers);
router.get('/credentials', protect, roleCheck('admin'), getAllCredentials);
router.delete('/credentials/:id', protect, roleCheck('admin'), deleteCredential);
router.post('/create', protect, roleCheck('admin'), createAdmin);
router.get('/admins', protect, roleCheck('admin'), getAllAdmins);
router.patch('/users/:id/status', protect, roleCheck('admin'), updateUserStatus);
router.delete('/users/:id', protect, roleCheck('admin'), deleteUser);

module.exports = router;
