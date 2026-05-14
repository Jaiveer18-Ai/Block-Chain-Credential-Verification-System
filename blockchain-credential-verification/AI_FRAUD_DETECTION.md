# BlockCred AI Fraud Detection Module

## Purpose

The AI fraud detection module adds a pre-verification forensic layer to BlockCred. It analyzes an uploaded credential document against trusted MongoDB metadata, Polygon smart contract data, the original issuance fingerprint, OCR output, PDF metadata, image manipulation signals, and signature/seal fingerprints.

## Backend Structure

```text
server/
  controllers/fraudController.js
  middleware/fraudUpload.js
  models/FraudAnalysisReport.js
  routes/fraudRoutes.js
  services/fraud/
    comparisonService.js
    fraudDetectionService.js
    hashService.js
    imageForensicsService.js
    ocrService.js
    pdfTamperService.js
    scoringService.js
    signatureService.js
    textUtils.js
```

## API Endpoints

- `POST /api/fraud/analyze/:credentialId`
  - Upload field: `document`
  - Allowed types: PDF, PNG, JPG, JPEG, WEBP
  - Runs OCR, metadata checks, hash checks, blockchain comparison, signature comparison, and scoring.

- `GET /api/fraud/reports/:reportId`
  - Returns a compact fraud analysis report.

- `GET /api/fraud/latest/:credentialId`
  - Returns the latest report for a credential.

- `GET /api/fraud/history/:credentialId`
  - Returns recent fraud analysis history for the credential.

## Issuance Baseline

During credential issuance, BlockCred now stores:

- original document SHA-256
- original MIME type and filename
- OCR baseline fields
- signature/seal fingerprint
- baseline metadata and warnings

These fields are saved in `CredentialMeta.baselineAnalysis` and used later to detect modified documents.

## Detection Layers

- OCR extraction: `pdf-parse` for PDF text and `tesseract.js` for image OCR.
- Hash validation: uploaded SHA-256 vs original issuance SHA-256; on-chain IPFS hash vs MongoDB IPFS hash.
- PDF tamper detection: incremental updates, form layers, editor fingerprints, active content, creation/modification timestamp drift.
- Image forensics: EXIF editor traces, low scan density, alpha layers, entropy, repeated-region clone suspicion using tile fingerprints.
- Signature validation: OCR signature text and lower-document visual fingerprint comparison when an original baseline exists.
- Scoring: weighted severity model that produces `authenticityScore`, `tamperingProbability`, `tamperingRisk`, `trustLevel`, and `verificationStatus`.

## Frontend Integration

The verification page now includes `AIFraudAnalysisPanel`, which lets a verifier upload the credential file and view:

- authenticity meter
- tampering risk badge
- blockchain/hash/signature/OCR summary cards
- OCR mismatch highlights
- fraud heat indicators
- report trace and uploaded SHA-256

## Environment

```env
OCR_LANGUAGE=eng
OCR_MAX_PDF_PAGES=5
OCR_LANG_PATH=
OCR_CACHE_PATH=
```

## Future Extension Points

- Replace heuristic scoring with a trained anomaly model.
- Add a queue worker for high-volume OCR processing.
- Store extracted PDF page images for stronger signature crop comparison.
- Add institution-specific logo/stamp templates for visual comparison.
