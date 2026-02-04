// src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '@/api/user';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [originalProfile, setOriginalProfile] = useState(null); // for "discard changes" or dirty check
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch profile once on mount
  useEffect(() => {
    let mounted = true;

    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        if (mounted) {
          setProfile(data);
          setOriginalProfile(data);
        }
      } catch (err) {
        toast.error(err.message || 'Failed to load profile');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      mounted = false;
    };
  }, []);

  // Detect form changes (for UX feedback)
  useEffect(() => {
    if (!originalProfile) return;

    const changed =
      profile.name !== originalProfile.name ||
      profile.phone !== (originalProfile.phone || '');

    setHasChanges(changed);
  }, [profile, originalProfile]);

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic client-side validation
    if (!profile.name.trim()) {
      toast.error('Name is required');
      return;
    }

    // Optional: phone format validation
    if (profile.phone && !/^\+?\d{7,15}$/.test(profile.phone)) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setUpdating(true);

    try {
      const updated = await updateProfile({
        name: profile.name.trim(),
        phone: profile.phone?.trim() || null,
      });

      setProfile(updated);
      setOriginalProfile(updated);
      setHasChanges(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    if (originalProfile) {
      setProfile(originalProfile);
      setHasChanges(false);
      toast('Changes discarded');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-t-4 border-indigo-500 rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold">Your Profile</h1>
            {hasChanges && (
              <button
                type="button"
                onClick={handleCancel}
                className="text-sm text-slate-400 hover:text-slate-200 transition"
              >
                Discard changes
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm text-slate-400 mb-2 font-medium">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={profile.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                placeholder="Enter your full name"
                required
                autoComplete="name"
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label htmlFor="email" className="block text-sm text-slate-400 mb-2 font-medium">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={profile.email}
                readOnly
                className="w-full bg-slate-700/60 text-slate-300 border border-slate-600 rounded-lg px-4 py-3 cursor-not-allowed"
                autoComplete="email"
              />
              <p className="mt-1 text-xs text-slate-500">
                Email cannot be changed. Contact support if needed.
              </p>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm text-slate-400 mb-2 font-medium">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={profile.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                placeholder="+234 123 456 7890"
                autoComplete="tel"
              />
            </div>

            {/* Submit area */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="submit"
                disabled={updating || !hasChanges}
                className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-900/30"
              >
                {updating ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    Updating...
                  </span>
                ) : (
                  'Save Changes'
                )}
              </button>

              {hasChanges && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
