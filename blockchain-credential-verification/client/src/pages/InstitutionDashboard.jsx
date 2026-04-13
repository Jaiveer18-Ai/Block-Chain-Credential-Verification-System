import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import CredentialCard from '../components/CredentialCard';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { PlusCircle, Building2, Layers, CheckCircle2, XOctagon, Search } from 'lucide-react';

const InstitutionDashboard = () => {
    const { user } = useContext(AuthContext);
    const [credentials, setCredentials] = useState([]);
    const [filteredCredentials, setFilteredCredentials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchCredentials = async () => {
        try {
            const { data } = await api.get('/credentials/my-issued');
            setCredentials(data);
            setFilteredCredentials(data);
        } catch (err) {
            toast.error('Failed to load issued credentials');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCredentials();
    }, []);

    useEffect(() => {
        const results = credentials.filter(cred => {
            const searchLower = searchTerm.toLowerCase();
            const status = cred.isRevoked ? 'revoked' : (cred.expiryDate && new Date(cred.expiryDate) < new Date() ? 'expired' : 'valid');
            
            return (
                cred.degree.toLowerCase().includes(searchLower) ||
                cred.credentialId.toLowerCase().includes(searchLower) ||
                cred.studentName.toLowerCase().includes(searchLower) ||
                status.includes(searchLower)
            );
        });
        setFilteredCredentials(results);
    }, [searchTerm, credentials]);

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
        <div className="min-h-screen pt-32 pb-10 flex flex-col items-center justify-start bg-[#0f0f14]">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mb-6"></div>
            <p className="text-secondary font-black tracking-widest uppercase">Syncing with nodes...</p>
        </div>
    );

    const activeCount = credentials.filter(c => !c.isRevoked).length;
    const revokedCount = credentials.filter(c => c.isRevoked).length;

    return (
        <div className="min-h-screen bg-[#0f0f14] relative overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute top-[0%] right-[0%] w-[800px] h-[800px] bg-primary rounded-full mix-blend-screen filter blur-[200px] opacity-5 pointer-events-none"></div>

            <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 py-12 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-8 border-b border-[#d4a053]/10 gap-6">
                    <div className="animate-in fade-in slide-in-from-left-8 duration-700">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#1a1a24] border border-[#2a2a34] text-[#a8a29e] text-xs font-black uppercase tracking-widest mb-4">
                            <Building2 className="w-3 h-3 text-primary" /> Administrative Portal
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-[#e8e4df] flex items-center gap-4">
                            {user?.institutionName}
                        </h1>
                        <p className="text-[#57534e] mt-2 text-lg font-medium">Manage and deploy immutable cryptographic assets globally.</p>
                    </div>
                    <Link 
                        to="/institution/issue"
                        className="bg-gradient-to-r from-primary to-[#b8862e] text-[#0f0f14] px-8 py-4 rounded-2xl font-black text-lg transition-transform transform hover:-translate-y-1 shadow-[0_0_30px_rgba(212,160,83,0.2)] flex items-center justify-center gap-3 animate-in fade-in zoom-in-95 duration-700"
                    >
                        <PlusCircle className="w-6 h-6" /> Mint New Credential
                    </Link>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="bg-[#1a1a24] border border-[#2a2a34] p-8 rounded-3xl flex items-center gap-6 shadow-inner relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center border border-primary/20 shadow-[0_0_15px_rgba(212,160,83,0.15)]">
                            <Layers className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-[#57534e] uppercase tracking-widest mb-1">Total Assets</p>
                            <p className="text-4xl font-black text-[#e8e4df]">{credentials.length}</p>
                        </div>
                    </div>
                    
                    <div className="bg-[#1a1a24] border border-[#2a2a34] p-8 rounded-3xl flex items-center gap-6 shadow-inner relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-[#57534e] uppercase tracking-widest mb-1">Active / Valid</p>
                            <p className="text-4xl font-black text-[#e8e4df]">{activeCount}</p>
                        </div>
                    </div>

                    <div className="bg-[#1a1a24] border border-[#2a2a34] p-8 rounded-3xl flex items-center gap-6 shadow-inner relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.15)]">
                            <XOctagon className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-[#57534e] uppercase tracking-widest mb-1">Revoked</p>
                            <p className="text-4xl font-black text-[#e8e4df]">{revokedCount}</p>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                    <div className="relative max-w-2xl">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-[#57534e]" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by student name, degree, ID, or status..."
                            className="block w-full bg-[#1a1a24] border border-[#2a2a34] rounded-2xl py-4 pl-12 pr-4 text-[#e8e4df] placeholder-[#57534e] focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-xl"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                                <span className="text-[10px] font-black text-primary/40 bg-primary/5 px-2 py-1 rounded border border-primary/10 uppercase tracking-widest">
                                    {filteredCredentials.length} Matches
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {credentials.length === 0 ? (
                    <div className="glass-effect rounded-[3rem] p-20 text-center max-w-3xl mx-auto border border-[#d4a053]/10 animate-in zoom-in-95 duration-700 my-20">
                        <div className="w-24 h-24 bg-[#1a1a24] rounded-full flex items-center justify-center mx-auto mb-8 border border-[#2a2a34]">
                            <Layers className="w-10 h-10 text-[#57534e]" />
                        </div>
                        <h3 className="text-3xl font-black text-[#e8e4df] mb-4">Awaiting First Mint</h3>
                        <p className="text-[#a8a29e] mb-8 text-lg">Your smart contract registry is currently empty. Start defining the future by issuing tamper-proof digital certificates.</p>
                        <Link to="/institution/issue" className="inline-flex bg-primary hover:bg-[#b8862e] text-[#0f0f14] px-8 py-4 rounded-full font-black text-lg transition-colors">Mint First Credential</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {filteredCredentials.map(cred => (
                            <CredentialCard key={cred._id} cred={cred} role="institution" onRevoke={handleRevoke} />
                        ))}
                    </div>
                )}
                {credentials.length > 0 && filteredCredentials.length === 0 && (
                    <div className="text-center py-20 bg-[#1a1a24]/50 rounded-[2rem] border border-dashed border-[#2a2a34]">
                        <Search className="w-12 h-12 text-[#2a2a34] mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-[#a8a29e]">No credentials match your search</h3>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InstitutionDashboard;
