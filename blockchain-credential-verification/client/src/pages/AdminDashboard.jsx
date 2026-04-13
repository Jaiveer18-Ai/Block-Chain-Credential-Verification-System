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

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/admin/stats');
                setStats(data);
            } catch (err) {
                console.error('Failed to load stats');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="animate-pulse flex items-center justify-center min-h-[400px]">
        <Activity className="w-12 h-12 text-primary animate-spin" />
    </div>;

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
                    value={stats?.totalUsers} 
                    icon={Users} 
                    color="primary" 
                />
                <StatCard 
                    title="Active Sessions" 
                    value={stats?.activeUsers} 
                    icon={Activity} 
                    color="emerald" 
                />
                <StatCard 
                    title="Institutions" 
                    value={stats?.totalInstitutions} 
                    icon={Building2} 
                    color="sky" 
                />
                <StatCard 
                    title="Student Profiles" 
                    value={stats?.totalStudents} 
                    icon={GraduationCap} 
                    color="violet" 
                />
                <StatCard 
                    title="Minted Records" 
                    value={stats?.totalCredentials} 
                    icon={ShieldCheck} 
                    color="amber" 
                />
                <StatCard 
                    title="Revoked Assets" 
                    value={stats?.revokedCredentials} 
                    icon={AlertCircle} 
                    color="rose" 
                />
            </div>
        </div>
    );
};

export default AdminDashboard;
