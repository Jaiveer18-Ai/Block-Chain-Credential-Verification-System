import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X } from 'lucide-react';

const QRCodeModal = ({ isOpen, onClose, url, title }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full relative">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
                >
                    <X className="w-6 h-6" />
                </button>
                
                <div className="p-8 text-center flex flex-col items-center">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">{title || 'Scan to Verify'}</h3>
                    <p className="text-sm text-slate-500 mb-6">Anyone can scan this code to instantly verify your credential on the blockchain.</p>
                    
                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-inner">
                        <QRCodeSVG value={url} size={200} level="H" includeMargin={true} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QRCodeModal;
