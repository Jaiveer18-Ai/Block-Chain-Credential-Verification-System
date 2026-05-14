const MONTHS = 'jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december';

const normalizeText = (value = '') => {
    return String(value)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
};

const normalizeId = (value = '') => {
    return String(value).toUpperCase().replace(/[^A-Z0-9]/g, '');
};

const levenshtein = (a = '', b = '') => {
    const left = normalizeText(a);
    const right = normalizeText(b);
    if (!left && !right) return 0;
    if (!left || !right) return Math.max(left.length, right.length);

    const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
    const current = new Array(right.length + 1);

    for (let i = 1; i <= left.length; i++) {
        current[0] = i;
        for (let j = 1; j <= right.length; j++) {
            const cost = left[i - 1] === right[j - 1] ? 0 : 1;
            current[j] = Math.min(
                current[j - 1] + 1,
                previous[j] + 1,
                previous[j - 1] + cost
            );
        }
        for (let j = 0; j <= right.length; j++) previous[j] = current[j];
    }

    return previous[right.length];
};

const similarity = (a = '', b = '') => {
    const left = normalizeText(a);
    const right = normalizeText(b);
    if (!left || !right) return 0;

    const distance = levenshtein(left, right);
    const maxLength = Math.max(left.length, right.length);
    return Math.max(0, Math.round((1 - distance / maxLength) * 100));
};

const includesApprox = (haystack = '', needle = '', threshold = 80) => {
    const normalizedHaystack = normalizeText(haystack);
    const normalizedNeedle = normalizeText(needle);
    if (!normalizedHaystack || !normalizedNeedle) return false;
    if (normalizedHaystack.includes(normalizedNeedle)) return true;

    const words = normalizedNeedle.split(' ');
    if (words.length < 2) return similarity(normalizedHaystack, normalizedNeedle) >= threshold;

    const haystackWords = normalizedHaystack.split(' ');
    for (let i = 0; i <= haystackWords.length - words.length; i++) {
        const segment = haystackWords.slice(i, i + words.length).join(' ');
        if (similarity(segment, normalizedNeedle) >= threshold) return true;
    }

    return false;
};

const extractFirstMatch = (text, patterns) => {
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match?.[1]) return match[1].replace(/\s+/g, ' ').trim();
    }
    return null;
};

const parseCredentialText = (rawText = '') => {
    const text = rawText.replace(/\r/g, '\n');
    const flattened = text.replace(/\n+/g, ' ');

    const certificateId = extractFirstMatch(flattened, [
        /\b(?:credential|certificate|cert|serial|reference|ref)\s*(?:id|no\.?|number|#)?\s*[:#-]?\s*([A-Z0-9][A-Z0-9/_-]{4,})\b/i,
        /\b(CRED-[A-Z0-9-]{8,})\b/i,
        /\b(CERT-[A-Z0-9-]{4,})\b/i,
    ]);

    const studentName = extractFirstMatch(flattened, [
        /\b(?:student|candidate|recipient|holder)\s*(?:name)?\s*[:#-]\s*([A-Z][A-Za-z .'-]{2,80})(?=\s+(?:student|credential|certificate|degree|course|program|institution|university|college|issued|date|id)\b|$)/i,
        /\b(?:this is to certify that|awarded to|presented to)\s+([A-Z][A-Za-z .'-]{2,80})(?=\s+(?:has|is|for|on|of)\b)/i,
        /\bname\s*[:#-]\s*([A-Z][A-Za-z .'-]{2,80})/i,
    ]);

    const studentId = extractFirstMatch(flattened, [
        /\b(?:student|roll|registration|enrollment)\s*(?:id|no\.?|number)?\s*[:#-]\s*([A-Z0-9][A-Z0-9/_-]{3,30})\b/i,
    ]);

    const degree = extractFirstMatch(flattened, [
        /\b(?:degree|program|course|certificate|award)\s*[:#-]\s*([A-Z][A-Za-z0-9 .,&'()/-]{4,120})(?=\s+(?:student|credential|certificate|institution|university|college|issued|date|id|grade|marks)\b|$)/i,
        /\b(?:has successfully completed|is awarded the)\s+([A-Z][A-Za-z0-9 .,&'()/-]{4,120})(?=\s+(?:from|at|on|with)\b)/i,
    ]);

    const institutionName = extractFirstMatch(flattened, [
        /\b(?:institution|university|college|school|issued by|issuer)\s*[:#-]\s*([A-Z][A-Za-z0-9 &.,'-]{3,120})(?=\s+(?:student|credential|certificate|degree|course|issued|date|id)\b|$)/i,
        /\b([A-Z][A-Za-z0-9 &.,'-]{3,100}\s+(?:University|College|School|Institute|Academy))\b/,
    ]);

    const issueDate = extractFirstMatch(flattened, [
        new RegExp(`\\b(?:issued|issue date|date of issue|awarded on|dated)\\s*[:#-]?\\s*((?:\\d{1,2}[\\-/ ]\\d{1,2}[\\-/ ]\\d{2,4})|(?:\\d{1,2}\\s+(?:${MONTHS})\\s+\\d{2,4})|(?:(?:${MONTHS})\\s+\\d{1,2},?\\s+\\d{2,4}))`, 'i'),
        /\b(\d{4}-\d{2}-\d{2})\b/,
    ]);

    const signatureLines = text
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => /(signature|signed|registrar|principal|dean|controller|authorized|seal|stamp)/i.test(line))
        .slice(0, 8);

    const grades = [];
    const gradePatterns = [
        /\b(?:grade|division|class)\s*[:#-]\s*([A-Z][A-Z+ -]{0,20})\b/gi,
        /\b(?:cgpa|gpa)\s*[:#-]\s*(\d(?:\.\d{1,2})?\s*\/?\s*\d{0,2})\b/gi,
        /\b(?:marks|score|percentage)\s*[:#-]\s*(\d{1,3}(?:\.\d{1,2})?\s*%?)\b/gi,
    ];
    for (const pattern of gradePatterns) {
        let match;
        while ((match = pattern.exec(flattened)) !== null) {
            grades.push(match[1].trim());
            if (grades.length >= 10) break;
        }
    }

    return {
        studentName,
        studentId,
        institutionName,
        degree,
        issueDate,
        certificateId,
        signatures: signatureLines,
        grades,
        hasSignatureText: signatureLines.length > 0,
    };
};

module.exports = {
    normalizeText,
    normalizeId,
    similarity,
    includesApprox,
    parseCredentialText,
};
