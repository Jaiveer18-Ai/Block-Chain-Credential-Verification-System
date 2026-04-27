import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheck, Menu, X, LogOut, User as UserIcon } from 'lucide-react';
import ProfileModal from './ProfileModal';
import { toast } from 'react-hot-toast';

import logo from '../assets/logo.png';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const handleLogout = () => {
        const toastId = toast.loading('Terminating secure session...');
        
        // Brief delay for premium feel and feedback
        setTimeout(() => {
            navigate('/'); // Navigate to public home first so ProtectedRoute doesn't trigger
            logout();      // Then clear the session
            toast.success('Logged out successfully', { id: toastId });
        }, 400);
    };

    return (
        <>
        <nav className="bg-[#0f0f14]/80 backdrop-blur-xl sticky top-0 z-50 border-b border-[#d4a053]/10 shadow-sm">
            <div className="w-full px-6 sm:px-10 lg:px-16">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full animate-pulse-slow"></div>
                                <img src={logo} alt="BlockCred Logo" className="h-9 w-9 relative z-10 drop-shadow-2xl" />
                            </div>
                            <span className="font-black text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary uppercase">
                                BlockCred
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-6">
                        <Link to="/" className="text-[#a8a29e] hover:text-primary transition-colors font-medium">Home</Link>
                        <Link to="/verify" className="text-[#a8a29e] hover:text-primary transition-colors font-medium">Verify</Link>
                        {user ? (
                            <>
                                <Link 
                                    to={user.role === 'institution' ? '/institution/dashboard' : '/student/dashboard'} 
                                    className="text-[#a8a29e] hover:text-primary transition-colors font-medium"
                                >
                                    Dashboard
                                </Link>
                                <div className="flex items-center gap-4 ml-4 pl-4 border-l border-[#d4a053]/20">
                                    <button 
                                        onClick={() => setIsProfileOpen(true)}
                                        className="flex items-center gap-2 text-sm text-[#a8a29e] bg-[#1a1a24] px-3 py-1.5 rounded-full border border-[#d4a053]/10 hover:border-primary/40 hover:text-[#e8e4df] transition-all cursor-pointer group"
                                        title="Open Profile"
                                    >
                                        {user.avatar ? (
                                            <img src={user.avatar} alt="avatar" className="w-5 h-5 rounded-full object-cover" />
                                        ) : (
                                            <UserIcon className="w-4 h-4 group-hover:text-primary transition-colors" />
                                        )}
                                        <span className="truncate max-w-[100px]">{user.name}</span>
                                    </button>
                                    <button 
                                        onClick={handleLogout}
                                        className="flex items-center gap-1 text-rose-400 hover:text-rose-300 font-medium transition"
                                    >
                                        <LogOut className="w-4 h-4" /> Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link to="/login" className="text-[#a8a29e] hover:text-primary font-medium transition-colors">Login</Link>
                                <Link to="/register" className="bg-gradient-to-r from-primary to-[#b8862e] text-[#0f0f14] px-6 py-2.5 rounded-full font-bold transition-all shadow-lg hover:shadow-[0_0_20px_rgba(212,160,83,0.4)] transform hover:-translate-y-0.5 border border-[#d4a053]/30">
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center md:hidden">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-[#a8a29e] hover:text-primary">
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Open */}
            {isOpen && (
                <div className="md:hidden bg-surface border-b border-[#d4a053]/10 shadow-lg absolute w-full">
                    <div className="px-4 pt-2 pb-6 space-y-2">
                        <Link to="/" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-[#a8a29e] hover:text-primary hover:bg-[#1a1a24]">Home</Link>
                        <Link to="/verify" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-[#a8a29e] hover:text-primary hover:bg-[#1a1a24]">Verify Credential</Link>
                        {user ? (
                            <>
                                <Link to={user.role === 'institution' ? '/institution/dashboard' : '/student/dashboard'} onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-[#a8a29e] hover:text-primary hover:bg-[#1a1a24]">Dashboard</Link>
                                <button onClick={() => { setIsProfileOpen(true); setIsOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-primary hover:bg-primary/10">My Profile</button>
                                <button onClick={() => { handleLogout(); setIsOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-rose-400 hover:bg-rose-500/10">Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-[#a8a29e] hover:bg-[#1a1a24]">Login</Link>
                                <Link to="/register" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium bg-primary text-[#0f0f14] mt-4 text-center">Get Started</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>

        {/* Profile Modal */}
        <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        </>
    );
};

export default Navbar;
