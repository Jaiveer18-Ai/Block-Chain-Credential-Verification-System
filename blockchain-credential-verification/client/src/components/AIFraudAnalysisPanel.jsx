import { useState } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import {
    BrainCircuit,
    UploadCloud,
    ShieldAlert,
    ShieldCheck,
    Loader2,
    FileSearch,
    Fingerprint,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    BadgeCheck,
    Hash,
} from 'lucide-react';

const riskStyles = {
    LOW: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    MEDIUM: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    HIGH: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    CRITICAL: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
};

const severityStyles = {
    info: 'border-sky-500/20 bg-sky-500/5 text-sky-300',
    low: 'border-amber-500/20 bg-amber-500/5 text-amber-300',
    medium: 'border-orange-500/20 bg-orange-500/5 text-orange-300',
    high: 'border-rose-500/20 bg-rose-500/5 text-rose-300',
    critical: 'border-rose-500/30 bg-rose-500/10 text-rose-200',
};

const statusIcon = (status) => {
    if (status === 'match') return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    if (status === 'mismatch' || status === 'missing') return <XCircle className="w-4 h-4 text-rose-400" />;
    return <AlertTriangle className="w-4 h-4 text-amber-400" />;
};

const AnalysisMetric = ({ icon, label, value, tone = 'primary' }) => {
    const IconComponent = icon;
    const toneClass = tone === 'green' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
        : tone === 'red' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
            : 'text-primary bg-primary/10 border-primary/20';

    return (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-4 ${toneClass}`}>
                <IconComponent className="w-5 h-5" />
            </div>
            <p className="text-[10px] uppercase tracking-widest font-black text-[#57534e] mb-1">{label}</p>
            <p className="text-xl font-black text-[#e8e4df]">{value}</p>
        </div>
    );
};

const AIFraudAnalysisPanel = ({ credentialId }) => {
    const [file, setFile] = useState(null);
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (event) => {
        const selected = event.target.files?.[0];
        if (!selected) return;
        setFile(selected);
        setReport(null);
    };

    const runAnalysis = async () => {
        if (!file) return toast.error('Upload the credential document to analyze');

        const formData = new FormData();
        formData.append('document', file);

        const toastId = toast.loading('AI fraud analysis running...');
        try {
            setLoading(true);
            const { data } = await api.post(`/fraud/analyze/${credentialId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 180000,
            });
            setReport(data.report);
            toast.success('AI analysis completed', { id: toastId });
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'AI fraud analysis failed';
            toast.error(message, { id: toastId, duration: 8000 });
        } finally {
            setLoading(false);
        }
    };

    const score = report?.score?.authenticityScore ?? 0;
    const risk = report?.score?.tamperingRisk || 'MEDIUM';
    const checks = report?.metadataValidation?.checks || [];
    const alerts = report?.alerts || [];

    return (
        <div className="max-w-4xl mx-auto mt-10 bg-[#13131a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
            <div className="p-8 md:p-10 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-primary mb-3">
                        <BrainCircuit className="w-4 h-4" /> AI Credential Forensics
                    </div>
                    <h3 className="text-3xl font-black text-[#e8e4df] tracking-tight">Fraud Intelligence Report</h3>
                    <p className="text-sm text-[#a8a29e] mt-2 max-w-2xl">
                        Upload the credential file presented by the holder. BlockCred compares OCR, hashes, blockchain state, document metadata, and visual tampering signals.
                    </p>
                </div>

                <label className="relative cursor-pointer shrink-0">
                    <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/png,image/jpeg,image/webp"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <span className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/40 text-[#e8e4df] text-sm font-black transition">
                        <UploadCloud className="w-5 h-5 text-primary" />
                        {file ? file.name.slice(0, 28) : 'Upload Document'}
                    </span>
                </label>
            </div>

            <div className="p-8 md:p-10">
                <button
                    onClick={runAnalysis}
                    disabled={loading || !file}
                    className="w-full md:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-[#b8862e] text-[#0f0f14] font-black disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(212,160,83,0.15)]"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileSearch className="w-5 h-5" />}
                    {loading ? 'Analyzing OCR, Hashes & Tampering...' : 'Run AI Fraud Analysis'}
                </button>

                {loading && (
                    <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl border border-primary/30 flex items-center justify-center">
                                <BrainCircuit className="w-6 h-6 text-primary animate-pulse" />
                            </div>
                            <div className="flex-1">
                                <p className="font-black text-[#e8e4df]">AI forensic pipeline active</p>
                                <div className="h-2 bg-black/30 rounded-full mt-3 overflow-hidden">
                                    <div className="h-full w-2/3 bg-gradient-to-r from-primary via-secondary to-accent animate-pulse rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {report && !loading && (
                    <div className="mt-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid lg:grid-cols-[260px_1fr] gap-8">
                            <div className="rounded-[2rem] bg-black/25 border border-white/10 p-8 flex flex-col items-center justify-center">
                                <div
                                    className="w-44 h-44 rounded-full flex items-center justify-center shadow-inner"
                                    style={{ background: `conic-gradient(#34d399 ${score * 3.6}deg, rgba(255,255,255,0.08) 0deg)` }}
                                >
                                    <div className="w-36 h-36 rounded-full bg-[#13131a] flex flex-col items-center justify-center border border-white/10">
                                        <span className="text-5xl font-black text-[#e8e4df]">{score}</span>
                                        <span className="text-[10px] uppercase tracking-widest text-[#57534e] font-black">Trust Score</span>
                                    </div>
                                </div>
                                <div className={`mt-6 px-4 py-2 rounded-full border text-xs font-black ${riskStyles[risk]}`}>
                                    {risk} TAMPERING RISK
                                </div>
                                <p className="text-xs text-[#57534e] mt-3 text-center font-bold">
                                    {report.score.verificationStatus.replace('_', ' ')} | {report.score.confidence}% confidence
                                </p>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <AnalysisMetric icon={ShieldCheck} label="Blockchain" value={report.blockchain?.isValid ? 'Valid' : 'Flagged'} tone={report.blockchain?.isValid ? 'green' : 'red'} />
                                <AnalysisMetric icon={Hash} label="Document Hash" value={report.hashValidation?.exactDocumentMatch ? 'Exact Match' : 'Changed'} tone={report.hashValidation?.exactDocumentMatch ? 'green' : 'red'} />
                                <AnalysisMetric icon={Fingerprint} label="Signature" value={report.signatureValidation?.status?.replace('_', ' ') || 'Checked'} tone={report.signatureValidation?.status === 'MATCH' ? 'green' : 'primary'} />
                                <AnalysisMetric icon={BadgeCheck} label="OCR Confidence" value={`${report.ocr?.confidence || 0}%`} />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="rounded-[2rem] bg-black/20 border border-white/10 p-6">
                                <h4 className="font-black text-[#e8e4df] mb-5 flex items-center gap-2">
                                    <FileSearch className="w-5 h-5 text-primary" /> OCR Mismatch Highlights
                                </h4>
                                <div className="space-y-3">
                                    {checks.map((check) => (
                                        <div key={check.code} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                                            {statusIcon(check.status)}
                                            <div className="min-w-0">
                                                <p className="text-sm font-black text-[#e8e4df]">{check.label}</p>
                                                <p className="text-xs text-[#57534e] break-words">
                                                    Expected: {check.expected || 'N/A'} | OCR: {check.extracted || check.status}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-[2rem] bg-black/20 border border-white/10 p-6">
                                <h4 className="font-black text-[#e8e4df] mb-5 flex items-center gap-2">
                                    <ShieldAlert className="w-5 h-5 text-rose-400" /> Fraud Heat Indicators
                                </h4>
                                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                                    {alerts.length === 0 ? (
                                        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-300 text-sm font-bold flex items-center gap-2">
                                            <CheckCircle2 className="w-5 h-5" /> No high-value fraud indicators detected.
                                        </div>
                                    ) : alerts.map((alert, index) => (
                                        <div key={`${alert.code}-${index}`} className={`p-4 rounded-xl border ${severityStyles[alert.severity] || severityStyles.info}`}>
                                            <div className="flex items-center justify-between gap-3 mb-1">
                                                <p className="text-xs font-black uppercase tracking-widest">{alert.code}</p>
                                                <span className="text-[10px] font-black uppercase">{alert.severity}</span>
                                            </div>
                                            <p className="text-sm text-[#e8e4df]">{alert.message}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[2rem] bg-black/20 border border-white/10 p-6">
                            <h4 className="font-black text-[#e8e4df] mb-4">AI Report Trace</h4>
                            <div className="grid md:grid-cols-3 gap-4 text-xs font-mono text-[#a8a29e]">
                                <p>Report: {report._id}</p>
                                <p>Pipeline: {report.processing?.pipelineVersion}</p>
                                <p>Runtime: {report.processing?.durationMs}ms</p>
                                <p className="md:col-span-3 break-all">Uploaded SHA-256: {report.uploadedFile?.sha256}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIFraudAnalysisPanel;
