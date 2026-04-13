import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Users, 
    Building2, 
    ShieldCheck, 
    UserPlus, 
    LogOut,
    Shield
} from 'lucide-react';

const AdminSidebar = ({ onLogout }) => {
    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
        { name: 'User Directory', icon: Users, path: '/admin/users' },
        { name: 'Registry Control', icon: ShieldCheck, path: '/admin/credentials' },
        { name: 'Admin Management', icon: UserPlus, path: '/admin/management' },
    ];

    return (
        <aside className="w-72 bg-[#1a1a24] border-r border-[#26262e] h-screen fixed left-0 top-0 z-50 flex flex-col pt-24 pb-10">
            <div className="px-8 mb-10">
                <div className="flex items-center gap-3 px-4 py-3 bg-primary/10 rounded-xl border border-primary/20">
                    <Shield className="w-5 h-5 text-primary" />
                    <span className="text-sm font-black text-white uppercase tracking-widest">Authority Root</span>
                </div>
            </div>

            <nav className="flex-grow px-4 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center gap-4 px-6 py-4 rounded-xl text-sm font-bold transition-all
                            ${isActive 
                                ? 'bg-primary text-[#0f0f14] shadow-lg shadow-primary/20' 
                                : 'text-[#a8a29e] hover:text-[#e8e4df] hover:bg-white/5'}
                        `}
                    >
                        <item.icon className="w-5 h-5" />
                        {item.name}
                    </NavLink>
                ))}
            </nav>

            <div className="px-4 mt-auto border-t border-[#26262e] pt-10">
                <button 
                    onClick={onLogout}
                    className="flex items-center gap-4 px-6 py-4 rounded-xl text-sm font-bold text-rose-400 hover:bg-rose-500/10 transition-all w-full"
                >
                    <LogOut className="w-5 h-5" />
                    Terminate Session
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
