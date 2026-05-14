const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const { issueCredential, getMyIssuedCredentials, getMyCredentials, revokeCredential } = require('../controllers/credentialController');
const { createDocumentUpload, validateCredentialDocument } = require('../middleware/fraudUpload');

router.post('/issue', protect, roleCheck('institution'), createDocumentUpload('certificate'), validateCredentialDocument, issueCredential);
router.get('/my-issued', protect, roleCheck('institution'), getMyIssuedCredentials);
router.get('/my-credentials', protect, roleCheck('student'), getMyCredentials);
router.put('/revoke/:credentialId', protect, roleCheck('institution'), revokeCredential);

module.exports = router;
