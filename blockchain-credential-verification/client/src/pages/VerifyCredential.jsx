import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Search, CheckCircle2, XCircle, FileText, Calendar, Building2, GraduationCap, User } from 'lucide-react';

const VerifyCredential = () => {
    const { credentialId } = useParams();
    const navigate = useNavigate();
    const [searchId, setSearchId] = useState(credentialId || '');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
            setError(err.response?.data?.message || 'Verification failed on blockchain.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-24 px-4 relative bg-slate-900 overflow-hidden">
             {/* Dynamic Background */}
             <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-primary rounded-full mix-blend-screen filter blur-[150px] opacity-40 animate-blob"></div>
             <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-secondary rounded-full mix-blend-screen filter blur-[150px] opacity-30 animate-blob animation-delay-4000"></div>

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="text-center mb-16 animate-float">
                    <h1 className="text-5xl md:text-6xl font-black text-white mb-6 drop-shadow-md tracking-tight">Verify Authenticity</h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto">Confirm the validity of an academic record via cryptographic proof on the Polygon Blockchain.</p>
                </div>

                <form onSubmit={handleSearch} className="mb-16 relative flex items-center shadow-2xl rounded-full overflow-hidden border-2 border-white/20 focus-within:border-primary/50 focus-within:ring-8 focus-within:ring-primary/20 transition-all bg-white/10 backdrop-blur-md">
                    <div className="pl-8 text-white">
                        <Search className="w-8 h-8" />
                    </div>
                    <input 
                        type="text" 
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        placeholder="e.g. CRED-A1B2C3D4E5F6"
                        className="w-full px-6 py-6 text-2xl outline-none bg-transparent text-white font-mono tracking-wide placeholder-white/40"
                    />
                    <button 
                        type="submit"
                        className="absolute right-3 px-10 py-4 bg-gradient-to-r from-primary to-secondary hover:from-primary hover:to-primary text-white font-black text-lg rounded-full shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all h-auto flex items-center transform hover:scale-105"
                    >
                        Verify Now
                    </button>
                </form>

                {loading && (
                    <div className="text-center py-16 glass-effect rounded-3xl border border-white/20">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-6"></div>
                        <p className="text-slate-700 font-bold text-xl">Querying Polygon Network Nodes...</p>
                    </div>
                )}

                {error && (
                    <div className="glass-effect border border-red-500/30 rounded-3xl p-12 text-center shadow-2xl relative overflow-hidden">
                         <div className="absolute inset-0 bg-red-500/10"></div>
                        <XCircle className="w-24 h-24 text-red-500 mx-auto mb-6 relative z-10" />
                        <p className="text-3xl font-black text-slate-900 relative z-10 mb-2">{error}</p>
                        <p className="text-lg text-slate-600 relative z-10">Cross-referenced with the public ledger. The identifier does not match any valid records.</p>
                    </div>
                )}

                {result && (
                    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-500">
                        <div className={`p-10 text-center text-white relative flex flex-col items-center justify-center ${result.isValid ? 'bg-gradient-to-br from-green-500 to-emerald-700' : 'bg-gradient-to-br from-red-500 to-rose-700'}`}>
                            {result.isValid ? (
                                <>
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                                    <CheckCircle2 className="w-24 h-24 mb-4 relative z-10 drop-shadow-md" />
                                    <h2 className="text-5xl font-black tracking-tight relative z-10 drop-shadow-md">CRYPTOGRAPHICALLY VERIFIED</h2>
                                    <p className="text-xl font-bold text-green-100 mt-3 relative z-10">Record exists securely on the Polygon ledger.</p>
                                </>
                            ) : (
                                <>
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                                    <XCircle className="w-24 h-24 mb-4 relative z-10 drop-shadow-md" />
                                    <h2 className="text-5xl font-black tracking-tight relative z-10 drop-shadow-md">INVALID OR REVOKED</h2>
                                    <p className="text-xl font-bold text-red-100 mt-3 relative z-10">This credential is formally invalidated by the issuer.</p>
                                </>
                            )}
                        </div>

                        <div className="p-12">
                            <div className="grid md:grid-cols-2 gap-10">
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                    <h3 className="text-sm font-black text-primary uppercase tracking-widest mb-2 flex items-center gap-2"><User className="w-4 h-4" /> Student Profile</h3>
                                    <p className="text-2xl font-black text-slate-900">{result.credentialData.studentName}</p>
                                    <p className="text-slate-500 font-medium mt-1 uppercase tracking-wide">ID: {result.credentialData.studentId}</p>
                                </div>
                                
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                    <h3 className="text-sm font-black text-secondary uppercase tracking-widest mb-2 flex items-center gap-2"><Building2 className="w-4 h-4" /> Issuing Institution</h3>
                                    <p className="text-2xl font-black text-slate-900">{result.credentialData.institution}</p>
                                </div>
                                
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 md:col-span-2">
                                    <h3 className="text-sm font-black text-accent uppercase tracking-widest mb-2 flex items-center gap-2"><GraduationCap className="w-4 h-4" /> Academic Designation</h3>
                                    <p className="text-3xl font-black text-slate-900">{result.credentialData.degree}</p>
                                </div>
                                
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                    <h3 className="text-sm font-black text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-2"><Calendar className="w-4 h-4" /> Time Notarization</h3>
                                    <p className="text-lg font-bold text-slate-800">Issued: {new Date(result.credentialData.issueDate).toLocaleDateString()}</p>
                                    {result.credentialData.expiryDate > 0 && (
                                        <p className="text-lg font-bold text-slate-800 mt-2">Expires: {new Date(result.credentialData.expiryDate).toLocaleDateString()}</p>
                                    )}
                                </div>
                            </div>
                            
                            {result.meta?.ipfsUrl && (
                                <div className="mt-10 text-center">
                                    <a 
                                        href={result.meta.ipfsUrl} 
                                        target="_blank" rel="noreferrer"
                                        className="inline-flex items-center justify-center gap-3 w-full md:w-auto bg-slate-900 hover:bg-black text-white px-10 py-5 rounded-2xl font-black text-lg transition-transform transform hover:-translate-y-1 shadow-2xl"
                                    >
                                        <FileText className="w-6 h-6" /> Access Immutable IPFS Payload
                                    </a>
                                </div>
                            )}

                             {/* Transaction Details */}
                             <div className="mt-10 bg-slate-900 rounded-2xl p-6 text-sm font-mono text-slate-300 overflow-x-auto shadow-inner border border-slate-800">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                                    <span className="font-bold text-slate-100">BLOCKCHAIN METADATA</span>
                                </div>
                                <p className="mb-2"><span className="text-primary font-bold">Credential UUID:</span> {result.credentialData.credentialId}</p>
                                <p><span className="text-secondary font-bold">Transaction Hash:</span> {result.meta?.transactionHash || "Verified on-chain via smart contract mapping"}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyCredential;
