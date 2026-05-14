const { includesApprox, normalizeId, similarity } = require('./textUtils');

const compareDateWithinDays = (left, right, toleranceDays = 7) => {
    if (!left || !right) return null;
    const leftDate = new Date(left);
    const rightDate = new Date(right);
    if (Number.isNaN(leftDate.getTime()) || Number.isNaN(rightDate.getTime())) return null;

    const deltaDays = Math.abs(leftDate.getTime() - rightDate.getTime()) / (24 * 60 * 60 * 1000);
    return {
        match: deltaDays <= toleranceDays,
        deltaDays: Number(deltaDays.toFixed(2)),
    };
};

const textFieldCheck = ({ code, label, expected, extracted, fullText, minScore = 78 }) => {
    if (!expected) {
        return { code, label, status: 'not_available', expected, extracted, score: null };
    }

    if (!extracted) {
        const foundInText = includesApprox(fullText, expected, minScore);
        return {
            code,
            label,
            status: foundInText ? 'match' : 'missing',
            expected,
            extracted: foundInText ? expected : null,
            score: foundInText ? minScore : 0,
        };
    }

    const score = similarity(expected, extracted);
    return {
        code,
        label,
        status: score >= minScore ? 'match' : 'mismatch',
        expected,
        extracted,
        score,
    };
};

const idFieldCheck = ({ code, label, expected, extracted, fullText }) => {
    if (!expected) return { code, label, status: 'not_available', expected, extracted, score: null };
    const expectedId = normalizeId(expected);
    const extractedId = normalizeId(extracted);

    if (extractedId) {
        return {
            code,
            label,
            status: expectedId === extractedId ? 'match' : 'mismatch',
            expected,
            extracted,
            score: expectedId === extractedId ? 100 : 0,
        };
    }

    const found = normalizeId(fullText).includes(expectedId);
    return {
        code,
        label,
        status: found ? 'match' : 'missing',
        expected,
        extracted: found ? expected : null,
        score: found ? 90 : 0,
    };
};

const buildOcrComparison = ({ ocrResult, credentialMeta, blockchainData }) => {
    const parsed = ocrResult.parsedFields || {};
    const fullText = ocrResult.text || '';
    const chain = blockchainData?.credentialData || {};

    const checks = [
        textFieldCheck({
            code: 'studentName',
            label: 'Student name',
            expected: credentialMeta?.studentName || chain.studentName,
            extracted: parsed.studentName,
            fullText,
        }),
        idFieldCheck({
            code: 'studentId',
            label: 'Student ID',
            expected: credentialMeta?.studentId || chain.studentId,
            extracted: parsed.studentId,
            fullText,
        }),
        textFieldCheck({
            code: 'institution',
            label: 'Institution',
            expected: credentialMeta?.institution || chain.institution,
            extracted: parsed.institutionName,
            fullText,
        }),
        textFieldCheck({
            code: 'degree',
            label: 'Degree / credential title',
            expected: credentialMeta?.degree || chain.degree,
            extracted: parsed.degree,
            fullText,
            minScore: 72,
        }),
        idFieldCheck({
            code: 'credentialId',
            label: 'Credential ID',
            expected: credentialMeta?.credentialId || chain.credentialId,
            extracted: parsed.certificateId,
            fullText,
        }),
    ];

    const issueDateExpected = chain.issueDate || credentialMeta?.createdAt;
    const dateComparison = compareDateWithinDays(parsed.issueDate, issueDateExpected);
    if (issueDateExpected) {
        checks.push({
            code: 'issueDate',
            label: 'Issue date',
            status: dateComparison === null ? 'not_extracted' : dateComparison.match ? 'match' : 'mismatch',
            expected: issueDateExpected,
            extracted: parsed.issueDate,
            score: dateComparison === null ? null : dateComparison.match ? 100 : 25,
            evidence: dateComparison,
        });
    }

    const mismatches = checks.filter((check) => ['mismatch', 'missing'].includes(check.status));
    const extractedChecks = checks.filter((check) => typeof check.score === 'number');
    const averageScore = extractedChecks.length
        ? Math.round(extractedChecks.reduce((sum, check) => sum + check.score, 0) / extractedChecks.length)
        : 0;

    return {
        checks,
        mismatches,
        averageScore,
        summary: `${checks.length - mismatches.length}/${checks.length} OCR fields aligned with trusted records.`,
    };
};

const buildHashValidation = ({ uploadedSha256, credentialMeta, blockchainData }) => {
    const chainHash = blockchainData?.credentialData?.ipfsHash;
    const dbIpfsHash = credentialMeta?.ipfsHash;
    const originalSha256 = credentialMeta?.originalDocumentHash;

    const alerts = [];
    const exactDocumentMatch = originalSha256 && uploadedSha256 === originalSha256;
    const chainDbMatch = chainHash && dbIpfsHash && chainHash === dbIpfsHash;

    if (originalSha256 && !exactDocumentMatch) {
        alerts.push({
            code: 'DOCUMENT_HASH_CHANGED',
            severity: 'high',
            message: 'Uploaded document SHA-256 does not match the original document captured at issuance.',
        });
    }

    if (chainHash && dbIpfsHash && !chainDbMatch) {
        alerts.push({
            code: 'IPFS_HASH_MISMATCH',
            severity: 'critical',
            message: 'Blockchain IPFS hash does not match the MongoDB credential record.',
        });
    }

    return {
        uploadedSha256,
        originalSha256: originalSha256 || null,
        exactDocumentMatch: Boolean(exactDocumentMatch),
        onChainIpfsHash: chainHash || null,
        databaseIpfsHash: dbIpfsHash || null,
        chainDbMatch: Boolean(chainDbMatch),
        alerts,
    };
};

module.exports = {
    buildOcrComparison,
    buildHashValidation,
};
