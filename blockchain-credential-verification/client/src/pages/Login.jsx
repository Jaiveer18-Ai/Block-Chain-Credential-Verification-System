import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { LogIn, ShieldCheck } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { login, user } = useContext(AuthContext);
    const navigate = useNavigate();

    const { ref: formRef, isVisible: formVisible } = useScrollReveal({ threshold: 0.1 });

    useEffect(() => {
        if (user) {
            if (user.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/');
            }
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) return toast.error('Please fill all fields');
        
        const toastId = toast.loading('Establishing secure session...');
        try {
            setIsSubmitting(true);
            const data = await login(email, password);
            toast.success(`Welcome back, ${data.name}`, { id: toastId });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Authentication failed', { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen py-20 flex items-center justify-center relative bg-[#0f0f14] overflow-hidden px-4">
            {/* Premium Grid Background */}
            <div className="absolute inset-0 bg-grid-pattern opacity-30 z-0 pointer-events-none"></div>

            {/* Dynamic Background Blobs */}
            <div className="absolute inset-0 z-0 pointer-events-none animate-fade-in-up">
                <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-amber-500 rounded-full mix-blend-screen filter blur-[120px] opacity-10 animate-blob"></div>
                <div className="absolute bottom-[10%] right-[20%] w-[400px] h-[400px] bg-violet-500 rounded-full mix-blend-screen filter blur-[120px] opacity-10 animate-blob animation-delay-2000"></div>
            </div>

            <div 
                ref={formRef}
                className={`max-w-md w-full glass-effect rounded-[2.5rem] shadow-[0_20px_50px_rgba(212,160,83,0.08)] border border-[#d4a053]/15 relative z-10 mx-auto reveal-hidden ${formVisible ? 'animate-scale-up' : ''}`}
            >
                <div className="p-10">
                    <div className="text-center mb-10">
                        <div className={`bg-gradient-to-br from-primary to-secondary p-4 rounded-2xl inline-flex mb-6 shadow-lg text-[#0f0f14] reveal-hidden ${formVisible ? 'animate-fade-in-up delay-100' : ''}`}>
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <h2 className={`text-3xl font-black text-[#e8e4df] drop-shadow-sm tracking-tight reveal-hidden ${formVisible ? 'animate-fade-in-up delay-200' : ''}`}>Welcome Back</h2>
                        <p className={`text-[#a8a29e] mt-2 font-medium reveal-hidden ${formVisible ? 'animate-fade-in-up delay-300' : ''}`}>Log in to manage your cryptographic credentials</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className={`reveal-hidden ${formVisible ? 'animate-fade-in-up delay-400' : ''}`}>
                            <label className="block text-sm font-bold text-[#e8e4df] mb-2">Email Address</label>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-5 py-4 rounded-xl bg-[#0f0f14]/70 border border-[#2a2a34] focus:bg-[#0f0f14] focus:ring-4 focus:ring-primary/20 focus:border-primary transition outline-none text-[#e8e4df] shadow-sm placeholder-[#57534e]"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div className={`reveal-hidden ${formVisible ? 'animate-fade-in-up delay-500' : ''}`}>
                            <label className="block text-sm font-bold text-[#e8e4df] mb-2">Password</label>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-5 py-4 rounded-xl bg-[#0f0f14]/70 border border-[#2a2a34] focus:bg-[#0f0f14] focus:ring-4 focus:ring-primary/20 focus:border-primary transition outline-none text-[#e8e4df] shadow-sm placeholder-[#57534e]"
                                placeholder="••••••••"
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className={`w-full py-4 px-4 bg-gradient-to-r from-primary to-[#b8862e] hover:from-[#b8862e] hover:to-primary text-[#0f0f14] font-black text-lg rounded-xl shadow-[0_0_20px_rgba(212,160,83,0.3)] hover:shadow-[0_0_30px_rgba(212,160,83,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-1 mt-4 reveal-hidden ${formVisible ? 'animate-slide-up delay-[600ms]' : ''}`}
                            style={{ animationName: formVisible ? 'fadeInUp' : 'none', animationDuration: '0.8s', animationFillMode: 'forwards' }}
                        >
                            {isSubmitting ? 'Logging in...' : <><LogIn className="w-6 h-6" /> Sign In</>}
                        </button>
                    </form>

                    <div className={`mt-8 text-center text-sm font-bold text-[#57534e] border-t border-[#2a2a34] pt-6 reveal-hidden ${formVisible ? 'animate-fade-in-up delay-[700ms]' : ''}`}>
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
