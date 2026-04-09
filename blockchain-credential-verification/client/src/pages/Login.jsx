import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { LogIn, ShieldCheck } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { login, user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate(user.role === 'institution' ? '/institution/dashboard' : '/student/dashboard');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) return toast.error('Please fill all fields');
        
        try {
            setIsSubmitting(true);
            await login(email, password);
            toast.success('Logged in successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen py-20 flex items-center justify-center relative bg-slate-900 overflow-hidden px-4">
            {/* Dynamic Background */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary rounded-full mix-blend-screen filter blur-[100px] opacity-60 animate-blob"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-secondary rounded-full mix-blend-screen filter blur-[100px] opacity-60 animate-blob animation-delay-2000"></div>

            <div className="max-w-md w-full glass-effect rounded-3xl shadow-2xl relative z-10 mx-auto animate-in fade-in zoom-in-95 duration-700">
                <div className="p-10">
                    <div className="text-center mb-10">
                        <div className="bg-white/20 p-3 rounded-full inline-block mb-4 shadow-inner">
                            <ShieldCheck className="w-10 h-10 text-primary" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 drop-shadow-sm tracking-tight">Welcome Back</h2>
                        <p className="text-slate-700 mt-2 font-medium">Log in to manage your cryptographic credentials</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-800 mb-2">Email Address</label>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-5 py-4 rounded-xl bg-white/70 border border-white/50 focus:bg-white focus:ring-4 focus:ring-primary/30 focus:border-primary transition outline-none text-slate-900 shadow-sm"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-800 mb-2">Password</label>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-5 py-4 rounded-xl bg-white/70 border border-white/50 focus:bg-white focus:ring-4 focus:ring-primary/30 focus:border-primary transition outline-none text-slate-900 shadow-sm"
                                placeholder="••••••••"
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full py-4 px-4 bg-gradient-to-r from-primary to-secondary hover:from-primary hover:to-primary text-white font-black text-lg rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-1 mt-4"
                        >
                            {isSubmitting ? 'Logging in...' : <><LogIn className="w-6 h-6" /> Sign In</>}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm font-bold text-slate-700 border-t border-slate-300 pt-6">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary hover:text-secondary transition underline underline-offset-4">
                            Register now
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
