const CredentialMeta = require('../../models/CredentialMeta');
const FraudAnalysisReport = require('../../models/FraudAnalysisReport');
const { verifyCredentialOnChain } = require('../../utils/blockchain');
const { sha256Buffer } = require('./hashService');
const { extractDocumentText } = require('./ocrService');
const { analyzePdfTampering } = require('./pdfTamperService');
const { analyzeImageForensics } = require('./imageForensicsService');
const { createSignatureFingerprint, compareSignatureFingerprint } = require('./signatureService');
const { buildOcrComparison, buildHashValidation } = require('./comparisonService');
const { computeFraudScore } = require('./scoringService');

const compactReport = (report) => {
    const doc = report.toObject ? report.toObject() : report;
    return {
        _id: doc._id,
        credentialId: doc.credentialId,
        createdAt: doc.createdAt,
        uploadedFile: doc.uploadedFile,
        blockchain: doc.blockchain,
        ocr: {
            engine: doc.ocr?.engine,
            confidence: doc.ocr?.confidence,
            parsedFields: doc.ocr?.parsedFields,
            warnings: doc.ocr?.warnings || [],
            textPreview: doc.ocr?.text ? doc.ocr.text.slice(0, 600) : '',
        },
        metadataValidation: doc.metadataValidation,
        hashValidation: doc.hashValidation,
        pdfTampering: doc.pdfTampering,
        imageForensics: doc.imageForensics,
        signatureValidation: doc.signatureValidation,
        score: doc.score,
        alerts: doc.alerts || [],
        processing: doc.processing,
    };
};

const safeBlockchainVerify = async (credentialId) => {
    try {
        const result = await verifyCredentialOnChain(credentialId);
        return {
            checked: true,
            isValid: result.isValid,
            credentialData: result.credentialData,
            chainCredentialId: result.credentialData?.credentialId,
            chainIpfsHash: result.credentialData?.ipfsHash,
            isRevoked: result.credentialData?.isRevoked,
            issuedBy: result.credentialData?.issuedBy,
        };
    } catch (error) {
        return {
            checked: false,
            isValid: false,
            error: error.message,
        };
    }
};

const buildCredentialBaseline = async ({ buffer, mimeType, originalName }) => {
    const sha256 = sha256Buffer(buffer);
    const ocrResult = await extractDocumentText({ buffer, mimeType });
    const signatureFingerprint = await createSignatureFingerprint({
        buffer,
        mimeType,
        parsedFields: ocrResult.parsedFields,
    });

    return {
        originalDocumentHash: sha256,
        originalMimeType: mimeType,
        originalFileName: originalName,
        baselineAnalysis: {
            ocrEngine: ocrResult.engine,
            ocrConfidence: ocrResult.confidence,
            parsedFields: ocrResult.parsedFields,
            signatureFingerprint,
            metadata: ocrResult.metadata,
            warnings: ocrResult.warnings || [],
            analyzedAt: new Date(),
        },
    };
};

const analyzeCredentialDocument = async ({ credentialId, file, requestedBy, requestMeta }) => {
    const startedAt = Date.now();
    const mimeType = file.detectedMimeType || file.mimetype;
    const uploadedSha256 = sha256Buffer(file.buffer);

    const [credentialMeta, blockchainData] = await Promise.all([
        CredentialMeta.findOne({ credentialId }).populate('issuedBy', 'name institutionName email'),
        safeBlockchainVerify(credentialId),
    ]);

    if (!credentialMeta && !blockchainData.credentialData?.credentialId) {
        const error = new Error('Credential not found in trusted records or blockchain registry.');
        error.statusCode = 404;
        throw error;
    }

    const ocrResult = await extractDocumentText({ buffer: file.buffer, mimeType });
    const [pdfTampering, imageForensics, uploadedSignature] = await Promise.all([
        analyzePdfTampering({ buffer: file.buffer, mimeType, ocrMetadata: ocrResult.metadata }),
        analyzeImageForensics({ buffer: file.buffer, mimeType }),
        createSignatureFingerprint({ buffer: file.buffer, mimeType, parsedFields: ocrResult.parsedFields }),
    ]);

    const ocrComparison = buildOcrComparison({ ocrResult, credentialMeta, blockchainData });
    const hashValidation = buildHashValidation({ uploadedSha256, credentialMeta, blockchainData });
    const signatureValidation = compareSignatureFingerprint({
        baseline: credentialMeta?.baselineAnalysis?.signatureFingerprint,
        uploaded: uploadedSignature,
    });

    const { score, alerts } = computeFraudScore({
        blockchainData,
        ocrComparison,
        hashValidation,
        pdfTampering,
        imageForensics,
        signatureValidation,
        ocrResult,
    });

    const report = await FraudAnalysisReport.create({
        credentialId,
        credential: credentialMeta?._id,
        requestedBy: requestedBy?._id,
        uploadedFile: {
            originalName: file.originalname,
            mimeType,
            size: file.size,
            sha256: uploadedSha256,
        },
        blockchain: {
            checked: blockchainData.checked,
            isValid: blockchainData.isValid,
            chainCredentialId: blockchainData.chainCredentialId,
            chainIpfsHash: blockchainData.chainIpfsHash,
            isRevoked: blockchainData.isRevoked,
            issuedBy: blockchainData.issuedBy,
            error: blockchainData.error,
        },
        ocr: {
            engine: ocrResult.engine,
            text: ocrResult.text,
            confidence: ocrResult.confidence,
            parsedFields: ocrResult.parsedFields,
            warnings: ocrResult.warnings || [],
        },
        metadataValidation: ocrComparison,
        hashValidation,
        pdfTampering,
        imageForensics,
        signatureValidation,
        score,
        alerts,
        requestMeta,
        processing: {
            durationMs: Date.now() - startedAt,
            pipelineVersion: 'fraud-ai-v1',
        },
    });

    return compactReport(report);
};

module.exports = {
    analyzeCredentialDocument,
    buildCredentialBaseline,
    compactReport,
};
