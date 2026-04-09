const express = require('express');
const router = express.Router();
const { verifyCredential } = require('../controllers/verifyController');

router.get('/:credentialId', verifyCredential);

module.exports = router;
