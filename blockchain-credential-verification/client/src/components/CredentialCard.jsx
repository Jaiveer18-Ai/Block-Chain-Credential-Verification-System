import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, FileText, Share2, QrCode, Hexagon } from 'lucide-react';
import QRCodeModal from './QRCodeModal';

const CredentialCard = ({ cred, role, onRevoke }) => {
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    
    // Status Logic
    const isExpired = cred.expiryDate && new Date(cred.expiryDate) < new Date();
    const isRevoked = cred.isRevoked;
    const isValid = !isExpired && !isRevoked;

    const verifyUrl = `${window.location.origin}/verify/${cred.credentialId}`;

    return (
        <div className="group relative rounded-3xl p-[1px] bg-gradient-to-br from-white/10 to-white/5 hover:from-primary/40 hover:to-secondary/40 transition-all duration-500 hover:shadow-[0_0_40px_rgba(37,99,235,0.3)] transform hover:-translate-y-2">
            <div className="absolute inset-0 bg-slate-900 rounded-3xl z-0"></div>
            
            {/* Status gradient bar */}
            <div className={`absolute top-0 left-0 w-full h-1.5 rounded-t-full ${isValid ? 'bg-gradient-to-r from-emerald-400 to-green-600' : 'bg-gradient-to-r from-rose-400 to-red-600'} z-10`}></div>
            
            <div className="relative z-10 p-8 flex flex-col h-full bg-slate-900/50 rounded-3xl backdrop-blur-xl">
                <div className="flex justify-between items-start mb-6">
                    <div className="bg-slate-800 text-slate-400 text-[10px] font-mono px-3 py-1.5 rounded-lg border border-slate-700/50 flex items-center gap-1">
                        <Hexagon className="w-3 h-3 text-primary" /> {cred.credentialId}
                    </div>
                    {isValid ? (
                        <span className="flex items-center text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full uppercase tracking-wider"><CheckCircle2 className="w-3 h-3 mr-1" /> VALID</span>
                    ) : (
                        <span className="flex items-center text-[10px] font-black text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-full uppercase tracking-wider"><XCircle className="w-3 h-3 mr-1" /> {isRevoked ? 'REVOKED' : 'EXPIRED'}</span>
                    )}
                </div>

                <h3 className="text-2xl font-black text-white mb-2 leading-tight">{cred.degree}</h3>
                <p className="text-secondary font-bold text-sm mb-6 uppercase tracking-wider">{role === 'student' ? cred.institution : cred.studentName}</p>

                <div className="mt-auto space-y-6">
                    <div className="flex justify-between text-xs font-bold text-slate-500 border-t border-slate-700 pt-5">
                        <span className="flex flex-col gap-1"><span className="uppercase text-[10px] text-slate-600">Issued</span> {new Date(cred.createdAt).toLocaleDateString()}</span>
                        {cred.expiryDate && <span className="flex flex-col gap-1 text-right"><span className="uppercase text-[10px] text-slate-600">Expires</span> {new Date(cred.expiryDate).toLocaleDateString()}</span>}
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <a 
                            href={cred.ipfsUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 px-4 rounded-xl text-xs font-black transition-all border border-slate-700 flex items-center justify-center gap-2"
                        >
                            <FileText className="w-4 h-4 text-slate-400" /> Certificate
                        </a>
                        <Link 
                            to={`/verify/${cred.credentialId}`}
                            className="flex-1 bg-primary/10 hover:bg-primary/20 text-primary py-3 px-4 rounded-xl text-xs font-black transition-all border border-primary/20 flex items-center justify-center gap-2"
                        >
                            <Share2 className="w-4 h-4" /> Sharing Link
                        </Link>
                        
                        {role === 'student' && (
                            <button 
                                onClick={() => setIsQRModalOpen(true)}
                                className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 px-4 rounded-xl text-xs font-black transition-all shadow-lg hover:shadow-primary/30 flex items-center justify-center gap-2"
                            >
                                <QrCode className="w-4 h-4" /> Display QR Code
                            </button>
                        )}
                        
                        {role === 'institution' && isValid && (
                            <button 
                                onClick={() => onRevoke && onRevoke(cred.credentialId)}
                                className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 hover:text-white py-3 px-4 rounded-xl text-xs font-black transition-all border border-rose-500/20 flex items-center justify-center gap-2"
                            >
                                <XCircle className="w-4 h-4" /> Revoke Credential
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <QRCodeModal 
                isOpen={isQRModalOpen} 
                onClose={() => setIsQRModalOpen(false)} 
                url={verifyUrl} 
            />
        </div>
    );
};

export default CredentialCard;
