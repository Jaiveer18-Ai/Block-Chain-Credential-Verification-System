const multer = require('multer');
const rateLimit = require('express-rate-limit');

const MAX_DOCUMENT_SIZE = 12 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
]);

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.png', '.jpg', '.jpeg', '.webp']);

const detectMagicType = (buffer) => {
    if (!buffer || buffer.length < 12) return null;

    const header = buffer.subarray(0, 12);
    const ascii = header.toString('ascii');
    const hex = header.toString('hex');

    if (ascii.startsWith('%PDF')) return 'application/pdf';
    if (hex.startsWith('89504e470d0a1a0a')) return 'image/png';
    if (hex.startsWith('ffd8ff')) return 'image/jpeg';
    if (ascii.startsWith('RIFF') && buffer.subarray(8, 12).toString('ascii') === 'WEBP') return 'image/webp';

    return null;
};

const extensionOf = (fileName = '') => {
    const dotIndex = fileName.lastIndexOf('.');
    return dotIndex >= 0 ? fileName.slice(dotIndex).toLowerCase() : '';
};

const sanitizeFileName = (fileName = 'credential-document') => {
    return fileName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);
};

const createDocumentUpload = (fieldName = 'document') => {
    const upload = multer({
        storage: multer.memoryStorage(),
        limits: {
            fileSize: MAX_DOCUMENT_SIZE,
            files: 1,
        },
        fileFilter: (req, file, cb) => {
            const extension = extensionOf(file.originalname);
            const mime = (file.mimetype || '').toLowerCase();

            if (!ALLOWED_MIME_TYPES.has(mime) || !ALLOWED_EXTENSIONS.has(extension)) {
                return cb(new Error('Unsupported credential file type. Upload a PDF, PNG, JPG, JPEG, or WEBP document.'));
            }

            file.originalname = sanitizeFileName(file.originalname);
            cb(null, true);
        },
    });

    return upload.single(fieldName);
};

const validateCredentialDocument = (req, res, next) => {
    if (!req.file || !req.file.buffer) {
        return res.status(400).json({ message: 'Credential document is required.' });
    }

    const detectedType = detectMagicType(req.file.buffer);
    if (!detectedType || !ALLOWED_MIME_TYPES.has(detectedType)) {
        return res.status(400).json({ message: 'The uploaded file content does not match an allowed credential document type.' });
    }

    const clientMime = (req.file.mimetype || '').toLowerCase();
    if (clientMime !== detectedType && !(clientMime === 'image/jpg' && detectedType === 'image/jpeg')) {
        return res.status(400).json({ message: 'File extension, MIME type, and binary signature do not match.' });
    }

    req.file.detectedMimeType = detectedType;
    next();
};

const fraudAnalysisRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many AI analysis requests. Please wait before submitting another credential.' },
});

module.exports = {
    createDocumentUpload,
    validateCredentialDocument,
    fraudAnalysisRateLimit,
    detectMagicType,
    MAX_DOCUMENT_SIZE,
};
