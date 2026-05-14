const express = require('express');
const router = express.Router();
const { analyzeDocument, getReport, getLatestReport, getReportHistory } = require('../controllers/fraudController');
const {
    createDocumentUpload,
    validateCredentialDocument,
    fraudAnalysisRateLimit,
} = require('../middleware/fraudUpload');

router.post(
    '/analyze/:credentialId',
    fraudAnalysisRateLimit,
    createDocumentUpload('document'),
    validateCredentialDocument,
    analyzeDocument
);

router.get('/reports/:reportId', getReport);
router.get('/latest/:credentialId', getLatestReport);
router.get('/history/:credentialId', getReportHistory);

module.exports = router;
