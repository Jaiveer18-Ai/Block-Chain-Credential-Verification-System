import { Heart, ShieldCheck, Bot } from 'lucide-react';
import { useBotContext } from '../context/BotContext';

const Footer = () => {
    const { isBotEnabled, toggleBot } = useBotContext();

    return (
        <footer className="bg-[#0a0a0f] text-[#a8a29e] py-12 mt-auto border-t border-[#d4a053]/10 relative z-10">
            <div className="w-full px-6 sm:px-10 lg:px-16">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                        <span className="font-bold text-xl tracking-tight text-[#e8e4df]">
                            BlockCred
                        </span>
                    </div>
                    
                    <div className="text-center md:text-left text-sm text-[#57534e]">
                        © {new Date().getFullYear()} BlockCred. Immutable Academic Records.
                    </div>

                    <div className="flex items-center gap-6">
                        <button 
                            onClick={toggleBot}
                            className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full transition-all border shadow-sm ${isBotEnabled ? 'text-primary bg-[#d4a053]/10 border-[#d4a053]/30 hover:bg-[#d4a053]/20' : 'text-[#57534e] bg-[#1a1a24]/50 border-[#2a2a34] hover:bg-[#1a1a24] hover:text-[#a8a29e]'}`}
                        >
                            <Bot className="w-4 h-4" /> 
                            {isBotEnabled ? 'TrustMate: Active' : 'TrustMate: Sleeping'}
                        </button>
                        
                        <div className="hidden sm:flex items-center gap-1 text-sm text-[#57534e]">
                            Built with <Heart className="h-4 w-4 text-rose-500" /> on Web3
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
