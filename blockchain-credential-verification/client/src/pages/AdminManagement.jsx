import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { 
    UserPlus, 
    Shield, 
    ShieldCheck, 
    Mail, 
    Key, 
    Trash2,
    Activity,
    Lock
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminManagement = () => {
    const { user: currentUser } = useContext(AuthContext);
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    const fetchAdmins = async () => {
        try {
            const { data } = await api.get('/admin/admins');
            setAdmins(data);
        } catch (err) {
            console.error('Failed to load admins');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const toastId = toast.loading('Initializing new admin node...');
        try {
            await api.post('/admin/create', formData);
            toast.success('Administrator access granted successfully', { id: toastId });
            setFormData({ name: '', email: '', password: '' });
            setIsCreating(false);
            fetchAdmins();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create admin', { id: toastId });
        }
    };

    if (loading) return null;

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            <header className="flex justify-between items-start">
                <div>
                    <h1 className="text-5xl font-black tracking-tighter">Authority Root</h1>
                    <p className="text-[#a8a29e] mt-2">Manage personnel with high-level administrative clearance.</p>
                </div>
                
                <button 
                    onClick={() => setIsCreating(!isCreating)}
                    className="bg-primary text-[#0f0f14] px-8 py-4 rounded-2xl font-black transition-all hover:scale-105 shadow-lg shadow-primary/20 flex items-center gap-3"
                >
                    <UserPlus className="w-5 h-5" />
                    {isCreating ? 'Cancel Protocol' : 'Onboard New Admin'}
                </button>
            </header>

            {isCreating && (
                <div className="max-w-2xl bg-[#1a1a24] border border-primary/20 rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-500">
                    <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-primary">
                        <Lock className="w-6 h-6" /> NEW ADMIN PROTOCOL
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#57534e] uppercase tracking-[0.2em] ml-2">Full Name</label>
                            <input 
                                required
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Root Admin Name"
                                className="w-full bg-[#0f0f14] border border-[#26262e] rounded-2xl p-5 text-sm outline-none focus:border-primary transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#57534e] uppercase tracking-[0.2em] ml-2">Secure Email</label>
                            <div className="relative">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#57534e]" />
                                <input 
                                    required
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="admin@institution.edu"
                                    className="w-full bg-[#0f0f14] border border-[#26262e] rounded-2xl p-5 pl-14 text-sm outline-none focus:border-primary transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#57534e] uppercase tracking-[0.2em] ml-2">Master Password</label>
                            <div className="relative">
                                <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#57534e]" />
                                <input 
                                    required
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••••••"
                                    className="w-full bg-[#0f0f14] border border-[#26262e] rounded-2xl p-5 pl-14 text-sm outline-none focus:border-primary transition-all"
                                />
                            </div>
                        </div>
                        
                        <button 
                            type="submit"
                            className="w-full bg-primary text-[#0f0f14] p-5 rounded-2xl font-black text-lg transition-all hover:bg-white active:scale-95 shadow-xl shadow-primary/20"
                        >
                            GRANT ADMINISTRATIVE PRIVILEGES
                        </button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {admins.map((admin) => (
                    <div key={admin._id} className="bg-[#1a1a24] border border-[#26262e] p-8 rounded-[2.5rem] relative group hover:border-primary/20 transition-all">
                        {currentUser?._id === admin._id && (
                            <div className="absolute -top-3 left-8 bg-emerald-500 text-[10px] font-black text-[#0f0f14] px-4 py-1.5 rounded-full shadow-lg shadow-emerald-500/20 flex items-center gap-2 z-10">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                                </span>
                                ACTIVE NOW
                            </div>
                        )}
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-lg">
                                <ShieldCheck className="w-7 h-7 text-primary" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#57534e] bg-white/5 px-3 py-1.5 rounded-md border border-white/5">
                                UID: {admin._id.slice(-6).toUpperCase()}
                            </span>
                        </div>
                        
                        <h3 className="text-xl font-black text-[#e8e4df] mb-1">{admin.name}</h3>
                        <p className="text-sm font-medium text-[#a8a29e] mb-6 flex items-center gap-2">
                            <Mail className="w-3 h-3" /> {admin.email}
                        </p>
                        
                        <div className="flex items-center justify-end pt-6 border-t border-[#26262e]">
                            <div className="text-[9px] font-bold text-[#57534e] uppercase tracking-widest">
                                Role: Super Admin
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminManagement;
