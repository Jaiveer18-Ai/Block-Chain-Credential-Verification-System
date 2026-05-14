const pdfParse = require('pdf-parse');
const sharp = require('sharp');
const { recognize } = require('tesseract.js');
const os = require('os');
const englishLanguageData = require('@tesseract.js-data/eng');
const { parseCredentialText } = require('./textUtils');

const normalizeImageForOcr = async (buffer) => {
    return sharp(buffer, { limitInputPixels: 40_000_000 })
        .rotate()
        .resize({ width: 2200, withoutEnlargement: true })
        .grayscale()
        .normalize()
        .png()
        .toBuffer();
};

const extractPdfText = async (buffer) => {
    const result = await pdfParse(buffer, {
        max: Number(process.env.OCR_MAX_PDF_PAGES || 5),
    });

    const text = (result.text || '').trim();
    const warnings = [];
    if (!text || text.length < 30) {
        warnings.push('PDF contains little extractable text. It may be scanned, flattened, or intentionally obfuscated.');
    }

    return {
        engine: 'pdf-parse',
        text,
        confidence: text.length >= 30 ? 82 : 30,
        parsedFields: parseCredentialText(text),
        metadata: {
            pages: result.numpages,
            info: result.info || {},
            version: result.version,
        },
        warnings,
    };
};

const extractImageText = async (buffer) => {
    const preparedImage = await normalizeImageForOcr(buffer);
    const language = process.env.OCR_LANGUAGE || 'eng';
    const languagePath = process.env.OCR_LANG_PATH || (language === 'eng' ? englishLanguageData.langPath : undefined);
    const result = await recognize(preparedImage, language, {
        langPath: languagePath,
        gzip: language === 'eng' ? englishLanguageData.gzip : true,
        cachePath: process.env.OCR_CACHE_PATH || os.tmpdir(),
        logger: () => {},
    });

    const text = (result.data?.text || '').trim();
    const confidence = Math.round(result.data?.confidence || 0);
    const warnings = [];

    if (confidence < 55) {
        warnings.push('OCR confidence is low. The document may be noisy, blurred, or partially manipulated.');
    }

    return {
        engine: `tesseract.js:${language}`,
        text,
        confidence,
        parsedFields: parseCredentialText(text),
        metadata: {
            words: result.data?.words?.length || 0,
            lines: result.data?.lines?.length || 0,
        },
        warnings,
    };
};

const extractDocumentText = async ({ buffer, mimeType }) => {
    if (mimeType === 'application/pdf') {
        return extractPdfText(buffer);
    }

    if (mimeType?.startsWith('image/')) {
        return extractImageText(buffer);
    }

    throw new Error('Unsupported OCR document type');
};

module.exports = {
    extractDocumentText,
    normalizeImageForOcr,
};
