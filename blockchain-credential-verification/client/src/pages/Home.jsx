import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Share2, Search, ArrowRight, Lock, CheckCircle, Fingerprint, Award, GraduationCap, Building, Link as LinkIcon, Globe, QrCode, Wallet } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
    const { user } = useContext(AuthContext);

    // Initial Load Refs
    const { ref: heroBgRef, isVisible: heroBgVisible } = useScrollReveal({ threshold: 0 });
    const { ref: heroHeaderRef, isVisible: heroHeaderVisible } = useScrollReveal({ threshold: 0.1 });
    const { ref: heroButtonsRef, isVisible: heroButtonsVisible } = useScrollReveal({ threshold: 0.1 });
    const { ref: heroBadgesRef, isVisible: heroBadgesVisible } = useScrollReveal({ threshold: 0.1 });
    const { ref: heroCardRef, isVisible: heroCardVisible } = useScrollReveal({ threshold: 0.1 });
    
    // How It Works Refs
    const { ref: hwHeadRef, isVisible: hwHeadVisible } = useScrollReveal({ threshold: 0.2 });
    const { ref: hwStep1Ref, isVisible: hwStep1Visible } = useScrollReveal({ threshold: 0.3 });
    const { ref: hwStep2Ref, isVisible: hwStep2Visible } = useScrollReveal({ threshold: 0.3 });
    const { ref: hwStep3Ref, isVisible: hwStep3Visible } = useScrollReveal({ threshold: 0.3 });

    // Scroll Features Refs
    const { ref: featuresHeadRef, isVisible: featuresHeadVisible } = useScrollReveal({ threshold: 0.2 });
    const { ref: feature1Ref, isVisible: feature1Visible } = useScrollReveal({ threshold: 0.2 });
    const { ref: feature2Ref, isVisible: feature2Visible } = useScrollReveal({ threshold: 0.2 });
    const { ref: feature3Ref, isVisible: feature3Visible } = useScrollReveal({ threshold: 0.2 });

    // Parallax Effect
    const [scrollY, setScrollY] = useState(0);
    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="bg-[#0f0f14] min-h-screen font-sans overflow-hidden relative">
            
            {/* Premium Grid Background */}
            <div className="absolute inset-0 bg-grid-pattern opacity-30 z-0 pointer-events-none"></div>

            {/* Dynamic Background Blobs */}
            <div ref={heroBgRef} className={`absolute inset-0 z-0 pointer-events-none reveal-hidden ${heroBgVisible ? 'animate-fade-in-up' : ''}`}>
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-amber-500 rounded-full mix-blend-screen filter blur-[120px] opacity-10 animate-blob"></div>
                <div className="absolute top-[20%] right-[-5%] w-[500px] h-[500px] bg-violet-500 rounded-full mix-blend-screen filter blur-[120px] opacity-10 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-32 left-[20%] w-[700px] h-[700px] bg-emerald-500 rounded-full mix-blend-screen filter blur-[150px] opacity-8 animate-blob animation-delay-4000"></div>
            </div>

            {/* Hero Section - Split Layout */}
            <div className="relative pt-10 pb-24 lg:pt-16 lg:pb-32 px-6 sm:px-10 lg:px-16 z-10 max-w-[1600px] mx-auto">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
                    
                    {/* Left Column: Typography & CTAs */}
                    <div className="flex-1 text-left max-w-3xl">
                        
                        <div ref={heroHeaderRef}>
                            <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-effect text-primary text-sm font-black border border-primary/20 shadow-sm mb-8 relative reveal-hidden ${heroHeaderVisible ? 'animate-fade-in-up' : ''}`}>
                                <div className="absolute inset-0 rounded-full bg-amber-900/30 opacity-50 animate-pulse-slow"></div>
                                <ShieldCheck className="w-5 h-5 relative z-10 text-accent" />
                                <span className="tracking-widest uppercase relative z-10">Polygon Smart Contracts</span>
                            </div>
                            
                            <h1 className={`text-6xl md:text-7xl lg:text-[5.5rem] font-black text-[#e8e4df] tracking-tighter leading-[1.1] mb-8 drop-shadow-sm reveal-hidden ${heroHeaderVisible ? 'animate-fade-in-up delay-100' : ''}`}>
                                Truth in a <br className="hidden md:block"/>
                                <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary via-secondary to-accent">Trustless World</span>
                            </h1>
                            
                            <p className={`text-xl md:text-2xl text-[#a8a29e] mb-12 leading-relaxed font-medium max-w-2xl reveal-hidden ${heroHeaderVisible ? 'animate-fade-in-up delay-200' : ''}`}>
                                The universal standard for educational achievements. Mint, manage, and verify unforgeable credentials natively on the blockchain.
                            </p>
                        </div>
                        
                        <div ref={heroButtonsRef} className="flex flex-col sm:flex-row items-center gap-5">
                            {/* Primary CTA — role-aware */}
                            <div className={`w-full sm:w-auto reveal-hidden ${heroButtonsVisible ? 'animate-slide-left delay-300' : ''}`}>
                                {user?.role === 'student' ? (
                                    <Link to="/student/dashboard" className="group w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-primary to-[#b8862e] text-[#0f0f14] rounded-2xl font-black text-lg transition-all hover:shadow-[0_0_30px_rgba(212,160,83,0.4)] flex items-center justify-center gap-3 transform hover:-translate-y-2 hover:scale-[1.02] duration-300">
                                        My Credentials <Wallet className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                                    </Link>
                                ) : user?.role === 'institution' ? (
                                    <Link to="/institution/issue" className="group w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-primary to-[#b8862e] text-[#0f0f14] rounded-2xl font-black text-lg transition-all hover:shadow-[0_0_30px_rgba(212,160,83,0.4)] flex items-center justify-center gap-3 transform hover:-translate-y-2 hover:scale-[1.02] duration-300">
                                        Issue Credential <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
                                    </Link>
                                ) : (
                                    <Link to="/register" className="group w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-primary to-[#b8862e] text-[#0f0f14] rounded-2xl font-black text-lg transition-all hover:shadow-[0_0_30px_rgba(212,160,83,0.4)] flex items-center justify-center gap-3 transform hover:-translate-y-2 hover:scale-[1.02] duration-300">
                                        Create Identity <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
                                    </Link>
                                )}
                            </div>

                            {/* Secondary CTA */}
                            <div className={`w-full sm:w-auto reveal-hidden ${heroButtonsVisible ? 'animate-slide-right delay-300' : ''}`}>
                                <Link to="/verify" className="group w-full sm:w-auto px-10 py-5 bg-[#1a1a24] text-[#e8e4df] rounded-2xl font-black text-lg transition-all shadow-lg border border-[#2a2a34] hover:border-primary/50 hover:bg-[#2a2a34] flex items-center justify-center gap-3 transform hover:-translate-y-2 hover:scale-[1.02] duration-300">
                                    Verify Context <Search className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                                </Link>
                            </div>
                        </div>

                        <div ref={heroBadgesRef} className="mt-14 flex flex-wrap items-center gap-6 text-sm font-bold text-[#a8a29e] uppercase tracking-wider">
                            <div className={`flex items-center gap-2 reveal-hidden ${heroBadgesVisible ? 'animate-fade-in-up delay-400' : ''}`}>
                                <CheckCircle className="w-5 h-5 text-accent" /> Immutable
                            </div>
                            <div className={`w-1.5 h-1.5 rounded-full bg-[#3d3624] reveal-hidden ${heroBadgesVisible ? 'animate-scale-up delay-400' : ''}`}></div>
                            <div className={`flex items-center gap-2 reveal-hidden ${heroBadgesVisible ? 'animate-fade-in-up delay-500' : ''}`}>
                                <Fingerprint className="w-5 h-5 text-primary" /> Cryptographic
                            </div>
                            <div className={`w-1.5 h-1.5 rounded-full bg-[#3d3624] reveal-hidden ${heroBadgesVisible ? 'animate-scale-up delay-500' : ''}`}></div>
                            <div className={`flex items-center gap-2 reveal-hidden ${heroBadgesVisible ? 'animate-fade-in-up delay-[600ms]' : ''}`}>
                                <Share2 className="w-5 h-5 text-secondary" /> Frictionless
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Visual Graphic / Floating Card */}
                    <div ref={heroCardRef} className="flex-1 relative w-full max-w-xl lg:max-w-none md:block mt-16 lg:mt-0">
                        <div className={`relative w-full aspect-square flex items-center justify-center reveal-hidden ${heroCardVisible ? 'animate-scale-up delay-200' : ''}`}>
                            
                            {/* Main Floating Card */}
                            <div className="absolute z-20 w-[400px] h-[500px] glass-effect rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(212,160,83,0.1)] border border-[#d4a053]/20 glow-effect animate-float bg-gradient-to-br from-[#1a1a24]/80 to-[#0f0f14]/50 flex flex-col justify-between hover:shadow-[0_30px_60px_rgba(212,160,83,0.25)] transition-shadow duration-500 hover:-translate-y-2">
                                <div>
                                    <div className="flex justify-between items-start mb-10">
                                        <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-lg flex items-center justify-center text-[#0f0f14] relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                            <Award className="w-8 h-8" />
                                        </div>
                                        <div className={`bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase flex items-center gap-1 border border-emerald-500/20 ${heroCardVisible ? 'animate-seal delay-[800ms]' : ''}`}>
                                            <CheckCircle className="w-3 h-3 text-emerald-400" /> Valid
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="h-4 w-20 bg-[#2a2a34] rounded-full"></div>
                                        <h3 className="text-3xl font-black text-[#e8e4df] leading-tight">Master of Computer Science</h3>
                                        <p className="text-lg text-[#a8a29e] font-medium">Global Tech University</p>
                                    </div>
                                </div>
                                
                                <div>
                                    <div className="p-4 bg-[#0f0f14]/50 rounded-2xl border border-[#2a2a34] mb-4 backdrop-blur-md group hover:bg-[#0f0f14]/70 transition-colors duration-300">
                                        <p className="text-xs text-[#57534e] font-bold uppercase mb-1">Blockchain Hash</p>
                                        <p className="font-mono text-sm text-[#a8a29e] truncate group-hover:text-primary transition-colors">0x8f3c9a...e4b21</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-[#2a2a34] rounded-full border-2 border-[#1a1a24] shadow-sm overflow-hidden flex items-center justify-center">
                                            <GraduationCap className="w-6 h-6 text-[#a8a29e]" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-[#e8e4df]">Alex Student</p>
                                            <p className="text-xs text-[#57534e] font-bold">Issued: Oct 2025</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative Elements */}
                            <div className="absolute z-10 top-10 -right-10 w-40 h-40 bg-gradient-to-br from-amber-500 to-violet-500 rounded-full mix-blend-screen opacity-30 blur-2xl animate-pulse-slow"></div>
                            
                            <div className={`hidden md:flex absolute z-30 -bottom-10 -left-10 glass-effect p-5 rounded-2xl shadow-xl animate-float-reverse border border-[#d4a053]/20 items-center gap-4 reveal-hidden ${heroCardVisible ? 'animate-slide-right delay-500' : ''}`}>
                                <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-accent shadow-inner">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-[#e8e4df]">Zero-Knowledge</p>
                                    <p className="text-xs font-bold text-[#57534e]">100% Privacy Retained</p>
                                </div>
                            </div>

                            <div className={`absolute z-10 top-20 -left-10 md:-left-20 glass-effect p-4 rounded-xl shadow-lg animate-float border border-[#d4a053]/20 reveal-hidden ${heroCardVisible ? 'animate-scale-up delay-[700ms]' : ''}`}>
                                <Lock className={`w-8 h-8 text-secondary ${heroCardVisible ? 'animate-wiggle-trigger' : ''}`} style={{ animationDelay: '1s' }} />
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* How It Works Section */}
            <div className="relative z-10 py-32 bg-[#13131a] border-y border-[#2a2a34]">
                <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
                    <div ref={hwHeadRef} className="text-center mb-24">
                        <h2 className={`text-sm font-black text-primary uppercase tracking-widest mb-4 reveal-hidden ${hwHeadVisible ? 'animate-fade-in-up' : ''}`}>The Process</h2>
                        <h3 className={`text-4xl md:text-5xl font-black text-[#e8e4df] tracking-tight reveal-hidden ${hwHeadVisible ? 'animate-fade-in-up delay-100' : ''}`}>How We Guarantee Trust</h3>
                        <p className={`mt-6 text-xl text-[#a8a29e] max-w-2xl mx-auto font-medium reveal-hidden ${hwHeadVisible ? 'animate-fade-in-up delay-200' : ''}`}>A seamless three-step protocol bridging traditional education with Web3 cryptography.</p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-12 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden lg:block absolute top-[45px] left-[15%] right-[15%] h-1 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 z-0"></div>

                        {/* Step 1 */}
                        <div ref={hwStep1Ref} className={`relative z-10 flex flex-col items-center text-center group reveal-hidden ${hwStep1Visible ? 'animate-fade-in-up delay-100' : ''}`}>
                            <div className="w-24 h-24 bg-[#1a1a24] rounded-full border-4 border-[#0f0f14] shadow-xl flex items-center justify-center mb-8 relative group-hover:-translate-y-2 transition-transform duration-500">
                                <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-pulse"></div>
                                <Building className="w-10 h-10 text-primary" />
                                <div className="absolute -top-3 -right-3 w-8 h-8 bg-primary text-[#0f0f14] font-black rounded-full flex items-center justify-center border-2 border-[#0f0f14] shadow-sm">1</div>
                            </div>
                            <h4 className="text-2xl font-black text-[#e8e4df] mb-4">Institution Issues</h4>
                            <p className="text-[#a8a29e] font-medium leading-relaxed">Universities cryptographically sign PDF credentials and upload the metadata to decentralized IPFS storage.</p>
                        </div>

                        {/* Step 2 */}
                        <div ref={hwStep2Ref} className={`relative z-10 flex flex-col items-center text-center group reveal-hidden ${hwStep2Visible ? 'animate-fade-in-up delay-300' : ''}`}>
                            <div className="w-24 h-24 bg-[#1a1a24] rounded-full border-4 border-[#0f0f14] shadow-xl flex items-center justify-center mb-8 relative group-hover:-translate-y-2 transition-transform duration-500">
                                <div className="absolute inset-0 rounded-full border-2 border-secondary/20 animate-pulse"></div>
                                <LinkIcon className="w-10 h-10 text-secondary" />
                                <div className="absolute -top-3 -right-3 w-8 h-8 bg-secondary text-[#0f0f14] font-black rounded-full flex items-center justify-center border-2 border-[#0f0f14] shadow-sm">2</div>
                            </div>
                            <h4 className="text-2xl font-black text-[#e8e4df] mb-4">Blockchain Secures</h4>
                            <p className="text-[#a8a29e] font-medium leading-relaxed">A smart contract on Polygon mints a unique mapping of the student to the credential hash, making it unforgeable.</p>
                        </div>

                        {/* Step 3 */}
                        <div ref={hwStep3Ref} className={`relative z-10 flex flex-col items-center text-center group reveal-hidden ${hwStep3Visible ? 'animate-fade-in-up delay-500' : ''}`}>
                            <div className="w-24 h-24 bg-[#1a1a24] rounded-full border-4 border-[#0f0f14] shadow-xl flex items-center justify-center mb-8 relative group-hover:-translate-y-2 transition-transform duration-500">
                                <div className="absolute inset-0 rounded-full border-2 border-accent/20 animate-pulse"></div>
                                <Globe className="w-10 h-10 text-accent" />
                                <div className="absolute -top-3 -right-3 w-8 h-8 bg-accent text-[#0f0f14] font-black rounded-full flex items-center justify-center border-2 border-[#0f0f14] shadow-sm">3</div>
                            </div>
                            <h4 className="text-2xl font-black text-[#e8e4df] mb-4">World Verifies</h4>
                            <p className="text-[#a8a29e] font-medium leading-relaxed">Employers instantly query the ledger to verify the origin and valid status of the claim without third-party friction.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Features Section */}
            <div className="relative z-10 py-32 bg-[#0a0a0f] overflow-hidden">
                 {/* Parallax Orbs */}
                 <div 
                    className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] opacity-40 pointer-events-none"
                    style={{ transform: `translateY(${scrollY * 0.2}px)` }}
                />
                <div 
                    className="absolute bottom-0 left-[-200px] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[150px] opacity-30 pointer-events-none"
                    style={{ transform: `translateY(${scrollY * -0.1}px)` }}
                />

                <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 relative z-10">
                    <div ref={featuresHeadRef} className="text-center mb-20">
                        <h2 className={`text-sm font-black text-accent uppercase tracking-widest mb-4 reveal-hidden ${featuresHeadVisible ? 'animate-fade-in-up' : ''}`}>The Infrastructure</h2>
                        
                        {/* Word-by-word reveal */}
                        <h3 className="text-4xl md:text-5xl font-black text-[#e8e4df] drop-shadow-sm tracking-tight flex justify-center flex-wrap">
                            {'Redefining Digital Trust'.split(' ').map((word, i) => (
                                <span 
                                    key={i} 
                                    className={`inline-block reveal-hidden ${featuresHeadVisible ? 'animate-fade-in-up' : ''}`} 
                                    style={{ animationDelay: `${(i + 1) * 150}ms` }}
                                >
                                    {word}&nbsp;
                                </span>
                            ))}
                        </h3>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div ref={feature1Ref} className={`p-10 rounded-[2rem] bg-[#1a1a24]/50 backdrop-blur-sm border border-[#2a2a34] hover:bg-[#1a1a24] transition-all duration-500 group transform hover:-translate-y-3 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] relative overflow-hidden reveal-hidden ${feature1Visible ? 'animate-fade-in-up' : ''}`}>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all duration-500 group-hover:bg-primary/30 group-hover:scale-150"></div>
                            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-8 border border-primary/20 transition-all duration-500 group-hover:scale-110 group-hover:bg-primary/20 group-hover:shadow-[0_0_20px_rgba(212,160,83,0.3)]">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black text-[#e8e4df] mb-4">Cryptographic Issuance</h3>
                            <p className="text-[#a8a29e] leading-relaxed font-medium group-hover:text-[#d6d3d1] transition-colors">Institutions mint unbreakable proofs on the Polygon blockchain, linking the specific PDF identity permanently to a unique transaction hash.</p>
                        </div>

                        {/* Feature 2 */}
                        <div ref={feature2Ref} className={`p-10 rounded-[2rem] bg-[#1a1a24]/50 backdrop-blur-sm border border-[#2a2a34] hover:bg-[#1a1a24] transition-all duration-500 group transform hover:-translate-y-3 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] relative overflow-hidden reveal-hidden ${feature2Visible ? 'animate-fade-in-up delay-200' : ''}`}>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all duration-500 group-hover:bg-secondary/30 group-hover:scale-150"></div>
                            <div className="w-16 h-16 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center mb-8 border border-secondary/20 transition-all duration-500 group-hover:scale-110 group-hover:bg-secondary/20 group-hover:shadow-[0_0_20px_rgba(192,132,252,0.3)]">
                                <Share2 className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black text-[#e8e4df] mb-4">Empowered Students</h3>
                            <p className="text-[#a8a29e] leading-relaxed font-medium group-hover:text-[#d6d3d1] transition-colors">Students manage a centralized digital wallet. Generate QR codes or direct links to prove qualifications instantly anywhere in the world.</p>
                        </div>

                        {/* Feature 3 */}
                        <div ref={feature3Ref} className={`p-10 rounded-[2rem] bg-[#1a1a24]/50 backdrop-blur-sm border border-[#2a2a34] hover:bg-[#1a1a24] transition-all duration-500 group transform hover:-translate-y-3 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] relative overflow-hidden reveal-hidden ${feature3Visible ? 'animate-fade-in-up delay-400' : ''}`}>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all duration-500 group-hover:bg-accent/30 group-hover:scale-150"></div>
                            <div className="w-16 h-16 bg-accent/10 text-accent rounded-2xl flex items-center justify-center mb-8 border border-accent/20 transition-all duration-500 group-hover:scale-110 group-hover:bg-accent/20 group-hover:shadow-[0_0_20px_rgba(52,211,153,0.3)]">
                                <Search className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black text-[#e8e4df] mb-4">Global Verification</h3>
                            <p className="text-[#a8a29e] leading-relaxed font-medium group-hover:text-[#d6d3d1] transition-colors">Employers can verify authenticity cryptographically without requesting transcripts or employing slow third-party background checkers.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
