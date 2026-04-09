import { Heart, ShieldCheck } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-slate-950 text-slate-300 py-12 mt-auto border-t border-white/5 relative z-10">
            <div className="w-full px-6 sm:px-10 lg:px-16">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                        <span className="font-bold text-xl tracking-tight text-white">
                            BlockCred
                        </span>
                    </div>
                    
                    <div className="text-center md:text-left text-sm text-slate-500">
                        © {new Date().getFullYear()} BlockCred. Immutable Academic Records.
                    </div>

                    <div className="flex items-center gap-1 text-sm text-slate-400">
                        Built with <Heart className="h-4 w-4 text-red-500" /> on Web3
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
