import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
    Users, 
    Building2, 
    GraduationCap, 
    ShieldCheck, 
    Activity, 
    AlertCircle,
    TrendingUp,
    Shield
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, trend }) => {
    // Explicit color mapping to ensure Tailwind classes are bundled correctly
    const colorClasses = {
        primary: { bg: 'bg-primary/10', text: 'text-primary', blob: 'bg-primary' },
        emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', blob: 'bg-emerald-500' },
        sky: { bg: 'bg-sky-500/10', text: 'text-sky-500', blob: 'bg-sky-500' },
        violet: { bg: 'bg-violet-500/10', text: 'text-violet-500', blob: 'bg-violet-500' },
        amber: { bg: 'bg-amber-500/10', text: 'text-amber-500', blob: 'bg-amber-500' },
        rose: { bg: 'bg-rose-500/10', text: 'text-rose-500', blob: 'bg-rose-500' },
    };

    const styles = colorClasses[color] || colorClasses.primary;

    return (
        <div className="bg-[#1a1a24] border border-[#26262e] p-8 rounded-[2rem] relative overflow-hidden group hover:border-primary/30 transition-all duration-500">
            <div className={`absolute top-0 right-0 w-32 h-32 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity -mr-8 -mt-8 rounded-full ${styles.blob}`} />
            
            <div className="flex items-center justify-between mb-6">
                <div className={`p-4 rounded-2xl ${styles.bg} shadow-lg border border-white/5`}>
                    <Icon className={`w-8 h-8 ${styles.text}`} />
                </div>
                {trend && (
                    <div className="flex items-center gap-1 text-emerald-400 text-sm font-black">
                        <TrendingUp className="w-4 h-4" />
                        +{trend}%
                    </div>
                )}
            </div>
            
            <h3 className="text-sm font-black text-[#57534e] uppercase tracking-widest mb-2">{title}</h3>
            <p className="text-5xl font-black text-[#e8e4df] leading-none tracking-tighter">{value}</p>
        </div>
    );
};

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStats = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.get('/admin/stats');
            setStats(data);
        } catch (err) {
            console.error('Failed to load stats');
            setError('System monitor is unable to reach the peer network. Ensure your local server is active and connected to Atlas.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <Activity className="w-12 h-12 text-primary animate-spin" />
            <p className="text-primary/60 font-black uppercase tracking-widest text-[10px]">Syncing with Cloud Nodes...</p>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-rose-500/5 border border-rose-500/10 rounded-[2rem] p-12 text-center">
            <AlertCircle className="w-16 h-16 text-rose-500 mb-6 animate-pulse" />
            <h2 className="text-2xl font-black text-[#e8e4df] mb-4">Communication Breakdown</h2>
            <p className="text-rose-200/60 max-w-md mb-8">{error}</p>
            <button 
                onClick={fetchStats}
                className="px-8 py-4 bg-rose-500 text-white font-black rounded-2xl hover:bg-rose-600 transition-all active:scale-95"
            >
                Retry Handshake
            </button>
        </div>
    );

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <header>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-primary/5 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-4">
                    <Shield className="w-3 h-3" /> System Integrity Monitor
                </div>
                <h1 className="text-6xl font-black text-[#e8e4df] tracking-tighter">Root Overview</h1>
                <p className="text-[#a8a29e] mt-2 text-lg font-medium">Global observability into cryptographic certificate lifecycle and peer nodes.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <StatCard 
                    title="Global Users" 
                    value={stats?.totalUsers ?? 0} 
                    icon={Users} 
                    color="primary" 
                />
                <StatCard 
                    title="Active Sessions" 
                    value={stats?.activeUsers ?? 0} 
                    icon={Activity} 
                    color="emerald" 
                />
                <StatCard 
                    title="Institutions" 
                    value={stats?.totalInstitutions ?? 0} 
                    icon={Building2} 
                    color="sky" 
                />
                <StatCard 
                    title="Student Profiles" 
                    value={stats?.totalStudents ?? 0} 
                    icon={GraduationCap} 
                    color="violet" 
                />
                <StatCard 
                    title="Minted Records" 
                    value={stats?.totalCredentials ?? 0} 
                    icon={ShieldCheck} 
                    color="amber" 
                />
                <StatCard 
                    title="Revoked Assets" 
                    value={stats?.revokedCredentials ?? 0} 
                    icon={AlertCircle} 
                    color="rose" 
                />
            </div>
        </div>
    );
};

export default AdminDashboard;
