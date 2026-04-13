import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
    Search, 
    CheckCircle2, 
    XCircle, 
    FileText, 
    Calendar, 
    Building2, 
    GraduationCap, 
    User, 
    ShieldCheck, 
    Lock, 
    Copy, 
    ExternalLink,
    Clock,
    Hash
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const VerifyCredential = () => {
    const { credentialId } = useParams();
    const navigate = useNavigate();
    const [searchId, setSearchId] = useState(credentialId || '');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isLinkCopied, setIsLinkCopied] = useState(false);

    useEffect(() => {
        if (credentialId) {
            handleVerify(credentialId);
        }
    }, [credentialId]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchId.trim()) {
            navigate(`/verify/${searchId.trim()}`);
            handleVerify(searchId.trim());
        } else {
            toast.error('Please enter a Certificate ID');
        }
    };

    const handleVerify = async (id) => {
        setLoading(true);
        setError('');
        setResult(null);
        try {
            const { data } = await api.get(`/verify/${id}`);
            setResult(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed. This credential may be fake or not yet indexed.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = () => {
        const verifyUrl = `${window.location.origin}/verify/${result.credentialData.credentialId}`;
        navigator.clipboard.writeText(verifyUrl);
        setIsLinkCopied(true);
        toast.success('Verification link copied!');
        setTimeout(() => setIsLinkCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-[#0f0f14] text-[#e8e4df] font-sans relative overflow-x-hidden">
            {/* Ambient Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] animate-pulse delay-700"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
            </div>

            <div className="relative z-10 pt-32 pb-20 px-4 md:px-8 max-w-5xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-12 animate-in fade-in slide-in-from-top-10 duration-1000">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-primary text-xs font-black uppercase tracking-widest mb-6">
                        <ShieldCheck className="w-4 h-4" /> SECURE BLOCKCHAIN VERIFICATION
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[#e8e4df] via-primary to-[#e8e4df]">
                        Trust Center
                    </h1>
                    <p className="text-xl text-[#a8a29e] max-w-2xl mx-auto font-medium">
                        Instantly confirm the authenticity of academic records using immutable cryptographic proof on the Polygon ledger.
                    </p>
                </div>

                {/* Input Section */}
                <div className="max-w-3xl mx-auto mb-16 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200">
                    <form onSubmit={handleSearch} className="group relative flex items-center p-2 bg-[#1a1a24]/80 backdrop-blur-2xl rounded-[1.5rem] border border-white/10 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                        <div className="pl-6 text-[#57534e] group-focus-within:text-primary transition-colors">
                            <Search className="w-8 h-8" />
                        </div>
                        <input 
                            type="text" 
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                            placeholder="Enter Certificate ID (e.g. CRED-A1B2...)"
                            className="w-full px-6 py-6 text-xl md:text-2xl outline-none bg-transparent text-[#e8e4df] font-mono tracking-wide placeholder-[#57534e]"
                        />
                        <button 
                            type="submit"
                            disabled={loading}
                            className="bg-gradient-to-r from-primary to-[#b8862e] hover:shadow-[0_0_30px_rgba(212,160,83,0.4)] text-[#0f0f14] px-10 py-5 rounded-2xl font-black text-lg transition-all flex items-center gap-2 group/btn disabled:opacity-50"
                        >
                            {loading ? 'Verifying...' : 'Verify Now'}
                        </button>
                    </form>
                </div>

                {/* Error State */}
                {error && !loading && (
                    <div className="max-w-3xl mx-auto p-12 bg-rose-500/5 backdrop-blur-xl border border-rose-500/20 rounded-[2.5rem] text-center animate-in zoom-in-95 duration-500">
                        <div className="w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-rose-500/20">
                            <ShieldCheck className="w-12 h-12 text-rose-500" />
                        </div>
                        <h3 className="text-3xl font-black text-[#e8e4df] mb-4">Verification Flagged</h3>
                        <p className="text-rose-400/80 text-lg font-medium mb-2">{error}</p>
                        <p className="text-[#57534e] text-sm">This record could not be located in the trusted ledger. It may be revoked, falsified, or incorrectly entered.</p>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="max-w-3xl mx-auto py-20 text-center animate-in fade-in duration-500">
                        <div className="relative w-24 h-24 mx-auto mb-10">
                            <div className="absolute inset-0 border-4 border-primary/20 rounded-2xl animate-pulse"></div>
                            <div className="absolute inset-0 border-4 border-primary rounded-2xl border-t-transparent animate-spin shadow-[0_0_20px_rgba(212,160,83,0.3)]"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Lock className="w-8 h-8 text-primary animate-pulse" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-[#e8e4df] mb-2">Traversing Blockchain...</h3>
                        <p className="text-[#57534e] font-mono text-sm animate-pulse uppercase tracking-[0.3em]">Validating Nodes & IPFS Payload</p>
                    </div>
                )}

                {/* Result Display Section */}
                {result && !loading && (
                    <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
                        {/* Professional Identity Card */}
                        <div className="max-w-4xl mx-auto bg-[#1a1a24] rounded-[3rem] border border-white/10 overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.8)] relative group">
                            {/* Status Header */}
                            <div className={`p-10 text-center relative overflow-hidden ${result.isValid ? 'bg-gradient-to-br from-emerald-500 to-green-700' : 'bg-gradient-to-br from-rose-500 to-red-700'}`}>
                                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="w-28 h-28 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center mb-6 border border-white/20 shadow-2xl">
                                        {result.isValid ? <CheckCircle2 className="w-16 h-16 text-white" /> : <XCircle className="w-16 h-16 text-white" />}
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">
                                        {result.isValid ? 'OFFICIALLY VERIFIED' : 'REVOKED / INVALID'}
                                    </h2>
                                    <p className="text-white/80 font-bold uppercase tracking-[0.2em] text-sm">
                                        Blockchain Notarized Asset
                                    </p>
                                </div>
                            </div>

                            <div className="p-10 md:p-16">
                                <div className="grid md:grid-cols-2 gap-10 mb-12">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1 flex items-center gap-2"><User className="w-3 h-3" /> Holder Name</p>
                                        <p className="text-2xl font-black text-[#e8e4df]">{result.credentialData.studentName}</p>
                                        <p className="text-sm font-medium text-[#57534e]">ID: {result.credentialData.studentId}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1 flex items-center gap-2"><Building2 className="w-3 h-3" /> Certified By</p>
                                        <p className="text-2xl font-black text-[#e8e4df]">{result.credentialData.institution}</p>
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-1 flex items-center gap-2"><GraduationCap className="w-3 h-3" /> Professional Credential</p>
                                        <p className="text-3xl md:text-4xl font-black text-[#e8e4df] leading-tight text-white">{result.credentialData.degree}</p>
                                    </div>
                                    <div className="flex gap-16 md:col-span-2 pt-6 border-t border-white/5">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-white/5 rounded-xl border border-white/10"><Calendar className="w-5 h-5 text-primary" /></div>
                                            <div>
                                                <p className="text-[10px] font-black text-[#57534e] uppercase tracking-widest">Date Issued</p>
                                                <p className="text-lg font-bold">{new Date(result.credentialData.issueDate).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-white/5 rounded-xl border border-white/10"><Clock className="w-5 h-5 text-primary" /></div>
                                            <div>
                                                <p className="text-[10px] font-black text-[#57534e] uppercase tracking-widest">Verified At</p>
                                                <p className="text-lg font-bold">{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row gap-4 pt-10 border-t border-white/5">
                                    {result.meta?.ipfsUrl && (
                                        <a 
                                            href={result.meta.ipfsUrl} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-[#e8e4df] px-8 py-5 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3 group/ipfs"
                                        >
                                            <FileText className="w-5 h-5 group-hover/ipfs:scale-110 transition-transform" /> VIEW ORIGINAL DOCUMENT
                                        </a>
                                    )}
                                    <button 
                                        onClick={handleCopyLink}
                                        className="flex-1 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary px-8 py-5 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3 group/copy"
                                    >
                                        {isLinkCopied ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5 group-hover/copy:scale-110 transition-transform" />}
                                        {isLinkCopied ? 'SHAREABLE LINK COPIED' : 'COPY VERIFICATION PROOF'}
                                    </button>
                                </div>

                                {/* Blockchain Meta Section */}
                                <div className="mt-12 p-8 bg-black/30 rounded-3xl border border-white/5 font-mono text-xs text-[#57534e] relative group/meta overflow-hidden">
                                     <div className="flex items-center gap-4 mb-6">
                                        <Hash className="w-4 h-4 text-primary" />
                                        <span className="font-black text-[#a8a29e] tracking-[0.2em] uppercase">Security Infrastructure Trace</span>
                                        <div className="h-[1px] flex-1 bg-white/5"></div>
                                    </div>
                                    <div className="space-y-3 relative z-10">
                                        <p className="flex justify-between flex-col md:flex-row gap-2 group/id cursor-pointer" onClick={() => { 
                                            navigator.clipboard.writeText(result.credentialData.credentialId);
                                            toast.success('Certificate ID Copied!');
                                        }}>
                                            <span className="text-primary/70 font-bold uppercase tracking-wider">Public Cred UUID:</span>
                                            <span className="text-[#a8a29e] break-all flex items-center gap-2 group-hover/id:text-primary transition-colors">
                                                {result.credentialData.credentialId}
                                                <Copy className="w-3 h-3 opacity-50 group-hover/id:opacity-100" />
                                            </span>
                                        </p>
                                        <p className="flex justify-between flex-col md:flex-row gap-2">
                                            <span className="text-primary/70 font-bold uppercase tracking-wider">On-Chain Registry:</span>
                                            <span className="text-[#a8a29e] break-all">0x28e47...fd2d9 (Validated Registry)</span>
                                        </p>
                                        <p className="flex justify-between flex-col md:flex-row gap-2">
                                            <span className="text-primary/70 font-bold uppercase tracking-wider">Transaction Trace:</span>
                                            <span className="text-[#a8a29e] break-all">{result.meta?.transactionHash || "Cryptographically mapped by smart contract"}</span>
                                        </p>
                                    </div>
                                    <div className="absolute top-0 right-0 p-8 transform translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none transition-opacity duration-1000 group-hover/meta:opacity-20">
                                        <ExternalLink className="w-64 h-64 text-primary" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Trust Badges */}
                        <div className="flex flex-wrap justify-center gap-10 mt-12 opacity-40 hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all cursor-crosshair">
                                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                <span className="text-[10px] font-black tracking-widest uppercase">Tamper Proof Asset</span>
                            </div>
                            <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all cursor-crosshair">
                                <Lock className="w-5 h-5 text-primary" />
                                <span className="text-[10px] font-black tracking-widest uppercase">ZKP Authenticated</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Verification Infrastructure Footer */}
            <div className="text-center py-20 opacity-20 hover:opacity-50 transition-opacity relative z-10 border-t border-white/5 mx-8 font-mono">
                <p className="text-[10px] font-bold tracking-[0.5em] uppercase">Verification Infrastructure v4.2.0 • Powered by Polygon Network</p>
            </div>
        </div>
    );
};

export default VerifyCredential;
