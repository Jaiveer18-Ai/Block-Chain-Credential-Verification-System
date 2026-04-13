import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { X, Camera, Copy, CheckCircle2, Pencil, Check, User as UserIcon, Building2, Calendar, MapPin, Phone, Globe, Hash, ShieldCheck, FileText, Award, Clock, AlertTriangle, KeyRound } from 'lucide-react';
import ChangePasswordForm from './ChangePasswordForm';

// Stats Card renderer
const StatCard = ({ icon, label, value, highlight = false }) => (
    <div className={`p-4 rounded-xl border text-center transition-all ${highlight && value > 0 ? 'border-amber-500/30 bg-amber-500/5' : 'border-[#2a2a34] bg-[#0f0f14]/50'}`}>
        <div className="text-2xl mb-1">{icon}</div>
        <p className="text-2xl font-black text-[#e8e4df]">{value ?? 0}</p>
        <p className="text-[10px] font-bold text-[#57534e] uppercase tracking-wider mt-1">{label}</p>
    </div>
);

// Editable field renderer - MOVED OUTSIDE to prevent focus loss on re-render
const EditableField = ({ label, field, icon: Icon, type = 'text', readOnly = false, placeholder = '', value, onChange, isEditing, onToggleEdit }) => {
    return (
        <div className="group">
            <label className="flex items-center gap-1.5 text-xs font-bold text-[#57534e] uppercase tracking-wider mb-1.5">
                {Icon && <Icon className="w-3.5 h-3.5" />} {label}
                {readOnly && <span className="ml-auto text-[9px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-black">Read-only</span>}
            </label>
            <div className="relative flex items-center">
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(field, e.target.value)}
                    onFocus={() => !readOnly && onToggleEdit(field, true)}
                    onBlur={() => !readOnly && onToggleEdit(field, false)}
                    disabled={readOnly}
                    placeholder={placeholder}
                    className={`w-full px-4 py-3 rounded-xl text-sm transition-all outline-none cursor-pointer ${
                        readOnly
                            ? 'bg-[#0f0f14]/50 border border-[#2a2a34] text-[#57534e] cursor-not-allowed'
                            : isEditing
                                ? 'bg-[#0f0f14] border-2 border-primary/50 text-[#e8e4df] ring-2 ring-primary/20 cursor-text'
                                : 'bg-[#0f0f14]/50 border border-[#2a2a34] text-[#a8a29e] hover:border-[#3a3a44]'
                    }`}
                />
            </div>
        </div>
    );
};

// Textarea field for bio - MOVED OUTSIDE
const BioField = ({ value, onChange, isEditing, onToggleEdit }) => {
    const charCount = (value || '').length;
    return (
        <div className="group">
            <label className="flex items-center gap-1.5 text-xs font-bold text-[#57534e] uppercase tracking-wider mb-1.5">
                <FileText className="w-3.5 h-3.5" /> Bio
            </label>
            <div className="relative">
                <textarea
                    value={value}
                    onChange={(e) => { if (e.target.value.length <= 160) onChange('bio', e.target.value); }}
                    onFocus={() => onToggleEdit('bio', true)}
                    onBlur={() => onToggleEdit('bio', false)}
                    placeholder="Tell us about yourself..."
                    rows={3}
                    className={`w-full px-4 py-3 rounded-xl text-sm transition-all outline-none resize-none cursor-pointer ${
                        isEditing
                            ? 'bg-[#0f0f14] border-2 border-primary/50 text-[#e8e4df] ring-2 ring-primary/20 cursor-text'
                            : 'bg-[#0f0f14]/50 border border-[#2a2a34] text-[#a8a29e] hover:border-[#3a3a44]'
                    }`}
                />
                <div className="flex items-center justify-between mt-1">
                    <span className={`text-[10px] font-bold ${charCount >= 150 ? 'text-rose-400' : 'text-[#57534e]'}`}>
                        {charCount}/160
                    </span>
                </div>
            </div>
        </div>
    );
};

const ProfileModal = ({ isOpen, onClose }) => {
    const { user, updateUser } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingFields, setEditingFields] = useState({});
    const [formData, setFormData] = useState({});
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [copied, setCopied] = useState(false);
    const modalRef = useRef(null);
    const fileInputRef = useRef(null);

    // Fetch profile data when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchProfile();
            document.body.style.overflow = 'hidden';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    // Close on ESC
    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/profile');
            setProfile(data.profile);
            setStats(data.credentialStats);
            setFormData({
                name: data.profile.name || '',
                phone: data.profile.phone || '',
                dateOfBirth: data.profile.dateOfBirth ? data.profile.dateOfBirth.split('T')[0] : '',
                bio: data.profile.bio || '',
                location: data.profile.location || '',
                institutionName: data.profile.institutionName || '',
                institutionType: data.profile.institutionType || '',
                website: data.profile.website || '',
                registrationNumber: data.profile.registrationNumber || '',
            });
        } catch (err) {
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleFieldChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleEdit = (field, state) => {
        setEditingFields(prev => ({ ...prev, [field]: state }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const { data } = await api.put('/profile', formData);
            setProfile(data.profile);
            updateUser({ name: data.profile.name, institutionName: data.profile.institutionName });
            setEditingFields({});
            toast.success('Profile updated successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (file.size > 2000000) {
            return toast.error('Image too large. Please use under 2MB.');
        }

        const reader = new FileReader();
        reader.onload = async () => {
            try {
                const base64 = reader.result;
                const { data } = await api.put('/profile/avatar', { avatar: base64 });
                setProfile(prev => ({ ...prev, avatar: data.avatar }));
                updateUser({ avatar: data.avatar });
                toast.success('Avatar updated!');
            } catch (err) {
                toast.error('Failed to upload avatar');
            }
        };
        reader.readAsDataURL(file);
    };

    const handleCopyWallet = () => {
        navigator.clipboard.writeText(profile?.walletAddress || 'Not connected');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    if (!isOpen) return null;

    const isStudent = user?.role === 'student';
    const isInstitution = user?.role === 'institution';
    const joinDate = profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '';

    return (
        <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300"
            onClick={handleBackdropClick}
        >
            <div 
                ref={modalRef}
                className="bg-[#1a1a24] rounded-[1.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.5)] w-full max-w-[600px] max-h-[90vh] overflow-y-auto border border-[#2a2a34] animate-in slide-in-from-top-8 fade-in duration-400"
                style={{ scrollbarWidth: 'thin', scrollbarColor: '#2a2a34 transparent' }}
            >
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-20 gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-primary"></div>
                        <p className="text-sm font-bold text-[#57534e]">Loading profile...</p>
                    </div>
                ) : (
                    <>
                        {/* ═══════════════ HEADER ═══════════════ */}
                        <div className="relative bg-gradient-to-br from-[#d4a053]/20 via-[#1a1a24] to-[#c084fc]/10 p-8 pb-10 rounded-t-[1.5rem] border-b border-[#2a2a34] overflow-hidden">
                            {/* Decorative glow */}
                            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
                            
                            {/* Close button */}
                            <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-[#2a2a34]/50 hover:bg-[#3a3a44] text-[#a8a29e] hover:text-[#e8e4df] transition z-20">
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-5 relative z-10">
                                {/* Avatar */}
                                <div className="relative group/avatar flex-shrink-0">
                                    <div className="w-24 h-24 rounded-full border-4 border-[#0f0f14] shadow-xl overflow-hidden bg-[#2a2a34] flex items-center justify-center">
                                        {profile?.avatar ? (
                                            <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-3xl font-black text-[#57534e]">
                                                {profile?.name?.charAt(0)?.toUpperCase() || '?'}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute -bottom-1 -right-1 w-8 h-8 bg-accent rounded-full flex items-center justify-center text-[#0f0f14] shadow-lg hover:scale-110 transition-transform border-2 border-[#1a1a24]"
                                    >
                                        <Camera className="w-4 h-4" />
                                    </button>
                                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                                </div>

                                {/* User info */}
                                <div className="min-w-0">
                                    <h2 className="text-2xl font-black text-[#e8e4df] truncate">{profile?.name}</h2>
                                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${
                                            isStudent 
                                                ? 'bg-secondary/10 text-secondary border border-secondary/20' 
                                                : 'bg-primary/10 text-primary border border-primary/20'
                                        }`}>
                                            {isStudent ? <UserIcon className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                                            {isStudent ? 'Student' : 'Institution'}
                                        </span>
                                        <span className="flex items-center gap-1 text-xs text-[#57534e] font-bold">
                                            <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div> Active
                                        </span>
                                    </div>
                                    <p className="text-xs text-[#57534e] font-bold mt-2 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> Member since {joinDate}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* ═══════════════ BODY ═══════════════ */}
                        <div className="p-6 space-y-6">
                            
                            {/* ── Personal / Institution Info ── */}
                            <section>
                                <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                                    {isStudent ? <><UserIcon className="w-4 h-4" /> Personal Information</> : <><Building2 className="w-4 h-4" /> Institution Information</>}
                                </h3>
                                <div className="space-y-4">
                                    {isStudent ? (
                                        <>
                                            <EditableField label="Full Name" field="name" icon={UserIcon} placeholder="Your full name" value={formData.name} onChange={handleFieldChange} isEditing={editingFields.name} onToggleEdit={toggleEdit} />
                                            <EditableField label="Email Address" field="email" icon={null} readOnly value={profile?.email} />
                                            <div className="grid grid-cols-2 gap-4">
                                                <EditableField label="Phone" field="phone" icon={Phone} type="tel" placeholder="+91 XXXXX" value={formData.phone} onChange={handleFieldChange} isEditing={editingFields.phone} onToggleEdit={toggleEdit} />
                                                <EditableField label="Date of Birth" field="dateOfBirth" icon={Calendar} type="date" value={formData.dateOfBirth} onChange={handleFieldChange} isEditing={editingFields.dateOfBirth} onToggleEdit={toggleEdit} />
                                            </div>
                                            <BioField value={formData.bio} onChange={handleFieldChange} isEditing={editingFields.bio} onToggleEdit={toggleEdit} />
                                            <EditableField label="Location" field="location" icon={MapPin} placeholder="City, Country" value={formData.location} onChange={handleFieldChange} isEditing={editingFields.location} onToggleEdit={toggleEdit} />
                                        </>
                                    ) : (
                                        <>
                                            <EditableField label="Institution Name" field="institutionName" icon={Building2} placeholder="University name" value={formData.institutionName} onChange={handleFieldChange} isEditing={editingFields.institutionName} onToggleEdit={toggleEdit} />
                                            <EditableField label="Official Email" field="email" icon={null} readOnly value={profile?.email} />
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="group">
                                                    <label className="flex items-center gap-1.5 text-xs font-bold text-[#57534e] uppercase tracking-wider mb-1.5">
                                                        <Building2 className="w-3.5 h-3.5" /> Institution Type
                                                    </label>
                                                    <select
                                                        value={formData.institutionType}
                                                        onChange={(e) => handleFieldChange('institutionType', e.target.value)}
                                                        className="w-full px-4 py-3 rounded-xl text-sm bg-[#0f0f14]/50 border border-[#2a2a34] text-[#a8a29e] hover:border-[#3a3a44] outline-none transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none cursor-pointer"
                                                    >
                                                        <option value="">Select type...</option>
                                                        <option value="University">University</option>
                                                        <option value="College">College</option>
                                                        <option value="School">School</option>
                                                        <option value="Training Center">Training Center</option>
                                                        <option value="Organization">Organization</option>
                                                    </select>
                                                </div>
                                                <EditableField label="Registration No." field="registrationNumber" icon={Hash} placeholder="REG-XXXX" value={formData.registrationNumber} onChange={handleFieldChange} isEditing={editingFields.registrationNumber} onToggleEdit={toggleEdit} />
                                            </div>
                                            <EditableField label="Website" field="website" icon={Globe} type="url" placeholder="https://..." value={formData.website} onChange={handleFieldChange} isEditing={editingFields.website} onToggleEdit={toggleEdit} />
                                            <EditableField label="Contact Phone" field="phone" icon={Phone} type="tel" placeholder="+91 XXXXX" value={formData.phone} onChange={handleFieldChange} isEditing={editingFields.phone} onToggleEdit={toggleEdit} />
                                        </>
                                    )}
                                </div>
                            </section>

                            {/* ── Credential Stats ── */}
                            <section>
                                <h3 className="text-xs font-black text-accent uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Award className="w-4 h-4" /> {isStudent ? 'Credentials Overview' : 'Issuance Summary'}
                                </h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {isStudent ? (
                                        <>
                                            <StatCard icon="📜" label="Total Earned" value={stats.totalCredentials} />
                                            <StatCard icon="✓" label="Verified" value={stats.verifiedCredentials} />
                                            <StatCard icon="⏰" label="Expiring Soon" value={stats.expiringSoon} highlight />
                                        </>
                                    ) : (
                                        <>
                                            <StatCard icon="📄" label="Total Issued" value={stats.totalIssued} />
                                            <StatCard icon="✓" label="Active" value={stats.activeCredentials} />
                                            <StatCard icon="🚫" label="Revoked" value={stats.revokedCredentials} highlight />
                                        </>
                                    )}
                                </div>
                            </section>

                            {/* ── Security ── */}
                            <section>
                                <h3 className="text-xs font-black text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <KeyRound className="w-4 h-4" /> Security Settings
                                </h3>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => setShowPasswordForm(!showPasswordForm)}
                                        className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-[#0f0f14]/50 border border-[#2a2a34] hover:border-[#3a3a44] transition-all group"
                                    >
                                        <span className="flex items-center gap-2 text-sm font-bold text-[#a8a29e] group-hover:text-[#e8e4df] transition">
                                            <ShieldCheck className="w-4 h-4 text-secondary" /> Change Password
                                        </span>
                                        <span className="text-xs text-[#57534e] font-bold">
                                            {showPasswordForm ? 'Close' : 'Open'}
                                        </span>
                                    </button>
                                    
                                    {showPasswordForm && (
                                        <ChangePasswordForm onClose={() => setShowPasswordForm(false)} />
                                    )}

                                    {/* Last login info */}
                                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#0f0f14]/30 border border-[#2a2a34]/50 text-xs text-[#57534e]">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span className="font-bold">Last Login:</span>
                                        <span>{new Date().toLocaleString()}</span>
                                    </div>
                                </div>
                            </section>

                            {/* ── Blockchain Info ── */}
                            <section>
                                <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4" /> Blockchain Information
                                </h3>
                                <div className="space-y-3">
                                    {/* Wallet Address */}
                                    <div>
                                        <label className="block text-xs font-bold text-[#57534e] uppercase tracking-wider mb-1.5">Wallet Address</label>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 px-4 py-3 rounded-xl bg-[#0f0f14]/50 border border-[#2a2a34] text-sm font-mono text-[#57534e] truncate">
                                                {profile?.walletAddress || 'Not connected'}
                                            </div>
                                            <button
                                                onClick={handleCopyWallet}
                                                className="flex-shrink-0 p-3 rounded-xl bg-[#0f0f14]/50 border border-[#2a2a34] hover:border-primary/30 transition text-[#57534e] hover:text-primary"
                                            >
                                                {copied ? <CheckCircle2 className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Network Status */}
                                    <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#0f0f14]/50 border border-[#2a2a34]">
                                        <span className="text-xs font-bold text-[#57534e] uppercase tracking-wider">Network</span>
                                        <span className="flex items-center gap-2 text-xs font-bold text-[#a8a29e]">
                                            Polygon Amoy Testnet
                                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] font-black">
                                                <div className="w-1.5 h-1.5 rounded-full bg-accent"></div> Connected
                                            </span>
                                        </span>
                                    </div>

                                    {/* Account Created */}
                                    <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#0f0f14]/50 border border-[#2a2a34]">
                                        <span className="text-xs font-bold text-[#57534e] uppercase tracking-wider">Account Created</span>
                                        <span className="text-xs font-bold text-[#a8a29e]">
                                            {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* ═══════════════ FOOTER ═══════════════ */}
                        <div className="p-6 pt-0 flex items-center justify-end gap-3 border-t border-[#2a2a34] mt-2 pt-5">
                            <button
                                onClick={onClose}
                                className="px-6 py-3 rounded-xl text-sm font-bold text-[#a8a29e] hover:bg-[#2a2a34] border border-[#2a2a34] transition"
                            >
                                Close
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-6 py-3 bg-gradient-to-r from-primary to-[#b8862e] text-[#0f0f14] rounded-xl text-sm font-black shadow-lg hover:shadow-[0_0_20px_rgba(212,160,83,0.3)] transition-all disabled:opacity-50 flex items-center gap-2 transform hover:-translate-y-0.5"
                            >
                                {saving ? 'Saving...' : <><CheckCircle2 className="w-4 h-4" /> Save Changes</>}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ProfileModal;
