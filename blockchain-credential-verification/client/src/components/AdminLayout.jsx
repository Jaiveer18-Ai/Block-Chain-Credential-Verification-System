import React, { useContext } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import { toast } from 'react-hot-toast';

import { Menu, X } from 'lucide-react';

const AdminLayout = () => {
    const { user, logout } = useContext(AuthContext);
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        const toastId = toast.loading('Terminating administration root...');
        setTimeout(() => {
            navigate('/'); // Navigate to public home first
            logout();      // Then clear the session
            toast.success('Admin session ended securely', { id: toastId });
        }, 400);
    };

    // RBAC: Only allow if authenticated and role is admin
    if (!user || user.role !== 'admin') {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="bg-[#0f0f14] min-h-screen text-[#e8e4df]">
            {/* Mobile Header */}
            <header className="md:hidden fixed top-0 left-0 right-0 z-[60] bg-[#1a1a24]/80 backdrop-blur-xl border-b border-[#26262e] px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                        <Menu 
                            className="w-6 h-6 text-primary cursor-pointer" 
                            onClick={() => setIsSidebarOpen(true)}
                        />
                    </div>
                </div>
                <span className="text-xs font-black text-white uppercase tracking-widest">Authority Root</span>
            </header>

            <div className="flex">
                <AdminSidebar 
                    isOpen={isSidebarOpen} 
                    onClose={() => setIsSidebarOpen(false)} 
                    onLogout={handleLogout} 
                />
                
                {/* Backdrop for mobile */}
                {isSidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] md:hidden transition-all duration-300"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                <main className="flex-grow p-6 md:p-10 pt-24 md:pt-14 h-screen overflow-y-auto ml-0 md:ml-72 transition-all duration-300">
                    <div className="max-w-[1400px] mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
