import React, { useState } from 'react';
import { CheckCircle2, XCircle, Share2, Hexagon, Copy, FileText, Trash2 } from 'lucide-react';
import ShareModal from './ShareModal';
import { toast } from 'react-hot-toast';

const CredentialCard = ({ cred, role, onRevoke }) => {
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [isIdCopied, setIsIdCopied] = useState(false);
    
    const productionUrl = import.meta.env.VITE_SITE_URL || 'https://blockcred-app.onrender.com'; // Placeholder/Default
    const verifyUrl = `${productionUrl}/verify/${cred.credentialId}`;

    const handleCopyId = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(cred.credentialId);
        setIsIdCopied(true);
        toast.success('ID Copied!');
        setTimeout(() => setIsIdCopied(false), 2000);
    };

    const isExpired = cred.expiryDate && new Date(cred.expiryDate) < new Date();
    const isRevoked = cred.isRevoked;
    const isValid = !isExpired && !isRevoked;

    return (
        <div className="group relative bg-[#1a1a24] border border-[#2a2a34] rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col h-full">
            {/* Status indicator line */}
            <div className={`h-1 w-full ${isValid ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            
            <div className="p-6 flex flex-col h-full bg-gradient-to-b from-white/[0.02] to-transparent">
                <div className="flex justify-between items-start mb-4">
                    <div 
                        onClick={handleCopyId}
                        className="group/id text-[10px] font-mono text-[#57534e] hover:text-primary cursor-pointer flex items-center gap-1.5 bg-[#0f0f14] px-2.5 py-1 rounded-md border border-[#2a2a34] hover:border-primary/30 transition-all duration-300 relative overflow-hidden"
                        title="Click to copy Credential ID"
                    >
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/id:opacity-100 transition-opacity"></div>
                        {isIdCopied ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-500 relative z-10" />
                        ) : (
                            <>
                                <Hexagon className="w-3 h-3 text-primary relative z-10 group-hover/id:hidden" />
                                <Copy className="w-3 h-3 text-primary relative z-10 hidden group-hover/id:block animate-in zoom-in-50 duration-200" />
                            </>
                        )}
                        <span className="relative z-10 group-hover/id:translate-x-0.5 transition-transform">{cred.credentialId}</span>
                    </div>
                    
                    <div className={`text-[10px] font-black uppercase tracking-tighter px-2 py-1 rounded-md border ${
                        isValid ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-rose-400 bg-rose-400/10 border-rose-400/20'
                    }`}>
                        {isRevoked ? 'Revoked' : isExpired ? 'Expired' : 'Valid'}
                    </div>
                </div>

                <h3 className="text-lg font-bold text-[#e8e4df] leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-2">
                    {cred.degree}
                </h3>
                
                <p className="text-xs font-semibold text-[#57534e] uppercase tracking-wider mb-6">
                    {role === 'student' ? cred.institution : cred.studentName}
                </p>

                <div className="mt-auto space-y-4">
                    <div className="flex items-center justify-between text-[10px] font-bold text-[#44403c] border-t border-[#2a2a34] pt-4">
                        <span>Issued: {new Date(cred.createdAt).toLocaleDateString()}</span>
                        {cred.expiryDate && <span className="text-rose-400/60">Exp: {new Date(cred.expiryDate).toLocaleDateString()}</span>}
                    </div>

                    <div className="flex gap-2">
                        <button 
                            onClick={() => setIsShareOpen(true)}
                            className="flex-1 bg-primary/10 hover:bg-primary text-primary hover:text-[#0f0f14] py-2.5 rounded-lg text-xs font-black transition-all border border-primary/20 hover:border-transparent flex items-center justify-center gap-2"
                        >
                            <Share2 className="w-3.5 h-3.5" /> Share
                        </button>
                        
                        <a 
                            href={cred.ipfsUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="p-2.5 bg-[#0f0f14] hover:bg-[#2a2a34] text-[#a8a29e] hover:text-[#e8e4df] rounded-lg border border-[#2a2a34] transition"
                            title="View Certificate"
                        >
                            <FileText className="w-4 h-4" />
                        </a>

                        {role === 'institution' && isValid && (
                            <button 
                                onClick={() => onRevoke(cred.credentialId)}
                                className="p-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-lg border border-rose-500/20 transition"
                                title="Revoke Credential"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <ShareModal 
                isOpen={isShareOpen} 
                onClose={() => setIsShareOpen(false)} 
                url={verifyUrl} 
                title={cred.degree}
                credId={cred.credentialId}
            />
        </div>
    );
};

export default CredentialCard;
