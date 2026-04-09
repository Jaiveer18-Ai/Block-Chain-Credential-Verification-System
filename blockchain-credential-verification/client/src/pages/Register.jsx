import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { UserPlus, Wallet } from 'lucide-react';

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

    useEffect(() => {
        if (user) {
            navigate(user.role === 'institution' ? '/institution/dashboard' : '/student/dashboard');
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
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen py-16 flex items-center justify-center relative bg-slate-900 overflow-hidden px-4">
             {/* Dynamic Background */}
             <div className="absolute top-[10%] left-[-20%] w-[500px] h-[500px] bg-secondary rounded-full mix-blend-screen filter blur-[120px] opacity-60 animate-blob"></div>
             <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-sky-500 rounded-full mix-blend-screen filter blur-[120px] opacity-50 animate-blob animation-delay-4000"></div>

            <div className="max-w-xl w-full glass-effect rounded-3xl shadow-2xl relative z-10 mx-auto animate-in fade-in slide-in-from-bottom-10 duration-700">
                <div className="p-10">
                    <div className="text-center mb-10">
                        <div className="bg-white/20 p-3 rounded-full inline-block mb-4 shadow-inner">
                            <Wallet className="w-10 h-10 text-primary" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 drop-shadow-sm tracking-tight">Create Identity</h2>
                        <p className="text-slate-700 mt-2 font-medium">Register your institutional or student wallet profile</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Role Selection */}
                        <div className="flex bg-white/50 rounded-xl p-1 shadow-inner border border-white/40 backdrop-blur-sm">
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, role: 'student'})}
                                className={`flex-1 py-3 text-sm font-black rounded-lg transition-all ${formData.role === 'student' ? 'bg-primary shadow-md text-white scale-[1.02]' : 'text-slate-700 hover:text-slate-900'}`}
                            >
                                Student
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, role: 'institution'})}
                                className={`flex-1 py-3 text-sm font-black rounded-lg transition-all ${formData.role === 'institution' ? 'bg-primary shadow-md text-white scale-[1.02]' : 'text-slate-700 hover:text-slate-900'}`}
                            >
                                Institution
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-800 mb-2">Full Name</label>
                            <input 
                                type="text" name="name" required
                                value={formData.name} onChange={handleChange}
                                className="w-full px-5 py-4 rounded-xl bg-white/70 border border-white/50 focus:bg-white focus:ring-4 focus:ring-primary/30 focus:border-primary transition outline-none text-slate-900 shadow-sm"
                            />
                        </div>

                        {formData.role === 'institution' && (
                            <div className="animate-in fade-in zoom-in-95 duration-300">
                                <label className="block text-sm font-bold text-slate-800 mb-2">Registered Institution Name</label>
                                <input 
                                    type="text" name="institutionName" required
                                    value={formData.institutionName} onChange={handleChange}
                                    className="w-full px-5 py-4 rounded-xl bg-white/70 border border-white/50 focus:bg-white focus:ring-4 focus:ring-primary/30 focus:border-primary transition outline-none text-slate-900 shadow-sm"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-slate-800 mb-2">Email Address</label>
                            <input 
                                type="email" name="email" required
                                value={formData.email} onChange={handleChange}
                                className="w-full px-5 py-4 rounded-xl bg-white/70 border border-white/50 focus:bg-white focus:ring-4 focus:ring-primary/30 focus:border-primary transition outline-none text-slate-900 shadow-sm"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-800 mb-2">Secure Password</label>
                                <input 
                                    type="password" name="password" required minLength="6"
                                    value={formData.password} onChange={handleChange}
                                    className="w-full px-5 py-4 rounded-xl bg-white/70 border border-white/50 focus:bg-white focus:ring-4 focus:ring-primary/30 focus:border-primary transition outline-none text-slate-900 shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-800 mb-2">Confirm Key</label>
                                <input 
                                    type="password" name="confirmPassword" required minLength="6"
                                    value={formData.confirmPassword} onChange={handleChange}
                                    className="w-full px-5 py-4 rounded-xl bg-white/70 border border-white/50 focus:bg-white focus:ring-4 focus:ring-primary/30 focus:border-primary transition outline-none text-slate-900 shadow-sm"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full py-4 px-4 bg-gradient-to-r from-primary to-secondary hover:from-primary hover:to-primary text-white font-black text-lg rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-1 mt-6"
                        >
                            {isSubmitting ? 'Generating Wallet...' : <><UserPlus className="w-6 h-6" /> Register Identity</>}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm font-bold text-slate-700 border-t border-slate-300 pt-6">
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
