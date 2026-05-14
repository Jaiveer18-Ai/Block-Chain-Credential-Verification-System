const crypto = require('crypto');

const sha256Buffer = (buffer) => {
    return crypto.createHash('sha256').update(buffer).digest('hex');
};

const shannonEntropy = (buffer) => {
    if (!buffer?.length) return 0;

    const counts = new Array(256).fill(0);
    for (const byte of buffer) counts[byte]++;

    let entropy = 0;
    for (const count of counts) {
        if (!count) continue;
        const probability = count / buffer.length;
        entropy -= probability * Math.log2(probability);
    }

    return Number(entropy.toFixed(3));
};

module.exports = {
    sha256Buffer,
    shannonEntropy,
};
