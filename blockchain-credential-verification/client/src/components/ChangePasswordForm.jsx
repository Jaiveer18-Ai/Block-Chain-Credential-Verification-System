import { useState } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

const ChangePasswordForm = ({ onClose }) => {
    const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (form.newPassword !== form.confirmPassword) {
            return toast.error('New passwords do not match');
        }
        if (form.newPassword.length < 6) {
            return toast.error('Password must be at least 6 characters');
        }

        try {
            setIsSubmitting(true);
            await api.post('/profile/change-password', {
                currentPassword: form.currentPassword,
                newPassword: form.newPassword,
            });
            toast.success('Password changed successfully!');
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to change password');
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass = "w-full px-4 py-3 pr-12 rounded-xl bg-[#0f0f14] border border-[#2a2a34] focus:ring-2 focus:ring-primary/30 focus:border-primary transition outline-none text-[#e8e4df] placeholder-[#57534e] text-sm";

    return (
        <div className="bg-[#13131a] border border-[#2a2a34] rounded-2xl p-6 mt-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-2 mb-5">
                <Lock className="w-5 h-5 text-primary" />
                <h4 className="text-base font-black text-[#e8e4df]">Change Password</h4>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                    <label className="block text-xs font-bold text-[#57534e] uppercase tracking-wider mb-1.5">Current Password</label>
                    <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={form.currentPassword}
                        onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                        required
                        className={inputClass}
                        placeholder="Enter current password"
                    />
                    <button type="button" onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })} className="absolute right-3 top-8 text-[#57534e] hover:text-[#a8a29e] transition">
                        {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                        <label className="block text-xs font-bold text-[#57534e] uppercase tracking-wider mb-1.5">New Password</label>
                        <input
                            type={showPasswords.new ? 'text' : 'password'}
                            value={form.newPassword}
                            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                            required minLength="6"
                            className={inputClass}
                            placeholder="Min 6 chars"
                        />
                        <button type="button" onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })} className="absolute right-3 top-8 text-[#57534e] hover:text-[#a8a29e] transition">
                            {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    <div className="relative">
                        <label className="block text-xs font-bold text-[#57534e] uppercase tracking-wider mb-1.5">Confirm Password</label>
                        <input
                            type={showPasswords.confirm ? 'text' : 'password'}
                            value={form.confirmPassword}
                            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                            required minLength="6"
                            className={inputClass}
                            placeholder="Repeat new"
                        />
                        <button type="button" onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })} className="absolute right-3 top-8 text-[#57534e] hover:text-[#a8a29e] transition">
                            {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold text-[#a8a29e] hover:bg-[#2a2a34] transition">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-5 py-2.5 bg-primary hover:bg-[#b8862e] text-[#0f0f14] rounded-xl text-sm font-black transition disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSubmitting ? 'Saving...' : <><CheckCircle2 className="w-4 h-4" /> Update Password</>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChangePasswordForm;
