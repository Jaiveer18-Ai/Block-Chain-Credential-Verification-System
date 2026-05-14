const mongoose = require('mongoose');
const FraudAnalysisReport = require('../models/FraudAnalysisReport');
const { analyzeCredentialDocument, compactReport } = require('../services/fraud/fraudDetectionService');

const sanitizeCredentialId = (value = '') => {
    return String(value).trim().replace(/[^A-Za-z0-9_-]/g, '').slice(0, 80);
};

const analyzeDocument = async (req, res) => {
    try {
        const credentialId = sanitizeCredentialId(req.params.credentialId);
        if (!credentialId) {
            return res.status(400).json({ message: 'A valid credential ID is required.' });
        }

        const report = await analyzeCredentialDocument({
            credentialId,
            file: req.file,
            requestedBy: req.user,
            requestMeta: {
                ip: req.ip,
                userAgent: req.get('user-agent') || '',
            },
        });

        res.status(201).json({
            message: 'AI fraud analysis completed',
            report,
        });
    } catch (error) {
        console.error('Fraud Analysis Error:', error);
        res.status(error.statusCode || 500).json({
            message: error.message || 'AI fraud analysis failed',
        });
    }
};

const getReport = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.reportId)) {
            return res.status(400).json({ message: 'Invalid report ID.' });
        }

        const report = await FraudAnalysisReport.findById(req.params.reportId);
        if (!report) return res.status(404).json({ message: 'Fraud analysis report not found.' });

        res.status(200).json(compactReport(report));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getLatestReport = async (req, res) => {
    try {
        const credentialId = sanitizeCredentialId(req.params.credentialId);
        if (!credentialId) {
            return res.status(400).json({ message: 'A valid credential ID is required.' });
        }

        const report = await FraudAnalysisReport.findOne({ credentialId }).sort({ createdAt: -1 });
        if (!report) return res.status(404).json({ message: 'No AI analysis report exists for this credential yet.' });

        res.status(200).json(compactReport(report));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getReportHistory = async (req, res) => {
    try {
        const credentialId = sanitizeCredentialId(req.params.credentialId);
        if (!credentialId) {
            return res.status(400).json({ message: 'A valid credential ID is required.' });
        }

        const reports = await FraudAnalysisReport.find({ credentialId })
            .sort({ createdAt: -1 })
            .limit(20);

        res.status(200).json(reports.map(compactReport));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    analyzeDocument,
    getReport,
    getLatestReport,
    getReportHistory,
};
