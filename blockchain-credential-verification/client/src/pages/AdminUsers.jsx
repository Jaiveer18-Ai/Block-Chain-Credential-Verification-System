import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
    Search, 
    Building2, 
    GraduationCap, 
    Filter,
    Mail,
    Calendar,
    ArrowUpRight,
    Activity,
    UserX,
    UserMinus,
    UserCheck,
    Trash2,
    ShieldAlert,
    Copy
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/admin/users');
            setUsers(data);
            setFilteredUsers(data);
        } catch (err) {
            console.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleToggleStatus = async (userId, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'banned' : 'active';
        const actionText = newStatus === 'active' ? 'unban' : 'ban';
        
        if (!window.confirm(`Are you sure you want to ${actionText} this user?`)) return;

        const toastId = toast.loading(`Processing ${actionText} protocol...`);
        try {
            await api.patch(`/admin/users/${userId}/status`, { status: newStatus });
            toast.success(`User access ${newStatus === 'active' ? 'restored' : 'restricted'} successfully`, { id: toastId });
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Moderation protocol failed', { id: toastId });
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        if (!window.confirm(`DANGER: Are you sure you want to PERMANENTLY delete ${userName}? This action is irreversible.`)) return;

        const toastId = toast.loading('Executing permanent node deletion...');
        try {
            await api.delete(`/admin/users/${userId}`);
            toast.success('User permanently removed from the system', { id: toastId });
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Deletion protocol failed', { id: toastId });
        }
    };

    useEffect(() => {
        let results = users;
        if (roleFilter !== 'all') {
            results = results.filter(u => u.role === roleFilter);
        }
        if (searchTerm) {
            results = results.filter(u => 
                u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (u.institutionName && u.institutionName.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        setFilteredUsers(results);
    }, [searchTerm, roleFilter, users]);

    if (loading) return null;

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-5xl font-black tracking-tighter">User Directory</h1>
                    <p className="text-[#a8a29e] mt-2">Oversee all registered entities and institutional nodes.</p>
                </div>
                
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#57534e]" />
                        <input 
                            type="text" 
                            placeholder="Student name, institution, email..."
                            className="bg-[#1a1a24] border border-[#26262e] rounded-xl py-3 pl-12 pr-6 text-sm outline-none focus:border-primary transition-all w-80"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select 
                        className="bg-[#1a1a24] border border-[#26262e] rounded-xl px-6 py-3 text-sm font-bold appearance-none cursor-pointer outline-none focus:border-primary"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="all">All Roles</option>
                        <option value="institution">Institutions</option>
                        <option value="student">Students</option>
                    </select>
                </div>
            </header>

            <div className="bg-[#1a1a24] border border-[#26262e] rounded-[2rem] overflow-hidden shadow-2xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-[#26262e] bg-white/[0.02]">
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#57534e]">Identity</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#57534e]">Role / Entity</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#57534e]">Contact</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#57534e]">Joined</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#57534e] text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user._id} className="border-b border-[#26262e] hover:bg-white/[0.01] transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2a2a34] to-[#0f0f14] border border-[#26262e] flex items-center justify-center font-bold text-primary">
                                                {user.name[0]}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-[#e8e4df]">{user.name}</p>
                                                {user.status === 'banned' && (
                                                    <span className="text-[8px] font-black text-rose-500 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded uppercase tracking-tighter flex items-center gap-1">
                                                        <ShieldAlert className="w-2.5 h-2.5" /> BANNED
                                                    </span>
                                                )}
                                            </div>
                                            <div 
                                                onClick={() => {
                                                    navigator.clipboard.writeText(user._id);
                                                    toast.success('Full User ID Copied!');
                                                }}
                                                className="text-[10px] font-mono text-[#57534e] hover:text-primary cursor-pointer flex items-center gap-1 group/id transition-colors"
                                                title="Click to copy full ID"
                                            >
                                                ID: {user._id.slice(-8).toUpperCase()}
                                                <Copy className="w-2.5 h-2.5 opacity-0 group-hover/id:opacity-100 transition-opacity" />
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-sm">
                                    <div className="flex items-center gap-2">
                                        {user.role === 'institution' ? (
                                            <Building2 className="w-4 h-4 text-sky-400" />
                                        ) : (
                                            <GraduationCap className="w-4 h-4 text-violet-400" />
                                        )}
                                        <span className="font-bold uppercase tracking-wider text-[11px] text-[#a8a29e]">
                                            {user.role === 'institution' ? user.institutionName : 'Individual Learner'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-sm">
                                    <div className="flex flex-col gap-1">
                                        <span className="flex items-center gap-2 text-[#a8a29e]"><Mail className="w-3 h-3" /> {user.email}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-sm font-medium text-[#57534e]">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                        <button 
                                            onClick={() => handleToggleStatus(user._id, user.status)}
                                            className={`p-2.5 rounded-xl border transition-all ${
                                                user.status === 'banned' 
                                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white' 
                                                : 'bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-white'
                                            }`}
                                            title={user.status === 'banned' ? 'Unban User' : 'Ban User'}
                                        >
                                            {user.status === 'banned' ? <UserCheck className="w-4 h-4" /> : <UserMinus className="w-4 h-4" />}
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteUser(user._id, user.name)}
                                            className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                                            title="Permanently Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredUsers.length === 0 && (
                    <div className="py-20 text-center text-[#57534e] italic">
                        No matches found in the cryptographic directory.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminUsers;
