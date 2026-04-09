import { useState, useEffect } from 'react';
import api from '../services/api';
import CredentialCard from '../components/CredentialCard';
import { toast } from 'react-hot-toast';
import { BookOpen, Wallet } from 'lucide-react';

const StudentDashboard = () => {
    const [credentials, setCredentials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCredentials = async () => {
            try {
                const { data } = await api.get('/credentials/my-credentials');
                setCredentials(data);
            } catch (err) {
                toast.error('Failed to load credentials');
            } finally {
                setLoading(false);
            }
        };

        fetchCredentials();
    }, []);

    if (loading) return (
        <div className="min-h-screen pt-32 pb-10 flex flex-col items-center justify-start bg-slate-950">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-secondary mb-6"></div>
            <p className="text-primary font-black tracking-widest uppercase">Deciphering Wallet Context...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 relative overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute bottom-[0%] left-[0%] w-[600px] h-[600px] bg-secondary rounded-full mix-blend-screen filter blur-[200px] opacity-10 pointer-events-none"></div>

            <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 py-12 relative z-10">
                <div className="mb-12 border-b border-white/10 pb-8 animate-in fade-in slide-in-from-left-8 duration-700">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-slate-400 text-xs font-black uppercase tracking-widest mb-4">
                        <Wallet className="w-3 h-3 text-primary" /> Identity Vault
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white flex items-center gap-4">
                        My Cryptographic Assets
                    </h1>
                    <p className="text-slate-500 mt-3 text-lg font-medium max-w-2xl">Access, visualize, and distribute your zero-knowledge authenticated credentials across the ecosystem.</p>
                </div>

                {credentials.length === 0 ? (
                    <div className="glass-effect rounded-[3rem] p-20 text-center max-w-3xl mx-auto border border-white/5 animate-in zoom-in-95 duration-700 my-20">
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10">
                            <BookOpen className="w-10 h-10 text-slate-500" />
                        </div>
                        <h3 className="text-3xl font-black text-white mb-4">Wallet Empty</h3>
                        <p className="text-slate-400 mb-8 text-lg font-medium px-10">Your institution hasn't etched your academic credentials onto the ledger yet. They will appear here once authenticated and minted.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {credentials.map(cred => (
                            <CredentialCard key={cred._id} cred={cred} role="student" />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;
