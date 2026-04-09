import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheck, Menu, X, LogOut, User as UserIcon } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 border-b border-white/10 shadow-sm">
            <div className="w-full px-6 sm:px-10 lg:px-16">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-2">
                            <ShieldCheck className="h-8 w-8 text-primary" />
                            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                                BlockCred
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-6">
                        <Link to="/" className="text-slate-300 hover:text-white transition-colors font-medium">Home</Link>
                        <Link to="/verify" className="text-slate-300 hover:text-white transition-colors font-medium">Verify</Link>
                        {user ? (
                            <>
                                <Link 
                                    to={user.role === 'institution' ? '/institution/dashboard' : '/student/dashboard'} 
                                    className="text-slate-300 hover:text-white transition-colors font-medium"
                                >
                                    Dashboard
                                </Link>
                                <div className="flex items-center gap-4 ml-4 pl-4 border-l border-slate-200">
                                    <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                                        <UserIcon className="w-4 h-4" />
                                        <span className="truncate max-w-[100px]">{user.name}</span>
                                    </div>
                                    <button 
                                        onClick={handleLogout}
                                        className="flex items-center gap-1 text-red-500 hover:text-red-700 font-medium transition"
                                    >
                                        <LogOut className="w-4 h-4" /> Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link to="/login" className="text-slate-300 hover:text-white font-medium transition-colors">Login</Link>
                                <Link to="/register" className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-lg hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transform hover:-translate-y-0.5 border border-blue-400/20">
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center md:hidden">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-slate-300 hover:text-white">
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Open */}
            {isOpen && (
                <div className="md:hidden bg-surface border-b border-slate-200 shadow-lg absolute w-full">
                    <div className="px-4 pt-2 pb-6 space-y-2">
                        <Link to="/" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-primary hover:bg-slate-50">Home</Link>
                        <Link to="/verify" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-primary hover:bg-slate-50">Verify Credential</Link>
                        {user ? (
                            <>
                                <Link to={user.role === 'institution' ? '/institution/dashboard' : '/student/dashboard'} onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-primary hover:bg-slate-50">Dashboard</Link>
                                <button onClick={() => { handleLogout(); setIsOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50">Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50">Login</Link>
                                <Link to="/register" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium bg-primary text-white mt-4 text-center">Get Started</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
