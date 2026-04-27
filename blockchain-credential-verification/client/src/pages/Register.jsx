import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { UserPlus, Wallet } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student',
        institutionName: ''
    });
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { register, user } = useContext(AuthContext);
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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            return toast.error('Passwords do not match');
        }

        try {
            setIsSubmitting(true);
            await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                institutionName: formData.institutionName
            });
            toast.success('Registration successful!');
        } catch (err) {
            console.error('Registration detailed error:', err);
            let errorMessage = 'Registration failed';
            
            if (err.code === 'ECONNABORTED') {
                errorMessage = 'Connection timed out. The server is responding slowly. Please try again.';
            } else if (err.code === 'ERR_NETWORK') {
                errorMessage = 'Network Error: Check your internet connection. (Is the laptop server running?)';
            } else if (err.response) {
                const data = err.response.data;
                // Extract message from various possible error formats
                const rawMsg = data.message || data.error || data;
                errorMessage = typeof rawMsg === 'string' ? rawMsg : JSON.stringify(rawMsg);
            } else {
                errorMessage = err.message || 'An unexpected error occurred during registration';
            }
            
            // Final safety check to ensure we never show [object Object]
            if (typeof errorMessage !== 'string' || errorMessage.includes('[object Object]')) {
                errorMessage = 'An internal error occurred. Please check your data and try again.';
            }
            
            toast.error(errorMessage, { duration: 8000 });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen py-16 flex items-center justify-center relative bg-[#0f0f14] overflow-hidden px-4">
             {/* Premium Grid Background */}
             <div className="absolute inset-0 bg-grid-pattern opacity-30 z-0 pointer-events-none"></div>

             {/* Dynamic Background Blobs */}
             <div className="absolute inset-0 z-0 pointer-events-none animate-fade-in-up">
                 <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-violet-500 rounded-full mix-blend-screen filter blur-[120px] opacity-10 animate-blob"></div>
                 <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-emerald-500 rounded-full mix-blend-screen filter blur-[120px] opacity-8 animate-blob animation-delay-4000"></div>
             </div>

            <div 
                ref={formRef}
                className={`max-w-xl w-full glass-effect rounded-[2.5rem] shadow-[0_20px_50px_rgba(212,160,83,0.08)] border border-[#d4a053]/15 relative z-10 mx-auto reveal-hidden ${formVisible ? 'animate-scale-up' : ''}`}
            >
                <div className="p-10">
                    <div className="text-center mb-10">
                        <div className={`bg-gradient-to-br from-secondary to-accent p-4 rounded-2xl inline-flex mb-6 shadow-lg text-[#0f0f14] reveal-hidden ${formVisible ? 'animate-fade-in-up delay-100' : ''}`}>
                            <Wallet className="w-8 h-8" />
                        </div>
                        <h2 className={`text-3xl font-black text-[#e8e4df] drop-shadow-sm tracking-tight reveal-hidden ${formVisible ? 'animate-fade-in-up delay-200' : ''}`}>Create Identity</h2>
                        <p className={`text-[#a8a29e] mt-2 font-medium reveal-hidden ${formVisible ? 'animate-fade-in-up delay-300' : ''}`}>Register your institutional or student wallet profile</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Role Selection */}
                        <div className={`flex bg-[#0f0f14]/50 rounded-xl p-1 shadow-inner border border-[#2a2a34] backdrop-blur-sm reveal-hidden ${formVisible ? 'animate-fade-in-up delay-400' : ''}`}>
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, role: 'student'})}
                                className={`flex-1 py-3 text-sm font-black rounded-lg transition-all ${formData.role === 'student' ? 'bg-primary shadow-md text-[#0f0f14] scale-[1.02]' : 'text-[#57534e] hover:text-[#a8a29e]'}`}
                            >
                                Student
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, role: 'institution'})}
                                className={`flex-1 py-3 text-sm font-black rounded-lg transition-all ${formData.role === 'institution' ? 'bg-primary shadow-md text-[#0f0f14] scale-[1.02]' : 'text-[#57534e] hover:text-[#a8a29e]'}`}
                            >
                                Institution
                            </button>
                        </div>

                        <div className={`reveal-hidden ${formVisible ? 'animate-fade-in-up delay-500' : ''}`}>
                            <label className="block text-sm font-bold text-[#e8e4df] mb-2">Full Name</label>
                            <input 
                                type="text" name="name" required
                                value={formData.name} onChange={handleChange}
                                className="w-full px-5 py-4 rounded-xl bg-[#0f0f14]/70 border border-[#2a2a34] focus:bg-[#0f0f14] focus:ring-4 focus:ring-primary/20 focus:border-primary transition outline-none text-[#e8e4df] shadow-sm placeholder-[#57534e]"
                            />
                        </div>

                        {formData.role === 'institution' && (
                            <div className="animate-fade-in-up">
                                <label className="block text-sm font-bold text-[#e8e4df] mb-2">Registered Institution Name</label>
                                <input 
                                    type="text" name="institutionName" required
                                    value={formData.institutionName} onChange={handleChange}
                                    className="w-full px-5 py-4 rounded-xl bg-[#0f0f14]/70 border border-[#2a2a34] focus:bg-[#0f0f14] focus:ring-4 focus:ring-primary/20 focus:border-primary transition outline-none text-[#e8e4df] shadow-sm placeholder-[#57534e]"
                                />
                            </div>
                        )}

                        <div className={`reveal-hidden ${formVisible ? 'animate-fade-in-up delay-[600ms]' : ''}`}>
                            <label className="block text-sm font-bold text-[#e8e4df] mb-2">Email Address</label>
                            <input 
                                type="email" name="email" required
                                value={formData.email} onChange={handleChange}
                                className="w-full px-5 py-4 rounded-xl bg-[#0f0f14]/70 border border-[#2a2a34] focus:bg-[#0f0f14] focus:ring-4 focus:ring-primary/20 focus:border-primary transition outline-none text-[#e8e4df] shadow-sm placeholder-[#57534e]"
                            />
                        </div>

                        <div className={`grid grid-cols-2 gap-4 reveal-hidden ${formVisible ? 'animate-fade-in-up delay-[700ms]' : ''}`}>
                            <div>
                                <label className="block text-sm font-bold text-[#e8e4df] mb-2">Secure Password</label>
                                <input 
                                    type="password" name="password" required minLength="6"
                                    value={formData.password} onChange={handleChange}
                                    className="w-full px-5 py-4 rounded-xl bg-[#0f0f14]/70 border border-[#2a2a34] focus:bg-[#0f0f14] focus:ring-4 focus:ring-primary/20 focus:border-primary transition outline-none text-[#e8e4df] shadow-sm placeholder-[#57534e]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[#e8e4df] mb-2">Confirm Key</label>
                                <input 
                                    type="password" name="confirmPassword" required minLength="6"
                                    value={formData.confirmPassword} onChange={handleChange}
                                    className="w-full px-5 py-4 rounded-xl bg-[#0f0f14]/70 border border-[#2a2a34] focus:bg-[#0f0f14] focus:ring-4 focus:ring-primary/20 focus:border-primary transition outline-none text-[#e8e4df] shadow-sm placeholder-[#57534e]"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className={`w-full py-4 px-4 bg-gradient-to-r from-primary to-[#b8862e] hover:from-[#b8862e] hover:to-primary text-[#0f0f14] font-black text-lg rounded-xl shadow-[0_0_20px_rgba(212,160,83,0.3)] hover:shadow-[0_0_30px_rgba(212,160,83,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-1 mt-6 reveal-hidden ${formVisible ? 'animate-fade-in-up delay-[800ms]' : ''}`}
                        >
                            {isSubmitting ? 'Generating...' : <><UserPlus className="w-6 h-6" /> Register Identity</>}
                        </button>
                    </form>

                    <div className={`mt-8 text-center text-sm font-bold text-[#57534e] border-t border-[#2a2a34] pt-6 reveal-hidden ${formVisible ? 'animate-fade-in-up delay-[900ms]' : ''}`}>
                        Already have access?{' '}
                        <Link to="/login" className="text-primary hover:text-secondary transition underline underline-offset-4">
                            Log in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
