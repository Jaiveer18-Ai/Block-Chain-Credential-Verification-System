import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { ShieldAlert, ArrowLeft, Upload } from 'lucide-react';
import LoadingModal from '../components/LoadingModal';

const IssueCredential = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [file, setFile] = useState(null);
    const [formData, setFormData] = useState({
        studentName: '',
        studentEmail: '',
        studentId: '',
        degree: '',
        expiryDate: ''
    });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    
    const handleFileChange = (e) => {
        if (e.target.files[0]) {
             setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return toast.error('Please upload the certificate PDF');
        
        const data = new FormData();
        data.append('studentName', formData.studentName);
        data.append('studentEmail', formData.studentEmail);
        data.append('studentId', formData.studentId);
        data.append('degree', formData.degree);
        if (formData.expiryDate) data.append('expiryDate', formData.expiryDate);
        data.append('certificate', file);

        try {
            setIsSubmitting(true);
            const response = await api.post('/credentials/issue', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 120000 // Matched to backend IPFS timeout
            });
            toast.success('Successfully issued credential!');
            navigate('/institution/dashboard');
        } catch (err) {
            console.error('Issuance detailed error:', err);
            let errorMessage = 'Failed to issue credential';
            
            if (err.code === 'ECONNABORTED') {
                errorMessage = 'Connection timed out. The blockchain or IPFS network is responding slowly. Please try again.';
            } else if (err.code === 'ERR_NETWORK') {
                errorMessage = 'Network Error: Check your internet connection. The server might be unreachable.';
            } else if (err.response) {
                const data = err.response.data;
                if (err.response.status === 413) {
                    errorMessage = 'File too large for cloud storage.';
                } else if (data) {
                    // Extract message from various possible error formats
                    const rawMsg = data.message || data.error || data;
                    errorMessage = typeof rawMsg === 'string' ? rawMsg : JSON.stringify(rawMsg);
                } else {
                    errorMessage = `Server Error (${err.response.status})`;
                }
            } else {
                errorMessage = err.message || 'An unexpected error occurred';
            }
            
            // Final safety check to ensure we never show [object Object]
            if (typeof errorMessage !== 'string' || errorMessage.includes('[object Object]')) {
                errorMessage = 'An internal error occurred. Detailed logs are available in the console.';
            }

            toast.error(errorMessage, { duration: 8000 });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
        <LoadingModal isOpen={isSubmitting} text="Issuing to Blockchain..." />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <Link to="/institution/dashboard" className="inline-flex items-center text-sm font-medium text-[#57534e] hover:text-primary mb-6 transition">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
            </Link>
            
            <div className="bg-[#1a1a24] rounded-2xl shadow-xl border border-[#2a2a34] overflow-hidden">
                <div className="bg-gradient-to-r from-[#1a1a24] to-[#0f0f14] border-b border-[#2a2a34] p-6 text-[#e8e4df] flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">Issue New Credential</h1>
                        <p className="text-[#a8a29e] text-sm mt-1">This record will be permanently etched on the Polygon blockchain.</p>
                    </div>
                    <ShieldAlert className="w-10 h-10 text-primary opacity-80" />
                </div>
                
                <form onSubmit={handleSubmit} className="p-8">
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-[#a8a29e] mb-1">Student Name</label>
                            <input 
                                type="text" name="studentName" required value={formData.studentName} onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg bg-[#0f0f14] border border-[#2a2a34] focus:bg-[#0f0f14] focus:ring-2 focus:ring-primary focus:border-primary transition outline-none text-[#e8e4df] placeholder-[#57534e]"
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#a8a29e] mb-1">Student Email</label>
                            <input 
                                type="email" name="studentEmail" required value={formData.studentEmail} onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg bg-[#0f0f14] border border-[#2a2a34] focus:bg-[#0f0f14] focus:ring-2 focus:ring-primary focus:border-primary transition outline-none text-[#e8e4df] placeholder-[#57534e]"
                                placeholder="student@example.com"
                            />
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-[#a8a29e] mb-1">Student ID (Roll No)</label>
                        <input 
                            type="text" name="studentId" required value={formData.studentId} onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg bg-[#0f0f14] border border-[#2a2a34] focus:bg-[#0f0f14] focus:ring-2 focus:ring-primary focus:border-primary transition outline-none text-[#e8e4df] placeholder-[#57534e]"
                            placeholder="STU-2023-001"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-[#a8a29e] mb-1">Degree / Certificate Title</label>
                        <input 
                            type="text" name="degree" required value={formData.degree} onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg bg-[#0f0f14] border border-[#2a2a34] focus:bg-[#0f0f14] focus:ring-2 focus:ring-primary focus:border-primary transition outline-none text-[#e8e4df] placeholder-[#57534e]"
                            placeholder="Bachelor of Science in Computer Science"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-[#a8a29e] mb-1">Expiry Date (Optional)</label>
                        <input 
                            type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg bg-[#0f0f14] border border-[#2a2a34] focus:bg-[#0f0f14] focus:ring-2 focus:ring-primary focus:border-primary transition outline-none text-[#e8e4df]"
                        />
                        <p className="text-xs text-[#57534e] mt-1">Leave blank if the credential is perpetual.</p>
                    </div>

                    <div className="mb-8">
                        <label className="block text-sm font-medium text-[#a8a29e] mb-1">Upload Certificate (PDF/Image)</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-[#2a2a34] border-dashed rounded-lg bg-[#0f0f14] hover:bg-[#13131a] transition-colors relative cursor-pointer">
                            <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} />
                            <div className="space-y-1 text-center pointer-events-none">
                                <Upload className="mx-auto h-12 w-12 text-[#57534e]" />
                                <div className="text-sm text-[#a8a29e] font-medium">
                                    {file ? <span className="text-primary font-bold">{file.name}</span> : <span>Click or drag file to upload</span>}
                                </div>
                                <p className="text-xs text-[#57534e]">Will be pinned out to IPFS</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-[#2a2a34] pt-6 flex justify-end">
                        <button 
                            type="button" 
                            onClick={() => navigate('/institution/dashboard')}
                            className="mr-3 px-6 py-3 rounded-lg font-medium text-[#a8a29e] hover:bg-[#2a2a34] transition"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="px-8 py-3 bg-primary hover:bg-[#b8862e] text-[#0f0f14] rounded-lg font-bold shadow-md transition disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? 'Minting...' : 'Issue Credential'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
        </>
    );
};

export default IssueCredential;
