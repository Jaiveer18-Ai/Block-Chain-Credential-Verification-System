const crypto = require('crypto');
const sharp = require('sharp');
const { normalizeText, similarity } = require('./textUtils');

const hashText = (value = '') => {
    return crypto.createHash('sha256').update(normalizeText(value)).digest('hex');
};

const hammingSimilarity = (left = '', right = '') => {
    if (!left || !right || left.length !== right.length) return 0;
    let matches = 0;
    for (let i = 0; i < left.length; i++) {
        if (left[i] === right[i]) matches++;
    }
    return Math.round((matches / left.length) * 100);
};

const buildVisualSignatureHash = async (buffer, mimeType) => {
    if (!mimeType?.startsWith('image/')) return null;

    const meta = await sharp(buffer).metadata();
    const top = Math.max(0, Math.floor((meta.height || 0) * 0.58));
    const height = Math.max(32, (meta.height || 0) - top);

    const { data, info } = await sharp(buffer, { limitInputPixels: 40_000_000 })
        .rotate()
        .extract({ left: 0, top, width: meta.width, height })
        .resize(256, 96, { fit: 'fill' })
        .grayscale()
        .raw()
        .toBuffer({ resolveWithObject: true });

    const average = data.reduce((sum, value) => sum + value, 0) / data.length;
    let hash = '';
    let ink = 0;

    for (let y = 0; y < info.height; y += 8) {
        for (let x = 0; x < info.width; x += 8) {
            let blockSum = 0;
            let count = 0;
            for (let yy = 0; yy < 8 && y + yy < info.height; yy++) {
                for (let xx = 0; xx < 8 && x + xx < info.width; xx++) {
                    const value = data[(y + yy) * info.width + x + xx];
                    blockSum += value;
                    count++;
                    if (value < 180) ink++;
                }
            }
            hash += blockSum / count < average ? '1' : '0';
        }
    }

    return {
        region: 'lower_document_band',
        visualHash: hash,
        inkDensity: Number((ink / data.length).toFixed(4)),
    };
};

const createSignatureFingerprint = async ({ buffer, mimeType, parsedFields = {} }) => {
    const signatureText = (parsedFields.signatures || []).join(' | ');
    const fingerprint = {
        textHash: signatureText ? hashText(signatureText) : null,
        signatureText,
        visual: null,
    };

    try {
        fingerprint.visual = await buildVisualSignatureHash(buffer, mimeType);
    } catch (error) {
        fingerprint.visualError = error.message;
    }

    return fingerprint;
};

const compareSignatureFingerprint = ({ baseline, uploaded }) => {
    if (!baseline || (!baseline.textHash && !baseline.visual?.visualHash)) {
        return {
            status: 'NOT_AVAILABLE',
            matchScore: null,
            indicators: [{
                code: 'SIGNATURE_BASELINE_MISSING',
                severity: 'low',
                message: 'No original signature fingerprint is stored for this credential.',
            }],
        };
    }

    const indicators = [];
    const scores = [];

    if (baseline.textHash && uploaded.textHash) {
        const textScore = baseline.textHash === uploaded.textHash
            ? 100
            : similarity(baseline.signatureText, uploaded.signatureText);
        scores.push(textScore);
        if (textScore < 70) {
            indicators.push({
                code: 'SIGNATURE_TEXT_MISMATCH',
                severity: 'medium',
                message: 'Signature or authorization text differs from the original credential baseline.',
                evidence: { textScore },
            });
        }
    }

    if (baseline.visual?.visualHash && uploaded.visual?.visualHash) {
        const visualScore = hammingSimilarity(baseline.visual.visualHash, uploaded.visual.visualHash);
        scores.push(visualScore);

        const baselineInk = baseline.visual.inkDensity ?? 0;
        const uploadedInk = uploaded.visual.inkDensity ?? 0;
        const inkDelta = Math.abs(baselineInk - uploadedInk);

        if (visualScore < 72 || inkDelta > 0.08) {
            indicators.push({
                code: 'SIGNATURE_VISUAL_MISMATCH',
                severity: visualScore < 55 ? 'high' : 'medium',
                message: 'The lower document signature/seal region differs from the original baseline.',
                evidence: { visualScore, inkDelta },
            });
        }
    }

    const matchScore = scores.length
        ? Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length)
        : null;

    return {
        status: indicators.length ? 'SUSPICIOUS' : 'MATCH',
        matchScore,
        indicators,
    };
};

module.exports = {
    createSignatureFingerprint,
    compareSignatureFingerprint,
};
