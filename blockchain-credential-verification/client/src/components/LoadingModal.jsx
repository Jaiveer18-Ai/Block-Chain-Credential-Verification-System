import React from 'react';
import { Shield, Link as LinkIcon } from 'lucide-react';

const LoadingModal = ({ isOpen, text = "Issuing to blockchain..." }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0f0f14]/70 backdrop-blur-md transition-all duration-300">
            <div className="bg-[#1a1a24]/90 border border-[#d4a053]/20 p-10 rounded-3xl shadow-[0_0_50px_rgba(212,160,83,0.15)] flex flex-col items-center text-center relative overflow-hidden backdrop-blur-xl">
                
                {/* Advanced Spinner Container */}
                <div className="relative w-32 h-32 mb-6 flex items-center justify-center" style={{ animation: 'spinChainLinks 2.5s linear infinite' }}>
                    {/* Ring */}
                    <div className="absolute inset-2 border-[2px] border-[#2a2a34] rounded-full"></div>
                    
                    {/* 4 Chain Links */}
                    <div className="absolute top-0 left-1/2 -ml-3 w-6 h-6 text-primary" style={{ animation: 'linkGlow 1.2s infinite 0s' }}>
                        <LinkIcon className="rotate-90 w-full h-full" />
                    </div>
                    <div className="absolute top-1/2 right-0 -mt-3 w-6 h-6 text-secondary" style={{ animation: 'linkGlow 1.2s infinite 0.3s' }}>
                        <LinkIcon className="w-full h-full" />
                    </div>
                    <div className="absolute bottom-0 left-1/2 -ml-3 w-6 h-6 text-accent" style={{ animation: 'linkGlow 1.2s infinite 0.6s' }}>
                        <LinkIcon className="rotate-90 w-full h-full" />
                    </div>
                    <div className="absolute top-1/2 left-0 -mt-3 w-6 h-6 text-primary" style={{ animation: 'linkGlow 1.2s infinite 0.9s' }}>
                        <LinkIcon className="w-full h-full" />
                    </div>
                    
                    {/* Center Icon */}
                    <div className="relative z-10 p-2 rounded-full border border-primary/30 bg-[#1a1a24]/80 shadow-[0_0_15px_rgba(212,160,83,0.3)]" style={{ animation: 'reverseSpin 2.5s linear infinite' }}>
                        <Shield className="w-5 h-5 text-primary" />
                    </div>
                </div>

                <h3 className="text-sm font-black text-[#e8e4df] tracking-widest uppercase">{text}</h3>
                
                {/* Animated Dots */}
                <div className="mt-4 flex gap-1.5">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                
                <style dangerouslySetInnerHTML={{__html: `
                    @keyframes spinChainLinks {
                        0% { transform: rotate(0deg); filter: drop-shadow(0 0 20px rgba(212, 160, 83, 0.3)); }
                        50% { filter: drop-shadow(0 0 35px rgba(192, 132, 252, 0.6)); }
                        100% { transform: rotate(360deg); filter: drop-shadow(0 0 20px rgba(212, 160, 83, 0.3)); }
                    }
                    @keyframes reverseSpin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(-360deg); }
                    }
                    @keyframes linkGlow {
                        0%, 100% { opacity: 0.4; transform: scale(0.9); }
                        50% { opacity: 1; transform: scale(1.1); filter: drop-shadow(0 0 10px currentColor); }
                    }
                `}} />
            </div>
        </div>
    );
};

export default LoadingModal;
