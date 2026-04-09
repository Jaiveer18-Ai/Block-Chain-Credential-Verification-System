import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import CredentialCard from '../components/CredentialCard';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { PlusCircle, Building2, Layers, CheckCircle2, XOctagon } from 'lucide-react';

const InstitutionDashboard = () => {
    const { user } = useContext(AuthContext);
    const [credentials, setCredentials] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCredentials = async () => {
        try {
            const { data } = await api.get('/credentials/my-issued');
            setCredentials(data);
        } catch (err) {
            toast.error('Failed to load issued credentials');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCredentials();
    }, []);

    const handleRevoke = async (credentialId) => {
        if (!window.confirm('Are you ABSOLUTELY sure you want to revoke this credential? This action is immutable on the blockchain.')) return;
        
        const toastId = toast.loading('Revoking on blockchain...');
        try {
            await api.put(`/credentials/revoke/${credentialId}`);
            toast.success('Credential revoked successfully', { id: toastId });
            fetchCredentials(); // refresh
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to revoke', { id: toastId });
        }
    };

    if (loading) return (
        <div className="min-h-screen pt-32 pb-10 flex flex-col items-center justify-start bg-slate-950">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mb-6"></div>
            <p className="text-secondary font-black tracking-widest uppercase">Syncing with nodes...</p>
        </div>
    );

    const activeCount = credentials.filter(c => !c.isRevoked).length;
    const revokedCount = credentials.filter(c => c.isRevoked).length;

    return (
        <div className="min-h-screen bg-slate-950 relative overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute top-[0%] right-[0%] w-[800px] h-[800px] bg-primary rounded-full mix-blend-screen filter blur-[200px] opacity-10 pointer-events-none"></div>

            <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 py-12 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-8 border-b border-white/10 gap-6">
                    <div className="animate-in fade-in slide-in-from-left-8 duration-700">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-slate-400 text-xs font-black uppercase tracking-widest mb-4">
                            <Building2 className="w-3 h-3 text-secondary" /> Administrative Portal
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white flex items-center gap-4">
                            {user?.institutionName}
                        </h1>
                        <p className="text-slate-500 mt-2 text-lg font-medium">Manage and deploy immutable cryptographic assets globally.</p>
                    </div>
                    <Link 
                        to="/institution/issue"
                        className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 rounded-2xl font-black text-lg transition-transform transform hover:-translate-y-1 shadow-[0_0_30px_rgba(37,99,235,0.3)] flex items-center justify-center gap-3 animate-in fade-in zoom-in-95 duration-700"
                    >
                        <PlusCircle className="w-6 h-6" /> Mint New Credential
                    </Link>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl flex items-center gap-6 shadow-inner relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-16 h-16 bg-blue-500/10 text-primary rounded-2xl flex items-center justify-center border border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                            <Layers className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-500 uppercase tracking-widest mb-1">Total Assets</p>
                            <p className="text-4xl font-black text-white">{credentials.length}</p>
                        </div>
                    </div>
                    
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl flex items-center gap-6 shadow-inner relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-500 uppercase tracking-widest mb-1">Active / Valid</p>
                            <p className="text-4xl font-black text-white">{activeCount}</p>
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl flex items-center gap-6 shadow-inner relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                            <XOctagon className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-500 uppercase tracking-widest mb-1">Revoked</p>
                            <p className="text-4xl font-black text-white">{revokedCount}</p>
                        </div>
                    </div>
                </div>

                {credentials.length === 0 ? (
                    <div className="glass-effect rounded-[3rem] p-20 text-center max-w-3xl mx-auto border border-white/5 animate-in zoom-in-95 duration-700 my-20">
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10">
                            <Layers className="w-10 h-10 text-slate-500" />
                        </div>
                        <h3 className="text-3xl font-black text-white mb-4">Awaiting First Mint</h3>
                        <p className="text-slate-400 mb-8 text-lg">Your smart contract registry is currently empty. Start defining the future by issuing tamper-proof digital certificates.</p>
                        <Link to="/institution/issue" className="inline-flex bg-primary hover:bg-secondary text-white px-8 py-4 rounded-full font-black text-lg transition-colors">Mint First Credential</Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {credentials.map(cred => (
                            <CredentialCard key={cred._id} cred={cred} role="institution" onRevoke={handleRevoke} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InstitutionDashboard;
