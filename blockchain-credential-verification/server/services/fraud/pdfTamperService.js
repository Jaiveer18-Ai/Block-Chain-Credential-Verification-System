const { shannonEntropy } = require('./hashService');

const parsePdfDate = (value) => {
    if (!value) return null;
    const clean = String(value).replace(/^D:/, '').replace(/['"]/g, '');
    const match = clean.match(/^(\d{4})(\d{2})(\d{2})(\d{2})?(\d{2})?(\d{2})?/);
    if (!match) return null;

    const [, year, month, day, hour = '00', minute = '00', second = '00'] = match;
    const parsed = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second)));
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

const extractPdfInfo = (raw) => {
    const pick = (name) => {
        const escaped = raw.match(new RegExp(`/${name}\\s*\\(([^)]{0,300})\\)`, 'i'));
        const hex = raw.match(new RegExp(`/${name}\\s*<([0-9A-Fa-f]{2,600})>`, 'i'));
        if (escaped?.[1]) return escaped[1];
        if (hex?.[1]) {
            try {
                return Buffer.from(hex[1], 'hex').toString('utf8').replace(/\0/g, '').trim();
            } catch (error) {
                return null;
            }
        }
        return null;
    };

    return {
        creator: pick('Creator'),
        producer: pick('Producer'),
        creationDate: parsePdfDate(pick('CreationDate')),
        modificationDate: parsePdfDate(pick('ModDate')),
    };
};

const analyzePdfTampering = ({ buffer, mimeType, ocrMetadata = {} }) => {
    if (mimeType !== 'application/pdf') {
        return {
            applicable: false,
            risk: 'not_applicable',
            indicators: [],
            metadata: null,
        };
    }

    const raw = buffer.toString('latin1');
    const metadata = {
        ...extractPdfInfo(raw),
        pages: ocrMetadata.pages,
        parserInfo: ocrMetadata.info || {},
        entropy: shannonEntropy(buffer),
    };

    const indicators = [];
    const eofCount = (raw.match(/%%EOF/g) || []).length;
    const incrementalUpdates = (raw.match(/\/Prev\s+\d+/g) || []).length;
    const acroForms = /\/AcroForm\b/i.test(raw);
    const needAppearances = /\/NeedAppearances\s+true/i.test(raw);
    const embeddedJavaScript = /\/JavaScript\b|\/JS\b/i.test(raw);
    const signatures = /\/Sig\b|\/ByteRange\b/i.test(raw);
    const suspiciousEditors = /(photoshop|illustrator|canva|libreoffice|word|wps|smallpdf|ilovepdf|sejda|pdfescape|foxit|preview|adobe pdf library)/i;
    const producerText = `${metadata.producer || ''} ${metadata.creator || ''}`;

    if (eofCount > 1 || incrementalUpdates > 0) {
        indicators.push({
            code: 'PDF_INCREMENTAL_UPDATE',
            severity: 'high',
            message: 'PDF contains incremental update markers, which often appear after post-issuance editing.',
            evidence: { eofCount, incrementalUpdates },
        });
    }

    if (acroForms || needAppearances) {
        indicators.push({
            code: 'PDF_FORM_LAYER_PRESENT',
            severity: 'medium',
            message: 'Interactive form layers are present. Certificates should usually be flattened before issuance.',
            evidence: { acroForms, needAppearances },
        });
    }

    if (embeddedJavaScript) {
        indicators.push({
            code: 'PDF_ACTIVE_CONTENT',
            severity: 'critical',
            message: 'Embedded JavaScript or active content was detected inside the PDF.',
        });
    }

    if (suspiciousEditors.test(producerText)) {
        indicators.push({
            code: 'PDF_EDITOR_FINGERPRINT',
            severity: 'medium',
            message: 'PDF metadata references software commonly used for editing or re-exporting documents.',
            evidence: { creator: metadata.creator, producer: metadata.producer },
        });
    }

    if (metadata.creationDate && metadata.modificationDate) {
        const created = new Date(metadata.creationDate).getTime();
        const modified = new Date(metadata.modificationDate).getTime();
        const deltaMinutes = Math.round((modified - created) / 60000);

        if (deltaMinutes > 30) {
            indicators.push({
                code: 'PDF_MODIFIED_AFTER_CREATION',
                severity: deltaMinutes > 1440 ? 'high' : 'medium',
                message: 'PDF modification timestamp is materially later than its creation timestamp.',
                evidence: { creationDate: metadata.creationDate, modificationDate: metadata.modificationDate, deltaMinutes },
            });
        }
    }

    if (!signatures) {
        indicators.push({
            code: 'PDF_NO_DIGITAL_SIGNATURE_MARKER',
            severity: 'low',
            message: 'No embedded PDF digital signature marker was found. This is not fraud by itself, but lowers forensic confidence.',
        });
    }

    const risk = indicators.some((item) => item.severity === 'critical') ? 'critical'
        : indicators.some((item) => item.severity === 'high') ? 'high'
            : indicators.some((item) => item.severity === 'medium') ? 'medium'
                : 'low';

    return {
        applicable: true,
        risk,
        indicators,
        metadata,
    };
};

module.exports = {
    analyzePdfTampering,
};
