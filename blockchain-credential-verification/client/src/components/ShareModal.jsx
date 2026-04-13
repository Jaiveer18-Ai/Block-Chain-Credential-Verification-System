import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, CheckCircle2, ExternalLink } from 'lucide-react';

const ShareModal = ({ isOpen, onClose, url, title, credId }) => {
    const [isCopied, setIsCopied] = useState(false);

    if (!isOpen) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0f0f14]/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-[#1a1a24] rounded-[2rem] shadow-2xl max-w-sm w-full relative border border-[#d4a053]/20 overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-[#b8862e]"></div>
                
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 text-[#57534e] hover:text-[#e8e4df] transition p-2 hover:bg-[#2a2a34] rounded-full"
                >
                    <X className="w-5 h-5" />
                </button>
                
                <div className="p-8 pb-10 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20">
                        <ExternalLink className="w-8 h-8 text-primary" />
                    </div>
                    
                    <h3 className="text-2xl font-black text-[#e8e4df] mb-2">{title || 'Share Credential'}</h3>
                    <p className="text-sm text-[#a8a29e] mb-8 font-medium">Verify authenticity via QR or secure link.</p>
                    
                    <div className="bg-white p-5 rounded-3xl border-4 border-[#1a1a24] shadow-[0_0_30px_rgba(212,160,83,0.1)] mb-8">
                        <QRCodeSVG value={url} size={180} level="H" includeMargin={false} />
                    </div>

                    <div className="w-full space-y-3">
                        <div className="relative group">
                            <input 
                                readOnly 
                                value={url} 
                                className="w-full bg-[#0f0f14] border border-[#2a2a34] rounded-xl py-4 pl-4 pr-12 text-xs font-mono text-[#a8a29e] outline-none"
                            />
                            <button 
                                onClick={handleCopy}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-primary hover:bg-primary/10 rounded-lg transition"
                            >
                                {isCopied ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                            </button>
                        </div>
                        
                        <button 
                            onClick={handleCopy}
                            className="w-full bg-gradient-to-r from-primary to-[#b8862e] text-[#0f0f14] py-4 rounded-xl text-sm font-black transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-2"
                        >
                            {isCopied ? 'Link Copied!' : 'Copy Verification Link'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
