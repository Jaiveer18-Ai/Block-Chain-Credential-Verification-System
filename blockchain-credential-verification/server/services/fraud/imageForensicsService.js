const sharp = require('sharp');
const { shannonEntropy } = require('./hashService');

const SOFTWARE_EDITORS = /(photoshop|gimp|canva|pixlr|snapseed|paint\.net|illustrator|affinity|lightroom)/i;

const buildTileFingerprint = (pixels, width, startX, startY, tileSize) => {
    let sum = 0;
    let sumSq = 0;
    const values = [];

    for (let y = 0; y < tileSize; y++) {
        for (let x = 0; x < tileSize; x++) {
            const value = pixels[(startY + y) * width + startX + x];
            values.push(value);
            sum += value;
            sumSq += value * value;
        }
    }

    const count = values.length;
    const mean = sum / count;
    const variance = (sumSq / count) - (mean * mean);
    if (variance < 60) return null;

    const blockSize = tileSize / 8;
    let signature = '';
    for (let by = 0; by < 8; by++) {
        for (let bx = 0; bx < 8; bx++) {
            let blockSum = 0;
            for (let y = 0; y < blockSize; y++) {
                for (let x = 0; x < blockSize; x++) {
                    blockSum += pixels[(startY + by * blockSize + y) * width + startX + bx * blockSize + x];
                }
            }
            signature += blockSum / (blockSize * blockSize) > mean ? '1' : '0';
        }
    }

    return { signature, variance };
};

const detectCloneLikeTiles = async (buffer) => {
    const size = 512;
    const tileSize = 32;
    const { data, info } = await sharp(buffer, { limitInputPixels: 40_000_000 })
        .rotate()
        .resize(size, size, { fit: 'fill' })
        .grayscale()
        .raw()
        .toBuffer({ resolveWithObject: true });

    const seen = new Map();
    let duplicatePairs = 0;

    for (let y = 0; y <= info.height - tileSize; y += tileSize) {
        for (let x = 0; x <= info.width - tileSize; x += tileSize) {
            const tile = buildTileFingerprint(data, info.width, x, y, tileSize);
            if (!tile) continue;

            const previous = seen.get(tile.signature);
            if (previous) {
                const distance = Math.hypot(previous.x - x, previous.y - y);
                if (distance > tileSize * 2) duplicatePairs++;
            } else {
                seen.set(tile.signature, { x, y, variance: tile.variance });
            }
        }
    }

    return {
        duplicatePairs,
        analyzedTiles: seen.size,
        cloneSuspicion: duplicatePairs >= 5 ? 'high' : duplicatePairs >= 2 ? 'medium' : 'low',
    };
};

const analyzeImageForensics = async ({ buffer, mimeType }) => {
    if (!mimeType?.startsWith('image/')) {
        return {
            applicable: false,
            risk: 'not_applicable',
            indicators: [],
            metadata: null,
        };
    }

    const image = sharp(buffer, { limitInputPixels: 40_000_000 }).rotate();
    const [metadata, stats, cloneAnalysis] = await Promise.all([
        image.metadata(),
        image.stats(),
        detectCloneLikeTiles(buffer),
    ]);

    const exifText = metadata.exif ? metadata.exif.toString('latin1') : '';
    const indicators = [];

    if (SOFTWARE_EDITORS.test(exifText)) {
        indicators.push({
            code: 'IMAGE_EDITOR_EXIF',
            severity: 'medium',
            message: 'Image metadata references software commonly used for document manipulation.',
        });
    }

    if (!metadata.density || metadata.density < 120) {
        indicators.push({
            code: 'LOW_SCAN_DENSITY',
            severity: 'low',
            message: 'Image density is low for an academic credential scan. OCR and visual validation confidence may be reduced.',
            evidence: { density: metadata.density || null },
        });
    }

    if (cloneAnalysis.cloneSuspicion !== 'low') {
        indicators.push({
            code: 'CLONE_REGION_SIMILARITY',
            severity: cloneAnalysis.cloneSuspicion === 'high' ? 'high' : 'medium',
            message: 'Repeated non-adjacent image regions were detected, which can indicate copy-paste tampering.',
            evidence: cloneAnalysis,
        });
    }

    if (stats.entropy && stats.entropy > 7.65) {
        indicators.push({
            code: 'HIGH_COMPRESSION_ENTROPY',
            severity: 'low',
            message: 'The image has unusually high entropy, often caused by aggressive recompression or noisy edits.',
            evidence: { entropy: Number(stats.entropy.toFixed(3)) },
        });
    }

    if (metadata.hasAlpha) {
        indicators.push({
            code: 'ALPHA_LAYER_PRESENT',
            severity: 'medium',
            message: 'Transparent layers are present. Official credential scans rarely require alpha channels.',
        });
    }

    const risk = indicators.some((item) => item.severity === 'high') ? 'high'
        : indicators.some((item) => item.severity === 'medium') ? 'medium'
            : 'low';

    return {
        applicable: true,
        risk,
        indicators,
        metadata: {
            format: metadata.format,
            width: metadata.width,
            height: metadata.height,
            density: metadata.density,
            hasAlpha: metadata.hasAlpha,
            entropy: stats.entropy ? Number(stats.entropy.toFixed(3)) : shannonEntropy(buffer),
            sharpness: stats.sharpness ? Number(stats.sharpness.toFixed(3)) : null,
            dominant: stats.dominant,
            cloneAnalysis,
        },
    };
};

module.exports = {
    analyzeImageForensics,
};
