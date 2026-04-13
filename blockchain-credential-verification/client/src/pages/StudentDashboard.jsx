import { useState, useEffect } from 'react';
import api from '../services/api';
import CredentialCard from '../components/CredentialCard';
import { toast } from 'react-hot-toast';
import { Search, BookOpen, Wallet, Filter } from 'lucide-react';

const StudentDashboard = () => {
    const [credentials, setCredentials] = useState([]);
    const [filteredCredentials, setFilteredCredentials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchCredentials = async () => {
            try {
                const { data } = await api.get('/credentials/my-credentials');
                setCredentials(data);
                setFilteredCredentials(data);
            } catch (err) {
                toast.error('Failed to load credentials');
            } finally {
                setLoading(false);
            }
        };

        fetchCredentials();
    }, []);

    useEffect(() => {
        const results = credentials.filter(cred => {
            const searchLower = searchTerm.toLowerCase();
            const status = cred.isRevoked ? 'revoked' : (cred.expiryDate && new Date(cred.expiryDate) < new Date() ? 'expired' : 'valid');
            
            return (
                cred.degree.toLowerCase().includes(searchLower) ||
                cred.credentialId.toLowerCase().includes(searchLower) ||
                cred.institution.toLowerCase().includes(searchLower) ||
                status.includes(searchLower)
            );
        });
        setFilteredCredentials(results);
    }, [searchTerm, credentials]);

    if (loading) return (
        <div className="min-h-screen pt-32 pb-10 flex flex-col items-center justify-start bg-[#0f0f14]">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-secondary mb-6"></div>
            <p className="text-primary font-black tracking-widest uppercase">Deciphering Wallet Context...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0f0f14] relative overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute bottom-[0%] left-[0%] w-[600px] h-[600px] bg-secondary rounded-full mix-blend-screen filter blur-[200px] opacity-5 pointer-events-none"></div>

            <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 py-12 relative z-10">
                <div className="mb-12 border-b border-[#d4a053]/10 pb-8 animate-in fade-in slide-in-from-left-8 duration-700">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#1a1a24] border border-[#2a2a34] text-[#a8a29e] text-xs font-black uppercase tracking-widest mb-4">
                        <Wallet className="w-3 h-3 text-primary" /> Identity Vault
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-[#e8e4df] flex items-center gap-4">
                        My Cryptographic Assets
                    </h1>
                    <p className="text-[#57534e] mt-3 text-lg font-medium max-w-2xl">Access, visualize, and distribute your zero-knowledge authenticated credentials across the ecosystem.</p>
                </div>

                {/* Search and Filters */}
                <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                    <div className="relative max-w-2xl">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-[#57534e]" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by degree name, ID, or status (e.g., 'revoked')..."
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
                            <BookOpen className="w-10 h-10 text-[#57534e]" />
                        </div>
                        <h3 className="text-3xl font-black text-[#e8e4df] mb-4">Wallet Empty</h3>
                        <p className="text-[#a8a29e] mb-8 text-lg font-medium px-10">Your institution hasn't etched your academic credentials onto the ledger yet. They will appear here once authenticated and minted.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {filteredCredentials.map(cred => (
                            <CredentialCard key={cred._id} cred={cred} role="student" />
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

export default StudentDashboard;
