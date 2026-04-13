import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
    Search, 
    ShieldCheck, 
    ShieldAlert, 
    Trash2, 
    ExternalLink,
    FileText,
    Hash,
    Copy,
    CheckCircle2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminCredentials = () => {
    const [credentials, setCredentials] = useState([]);
    const [filteredCredentials, setFilteredCredentials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchCredentials = async () => {
        try {
            const { data } = await api.get('/admin/credentials');
            setCredentials(data);
            setFilteredCredentials(data);
        } catch (err) {
            console.error('Failed to load credentials');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCredentials();
    }, []);

    useEffect(() => {
        const results = credentials.filter(cred => 
            cred.degree.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cred.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cred.credentialId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cred.institution.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredCredentials(results);
    }, [searchTerm, credentials]);

    const handleDelete = async (id, credId) => {
        if (!window.confirm(`SECURITY ALERT: Are you sure you want to PERMANENTLY delete record ${credId}? This cannot be undone in the local registry.`)) return;
        
        const toastId = toast.loading('Purging record from registry...');
        try {
            await api.delete(`/admin/credentials/${id}`);
            toast.success('Record purged successfully', { id: toastId });
            fetchCredentials();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Purge failed', { id: toastId });
        }
    };

    if (loading) return null;

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-5xl font-black tracking-tighter">Registry Control</h1>
                    <p className="text-[#a8a29e] mt-2">Oversee all immutable assets and handle administrative purges.</p>
                </div>
                
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#57534e]" />
                    <input 
                        type="text" 
                        placeholder="Search by degree, student, or Cred ID..."
                        className="bg-[#1a1a24] border border-[#26262e] rounded-xl py-3 pl-12 pr-6 text-sm outline-none focus:border-primary transition-all w-96"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            <div className="bg-[#1a1a24] border border-[#26262e] rounded-[2rem] overflow-hidden shadow-2xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-[#26262e] bg-white/[0.02]">
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#57534e]">Asset Profile</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#57534e]">Status</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#57534e]">Infrastructure</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#57534e]">Timeline</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#57534e]">Management</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCredentials.map((cred) => (
                            <tr key={cred._id} className="border-b border-[#26262e] hover:bg-white/[0.01] transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="space-y-1">
                                        <p className="font-bold text-[#e8e4df]">{cred.degree}</p>
                                        <p className="text-xs text-primary font-bold uppercase tracking-wide">{cred.studentName}</p>
                                        <p className="text-[10px] font-mono text-[#57534e]">{cred.institution}</p>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit ${
                                        !cred.isRevoked 
                                            ? 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20' 
                                            : 'text-rose-400 bg-rose-400/10 border border-rose-400/20'
                                    }`}>
                                        {!cred.isRevoked ? (
                                            <>
                                                <ShieldCheck className="w-3 h-3" />
                                                Active
                                            </>
                                        ) : (
                                            <>
                                                <ShieldAlert className="w-3 h-3" />
                                                Revoked
                                            </>
                                        )}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-xs font-mono text-[#a8a29e]">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 group/id cursor-pointer" onClick={() => {
                                            navigator.clipboard.writeText(cred.credentialId);
                                            toast.success('ID Copied');
                                        }}>
                                            <Hash className="w-3 h-3 text-[#57534e]" />
                                            <span className="group-hover/id:text-primary transition-colors">{cred.credentialId}</span>
                                        </div>
                                        <a href={cred.ipfsUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-sky-400 transition-colors">
                                            <FileText className="w-3 h-3" /> Pinata/IPFS
                                        </a>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-[10px] font-bold text-[#57534e] uppercase tracking-wider">
                                    {new Date(cred.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex gap-3">
                                        <a 
                                            href={cred.ipfsUrl} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all"
                                            title="View Certificate"
                                        >
                                            <ExternalLink className="w-4 h-4 text-[#a8a29e]" />
                                        </a>
                                        <button 
                                            onClick={() => handleDelete(cred._id, cred.credentialId)}
                                            className="p-3 bg-rose-500/5 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/10 rounded-xl transition-all"
                                            title="Delete Record"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredCredentials.length === 0 && (
                    <div className="py-20 text-center text-[#57534e] italic">
                        No cryptographic assets found matching the query.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminCredentials;
