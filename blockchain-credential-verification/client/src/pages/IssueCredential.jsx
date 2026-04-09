import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { ShieldAlert, ArrowLeft, Upload } from 'lucide-react';

const IssueCredential = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [file, setFile] = useState(null);
    const [formData, setFormData] = useState({
        studentName: '',
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
        data.append('studentId', formData.studentId);
        data.append('degree', formData.degree);
        if (formData.expiryDate) data.append('expiryDate', formData.expiryDate);
        data.append('certificate', file);

        const toastId = toast.loading('Uploading to IPFS & Minting to Blockchain...');
        try {
            setIsSubmitting(true);
            await api.post('/credentials/issue', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Successfully issued credential!', { id: toastId });
            navigate('/institution/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to issue credential', { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <Link to="/institution/dashboard" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary mb-6 transition">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
            </Link>
            
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="bg-slate-900 border-b p-6 text-white flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">Issue New Credential</h1>
                        <p className="text-slate-300 text-sm mt-1">This record will be permanently etched on the Polygon blockchain.</p>
                    </div>
                    <ShieldAlert className="w-10 h-10 text-primary opacity-80" />
                </div>
                
                <form onSubmit={handleSubmit} className="p-8">
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Student Name</label>
                            <input 
                                type="text" name="studentName" required value={formData.studentName} onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary transition outline-none"
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Student ID (Roll No)</label>
                            <input 
                                type="text" name="studentId" required value={formData.studentId} onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary transition outline-none"
                                placeholder="STU-2023-001"
                            />
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Degree / Certificate Title</label>
                        <input 
                            type="text" name="degree" required value={formData.degree} onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary transition outline-none"
                            placeholder="Bachelor of Science in Computer Science"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date (Optional)</label>
                        <input 
                            type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary transition outline-none"
                        />
                        <p className="text-xs text-slate-500 mt-1">Leave blank if the credential is perpetual.</p>
                    </div>

                    <div className="mb-8">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Upload Certificate (PDF/Image)</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors relative cursor-pointer">
                            <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} />
                            <div className="space-y-1 text-center pointer-events-none">
                                <Upload className="mx-auto h-12 w-12 text-slate-400" />
                                <div className="text-sm text-slate-600 font-medium">
                                    {file ? <span className="text-primary font-bold">{file.name}</span> : <span>Click or drag file to upload</span>}
                                </div>
                                <p className="text-xs text-slate-500">Will be pinned out to IPFS</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-200 pt-6 flex justify-end">
                        <button 
                            type="button" 
                            onClick={() => navigate('/institution/dashboard')}
                            className="mr-3 px-6 py-3 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="px-8 py-3 bg-primary hover:bg-secondary text-white rounded-lg font-bold shadow-md transition disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? 'Minting...' : 'Issue Credential'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default IssueCredential;
