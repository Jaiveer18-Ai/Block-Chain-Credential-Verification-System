import { Link } from 'react-router-dom';
import { ShieldCheck, Share2, Search, ArrowRight, Lock, CheckCircle, Fingerprint, Award, GraduationCap } from 'lucide-react';

const Home = () => {
    return (
        <div className="bg-slate-50 min-h-screen font-sans overflow-hidden relative">
            
            {/* Premium Grid Background */}
            <div className="absolute inset-0 bg-grid-pattern opacity-40 z-0"></div>

            {/* Dynamic Background Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-400 rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-blob z-0"></div>
            <div className="absolute top-[20%] right-[-5%] w-[500px] h-[500px] bg-indigo-400 rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-blob animation-delay-2000 z-0"></div>
            <div className="absolute -bottom-32 left-[20%] w-[700px] h-[700px] bg-sky-300 rounded-full mix-blend-multiply filter blur-[150px] opacity-20 animate-blob animation-delay-4000 z-0"></div>

            {/* Hero Section - Split Layout */}
            <div className="relative pt-20 pb-32 lg:pt-32 lg:pb-40 px-6 sm:px-10 lg:px-16 z-10 max-w-[1600px] mx-auto">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
                    
                    {/* Left Column: Typography & CTAs */}
                    <div className="flex-1 text-left max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-effect text-primary text-sm font-black border border-primary/20 shadow-sm mb-8 relative animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="absolute inset-0 rounded-full bg-blue-100 opacity-50 animate-pulse-slow"></div>
                            <ShieldCheck className="w-5 h-5 relative z-10" />
                            <span className="tracking-widest uppercase relative z-10">Polygon Smart Contracts</span>
                        </div>
                        
                        <h1 className="text-6xl md:text-7xl lg:text-[5.5rem] font-black text-slate-900 tracking-tighter leading-[1.1] mb-8 drop-shadow-sm">
                            Truth in a <br className="hidden md:block"/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary via-secondary to-sky-400">Trustless World</span>
                        </h1>
                        
                        <p className="text-xl md:text-2xl text-slate-600 mb-12 leading-relaxed font-medium max-w-2xl">
                            The universal standard for educational achievements. Mint, manage, and verify unforgeable credentials natively on the blockchain.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-5">
                            <Link to="/register" className="group w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl font-black text-lg transition-all hover:shadow-[0_0_40px_rgba(37,99,235,0.4)] flex items-center justify-center gap-3 transform hover:-translate-y-1">
                                Create Identity <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link to="/verify" className="w-full sm:w-auto px-10 py-5 bg-white text-slate-800 rounded-2xl font-black text-lg transition-all shadow-lg border border-slate-200 hover:border-primary/50 hover:bg-slate-50 flex items-center justify-center gap-3 transform hover:-translate-y-1">
                                Verify Context <Search className="w-6 h-6 text-primary" />
                            </Link>
                        </div>

                        <div className="mt-14 flex flex-wrap items-center gap-6 text-sm font-bold text-slate-500 uppercase tracking-wider">
                            <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-emerald-500" /> Immutable</div>
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                            <div className="flex items-center gap-2"><Fingerprint className="w-5 h-5 text-primary" /> Cryptographic</div>
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                            <div className="flex items-center gap-2"><Share2 className="w-5 h-5 text-secondary" /> Frictionless</div>
                        </div>
                    </div>

                    {/* Right Column: Visual Graphic / Floating Card */}
                    <div className="flex-1 relative w-full max-w-xl lg:max-w-none hidden md:block">
                        <div className="relative w-full aspect-square flex items-center justify-center">
                            {/* Main Floating Card */}
                            <div className="absolute z-20 w-[400px] h-[500px] glass-effect rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white glow-effect animate-float bg-gradient-to-br from-white/80 to-white/30 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-10">
                                        <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-lg flex items-center justify-center text-white">
                                            <Award className="w-8 h-8" />
                                        </div>
                                        <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase flex items-center gap-1 border border-emerald-200">
                                            <CheckCircle className="w-3 h-3" /> Valid
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="h-4 w-20 bg-slate-200 rounded-full"></div>
                                        <h3 className="text-3xl font-black text-slate-900 leading-tight">Master of Computer Science</h3>
                                        <p className="text-lg text-slate-500 font-medium">Global Tech University</p>
                                    </div>
                                </div>
                                
                                <div>
                                    <div className="p-4 bg-white/50 rounded-2xl border border-white/60 mb-4 backdrop-blur-md">
                                        <p className="text-xs text-slate-400 font-bold uppercase mb-1">Blockchain Hash</p>
                                        <p className="font-mono text-sm text-slate-700 truncate">0x8f3c9a...e4b21</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-200 rounded-full border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
                                            <GraduationCap className="w-6 h-6 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900">Alex Student</p>
                                            <p className="text-xs text-slate-500 font-bold">Issued: Oct 2025</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative Elements */}
                            <div className="absolute z-10 top-10 -right-10 w-40 h-40 bg-gradient-to-br from-sky-400 to-indigo-500 rounded-full mix-blend-multiply opacity-80 blur-2xl animate-pulse-slow"></div>
                            
                            <div className="absolute z-30 -bottom-10 -left-10 glass-effect p-5 rounded-2xl shadow-xl animate-float-reverse border border-white/60 flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900">Zero-Knowledge</p>
                                    <p className="text-xs font-bold text-slate-500">100% Privacy Retained</p>
                                </div>
                            </div>

                            <div className="absolute z-10 top-20 -left-20 glass-effect p-4 rounded-xl shadow-lg animate-float border border-white/60">
                                <Lock className="w-8 h-8 text-secondary" />
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Premium Features Section */}
            <div className="relative z-10 py-32 bg-slate-900 mt-20 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
                    <div className="text-center mb-20">
                        <h2 className="text-sm font-black text-sky-400 uppercase tracking-widest mb-4">The Infrastructure</h2>
                        <h3 className="text-4xl md:text-5xl font-black text-white drop-shadow-sm tracking-tight">Redefining Digital Trust</h3>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="p-10 rounded-[2rem] bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:bg-slate-800 transition-all duration-500 group transform hover:-translate-y-2 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-primary/40"></div>
                            <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mb-8 border border-blue-500/20 group-hover:scale-110 transition-transform">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-4">Cryptographic Issuance</h3>
                            <p className="text-slate-400 leading-relaxed font-medium">Institutions mint unbreakable cryptographic proofs on the Polygon blockchain, linking the PDF identity permanently to a unique transaction.</p>
                        </div>

                        {/* Feature 2 */}
                        <div className="p-10 rounded-[2rem] bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:bg-slate-800 transition-all duration-500 group transform hover:-translate-y-2 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-indigo-500/40"></div>
                            <div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mb-8 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                                <Share2 className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-4">Empowered Students</h3>
                            <p className="text-slate-400 leading-relaxed font-medium">Students manage a centralized digital wallet. Generate QR codes or direct links to prove qualifications instantly anywhere in the world.</p>
                        </div>

                        {/* Feature 3 */}
                        <div className="p-10 rounded-[2rem] bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:bg-slate-800 transition-all duration-500 group transform hover:-translate-y-2 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/20 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-sky-500/40"></div>
                            <div className="w-16 h-16 bg-sky-500/10 text-sky-400 rounded-2xl flex items-center justify-center mb-8 border border-sky-500/20 group-hover:scale-110 transition-transform">
                                <Search className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-4">Global Verification</h3>
                            <p className="text-slate-400 leading-relaxed font-medium">Employers can verify authenticity cryptographically without requesting transcripts or employing third-party background checkers.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
