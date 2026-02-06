import { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../api';
import { User, Mail, Phone, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    isVerified: false,
  });
  const [originalProfile, setOriginalProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchProfile = async () => {
      try {
        const response = await getProfile();
        const userData = response.user || response; // handle both {success, user} and flat object

        if (mounted) {
          const newProfile = {
            name: userData.fullName || '',
            email: userData.email || '',
            phone: userData.phone || '',
            isVerified: userData.isVerified || false,
          };

          setProfile(newProfile);
          setOriginalProfile(newProfile);
        }
      } catch (err) {
        console.error('Profile fetch failed:', err);
        toast.error(
          err.message ||
            'Failed to load secure profile data. Please log in again or try refreshing.'
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!originalProfile) return;

    const changed =
      profile.name !== originalProfile.name ||
      profile.phone !== (originalProfile.phone || '');

    setHasChanges(changed);
  }, [profile, originalProfile]);

  const handleChange = (field, value) =>
    setProfile((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!profile.name.trim()) return toast.error('Name is required');

    if (profile.phone && !/^\+?\d{7,15}$/.test(profile.phone)) {
      return toast.error('Please enter a valid global phone format');
    }

    setUpdating(true);

    try {
      const updated = await updateProfile({
        fullName: profile.name.trim(),   // ← matches backend schema
        phone: profile.phone?.trim() || null,
      });

      // Backend returns { success: true, user: {...} } or similar
      const userData = updated.user || updated;

      const newProfile = {
        name: userData.fullName || profile.name,
        email: userData.email || profile.email,
        phone: userData.phone || profile.phone,
        isVerified: userData.isVerified || profile.isVerified,
      };

      setProfile(newProfile);
      setOriginalProfile(newProfile);
      setHasChanges(false);

      toast.success('Secure profile updated successfully');
    } catch (err) {
      console.error('Profile update failed:', err);
      toast.error(err.message || 'Update failed. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    if (originalProfile) {
      setProfile(originalProfile);
      setHasChanges(false);
      toast('Changes reverted');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-10 selection:bg-indigo-500/30">
      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl p-6 sm:p-10 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600/30" />

          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <User className="text-indigo-500" /> Profile
              </h1>
              <p className="text-slate-500 text-xs mt-1">
                Manage your 2026 digital identity.
              </p>
            </div>

            {hasChanges && (
              <button
                onClick={handleCancel}
                className="text-xs font-bold text-slate-400 hover:text-white transition uppercase tracking-widest"
              >
                Discard Changes
              </button>
            )}
          </header>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                  Full Name
                </label>
                <div className="relative group">
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors"
                    size={18}
                  />
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-indigo-500 outline-none transition"
                    required
                  />
                </div>
              </div>

              {/* Email (read-only) */}
              <div className="space-y-2 opacity-80">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700"
                    size={18}
                  />
                  <input
                    type="email"
                    value={profile.email}
                    readOnly
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm cursor-not-allowed text-slate-500"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                  Phone Contact
                </label>
                <div className="relative group">
                  <Phone
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors"
                    size={18}
                  />
                  <input
                    type="tel"
                    value={profile.phone || ''}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-indigo-500 outline-none transition"
                    placeholder="+234 ..."
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={updating || !hasChanges}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:grayscale rounded-2xl font-bold text-sm tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-900/20 active:scale-95"
              >
                {updating ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    <Save size={18} /> Save Profile Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
