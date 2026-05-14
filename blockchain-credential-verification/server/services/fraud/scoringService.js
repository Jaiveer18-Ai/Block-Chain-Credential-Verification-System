const SEVERITY_WEIGHTS = {
    info: 0,
    low: 4,
    medium: 12,
    high: 24,
    critical: 40,
};

const flattenIndicators = (...groups) => {
    return groups.flatMap((group) => {
        if (!group) return [];
        if (Array.isArray(group)) return group;
        if (Array.isArray(group.indicators)) return group.indicators;
        if (Array.isArray(group.alerts)) return group.alerts;
        return [];
    });
};

const riskFromScore = (score) => {
    if (score >= 85) return { tamperingRisk: 'LOW', trustLevel: 'VERY_HIGH', verificationStatus: 'AUTHENTIC' };
    if (score >= 70) return { tamperingRisk: 'MEDIUM', trustLevel: 'HIGH', verificationStatus: 'REVIEW_REQUIRED' };
    if (score >= 45) return { tamperingRisk: 'HIGH', trustLevel: 'LOW', verificationStatus: 'SUSPICIOUS' };
    return { tamperingRisk: 'CRITICAL', trustLevel: 'UNTRUSTED', verificationStatus: 'LIKELY_FRAUD' };
};

const computeFraudScore = ({
    blockchainData,
    ocrComparison,
    hashValidation,
    pdfTampering,
    imageForensics,
    signatureValidation,
    ocrResult,
}) => {
    const alerts = flattenIndicators(
        hashValidation,
        pdfTampering,
        imageForensics,
        signatureValidation
    );

    if (blockchainData?.checked && blockchainData.isValid === false) {
        alerts.push({
            code: 'BLOCKCHAIN_INVALID',
            severity: 'critical',
            message: 'The credential is not valid on-chain or has been revoked/expired.',
        });
    } else if (blockchainData && !blockchainData.checked) {
        alerts.push({
            code: 'BLOCKCHAIN_UNAVAILABLE',
            severity: 'high',
            message: 'Blockchain verification could not be completed during AI analysis.',
            evidence: { error: blockchainData.error },
        });
    }

    for (const mismatch of ocrComparison.mismatches || []) {
        alerts.push({
            code: `OCR_${mismatch.code.toUpperCase()}_${mismatch.status.toUpperCase()}`,
            severity: mismatch.code === 'credentialId' ? 'high' : 'medium',
            message: `${mismatch.label} does not align with trusted records.`,
            evidence: mismatch,
        });
    }

    if ((ocrResult.confidence || 0) < 45) {
        alerts.push({
            code: 'LOW_OCR_CONFIDENCE',
            severity: 'medium',
            message: 'OCR confidence is too low for fully automated trust.',
            evidence: { confidence: ocrResult.confidence },
        });
    }

    let score = 100;
    for (const alert of alerts) {
        score -= SEVERITY_WEIGHTS[alert.severity] ?? SEVERITY_WEIGHTS.medium;
    }

    if (ocrComparison.averageScore) {
        score -= Math.round((100 - ocrComparison.averageScore) * 0.22);
    }

    if (hashValidation.exactDocumentMatch) {
        score += 8;
    }

    if (blockchainData?.isValid === true && hashValidation.chainDbMatch) {
        score += 4;
    }

    score = Math.max(0, Math.min(100, score));
    const risk = riskFromScore(score);

    const tamperingProbability = Math.max(0, Math.min(100, 100 - score));
    const confidenceInputs = [
        ocrResult.confidence || 0,
        ocrComparison.averageScore || 0,
        hashValidation.chainDbMatch ? 95 : 55,
        blockchainData?.checked && blockchainData?.isValid === true ? 95 : 35,
    ];
    const confidence = Math.round(confidenceInputs.reduce((sum, value) => sum + value, 0) / confidenceInputs.length);

    return {
        score: {
            authenticityScore: score,
            tamperingProbability,
            confidence,
            ...risk,
        },
        alerts: alerts.sort((a, b) => (SEVERITY_WEIGHTS[b.severity] || 0) - (SEVERITY_WEIGHTS[a.severity] || 0)),
    };
};

module.exports = {
    computeFraudScore,
};
