// src/pages/Auth/Signup.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { allCountries } from 'country-telephone-data';
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  Globe,
} from 'lucide-react';

const Signup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signup, isAuthenticated, initialized } = useAuth();

  // Memoize country list for performance and sort by name
  const countryList = useMemo(() => {
    return allCountries
      .map((c) => ({
        name: c.name,
        iso2: c.iso2,
        dialCode: `+${c.dialCode}`,
        flag: c.iso2.toUpperCase().replace(/./g, (char) => 
          String.fromCodePoint(char.charCodeAt(0) + 127397)
        ),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    inviteCode: searchParams.get('invite') || '',
  });

  const [selectedCountryCode, setSelectedCountryCode] = useState('+32'); // Default to Belgium
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialized && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, initialized, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      setFormData((prev) => ({ ...prev, phone: value.replace(/\D/g, '') }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name required';
    if (!formData.username.trim()) newErrors.username = 'Username required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';
    if (formData.phone.length < 7) newErrors.phone = 'Invalid phone number';
    if (formData.password.length < 8) newErrors.password = 'Min 8 characters required';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Keys do not match';
    if (!agreed) newErrors.agreed = 'Acceptance required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const toastId = toast.loading('Synchronizing with Trustra Registry...');

    try {
      const payload = {
        name: formData.name.trim(),
        username: formData.username.trim().toLowerCase(),
        email: formData.email.trim(),
        phone: `${selectedCountryCode}${formData.phone}`,
        password: formData.password,
        inviteCode: formData.inviteCode.trim() || undefined,
      };

      const result = await signup(payload);

      if (result.success) {
        toast.success('Node Registered Successfully!', { id: toastId });
        setTimeout(() => navigate('/login'), 1500);
      } else {
        toast.error(result.message || 'Registration failed', { id: toastId });
      }
    } catch (err) {
      toast.error('Network protocol failure.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-10">
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 bg-yellow-500/10 rounded-3xl border border-yellow-500/20 shadow-lg">
            <ShieldCheck className="text-yellow-500" size={40} />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black italic uppercase tracking-tighter text-white">
            Initialize <span className="text-yellow-500">Node</span>
          </h1>
          <p className="text-sm text-gray-400 font-medium uppercase tracking-widest">Global Access Protocol</p>
        </div>

        <div className="bg-[#0a0c10]/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] ml-1">Identity Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input 
                  type="text" name="name" value={formData.name} onChange={handleChange}
                  className="w-full bg-black border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-yellow-500/50 transition-all"
                  placeholder="Gery Maes"
                />
              </div>
              {errors.name && <p className="text-rose-500 text-[10px] mt-1 ml-1">{errors.name}</p>}
            </div>

            {/* Username & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input 
                type="text" name="username" value={formData.username} onChange={handleChange}
                className="w-full bg-black border border-white/10 rounded-2xl py-4 px-4 text-white outline-none focus:border-yellow-500/50"
                placeholder="Username"
              />
              <input 
                type="email" name="email" value={formData.email} onChange={handleChange}
                className="w-full bg-black border border-white/10 rounded-2xl py-4 px-4 text-white outline-none focus:border-yellow-500/50"
                placeholder="Email Address"
              />
            </div>

            {/* Phone Protocol with Full Country Select */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] ml-1">Phone Protocol</label>
              <div className="flex gap-2">
                <div className="relative group">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-500" size={14} />
                  <select 
                    value={selectedCountryCode}
                    onChange={(e) => setSelectedCountryCode(e.target.value)}
                    className="h-full bg-black border border-white/10 rounded-2xl pl-9 pr-2 text-white text-sm outline-none focus:border-yellow-500/50 appearance-none min-w-[100px]"
                  >
                    {countryList.map((c) => (
                      <option key={`${c.iso2}-${c.dialCode}`} value={c.dialCode}>
                        {c.flag} {c.dialCode}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative flex-1">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                  <input 
                    type="text" name="phone" value={formData.phone} onChange={handleChange}
                    className="w-full bg-black border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-yellow-500/50"
                    placeholder="474576142"
                  />
                </div>
              </div>
              {errors.phone && <p className="text-rose-500 text-[10px] mt-1 ml-1">{errors.phone}</p>}
            </div>

            {/* Access Keys */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange}
                  className="w-full bg-black border border-white/10 rounded-2xl py-4 px-4 text-white outline-none focus:border-yellow-500/50"
                  placeholder="Access Key"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <input 
                type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                className="w-full bg-black border border-white/10 rounded-2xl py-4 px-4 text-white outline-none focus:border-yellow-500/50"
                placeholder="Confirm Key"
              />
            </div>

            {/* Terms and Disclosure */}
            <div className="flex items-start gap-3 px-1">
              <input 
                type="checkbox" checked={agreed} onChange={() => setAgreed(!agreed)}
                className="mt-1 w-4 h-4 rounded border-white/10 bg-black accent-yellow-500"
              />
              <p className="text-[10px] text-gray-500 leading-tight uppercase font-bold">
                I authorize node initialization and accept the <span className="text-yellow-500 underline">Trustra Security Protocols</span>.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-800 text-black font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-yellow-500/20"
            >
              {loading ? <Loader2 className="animate-spin" /> : <>INITIALIZE NODE <ArrowRight size={20} /></>}
            </button>

            <p className="text-center text-gray-500 text-[10px] font-bold uppercase tracking-widest">
              Secured by Trustra Capital AES-256
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;

