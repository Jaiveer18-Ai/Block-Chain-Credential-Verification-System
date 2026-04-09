const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const { issueCredential, getMyIssuedCredentials, getMyCredentials, revokeCredential } = require('../controllers/credentialController');

// Multer setup for memory storage parsing
const upload = multer({ storage: multer.memoryStorage() });

router.post('/issue', protect, roleCheck('institution'), upload.single('certificate'), issueCredential);
router.get('/my-issued', protect, roleCheck('institution'), getMyIssuedCredentials);
router.get('/my-credentials', protect, roleCheck('student'), getMyCredentials);
router.put('/revoke/:credentialId', protect, roleCheck('institution'), revokeCredential);

module.exports = router;
