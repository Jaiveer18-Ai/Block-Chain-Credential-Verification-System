import React, { useContext } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import { toast } from 'react-hot-toast';

const AdminLayout = () => {
    const { user, logout } = useContext(AuthContext);
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
        <div className="flex bg-[#0f0f14] min-h-screen text-[#e8e4df]">
            <AdminSidebar onLogout={handleLogout} />
            <main className="ml-72 flex-grow p-10 pt-14 h-screen overflow-y-auto">
                <div className="max-w-[1400px] mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
